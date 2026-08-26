import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'
import type { DetailResponseData } from '@/api/order/OrderDeviceApi'

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
  project: string | null
  status: string
  time: string
  details: RepairOrderDetail[]
}

export async function getRepairOrdersApi(): Promise<ApiResponse<RepairOrderData[]>> {
  return request({
    url: '/client/repair/getOrder',
    method: 'get',
  })
}

// === 维修明细（按项目/维修单 id）===
export async function getRepairDetailApi(
  id: number,
): Promise<ApiResponse<{ [key: string]: DetailResponseData }>> {
  return request({
    url: '/repair/get',
    method: 'get',
    params: { id },
  })
}

// === 接单列表===
// 后端返回数组，每项即一条待接单 / 处理中的维修明细
export interface RepairAcceptItem {
  id: number // 维修记录主键
  account: string // 接单人
  brand: string // 品牌
  description: string | null // 故障描述
  diagnosis: string | null // 解决方式
  name: string | null // 设备名称
  dispose: string | null // 处置
  headName: string // 工单 / 订单名称
  model: string // 型号
  repairTime: string | null // 维修时间
  result: string | null // 结果
  sn: string // SN码
  spec: string // 参数
  status: string // 状态（如：处理中）
  time: string | null // 登记 / 创建时间
  takeTime: string | null // 接单时间
  type: string // 类型
}

export async function getAllAcceptInfoApi(): Promise<ApiResponse<RepairAcceptItem[]>> {
  return request({
    url: '/client/repair/getAllAcceptInfo',
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

// 后端契约：POST /client/repair/acceptSN?sn=...，sn 为设备序列号（快速接单）
export async function repairTakeApi(sn: string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/repair/acceptSN',
    method: 'post',
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

// === 新增 SN（维修入库设备清单「添加SN码」按钮 / 订单详情弹窗 SN 子表）===
export async function addSnApi(sn: string, id: number | string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/repair/addSN',
    method: 'post',
    data: { sn, id },
  })
}

// === 删除 SN（维修订单详情设备表格「删除」按钮）===
export async function deleteSnApi(sn: string, id: number | string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/repair/deleteSN',
    method: 'delete',
    data: { sn, id },
  })
}

// 完成接单（POST /client/repair/finishAccept?id=...，原名 /take/save）
export async function saveRepairApi(id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/client/repair/finishAccept',
    method: 'post',
    params: { id },
  })
}

// === 维修图片（含测试实拍，共用 RepairImageData）===
// 获取修复/测试实拍照片
// 新响应：数组 [{id, imagePhase('维修前'|'维修后'), url}]
export interface RepairAcceptImageData {
  id: number
  imagePhase: string
  url: string
}

export async function getRepairImagesApi(
  id: number,
): Promise<ApiResponse<RepairAcceptImageData[]>> {
  return request({
    url: '/client/repair/getAcceptImg',
    method: 'get',
    params: { id },
  })
}

// 删除照片
export async function deleteRepairImageApi(id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/client/repair/deleteImg',
    method: 'delete',
    params: { id },
  })
}

// === 上传修复实拍照片===
export async function uploadBeforeApi(file: File, id: number): Promise<ApiResponse<void>> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('id', String(id))
  return request({
    url: '/client/repair/uploadBefore',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// === 上传测试实拍照片===
export async function uploadAfterApi(file: File, id: number): Promise<ApiResponse<void>> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('id', String(id))
  return request({
    url: '/client/repair/uploadAfter',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// === 提交维修结果（POST /client/repair/updateAccept，application/json）===
// 字段顺序与后端契约一致：description/diagnosis/dispose/result 分别对应
// 表单的 故障描述/解决方式/修复结果/测试结果
export interface SubmitRepairData {
  id: number
  description: string // 故障描述
  diagnosis: string // 诊断
  dispose: string // 处置/解决方式
  result: string // 结果
}

export async function submitRepairApi(data: SubmitRepairData): Promise<ApiResponse<void>> {
  return request({
    url: '/client/repair/updateAccept',
    method: 'post',
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
