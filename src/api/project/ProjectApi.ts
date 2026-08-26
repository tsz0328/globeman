import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

// === 项目实体（列表 / 更新 / 删除）===
export interface ProjectData {
  id: string // 项目ID
  name: string // 项目名称
  type: string // 项目类型
  status: string // 项目状态
  leaderAccount: string // 负责人账号
  time: string // 项目创建时间
  customer: string // 项目合作单位
  contact: string // 项目联系人姓名
}

// 获取项目列表（响应 data 为数组）
export async function getProjectsApi(): Promise<ApiResponse<ProjectData[]>> {
  return request({
    url: '/client/project/getProject',
    method: 'get',
  })
}

// 返回给后端的创建请求体字段（create 接口用 manager 表示负责人账号）
export interface CreateProjectData {
  id: string
  name: string
  type: string
  customer: string
  contact: string
  manager: string
}

// 更新项目
export async function updateProjectApi(
  id: string,
  data: Partial<ProjectData>,
): Promise<ApiResponse<ProjectData>> {
  return request({
    url: `/project/update/${id}`,
    method: 'put',
    data,
  })
}

// 删除项目
export async function deleteProjectApi(id: string): Promise<ApiResponse<void>> {
  return request({
    url: '/project/delete',
    method: 'delete',
    params: { id },
  })
}

// 创建项目
export async function createProjectApi(data: CreateProjectData): Promise<ApiResponse<ProjectData>> {
  return request({
    url: '/client/project/addProject',
    method: 'post',
    data,
  })
}

// 订单关联项目（POST /client/project/orderProject?projectId=&orderId=）
export async function associateOrderToProjectApi(
  projectId: string,
  orderId: string,
): Promise<ApiResponse<void>> {
  return request({
    url: '/client/project/orderProject',
    method: 'post',
    params: { projectId, orderId },
  })
}
