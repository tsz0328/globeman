<template>
  <WorkPage :loading="loading">
    <template #actions>
      <el-button type="primary" @click="addCustomer">新建客户</el-button>
      <el-button>导入Excel</el-button>
      <el-button>导出Excel</el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0"
        >批量删除</el-button
      >
    </template>

    <template #filter>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="客户名称">
          <el-input v-model="filterForm.name" placeholder="请输入客户名称" style="width: 150px" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="filterForm.contact" placeholder="请输入联系人" style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <el-table
      :data="paginatedData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
      :row-key="getRowKey"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="客户名称" />
      <el-table-column prop="contact" label="联系人" />
      <el-table-column prop="phone" label="联系电话" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="193" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small">查看</el-button>
          <el-button type="warning" size="small" @click="editCustomer(scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" size="small" :loading="deleteLoadingId === scope.row.id" @click="handleDeleteBtn(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="filteredData.length"
      />
    </div>

    <!-- 新增/编辑客户弹窗 -->
    <CustomerForm
      v-model:visible="customerFormVisible"
      :editData="editData"
      :company-names="companyNames"
      @submit="handleCustomerSubmit"
    />
  </WorkPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CustomerForm from '@/views/customer/components/AddCustomerForm.vue'
import type { CustomerFormData } from '@/views/customer/components/AddCustomerForm.vue'
import WorkPage from '@/components/common/WorkPage.vue'
import { useCustomer, type Customer } from '@/composables/admin/useCustomer'
import { useCompany } from '@/composables/admin/useCompany'
import { useTableQuery } from '@/composables/common/useTableQuery'

const { customerList, fetchCustomers, createCustomer, updateCustomer, deleteCustomer, batchDeleteCustomers } =
  useCustomer()
const { companyNames, fetchCompanyNames } = useCompany()

const customerFormVisible = ref(false)
const editData = ref<CustomerFormData | null>(null)
const selectedRows = ref<Customer[]>([])
const loading = ref(false)
const deleteLoadingId = ref<string | number | null>(null)

// 组件挂载时获取客户列表和公司列表
const loadData = async () => {
  loading.value = true
  try {
    // 先拉客户列表 /client/customer/getInfoCustomer
    await fetchCustomers()
    // 客户列表返回后，再拉取筛选用公司下拉 /client/user/getInfoCompany
    await fetchCompanyNames()
  } finally {
    loading.value = false
  }
}
onMounted(loadData)

// 新增客户
const addCustomer = () => {
  editData.value = null
  customerFormVisible.value = true
}

// 编辑客户
const editCustomer = (row: Customer) => {
  editData.value = {
    id: row.id,
    name: row.name,
    company: row.company,
    contact: row.contact,
    phone: row.phone,
  }
  customerFormVisible.value = true
}

// 客户表单提交
const handleCustomerSubmit = async (data: CustomerFormData) => {
  try {
    let success = false
    if (data.id) {
      success = await updateCustomer(data)
    } else {
      success = await createCustomer(data)
    }
    if (success) {
      customerFormVisible.value = false
      // 创建/编辑成功后重新拉取接口数据，不走本地拼接
      await fetchCustomers(true)
      ElMessage.success('操作成功')
    }
  } catch (error) {
    console.error('提交客户失败:', error)
    ElMessage.error('操作失败')
  }
}

// 删除客户
const handleDelete = async (row: Customer) => {
  try {
    await ElMessageBox.confirm(`确定要删除客户"${row.name}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    deleteLoadingId.value = row.id
    const success = await deleteCustomer(row.id)
    if (success) {
      await fetchCustomers(true)
      ElMessage.success('删除成功')
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除客户失败:', error)
      ElMessage.error('删除失败')
    }
  } finally {
    deleteLoadingId.value = null
  }
}

// 获取行key
const getRowKey = (row: Customer) => row.id

// 删除按钮点击
const handleDeleteBtn = (row: unknown) => {
  handleDelete(row as Customer)
}

// 多选事件
const handleSelectionChange = (val: Customer[]) => {
  selectedRows.value = val
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的客户')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个客户吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const ids = selectedRows.value.map((row) => row.id)
    const success = await batchDeleteCustomers(ids)

    if (success) {
      await fetchCustomers(true)
      ElMessage.success(`成功删除 ${selectedRows.value.length} 个客户`)
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

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleReset } = useTableQuery(
  customerList,
  (item: Customer, form) => {
    if (form.name && !item.name.includes(form.name)) return false
    if (form.contact && !item.contact.includes(form.contact)) return false
    return true
  },
  { name: '', contact: '' },
  10,
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
