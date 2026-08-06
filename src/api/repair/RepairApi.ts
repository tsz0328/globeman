import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'
import type { DetailResponseData } from '@/api/order/OrderDetailApi'

// === 维修设备===
export interface RepairOrderDetail {
  SN: string[]
  brand: string
  id: number
  model: string
  name: string
  number: number
  spec: string
  type: string
}

// === 维修订单列表（GET /client/repair/getOrder）===
export interface RepairOrderData {
  id: string
  name: string
  customer: string
  contact: string
  manager: string
  time: string
  details: RepairOrderDetail[]
}

export async function getRepairOrdersApi(): Promise<ApiResponse<RepairOrderData[]>> {
  return request({
    url: '/client/repair/getOrder',
    method: 'get',
  })
}

// === 维修明细（按项目/维修单 id；明细项类型定义于 @/api/order/OrderDetailApi）===
export async function getRepairDetailApi(
  id: number,
): Promise<ApiResponse<{ [key: string]: DetailResponseData }>> {
  return request({
    url: '/repair/get',
    method: 'get',
    params: { id },
  })
}

// === 接单列表 ===
export interface TakenDetailData {
  id: number
  details_id: number
  project_id: string
  order_id: string
  name: string
  model: string
  manufacturer: string
  sn: string
  status: string
  repairman: string
  repairman_account: string
}

export async function getTakenDetailsApi(): Promise<
  ApiResponse<{ [key: string]: TakenDetailData }>
> {
  return request({
    url: '/take/get',
    method: 'get',
  })
}

// === 接单 / SN 标记 / 归档（无专属请求体）===
export async function acceptRepairApi(sn: string, account: string): Promise<ApiResponse<void>> {
  return request({
    url: '/repair/take',
    method: 'put',
    params: { sn, account },
  })
}

export async function repairTakeApi(sn: string): Promise<ApiResponse<void>> {
  return request({
    url: '/repair/take',
    method: 'put',
    params: { sn },
  })
}

export async function addRepairSnApi(sn: string, id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/repair/add',
    method: 'put',
    params: { sn, id },
  })
}

// === 新增 SN（订单详情弹窗 SN 子表空白行失焦提交）===
// 注意：后端参数名为大写 SN；id 传设备明细 id
export async function addSnApi(sn: string, id: number | string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/repair/addSN',
    method: 'post',
    params: { SN: sn, id },
  })
}

export async function saveRepairApi(id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/take/save',
    method: 'put',
    params: { id },
  })
}

// === 维修图片（含测试实拍，共用 RepairImageData）===
export interface RepairImageData {
  id: number
  address: string
}

export async function getRepairImagesApi(
  id: number,
): Promise<ApiResponse<{ [key: string]: RepairImageData }>> {
  return request({
    url: '/take/getImg',
    method: 'get',
    params: { id },
  })
}

export async function deleteRepairImageApi(id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/take/deleteImg',
    method: 'put',
    params: { id },
  })
}

export async function uploadRepairImagesApi(files: File[], id: number): Promise<ApiResponse<void>> {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  formData.append('id', id.toString())

  return request({
    url: '/take/uploadImgs',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function getTestImagesApi(
  id: number,
): Promise<ApiResponse<{ [key: string]: RepairImageData }>> {
  return request({
    url: '/take/getImgTest',
    method: 'get',
    params: { id },
  })
}

export async function deleteTestImageApi(id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/take/deleteImgTest',
    method: 'put',
    params: { id },
  })
}

export async function uploadTestImagesApi(files: File[], id: number): Promise<ApiResponse<void>> {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  formData.append('id', id.toString())

  return request({
    url: '/take/uploadImgsTest',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// === 提交维修结果 ===
export interface SubmitRepairData {
  id: number
  reason: string
  solve: string
  result: string
  test: string
}

export async function submitRepairApi(data: SubmitRepairData): Promise<ApiResponse<void>> {
  return request({
    url: '/take/submit',
    method: 'put',
    data,
  })
}

// === 维修单详情（按维修明细 id）===
export interface RepairDetailData {
  repairman: string
  reason: string
  test: string
  repairman_account: string
  project_name: string
  manufacturer: string
  order_name: string
  result: string
  details_id: number
  project_id: string
  solve: string
  name: string
  company: string
  model: string
  id: number
  sn: string
  time: string
  take_time: string
  order_id: string
  status: string
  done_time: string
}

export async function getRepairByIdApi(id: number): Promise<ApiResponse<RepairDetailData>> {
  return request({
    url: '/take/getById',
    method: 'get',
    params: { id },
  })
}
