import type { DashboardOverview } from './types'

// 真实接口切换时需引入（mock 阶段不调用，避免未使用导入告警）：
//   import request from '@/utils/request'
//   import type { ApiResponse } from '@/api/types'

// ============================================================================
// 工作台首页聚合接口（后端待实现并部署；本地 jar 不可改）
// ----------------------------------------------------------------------------
// 真实契约：GET /client/dashboard/overview
//   响应 data：DashboardOverview = { stat: DashboardStat, todos: DashboardTodo[] }
//   后端按当前登录人 role 过滤（admin 看全局，其余看自己相关），前端不自行鉴权。
// 当前前端 mock 先行：getDashboardApi 直接返回下方 mock 数据。
// 后端就绪后，将函数体替换为（一行切换，无需改任何调用方）：
//   const res = await request<ApiResponse<DashboardOverview>>({
//     url: '/client/dashboard/overview',
//     method: 'get',
//   })
//   return res.data
// ============================================================================

const mockOverview: DashboardOverview = {
  stat: {
    orderTotal: 1286,
    repairPending: 12,
    assetCount: 530,
    assetTotalValue: 2845600,
    inventoryWarning: 8,
  },
  todos: [
    { type: 'repair', title: '待接维修单', count: 12, route: '/work/repair-accept' },
    { type: 'asset-approve', title: '待审批资产', count: 3, route: '/work/fixedAsset' },
    { type: 'asset-expiring', title: '临期 / 超期资产', count: 5, route: '/work/fixedAsset' },
  ],
}

export async function getDashboardApi(): Promise<DashboardOverview> {
  // —— Mock 先行 ——
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockOverview), 200)
  })
  // —— 后端就绪后启用（删掉上面 Promise，取消注释即可）——
  // const res = await request<ApiResponse<DashboardOverview>>({
  //   url: '/client/dashboard/overview',
  //   method: 'get',
  // })
  // return res.data
}
