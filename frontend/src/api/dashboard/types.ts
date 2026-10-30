// 工作台首页「概览 + 待办」数据类型
// 对应后端新增聚合接口 GET /client/dashboard/overview

/** 核心指标卡数据 */
export interface DashboardStat {
  /** 订单总数 */
  orderTotal: number
  /** 维修待接单（status=待接） */
  repairPending: number
  /** 固定资产数量 */
  assetCount: number
  /** 固定资产总值（元） */
  assetTotalValue: number
  /** 库存预警数 */
  inventoryWarning: number
}

/** 待办类型（也用作图标 / 配色标识） */
export type DashboardTodoType = 'repair' | 'asset-approve' | 'asset-expiring' | 'order-pending'

/** 待我处理项 */
export interface DashboardTodo {
  type: DashboardTodoType
  /** 待办名称，如「待接维修单」 */
  title: string
  /** 数量 */
  count: number
  /** 点击跳转的路由，如 /work/repair-accept */
  route: string
}

/** 首页聚合响应 */
export interface DashboardOverview {
  stat: DashboardStat
  todos: DashboardTodo[]
}
