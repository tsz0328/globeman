<template>
  <WorkPage :loading="loading">
    <template #actions>
      <el-button type="primary" @click="addUser">新建用户</el-button>
      <el-button>导入Excel</el-button>
      <el-button>导出Excel</el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
    </template>
    <!-- 筛选区域 -->
    <template #filter>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="公司">
          <el-select filterable v-model="filterForm.company" placeholder="全部公司" style="width: 150px">
            <el-option label="全部公司" value="" />
            <el-option v-for="name in companyNames" :key="name" :label="name" :value="name" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-select filterable v-model="filterForm.department" placeholder="全部部门" style="width: 150px">
            <el-option label="全部部门" value="" />
            <el-option v-for="name in departmentNames" :key="name" :label="name" :value="name" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select filterable v-model="filterForm.role" placeholder="全部角色" style="width: 150px">
            <el-option label="全部角色" value="" />
            <el-option v-for="role in roleList" :key="role.role" :label="role.name" :value="role.role" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker v-model="filterForm.createTime" type="date" placeholder="选择日期" style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <!-- 表格区域（落在 WorkPage 默认 slot 的白卡内） -->
    <el-table :data="paginatedData" border style="width: 100%" @selection-change="handleSelectionChange"
        :row-key="getRowKey">
        <el-table-column type="selection" width="50" :selectable="isRowSelectable" />
        <el-table-column prop="account" label="账号" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column v-if="!notAdminRole" prop="company" label="公司" />
        <el-table-column v-if="!notAdminRole" prop="department" label="部门" />
        <el-table-column prop="role" label="角色" :width="notAdminRole ? 'auto' : 120" />
        <el-table-column label="状态" width="69">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="danger">禁用</el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" :width="notAdminRole ? 'auto' : 180" />
        <el-table-column label="操作" width="193" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewUser(scope.row)">查看</el-button>
            <el-button :type="scope.row.status === 0 ? 'success' : 'warning'" size="small"
              :loading="statusLoadingId === scope.row.id" @click="handleToggleStatus(scope.row)" :disabled="scope.row.role === 'admin'">
              {{ scope.row.status === 0 ? '启用' : '禁用' }}
            </el-button>
            <el-button type="danger" size="small" :loading="deleteLoadingId === scope.row.id" @click="handleDeleteBtn(scope.row)"
              :disabled="scope.row.role === 'admin'">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize"
          layout="total, prev, pager, next, jumper" :total="filteredData.length" />
      </div>

    <!-- 新增用户弹窗 -->
    <UserForm v-model:visible="userFormVisible" :role-list="roleList" :company-names="companyNames"
      :department-names="departmentNames" @submit="handleUserSubmit" />
  </WorkPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import WorkPage from '@/components/common/WorkPage.vue'
import UserForm from '@/views/admin/AddUserForm.vue'
import type { UserFormData } from '@/views/admin/AddUserForm.vue'
import { useUser, type User } from '@/composables/admin/useUser'
import { useRole } from '@/composables/admin/useRole'
import { useCompany } from '@/composables/admin/useCompany'
import { useTableQuery } from '@/composables/common/useTableQuery'
import { useAuthStore } from '@/stores/auth'

const { userList, createUser, fetchUsers, deleteUser, batchDeleteUsers, updateUserStatus } =
  useUser()
const { roleList, fetchRoles } = useRole()
const { companyNames, departmentNames, fetchCompanyNames, fetchDepartmentNames } = useCompany()

const userFormVisible = ref(false)
const selectedRows = ref<User[]>([])
const loading = ref(false)
const deleteLoadingId = ref<string | number | null>(null)
const statusLoadingId = ref<string | number | null>(null)

const auth = useAuthStore()
const notAdminRole = computed(() => auth.role !== 'admin')

// 查看用户详情（跳转到新页面，与项目管理/订单管理一致）
const viewUser = (row: User) => {
  window.open(`/user-detail/${encodeURIComponent(row.account)}`, '_blank')
}

// 组件挂载时获取用户列表
const loadData = async () => {
  loading.value = true
  try {
    // 先拉用户列表 /client/user/get
    await fetchUsers()
    // 用户列表返回后，逐个拉取筛选用下拉数据，避免一次性并发过多请求
    await fetchRoles()
    await fetchCompanyNames()
    await fetchDepartmentNames()
  } finally {
    loading.value = false
  }
}
onMounted(loadData)

// 新增用户
const addUser = () => {
  userFormVisible.value = true
}

// 新增用户提交
const handleUserSubmit = async (data: UserFormData) => {
  try {
    const success = await createUser(data)
    if (success) {
      userFormVisible.value = false
    }
  } catch (error) {
    console.error('创建用户失败:', error)
  }
}

// 删除用户
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户"${row.name}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    deleteLoadingId.value = row.id
    const success = await deleteUser(row.id, row.account)
    if (success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除失败')
    }
  } finally {
    deleteLoadingId.value = null
  }
}

// 获取行key（用于模板调用，避免类型错误）
const getRowKey = (row: User) => row.id

const isRowSelectable = (row: User) => {
  return row.role !== 'admin'
}

// 删除按钮点击（用于模板调用，避免类型错误）
const handleDeleteBtn = (row: unknown) => {
  handleDelete(row as User)
}

// 状态切换：禁用 <-> 启用 共用同一接口（只传 account，后端翻转状态并返回最新状态）
const handleToggleStatus = async (row: User) => {
  try {
    statusLoadingId.value = row.id
    const ok = await updateUserStatus(row.account)
    if (ok) {
      // 本地状态已由 updateUserStatus 根据后端返回值更新（row 与列表项为同一引用）
      ElMessage.success(row.status === 0 ? '已禁用该用户' : '该用户已恢复为正常')
    } else {
      ElMessage.error('操作失败，请重试')
    }
  } catch {
    ElMessage.error('操作失败，请重试')
  } finally {
    statusLoadingId.value = null
  }
}

// 多选事件
const handleSelectionChange = (val: User[]) => {
  selectedRows.value = val
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的用户')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个用户吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const ids = selectedRows.value.map((row) => row.id)
    const success = await batchDeleteUsers(ids)

    if (success) {
      ElMessage.success(`成功删除 ${selectedRows.value.length} 个用户`)
      selectedRows.value = []
    } else {
      ElMessage.error('批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 角色 code -> 中文名 映射，兼容「用户列表 role 为中文名」的情况
const roleCodeMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  roleList.value.forEach((r) => {
    map[r.role] = r.name
  })
  return map
})

// 筛选 + 分页（复用通用组合式，仅保留本视图的筛选谓词）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleReset } =
  useTableQuery(
    userList,
    (item: User, form) => {
      if (form.company && !item.company.includes(form.company)) return false
      if (form.department && !item.department.includes(form.department)) return false
      const selRole = form.role
      if (selRole) {
        // 兼容：用户列表 role 可能是 code（admin）或中文名（超级管理员），二者任一匹配即保留
        if (item.role !== selRole && roleCodeMap.value[selRole] !== item.role) return false
      }
      if (form.createTime) {
        const filterDate = new Date(form.createTime)
        const itemDate = new Date(item.createTime)
        if (filterDate.toDateString() !== itemDate.toDateString()) return false
      }
      return true
    },
    { company: '', department: '', role: '', createTime: null },
  )

// 兼容原模板绑定名
const filteredData = filteredList
const paginatedData = pagedList
</script>

<style scoped>
/* 分页：右对齐，与上方表格留出间距（外层白卡已提供内边距） */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
