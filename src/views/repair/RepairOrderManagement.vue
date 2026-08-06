<template>
  <div class="repair-order-management" v-loading="loading">
    <div class="page-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="title">维修订单管理</h2>
      <div class="action-buttons">
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
        <el-button @click="toggleFilter">{{ isFilterVisible ? '隐藏筛选' : '筛选' }}</el-button>
      </div>
    </div>

    <div class="filter-section" v-if="isFilterVisible">
      <div class="filter-item">
        <label for="orderStatus">订单状态：</label>
        <el-select id="orderStatus" aria-label="订单状态" v-model="filterForm.status" placeholder="全部状态" style="width: 150px">
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
        <el-input id="orderName" aria-label="订单名称"
          v-model="filterForm.orderName"
          placeholder="请输入订单名称"
          style="width: 150px"
        />
      </div>
      <div class="filter-item">
        <label for="leader">负责人：</label>
        <el-select id="leader" aria-label="负责人" v-model="filterForm.leaderAccount" placeholder="全部负责人" style="width: 150px">
          <el-option label="全部负责人" value="" />
          <el-option v-for="m in managers" :key="m.account" :label="m.name" :value="m.account" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="customer">客户：</label>
        <el-select id="customer" aria-label="客户" v-model="filterForm.customer" placeholder="全部客户" style="width: 200px">
          <el-option label="全部客户" value="" />
          <el-option
            v-for="customer in orderCustomers"
            :key="customer.name"
            :label="customer.name"
            :value="customer.name"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="createTime">创建时间:</label>
        <el-date-picker id="createTime" aria-label="创建时间"
          v-model="filterForm.createTime"
          type="date"
          placeholder="选择日期"
          style="width: 150px"
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="table-section">
      <el-table
        :data="paginatedData"
        border
        style="width: 100%"
        :row-key="getRowKey"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="39" />
        <el-table-column prop="name" label="订单名称" />
        <el-table-column prop="type" label="订单类型" width="81" />
        <el-table-column prop="customer" label="客户" />
        <el-table-column prop="contact" label="客户联系人" />
        <el-table-column prop="contactPhone" label="联系人电话" width="111" />
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
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="73">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                :disabled="scope.row.status === '编辑中'"
                @click="goToRepairOrderDetail(scope.row.id, scope.row.name)"
                >查看</el-button
              >
            </div>
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
    </div>

    <OrderForm
      v-model:visible="orderFormVisible"
      :project-id="repairId"
      :user-list="managers"
      :customer-list="orderCustomers"
      @submit="handleOrderSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProject } from '@/composables/project/useProject'
import { useOrder } from '@/composables/order/useOrder'
import { getOrderManagersApi, getOrderCustomersApi, type OrderManager, type OrderCustomer } from '@/api/order/OrderApi'
import OrderForm from '@/components/order/AddOrderForm.vue'
import type { OrderFormData } from '@/components/order/AddOrderForm.vue'

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
const {
  orderList: repairOrderList,
  createOrder: createRepairOrder,
  fetchOrders: fetchRepairOrders,
} = useOrder()

const managers = ref<OrderManager[]>([])
const loading = ref(false)
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

const currentPage = ref(1)
const pageSize = ref(8)
const repairId = ref('')
const orderFormVisible = ref(false)
const isRepairIdValid = ref(true)
const isFilterVisible = ref(true)
const selectedRows = ref<{ id: number }[]>([])

const parseRepairId = (id: unknown): string => {
  if (typeof id === 'string') {
    return id
  }
  return ''
}

const filterForm = ref({
  status: '',
  type: '',
  orderName: '',
  leaderAccount: '',
  customer: '',
  createTime: null,
})

// 筛选数据
const filteredData = computed(() => {
  return repairOrderList.value.filter((item) => {
    if (filterForm.value.status && item.status !== filterForm.value.status) {
      return false
    }
    if (filterForm.value.type && item.type !== filterForm.value.type) {
      return false
    }
    if (filterForm.value.orderName && !item.name.includes(filterForm.value.orderName)) {
      return false
    }
    if (filterForm.value.leaderAccount && item.leaderAccount !== filterForm.value.leaderAccount) {
      return false
    }
    if (filterForm.value.customer && item.customer !== filterForm.value.customer) {
      return false
    }
    if (filterForm.value.createTime) {
      const filterDate = new Date(filterForm.value.createTime)
      const itemDate = new Date(item.createTime)
      if (filterDate.toDateString() !== itemDate.toDateString()) {
        return false
      }
    }
    return true
  })
})

// 分页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const getRowKey = (row: { id: number }) => row.id

// 获取状态类型
import { getStatusTagType as getStatusType } from '@/composables/common/useOrderStatus'

const goBack = () => {
  window.close()
}

// 切换筛选显示
const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value
}
// 处理选择变化
const handleSelectionChange = (val: { id: number }[]) => {
  selectedRows.value = val
}

// 跳转维修订单详情页
const goToRepairOrderDetail = (orderId: number, orderName: string) => {
  if (!orderId || orderId === 0) {
    ElMessage.warning('无效的订单ID，无法跳转到订单详情')
    return
  }
  const encodedName = encodeURIComponent(orderName)
  window.open(`/repair-order-detail/${orderId}?name=${encodedName}`, '_blank')
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterForm.value = {
    status: '',
    type: '',
    orderName: '',
    leaderAccount: '',
    customer: '',
    createTime: null,
  }
  currentPage.value = 1
}

const handleOrderSubmit = async (data: OrderFormData) => {
  try {
    const success = await createRepairOrder(data)
    if (success) {
      orderFormVisible.value = false
      ElMessage.success('创建订单成功')
      // 创建成功后重新获取订单列表
      await fetchRepairOrders(repairId.value)
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
  repairId.value = parseRepairId(route.params.id)

  if (!repairId.value) {
    isRepairIdValid.value = false
    ElMessage.error('无效的维修ID')
    return
  }

  loading.value = true
  try {
    // 先拉维修订单列表 /client/repair/getRepairOrders
    await fetchRepairOrders(repairId.value)
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
.repair-order-management {
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

.filter-section {
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
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
