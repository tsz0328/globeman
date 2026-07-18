import request from '@/utils/request'

export interface DetailFormData {
  orderId: number
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
  sn: string
  order_id: number
  details_id: number
  status: string
  number: string
  price: string
  total: string
}

export interface DetailData {
  id: number
  projectId: number
  belongProject: string
  equipmentName: string
  equipmentModel: string
  manufacturer: string
  sn: string
  status: string
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

export async function getRepairDetailApi(
  id: number,
): Promise<ApiResponse<{ [key: string]: DetailResponseData }>> {
  return request({
    url: '/repair/get',
    method: 'get',
    params: { id },
  })
}

export async function addRepairSnApi(sn: string, id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/repair/add',
    method: 'put',
    params: { sn, id },
  })
}

// 接单 API：将指定维修明细标记为已接单或分配给当前用户
export async function acceptRepairApi(sn: string, account: string): Promise<ApiResponse<void>> {
  return request({
    url: '/repair/take',
    method: 'put',
    params: { sn, account },
  })
}

export interface TakenDetailData {
  id: number
  details_id: number
  project_id: number
  order_id: number
  name: string
  model: string
  manufacturer: string
  sn: string
  status: string
  repairman: string
  repairman_account: string
}

export async function getTakenDetailsApi(): Promise<
  ApiResponse<{ [key: string]: TakenDetailData }>
> {
  return request({
    url: '/take/get',
    method: 'get',
  })
}

export interface RepairImageData {
  id: number
  address: string
}

export async function getRepairImagesApi(
  id: number,
): Promise<ApiResponse<{ [key: string]: RepairImageData }>> {
  return request({
    url: '/take/getImg',
    method: 'get',
    params: { id },
  })
}

export async function deleteRepairImageApi(id: number): Promise<ApiResponse<void>> {
  return request({
    url: '/take/delectImg',
    method: 'put',
    params: { id },
  })
}

export async function uploadRepairImagesApi(files: File[], id: number): Promise<ApiResponse<void>> {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  formData.append('id', id.toString())

  return request({
    url: '/take/uploadImgs',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
