import { ref } from 'vue'
import {
  getProjectsApi,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
  batchDeleteProjectsApi,
} from '@/api/ProjectApi'

export interface Project {
  id: number
  projectName: string
  projectType: string
  projectManager: string
  createTime: string
  cooperativeUnit: string
  contactPerson: string
  status: string
  creator: string
  customer: string
}

// 项目表单数据接口
export interface ProjectFormData {
  id?: number
  name: string
  type: string
  leaderAccount: string
  customer: string
  contact: string
  time?: string
}

const projectList = ref<Project[]>([])
const loading = ref(false)

export function useProject() {
  const fetchProjects = async () => {
    loading.value = true
    try {
      const res = await getProjectsApi()
      if (res.code === 200) {
        const isProjectRecord = (value: unknown): value is Record<string, unknown> => {
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
          const objectValues = Object.values(record).filter(isProjectRecord)
          if (objectValues.length > 0) {
            return objectValues
          }
          if (isProjectRecord(record)) {
            return [record]
          }
          return []
        }

        // 归一化项目记录数组
        const projectArray = normalizeRecords(res.data)

        // 映射项目记录为 Project 类型
        // 处理 id、name、type、creator、time、customer、contact 等字段
        // 支持嵌套对象和数组
        projectList.value = projectArray.map((item, index) => {
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

          const project: Project = {
            id:
              typeof record.id === 'number'
                ? record.id
                : typeof record.id === 'string'
                  ? parseInt(record.id, 10) || index + 1
                  : index + 1,
            projectName: getString(['name', 'projectName']),
            projectType: getString(['type', 'projectType']),
            projectManager: getString(['leader', 'leaderAccount', 'projectManager']),
            createTime: getString(['time', 'createTime']),
            cooperativeUnit: getString(['company', 'cooperativeUnit']),
            contactPerson: getString(['contact', 'contactPerson', 'contactName', 'Contact']),
            status: getString(['state', 'status']) || '编辑中',
            creator: getString(['creator', 'creatorName']),
            customer: getString(['customer', 'customerName']),
          }
          return project
        })
      } else {
        console.warn('获取项目列表返回异常:', res.msg)
      }
    } catch (error) {
      console.error('获取项目列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 创建项目
  const createProject = async (data: ProjectFormData): Promise<boolean> => {
    loading.value = true
    try {
      const res = await createProjectApi({
        name: data.name,
        type: data.type,
        leaderAccount: data.leaderAccount,
        customer: data.customer,
        contact: data.contact,
      })
      if (res.code === 200) {
        // 创建成功后重新获取项目列表，确保获取到后端返回的真实 id
        await fetchProjects()
        return true
      }
      return false
    } catch (error) {
      console.error('创建项目失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 更新项目
  const updateProject = async (id: number, data: ProjectFormData): Promise<boolean> => {
    loading.value = true
    try {
      const res = await updateProjectApi(id, data)
      if (res.code === 200) {
        const index = projectList.value.findIndex((p) => p.id === id)
        if (index !== -1) {
          const oldProject = projectList.value[index]
          if (oldProject) {
            projectList.value[index] = {
              ...oldProject,
              projectName: data.name,
              projectType: data.type,
              projectManager: data.leaderAccount,
              cooperativeUnit: data.customer,
              contactPerson: data.contact,
            }
          }
        }
        return true
      }
      return false
    } catch (error) {
      console.error('更新项目失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 删除项目
  const deleteProject = async (id: number): Promise<boolean> => {
    loading.value = true
    try {
      const res = await deleteProjectApi(id)
      if (res.code === 200) {
        projectList.value = projectList.value.filter((p) => p.id !== id)
        return true
      }
      return false
    } catch (error) {
      console.error('删除项目失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 批量删除项目
  const batchDeleteProjects = async (ids: number[]): Promise<boolean> => {
    loading.value = true
    try {
      const res = await batchDeleteProjectsApi(ids)
      if (res.code === 200) {
        projectList.value = projectList.value.filter((p) => !ids.includes(p.id))
        return true
      }
      return false
    } catch (error) {
      console.error('批量删除项目失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    projectList,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    batchDeleteProjects,
  }
}
