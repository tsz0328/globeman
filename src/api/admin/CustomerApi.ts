import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

// === 客户实体（列表 / 创建 / 更新 / 删除 / 订单客户，供 useCustomer 复用）===
export interface CustomerData {
  id?: number
  name: string
  company: string
  contact: string
  phone: string
  time?: string
}

// 客户名称列表
export async function getCustomersApi(): Promise<ApiResponse<CustomerData[]>> {
  return request({
    url: '/client/customer/getInfoCustomer',
    method: 'get',
  })
}

// 订单客户信息
export async function getOrderCustomerApi(): Promise<ApiResponse<CustomerData>> {
  return request({
    url: '/client/order/getOrderCustomer',
    method: 'get',
  })
}

// 创建客户
export async function createCustomerApi(
  data: Omit<CustomerData, 'id'>,
): Promise<ApiResponse<CustomerData>> {
  return request({
    url: '/client/customer/createCustomer',
    method: 'post',
    data,
  })
}

// 更新客户
export async function updateCustomerApi(
  data: CustomerData,
): Promise<ApiResponse<CustomerData>> {
  return request({
    url: '/customer/update',
    method: 'post',
    data,
  })
}

// 删除客户
export async function deleteCustomerApi(id: number): Promise<ApiResponse<unknown>> {
  return request({
    url: '/client/customer/deleteCustomer',
    method: 'post',
    params: { id },
  })
}
