import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

// 设备明细【前端归一化实体 / 视图模型】：组件统一渲染用，本身不对应单一后端接口。
// 由 useDetail.ts 把两路接口数据 map 而来（字段名是前端自定义的，非后端原始命名）：
//   - getDetailsApi   (GET /details/get)                      原始结构见下方 DetailResponseData
//   - getInfoDetailsApi(GET /client/order/getInfoDetails)     原始结构见 OrderApi.ts 的 OrderInfoDetail
// 注：belongProject 后端并未返回，目前各路 map 均填 ''（预留字段）。
export interface DetailData {
  id: number
  projectId: string
  belongProject: string
  equipmentName: string
  equipmentModel: string
  manufacturer: string
  sn: string
  status: string
  quantity: number
  unitPrice: number
  total: number
  type?: string
  spec?: string
}

// ===== 创建订单设备 =====
// 请求体：与后端 /client/order/createDetails 契约一致
export interface DetailFormData {
  order: string
  name: string
  model: string
  type?: string
  brand: string
  spec?: string
  number: number
  price: number
}

export async function createDetailApi(data: DetailFormData): Promise<ApiResponse<void>> {
  return request({
    url: '/client/order/createDetails',
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
    url: '/details/delete',
    method: 'delete',
    params: { id },
  })
}
