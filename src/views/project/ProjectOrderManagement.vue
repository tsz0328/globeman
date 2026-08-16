<template>
  <div class="order-management" v-loading="loading">
    <div class="page-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="title">项目订单管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="addOrder">新建订单</el-button>
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
        <el-button @click="toggleFilter">{{ isFilterVisible ? '隐藏筛选' : '筛选' }}</el-button>
      </div>
    </div>
    <!-- 筛选栏（子组件：自管理筛选 UI，查询/重置事件上抛） -->
    <ProjectOrderFilter
      v-if="isFilterVisible"
      :filter-form="filterForm"
      :managers="managers"
      :customers="orderCustomers"
      @search="handleSearch"
      @reset="handleReset"
    />

    <div class="table-section">
      <!-- 订单表格（子组件：行操作以事件上抛） -->
      <ProjectOrderTable
        :orders="paginatedData"
        @view="goToDetail"
        @detail="goToOrderDetailPage"
        @submit="handleSubmitBtn"
        @delete="handleDeleteBtn"
        @selection-change="handleSelectionChange"
      />

      <div class="pagination-section">
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize"
          layout="total, prev, pager, next, jumper" :total="filteredData.length" />
      </div>
    </div>

    <OrderForm v-model:visible="orderFormVisible" :project-id="projectId" :user-list="managers"
      :customer-list="orderCustomers" @submit="handleOrderSubmit" />

    <!-- 订单详情弹窗 -->
    <OrderDetailDialog v-model="detailDialogVisible" :order="currentOrder" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProject } from '@/composables/project/useProject'
import { useOrder, type Order } from '@/composables/order/useOrder'
import { getOrderManagersApi, getOrderCustomersApi, type OrderManager, type OrderCustomer } from '@/api/order/OrderApi'
import OrderForm from '@/components/order/AddOrderForm.vue'
import OrderDetailDialog from '@/components/order/OrderDetailDialog.vue'
import type { OrderSubmitPayload } from '@/api/order/types'
import { useTableQuery } from '@/composables/common/useTableQuery'
import ProjectOrderFilter from './ProjectOrderFilter.vue'
import ProjectOrderTable from './ProjectOrderTable.vue'

const route = useRoute()
const { fetchProjects } = useProject()
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
const { orderList, createOrder, fetchOrders, deleteOrder, submitOrder } = useOrder()

const managers = ref<OrderManager[]>([])
const fetchOrderManagers = async () => {
  try {
    const res = await getOrderManagersApi()
    if (res.code === 200 && Array.isArray(res.data)) {
      managers.value = res.data
    }
  } catch (error) {
    console.error('获取负责人列表失败:', error)
  }
}

const projectId = ref('')
const orderFormVisible = ref(false)
const selectedRows = ref<Order[]>([])
const isProjectIdValid = ref(true)
const loading = ref(false)
const isFilterVisible = ref(true)
const detailDialogVisible = ref(false)
const currentOrder = ref<Order | null>(null)

const parseProjectId = (id: unknown): string => {
  if (typeof id === 'string') {
    return id
  }
  return ''
}

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleSearch, handleReset } = useTableQuery(
  orderList,
  (item: Order, form) => {
    if (form.status && item.status !== form.status) return false
    if (form.type && item.type !== form.type) return false
    if (form.orderName && !item.name.includes(form.orderName)) return false
    if (form.leaderAccount && item.leaderAccount !== form.leaderAccount) return false
    if (form.customer && item.customer !== form.customer) return false
    if (form.createTime) {
      const filterDate = new Date(form.createTime)
      const itemDate = new Date(item.createTime)
      if (filterDate.toDateString() !== itemDate.toDateString()) return false
    }
    return true
  },
  { status: '', type: '', orderName: '', leaderAccount: '', customer: '', createTime: null },
  8,
)

// 兼容原模板绑定名
const filteredData = filteredList
const paginatedData = pagedList

const goBack = () => {
  window.close()
}

const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value
}

// 打开订单详情弹窗
const goToDetail = (orderId: string) => {
  if (!orderId) {
    ElMessage.warning('无效的订单ID，无法查看订单详情')
    return
  }
  const order = orderList.value.find((o) => o.id === orderId)
  if (!order) {
    ElMessage.warning('未找到订单信息')
    return
  }
  currentOrder.value = order
  detailDialogVisible.value = true
}

// 跳转到项目订单详情页（ProjectOrderDetail.vue），新标签页打开
const goToOrderDetailPage = (row: Order) => {
  if (!row.id) {
    ElMessage.warning('无效的订单ID，无法跳转到订单详情页')
    return
  }
  const encodedName = encodeURIComponent(row.name || '')
  window.open(`/order-detail/${row.id}?name=${encodedName}&projectId=${projectId.value}`, '_blank')
}

const addOrder = () => {
  orderFormVisible.value = true
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

const handleSubmitBtn = async (row: Order) => {
  try {
    await ElMessageBox.confirm(`确定要提交订单"${row.name}"吗？`, '提交确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })

    const success = await submitOrder(row.id)
    if (success) {
      ElMessage.success('提交成功')
      // 重新获取后端订单列表，刷新真实状态（如 已确认），使提交/删除按钮按状态正确禁用
      await fetchOrders(projectId.value)
    } else {
      ElMessage.error('提交失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('提交失败')
    }
  }
}

const handleSelectionChange = (val: Order[]) => {
  selectedRows.value = val
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的订单')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个订单吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

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

const handleOrderSubmit = async (data: OrderSubmitPayload) => {
  try {
    // 拆分出订单数据与设备明细，避免把 details 字段误传进订单创建接口
    const { details, ...orderData } = data
    const success = await createOrder(orderData, details)
    if (success) {
      orderFormVisible.value = false
      ElMessage.success('创建订单成功')
      // 创建成功后重新获取订单列表
      await fetchOrders(projectId.value)
      // 跳转到第一页显示最新订单
      currentPage.value = 1
    } else {
      ElMessage.error('创建订单失败')
    }
  } catch (error) {
    console.error('提交订单失败:', error)
    ElMessage.error('创建订单失败')
  }
}

const loadData = async () => {
  projectId.value = parseProjectId(route.params.id)

  if (!projectId.value) {
    isProjectIdValid.value = false
    ElMessage.error('无效的项目ID')
    return
  }

  loading.value = true
  try {
    // 先拉项目订单列表 /client/order/getOrder
    await fetchOrders(projectId.value)
    // 列表返回后，逐个拉取筛选用下拉数据，避免一次性并发过多请求
    await fetchProjects()        // /client/project/getProject
    await fetchOrderCustomers()  // /client/order/getInfoCustomer
    await fetchOrderManagers()   // /client/order/getInfoManager
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
  gap: 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-right: auto;
}

.action-buttons {
  display: flex;
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
