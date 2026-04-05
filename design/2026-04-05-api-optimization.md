# API 调用优化方案

## 现状分析

当前每天随意使用几次就会产生 170+ 次 EMAS 数据库调用。以下是各场景的调用明细。

### 每次启动（App.vue onLaunch）

| 操作 | db 调用次数 | 说明 |
|------|------------|------|
| initEmas | 1 | SDK 初始化 |
| anonymousAuth / wechatAuth | 1-2 | 授权 + getInfo |
| ensureUser | 2-3 | openid 查询 + accountId 查询 + 更新 |
| **小计** | **4-6** | |

### Tab 页面（每次切换都触发 onShow）

| 页面 | API | db 调用次数 | 说明 |
|------|-----|------------|------|
| 首页 | getProjectList | 2 | projects + today records |
| 日历 | getRecordsByMonth | 2 | records(月) + projects |
| 统计 | getStats | 2 | projects + **全部 records** |
| 我的 | getMineStats + getUser | 3 | **全部 records** + **全部 projects** + users |
| **小计** | | **9** | **一轮 Tab 切换** |

### 其他操作

| 操作 | API | db 调用次数 |
|------|-----|------------|
| 打卡/取消 | toggleDaka | 1 |
| 项目管理页 | getActiveProjects | 2（projects + **全部 records**） |
| 项目详情页 | getProjectDetail | 2（project + records） |
| 补打卡 | retroactiveDaka | 2（查重 + 写入） |
| 编辑项目 | getProjectById | 1 |
| 保存项目 | createProject/updateProject | 1-2 |
| 删除项目 | deleteProject | 2（删 records + 删 project） |

### 典型使用场景的调用统计

| 场景 | 估算 db 调用次数 |
|------|----------------|
| 启动 App | 4-6 |
| 首页 → 日历 → 统计 → 我的（一轮 Tab） | 9 |
| 首页打卡 3 个项目 | 3 |
| 进入项目管理页 | 2 |
| 退出重新登录 | 9-12（登出 + 启动 + ensureUser） |
| **单次正常使用** | **约 27-32** |
| **多次登录退出后** | **轻松超过 100** |

## 核心问题

### 问题1：onShow 无条件刷新

所有 Tab 页面使用 `onShow` 钩子，**每次切换** Tab 都重新请求数据，即使数据没有任何变化。

一天在 Tab 之间切换 10 次 = 90 次 db 调用。

### 问题2：全量拉取 records

以下 3 个 API **每次**都拉取用户全部 records：
- `getStats()` - 全部 records（用于计算连续天数、周数据）
- `getMineStats()` - 全部 records（只为统计总天数）
- `getActiveProjects()` - 全部 records（只为每个项目总天数）

当用户数据增长后，这些查询的返回数据量会越来越大。

### 问题3：ensureUser 启动查询

每次启动都执行 ensureUser，最多 3 次 db 调用（openid 查 + accountId 查 + update）。

### 问题4：数据重复查询

projects 集合被多个页面各查一次（首页、日历、统计、我的、项目管理），每次都是独立查询。

## 优化方案

### P0：本地缓存 + 按需刷新（减少 ~60% 调用）

**方案**：在 Pinia store 中缓存 projects 和 records，设置有效期。

```js
// stores/data.js
const cacheValid = ref(false)
const lastFetchTime = ref(0)
const CACHE_TTL = 60 * 1000 // 60秒缓存

async function fetchIfNeeded(force = false) {
  if (!force && cacheValid.value && Date.now() - lastFetchTime.value < CACHE_TTL) {
    return // 使用缓存
  }
  // 执行真实请求...
}
```

**效果**：Tab 来回切换不再重复请求，单次使用从 ~30 次降至 ~10 次。

### P1：onShow 智能判断（减少 ~30% 调用）

**方案**：记录是否有写操作发生，只在数据可能变化时刷新。

```js
// stores/daka.js
const needRefresh = ref(false)

function markDirty() {
  needRefresh.value = true
}

// Tab 页面 onShow
onShow(() => {
  if (needRefresh.value) {
    loadData()
    needRefresh.value = false
  }
})
```

在 `toggleDaka`、`createProject` 等写操作后调用 `markDirty()`。

### P2：ensureUser 启动跳过（减少 2-3 次/次启动）

**方案**：已登录用户启动时不调用 ensureUser，只做授权恢复。

```js
// App.vue
if (isLoggedIn()) {
  initEmas()
    .then(() => authFn())
    // 不再调用 ensureUser，用户记录已存在
    .catch(() => {})
}
```

ensureUser 只在首次登录时调用。

### P3：getMineStats 使用 count()（减少数据传输）

**方案**：用 count() 替代 get()，不需要下载全部文档。

```js
const [recordCount, projectRes] = await Promise.all([
  db.collection(COLLECTIONS.RECORDS).where({ accountId }).count(),
  db.collection(COLLECTIONS.PROJECTS).where({ accountId }).get(), // 需要区分 archived
])
```

注意：totalDays 是按日期去重的天数，count() 无法直接实现，需改用服务端聚合或接受为"总打卡次数"。

### P4：全局 projects 缓存（减少重复查询）

**方案**：projects 数据在全局 store 中维护，所有页面共享。

```js
// stores/project.js
const projects = ref([])
let loaded = false

async function loadProjects() {
  if (loaded) return projects.value
  const res = await db.collection(COLLECTIONS.PROJECTS)
    .where({ accountId })
    .get()
  projects.value = res.data || []
  loaded = true
  return projects.value
}
```

## 优化效果预估

| 场景 | 当前 | 优化后 | 节省 |
|------|------|--------|------|
| 单次启动 | 4-6 | 2-3 | ~50% |
| 一轮 Tab 切换 | 9 | 0-2 | ~80% |
| 打卡 3 项 | 3 | 3 | 0% |
| 总计正常使用 | 27-32 | 8-12 | ~65% |
| 多次登录退出 | 170+ | 50-60 | ~65% |

## 实施清单

- [x] P0：本地缓存 + 按需刷新（daka store 加入 CACHE_TTL 60s）
- [x] P1：onShow 智能判断 + dirty 标记（首页/日历/统计/我的 加入缓存判断）
- [x] P2：ensureUser 启动跳过（App.vue 不再调用 ensureUser，仅授权恢复）
- [ ] P3：getMineStats 优化（减少数据传输）
- [x] P4：全局 daka store 缓存（isCacheValid / markDirty / markFresh）
