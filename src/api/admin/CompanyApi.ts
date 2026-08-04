import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

// 公司数据接口
export interface CompanyData {
  id?: number
  name: string
  account?: string
  time?: string
}

// 用于公司管理页面获取公司表格信息
export async function getCompaniesApi(): Promise<ApiResponse<CompanyData[]>> {
  return request({
    url: '/client/company/get',
    method: 'get',
  })
}

// 专门用于获取公司名称列表
export async function getInfoCompanyApi(): Promise<ApiResponse<string[]>> {
  return request({
    url: '/client/user/getInfoCompany',
    method: 'get',
  })
}

// 删除公司（多个删除）
export async function deleteCompanyApi(ids: number[]): Promise<ApiResponse<unknown>> {
  return request({
    url: '/client/company/delete',
    method: 'post',
    data: ids,
  })
}

// 新建公司数据接口
export interface CompanyFormData {
  account: string
  password: string
  name: string
  company: string
}

// 创建公司
export async function createCompanyApi(data: CompanyFormData): Promise<ApiResponse<CompanyData>> {
  return request({
    url: '/client/company/create',
    method: 'post',
    data,
  })
}

// 公司详情页面获取营业执照
export async function getUsciApi(
  company: string,
): Promise<ApiResponse<string | { url?: string; address?: string; image?: string }>> {
  return request({
    url: '/client/company/getUsci',
    method: 'get',
    params: { company },
  })
}

// 公司详情页面上传营业执照
export async function uploadUsciApi(file: File, company: string): Promise<ApiResponse<void>> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('company', company)
  return request({
    url: '/client/company/updateUsci',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 公司详情页面删除营业执照
export async function deleteUsciApi(url: string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/company/deleteUsci',
    method: 'put',
    params: { url },
  })
}
