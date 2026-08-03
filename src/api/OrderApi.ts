import request from '@/utils/request'

export interface OrderData {
  id: string
  project_id: string
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
  address: string
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

export interface OrderDetailInput {
  name: string
  model: string
  type?: string
  brand?: string
  spec?: string
  number: string | number
  price: string | number
  remark?: string
}

export interface CreateOrderData {
  id: string
  projectId?: string
  name: string
  type: string
  manager: string
  customer: string
  contact: string
  contactPhone: string
  province: string
  city: string
  district: string
  address: string
  details?: OrderDetailInput[]
}

// 创建订单
export async function createOrderApi(data: CreateOrderData): Promise<ApiResponse<{ id: string }>> {
  return request({
    url: '/client/order/createOrder',
    method: 'post',
    data,
  })
}

// 获取订单列表
export async function getOrdersApi(id?: string): Promise<ApiResponse<Record<string, OrderData>>> {
  return request({
    url: '/order/get',
    method: 'get',
    params: id ? { id } : {},
  })
}

// 删除订单
export async function deleteOrderApi(id: string): Promise<ApiResponse<void>> {
  return request({
    url: '/order/delete',
    method: 'delete',
    params: { id },
  })
}

// 提交订单
export async function submitOrderApi(id: string): Promise<ApiResponse<void>> {
  return request({
    url: '/order/done',
    method: 'put',
    params: { id },
  })
}
