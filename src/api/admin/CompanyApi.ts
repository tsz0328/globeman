import request from '@/utils/request'

// 公司数据接口
export interface CompanyData {
  id?: number
  name: string
  account?: string
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

// 部门数据接口
export interface DepartmentData {
  id?: number
  name: string
  time?: string
}

// 获取部门列表
export async function getDepartmentsApi(): Promise<ApiResponse<string[]>> {
  return request({
    url: '/client/department/getInfoDepartment',
    method: 'get',
  })
}

// 新建部门
export async function createDepartmentApi(department: string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/department/createDepartment',
    method: 'post',
    params: { department },
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

// 创建公司 API
export async function createCompanyApi(data: CompanyFormData): Promise<ApiResponse<CompanyData>> {
  return request({
    url: '/client/company/create',
    method: 'post',
    data,
  })
}

// 获取营业执照
export async function getUsciApi(company: string): Promise<ApiResponse<string | { url?: string; address?: string; image?: string }>> {
  return request({
    url: '/client/company/getUsci',
    method: 'get',
    params: { company },
  })
}
// 上传营业执照
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

// 删除营业执照
export async function deleteUsciApi(url: string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/company/deleteUsci',
    method: 'put',
    params: { url },
  })
}
