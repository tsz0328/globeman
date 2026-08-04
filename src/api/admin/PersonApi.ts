import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

// === 个人中心实体（对接 GET /client/person/getPerson）===
export interface PersonData {
  avatar?: string
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

// 获取个人信息
export async function getPersonApi(): Promise<ApiResponse<PersonData>> {
  return request({
    url: '/client/person/getPerson',
    method: 'get',
  })
}

// 上传头像（返回最新个人信息）
export async function updateAvatarApi(file: File): Promise<ApiResponse<PersonData>> {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/client/person/updateAvatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 修改密码
export async function updatePasswordApi(password: string): Promise<ApiResponse> {
  return request({
    url: '/client/person/updatePassword',
    method: 'post',
    params: { password },
  })
}
