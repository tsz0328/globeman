<template>
  <WorkPage :loading="loading">
    <template #actions>
      <el-button type="primary" @click="addCompany">新建公司</el-button>
      <el-button>导入Excel</el-button>
      <el-button>导出Excel</el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
    </template>

    <template #filter>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="公司名称">
          <el-input v-model="filterForm.name" placeholder="请输入公司名称" style="width: 200px"
            @keyup.enter.prevent="handleSearch" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="filterForm.account" placeholder="请输入负责人" style="width: 150px"
            @keyup.enter.prevent="handleSearch" />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker v-model="filterForm.createTime" type="date" placeholder="选择日期" style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <el-table :data="paginatedData" border style="width: 100%" @selection-change="handleSelectionChange"
      :row-key="getRowKey">
      <el-table-column type="selection" width="50"></el-table-column>
      <el-table-column prop="name" label="公司名称"></el-table-column>
      <el-table-column prop="account" label="负责人" width="120"></el-table-column>
      <el-table-column prop="time" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="133">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewCompany(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDeleteBtn(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-section">
      <el-pagination v-model:current-page="currentPage" :page-size="pageSize"
        layout="total, prev, pager, next, jumper" :total="filteredData.length"></el-pagination>
    </div>

    <CompanyForm v-model:visible="companyFormVisible" @submit="handleCompanySubmit" />
  </WorkPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCompany } from '@/composables/admin/useCompany'
import type { CompanyData } from '@/api/admin/CompanyApi'
import type { CompanyFormData } from '@/api/admin/CompanyApi'
import CompanyForm from '@/components/admin/AddCompanyForm.vue'
import WorkPage from '@/components/common/WorkPage.vue'
import { useTableQuery } from '@/composables/common/useTableQuery'

const { companyList, fetchCompanies, deleteCompany, batchDeleteCompanies, createCompany } = useCompany()

const companyFormVisible = ref(false)
const loading = ref(false)
const selectedRows = ref<CompanyData[]>([])

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleSearch, handleReset } = useTableQuery(
  companyList,
  (item: CompanyData, form) => {
    if (form.name && !item.name.includes(form.name)) return false
    if (form.account && !(item.account || '').includes(form.account)) return false
    if (form.createTime) {
      const filterDate = new Date(form.createTime)
      const itemDate = new Date(item.time || '')
      if (filterDate.toDateString() !== itemDate.toDateString()) return false
    }
    return true
  },
  { name: '', account: '', createTime: null },
  8,
)

// 兼容原模板绑定名
const filteredData = filteredList
const paginatedData = pagedList

const loadCompanies = async () => {
  loading.value = true
  try {
    await fetchCompanies()
  } finally {
    loading.value = false
  }
}

onMounted(loadCompanies)


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
  const name = encodeURIComponent(row.name || '')
  const account = encodeURIComponent(row.account || '')
  const time = encodeURIComponent(row.time || '')
  window.open(`/company-detail/${row.id}?name=${name}&account=${account}&time=${time}`, '_blank')
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
      ElMessage.success('成功删除')
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

</script>

<style scoped>
/* 分页：右对齐，与上方表格留出间距（外层白卡已提供内边距） */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
