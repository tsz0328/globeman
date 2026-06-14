<template>
  <div class="order-management">
    <div class="page-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="title">订单管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="addOrder">+新建订单</el-button>
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0"
          >批量删除</el-button
        >
      </div>
    </div>

    <div class="filter-section">
      <div class="filter-item">
        <label>订单状态：</label>
        <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 150px">
          <el-option label="全部状态" value="" />
          <el-option label="待确认" value="待确认" />
          <el-option label="已确认" value="已确认" />
          <el-option label="已完成" value="已完成" />
        </el-select>
      </div>
      <div class="filter-item">
        <label>订单类型：</label>
        <el-select v-model="filterForm.type" placeholder="全部类型" style="width: 150px">
          <el-option label="全部类型" value="" />
          <el-option label="销售订单" value="销售" />
          <el-option label="采购订单" value="采购" />
          <el-option label="维修订单" value="维修" />
        </el-select>
      </div>
      <div class="filter-item">
        <label>项目名称：</label>
        <el-select v-model="filterForm.projectName" placeholder="全部项目" style="width: 150px">
          <el-option label="全部项目" value="" />
          <el-option
            v-for="project in projectList"
            :key="project.id"
            :label="project.projectName"
            :value="project.projectName"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <label>负责人：</label>
        <el-select v-model="filterForm.leaderAccount" placeholder="全部负责人" style="width: 150px">
          <el-option label="全部负责人" value="" />
          <el-option
            v-for="user in userList"
            :key="user.account"
            :label="user.name"
            :value="user.account"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <label>客户：</label>
        <el-select v-model="filterForm.customer" placeholder="全部客户" style="width: 150px">
          <el-option label="全部客户" value="" />
          <el-option
            v-for="customer in customerList"
            :key="customer.name"
            :label="customer.name"
            :value="customer.name"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <label>创建时间:</label>
        <el-date-picker
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
        @selection-change="handleSelectionChange"
        :row-key="getRowKey"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="订单名称" />
        <el-table-column prop="type" label="订单类型" />
        <el-table-column prop="customer" label="客户" />
        <el-table-column prop="contact" label="客户联系人" />
        <el-table-column prop="contactPhone" label="联系人电话" />
        <el-table-column prop="leader" label="负责人" />
        <el-table-column prop="creator" label="创建人" />
        <el-table-column prop="province" label="执行省份" />
        <el-table-column prop="city" label="执行市" />
        <el-table-column prop="district" label="执行区" />
        <el-table-column prop="company" label="归属公司" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="140">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="viewOrder(scope.row)">查看</el-button>
              <el-button type="danger" size="small" @click="handleDeleteBtn(scope.row)"
                >删除</el-button
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

    <div class="footer-actions">
      <el-button type="primary" @click="goToDetail">下一步 →</el-button>
    </div>

    <OrderForm
      v-model:visible="orderFormVisible"
      :project-id="projectId"
      :user-list="userList"
      :customer-list="customerList"
      @submit="handleOrderSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProject } from '@/composables/useProject'
import { useUser } from '@/composables/useUser'
import { useCustomer } from '@/composables/useCustomer'
import { useOrder, type Order } from '@/composables/useOrder'
import OrderForm from './OrderForm.vue'
import type { OrderFormData } from './OrderForm.vue'

const route = useRoute()
const { projectList, fetchProjects } = useProject()
const { userList, fetchUsers } = useUser()
const { customerList, fetchCustomers } = useCustomer()
const { orderList, createOrder, fetchOrders, deleteOrder } = useOrder()

const currentPage = ref(1)
const pageSize = ref(8)
const projectId = ref(0)
const orderFormVisible = ref(false)
const selectedRows = ref<Order[]>([])
const isProjectIdValid = ref(true)

const parseProjectId = (id: unknown): number => {
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10)
    return !isNaN(parsed) && parsed > 0 ? parsed : 0
  }
  return 0
}

const filterForm = ref({
  status: '',
  type: '',
  projectName: '',
  leaderAccount: '',
  customer: '',
  createTime: null,
})

const filteredData = computed(() => {
  return orderList.value.filter((item) => {
    if (filterForm.value.status && item.status !== filterForm.value.status) {
      return false
    }
    if (filterForm.value.type && item.type !== filterForm.value.type) {
      return false
    }
    if (filterForm.value.projectName) {
      const project = projectList.value.find((p) => p.id === Number(item.projectId))
      if (project?.projectName !== filterForm.value.projectName) {
        return false
      }
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

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const getRowKey = (row: Order) => row.id

const getStatusType = (status: string) => {
  switch (status) {
    case '编辑中':
      return 'primary'
    case '已完成':
      return 'success'
    case '已取消':
      return 'danger'
    case '待确认':
      return 'warning'
    case '已确认':
      return 'primary'
    default:
      return 'info'
  }
}

const goBack = () => {
  window.close()
}

const goToDetail = () => {
  if (!projectId.value || projectId.value === 0) {
    ElMessage.warning('无效的项目ID，无法跳转到项目详情')
    return
  }
  window.open(`/project-detail/${projectId.value}`, '_blank')
}

const addOrder = () => {
  orderFormVisible.value = true
}

const viewOrder = (row: Order) => {
  ElMessage.info(`查看订单: ${row.name}`)
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

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterForm.value = {
    status: '',
    type: '',
    projectName: '',
    leaderAccount: '',
    customer: '',
    createTime: null,
  }
  currentPage.value = 1
}

const handleOrderSubmit = async (data: OrderFormData) => {
  try {
    const success = await createOrder(data)
    if (success) {
      orderFormVisible.value = false
      ElMessage.success('创建订单成功')
    } else {
      ElMessage.error('创建订单失败')
    }
  } catch (error) {
    console.error('提交订单失败:', error)
    ElMessage.error('创建订单失败')
  }
}

onMounted(() => {
  projectId.value = parseProjectId(route.params.id)

  if (projectId.value === 0) {
    isProjectIdValid.value = false
    ElMessage.error('无效的项目ID')
    return
  }

  Promise.all([fetchProjects(), fetchUsers(), fetchCustomers(), fetchOrders(projectId.value)])
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
  background-color: white;
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

.footer-actions {
  display: flex;
  justify-content: flex-end;
  padding: 15px 0;
}
</style>
