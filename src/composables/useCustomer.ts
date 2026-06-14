import { ref } from 'vue'
import {
  getCustomersApi,
  createCustomerApi,
  deleteCustomerApi,
  batchDeleteCustomersApi,
  type CustomerData,
} from '@/api/CustomerApi'

// 客户接口
export interface Customer {
  id: number
  name: string
  company: string
  contact: string
  phone: string
  createTime: string
}

// 客户列表
const customerList = ref<Customer[]>([])
// 加载状态
const loading = ref(false)

// 获取客户列表
export function useCustomer() {
  // 获取客户列表（带缓存，只在数据为空时请求）
  const fetchCustomers = async (force = false) => {
    if (!force && customerList.value.length > 0) {
      return
    }
    loading.value = true
    try {
      const res = await getCustomersApi()
      if (res.code === 200) {
        const isCustomerRecord = (value: unknown): value is Record<string, unknown> => {
          return typeof value === 'object' && value !== null && 'id' in value && 'name' in value
        }

        // 归一化数据，处理嵌套对象和数组
        const normalizeRecords = (data: unknown): Record<string, unknown>[] => {
          if (Array.isArray(data)) {
            return data as Record<string, unknown>[]
          }
          if (!data || typeof data !== 'object') {
            return []
          }
          const record = data as Record<string, unknown>
          const objectValues = Object.values(record).filter(isCustomerRecord)
          if (objectValues.length > 0) {
            return objectValues
          }
          if (isCustomerRecord(record)) {
            return [record]
          }
          return []
        }

        // 归一化客户记录
        const customerArray = normalizeRecords(res.data)

        // 映射客户记录为客户接口
        customerList.value = customerArray.map((item, index) => {
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

          // 映射客户记录为客户接口
          const customer: Customer = {
            id: typeof record.id === 'number' ? record.id : index + 1,
            name: getString(['name']),
            company: getString(['company']),
            contact: getString(['contact']),
            phone: getString(['phone']),
            createTime: getString(['time']),
          }
          return customer
        })
      } else {
        console.warn('获取客户列表返回异常:', res.msg)
      }
    } catch (error) {
      console.error('获取客户列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const createCustomer = async (data: CustomerData): Promise<boolean> => {
    loading.value = true
    try {
      const res = await createCustomerApi(data)
      if (res.code === 200) {
        const dataRecord = (res.data as unknown as Record<string, unknown>) || {}
        const getString = (keys: string[]) => {
          for (const key of keys) {
            const value = dataRecord[key]
            if (typeof value === 'string') {
              return value
            }
            if (typeof value === 'number') {
              return String(value)
            }
          }
          return ''
        }

        const newCustomer: Customer = {
          id: typeof dataRecord.id === 'number' ? dataRecord.id : Date.now(),
          name: getString(['name']) || data.name,
          company: getString(['company']) || data.company,
          contact: getString(['contact']) || data.contact,
          phone: getString(['phone']) || data.phone,
          createTime:
            getString(['time']) || new Date().toISOString().slice(0, 19).replace('T', ' '),
        }
        customerList.value.unshift(newCustomer)
        return true
      }
      return false
    } catch (error) {
      console.error('创建客户失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteCustomer = async (id: number): Promise<boolean> => {
    loading.value = true
    try {
      const res = await deleteCustomerApi(id)
      if (res.code === 200) {
        customerList.value = customerList.value.filter((item) => item.id !== id)
        return true
      }
      return false
    } catch (error) {
      console.error('删除客户失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  const batchDeleteCustomers = async (ids: number[]): Promise<boolean> => {
    loading.value = true
    try {
      const res = await batchDeleteCustomersApi(ids)
      if (res.code === 200) {
        customerList.value = customerList.value.filter((item) => !ids.includes(item.id))
        return true
      }
      return false
    } catch (error) {
      console.error('批量删除客户失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    customerList,
    loading,
    fetchCustomers,
    createCustomer,
    deleteCustomer,
    batchDeleteCustomers,
  }
}
