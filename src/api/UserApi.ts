import request from '@/utile/request'

export interface UserForm {
  account: string
  password: string
  name: string
  company: string
  role: string
}

export interface UserData {
  id?: number
  account: string
  name?: string
  company: string
  role: string
  createTime?: string
}

export interface RoleData {
  id?: number
  role: string // 角色
  name: string // 角色名称
  time?: string // 创建时间
}

export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

export async function createUserApi(data: UserForm): Promise<ApiResponse<UserData>> {
  return request({
    url: '/user/create',
    method: 'post',
    data,
  })
}

export async function getUsersApi(): Promise<ApiResponse<UserData[]>> {
  return request({
    url: '/user/get',
    method: 'get',
  })
}

export async function deleteUserApi(account: string): Promise<ApiResponse> {
  return request({
    url: '/user/delete',
    method: 'put',
    params: { account },
  })
}

export async function getUserInfoApi(account: string): Promise<ApiResponse> {
  return request({
    url: '/get',
    method: 'get',
    params: { account },
  })
}

export async function getRolesApi(): Promise<ApiResponse<RoleData[]>> {
  return request({
    url: '/role/get',
    method: 'get',
  })
}
