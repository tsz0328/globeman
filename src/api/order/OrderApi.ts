import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

// =====================================================================
// 获取订单列表（GET /client/order/getOrder，不带参数，返回全部订单）
// =====================================================================
/** 订单内嵌设备明细（getOrder 响应中随订单返回，无 price/subtotal） */
export interface OrderItem {
  id: number
  name: string
  model: string
  type: string
  brand: string
  spec: string
  number: number
  order: string
}

/** 订单（列表返回）。字段对应后端 getOrder 响应（驼峰），useOrder 中映射为前端命名。 */
export interface OrderData {
  id: string
  project: string | null
  name: string
  type: string
  manager: string
  creator: string
  customer: string
  contact: string
  contactPhone: string
  province: string
  city: string
  district: string
  address: string
  company: string
  status: string
  time: string
  details?: OrderItem[]
}

export async function getOrdersApi(): Promise<ApiResponse<OrderData[]>> {
  return request({
    url: '/client/order/getOrder',
    method: 'get',
  })
}

// =====================================================================
// 获取指定项目下的订单列表（GET /client/project/getProjectOrder?projectId=）
// =====================================================================
export async function getProjectOrdersApi(projectId: string): Promise<ApiResponse<OrderData[]>> {
  return request({
    url: '/client/project/getProjectOrder',
    method: 'get',
    params: { projectId },
  })
}

// =====================================================================
// 创建订单（POST /client/order/addOrder）
// =====================================================================
/** 订单设备明细（addOrder 请求体单条结构，与 addOrderDetail 契约一致：无 price/remark） */
export interface OrderDetailInput {
  name: string
  model: string
  type?: string
  brand?: string
  spec?: string
  number: string | number
}

/** 创建订单请求体：订单基础字段 + 可选设备明细 */
export interface CreateOrderData {
  id: string
  project: string
  name: string
  type: string
  time: string
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
    url: '/client/order/addOrder',
    method: 'post',
    data,
  })
}

// =====================================================================
// 获取负责人下拉选项（GET /client/order/manager，供表单/管理页复用）
// =====================================================================
/** 负责人选项：账号 + 名称 */
export interface OrderManager {
  account: string
  name: string
}

export async function getOrderManagersApi(): Promise<ApiResponse<OrderManager[]>> {
  return request({
    url: '/client/order/manager',
    method: 'get',
  })
}

// =====================================================================
// 获取客户下拉选项（GET /client/order/customer，供表单/管理页复用）
// =====================================================================
/** 客户选项：名称 + 联系人 + 电话 */
export interface OrderCustomer {
  name: string
  contact: string
  phone: string
}

export async function getOrderCustomersApi(): Promise<ApiResponse<OrderCustomer[]>> {
  return request({
    url: '/client/order/customer',
    method: 'get',
  })
}

// =====================================================================
// 更新订单表头（POST /client/order/updateOrderHead，编辑中订单可改）
// =====================================================================
/** 更新订单表头请求体 */
export interface UpdateOrderHeadData {
  id: string
  name: string
  manager: string
  customer: string
  contact: string
  contactPhone: string
  province: string
  city: string
  district: string
  address: string
}

export async function updateOrderHeadApi(data: UpdateOrderHeadData): Promise<ApiResponse<void>> {
  return request({
    url: '/client/order/updateOrderHead',
    method: 'post',
    data,
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
