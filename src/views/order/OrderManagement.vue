<template>
  <div class="order-management" v-loading="loading">
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
        <el-select filterable id="orderStatus" aria-label="订单状态" v-model="filterForm.status" placeholder="全部状态"
          style="width: 150px">
          <el-option label="全部状态" value="" />
          <el-option label="编辑中" value="编辑中" />
          <el-option label="已确认" value="已确认" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="orderType">订单类型：</label>
        <el-select filterable id="orderType" aria-label="订单类型" v-model="filterForm.type" placeholder="全部类型" style="width: 150px">
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
        <el-select filterable id="leader" aria-label="负责人" v-model="filterForm.leaderAccount" placeholder="全部负责人"
          style="width: 150px">
          <el-option label="全部负责人" value="" />
          <el-option v-for="m in managers" :key="m.account" :label="m.name" :value="m.account" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="customer">客户：</label>
        <el-select filterable id="customer" aria-label="客户" v-model="filterForm.customer" placeholder="全部客户" style="width: 200px">
          <el-option label="全部客户" value="" />
          <el-option v-for="customer in orderCustomers" :key="customer.name" :label="customer.name"
            :value="customer.name" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="company">归属公司：</label>
        <el-select filterable id="company" aria-label="归属公司" v-model="filterForm.company" placeholder="全部公司" style="width: 200px">
          <el-option label="全部公司" value="" />
          <el-option v-for="name in companyNames" :key="name" :label="name" :value="name" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="createTime">归属项目：</label>
        <el-select filterable style="width: 200px"></el-select>
      </div>
      <div class="filter-item">
        <label for="createTime">创建时间:</label>
        <el-date-picker id="createTime" aria-label="创建时间" v-model="filterForm.createTime" type="date" placeholder="选择日期"
          style="width: 150px" />
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
        <el-table-column prop="type" label="订单类型" width="81" />
        <el-table-column prop="customer" label="客户" />
        <el-table-column prop="contact" label="客户联系人" />
        <el-table-column prop="leaderAccount" label="负责人" />
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
    <OrderForm v-model:visible="orderFormVisible" :user-list="managers" :customer-list="orderCustomers"
      @submit="handleOrderSubmit" />

    <!-- 订单详情弹窗 -->
    <OrderDetailDialog v-model="detailDialogVisible" :order="currentOrder" @submitted="handleOrderSubmitted" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProject } from '@/composables/project/useProject'
import { useCompany } from '@/composables/admin/useCompany'
import { useOrder, type Order } from '@/composables/order/useOrder'
import { getOrderManagersApi, getOrderCustomersApi, type OrderManager, type OrderCustomer } from '@/api/order/OrderApi'
import OrderForm from '@/components/order/AddOrderForm.vue'
import OrderDetailDialog from '@/components/order/OrderDetailDialog.vue'
import type { OrderSubmitPayload } from '@/api/order/types'
import { useTableQuery } from '@/composables/common/useTableQuery'

// 订单客户列表（从 /client/order/getInfoCustomer 获取，用于筛选栏下拉和表单自动补全）
const orderCustomers = ref<OrderCustomer[]>([])
const fetchOrderCustomers = async () => {
  try {
    const res = await getOrderCustomersApi()
    if (res.code === 200 && Array.isArray(res.data)) {
      orderCustomers.value = res.data
    }
  } catch (error) {
    console.error('获取订单客户列表失败:', error)
  }
}
const { fetchProjects } = useProject()
const { companyNames, fetchCompanyNames } = useCompany()
const { orderList, createOrder, fetchOrders, deleteOrder } = useOrder()

// 订单负责人列表（从 /client/order/getManager 获取，用于筛选栏下拉选项）
const managers = ref<OrderManager[]>([])
const fetchOrderManagers = async () => {
  try {
    const res = await getOrderManagersApi()
    if (res.code === 200 && Array.isArray(res.data)) {
      managers.value = res.data
    }
  } catch (error) {
    console.error('获取订单负责人列表失败:', error)
  }
}

const orderFormVisible = ref(false)
const selectedRows = ref<Order[]>([])
const detailDialogVisible = ref(false)
const currentOrder = ref<Order | null>(null)
const isFilterVisible = ref(true)
const loading = ref(false)

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleSearch, handleReset } = useTableQuery(
  orderList,
  (item: Order, form) => {
    if (form.status && item.status !== form.status) return false
    if (form.type && item.type !== form.type) return false
    if (form.orderName && !item.name.includes(form.orderName)) return false
    if (form.leaderAccount && item.leaderAccount !== form.leaderAccount) return false
    if (form.customer && item.customer !== form.customer) return false
    if (form.company && item.company !== form.company) return false
    if (form.createTime) {
      const filterDate = new Date(form.createTime)
      const itemDate = new Date(item.createTime)
      if (filterDate.toDateString() !== itemDate.toDateString()) return false
    }
    return true
  },
  { status: '', type: '', orderName: '', leaderAccount: '', customer: '', company: '', createTime: null },
  8,
)

// 兼容原模板绑定名
const filteredData = filteredList
const paginatedData = pagedList

const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value
}


const getRowKey = (row: Order) => row.id

import { getStatusTagType as getStatusType } from '@/composables/common/useOrderStatus'

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

// 弹窗内提交订单成功后：回拉订单列表最新状态，并把 currentOrder 指向更新后的订单对象
// （currentOrder 持有的是打开时的旧引用，fetchOrders 只刷新 orderList，需手动同步 status）
const handleOrderSubmitted = async () => {
  await fetchOrders()
  if (currentOrder.value) {
    const updated = orderList.value.find((o) => o.id === currentOrder.value!.id)
    if (updated) currentOrder.value = updated
  }
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


const loadData = async () => {
  loading.value = true
  try {
    // 先拉订单列表 /client/order/getOrder
    await fetchOrders()
    // 订单列表返回后，逐个拉取筛选用下拉数据，避免一次性并发过多请求
    await fetchOrderCustomers() // /client/order/getInfoCustomer
    await fetchProjects()       // /client/project/getProject
    await fetchCompanyNames()   // /client/user/getInfoCompany
    await fetchOrderManagers()  // /client/order/getInfoManager
  } finally {
    loading.value = false
  }
}
onMounted(loadData)
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
