import { ref } from 'vue'
import {
  createUserApi,
  getUsersApi,
  deleteUserApi,
  updateUserStatusApi,
} from '@/api/admin/UserApi'
import { sortByCreateTimeDesc, formatDateTime } from '@/utils/sort'

// === 导出类型 ===
export interface User {
  id: number
  account: string
  name: string
  company: string
  department: string
  role: string
  status: number
  createTime: string
}

export interface UserFormData {
  account: string
  password: string
  name: string
  company: string
  department: string
  role: string
}

// === 组合函数（用户管理：列表 / 增删 / 状态）===
export function useUser() {
  // === 用户列表状态 ===
  const userList = ref<User[]>([])
  const loading = ref(false)

  // 从服务器获取用户列表（带缓存，只在数据为空时请求）
  const fetchUsers = async (force = false) => {
    if (!force && userList.value.length > 0) {
      return
    }
    loading.value = true
    try {
      const res = await getUsersApi()
      if (res.code === 200) {
        const isUserRecord = (value: unknown): value is Record<string, unknown> => {
          return typeof value === 'object' && value !== null && 'id' in value && 'name' in value
        }

        // 归一化数据，处理嵌套对象和数组
        // 支持直接返回数组、对象、单个对象或 null
        const normalizeRecords = (data: unknown): Record<string, unknown>[] => {
          if (Array.isArray(data)) {
            return data as Record<string, unknown>[]
          }
          if (!data || typeof data !== 'object') {
            return []
          }
          const record = data as Record<string, unknown>
          const objectValues = Object.values(record).filter(isUserRecord)
          if (objectValues.length > 0) {
            return objectValues
          }
          if (isUserRecord(record)) {
            return [record]
          }
          return []
        }

        // 归一化用户记录数组
        const userArray = normalizeRecords(res.data)

        // 映射用户记录为 User 类型
        // 处理 id、userId、account、name、company、role、createTime 等字段
        // 支持嵌套对象和数组
        userList.value = userArray.map((item, index) => {
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

          const user: User = {
            id:
              typeof record.id === 'number'
                ? record.id
                : typeof record.userId === 'number'
                  ? record.userId
                  : index + 1,
            account: getString(['account', 'username', 'loginName']),
            name: getString(['name', 'fullName']),
            company: getString(['company', 'companyName', 'organization', 'org']),
            department: getString(['department', 'dept', 'deptName']),
            role: getString(['role', 'userRole']),
            status:
              typeof record.status === 'number'
                ? record.status
                : typeof record.status === 'string' && record.status.trim() !== ''
                  ? Number(record.status)
                  : 1,
            createTime: formatDateTime(
              getString(['createTime', 'create_time', 'createdAt', 'created_at', 'time']),
            ),
          }
          return user
        })
        // 按创建时间降序（最新在前）
        userList.value = sortByCreateTimeDesc(userList.value)
      } else {
        console.warn('获取用户列表返回异常:', res.msg)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 创建用户
  // 成功后重新拉取用户列表，以接口返回的真实数据渲染表格（不使用表单填写的数据拼接）
  const createUser = async (data: UserFormData): Promise<boolean> => {
    loading.value = true
    try {
      const res = await createUserApi(data)
      if (res.code === 200) {
        // 新建成功后强制重新拉取，保证表格展示后端实际落库的数据
        await fetchUsers(true)
        return true
      }
      return false
    } catch (error) {
      console.error('创建用户失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 删除用户
  // 支持删除用户并更新用户列表
  const deleteUser = async (id: number, account: string): Promise<boolean> => {
    loading.value = true
    try {
      const res = await deleteUserApi(account)
      if (res.code === 200) {
        userList.value = userList.value.filter((u) => u.id !== id)
        return true
      }
      return false
    } catch (error) {
      console.error('删除用户失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 批量删除用户（逐个调用单删接口，用 account）
  const batchDeleteUsers = async (ids: number[]): Promise<boolean> => {
    loading.value = true
    try {
      const accounts = userList.value
        .filter((u) => ids.includes(u.id))
        .map((u) => u.account)
      const results = await Promise.all(accounts.map((account) => deleteUserApi(account)))
      if (results.every((res) => res.code === 200)) {
        await fetchUsers(true)
        return true
      }
      return false
    } catch (error) {
      console.error('批量删除用户失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 更新用户状态：仅传 account，后端返回最新 status（0=禁用, 1=正常）
  // 前端从响应中取出 status 并回写到本地列表
  const updateUserStatus = async (account: string): Promise<boolean> => {
    loading.value = true
    try {
      const res = await updateUserStatusApi(account)
      if (res.code === 200) {
        // 从后端返回中提取 status：可能是 number，也可能是 { status } 对象
        const extractStatus = (data: unknown): number => {
          if (typeof data === 'number') return data
          if (data && typeof data === 'object') {
            const s = (data as Record<string, unknown>).status
            if (typeof s === 'number') return s
            if (typeof s === 'string' && s.trim() !== '') return Number(s)
          }
          return 0
        }
        const newStatus = extractStatus(res.data)
        const target = userList.value.find((u) => u.account === account)
        if (target) {
          target.status = newStatus
        }
        return true
      }
      return false
    } catch (error) {
      console.error('更新用户状态失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    userList,
    loading,
    fetchUsers,
    createUser,
    deleteUser,
    batchDeleteUsers,
    updateUserStatus,
  }
}
