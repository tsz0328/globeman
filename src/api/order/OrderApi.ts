import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

export interface OrderData {
  id: string
  project_id: string
  name: string
  type: string
  manager: string
  creator: string
  creator_account: string
  customer: string
  contact: string
  contactPhone?: string
  contact_phone?: string
  province: string
  city: string
  district: string
  address: string
  company: string
  status: string
  time: string
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

export interface OrderManager {
  account: string
  name: string
}

export interface OrderCustomer {
  name: string
  contact: string
  phone: string
}

// 专门用于获取负责人名称账号列表
export async function getOrderManagersApi(): Promise<ApiResponse<OrderManager[]>> {
  return request({
    url: '/client/order/getInfoManager',
    method: 'get',
  })
}

// 专门用于获取客户名称列表
export async function getOrderCustomersApi(): Promise<ApiResponse<OrderCustomer[]>> {
  return request({
    url: '/client/order/getInfoCustomer',
    method: 'get',
  })
}

// 订单设备明细（GET /client/order/getInfoDetails 返回的单条结构）
export interface OrderInfoDetail {
  id: number
  name: string
  model: string
  type: string
  brand: string
  spec: string
  number: number
  price: number
  subtotal: number
  order: string
}

// 获取订单设备明细（按订单 id）
export async function getInfoDetailsApi(
  id: string,
): Promise<ApiResponse<OrderInfoDetail[]>> {
  return request({
    url: '/client/order/getInfoDetails',
    method: 'get',
    params: { id },
  })
}

// 用于订单管理页面获取订单表格信息
export async function getOrdersApi(id?: string): Promise<ApiResponse<OrderData[]>> {
  return request({
    url: '/client/order/getOrder',
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
