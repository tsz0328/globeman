import { ref } from 'vue'
import {
  getCompaniesApi,
  deleteCompanyApi,
  batchDeleteCompaniesApi,
  createCompanyApi,
  type CompanyData,
  type CompanyFormData,
} from '@/api/CompanyApi'

export function useCompany() {
  const companyList = ref<CompanyData[]>([])
  const loading = ref(false)
  // 获取公司列表
  const fetchCompanies = async () => {
    loading.value = true
    try {
      const res = await getCompaniesApi()
      if (res.code === 200 && res.data) {
        const companies = Array.isArray(res.data) ? res.data : Object.values(res.data)
        companyList.value = companies as CompanyData[]
      }
    } catch (error) {
      console.error('获取公司列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 删除公司
  const deleteCompany = async (id: number): Promise<boolean> => {
    loading.value = true
    try {
      const res = await deleteCompanyApi(id)
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

  // 批量删除公司
  const batchDeleteCompanies = async (ids: number[]): Promise<boolean> => {
    loading.value = true
    try {
      const res = await batchDeleteCompaniesApi(ids)
      if (res.code === 200) {
        companyList.value = companyList.value.filter((c) => !ids.includes(c.id || 0))
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

  const createCompany = async (data: CompanyFormData): Promise<boolean> => {
    loading.value = true
    try {
      const res = await createCompanyApi(data)
      if (res.code === 200 && res.data) {
        companyList.value.unshift(res.data)
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
    loading,
    fetchCompanies,
    deleteCompany,
    batchDeleteCompanies,
    createCompany,
  }
}
