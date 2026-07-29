<template>
  <div class="order-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">订单管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="openCreateForm">创建订单</el-button>
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
        <el-button @click="toggleFilter">{{ isFilterVisible ? '隐藏筛选' : '筛选' }}</el-button>
      </div>
    </div>
    <!-- 筛选栏 -->
    <div class="filter-section" v-if="isFilterVisible">
      <div class="filter-item">
        <label for="orderStatus">订单状态：</label>
        <el-select id="orderStatus" aria-label="订单状态" v-model="filterForm.status" placeholder="全部状态"
          style="width: 150px">
          <el-option label="全部状态" value="" />
          <el-option label="编辑中" value="编辑中" />
          <el-option label="已确认" value="已确认" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="orderType">订单类型：</label>
        <el-select id="orderType" aria-label="订单类型" v-model="filterForm.type" placeholder="全部类型" style="width: 150px">
          <el-option label="全部类型" value="" />
          <el-option label="销售订单" value="销售" />
          <el-option label="采购订单" value="采购" />
          <el-option label="维修订单" value="维修" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="orderName">订单名称：</label>
        <el-input id="orderName" aria-label="订单名称" v-model="filterForm.orderName" placeholder="请输入订单名称"
          style="width: 150px" @keyup.enter.prevent="handleSearch" />
      </div>
      <div class="filter-item">
        <label for="leader">负责人：</label>
        <el-select id="leader" aria-label="负责人" v-model="filterForm.leaderAccount" placeholder="全部负责人"
          style="width: 150px">
          <el-option label="全部负责人" value="" />
          <el-option v-for="user in userList" :key="user.account" :label="user.name" :value="user.account" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="customer">客户：</label>
        <el-select id="customer" aria-label="客户" v-model="filterForm.customer" placeholder="全部客户" style="width: 200px">
          <el-option label="全部客户" value="" />
          <el-option v-for="customer in customerList" :key="customer.name" :label="customer.name"
            :value="customer.name" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="company">归属公司：</label>
        <el-select id="company" aria-label="归属公司" v-model="filterForm.company" placeholder="全部公司" style="width: 200px">
          <el-option label="全部公司" value="" />
          <el-option v-for="company in companyList" :key="company.id" :label="company.name" :value="company.name" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="createTime">创建时间:</label>
        <el-date-picker id="createTime" aria-label="创建时间" v-model="filterForm.createTime" type="date" placeholder="选择日期"
          style="width: 150px" />
      </div>
      <div class="filter-item filter-actions">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>
    <!-- 表格 -->
    <div class="table-section">
      <el-table :data="paginatedData" border style="width: 100%" @selection-change="handleSelectionChange"
        :row-key="getRowKey">
        <el-table-column type="selection" width="39"></el-table-column>
        <el-table-column prop="name" label="订单名称" />
        <el-table-column label="归属项目">
          <template #default="scope">
            {{ getProjectName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="订单类型" width="81" />
        <el-table-column prop="customer" label="客户" />
        <el-table-column prop="contact" label="客户联系人" />
        <el-table-column prop="contactPhone" label="联系人电话" width="111" />
        <el-table-column prop="leader" label="负责人" />
        <el-table-column prop="province" label="执行省份" />
        <el-table-column prop="city" label="执行市" />
        <el-table-column prop="district" label="执行区" />
        <el-table-column prop="address" label="送修地址" />
        <el-table-column prop="status" label="状态" width="81">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="136" />
        <el-table-column label="操作" width="133">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="viewOrder(scope.row)">查看</el-button>
              <el-button type="danger" size="small" @click="handleDeleteBtn(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize"
          layout="total, prev, pager, next, jumper" :total="filteredData.length"></el-pagination>
      </div>
    </div>

    <!-- 新建订单弹窗（独立订单管理，不传 projectId，直接创建订单） -->
    <OrderForm v-model:visible="orderFormVisible" :user-list="userList" :customer-list="customerList"
      @submit="handleOrderSubmit" />

    <!-- 订单详情弹窗 -->
    <OrderDetailDialog v-model="detailDialogVisible" :order="currentOrder" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUser } from '@/composables/useUser'
import { useCustomer } from '@/composables/useCustomer'
import { useProject } from '@/composables/useProject'
import { useCompany } from '@/composables/useCompany'
import { useOrder, type Order } from '@/composables/useOrder'
import OrderForm from './AddOrderForm.vue'
import OrderDetailDialog from './OrderDetailDialog.vue'
import type { OrderSubmitPayload } from './AddOrderForm.vue'

const { userList, fetchUsers } = useUser()
const { customerList, fetchCustomers } = useCustomer()
const { projectList, fetchProjects } = useProject()
const { companyList, fetchCompanies } = useCompany()
const { orderList, createOrder, fetchOrders, deleteOrder } = useOrder()

const currentPage = ref(1)
const pageSize = ref(8)
const orderFormVisible = ref(false)
const selectedRows = ref<Order[]>([])
const detailDialogVisible = ref(false)
const currentOrder = ref<Order | null>(null)
const isFilterVisible = ref(true)

const filterForm = reactive({
  status: '',
  type: '',
  orderName: '',
  leaderAccount: '',
  customer: '',
  company: '',
  createTime: null as string | null,
})

const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value
}

const filteredData = computed(() => {
  return orderList.value.filter((item) => {
    if (filterForm.status && item.status !== filterForm.status) {
      return false
    }
    if (filterForm.type && item.type !== filterForm.type) {
      return false
    }
    if (filterForm.orderName && !item.name.includes(filterForm.orderName)) {
      return false
    }
    if (filterForm.leaderAccount && item.leaderAccount !== filterForm.leaderAccount) {
      return false
    }
    if (filterForm.customer && item.customer !== filterForm.customer) {
      return false
    }
    if (filterForm.company && item.company !== filterForm.company) {
      return false
    }
    if (filterForm.createTime) {
      const filterDate = new Date(filterForm.createTime)
      const itemDate = new Date(item.createTime)
      if (filterDate.toDateString() !== itemDate.toDateString()) {
        return false
      }
    }
    return true
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const getRowKey = (row: Order) => row.id

// 根据订单的 projectId 映射归属项目名称（独立订单无归属项目时显示 -）
const getProjectName = (row: Order): string => {
  if (!row.projectId) return '-'
  const project = projectList.value.find((p) => p.id === row.projectId)
  return project ? project.projectName : '-'
}

const getStatusType = (status: string) => {
  switch (status) {
    case '编辑中':
      return 'warning'
    case '已确认':
      return 'danger'
    default:
      return 'info'
  }
}

const handleSelectionChange = (val: Order[]) => {
  selectedRows.value = val
}

// 打开新建订单弹窗（独立订单管理，不传 projectId → 直接创建订单）
const openCreateForm = () => {
  orderFormVisible.value = true
}

const handleOrderSubmit = async (data: OrderSubmitPayload) => {
  try {
    // data.projectId 在有项目上下文时由 AddOrderForm 带上；独立页不传则省略
    // 拆分出订单数据与设备明细，避免把 details 字段误传进订单创建接口
    const { details, ...orderData } = data
    const success = await createOrder(orderData, details)
    if (success) {
      orderFormVisible.value = false
      ElMessage.success('创建订单成功')
      await fetchOrders()
      currentPage.value = 1
    } else {
      ElMessage.error('创建订单失败')
    }
  } catch (error) {
    console.error('提交订单失败:', error)
    ElMessage.error('创建订单失败')
  }
}

const viewOrder = (row: Order) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

const handleDelete = async (row: Order) => {
  try {
    await ElMessageBox.confirm(`确定要删除订单"${row.name}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const success = await deleteOrder(row.id)
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

const handleDeleteBtn = (row: unknown) => {
  handleDelete(row as Order)
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的订单')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个订单吗？`, '批量删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    let successCount = 0
    for (const row of selectedRows.value) {
      const success = await deleteOrder(row.id)
      if (success) successCount++
    }
    ElMessage.success(`成功删除 ${successCount} 个订单`)
    selectedRows.value = []
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterForm.status = ''
  filterForm.type = ''
  filterForm.orderName = ''
  filterForm.leaderAccount = ''
  filterForm.customer = ''
  filterForm.company = ''
  filterForm.createTime = null
  currentPage.value = 1
}

onMounted(() => {
  Promise.all([fetchUsers(), fetchCustomers(), fetchProjects(), fetchCompanies(), fetchOrders()])
})
</script>

<style scoped>
.order-management {
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
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 标签右对齐、固定宽度，让每列的输入框起点对齐 */
.filter-item label {
  white-space: nowrap;
}

.filter-actions {
  justify-content: flex-start;
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
