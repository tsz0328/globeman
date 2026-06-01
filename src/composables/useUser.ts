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

  const fetchUsers = async () => {
    loading.value = true
    try {
      const res = await getUsersApi()
      if (res.code === 200) {
        const isUserRecord = (value: unknown): value is Record<string, unknown> => {
          return (
            typeof value === 'object' &&
            value !== null &&
            ('account' in value || 'name' in value || 'id' in value)
          )
        }

        const normalizeRecords = (data: unknown): Record<string, unknown>[] => {
          if (Array.isArray(data)) {
            return data as Record<string, unknown>[]
          }
          if (!data || typeof data !== 'object') {
            return []
          }
          const record = data as Record<string, unknown>
          if (record.admin && typeof record.admin === 'object') {
            return [record.admin as Record<string, unknown>]
          }
          const objectValues = Object.values(record).filter(isUserRecord)
          if (objectValues.length > 0) {
            return objectValues
          }
          return [record]
        }

        const userArray = normalizeRecords(res.data)

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
            company: getString(['company', 'companyName', 'organisation', 'org']),
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

  const createUser = async (data: UserFormData): Promise<boolean> => {
    loading.value = true
    try {
      const res = await createUserApi(data)
      if (res.code === 200 && res.data) {
        const dataRecord = res.data as unknown as Record<string, unknown>
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

        const newUser: User = {
          id: res.data.id ?? Date.now(),
          account: res.data.account ?? data.account,
          name: res.data.name ?? data.name,
          company: res.data.company ?? data.company,
          role: res.data.role ?? data.role,
          createTime: getString(['createTime', 'create_time', 'createdAt', 'created_at']),
        }
        if (newUser.createTime) {
          userList.value.unshift(newUser)
        } else {
          await fetchUsers()
        }
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
