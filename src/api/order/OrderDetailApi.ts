import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

export interface DetailFormData {
  orderId: string
  name: string
  model: string
  manufacturer: string
  number: string
  price: string
  type?: string
  spec?: string
}

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

// 创建订单设备明细
export async function createDetailApi(data: DetailFormData): Promise<ApiResponse<void>> {
  return request({
    url: '/details/create',
    method: 'post',
    data,
  })
}

// 获取订单设备明细列表
export async function getDetailsApi(
  id: string,
): Promise<ApiResponse<DetailResponseData[] | { [key: string]: DetailResponseData }>> {
  return request({
    url: '/details/get',
    method: 'get',
    params: { id },
  })
}

// 删除订单设备明细
export async function deleteDetailApi(id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/details/delete',
    method: 'delete',
    params: { id },
  })
}
