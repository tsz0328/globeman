import { ref } from 'vue'
import { createUserApi, getUsersApi, deleteUserApi } from '@/api/UserApi'

export interface User {
  id: number
  account: string
  name: string
  company: string
  role: string
  createTime: string
}

export interface UserFormData {
  account: string
  password: string
  name: string
  company: string
  role: string
}

export function useUser() {
  const userList = ref<User[]>([])
  const loading = ref(false)

  // 从服务器获取用户列表
  const fetchUsers = async () => {
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
            role: getString(['role', 'userRole']),
            createTime: getString(['createTime', 'create_time', 'createdAt', 'created_at', 'time']),
          }
          return user
        })
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
  // 支持创建新用户并更新用户列表
  const createUser = async (data: UserFormData): Promise<boolean> => {
    loading.value = true
    try {
      const res = await createUserApi(data)
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

        // 映射新用户记录为 User 类型
        // 处理 id、userId、account、name、company、role、createTime 等字段
        // 支持嵌套对象和数组
        const newUser: User = {
          id: typeof dataRecord.id === 'number' ? dataRecord.id : Date.now(),
          account: getString(['account', 'username']) || data.account,
          name: getString(['name', 'fullName']) || data.name,
          company: getString(['company', 'companyName']) || data.company,
          role: getString(['role', 'userRole']) || data.role,
          createTime:
            getString(['createTime', 'create_time', 'createdAt', 'created_at']) ||
            new Date().toLocaleString('zh-CN'),
        }
        userList.value.unshift(newUser)
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

  // 更新用户
  // 支持更新用户信息并更新用户列表
  const updateUser = async (id: number, data: Partial<Omit<User, 'id'>>): Promise<boolean> => {
    loading.value = true
    try {
      const index = userList.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        userList.value[index] = { ...userList.value[index], ...data } as User
      }
      return true
    } catch (error) {
      console.error('更新用户失败:', error)
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

  // 批量删除用户
  // 支持批量删除用户并更新用户列表
  const batchDeleteUsers = async (ids: number[]): Promise<boolean> => {
    loading.value = true
    try {
      userList.value = userList.value.filter((u) => !ids.includes(u.id))
      return true
    } catch (error) {
      console.error('批量删除用户失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return { userList, loading, fetchUsers, createUser, updateUser, deleteUser, batchDeleteUsers }
}
