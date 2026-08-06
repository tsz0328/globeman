<template>
  <div class="department-management" v-loading="loading">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="title">部门管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">新建部门</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-section">
      <div class="filter-item">
        <label>部门名称:</label>
        <el-input v-model="filterForm.name" placeholder="请输入部门名称" style="width: 200px"
          @keyup.enter.prevent="handleSearch" />
      </div>
      <div class="filter-item">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-section">
      <el-table :data="paginatedData" border style="width: 100%" @selection-change="handleSelectionChange"
        :row-key="getRowKey">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="部门名称" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-section">
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize"
          layout="total, prev, pager, next, jumper" :total="filteredData.length" />
      </div>
    </div>

    <!-- 新建部门弹窗 -->
    <AddDepartmentForm v-model:visible="addDialogVisible" @success="fetchDepartments" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDepartmentsApi, type DepartmentData } from '@/api/admin/DepartmentApi'
import AddDepartmentForm from '@/components/admin/AddDepartmentForm.vue'

const tableData = ref<DepartmentData[]>([])
const loading = ref(false)
const selectedRows = ref<DepartmentData[]>([])
const currentPage = ref(1)
const pageSize = ref(8)

const filterForm = ref({
  name: '',
})

// 弹窗
const addDialogVisible = ref(false)

const getRowKey = (row: DepartmentData) => row.name

const filteredData = computed(() => {
  return tableData.value.filter((item) => {
    if (filterForm.value.name && !item.name.includes(filterForm.value.name)) {
      return false
    }
    return true
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const handleSelectionChange = (rows: DepartmentData[]) => {
  selectedRows.value = rows
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterForm.value = { name: '' }
  currentPage.value = 1
}

const handleAdd = () => {
  addDialogVisible.value = true
}

const handleEdit = (row: DepartmentData) => {
  console.log('编辑部门:', row)
  ElMessage.info('编辑功能待后端接口对接')
}

const handleDelete = async (row: DepartmentData) => {
  try {
    await ElMessageBox.confirm(`确定要删除部门"${row.name}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    ElMessage.info('删除功能待后端接口对接')
  } catch {
    // 取消
  }
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  const names = selectedRows.value.map((r) => r.name).join('、')
  try {
    await ElMessageBox.confirm(`确定要删除以下 ${selectedRows.value.length} 个部门：${names}？`, '批量删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    ElMessage.info('批量删除功能待后端接口对接')
  } catch {
    // 取消
  }
}

const fetchDepartments = async () => {
  loading.value = true
  try {
    const res = await getDepartmentsApi()
    if (res.code === 200 && res.data) {
      tableData.value = res.data.map((name: string) => ({ name }))
    } else {
      ElMessage.error(res.msg || '获取部门列表失败')
    }
  } catch {
    ElMessage.error('获取部门列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDepartments()
})
</script>

<style scoped>
.department-management {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

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

.table-section {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.pagination-section {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
}
</style>
