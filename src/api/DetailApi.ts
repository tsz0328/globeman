import request from '@/utile/request'

export interface DetailFormData {
  id: string
  name: string
  model: string
  manufacturer: string
  number: string
  price: string
}

export interface DetailResponseData {
  id: number
  project_id: number
  name: string
  model: string
  manufacturer: string
  number: number
  price: number
  total: number
}

export interface DetailData {
  id: number
  projectId: number
  belongProject: string
  equipmentName: string
  equipmentModel: string
  manufacturer: string
  quantity: number
  unitPrice: number
  total: number
}

export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
  timestamp?: string
}

export async function createDetailApi(data: DetailFormData): Promise<ApiResponse<void>> {
  return request({
    url: '/details/create',
    method: 'post',
    data,
  })
}

export async function getDetailsApi(
  id: number,
): Promise<ApiResponse<DetailResponseData[] | { [key: string]: DetailResponseData }>> {
  return request({
    url: '/details/get',
    method: 'get',
    params: { id },
  })
}

export async function deleteDetailApi(id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/details/delete',
    method: 'delete',
    params: { id },
  })
}
