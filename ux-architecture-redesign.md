# 全求人工作台 · 用户体验架构重构方案

> 角色：用户体验架构师（ArchitectUX）
> 目标：修复当前产品架构中的体验断点，建立单一常驻外壳 + 业务主轴导航的流畅架构。
> 依据：基于 `src/router/index.ts`、`src/components/layout/Menu.vue`、`src/views/index/LoginSuccess.vue` 的真实代码事实。

---

## 一、现状诊断（基于代码事实）

### 断点 1 — 详情页脱离全局外壳（最大断点）
路由里 7 个详情页（`/project-order/:id`、`/repair-order/:id`、`/repair-order-detail/:id`、`/order-detail/:id`、`/equipment-repair-information/:id`、`/user-detail/:id`、`/company-detail/:id`）是 **`/work` 的兄弟路由，不是其子路由**。
`views/` 下没有任何文件引用 `WorkView` 或自带 `el-menu`。
→ 用户从列表点进任意详情，**左侧菜单 + 顶部操作栏同时消失**，只能靠浏览器"后退"返回。进入详情即"迷路"，这是体验流最硬的断点。

### 断点 2 — 登录流多一跳
`Login` → `LoginSuccess.vue`（中间页，仅"工作台"按钮 + 退出）→ 再点才进 `/work`。
`LoginSuccess.vue` 是冗余过站页，增加一次无意义点击。

### 断点 3 — 信息架构分组不符合业务心智
- "财务管理"子菜单里塞的是 **固定资产 / 报废资产**，语义错位（资产 ≠ 财务）。
- 订单既独立（`/work/order`）又挂在项目下（`/project-order`），同一概念两处入口。
- 维修有"维修管理"和"维修接单"两个平行入口，缺少收敛。
- 缺少一条贯穿业务的**主轴**：客户 → 项目 → 订单 → 维修 → 仓储 → 资产。

### 断点 4 — 首页空壳
登录后落点是 `<el-empty>` 空状态，没有承担"导航中枢 / 状态概览"职责，用户进来不知下一步去哪。

### 断点 5 — 路由守卫只验 token 不验角色
`CompanyManagement` 在菜单用 `isAdmin` 隐藏，但 `router.beforeEach` 不校验角色，直接访问 `/work/company` 仍可进入（安全 + 体验双缺口）。

---

## 二、目标 UX 架构

### 设计原则
1. **单一常驻外壳**：所有"已登录"页面统一包在 `WorkView` 内，sidebar + 顶栏永远在。
2. **业务主轴导航**：菜单按"客户 → 项目 → 订单 → 维修 → 仓储 → 资产 → 系统管理"组织，符合一线作业顺序。
3. **列表 ↔ 详情无缝**：详情为 `/work` 嵌套子路由，常驻导航 + 面包屑。
4. **登录零过站**：登录成功直达 `/work/home`。
5. **首页轻量中枢**：仅做快捷导航（不堆仪表盘，尊重"先不要乱加东西"的偏好）。

### 目标信息架构（树）
```
WorkView（常驻外壳：顶栏 + 侧边栏 + <router-view>）
├─ 首页 home             ← 轻量导航中枢（快捷入口，不堆内容）
├─ 个人中心 profile
├─ 客户 customer         ← 业务主轴起点
│   └─ 详情（嵌套）/work/customer/:id
├─ 项目 project
│   └─ 详情 /work/project/:id
├─ 订单 order
│   └─ 详情 /work/order/:id
├─ 维修 repair
│   ├─ 维修管理
│   ├─ 维修接单
│   └─ 详情 /work/repair/:id
├─ 仓储 warehouse
│   ├─ 出库 outbound
│   ├─ 入库 inbound
│   └─ 库存 inventory
├─ 资产 asset
│   ├─ 固定资产 fixedAsset
│   └─ 报废资产 scrapAsset
└─ 系统管理（仅 admin）
    ├─ 用户 user
    ├─ 部门 department
    └─ 公司 company
```

### 关键用户流（修复断点）

**登录流（修复后）**
`Login`（输入）→ 成功 → 直接 `/work/home`；登出回到 `Login`。
（删除 `LoginSuccess` 过站页）

**订单作业流（修复后）**
订单管理列表 → 点行 → `/work/order/:id`（详情，**常驻侧边栏 + 面包屑"订单管理 / 订单号"**）→ 可返回列表或继续进设备明细。
（当前：列表 → `/order-detail/:id` 裸页，无导航）

**维修作业流（修复后）**
维修管理 / 维修接单 → 详情 `/work/repair/:id`（常驻导航）→ 关联设备 `/work/repair/:id/equipment`。

---

## 三、实现指引（落地清单，按优先级）

### P0 — 止血最大断点
1. **详情页纳入外壳**：把 7 个详情路由从顶层移到 `/work` 的 `children`，组件内加面包屑 + 返回。路径改为 `/work/order/:id` 等；原顶层路径用 `redirect` 兼容旧书签。
2. **删 `LoginSuccess` 中间页**：`Login` 成功直接 `router.push({ name: 'Home' })`；`IndexView` 仅保留落地/登录入口。

### P1 — 信息架构
3. **菜单分组重构**：维修 / 仓储 / 资产 / 系统管理 分组；"财务"子菜单改名为"资产"。
4. **首页轻量化**：仅放置快捷导航入口（不加大卡片、不堆统计），维持你要求的"不要乱加东西"。

### P2 — 健壮性
5. `router.beforeEach` 增加角色校验（`company` 仅 `isAdmin`）。
6. 详情页统一面包屑组件（基于 `route.matched` 生成）。

---

## 四、需你确认的点
- **首页**：维持纯空状态，还是放"快捷导航入口"（轻量，非仪表盘）？
- **维修接单**：是否并入"维修管理"以减少平行入口？
- **详情路径**：是否允许改 URL 为 `/work/order/:id`，还是保留旧顶层路径做兼容重定向？
