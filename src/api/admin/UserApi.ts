import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

// === 用户实体（创建返回 / 列表，供 useUser 复用）===
export interface UserData {
  id?: number
  account: string
  name?: string
  company: string
  role: string
  createTime?: string
}

// === 新建用户 ===
export interface UserForm {
  account: string
  password: string
  name: string
  company: string
  department: string
  role: string
}

export async function createUserApi(data: UserForm): Promise<ApiResponse<UserData>> {
  return request({
    url: '/register',
    method: 'post',
    data,
  })
}

// === 用户列表（删除 / 状态）===
export async function getUsersApi(): Promise<ApiResponse<UserData[]>> {
  return request({
    url: '/client/user/get',
    method: 'get',
  })
}

export async function deleteUserApi(account: string): Promise<ApiResponse> {
  return request({
    url: '/client/user/delete',
    method: 'put',
    params: { account },
  })
}

export async function updateUserStatusApi(account: string): Promise<ApiResponse> {
  return request({
    url: '/client/user/updateStatus',
    method: 'put',
    params: { account },
  })
}

// === 用户完整信息（GET /client/user/getInfoUser，供 useUser 复用）===
export interface UserInfo {
  account: string
  name: string
  company: string
  department: string
  role: string
  status?: number
  address?: string
  birth?: string
  card?: string
  education?: string
  email?: string
  emergency?: string
  phone?: string
  avatar?: string
  sex?: string
  time?: string
  certificateImages?: CertificateImageItem[]
  certificateImageUrls?: string[]
}

export async function getInfoUserApi(): Promise<ApiResponse<UserInfo>> {
  return request({
    url: '/getInfoUser',
    method: 'get',
  })
}

export async function getUserApi(account: string): Promise<ApiResponse<UserInfo>> {
  return request({
    url: '/client/user/getInfoUser',
    method: 'get',
    params: { account },
  })
}

// === 用户证书图片 ===
export interface CertificateImageItem {
  id?: string
  address?: string
  url?: string
  image?: string
  img?: string
}

// 将后端返回的证书图片（可能为字符串 URL 或对象）规整为 CertificateImageItem[]
const normalizeCertificateImageList = (value: unknown): CertificateImageItem[] => {
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

export async function deleteCertificateImageApi(url: string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/user/deleteCertificate',
    method: 'put',
    params: { url },
  })
}

// === 角色（列表 / 名称，供 useRole 复用）===
export interface RoleData {
  id?: number
  role: string // 角色
  name: string // 角色名称
  time?: string // 创建时间
}

export async function getRolesApi(): Promise<ApiResponse<RoleData[]>> {
  return request({
    url: '/role/get',
    method: 'get',
  })
}

export async function getInfoRoleApi(): Promise<ApiResponse<RoleData[]>> {
  return request({
    url: '/client/user/getInfoRole',
    method: 'get',
  })
}
