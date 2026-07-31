import request from '@/utils/request'

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

// 创建用户
export async function createUserApi(data: UserForm): Promise<ApiResponse<UserData>> {
  return request({
    url: '/register',
    method: 'post',
    data,
  })
}

// 获取用户列表
export async function getUsersApi(): Promise<ApiResponse<UserData[]>> {
  return request({
    url: '/client/user/get',
    method: 'get',
  })
}

// 删除用户
export async function deleteUserApi(account: string): Promise<ApiResponse> {
  return request({
    url: '/user/delete',
    method: 'put',
    params: { account },
  })
}

// 获取用户信息
export async function getUserInfoApi(account: string): Promise<ApiResponse> {
  return request({
    url: '/getInfoUser',
    method: 'get',
    params: { account },
  })
}

// 获取角色列表
export async function getRolesApi(): Promise<ApiResponse<RoleData[]>> {
  return request({
    url: '/role/get',
    method: 'get',
  })
}

// 获取角色筛选/下拉选项（展示 name，实际传 role）
// GET /client/user/getRoleInfo -> [{ role: 'admin', name: '超级管理员' }, ...]
export async function getRoleInfoApi(): Promise<ApiResponse<RoleData[]>> {
  return request({
    url: '/client/user/getRoleInfo',
    method: 'get',
  })
}
