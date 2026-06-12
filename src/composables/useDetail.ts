import { ref } from 'vue'
import {
  createDetailApi,
  getDetailsApi,
  deleteDetailApi,
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
            quantity: item.number,
            unitPrice: item.price,
            total: item.total,
          }))
        } else if (typeof data === 'object' && data !== null) {
          detailList.value = (Object.values(data) as DetailResponseData[]).map((item) => ({
            id: item.id,
            projectId: item.project_id,
            belongProject: '',
            equipmentName: item.name,
            equipmentModel: item.model,
            manufacturer: item.manufacturer,
            quantity: item.number,
            unitPrice: item.price,
            total: item.total,
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
        const index = detailList.value.findIndex(item => item.id === id)
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

  return {
    loading,
    detailList,
    createDetail,
    fetchDetails,
    deleteDetail,
  }
}
