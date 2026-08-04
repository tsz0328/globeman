import { ref } from 'vue'
import {
  getProjectsApi,
  createProjectApi,
  deleteProjectApi,
} from '@/api/project/ProjectApi'
import { sortByCreateTimeDesc, formatDateTime } from '@/utils/sort'
import { generateTypedId } from '@/utils/idGenerator'

// 项目接口
export interface Project {
  id: string
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
  id?: string
  name: string
  type: string
  leaderAccount: string
  customer: string
  contact: string
  time?: string
}

const projectList = ref<Project[]>([])
const loading = ref(false)

// 从记录中按候选 key 顺序读取字符串（兼容字符串/数字）
const getString = (record: Record<string, unknown>, keys: string[]): string => {
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

// 将后端记录（/project/get 列表项或 /project/create 返回值）映射为前端 Project
// 字段名兼容多种命名：name/projectName、type/projectType、leader/leader_account、
// company/cooperativeUnit、contact、creator/creator_account、customer、time/createTime、status/state
const mapRecordToProject = (record: Record<string, unknown>, _index: number): Project => {
  return {
    id:
      typeof record.id === 'string'
        ? record.id
        : typeof record.id === 'number'
          ? String(record.id)
          : '',
    projectName: getString(record, ['name', 'projectName']),
    projectType: getString(record, ['type', 'projectType']),
    projectManager: getString(record, [
      'leader',
      'leader_account',
      'projectManager',
    ]),
    createTime: formatDateTime(getString(record, ['time', 'createTime'])),
    cooperativeUnit: getString(record, ['company', 'cooperativeUnit']),
    contactPerson: getString(record, ['contact', 'contactPerson', 'contactName', 'Contact']),
    status: getString(record, ['state', 'status']) || '编辑中',
    creator: getString(record, ['creator', 'creatorName', 'creator_account']),
    customer: getString(record, ['customer', 'customerName']),
  }
}

// 按创建时间降序排序（最新在前）
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

        // 映射项目记录为 Project 类型（复用共享映射，兼容多种字段命名）
        // 支持嵌套对象和数组
        projectList.value = sortByCreateTimeDesc(
          projectArray.map((item, index) =>
            mapRecordToProject(item as Record<string, unknown>, index),
          ),
        )
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
      // 生成项目 id：2位 项目类型首字母 + 17位 时间(YYYYMMDDHHmmssSSS) + 5 位随机字母数字
      const projectId = generateTypedId(data.type)
      const res = await createProjectApi({
        id: projectId,
        name: data.name,
        type: data.type,
        leaderAccount: data.leaderAccount,
        customer: data.customer,
        contact: data.contact,
      })
      if (res.code === 200) {
        // 直接用后端返回的新建记录，避免再请求 /project/get 全量刷新
        const newProject = mapRecordToProject(
          res.data as unknown as Record<string, unknown>,
          -1,
        )
        // 插入到列表头部，并按创建时间降序保持时间顺序（最新在前）
        projectList.value = sortByCreateTimeDesc([newProject, ...projectList.value])
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

  // 删除项目
  const deleteProject = async (id: string): Promise<boolean> => {
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

  // 批量删除项目（逐个调用单删接口）
  const batchDeleteProjects = async (ids: string[]): Promise<boolean> => {
    loading.value = true
    try {
      const results = await Promise.all(ids.map((id) => deleteProjectApi(id)))
      if (results.every((res) => res.code === 200)) {
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
    deleteProject,
    batchDeleteProjects,
  }
}
