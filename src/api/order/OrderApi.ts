import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

// =====================================================================
// 获取订单列表（GET /client/order/getOrder，不带参数，返回全部订单）
// =====================================================================
/** 订单（列表/详情返回）。字段为后端原始命名（下划线），useOrder 中映射为前端命名。 */
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

export async function getOrdersApi(): Promise<ApiResponse<OrderData[]>> {
  return request({
    url: '/client/order/getOrder',
    method: 'get',
  })
}

// =====================================================================
// 创建订单（POST /client/order/createOrder）
// =====================================================================
/** 订单设备明细（请求体单条结构） */
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

/** 创建订单请求体：订单基础字段 + 可选设备明细 */
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

export async function createOrderApi(data: CreateOrderData): Promise<ApiResponse<{ id: string }>> {
  return request({
    url: '/client/order/createOrder',
    method: 'post',
    data,
  })
}

// =====================================================================
// 获取负责人下拉选项（GET /client/order/getInfoManager，供表单/管理页复用）
// =====================================================================
/** 负责人选项：账号 + 名称 */
export interface OrderManager {
  account: string
  name: string
}

export async function getOrderManagersApi(): Promise<ApiResponse<OrderManager[]>> {
  return request({
    url: '/client/order/getInfoManager',
    method: 'get',
  })
}

// =====================================================================
// 获取客户下拉选项（GET /client/order/getInfoCustomer，供表单/管理页复用）
// =====================================================================
/** 客户选项：名称 + 联系人 + 电话 */
export interface OrderCustomer {
  name: string
  contact: string
  phone: string
}

export async function getOrderCustomersApi(): Promise<ApiResponse<OrderCustomer[]>> {
  return request({
    url: '/client/order/getInfoCustomer',
    method: 'get',
  })
}

// =====================================================================
// 获取订单设备明细（GET /client/order/getInfoDetails?id=，供 useDetail 复用）
// =====================================================================
/** 订单设备明细（单条返回结构） */
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

export async function getInfoDetailsApi(
  id: string,
): Promise<ApiResponse<OrderInfoDetail[]>> {
  return request({
    url: '/client/order/getInfoDetails',
    method: 'get',
    params: { id },
  })
}

// =====================================================================
// 删除订单（DELETE /client/order/deleteOrder?id=）
// =====================================================================
export async function deleteOrderApi(id: string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/order/deleteOrder',
    method: 'delete',
    params: { id },
  })
}

// =====================================================================
// 提交订单（PUT /client/order/submit?id=）
// 响应 data 为提交结果文案（如 "已提交"），与 ApiResponse<T> 的 data 字段对应
// =====================================================================
export async function submitOrderApi(id: string): Promise<ApiResponse<string>> {
  return request({
    url: '/client/order/submit',
    method: 'put',
    params: { id },
  })
}
