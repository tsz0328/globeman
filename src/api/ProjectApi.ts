import request from '@/utile/request'

// 项目数据
export interface ProjectData {
  id: number // 项目ID
  name: string // 项目名称
  type: string // 项目类型
  status: string // 项目状态
  leaderAccount: string // 负责人账号
  time: string // 项目创建时间
  customer: string // 项目合作单位
  contact: string // 项目联系人姓名
}

// 项目接口响应数据
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg?: string
  timestamp?: string
}

// 获取项目列表
export async function getProjectsApi(): Promise<ApiResponse<Record<string, ProjectData>>> {
  return request({
    url: '/project/get',
    method: 'get',
  })
}

export interface CreateProjectData {
  name: string
  type: string
  leaderAccount: string
  customer: string
  contact: string
}

export async function createProjectApi(data: CreateProjectData): Promise<ApiResponse<ProjectData>> {
  return request({
    url: '/project/create',
    method: 'post',
    data,
  })
}

// 更新项目
export async function updateProjectApi(
  id: number,
  data: Partial<ProjectData>,
): Promise<ApiResponse<ProjectData>> {
  return request({
    url: `/project/update/${id}`,
    method: 'put',
    data,
  })
}

// 删除项目
export async function deleteProjectApi(id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/project/delete',
    method: 'delete',
    params: { id },
  })
}

// 批量删除项目
export async function batchDeleteProjectsApi(ids: number[]): Promise<ApiResponse<void>> {
  return request({
    url: '/project/batchDelete',
    method: 'delete',
    params: { ids: ids.join(',') },
  })
}
