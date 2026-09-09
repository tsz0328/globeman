import { ref } from 'vue'
import {
  getProjectsApi,
  createProjectApi,
  deleteProjectApi,
} from '@/api/project/ProjectApi'
import { sortByCreateTimeDesc, formatDateTime } from '@/utils/sort'
import { toRecords, pickString } from '@/utils/recordMapper'
import { generateTypedId } from '@/utils/idGenerator'

// === 导出类型 ===
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

export interface ProjectFormData {
  id?: string
  name: string
  type: string
  leaderAccount: string
  customer: string
  contact: string
  time?: string
}

// === 共享状态（模块级单例）===
const projectList = ref<Project[]>([])
const loading = ref(false)

// === 模块级辅助（记录 → 前端 Project 映射，兼容多种字段命名）===
// 取值用共享的 pickString(record, keys)：按候选 key 顺序取第一个字符串/数字。
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
    projectName: pickString(record, ['name', 'projectName']),
    projectType: pickString(record, ['type', 'projectType']),
    projectManager: pickString(record, ['leader', 'leader_account', 'manager', 'projectManager']),
    createTime: formatDateTime(pickString(record, ['time', 'createTime'])),
    cooperativeUnit: pickString(record, ['company', 'cooperativeUnit']),
    contactPerson: pickString(record, ['contact', 'contactPerson', 'contactName', 'Contact']),
    status: pickString(record, ['state', 'status']) || '编辑中',
    creator: pickString(record, ['creator_account', 'account', 'creator', 'creatorName']),
    customer: pickString(record, ['customer', 'customerName']),
  }
}

// === 组合函数（项目管理：列表 / 增删）===
export function useProject() {
  // === 获取项目列表 ===
  const fetchProjects = async () => {
    loading.value = true
    try {
      const res = await getProjectsApi()
      if (res.code === 200) {
        // 归一化后端返回为记录数组，再逐条映射为前端 Project（兼容嵌套/数组/单对象）
        projectList.value = sortByCreateTimeDesc(
          toRecords(res.data).map((record, index) => mapRecordToProject(record, index)),
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

  // === 创建项目 ===
  const createProject = async (data: ProjectFormData): Promise<boolean> => {
    loading.value = true
    try {
      // 生成项目 id：2位 项目类型首字母 + 17位 时间(YYYYMMDDHHmmssSSS) + 5 位随机字母数字
      const projectId = generateTypedId(data.type)
      const res = await createProjectApi({
        id: projectId,
        name: data.name,
        type: data.type,
        customer: data.customer,
        contact: data.contact,
        // 后端 create 接口用 manager 表示负责人账号（前端表单仍称 leaderAccount）
        manager: data.leaderAccount,
      })
      if (res.code === 200) {
        // 若后端返回了完整新建记录，则乐观插入列表头部（即时反馈）；
        // 否则跳过，交由调用方 fetchProjects 全量刷新兜底
        if (res.data && typeof res.data === 'object') {
          try {
            const newProject = mapRecordToProject(res.data as unknown as Record<string, unknown>, -1)
            // 插入到列表头部，并按创建时间降序保持时间顺序（最新在前）
            projectList.value = sortByCreateTimeDesc([newProject, ...projectList.value])
          } catch (e) {
            // 乐观插入失败不影响创建结果（后端已成功），记录日志便于排查，靠调用方 fetchProjects 全量刷新兜底
            console.warn('乐观插入新项目到列表失败（将靠刷新兜底）:', e)
          }
        }
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

  // === 删除项目 ===
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

  // === 批量删除项目（逐个调用单删接口）===
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
