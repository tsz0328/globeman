import { ref } from 'vue'
import { getInfoRoleApi, type RoleData } from '@/api/admin/UserApi'

export function useRole() {
  const roleList = ref<RoleData[]>([])

  const fetchRoles = async () => {
    try {
      const res = await getInfoRoleApi()
      if (res.code === 200 && res.data) {
        const roles = Array.isArray(res.data) ? res.data : Object.values(res.data)
        roleList.value = roles as RoleData[]
      }
    } catch (error) {
      console.error('获取角色列表失败:', error)
    }
  }

  return { roleList, fetchRoles }
}
