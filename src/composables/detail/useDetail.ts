import { ref } from 'vue'
import {
  createDetailApi,
  getDetailsApi,
  deleteDetailApi,
  type DetailFormData,
  type DetailData,
  type DetailResponseData,
} from '@/api/order/OrderDetailApi'
import {
  getRepairDetailApi,
  addRepairSnApi,
  uploadRepairImagesApi,
  getRepairImagesApi,
  deleteRepairImageApi,
  getTestImagesApi,
  uploadTestImagesApi,
  deleteTestImageApi,
  submitRepairApi,
  saveRepairApi,
  getRepairByIdApi,
  getTakenDetailsApi,
  acceptRepairApi,
  type RepairDetailData,
  type TakenDetailData,
  type RepairImageData,
  type SubmitRepairData,
} from '@/api/repair/RepairApi'
import { getInfoDetailsApi, type OrderInfoDetail } from '@/api/order/OrderApi'

export interface TakenDetail {
  id: number
  detailsId: number
  projectId: string
  orderId: string
  name: string
  model: string
  manufacturer: string
  sn: string
  status: string
  repairman: string
  repairmanAccount: string
}

export interface RepairImageItem {
  id: number
  address: string
}

const loading = ref(false)
const detailList = ref<DetailData[]>([])

export function useDetail() {
  // 创建设备
  const createDetail = async (data: DetailFormData): Promise<boolean> => {
    loading.value = true
    try {
      const res = await createDetailApi(data)
      if (res.code === 200) {
        return true
      }
      return false
    } catch (error) {
      console.error('创建设备失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取设备列表
  const fetchDetails = async (id: string): Promise<boolean> => {
    loading.value = true
    try {
      const res = await getDetailsApi(id)
      if (res.code === 200) {
        const data = res.data
        if (Array.isArray(data)) {
          detailList.value = data.map((item: DetailResponseData) => ({
            id: item.id,
            projectId: item.project_id,
            belongProject: '',
            equipmentName: item.name,
            equipmentModel: item.model,
            manufacturer: item.manufacturer,
            sn: item.sn || '',
            status: item.status || '',
            quantity: parseInt(item.number) || 0,
            unitPrice: parseFloat(item.price) || 0,
            total: parseFloat(item.total) || 0,
          }))
        } else if (typeof data === 'object' && data !== null) {
          detailList.value = (Object.values(data) as DetailResponseData[]).map((item) => ({
            id: item.id,
            projectId: item.project_id,
            belongProject: '',
            equipmentName: item.name,
            equipmentModel: item.model,
            manufacturer: item.manufacturer,
            sn: item.sn || '',
            status: item.status || '',
            quantity: parseInt(item.number) || 1,
            unitPrice: parseFloat(item.price) || 0,
            total: parseFloat(item.total) || 0,
          }))
        } else {
          detailList.value = []
        }
        return true
      }
      return false
    } catch (error) {
      console.error('获取设备列表失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取订单设备明细（订单详情弹窗专用，走 /client/order/getInfoDetails）
  // 字段映射按真实返回：brand→厂商、subtotal→金额、order→订单号；订单阶段无 sn/status/remark
  const fetchOrderDetails = async (id: string): Promise<boolean> => {
    loading.value = true
    try {
      const res = await getInfoDetailsApi(id)
      if (res.code === 200) {
        const data = res.data
        if (Array.isArray(data)) {
          detailList.value = data.map((item: OrderInfoDetail) => ({
            id: item.id,
            projectId: item.order,
            belongProject: '',
            equipmentName: item.name,
            equipmentModel: item.model,
            manufacturer: item.brand,
            sn: '',
            status: '',
            quantity: Number(item.number) || 0,
            unitPrice: Number(item.price) || 0,
            total: Number(item.subtotal) || 0,
            type: item.type || '',
            spec: item.spec || '',
          }))
        } else if (typeof data === 'object' && data !== null) {
          detailList.value = (Object.values(data) as OrderInfoDetail[]).map((item) => ({
            id: item.id,
            projectId: item.order,
            belongProject: '',
            equipmentName: item.name,
            equipmentModel: item.model,
            manufacturer: item.brand,
            sn: '',
            status: '',
            quantity: Number(item.number) || 0,
            unitPrice: Number(item.price) || 0,
            total: Number(item.subtotal) || 0,
            type: item.type || '',
            spec: item.spec || '',
          }))
        } else {
          detailList.value = []
        }
        return true
      }
      return false
    } catch (error) {
      console.error('获取订单设备明细失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 删除设备
  const deleteDetail = async (id: number): Promise<boolean> => {
    loading.value = true
    try {
      const res = await deleteDetailApi(id)
      if (res.code === 200) {
        const index = detailList.value.findIndex((item) => item.id === id)
        if (index !== -1) {
          detailList.value.splice(index, 1)
        }
        return true
      }
      return false
    } catch (error) {
      console.error('删除设备失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取维修详情
  const getRepairDetail = async (id: number) => {
    try {
      const res = await getRepairDetailApi(id)
      return res
    } catch (error) {
      console.error('获取维修详情失败:', error)
      return null
    }
  }

  // 添加维修 SN 码
  const addRepairSn = async (sn: string, id: number): Promise<boolean> => {
    try {
      const res = await addRepairSnApi(sn, id)
      return res.code === 200
    } catch (error) {
      console.error('提交SN码失败:', error)
      return false
    }
  }

  // 接单
  const acceptRepair = async (sn: string, account: string): Promise<boolean> => {
    try {
      const { acceptRepairApi } = await import('@/api/repair/RepairApi')
      const res = await acceptRepairApi(sn, account)
      return res.code === 200
    } catch (error) {
      console.error('接单失败:', error)
      return false
    }
  }

  // 获取维修工单详情
  const getRepairById = async (id: number): Promise<RepairDetailData | null> => {
    try {
      const res = await getRepairByIdApi(id)
      if (res.code === 200 && res.data) {
        return res.data
      }
      return null
    } catch (error) {
      console.error('获取维修工单失败:', error)
      return null
    }
  }

  // 获取维修图片列表
  const getRepairImages = async (id: number): Promise<RepairImageItem[]> => {
    try {
      const res = await getRepairImagesApi(id)
      if (res.code === 200 && res.data) {
        return Object.values(res.data).map((item: RepairImageData) => ({
          id: item.id,
          address: item.address,
        }))
      }
      return []
    } catch (error) {
      console.error('获取维修图片失败:', error)
      return []
    }
  }

  // 上传维修图片
  const uploadRepairImages = async (files: File[], id: number): Promise<boolean> => {
    try {
      const res = await uploadRepairImagesApi(files, id)
      return res.code === 200
    } catch (error) {
      console.error('上传维修图片失败:', error)
      return false
    }
  }

  // 删除维修图片
  const deleteRepairImage = async (id: number): Promise<boolean> => {
    try {
      const res = await deleteRepairImageApi(id)
      return res.code === 200
    } catch (error) {
      console.error('删除维修图片失败:', error)
      return false
    }
  }

  // 获取测试图片列表
  const getTestImages = async (id: number): Promise<RepairImageItem[]> => {
    try {
      const res = await getTestImagesApi(id)
      if (res.code === 200 && res.data) {
        return Object.values(res.data).map((item: RepairImageData) => ({
          id: item.id,
          address: item.address,
        }))
      }
      return []
    } catch (error) {
      console.error('获取测试图片失败:', error)
      return []
    }
  }

  // 上传测试图片
  const uploadTestImages = async (files: File[], id: number): Promise<boolean> => {
    try {
      const res = await uploadTestImagesApi(files, id)
      return res.code === 200
    } catch (error) {
      console.error('上传测试图片失败:', error)
      return false
    }
  }

  // 删除测试图片
  const deleteTestImage = async (id: number): Promise<boolean> => {
    try {
      const res = await deleteTestImageApi(id)
      return res.code === 200
    } catch (error) {
      console.error('删除测试图片失败:', error)
      return false
    }
  }

  // 提交维修工单
  const submitRepair = async (data: SubmitRepairData): Promise<boolean> => {
    try {
      const res = await submitRepairApi(data)
      return res.code === 200
    } catch (error) {
      console.error('提交维修工单失败:', error)
      return false
    }
  }

  // 保存维修工单
  const saveRepair = async (id: number): Promise<boolean> => {
    try {
      const res = await saveRepairApi(id)
      return res.code === 200
    } catch (error) {
      console.error('保存维修工单失败:', error)
      return false
    }
  }

  // 获取接单列表
  const getTakenDetails = async (): Promise<TakenDetail[]> => {
    try {
      const res = await getTakenDetailsApi()
      if (res.code === 200 && res.data && typeof res.data === 'object') {
        return Object.values(res.data).map((item: TakenDetailData) => ({
          id: item.id,
          detailsId: item.details_id,
          projectId: item.project_id,
          orderId: item.order_id,
          name: item.name,
          model: item.model,
          manufacturer: item.manufacturer,
          sn: item.sn,
          status: item.status,
          repairman: item.repairman,
          repairmanAccount: item.repairman_account,
        }))
      }
      return []
    } catch (error) {
      console.error('获取接单列表失败:', error)
      return []
    }
  }

  return {
    loading,
    detailList,
    createDetail,
    fetchDetails,
    fetchOrderDetails,
    deleteDetail,
    getRepairDetail,
    addRepairSn,
    acceptRepair,
    getRepairById,
    getRepairImages,
    uploadRepairImages,
    deleteRepairImage,
    getTestImages,
    uploadTestImages,
    deleteTestImage,
    submitRepair,
    saveRepair,
    getTakenDetails,
  }
}
