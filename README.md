# DaKa

DaKa 是一款简洁高效的打卡习惯养成小程序，基于 uni-app 开发，支持 H5 和微信小程序双端运行。

## 功能特性

- **自定义打卡项目** — 支持自定义名称、图标、颜色和打卡频率（每天 / 工作日 / 自定义）
- **一键打卡** — 首页快速完成今日打卡，支持补打卡（最近 7 天）
- **日历视图** — 按月查看打卡记录，绿色/橙色标记完成情况
- **统计分析** — 连续打卡天数、总打卡天数、完成率等数据统计
- **项目管理** — 拖拽排序、归档、编辑项目
- **深色模式** — 支持亮色/深色主题切换
- **数据云同步** — 基于阿里云 EMAS Serverless 的云端数据存储

## 技术栈

| 技术 | 说明 |
|------|------|
| [uni-app](https://uniapp.dcloud.net.cn/) | 跨平台框架（Vue 3 + Composition API） |
| [Pinia](https://pinia.vuejs.org/) | 状态管理 |
| [Day.js](https://day.js.org/) | 日期处理 |
| [EMAS Serverless](https://help.aliyun.com/product/435033.html) | 阿里云 Serverless 数据库 |
| SCSS | 样式预处理，Shadcn 风格设计系统 |

## 项目结构

```
├── cloud-emas/          # EMAS 云数据库配置
├── components/          # 全局组件（TtCalendar, TtDialog, TtTabbar 等）
├── config/              # 应用配置
├── design/              # 设计文档（原型、数据库设计）
├── mock/                # Mock 数据（H5 开发用）
├── pages/               # 页面
│   ├── index/           # 首页（打卡列表）
│   ├── calendar/        # 日历页
│   ├── stats/           # 统计页
│   ├── mine/            # 我的页
│   └── project/         # 项目管理（新建/编辑/详情/归档）
├── plugins/             # 插件
├── route/               # 路由导航
├── static/svg/          # SVG 图标（Remix Icon）
├── stores/              # Pinia Store（主题等）
├── styles/              # 全局样式 + 设计系统
├── utils/               # 工具函数
├── App.vue              # 应用入口
├── pages.json           # 页面路由配置
├── manifest.json        # 应用配置
└── uni.scss             # 设计 Token（颜色、间距、圆角）
```

## 快速开始

### 环境要求

- Node.js >= 16
- HBuilderX（可选，用于小程序开发）

### 安装依赖

```bash
npm install
```

### H5 开发

```bash
npx uni -p h5
```

访问 `http://localhost:5173`（端口可能自动递增）。

### 微信小程序

```bash
npx uni -p mp-weixin
```

产物在 `dist/dev/mp-weixin`，使用微信开发者工具打开。

## 数据库

使用阿里云 EMAS Serverless 数据库（MongoDB 协议），包含 3 个集合：

- `dk-users` — 用户信息
- `dk-projects` — 打卡项目
- `dk-records` — 打卡记录

详细表结构和关系见 [数据库设计文档](./design/2026-03-31-2-database.md)。

## 设计系统

采用 Shadcn 风格设计系统，通过 CSS 自定义属性实现亮色/深色主题切换：

- 设计 Token 定义在 `uni.scss`
- CSS 变量定义在 `styles/global.scss`
- 主题状态管理在 `stores/theme.js`

## License

MIT
