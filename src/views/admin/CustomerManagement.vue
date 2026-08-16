<template>
  <div class="customer-management" v-loading="loading">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">客户管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="addCustomer">新建客户</el-button>
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
        <label for="customerName">客户名称：</label>
        <el-input
          id="customerName"
          aria-label="客户名称"
          v-model="filterForm.name"
          placeholder="请输入客户名称"
          style="width: 150px"
          @keyup.enter.prevent="handleSearch"
        />
      </div>
      <div class="filter-item">
        <label for="contactPerson">联系人：</label>
        <el-input
          id="contactPerson"
          aria-label="联系人"
          v-model="filterForm.contact"
          placeholder="请输入联系人"
          style="width: 150px"
          @keyup.enter.prevent="handleSearch"
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
        <el-table-column prop="name" label="客户名称" />
        <el-table-column prop="contact" label="联系人" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="193">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small">查看</el-button>
              <el-button type="warning" size="small" @click="editCustomer(scope.row)"
                >编辑</el-button
              >
              <el-button type="danger" size="small" @click="handleDeleteBtn(scope.row)"
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

    <!-- 新增/编辑客户弹窗 -->
    <CustomerForm
      v-model:visible="customerFormVisible"
      :editData="editData"
      :company-names="companyNames"
      @submit="handleCustomerSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CustomerForm from '@/components/admin/AddCustomerForm.vue'
import type { CustomerFormData } from '@/components/admin/AddCustomerForm.vue'
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
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleSearch, handleReset } = useTableQuery(
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
.customer-management {
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
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}
</style>
