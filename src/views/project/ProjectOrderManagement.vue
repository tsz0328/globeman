<template>
  <div class="project-order-page">
    <WorkPage :loading="loading">
      <template #title>
        <el-button
          type="primary"
          @click="goBack"
          size="large"
          icon="arrow-left"
          style="margin-right: 12px; font-size: 16px"
          >返回</el-button
        >
        项目订单管理
      </template>

      <template #actions>
        <el-button type="primary" @click="addOrder">新建订单</el-button>
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0"
          >批量删除</el-button
        >
        <el-button @click="toggleFilter">{{ isFilterVisible ? '隐藏筛选' : '筛选' }}</el-button>
      </template>

      <template #filter v-if="isFilterVisible">
        <el-form :inline="true" @submit.prevent>
          <el-form-item label="订单名称">
            <el-input
              v-model="filterForm.orderName"
              placeholder="请输入订单名称"
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="订单类型">
            <el-select
              filterable
              v-model="filterForm.type"
              placeholder="全部类型"
              style="width: 150px"
            >
              <el-option label="全部类型" value="" />
              <el-option label="销售订单" value="销售" />
              <el-option label="采购订单" value="采购" />
              <el-option label="维修订单" value="维修" />
            </el-select>
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select
              filterable
              v-model="filterForm.status"
              placeholder="全部状态"
              style="width: 150px"
            >
              <el-option label="全部状态" value="" />
              <el-option label="编辑中" value="编辑中" />
              <el-option label="已确认" value="已确认" />
            </el-select>
          </el-form-item>
          <el-form-item label="负责人">
            <el-select
              filterable
              v-model="filterForm.leaderAccount"
              placeholder="全部负责人"
              style="width: 150px"
            >
              <el-option label="全部负责人" value="" />
              <el-option
                v-for="m in managers"
                :key="m.account"
                :label="m.name"
                :value="m.account"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="客户">
            <el-select
              filterable
              v-model="filterForm.customer"
              placeholder="全部客户"
              style="width: 200px"
            >
              <el-option label="全部客户" value="" />
              <el-option
                v-for="customer in orderCustomers"
                :key="customer.name"
                :label="customer.name"
                :value="customer.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="filterForm.createTime"
              type="date"
              placeholder="选择日期"
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </template>

      <!-- 订单表格 -->
      <el-table
        :data="paginatedData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-key="getRowKey"
      >
        <el-table-column type="selection" width="39" :selectable="isRowSelectable" />
        <el-table-column prop="name" label="订单名称" />
        <el-table-column prop="type" label="订单类型" width="81" />
        <el-table-column prop="customer" label="客户" />
        <el-table-column prop="contact" label="客户联系人" />
        <el-table-column prop="contactPhone" label="联系人电话" width="111" />
        <el-table-column prop="leaderAccount" label="负责人" />
        <el-table-column label="执行地" show-overflow-tooltip>
          <template #default="scope">
            {{ [scope.row.province, scope.row.city, scope.row.district].filter(Boolean).join('-') }}
          </template>
        </el-table-column>
        <el-table-column prop="address" label="送修地址" />
        <el-table-column prop="status" label="状态" width="81">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="157" fixed="right">
          <template #default="scope">
            <el-tooltip content="查看/编辑" placement="top">
              <el-button
                type="primary"
                size="small"
                icon="Edit"
                @click="goToDetail(scope.row.id)"
              />
            </el-tooltip>
            <el-tooltip content="提交" placement="top">
              <el-button
                type="success"
                size="small"
                icon="Upload"
                @click="handleSubmitBtn(scope.row)"
                :disabled="scope.row.status === '已确认'"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                type="danger"
                size="small"
                icon="Delete"
                @click="handleDeleteBtn(scope.row)"
                :disabled="scope.row.status === '已确认'"
              />
            </el-tooltip>
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

      <AddOrderForm
        v-model:visible="orderFormVisible"
        :project-id="projectId"
        :user-list="managers"
        :customer-list="orderCustomers"
        @submit="handleOrderSubmit"
      />

      <!-- 订单详情弹窗 -->
      <OrderDetailDialog
        v-model="detailDialogVisible"
        :order="currentOrder"
        @details-changed="handleDetailsChanged"
      />
    </WorkPage>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProject } from '@/composables/project/useProject'
import { useOrder, type Order } from '@/composables/order/useOrder'
import {
  getOrderManagersApi,
  getOrderCustomersApi,
  type OrderManager,
  type OrderCustomer,
} from '@/api/order/OrderApi'
import AddOrderForm from '@/views/order/components/AddOrderForm.vue'
import OrderDetailDialog from '@/views/order/components/OrderDetailDialog.vue'
import WorkPage from '@/components/common/WorkPage.vue'
import type { OrderSubmitPayload } from '@/api/order/types'
import { useTableQuery } from '@/composables/common/useTableQuery'
import {
  getStatusTagType as getStatusType,
  isOrderLocked,
} from '@/composables/common/useOrderStatus'

const getRowKey = (row: Order) => row.id

// 已锁定（已确认）的订单不允许勾选
const isRowSelectable = (row: Order) => {
  return !isOrderLocked(row.status)
}

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
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleReset } = useTableQuery(
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

// 详情弹窗内新增/删除设备明细后：重拉订单列表并同步 currentOrder，刷新内嵌 details
const handleDetailsChanged = async () => {
  await fetchOrders(projectId.value)
  if (currentOrder.value) {
    const updated = orderList.value.find((o) => o.id === currentOrder.value!.id)
    if (updated) currentOrder.value = updated
  }
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
    await fetchProjects() // /client/project/getProject
    await fetchOrderCustomers() // /client/order/getInfoCustomer
    await fetchOrderManagers() // /client/order/getInfoManager
  } finally {
    loading.value = false
  }
}
onMounted(loadData)
</script>

<style scoped>
/* 独立路由页（无 WorkView 外壳）：自带品牌蓝内容场，白卡浮于其上，与工作台内页面观感一致 */
.project-order-page {
  min-height: 100vh;
  box-sizing: border-box;
  background-image: var(--brand-content-bg);
  padding: 24px;
}

/* 分页：右对齐，与上方表格留出间距（外层白卡已提供内边距） */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
