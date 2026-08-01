import request from '@/utils/request'

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

// 获取公司列表
export async function getCompaniesApi(): Promise<ApiResponse<CompanyData[]>> {
  return request({
    url: '/client/company/get',
    method: 'get',
  })
}

// 专门用于获取公司名称列表的 API（仅返回名称字符串数组）
export async function getInfoCompanyApi(): Promise<ApiResponse<string[]>> {
  return request({
    url: '/client/user/getInfoCompany',
    method: 'get',
  })
}

// 专门用于获取部门名称列表的 API（仅返回名称字符串数组）
export async function getDepartmentInfoApi(): Promise<ApiResponse<string[]>> {
  return request({
    url: '/client/user/getInfoDepartment',
    method: 'get',
  })
}

// 删除公司
export async function deleteCompanyApi(id: number): Promise<ApiResponse<unknown>> {
  return request({
    url: '/company/delete',
    method: 'delete',
    params: { id },
  })
}

// 批量删除公司
export async function batchDeleteCompaniesApi(ids: number[]): Promise<ApiResponse<unknown>> {
  return request({
    url: '/company/batchDelete',
    method: 'delete',
    params: { ids: ids.join(',') },
  })
}

// 创建公司
export interface CompanyFormData {
  name: string
}

// 创建公司 API
export async function createCompanyApi(data: CompanyFormData): Promise<ApiResponse<CompanyData>> {
  return request({
    url: '/company/create',
    method: 'post',
    data,
  })
}
