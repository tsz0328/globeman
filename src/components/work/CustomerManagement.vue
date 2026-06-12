<template>
  <div class="customer-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">客户管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="addCustomer">+新建客户</el-button>
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0"
          >批量删除</el-button
        >
      </div>
    </div>
    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label>客户名称：</label>
          <el-input v-model="filterForm.name" placeholder="请输入客户名称" style="width: 150px" />
        </div>
        <div class="filter-item">
          <label>公司名称：</label>
          <el-input v-model="filterForm.company" placeholder="请输入公司名称" style="width: 150px" />
        </div>
        <div class="filter-item">
          <label>联系人：</label>
          <el-input v-model="filterForm.contact" placeholder="请输入联系人" style="width: 150px" />
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
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
        <el-table-column prop="company" label="公司名称" />
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
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
      @submit="handleCustomerSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CustomerForm from './CustomerForm.vue'
import type { CustomerFormData } from './CustomerForm.vue'
import { useCustomer, type Customer } from '@/composables/useCustomer'

const {
  customerList,
  fetchCustomers,
  createCustomer,
  deleteCustomer,
  batchDeleteCustomers,
} = useCustomer()

const currentPage = ref(1)
const pageSize = ref(10)
const customerFormVisible = ref(false)
const editData = ref<CustomerFormData | null>(null)
const selectedRows = ref<Customer[]>([])

// 组件挂载时获取客户列表
onMounted(() => {
  fetchCustomers()
})

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
      success = await createCustomer(data)
    } else {
      success = await createCustomer(data)
    }
    if (success) {
      customerFormVisible.value = false
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

// 筛选后的数据
const filteredData = computed(() => {
  return customerList.value.filter((item: Customer) => {
    if (filterForm.value.name && !item.name.includes(filterForm.value.name)) {
      return false
    }
    if (filterForm.value.company && !item.company.includes(filterForm.value.company)) {
      return false
    }
    if (filterForm.value.contact && !item.contact.includes(filterForm.value.contact)) {
      return false
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
  name: '',
  company: '',
  contact: '',
})

// 查询
const handleSearch = () => {
  currentPage.value = 1
}

// 重置
const handleReset = () => {
  filterForm.value = {
    name: '',
    company: '',
    contact: '',
  }
  currentPage.value = 1
}
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
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item:first-child,
.filter-item:nth-child(2) {
  flex: 1;
}

.filter-item:last-child {
  flex: 2;
  justify-content: flex-end;
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
