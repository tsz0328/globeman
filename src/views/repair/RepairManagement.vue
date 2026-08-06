<template>
  <div class="repair-management" v-loading="loading">
    <div class="page-header">
      <h2 class="title">维修管理</h2>
      <div class="action-buttons">
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
      </div>
    </div>
    <div class="filter-section">
      <div class="filter-item">
        <label for="customer">客户：</label>
        <el-select id="customer" aria-label="客户" v-model="filterForm.customer" placeholder="全部客户" style="width: 150px">
          <el-option label="全部客户" value="" />
          <el-option v-for="customer in orderCustomers" :key="customer.name" :label="customer.name"
            :value="customer.name" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="customerContact">客户联系人：</label>
        <el-select id="customerContact" aria-label="客户联系人" v-model="filterForm.contactPerson" placeholder="全部联系人"
          style="width: 150px">
          <el-option label="全部联系人" value="" />
          <el-option v-for="customer in orderCustomers" :key="customer.contact" :label="customer.contact"
            :value="customer.contact" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="repairLeader">负责人：</label>
        <el-select id="repairLeader" aria-label="负责人" v-model="filterForm.projectManager" placeholder="全部负责人"
          style="width: 150px">
          <el-option label="全部负责人" value="" />
          <el-option v-for="m in managers" :key="m.account" :label="m.name" :value="m.account" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="createTime">创建时间：</label>
        <el-date-picker id="createTime" aria-label="创建时间" v-model="filterForm.createTime" type="date" placeholder="选择日期"
          style="width: 150px" />
      </div>
      <div class="filter-item">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 快速接单 -->
    <div class="quick-order">
      <div class="quick-order-title">快速接单：</div>
      <div class="quick-order-content">
        <el-input v-model="snCode" placeholder="请输入SN码" style="width: 250px" @keyup.enter="handleTakeOrder" />
        <el-button type="primary" @click="handleTakeOrder">接单</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <el-table :data="paginatedData" border style="width: 100%" @selection-change="handleSelectionChange"
        @row-dblclick="handleRowDblclick" :row-key="getRowKey">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="订单名称" />
        <el-table-column prop="customer" label="客户" />
        <el-table-column prop="contact" label="客户联系人" width="120" />
        <el-table-column prop="manager" label="负责人" width="120" />
        <el-table-column prop="time" label="创建时间" width="180" />
        <el-table-column label="操作" width="73">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewRepair(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-section">
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize"
          layout="total, prev, pager, next, jumper" :total="filteredData.length" />
      </div>
    </div>

    <OrderDetailDialog v-model="dialogVisible" :order="selectedOrder" :details="selectedOrderDetails" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getOrderManagersApi, getOrderCustomersApi, type OrderManager, type OrderCustomer } from '@/api/order/OrderApi'
import { repairTakeApi, getRepairOrdersApi, type RepairOrderData, type RepairOrderDetail } from '@/api/repair/RepairApi'
import OrderDetailDialog from '@/components/order/OrderDetailDialog.vue'
import type { Order } from '@/composables/order/useOrder'
import { ElMessage } from 'element-plus'

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
    // 打印完整响应，方便在开发者工具 Console / Network 查看真实字段
    console.log('[repair/getOrder] 原始响应：', res)
  } catch (error) {
    console.error('获取维修订单失败:', error)
  }
}

const currentPage = ref(1)
const pageSize = ref(8)
const selectedRows = ref<RepairOrderData[]>([])
const snCode = ref('')
const loading = ref(false)

// 维修订单详情弹窗
const dialogVisible = ref(false)
const selectedOrder = ref<Order | null>(null)
const selectedOrderDetails = ref<RepairOrderDetail[]>([])

const loadData = async () => {
  loading.value = true
  try {
    // 先拉维修列表 /client/repair/getRepairOrders
    await fetchRepairOrders()
    // 维修列表返回后，逐个拉取筛选用下拉数据，避免一次性并发过多请求
    await fetchOrderCustomers() // /client/order/getInfoCustomer
    await fetchOrderManagers()  // /client/order/getInfoManager
  } finally {
    loading.value = false
  }
}
onMounted(loadData)

// 点「查看」弹出订单详情弹窗（映射为 Order，并传入内联设备明细）
const viewRepair = (row: RepairOrderData) => {
  selectedOrder.value = {
    id: row.id,
    projectId: '',
    name: row.name,
    type: '',
    leaderAccount: row.manager,
    creator: '',
    creatorAccount: '',
    customer: row.customer,
    contact: row.contact,
    contactPhone: '',
    province: '',
    city: '',
    district: '',
    address: '',
    company: '',
    status: '',
    createTime: row.time,
  }
  selectedOrderDetails.value = row.details
  dialogVisible.value = true
}

const handleRowDblclick = (row: RepairOrderData) => {
  viewRepair(row)
}

const getRowKey = (row: RepairOrderData) => row.id

const handleSelectionChange = (val: RepairOrderData[]) => {
  selectedRows.value = val
}

const filteredData = computed(() => {
  return rawRepairOrders.value.filter((item) => {
    if (filterForm.value.customer && item.customer !== filterForm.value.customer) {
      return false
    }
    if (filterForm.value.contactPerson && item.contact !== filterForm.value.contactPerson) {
      return false
    }
    if (filterForm.value.projectManager && item.manager !== filterForm.value.projectManager) {
      return false
    }
    if (filterForm.value.createTime) {
      const filterDate = new Date(filterForm.value.createTime)
      const itemDate = new Date(item.time)
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

const filterForm = ref({
  customer: '',
  contactPerson: '',
  projectManager: '',
  createTime: null,
})

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterForm.value = {
    customer: '',
    contactPerson: '',
    projectManager: '',
    createTime: null,
  }
  currentPage.value = 1
}

const handleTakeOrder = async () => {
  const sn = snCode.value.trim()
  if (!sn) {
    ElMessage.warning('请输入SN码')
    return
  }
  try {
    const res = await repairTakeApi(sn)
    if (res.code === 200) {
      ElMessage.success('接单成功')
      snCode.value = ''
      fetchRepairOrders()
    } else {
      ElMessage.error(res.msg || '接单失败')
    }
  } catch {
    ElMessage.error('接单失败')
  }
}
</script>

<style scoped>
.repair-management {
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

.filter-section {
  padding: 20px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
}

.filter-item {
  display: flex;
  align-items: center;
}

.quick-order {
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.quick-order-title {
  font-weight: bold;
  color: #333;
}

.quick-order-content {
  display: flex;
  gap: 12px;
  align-items: center;
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
