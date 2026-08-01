import request from '@/utils/request'

// 用户数据接口
export interface UserForm {
  account: string
  password: string
  name: string
  company: string
  department: string
  role: string
}

// 角色数据接口
export interface UserData {
  id?: number
  account: string
  name?: string
  company: string
  role: string
  createTime?: string
}

// 角色数据接口
export interface RoleData {
  id?: number
  role: string // 角色
  name: string // 角色名称
  time?: string // 创建时间
}

// 通用 API 响应接口
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
    url: '/client/user/delete',
    method: 'put',
    params: { account },
  })
}

// 更新用户状态：仅传 account，后端改状态并返回最新 status（0=禁用, 1=正常）
export async function updateUserStatusApi(account: string): Promise<ApiResponse> {
  return request({
    url: '/client/user/updateStatus',
    method: 'put',
    params: { account },
  })
}

// 用户完整信息接口（GET /client/user/getInfoUser?account=xxx 返回）
export interface UserInfo {
  account: string
  name: string
  company: string
  department: string
  role: string
  status: number
  // 以下为详情扩展字段
  address?: string
  birth?: string
  card?: string
  education?: string
  email?: string
  emergency?: string
  phone?: string
  sex?: string
  time?: string
}

// 获取用户完整信息（按账号）
export async function getUserInfoApi(): Promise<ApiResponse<UserInfo>> {
  return request({
    url: '/getInfoUser',
    method: 'get',
  })
}

// 获取角色列表
export async function getRolesApi(): Promise<ApiResponse<RoleData[]>> {
  return request({
    url: '/role/get',
    method: 'get',
  })
}

// 获取角色（展示 name，实际传 role）
export async function getRoleInfoApi(): Promise<ApiResponse<RoleData[]>> {
  return request({
    url: '/client/user/getInfoRole',
    method: 'get',
  })
}
