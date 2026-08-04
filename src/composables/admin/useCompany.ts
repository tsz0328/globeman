import { ref } from 'vue'
import {
  getCompaniesApi,
  getInfoCompanyApi,
  getDepartmentInfoApi,
  deleteCompanyApi,
  createCompanyApi,
  type CompanyData,
  type CompanyFormData,
} from '@/api/admin/CompanyApi'
import { toTimeStamp, formatDateTime } from '@/utils/sort'

// 公司列表按创建时间降序（最新在前）；时间字段为 time，时间相同或无效时用 id 兜底
const sortCompaniesByTimeDesc = (list: CompanyData[]): CompanyData[] => {
  return [...list].sort((a, b) => {
    const ta = toTimeStamp(a.time)
    const tb = toTimeStamp(b.time)
    if (ta !== tb) return tb - ta
    return (b.id || 0) - (a.id || 0)
  })
}

export function useCompany() {
  const companyList = ref<CompanyData[]>([])
  const companyNames = ref<string[]>([])
  const departmentNames = ref<string[]>([])
  const loading = ref(false)
  // 获取公司列表
  const fetchCompanies = async () => {
    loading.value = true
    try {
      const res = await getCompaniesApi()
      if (res.code === 200 && res.data) {
        const companies = Array.isArray(res.data) ? res.data : Object.values(res.data)
        // 先按原始 time 排序，再统一格式化为 "YYYY-MM-DD HH:mm:ss" 展示
        companyList.value = sortCompaniesByTimeDesc(companies as CompanyData[]).map((c) => ({
          ...c,
          time: formatDateTime(c.time),
        }))
      }
    } catch (error) {
      console.error('获取公司列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取公司名称列表（仅名称，用于用户管理等页面的「公司」筛选/下拉选项）
  const fetchCompanyNames = async () => {
    loading.value = true
    try {
      const res = await getInfoCompanyApi()
      if (res.code === 200 && Array.isArray(res.data)) {
        companyNames.value = res.data
      }
    } catch (error) {
      console.error('获取公司名称列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取部门名称列表（仅名称，用于用户管理等页面的「部门」筛选/下拉选项）
  const fetchDepartmentNames = async () => {
    loading.value = true
    try {
      const res = await getDepartmentInfoApi()
      if (res.code === 200 && Array.isArray(res.data)) {
        departmentNames.value = res.data
      }
    } catch (error) {
      console.error('获取部门名称列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 删除公司
  const deleteCompany = async (id: number): Promise<boolean> => {
    loading.value = true
    try {
      const res = await deleteCompanyApi([id])
      if (res.code === 200) {
        companyList.value = companyList.value.filter((c) => c.id !== id)
        return true
      }
      return false
    } catch (error) {
      console.error('删除公司失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 批量删除公司（一次请求传 ids 数组给后端）
  const batchDeleteCompanies = async (ids: number[]): Promise<boolean> => {
    loading.value = true
    try {
      const res = await deleteCompanyApi(ids)
      if (res.code === 200) {
        await fetchCompanies()
        return true
      }
      return false
    } catch (error) {
      console.error('批量删除公司失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 创建公司
  const createCompany = async (data: CompanyFormData): Promise<boolean> => {
    loading.value = true
    try {
      const res = await createCompanyApi(data)
      if (res.code === 200) {
        await fetchCompanies()
        return true
      }
      return false
    } catch (error) {
      console.error('创建公司失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    companyList,
    companyNames,
    departmentNames,
    loading,
    fetchCompanies,
    fetchCompanyNames,
    fetchDepartmentNames,
    deleteCompany,
    batchDeleteCompanies,
    createCompany,
  }
}
