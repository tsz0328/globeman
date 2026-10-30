import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

// === 新增固定资产（POST /client/assets/addAssets）===
// 请求体字段对应后端 entity；time/company/register 由后端自动填充，不在请求体内
export interface AddAssetInput {
  name: string
  model: string
  type: string
  price: number | string
  sn: string
  account: string
  location: string
}

export async function addAssetsApi(data: AddAssetInput): Promise<ApiResponse<void>> {
  return request({
    url: '/client/assets/addAssets',
    method: 'post',
    data,
  })
}

// === 固定资产列表（GET /client/assets/getAssets）===
// 后端 entity 字段：id/name/model/type/price(BigDecimal)/sn/account(使用人)/location/time/company/register
export interface AssetItem {
  id?: string | number // 主键（列表返回 id；删除接口按 id 传参）
  name: string // 名称
  model: string // 型号
  type: string // 类型
  price: number | string // 价格（BigDecimal，后端多返回 number，个别情况 string）
  sn: string // SN码
  account: string // 使用人（用户账号）
  location: string // 放置位置
  time: unknown // 创建时间（LocalDateTime：可能字符串或 [y,m,d,h,min,s] 数组）
  company: string // 归属公司
  register: string // 登记人
  status: string // 状态（正常 / 报废）
  reason: string | null // 报废原因（未报废时为 null）
  scrapTime: unknown // 报废时间（LocalDateTime：可能字符串或 [y,m,d,h,min,s] 数组；未报废时为 null）
}

// 列表响应 data 结构：{ number, total, assets }
// number: 记录总数（后端字段名，疑似 count；当前样例 = 1）
// total:   资产价格合计金额（float，非记录数；当前样例 = 231.60 = 单条价格）
// assets:  资产数组
export interface GetAssetsResponse {
  number: number
  total: number
  assets: AssetItem[]
}

export async function getAssetListApi(): Promise<ApiResponse<GetAssetsResponse>> {
  return request({
    url: '/client/assets/getAssets',
    method: 'get',
  })
}

// === 修改固定资产（POST /client/assets/updateAssets）===
// 业务约束：仅允许修改"使用人(account)"与"放置位置(location)"两个字段
// 请求体以主键 id 定位记录（与列表返回一致：id）
export interface UpdateAssetInput {
  id: string | number // 主键（列表返回 id）
  account: string // 使用人（可改）
  location: string // 放置位置（可改）
}

export async function updateAssetsApi(data: UpdateAssetInput): Promise<ApiResponse<void>> {
  return request({
    url: '/client/assets/updateAssets',
    method: 'post',
    data,
  })
}

// === 删除固定资产（DELETE /client/assets/deleteAssets?id=xxx）===
export async function deleteAssetsApi(id: string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/assets/deleteAssets',
    method: 'delete',
    params: { id },
  })
}

// === 资产报废（POST /client/assets/scrapAssets）===
// 请求体（application/json）：{ id, reason }
export interface ScrapAssetInput {
  id: string | number // 主键（列表返回 id）
  reason: string // 报废原因
}

export async function scrapAssetsApi(data: ScrapAssetInput): Promise<ApiResponse<void>> {
  return request({
    url: '/client/assets/scrapAssets',
    method: 'post',
    data,
  })
}

// === 资产启用/恢复（POST /client/assets/enableAssets?id=xxx）===
// 与报废反向：将 status 由「报废」恢复为「正常」；id 以 query 参数传递（同 deleteAssets）
export async function enableAssetsApi(id: string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/assets/enableAssets',
    method: 'post',
    params: { id },
  })
}
