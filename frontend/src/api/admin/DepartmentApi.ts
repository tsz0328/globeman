import request from '@/utils/request'
import type { ApiResponse } from '@/api/types'

// === 部门实体（部门管理，供 useDepartment 复用）===
export interface DepartmentData {
  id?: number
  name: string
  time?: string
}

// 部门名称列表（路径挂在 user 接口下，历史遗留）
export async function getDepartmentInfoApi(): Promise<ApiResponse<string[]>> {
  return request({
    url: '/client/user/getInfoDepartment',
    method: 'get',
  })
}

// 部门管理页面获取部门表格信息
export async function getDepartmentsApi(): Promise<ApiResponse<string[]>> {
  return request({
    url: '/client/department/getInfoDepartment',
    method: 'get',
  })
}

// 部门管理页面新建部门
export async function createDepartmentApi(department: string): Promise<ApiResponse<void>> {
  return request({
    url: '/client/department/createDepartment',
    method: 'post',
    params: { department },
  })
}
