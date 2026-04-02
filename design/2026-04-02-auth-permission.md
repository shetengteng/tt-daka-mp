# EMAS 认证与数据库权限设计

> 日期：2026-04-02
> 项目：TT Daka（tt打卡）

## 1. 问题背景

EMAS Serverless 的匿名授权（`authType: 'anonymous'`）每次会生成新的 `auth.userId`。数据库默认权限"仅创建者可读写"依赖 `auth.userId` 做隔离，导致刷新页面后无法读取之前创建的数据。

### 1.1 auth.userId 稳定性

| 授权类型 | auth.userId | 稳定性 |
|---------|-------------|--------|
| 微信授权（wechat_openapi） | 基于 openId | 稳定，同一用户始终相同 |
| 匿名授权（anonymous） | 随机生成 | 不稳定，每次授权可能不同 |

### 1.2 EMAS 数据库权限选项

| 权限设置 | 读取 | 写入 |
|---------|------|------|
| 所有用户可读，仅创建者及管理员可写 | 所有人 | 创建者/管理员 |
| 仅创建者及管理员可读写 | 创建者/管理员 | 创建者/管理员 |
| 所有用户可读，仅管理员可写 | 所有人 | 管理员 |
| 仅管理员可读写 | 管理员 | 管理员 |
| 自定义安全规则 | 自定义 | 自定义 |

---

## 2. 数据隔离策略

不依赖 EMAS 的 `auth.userId`，在业务层通过 `accountId` 字段实现数据隔离：

```
EMAS 层：auth.userId → 不可靠（匿名授权下会变化）
业务层：accountId   → 可靠（由应用控制）
```

每条数据记录都包含 `accountId` 字段，所有查询都带 `accountId` 条件：

```javascript
db.collection('dk-projects').where({ accountId, archived: false }).get()
```

---

## 3. 分阶段实施方案

### 阶段 1：开发期（当前）

| 项目 | 配置 |
|------|------|
| 数据库权限 | 自定义安全规则：全开放 |
| 认证方式 | 匿名授权 |
| accountId | 固定测试值 `dk_test_user_001` |
| 数据隔离 | 业务层 accountId 筛选 |

**EMAS 控制台权限配置**（dk-projects、dk-records）：
```json
{
  ".read": true,
  ".write": true
}
```

**风险**：任何人可读写所有数据。
**可接受原因**：开发阶段无真实用户，数据无敏感性。

### 阶段 2：微信登录接入

| 项目 | 配置 |
|------|------|
| 数据库权限 | 仅创建者及管理员可读写 |
| 认证方式 | 微信授权（wechat_openapi） |
| accountId | 微信 openId 或关联的 accounts._id |
| 数据隔离 | EMAS auth.userId + 业务层 accountId 双重隔离 |

**实现流程**：
```
用户打开小程序
  → uni.login 获取 code
  → 调用微信授权 mpserverless.user.authorize({ authProvider: 'wechat_openapi' })
  → auth.userId = openId（稳定）
  → 根据 openId 查找/创建 accounts 记录
  → accountId = accounts._id
```

**优势**：
- `auth.userId` 基于 openId，同一用户始终相同
- 数据库权限"仅创建者可读写"可以安全工作
- 业务层 accountId 作为二级隔离

### 阶段 3：上线

| 项目 | 配置 |
|------|------|
| 数据库权限 | 自定义安全规则（按需收紧） |
| 认证方式 | 微信授权为主 |
| 敏感操作 | 通过云函数执行 |

**权限规则示例**：
```json
{
  ".read": "request.auth.userId != null",
  ".write": "request.auth.userId == resource.auth.userId"
}
```

**可选增强**：
- 写入操作迁移到云函数（管理员权限）
- 签名校验机制防止 accountId 篡改

---

## 关于 `request.auth.userId == resource.auth.userId` 规则的说明

### 规则含义

```json
{
  ".write": "request.auth.userId == resource.auth.userId",
  ".read": "request.auth.userId == resource.auth.userId"
}
```

这条规则表示：**只有数据的创建者才能读写该数据**。EMAS 在每条数据写入时自动记录 `auth.userId`，后续请求的 `request.auth.userId` 必须与之匹配。

### 不同授权类型下的表现

| 授权类型 | 创建时 auth.userId | 刷新后 auth.userId | 规则是否生效 |
|---------|-------------------|-------------------|-------------|
| **微信授权** | `openId_abc` | `openId_abc`（不变） | 生效，同一用户始终匹配 |
| **匿名授权** | `anon_123` | `anon_456`（变了） | 失败，刷新后无法读写 |

### 结论

- **匿名授权下不可用**：刷新页面后 `auth.userId` 变化，无法匹配历史数据
- **微信授权下可用**：`auth.userId` 基于 openId，同一用户始终相同
- **适用阶段**：阶段 2（微信登录接入后）和阶段 3（上线）
- **当前阶段**：必须使用全开放 `{ ".read": true, ".write": true }`

---

## 4. 各集合权限配置

| 集合 | 阶段 1（开发） | 阶段 2（微信登录） | 阶段 3（上线） |
|------|---------------|-------------------|---------------|
| dk-projects | 全开放 | 仅创建者可读写 | 自定义规则 |
| dk-records | 全开放 | 仅创建者可读写 | 自定义规则 |

---

## 5. 认证代码架构

### 5.1 config/index.js

```javascript
export const DEV_MODE = false
export const TEST_ACCOUNT_ID = 'dk_test_user_001'  // 开发阶段使用
```

### 5.2 App.vue onLaunch

```
DEV_MODE = true  → setAccountId('mock_user')，使用 mock 数据
DEV_MODE = false → initEmas() → anonymousAuth() → setAccountId(TEST_ACCOUNT_ID)
```

### 5.3 utils/auth.js requireAccountId

```
已有 accountId → 直接返回
DEV_MODE       → 'mock_user'
微信小程序     → uni.login 获取 code（阶段 2 改为微信授权获取 openId）
H5 开发        → TEST_ACCOUNT_ID
```

### 5.4 阶段 2 改造要点

1. `App.vue`：微信环境下调用 `mpserverless.user.authorize({ authProvider: 'wechat_openapi' })`
2. `auth.js`：微信环境下用 openId 查找 accounts 记录，获取 accountId
3. EMAS 控制台：权限改为"仅创建者及管理员可读写"
4. H5 开发环境保留匿名授权 + 全开放权限

---

## 6. 当前待操作

- [ ] EMAS 控制台：dk-projects 权限改为自定义规则 `{ ".read": true, ".write": true }`
- [ ] EMAS 控制台：dk-records 权限改为自定义规则 `{ ".read": true, ".write": true }`
- [ ] 验证刷新后数据正常展示
