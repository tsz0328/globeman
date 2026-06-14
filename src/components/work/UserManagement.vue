<template>
  <div class="project-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">用户管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="addUser">+新建用户</el-button>
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0"
          >批量删除</el-button
        >
      </div>
    </div>
    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-item">
        <label>公司：</label>
        <el-select v-model="filterForm.company" placeholder="全部公司" style="width: 150px">
          <el-option label="全部公司" value="" />
          <el-option
            v-for="company in companyList"
            :key="company.id"
            :label="company.name"
            :value="company.name"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <label>角色：</label>
        <el-select v-model="filterForm.role" placeholder="全部角色" style="width: 150px">
          <el-option label="全部角色" value="" />
          <el-option
            v-for="role in roleList"
            :key="role.id"
            :label="role.name"
            :value="role.role"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <label>创建时间：</label>
        <el-date-picker
          v-model="filterForm.createTime"
          type="date"
          placeholder="选择日期"
          style="width: 150px"
        />
      </div>
      <div class="filter-item">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <el-table
        :data="paginatedData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-key="getRowKey"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="account" label="账号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="company" label="公司" />
        <el-table-column prop="role" label="角色" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="193">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small">查看</el-button>
              <el-button type="warning" size="small">编辑</el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteBtn(scope.row)"
                :disabled="scope.row.role === 'admin'"
                >删除</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          layout="total, prev, pager, next, jumper"
          :total="filteredData.length"
        />
      </div>
    </div>

    <!-- 新增用户弹窗 -->
    <UserForm
      v-model:visible="userFormVisible"
      :role-list="roleList"
      :company-list="companyList"
      @submit="handleUserSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UserForm from './UserForm.vue'
import type { UserFormData } from './UserForm.vue'
import { useUser, type User } from '@/composables/useUser'
import { useRole } from '@/composables/useRole'
import { useCompany } from '@/composables/useCompany'

const { userList, createUser, fetchUsers, deleteUser, batchDeleteUsers } = useUser()
const { roleList, fetchRoles } = useRole()
const { companyList, fetchCompanies } = useCompany()

const currentPage = ref(1)
const pageSize = ref(10)
const userFormVisible = ref(false)
const selectedRows = ref<User[]>([])

// 组件挂载时获取用户列表
onMounted(() => {
  fetchUsers()
  fetchRoles()
  fetchCompanies()
})

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
  }
}

// 获取行key（用于模板调用，避免类型错误）
const getRowKey = (row: User) => row.id

// 删除按钮点击（用于模板调用，避免类型错误）
const handleDeleteBtn = (row: unknown) => {
  handleDelete(row as User)
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

// 筛选后的数据
const filteredData = computed(() => {
  return userList.value.filter((item: User) => {
    if (filterForm.value.company && !item.company.includes(filterForm.value.company)) {
      return false
    }
    if (filterForm.value.role && item.role !== filterForm.value.role) {
      return false
    }
    if (filterForm.value.createTime) {
      const filterDate = new Date(filterForm.value.createTime)
      const itemDate = new Date(item.createTime)
      if (filterDate.toDateString() !== itemDate.toDateString()) {
        return false
      }
    }
    return true
  })
})

// 分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 筛选表单数据
const filterForm = ref({
  company: '',
  role: '',
  createTime: null,
})

// 查询
const handleSearch = () => {
  currentPage.value = 1
}

// 重置
const handleReset = () => {
  filterForm.value = {
    company: '',
    role: '',
    createTime: null,
  }
  currentPage.value = 1
}
</script>

<style scoped>
.project-management {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid black;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.action-buttons {
  display: flex;
}

/* 筛选区域 */
.filter-section {
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item:last-child {
  flex: 1;
  justify-content: flex-end;
}

/* 表格区域 */
.table-section {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 分页区域 */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.total {
  font-size: 14px;
  color: #666;
}

.pagination {
  display: flex;
  gap: 5px;
}

.page-btn {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.page-btn.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.page-btn:disabled {
  cursor: not-allowed;
  color: #ccc;
}
</style>
