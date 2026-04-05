# 用户管理设计

## 1. 数据模型

### dk-users 集合

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| _id | string | 自动 | 文档 ID |
| accountId | string | 是 | 用户唯一标识（与 auth.js 中的 accountId 一致） |
| nickname | string | 是 | 昵称，默认 "微信用户" |
| avatar | string | 否 | 头像 URL（微信头像或自定义头像） |
| loginType | string | 是 | 登录类型：`wechat` / `anonymous` |
| createTime | string | 是 | 首次创建时间 ISO 8601 |
| updateTime | string | 是 | 最近更新时间 ISO 8601 |

## 2. 登录类型与用户记录

### 微信登录（MP-WEIXIN）

- 登录成功后调用 `ensureUser({ loginType: 'wechat' })`
- 支持设置头像和昵称（通过"我的"页面的编辑入口）
- 头像来源：微信头像选择器 `wx.chooseMedia` 或 `button[open-type="chooseAvatar"]`
- 昵称来源：用户手动输入 或 `input[type="nickname"]`（微信隐私合规）

### 匿名 / 开发模式

- 登录成功后调用 `ensureUser({ loginType: 'anonymous' })`
- 昵称固定为 "匿名用户"，头像为空
- 不提供编辑头像和昵称的入口

## 3. 用户信息编辑流程（仅微信模式）

### 交互设计

在"我的"页面中，用户点击头像或昵称区域进入编辑状态：

```
┌──────────────────────────────┐
│  [头像]  微信用户             │  ← 点击进入编辑
│          已坚持打卡 12 天     │
└──────────────────────────────┘
```

编辑页面 / 弹窗：

```
┌──────────────────────────────┐
│  修改个人信息                 │
│                              │
│  [头像预览]                   │
│  [选择头像] ← button          │
│                              │
│  昵称                        │
│  ┌────────────────────────┐  │
│  │ input type="nickname"  │  │
│  └────────────────────────┘  │
│                              │
│  [保存]                      │
└──────────────────────────────┘
```

### 微信头像获取方式

微信基础库 2.21.2+ 推荐使用 `button[open-type="chooseAvatar"]` 获取用户头像临时路径，再上传到服务端存储。

```html
<button open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
  选择头像
</button>
```

获得临时文件路径后，通过 EMAS 云存储上传获取永久 URL，存入 `dk-users.avatar`。

### 微信昵称获取方式

微信基础库 2.21.2+ 推荐使用 `<input type="nickname">` 组件获取用户昵称。

```html
<input type="nickname" v-model="nickname" placeholder="请输入昵称" />
```

## 4. API 设计

### ensureUser(extra)

登录成功后调用。查找 `accountId` 对应记录，不存在则创建，存在则更新 `updateTime`。

```js
ensureUser({ loginType: 'wechat' })
ensureUser({ loginType: 'anonymous' })
```

### getUser()

获取当前 `accountId` 对应的用户记录。

### updateUserProfile({ nickname, avatar })

更新用户头像和昵称。仅微信模式可用。

```js
updateUserProfile({ nickname: '新昵称', avatar: 'https://...' })
```

## 5. 页面改动

### 我的页面（pages/mine/index.vue）

- 用户卡片区域展示数据库中的 `nickname` 和 `avatar`
- 微信模式下：点击用户卡片可编辑个人信息
- 匿名模式下：不可编辑，显示默认信息

### 登录页面（pages/login/index.vue）

- 微信登录成功后调用 `ensureUser({ loginType: 'wechat' })`
- 开发模式登录后调用 `ensureUser({ loginType: 'anonymous' })`

## 6. 注意事项

- 微信隐私合规：不主动调用 `wx.getUserProfile`，使用 `chooseAvatar` + `nickname input` 方式
- 头像上传需要 EMAS 云存储支持（如未接入，可先使用临时路径或 base64）
- 匿名用户 user 记录仅用于数据关联，不提供编辑能力
