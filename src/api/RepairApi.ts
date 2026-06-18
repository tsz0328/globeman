import request from '@/utile/request'

export interface RepairData {
  id: number
  name: string
  type: string
  status: string
  leaderAccount: string
  time: string
  customer: string
  contact: string
}

export interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg?: string
  timestamp?: string
}

export async function getRepairsApi(): Promise<ApiResponse<Record<string, RepairData>>> {
  return request({
    url: '/repair/get',
    method: 'get',
  })
}

export interface CreateRepairData {
  name: string
  type: string
  leaderAccount: string
  customer: string
  contact: string
}

export async function createRepairApi(data: CreateRepairData): Promise<ApiResponse<RepairData>> {
  return request({
    url: '/repair/create',
    method: 'post',
    data,
  })
}

export async function updateRepairApi(
  id: number,
  data: Partial<RepairData>,
): Promise<ApiResponse<RepairData>> {
  return request({
    url: `/repair/update/${id}`,
    method: 'put',
    data,
  })
}

export async function deleteRepairApi(id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/repair/delete',
    method: 'delete',
    params: { id },
  })
}

export async function batchDeleteRepairsApi(ids: number[]): Promise<ApiResponse<void>> {
  return request({
    url: '/repair/batchDelete',
    method: 'delete',
    params: { ids: ids.join(',') },
  })
}
