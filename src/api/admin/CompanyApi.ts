import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

// === 公司实体（列表/详情/创建返回，供 useCompany 复用）===
export interface CompanyData {
  id?: number
  name: string
  account?: string
  time?: string
}

export async function getCompaniesApi(): Promise<ApiResponse<CompanyData[]>> {
  return request({
    url: '/client/company/get',
    method: 'get',
  })
}

export async function getInfoCompanyApi(): Promise<ApiResponse<string[]>> {
  return request({
    url: '/client/user/getInfoCompany',
    method: 'get',
  })
}

export async function deleteCompanyApi(ids: number[]): Promise<ApiResponse<unknown>> {
  return request({
    url: '/client/company/delete',
    method: 'post',
    data: ids,
  })
}

// === 新建公司 ===
export interface CompanyFormData {
  account: string
  password: string
  name: string
  company: string
}

export async function createCompanyApi(data: CompanyFormData): Promise<ApiResponse<CompanyData>> {
  return request({
    url: '/client/company/create',
    method: 'post',
    data,
  })
}

// === 营业执照（USCI）===
export async function getUsciApi(
  company: string,
): Promise<ApiResponse<string | { url?: string; address?: string; image?: string }>> {
  return request({
    url: '/client/company/getUsci',
    method: 'get',
    params: { company },
  })
}

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

export async function deleteUsciApi(url: string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/company/deleteUsci',
    method: 'put',
    params: { url },
  })
}
