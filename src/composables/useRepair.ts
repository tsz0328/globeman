import { ref } from 'vue'
import {
  getRepairsApi,
  createRepairApi,
  updateRepairApi,
  deleteRepairApi,
  batchDeleteRepairsApi,
} from '@/api/RepairApi'

export interface Repair {
  id: number
  repairName: string
  repairType: string
  repairManager: string
  createTime: string
  cooperativeUnit: string
  contactPerson: string
  status: string
  creator: string
  customer: string
}

export interface RepairFormData {
  id?: number
  name: string
  type: string
  leaderAccount: string
  customer: string
  contact: string
  time?: string
}

const repairList = ref<Repair[]>([])
const loading = ref(false)

export function useRepair() {
  const fetchRepairs = async () => {
    loading.value = true
    try {
      const res = await getRepairsApi()
      if (res.code === 200) {
        const isRepairRecord = (value: unknown): value is Record<string, unknown> => {
          return typeof value === 'object' && value !== null && 'id' in value && 'name' in value
        }

        const normalizeRecords = (data: unknown): Record<string, unknown>[] => {
          if (Array.isArray(data)) {
            return data as Record<string, unknown>[]
          }
          if (!data || typeof data !== 'object') {
            return []
          }
          const record = data as Record<string, unknown>
          const objectValues = Object.values(record).filter(isRepairRecord)
          if (objectValues.length > 0) {
            return objectValues
          }
          if (isRepairRecord(record)) {
            return [record]
          }
          return []
        }

        const repairArray = normalizeRecords(res.data)

        repairList.value = repairArray.map((item, index) => {
          const record = item as Record<string, unknown>
          const getString = (keys: string[]) => {
            for (const key of keys) {
              const value = record[key]
              if (typeof value === 'string') {
                return value
              }
              if (typeof value === 'number') {
                return String(value)
              }
            }
            return ''
          }

          const repair: Repair = {
            id:
              typeof record.id === 'number'
                ? record.id
                : typeof record.id === 'string'
                  ? parseInt(record.id, 10) || index + 1
                  : index + 1,
            repairName: getString(['name', 'repairName']),
            repairType: getString(['type', 'repairType']),
            repairManager: getString(['leader', 'leaderAccount', 'repairManager']),
            createTime: getString(['time', 'createTime']),
            cooperativeUnit: getString(['company', 'cooperativeUnit']),
            contactPerson: getString(['contact', 'contactPerson', 'contactName', 'Contact']),
            status: getString(['state', 'status']) || '±‡º≠÷–',
            creator: getString(['creator', 'creatorName']),
            customer: getString(['customer', 'customerName']),
          }
          return repair
        })
      } else {
        console.warn('ªÒ»°Œ¨–ﬁ¡–±Ì∑µªÿ“Ï≥£:', res.msg)
      }
    } catch (error) {
      console.error('ªÒ»°Œ¨–ﬁ¡–±Ì ß∞‹:', error)
    } finally {
      loading.value = false
    }
  }

  const createRepair = async (data: RepairFormData): Promise<boolean> => {
    loading.value = true
    try {
      const res = await createRepairApi({
        name: data.name,
        type: data.type,
        leaderAccount: data.leaderAccount,
        customer: data.customer,
        contact: data.contact,
      })
      if (res.code === 200) {
        await fetchRepairs()
        return true
      }
      return false
    } catch (error) {
      console.error('¥¥Ω®Œ¨–ﬁ ß∞‹:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  const updateRepair = async (id: number, data: RepairFormData): Promise<boolean> => {
    loading.value = true
    try {
      const res = await updateRepairApi(id, data)
      if (res.code === 200) {
        const index = repairList.value.findIndex((p) => p.id === id)
        if (index !== -1) {
          const oldRepair = repairList.value[index]
          if (oldRepair) {
            repairList.value[index] = {
              ...oldRepair,
              repairName: data.name,
              repairType: data.type,
              repairManager: data.leaderAccount,
              cooperativeUnit: data.customer,
              contactPerson: data.contact,
            }
          }
        }
        return true
      }
      return false
    } catch (error) {
      console.error('∏¸–¬Œ¨–ﬁ ß∞‹:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteRepair = async (id: number): Promise<boolean> => {
    loading.value = true
    try {
      const res = await deleteRepairApi(id)
      if (res.code === 200) {
        repairList.value = repairList.value.filter((p) => p.id !== id)
        return true
      }
      return false
    } catch (error) {
      console.error('…æ≥˝Œ¨–ﬁ ß∞‹:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  const batchDeleteRepairs = async (ids: number[]): Promise<boolean> => {
    loading.value = true
    try {
      const res = await batchDeleteRepairsApi(ids)
      if (res.code === 200) {
        repairList.value = repairList.value.filter((p) => !ids.includes(p.id))
        return true
      }
      return false
    } catch (error) {
      console.error('≈˙¡ø…æ≥˝Œ¨–ﬁ ß∞‹:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    repairList,
    loading,
    fetchRepairs,
    createRepair,
    updateRepair,
    deleteRepair,
    batchDeleteRepairs,
  }
}
