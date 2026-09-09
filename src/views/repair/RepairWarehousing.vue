<template>
  <WorkPage :loading="loading">
    <template #actions>
      <el-button>导入Excel</el-button>
      <!-- 导出范围与表格勾选一致：未勾选时置灰禁用 -->
      <el-dropdown
        trigger="click"
        :disabled="selectedRows.length === 0"
        @command="handleExportCommand"
      >
        <el-button :loading="exportLoading" :disabled="selectedRows.length === 0">
          导出Excel<el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="single">整合为单个文件</el-dropdown-item>
            <el-dropdown-item command="separate">多个文件（逐个下载）</el-dropdown-item>
            <el-dropdown-item command="zip">多个文件（打包 zip）</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
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
      <!-- reserve-selection：配合 row-key 跨页保留勾选，否则翻页会清空已选订单导致导出不全 -->
      <el-table-column type="selection" width="50" :reserve-selection="true" />
      <el-table-column prop="name" label="订单名称" />
      <el-table-column prop="customer" label="客户" />
      <el-table-column prop="contact" label="客户联系人" width="120" />
      <el-table-column prop="manager" label="负责人" width="120" />
      <el-table-column prop="time" label="创建时间" width="180" />
      <el-table-column label="操作" width="109" fixed="right">
        <template #default="scope">
          <el-tooltip content="查看/修改" placement="top">
            <el-button type="primary" size="small" icon="Edit" @click="viewRepair(scope.row)" />
          </el-tooltip>
          <el-tooltip content="添加SN码" placement="top">
            <el-button
              type="success"
              size="small"
              icon="CirclePlus"
              @click="handleInbound(scope.row)"
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

    <RepairOrderDetailDialog
      v-model="dialogVisible"
      :order="selectedOrder"
      :details="selectedOrderDetails"
      @details-changed="handleDetailsChanged"
    />
    <RepairWarehouseInOrderDeviceDialog
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
import RepairOrderDetailDialog from '@/views/repair/components/RepairOrderDetailDialog.vue'
import RepairWarehouseInOrderDeviceDialog from '@/views/repair/components/RepairWarehouseInOrderDeviceDialog.vue'
import WorkPage from '@/components/common/WorkPage.vue'
import type { Order } from '@/composables/order/useOrder'
import { useTableQuery } from '@/composables/common/useTableQuery'
import { ArrowDown } from '@element-plus/icons-vue'
import { notify } from '@/utils/message'
import {
  exportRepairOrdersToExcel,
  exportRepairOrdersToSeparateFiles,
  exportRepairOrdersToZip,
} from '@/views/repair/utils/repairExcel'

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

// === 导出 Excel：订单头 + 设备明细（含 SN 码）===
// 导出范围 = 表格勾选的订单（selection 列开了 reserve-selection，跨页勾选会累积）。
// 未勾选任何订单时按钮已置灰，这里再兜一层防御。
const exportLoading = ref(false)

type ExportMode = 'single' | 'separate' | 'zip'

// el-dropdown 的 command 回调签名是 (command: string | number | object) => void，
// 这里按宽类型接收后再收窄，避免与组件声明的 handler 类型冲突
const handleExportCommand = async (command: string | number | object) => {
  const mode = command as ExportMode
  const rows = selectedRows.value
  if (rows.length === 0) return

  exportLoading.value = true
  try {
    const now = new Date()
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

    if (mode === 'single') {
      const count = await exportRepairOrdersToExcel(rows, `维修订单_${stamp}`)
      notify({ type: 'success', message: `已导出 ${count} 个订单到单个文件` })
    } else if (mode === 'separate') {
      const count = await exportRepairOrdersToSeparateFiles(rows)
      notify({
        type: 'success',
        message: `已导出 ${count} 个订单，共 ${count} 个文件；若浏览器拦截连续下载，请改用打包 zip`,
      })
    } else {
      const count = await exportRepairOrdersToZip(rows, `维修订单_${stamp}`)
      notify({ type: 'success', message: `已导出 ${count} 个订单，打包为 zip` })
    }
  } catch (error) {
    console.error('导出维修订单失败:', error)
    notify({ type: 'error', message: '导出失败，请重试' })
  } finally {
    exportLoading.value = false
  }
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
