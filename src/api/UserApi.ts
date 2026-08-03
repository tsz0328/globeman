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

// 用户数据接口
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
export interface CertificateImageItem {
  id?: string
  address?: string
  url?: string
  image?: string
  img?: string
}

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
  certificateImages?: CertificateImageItem[]
  certificateImageUrls?: string[]
}

const normalizeCertificateImageList = (value: unknown): CertificateImageItem[] => {
  // 辅助函数：将单项转为 CertificateImageItem，处理字符串 URL 的情况
  const toItem = (item: unknown): CertificateImageItem => {
    if (typeof item === 'string') {
      return { address: item }
    }
    return item as CertificateImageItem
  }

  if (Array.isArray(value)) {
    return value.map(toItem)
  }

  if (value && typeof value === 'object') {
    const maybeData = value as Record<string, unknown>
    const list = maybeData.list ?? maybeData.images ?? maybeData.data
    if (Array.isArray(list)) {
      return list.map(toItem)
    }
  }

  return []
}

// 登录时获取用户信息
export async function getUserInfoApi(account: string): Promise<ApiResponse<UserInfo>> {
  return request({
    url: '/getInfoUser',
    method: 'get',
    params: { account },
  })
}

// 获取证书图片列表
export async function getCertificateImagesApi(
  account: string,
): Promise<ApiResponse<CertificateImageItem[]>> {
  const res = (await request({
    url: '/client/user/getCertificate',
    method: 'get',
    params: { account },
  })) as ApiResponse<unknown>
  return {
    ...res,
    data: normalizeCertificateImageList(res.data),
  } as ApiResponse<CertificateImageItem[]>
}

// 上传证书图片
export async function uploadCertificateImagesApi(
  files: File[],
  account: string,
): Promise<ApiResponse<void>> {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  formData.append('account', account)

  return request({
    url: '/client/user/updateImg',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 删除证书图片
export async function deleteCertificateImageApi(url: string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/user/deleteCertificate',
    method: 'put',
    params: { url },
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
export async function getInfoRoleApi(): Promise<ApiResponse<RoleData[]>> {
  return request({
    url: '/client/user/getInfoRole',
    method: 'get',
  })
}

// 个人中心数据（对接 GET /client/person/getPerson）
export interface PersonData {
  avatar?: string // 前端保留字段，非接口返回
  account?: string
  address?: string
  birth?: string
  card?: string
  company?: string
  department?: string
  education?: string
  email?: string
  emergency?: string
  name?: string
  phone?: string
  role?: string
  sex?: string
  status?: number
  time?: string
}

// 获取个人中心信息
export async function getPersonApi(): Promise<ApiResponse<PersonData>> {
  return request({
    url: '/client/person/getPerson',
    method: 'get',
  })
}

// 上传头像
export async function updateAvatarApi(file: File): Promise<ApiResponse<PersonData>> {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/client/person/updateAvatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },  })
}

// 修改密码
export async function updatePasswordApi(password: string): Promise<ApiResponse> {
  return request({
    url: '/client/person/updatePassword',
    method: 'post',
    params: { password },
  })
}
