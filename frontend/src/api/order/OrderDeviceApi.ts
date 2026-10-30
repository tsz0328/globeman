import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

// 设备明细【前端归一化实体 / 视图模型】：组件统一渲染用，本身不对应单一后端接口。
// 由 useDetail.ts 把接口数据 map 而来（字段名是前端自定义的，非后端原始命名）：
//   - getDetailsApi   (GET /details/get)                      原始结构见下方 DetailResponseData
//   - 订单内嵌明细（getOrder 响应的 details 数组）             原始结构见 OrderApi.ts 的 OrderItem
// 注：belongProject 后端并未返回，目前各路 map 均填 ''（预留字段）。
export interface DetailData {
  id: number
  rowKey?: string
  projectId: string
  belongProject: string
  equipmentName: string
  equipmentModel: string
  manufacturer: string
  sn: string
  status: string
  unitPrice: number
  total: number
  /** 设备类型：仅维修模块设备表仍展示（订单侧「类型」字段已移除，不再写入） */
  type?: string
  spec?: string
  /** 原型号（改造/销售单特有） */
  originalModel?: string
  /** 改型号（改造/销售单特有） */
  refitModel?: string
  /** 加工项目（改造/销售单特有） */
  processItem?: string
  /** 派发员工账号（维修单入库前指定接单人；仅维修详情设备表可编辑） */
  assignee?: string
}

// ===== 创建订单设备 =====
// 请求体：与后端 /client/order/addOrderDetail 契约一致（id 为主键，新增传 0/省略由后端自增；无 price；数量已移除）
export interface DetailFormData {
  id?: number
  order: string
  name: string
  model: string
  brand: string
  spec?: string
  sn?: string
  /** 原型号（改造/销售单特有） */
  originalModel?: string
  /** 改型号（改造/销售单特有） */
  refitModel?: string
  /** 加工项目（改造/销售单特有） */
  processItem?: string
  /** 派发员工账号（维修单入库前指定接单人；仅维修详情设备表可编辑） */
  assignee?: string
}

export async function createDetailApi(data: DetailFormData): Promise<ApiResponse<void>> {
  return request({
    url: '/client/order/addOrderDetail',
    method: 'post',
    data,
  })
}

// ===== 获取订单设备列表 =====
// 响应结构：数组或按 id 索引的对象字典
export interface DetailResponseData {
  id: number
  project_id: string
  name: string
  model: string
  manufacturer: string
  sn: string
  order_id: string
  details_id: number
  status: string
  number: string
  price: string
  total: string
}

export async function getDetailsApi(
  id: string,
): Promise<ApiResponse<DetailResponseData[] | { [key: string]: DetailResponseData }>> {
  return request({
    url: '/details/get',
    method: 'get',
    params: { id },
  })
}

// ===== 删除订单设备 =====
export async function deleteDetailApi(id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/client/order/deleteOrderDetail',
    method: 'delete',
    params: { id },
  })
}

// ===== 更新已有订单设备 =====
// 请求体与 addOrderDetail 一致，但携带 id 用于定位要更新的那一行
export async function updateDetailApi(data: DetailFormData): Promise<ApiResponse<void>> {
  return request({
    url: '/client/order/updateOrderDetail',
    method: 'post',
    data,
  })
}
