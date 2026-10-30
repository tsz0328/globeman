import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'
import type { DetailResponseData } from '@/api/order/OrderDeviceApi'

// === 维修设备===
export interface RepairOrderDetail {
  SN: string[]
  /** 建单/导入时随明细录入的 SN（order_details.sn）；展示口径以此为准，SN 列表来自维修入库扫描（sys_repair） */
  sn?: string
  /** 派发员工账号（order_details.assignee；入库时写入 sys_repair.account） */
  assignee?: string
  /** 原型号（维修改造单：改造清单「原型号」列） */
  originalModel?: string
  /** 改型号（维修改造单：改造清单「改型号」列） */
  refitModel?: string
  /** 加工项目（维修单两种形态都有：改造清单/型号清单的「加工项目」列） */
  processItem?: string
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
  /** 是否已入库：维修工单已登记到 sys_repair */
  inbound?: boolean
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
// 后端返回数组，每项即一条「已接单」的维修明细（维修中 / 已完成，后端已排除待接单）
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
  status: string // 状态（如：维修中）
  time: string | null // 登记 / 创建时间
  takeTime: string | null // 接单时间
  type: string // 类型
}

// 维修接单（普通用户）：返回当前账号「已接单」的维修工单（维修中/已完成，排除待接单）
export async function getAllAcceptInfoApi(): Promise<ApiResponse<RepairAcceptItem[]>> {
  return request({
    url: '/client/repair/getAllAcceptInfo',
    method: 'get',
  })
}

// 维修接单（管理员）：返回本公司「已接单」维修工单（维修中/已完成），排除「待接单」（入库未接单），不按账号过滤但按公司过滤
export async function getAllRepairTicketsApi(): Promise<ApiResponse<RepairAcceptItem[]>> {
  return request({
    url: '/client/repair/getAllRepairTickets',
    method: 'get',
  })
}

// 维修出库：status='已完成' 的已修完工单（管理员看本公司全部，普通用户看自己接的单）
export async function getFinishedRepairsApi(): Promise<ApiResponse<RepairAcceptItem[]>> {
  return request({
    url: '/client/repair/getFinishedRepairs',
    method: 'get',
  })
}

// === 维修入库：按订单批量登记维修工单（POST /client/repair/inbound?orderId=）===
export async function inboundRepairApi(
  orderId: string,
): Promise<ApiResponse<void>> {
  return request({
    url: '/client/repair/inbound',
    method: 'post',
    params: { orderId },
  })
}

// === 入库前 SN 重复检查（GET /client/repair/checkDuplicateSn?orderId=）===
// 返回三类重复：same_order=本订单内多台设备 SN 相同；cross_self=跨订单重复中的本订单侧设备；
// cross_order=跨订单重复中的其他订单已入库工单。无重复时为空数组
export interface DuplicateSnInfo {
  sn: string // 重复的 SN 码
  kind: 'same_order' | 'cross_self' | 'cross_order' // 重复类型
  orderId: string // 所属订单编号
  orderName: string // 所属订单名称（cross_self 为空，前端显示「本订单」）
  seq?: number // 设备在其所属订单中的序号（第几行）
  status: string // 工单状态（仅 cross_order 有值，其余为空）
}

export async function checkDuplicateSnApi(
  orderId: string,
): Promise<ApiResponse<DuplicateSnInfo[]>> {
  return request({
    url: '/client/repair/checkDuplicateSn',
    method: 'get',
    params: { orderId },
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

// === 接单前按 SN 查同 SN 全部工单（GET /client/repair/getSameSnTickets?sn=）===
// 用于「快速接单」输入 SN 后：后端返回该 SN 在公司内的所有工单（含待接单/维修中/已完成），
// 前端据此判断——无/单条/多条可接，多条时弹窗列出供员工选单。
export interface SameSnTicket {
  id: number // 工单 id（接单时按此 id 精确接单）
  sn: string
  status: string // 待接单 / 维修中 / 已完成
  account: string // 当前负责人账号（待接单时=派发人，接单后=接单人）
  accountName: string // 当前负责人姓名（接单后即接单人）
  assignee: string // 派发人账号（order_details.assignee，入库后不变）
  assigneeName: string // 派发人姓名（空 = 未派发）
  orderId: string // 所属订单编号
  orderName: string // 所属订单名称
  seq: number // 设备在订单中的序号（第几行，1 起）
}

export async function getSameSnTicketsApi(
  sn: string,
): Promise<ApiResponse<SameSnTicket[]>> {
  return request({
    url: '/client/repair/getSameSnTickets',
    method: 'get',
    params: { sn },
  })
}

// 按工单 id 精确接单（POST /client/repair/acceptTicket?id=），接单时点弹窗里某条的「接单」按钮调用
export async function acceptTicketApi(id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/client/repair/acceptTicket',
    method: 'post',
    params: { id },
  })
}

// 完成接单（POST /client/repair/finishAccept）：原子操作，请求体携带故障/维修记录字段，
// 一条 SQL 同时保存 description/diagnosis/dispose/result 并将状态置为「已完成」。
export async function saveRepairApi(data: SubmitRepairData): Promise<ApiResponse<void>> {
  return request({
    url: '/client/repair/finishAccept',
    method: 'post',
    data,
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
