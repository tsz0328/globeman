import type { Component } from 'vue'
import {
  HomeFilled,
  User,
  Avatar,
  UserFilled,
  OfficeBuilding,
  Grid,
  Document,
  Tickets,
  Tools,
  Box,
  Coin,
  Promotion,
} from '@element-plus/icons-vue'

// 侧边菜单的【唯一数据源】：
// ① sideMenu.vue 用它渲染菜单（含图标、子菜单分组、adminOnly 显隐）
// ② WorkView 顶栏面包屑用它查当前路由的中文名
// ③ WorkPage 页面默认标题用它查当前路由的中文名
// 新增菜单 / 修改菜单名 / 改路由，只需改这一处，三处自动联动。
export interface MenuItem {
  path: string
  title: string
  icon?: Component
  adminOnly?: boolean // true 时仅管理员可见（原 v-if="isAdmin"）
  children?: MenuItem[]
}

export const menuConfig: MenuItem[] = [
  { path: '/work/home', title: '首页', icon: HomeFilled },
  { path: '/work/personalCenter', title: '个人中心', icon: User },
  { path: '/work/user', title: '用户管理', icon: Avatar },
  { path: '/work/customer', title: '客户管理', icon: UserFilled },
  { path: '/work/company', title: '公司管理', icon: OfficeBuilding, adminOnly: true },
  { path: '/work/department', title: '部门管理', icon: Grid },
  { path: '/work/project', title: '项目管理', icon: Document },
  { path: '/work/order', title: '订单管理', icon: Tickets },
  {
    path: 'repair-management',
    title: '维修管理',
    icon: Tools,
    children: [
      { path: '/work/repair-warehousing', title: '维修入库' },
      { path: '/work/repair-accept', title: '维修接单' },
      { path: '/work/repair-list', title: '维修列表' },
      { path: '/work/repair-warehouse-out', title: '维修出库' },
    ],
  },
  {
    path: 'warehouse',
    title: '仓库管理',
    icon: Box,
    children: [
      { path: '/work/outbound', title: '出库管理' },
      { path: '/work/inbound', title: '入库管理' },
      { path: '/work/inventory', title: '库存管理' },
    ],
  },
  {
    path: 'asset',
    title: '财务管理',
    icon: Coin,
    children: [
      { path: '/work/fixedAsset', title: '固定资产管理' },
      { path: '/work/scrapAsset', title: '报废资产管理' },
    ],
  },
  {
    path: 'platform',
    title: '平台管理',
    icon: Promotion,
    children: [
      { path: '/work/platform-carousel', title: '轮播图管理' },
      { path: '/work/platform-announcement', title: '公告管理' },
    ],
  },
]

// 按路由路径（route.path，如 /work/repair-warehousing）查菜单标题；
// 面包屑与页面默认标题都用它，与菜单文本天然一致。
export function getMenuTitle(path: string): string {
  for (const item of menuConfig) {
    if (item.path === path) return item.title
    if (item.children) {
      const child = item.children.find((c) => c.path === path)
      if (child) return child.title
    }
  }
  return ''
}
