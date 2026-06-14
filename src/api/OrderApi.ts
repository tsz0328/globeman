import request from '@/utile/request'

export interface OrderData {
  id: number
  project_id: number
  name: string
  type: string
  leader_account: string
  leader: string
  creator: string
  creator_account: string
  customer: string
  contact: string
  contact_phone: string
  province: string
  city: string
  district: string
  company: string
  state: string
  time: string
}

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg?: string
  timestamp?: string
}

export interface CreateOrderData {
  projectId: string
  name: string
  type: string
  leaderAccount: string
  customer: string
  contact: string
  contactPhone: string
  province: string
  city: string
  district: string
}

export async function createOrderApi(data: CreateOrderData): Promise<ApiResponse<{ id: number }>> {
  return request({
    url: '/order/create',
    method: 'post',
    data,
  })
}

export async function getOrdersApi(id?: number): Promise<ApiResponse<Record<string, OrderData>>> {
  return request({
    url: '/order/get',
    method: 'get',
    params: id ? { id } : {},
  })
}

export async function deleteOrderApi(id: number): Promise<ApiResponse<void>> {
  return request({
    url: `/order/delete/${id}`,
    method: 'delete',
  })
}