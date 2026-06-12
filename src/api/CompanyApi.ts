import request from '@/utile/request'

// 公司数据接口
export interface CompanyData {
  id?: number
  name: string
  time?: string
}

export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

export async function getCompaniesApi(): Promise<ApiResponse<CompanyData[]>> {
  return request({
    url: '/company/get',
    method: 'get',
  })
}

export async function deleteCompanyApi(id: number): Promise<ApiResponse<unknown>> {
  return request({
    url: '/company/delete',
    method: 'delete',
    params: { id },
  })
}

export async function batchDeleteCompaniesApi(ids: number[]): Promise<ApiResponse<unknown>> {
  return request({
    url: '/company/batchDelete',
    method: 'delete',
    params: { ids: ids.join(',') },
  })
}

export interface CompanyFormData {
  name: string
}

export async function createCompanyApi(data: CompanyFormData): Promise<ApiResponse<CompanyData>> {
  return request({
    url: '/company/create',
    method: 'post',
    data,
  })
}
