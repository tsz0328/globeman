import { ref } from 'vue'
import {
  createDetailApi,
  getDetailsApi,
  deleteDetailApi,
  getRepairDetailApi,
  addRepairSnApi,
  type DetailFormData,
  type DetailData,
  type DetailResponseData,
} from '@/api/DetailApi'

const loading = ref(false)
const detailList = ref<DetailData[]>([])

export function useDetail() {
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

  const fetchDetails = async (id: number): Promise<boolean> => {
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

  const getRepairDetail = async (id: number) => {
    try {
      const res = await getRepairDetailApi(id)
      return res
    } catch (error) {
      console.error('获取维修详情失败:', error)
      return null
    }
  }

  const addRepairSn = async (sn: string, id: number): Promise<boolean> => {
    try {
      const res = await addRepairSnApi(sn, id)
      return res.code === 200
    } catch (error) {
      console.error('提交SN码失败:', error)
      return false
    }
  }

  const acceptRepair = async (sn: string, account: string): Promise<boolean> => {
    try {
      const { acceptRepairApi } = await import('@/api/DetailApi')
      const res = await acceptRepairApi(sn, account)
      return res.code === 200
    } catch (error) {
      console.error('接单失败:', error)
      return false
    }
  }

  return {
    loading,
    detailList,
    createDetail,
    fetchDetails,
    deleteDetail,
    getRepairDetail,
    addRepairSn,
    acceptRepair,
  }
}
