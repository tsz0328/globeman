import { ref } from 'vue'
import {
  getCustomersApi,
  createCustomerApi,
  updateCustomerApi,
  deleteCustomerApi,
  type CustomerData,
} from '@/api/admin/CustomerApi'
import { sortByCreateTimeDesc, formatDateTime } from '@/utils/sort'
import { toRecords, pickString } from '@/utils/recordMapper'

// === 导出类型 ===
export interface Customer {
  id: number
  name: string
  company: string
  contact: string
  phone: string
  createTime: string
}

// === 共享状态（模块级单例，跨组件缓存客户列表）===
const customerList = ref<Customer[]>([])
const loading = ref(false)

// === 组合函数（客户管理：列表 / 增删改）===
export function useCustomer() {
  // === 获取客户列表 ===
  const fetchCustomers = async (force = false) => {
    if (!force && customerList.value.length > 0) {
      return
    }
    loading.value = true
    try {
      const res = await getCustomersApi()
      if (res.code === 200) {
        // 归一化后端返回为记录数组，再逐条映射为前端 Customer
        customerList.value = toRecords(res.data).map((record, index) => {
          const customer: Customer = {
            id: typeof record.id === 'number' ? record.id : index + 1,
            name: pickString(record, ['name']),
            company: pickString(record, ['company']),
            contact: pickString(record, ['contact']),
            phone: pickString(record, ['phone']),
            createTime: formatDateTime(pickString(record, ['time'])),
          }
          return customer
        })
        // 按创建时间降序（最新在前）
        customerList.value = sortByCreateTimeDesc(customerList.value)
      } else {
        console.warn('获取客户列表返回异常:', res.msg)
      }
    } catch (error) {
      console.error('获取客户列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // === 创建客户 ===
  const createCustomer = async (data: CustomerData): Promise<boolean> => {
    loading.value = true
    try {
      const res = await createCustomerApi(data)
      if (res.code === 200) {
        const dataRecord = (res.data as unknown as Record<string, unknown>) || {}

        const newCustomer: Customer = {
          id: typeof dataRecord.id === 'number' ? dataRecord.id : Date.now(),
          name: pickString(dataRecord, ['name']) || data.name,
          company: pickString(dataRecord, ['company']) || data.company,
          contact: pickString(dataRecord, ['contact']) || data.contact,
          phone: pickString(dataRecord, ['phone']) || data.phone,
          createTime: formatDateTime(pickString(dataRecord, ['time']) || new Date()),
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

  // === 更新客户 ===
  const updateCustomer = async (data: CustomerData): Promise<boolean> => {
    loading.value = true
    try {
      const res = await updateCustomerApi(data)
      if (res.code === 200) {
        const dataRecord = (res.data as unknown as Record<string, unknown>) || {}

        const id = typeof dataRecord.id === 'number' ? dataRecord.id : data.id
        if (id == null) {
          return true
        }
        const existing = customerList.value.find((c) => c.id === id)
        const updated: Customer = {
          id,
          name: pickString(dataRecord, ['name']) || data.name,
          company: pickString(dataRecord, ['company']) || data.company,
          contact: pickString(dataRecord, ['contact']) || data.contact,
          phone: pickString(dataRecord, ['phone']) || data.phone,
          createTime: formatDateTime(pickString(dataRecord, ['time'])) || existing?.createTime || '',
        }
        const idx = customerList.value.findIndex((c) => c.id === id)
        if (idx !== -1) {
          customerList.value[idx] = updated
        } else {
          customerList.value.unshift(updated)
        }
        return true
      }
      return false
    } catch (error) {
      console.error('更新客户失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // === 删除客户 ===
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

  // === 批量删除客户（逐个调用单删接口）===
  const batchDeleteCustomers = async (ids: number[]): Promise<boolean> => {
    loading.value = true
    try {
      const results = await Promise.all(ids.map((id) => deleteCustomerApi(id)))
      if (results.every((res) => res.code === 200)) {
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
    updateCustomer,
    deleteCustomer,
    batchDeleteCustomers,
  }
}
