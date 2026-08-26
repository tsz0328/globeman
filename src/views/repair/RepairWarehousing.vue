<template>
  <WorkPage :loading="loading">
    <template #actions>
      <el-button>导入Excel</el-button>
      <el-button>导出Excel</el-button>
    </template>

    <!-- 筛选条件 -->
    <template #filter>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="客户">
          <el-select
            filterable
            v-model="filterForm.customer"
            placeholder="全部客户"
            style="width: 150px"
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
        <el-form-item label="客户联系人">
          <el-select
            filterable
            v-model="filterForm.contactPerson"
            placeholder="全部联系人"
            style="width: 150px"
          >
            <el-option label="全部联系人" value="" />
            <el-option
              v-for="customer in orderCustomers"
              :key="customer.contact"
              :label="customer.contact"
              :value="customer.contact"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select
            filterable
            v-model="filterForm.projectManager"
            placeholder="全部负责人"
            style="width: 150px"
          >
            <el-option label="全部负责人" value="" />
            <el-option v-for="m in managers" :key="m.account" :label="m.name" :value="m.account" />
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

    <!-- 表格区域 -->
    <el-table
      :data="paginatedData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @row-dblclick="handleRowDblclick"
      :row-key="getRowKey"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="订单名称" />
      <el-table-column prop="customer" label="客户" />
      <el-table-column prop="contact" label="客户联系人" width="120" />
      <el-table-column prop="manager" label="负责人" width="120" />
      <el-table-column prop="time" label="创建时间" width="180" />
      <el-table-column label="操作" width="133" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewRepair(scope.row)">查看</el-button>
          <el-button type="success" size="small" @click="handleInbound(scope.row)">入库</el-button>
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

    <RepairOrderViewDialog
      v-model="dialogVisible"
      :order="selectedOrder"
      :details="selectedOrderDetails"
      @details-changed="handleDetailsChanged"
    />
    <RepairInboundDialog
      v-model="inboundDialogVisible"
      :order-name="inboundOrderName"
      :order-id="inboundOrderId"
      :details="inboundDetails"
      @refresh="handleInboundRefresh"
    />
  </WorkPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getOrderManagersApi,
  getOrderCustomersApi,
  type OrderManager,
  type OrderCustomer,
} from '@/api/order/OrderApi'
import {
  getRepairOrdersApi,
  type RepairOrderData,
  type RepairOrderDetail,
} from '@/api/repair/RepairApi'
import RepairOrderViewDialog from '@/views/repair/components/RepairOrderViewDialog.vue'
import RepairInboundDialog from '@/views/repair/components/RepairInboundDialog.vue'
import WorkPage from '@/components/common/WorkPage.vue'
import type { Order } from '@/composables/order/useOrder'
import { useTableQuery } from '@/composables/common/useTableQuery'

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

// 维修订单列表（GET /client/repair/getOrder）
const rawRepairOrders = ref<RepairOrderData[]>([])
const fetchRepairOrders = async () => {
  try {
    const res = await getRepairOrdersApi()
    if (res.code === 200 && Array.isArray(res.data)) {
      rawRepairOrders.value = res.data
    }
  } catch (error) {
    console.error('获取维修订单失败:', error)
  }
}

const selectedRows = ref<RepairOrderData[]>([])
const loading = ref(false)

// 维修订单详情弹窗
const dialogVisible = ref(false)
const selectedOrder = ref<Order | null>(null)
const selectedOrderDetails = ref<RepairOrderDetail[]>([])

// 维修入库弹窗：展示该订单 getOrder 返回的 details[] 全部设备
const inboundDialogVisible = ref(false)
const inboundOrderName = ref('')
const inboundOrderId = ref('')
const inboundDetails = ref<RepairOrderDetail[]>([])

const loadData = async () => {
  loading.value = true
  try {
    // 先拉维修列表 /client/repair/getRepairOrders
    await fetchRepairOrders()
    // 维修列表返回后，逐个拉取筛选用下拉数据，避免一次性并发过多请求
    await fetchOrderCustomers() // /client/order/customer
    await fetchOrderManagers() // /client/order/manager
  } finally {
    loading.value = false
  }
}
onMounted(loadData)

// 点「查看」弹出订单详情弹窗（映射为 Order：字段取维修列表接口的完整表头，明细走内联 details）
const viewRepair = (row: RepairOrderData) => {
  selectedOrder.value = {
    id: row.id,
    projectId: row.project ?? '',
    name: row.name,
    type: row.type ?? '',
    leaderAccount: row.manager,
    creator: row.creator ?? '',
    customer: row.customer,
    contact: row.contact,
    contactPhone: row.contactPhone ?? '',
    province: row.province ?? '',
    city: row.city ?? '',
    district: row.district ?? '',
    address: row.address ?? '',
    company: row.company ?? '',
    status: row.status ?? '',
    createTime: row.time,
    details: [],
  }
  selectedOrderDetails.value = row.details
  dialogVisible.value = true
}

const handleRowDblclick = (row: RepairOrderData) => {
  viewRepair(row)
}

// 点「入库」弹出设备清单弹窗：直接展示该订单 getOrder 内联返回的 details[]（全量设备，无需二次请求）
const handleInbound = (row: RepairOrderData) => {
  inboundOrderName.value = row.name
  inboundOrderId.value = row.id
  inboundDetails.value = row.details
  inboundDialogVisible.value = true
}

// 弹窗内「添加SN码」成功后触发：重拉维修列表并刷新弹窗展示的 details（含最新 SN）
const handleInboundRefresh = async () => {
  await fetchRepairOrders()
  const updated = rawRepairOrders.value.find((o) => o.id === inboundOrderId.value)
  if (updated) inboundDetails.value = updated.details
}

// 详情弹窗内新增/删除设备明细后：重拉维修列表并同步弹窗数据，刷新内嵌 details
const handleDetailsChanged = async () => {
  await fetchRepairOrders()
  if (selectedOrder.value) {
    const updated = rawRepairOrders.value.find((o) => o.id === selectedOrder.value!.id)
    if (updated) {
      selectedOrder.value = {
        ...selectedOrder.value!,
        name: updated.name,
        customer: updated.customer,
      }
      selectedOrderDetails.value = updated.details
    }
  }
}

const getRowKey = (row: RepairOrderData) => row.id

const handleSelectionChange = (val: RepairOrderData[]) => {
  selectedRows.value = val
}

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleReset } = useTableQuery(
  rawRepairOrders,
  (item: RepairOrderData, form) => {
    if (form.customer && item.customer !== form.customer) return false
    if (form.contactPerson && item.contact !== form.contactPerson) return false
    if (form.projectManager && item.manager !== form.projectManager) return false
    if (form.createTime) {
      const filterDate = new Date(form.createTime)
      const itemDate = new Date(item.time)
      if (filterDate.toDateString() !== itemDate.toDateString()) return false
    }
    return true
  },
  { customer: '', contactPerson: '', projectManager: '', createTime: null },
  8,
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
