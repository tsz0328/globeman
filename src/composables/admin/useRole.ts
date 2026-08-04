import { ref } from 'vue'
import { getInfoRoleApi, type RoleData } from '@/api/admin/UserApi'

// === 组合函数（角色下拉数据，供新建用户/筛选使用）===
export function useRole() {
  // === 角色列表状态 ===
  const roleList = ref<RoleData[]>([])

  // === 获取角色列表 ===
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
