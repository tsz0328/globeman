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

// === 更新个人资料 ===
// 可编辑字段（注册日期 time / 状态 status / 账号 account / 角色 role / 公司 company / 部门 department / 姓名 name 不在此列）
export interface PersonUpdatePayload {
  sex?: string
  email?: string
  phone?: string
  address?: string
  education?: string
  birth?: string
  card?: string
  emergency?: string
}

// 保存个人资料修改。后端就绪前由 PersonalCenter 的本地桩直接合并到本地状态；
// 后端就绪后改调本函数即可（POST /client/person/updatePerson）。
export async function updatePersonApi(data: PersonUpdatePayload): Promise<ApiResponse> {
  return request({
    url: '/client/person/updatePerson',
    method: 'post',
    data,
  })
}
