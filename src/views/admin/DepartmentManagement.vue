<template>
  <WorkPage :loading="loading">
    <template #actions>
      <el-button type="primary" @click="handleAdd">新建部门</el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
    </template>

    <template #filter>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="部门名称">
          <el-input v-model="filterForm.name" placeholder="请输入部门名称" style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <el-table :data="paginatedData" border style="width: 100%" @selection-change="handleSelectionChange"
      :row-key="getRowKey">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="部门名称" />
      <el-table-column label="操作" width="150" fixed="right">
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

    <!-- 新建部门弹窗 -->
    <AddDepartmentForm v-model:visible="addDialogVisible" @success="fetchDepartments" />
  </WorkPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDepartmentsApi, type DepartmentData } from '@/api/admin/DepartmentApi'
import AddDepartmentForm from '@/components/admin/AddDepartmentForm.vue'
import WorkPage from '@/components/common/WorkPage.vue'
import { useTableQuery } from '@/composables/common/useTableQuery'

const tableData = ref<DepartmentData[]>([])
const loading = ref(false)
const selectedRows = ref<DepartmentData[]>([])

// 弹窗
const addDialogVisible = ref(false)

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleReset } = useTableQuery(
  tableData,
  (item: DepartmentData, form) => {
    if (form.name && !item.name.includes(form.name)) return false
    return true
  },
  { name: '' },
  8,
)

// 兼容原模板绑定名
const filteredData = filteredList
const paginatedData = pagedList

const getRowKey = (row: DepartmentData) => row.name

const handleSelectionChange = (rows: DepartmentData[]) => {
  selectedRows.value = rows
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
/* 分页：右对齐，与上方表格留出间距（外层白卡已提供内边距） */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
