import request from '@/utile/request'

// 客户数据
export interface CustomerData {
  id?: number
  name: string
  company: string
  contact: string
  phone: string
}

// 客户接口响应数据
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg?: string
  timestamp?: string
}

// 获取客户列表
export async function getCustomersApi(): Promise<ApiResponse<Record<string, CustomerData>>> {
  return request({
    url: '/customer/get',
    method: 'get',
  })
}

// 创建客户
export async function createCustomerApi(
  data: Omit<CustomerData, 'id'>,
): Promise<ApiResponse<CustomerData>> {
  return request({
    url: '/customer/create',
    method: 'post',
    data,
  })
}

// 删除客户
export async function deleteCustomerApi(id: number): Promise<ApiResponse<unknown>> {
  return request({
    url: '/customer/delete',
    method: 'delete',
    params: { id },
  })
}

// 批量删除客户
export async function batchDeleteCustomersApi(ids: number[]): Promise<ApiResponse<unknown>> {
  return request({
    url: '/customer/batchDelete',
    method: 'delete',
    params: { ids: ids.join(',') },
  })
}
