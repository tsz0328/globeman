<template>
  <div class="company-management">

    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">公司管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="addCompany">新建公司</el-button>
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0"
          >批量删除</el-button
        >
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label>公司名称:</label>
          <el-input v-model="filterForm.name" placeholder="请输入公司名称" style="width: 200px" />
        </div>
        <div class="filter-item">
          <label>创建时间:</label>
          <el-date-picker
            v-model="filterForm.createTime"
            type="date"
            placeholder="选择日期"
            style="width: 150px"
          />
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-section">
      <el-table
        :data="paginatedData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-key="getRowKey"
      >
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="name" label="公司名称"></el-table-column>
        <el-table-column prop="time" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="viewCompany(scope.row)"
                >编辑</el-button
              >
              <el-button type="danger" size="small" @click="handleDeleteBtn(scope.row)"
                >删除</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-section">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            layout="total, prev, pager, next, jumper"
            :total="filteredData.length"
          ></el-pagination>
        </div>
      </div>
    </div>

    <CompanyForm v-model:visible="companyFormVisible" @submit="handleCompanySubmit" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCompany } from '@/composables/useCompany'
import type { CompanyData } from '@/api/CompanyApi'
import type { CompanyFormData } from '@/api/CompanyApi'
import CompanyForm from './CompanyForm.vue'

const { companyList, fetchCompanies, deleteCompany, batchDeleteCompanies, createCompany } = useCompany()

const companyFormVisible = ref(false)

const currentPage = ref(1)
const pageSize = ref(8)
const selectedRows = ref<CompanyData[]>([])

const filterForm = ref({
  name: '',
  createTime: null,
})

onMounted(() => {
  fetchCompanies()
})

const filteredData = computed(() => {
  return companyList.value.filter((item) => {
    if (filterForm.value.name && !item.name.includes(filterForm.value.name)) {
      return false
    }
    if (filterForm.value.createTime) {
      const filterDate = new Date(filterForm.value.createTime)
      const itemDate = new Date(item.time || '')
      if (filterDate.toDateString() !== itemDate.toDateString()) {
        return false
      }
    }
    return true
  })
})

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterForm.value = {
    name: '',
    createTime: null,
  }
  currentPage.value = 1
}

const addCompany = () => {
  companyFormVisible.value = true
}

const handleCompanySubmit = async (data: CompanyFormData) => {
  const success = await createCompany(data)
  if (success) {
    ElMessage.success('创建成功')
  } else {
    ElMessage.error('创建失败')
  }
}

const viewCompany = (row: CompanyData) => {
  ElMessage.info('编辑公司: ' + row.name)
}

const handleDelete = async (row: CompanyData) => {
  try {
    await ElMessageBox.confirm('确定要删除公司"' + row.name + '"吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const success = await deleteCompany(row.id || 0)
    if (success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getRowKey = (row: CompanyData) => row.id

const handleDeleteBtn = (row: unknown) => {
  handleDelete(row as CompanyData)
}

const handleSelectionChange = (val: CompanyData[]) => {
  selectedRows.value = val
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的公司')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定要删除选中的 ' + selectedRows.value.length + ' 个公司吗？',
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const ids = selectedRows.value.map((row) => row.id || 0)
    const success = await batchDeleteCompanies(ids)

    if (success) {
      ElMessage.success('成功删除 ' + selectedRows.value.length + ' 个公司')
      selectedRows.value = []
    } else {
      ElMessage.error('批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})
</script>

<style scoped>
.company-management {
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
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-section {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}
</style>
