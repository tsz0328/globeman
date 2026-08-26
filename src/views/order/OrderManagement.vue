<template>
  <WorkPage :loading="loading">
    <template #actions>
      <el-button type="primary" @click="openCreateForm">创建订单</el-button>
      <el-button>导入Excel</el-button>
      <el-button>导出Excel</el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0"
        >批量删除</el-button
      >
      <el-button @click="toggleFilter">{{ isFilterVisible ? '隐藏筛选' : '筛选' }}</el-button>
    </template>

    <template #filter v-if="isFilterVisible">
      <el-form :inline="true" @submit.prevent>
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
        <el-form-item label="订单名称">
          <el-input
            v-model="filterForm.orderName"
            placeholder="请输入订单名称"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select
            filterable
            v-model="filterForm.leaderAccount"
            placeholder="全部负责人"
            style="width: 150px"
          >
            <el-option label="全部负责人" value="" />
            <el-option v-for="m in managers" :key="m.account" :label="m.name" :value="m.account" />
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
        <el-form-item label="归属公司">
          <el-select
            filterable
            v-model="filterForm.company"
            placeholder="全部公司"
            style="width: 200px"
          >
            <el-option label="全部公司" value="" />
            <el-option v-for="name in companyNames" :key="name" :label="name" :value="name" />
          </el-select>
        </el-form-item>
        <el-form-item label="归属项目">
          <el-select filterable style="width: 200px"></el-select>
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

    <!-- 表格 -->
    <el-table
      :data="paginatedData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
      :row-key="getRowKey"
    >
      <el-table-column type="selection" width="39"></el-table-column>
      <el-table-column prop="name" label="订单名称" />
      <el-table-column prop="type" label="订单类型" width="80" />
      <el-table-column prop="customer" label="客户" />
      <el-table-column prop="contact" label="客户联系人" />
      <el-table-column prop="leaderAccount" label="负责人" />
      <el-table-column label="执行地">
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
      <el-table-column prop="createTime" label="创建时间" width="136" />
      <el-table-column label="操作" width="253" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewOrder(scope.row)">查看</el-button>
          <el-button type="success" size="small" :disabled="scope.row.status == SUBMITTED_STATUS" @click="openAssociateDialog(scope.row)">关联</el-button>
          <el-button
            type="primary"
            size="small"
            :loading="submitLoadingId === scope.row.id"
            :disabled="scope.row.status == SUBMITTED_STATUS"
            @click="handleSubmitBtn(scope.row)"
            >提交</el-button
          >
          <el-button type="danger" size="small" :loading="deleteLoadingId === scope.row.id" :disabled="scope.row.status == SUBMITTED_STATUS" @click="handleDeleteBtn(scope.row)">删除</el-button>
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
      ></el-pagination>
    </div>

    <!-- 新建订单弹窗（独立订单管理，不传 projectId，直接创建订单） -->
    <OrderForm
      v-model:visible="orderFormVisible"
      :user-list="managers"
      :customer-list="orderCustomers"
      @submit="handleOrderSubmit"
    />

    <!-- 订单详情弹窗 -->
    <OrderDetailDialog
      v-model="detailDialogVisible"
      :order="currentOrder"
      @details-changed="handleOrderSubmitted"
    />

    <!-- 订单关联项目弹窗 -->
    <el-dialog v-model="associateDialogVisible" title="关联项目" width="480px" @open="resetAssociateForm">
      <el-form label-width="80px">
        <el-form-item label="订单名称">
          <el-input :model-value="associateOrder?.name" disabled />
        </el-form-item>
        <el-form-item label="关联项目" required>
          <el-select
            v-model="associateProjectId"
            filterable
            placeholder="请选择要关联的项目"
            style="width: 100%"
          >
            <el-option
              v-for="p in projectOptions"
              :key="p.id"
              :label="p.projectName"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="associateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="associating" :disabled="!associateProjectId" @click="confirmAssociate">
          确定
        </el-button>
      </template>
    </el-dialog>
  </WorkPage>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import WorkPage from '@/components/common/WorkPage.vue'
import { useProject } from '@/composables/project/useProject'
import { useCompany } from '@/composables/admin/useCompany'
import { useOrder, type Order } from '@/composables/order/useOrder'
import {
  getOrderManagersApi,
  getOrderCustomersApi,
  type OrderManager,
  type OrderCustomer,
} from '@/api/order/OrderApi'
import OrderForm from '@/views/order/components/AddOrderForm.vue'
import OrderDetailDialog from '@/views/order/components/OrderDetailDialog.vue'
import type { OrderSubmitPayload } from '@/api/order/types'
import { useTableQuery } from '@/composables/common/useTableQuery'
import { associateOrderToProjectApi } from '@/api/project/ProjectApi'

// 关联弹窗：当前订单项目下拉选项（来自 /client/project/getProject 的 projectList）
const { projectList } = useProject()
const projectOptions = ref<{ id: string; projectName: string }[]>([])
watch(
  projectList,
  (list) => {
    projectOptions.value = list.map((p) => ({ id: p.id, projectName: p.projectName }))
  },
  { immediate: true },
)

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
const { orderList, createOrder, fetchOrders, deleteOrder, submitOrder } = useOrder()

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
const deleteLoadingId = ref<string | number | null>(null)
const submitLoadingId = ref<string | number | null>(null)

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleReset } =
  useTableQuery(
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
    {
      status: '',
      type: '',
      orderName: '',
      leaderAccount: '',
      customer: '',
      company: '',
      createTime: null,
    },
    8,
  )

// 兼容原模板绑定名
const filteredData = filteredList
const paginatedData = pagedList

const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value
}

const getRowKey = (row: Order) => row.id

import {
  getStatusTagType as getStatusType,
  SUBMITTED_STATUS,
} from '@/composables/common/useOrderStatus'

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

// === 订单关联项目 ===
const associateDialogVisible = ref(false)
const associateOrder = ref<Order | null>(null)
const associateProjectId = ref('')
const associating = ref(false)

const openAssociateDialog = (row: Order) => {
  associateOrder.value = row
  associateProjectId.value = ''
  associateDialogVisible.value = true
}

const resetAssociateForm = () => {
  associateProjectId.value = ''
}

// 确认关联：POST /client/project/orderProject?projectId=&orderId=
const confirmAssociate = async () => {
  if (!associateOrder.value || !associateProjectId.value) return
  associating.value = true
  try {
    const res = await associateOrderToProjectApi(associateProjectId.value, associateOrder.value.id)
    if (res.code === 200) {
      ElMessage.success('关联成功')
      associateDialogVisible.value = false
    } else {
      ElMessage.error(res.msg || '关联失败')
    }
  } catch (error) {
    console.error('关联订单到项目失败:', error)
    ElMessage.error('关联失败')
  } finally {
    associating.value = false
  }
}

// 操作列提交订单（仅编辑中订单显示按钮）：成功后回拉列表刷新状态
const handleSubmitBtn = async (row: Order) => {
  try {
    await ElMessageBox.confirm(`确定要提交订单"${row.name}"吗？`, '提交确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })
    submitLoadingId.value = row.id
    const success = await submitOrder(row.id)
    if (success) {
      ElMessage.success('提交成功')
      await fetchOrders()
    } else {
      ElMessage.error('提交失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('提交失败')
    }
  } finally {
    submitLoadingId.value = null
  }
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
    deleteLoadingId.value = row.id
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
  } finally {
    deleteLoadingId.value = null
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

const loadData = async () => {
  loading.value = true
  try {
    // 先拉订单列表 /client/order/getOrder
    await fetchOrders()
    // 订单列表返回后，逐个拉取筛选用下拉数据，避免一次性并发过多请求
    await fetchOrderCustomers() // /client/order/customer
    await fetchProjects() // /client/project/getProject
    await fetchCompanyNames() // /client/user/getInfoCompany
    await fetchOrderManagers() // /client/order/manager
  } finally {
    loading.value = false
  }
}
onMounted(loadData)
</script>

<style scoped>
/* 分页：右对齐，与上方表格留出间距（外层白卡已提供内边距） */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
