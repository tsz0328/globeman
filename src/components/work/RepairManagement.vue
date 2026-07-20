<template>
  <div class="repair-management">
    <div class="page-header">
      <h2 class="title">维修管理</h2>
      <div class="action-buttons">
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
      </div>
    </div>
    <div class="filter-section">
      <div class="filter-item">
        <label for="repairStatus">维修状态：</label>
        <el-select
          id="repairStatus"
          aria-label="维修状态"
          v-model="filterForm.status"
          placeholder="全部状态"
          style="width: 100px"
        >
          <el-option label="全部状态" value="" />
          <el-option label="编辑中" value="编辑中" />
          <el-option label="已完成" value="已完成" />
          <el-option label="已取消" value="已取消" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="customer">客户：</label>
        <el-select
          id="customer"
          aria-label="客户"
          v-model="filterForm.customer"
          placeholder="全部客户"
          style="width: 150px"
        >
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
        <label for="customerContact">客户联系人：</label>
        <el-select
          id="customerContact"
          aria-label="客户联系人"
          v-model="filterForm.contactPerson"
          placeholder="全部联系人"
          style="width: 150px"
        >
          <el-option label="全部联系人" value="" />
          <el-option
            v-for="customer in customerList"
            :key="customer.contact"
            :label="customer.contact"
            :value="customer.contact"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="repairLeader">负责人：</label>
        <el-select
          id="repairLeader"
          aria-label="负责人"
          v-model="filterForm.projectManager"
          placeholder="全部负责人"
          style="width: 150px"
        >
          <el-option label="全部负责人" value="" />
          <el-option
            v-for="user in userList"
            :key="user.account"
            :label="user.name"
            :value="user.name"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="createTime">创建时间：</label>
        <el-date-picker
          id="createTime"
          aria-label="创建时间"
          v-model="filterForm.createTime"
          type="date"
          placeholder="选择日期"
          style="width: 150px"
        />
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
        <el-input
          v-model="snCode"
          placeholder="请输入SN码"
          style="width: 250px"
          @keyup.enter="handleTakeOrder"
        />
        <el-button type="primary" @click="handleTakeOrder">接单</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <el-table
        :data="paginatedData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-key="getRowKey"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="projectName" label="维修项目" />
        <el-table-column prop="customer" label="客户" />
        <el-table-column prop="contactPerson" label="客户联系人" width="100" />
        <el-table-column prop="projectManager" label="负责人" width="100" />
        <el-table-column prop="projectType" label="维修类型" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="73">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="viewRepair(scope.row)">查看</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProject, type Project } from '@/composables/useProject'
import { useUser } from '@/composables/useUser'
import { useCustomer } from '@/composables/useCustomer'
import { repairTakeApi } from '@/api/DetailApi'
import { ElMessage } from 'element-plus'

const { projectList: repairList, fetchProjects: fetchRepairs } = useProject()
const { userList, fetchUsers } = useUser()
const { customerList, fetchCustomers } = useCustomer()

const currentPage = ref(1)
const pageSize = ref(8)
const selectedRows = ref<Project[]>([])
const snCode = ref('')

onMounted(() => {
  fetchRepairs()
  fetchUsers()
  fetchCustomers()
})

const viewRepair = (row: Project) => {
  window.open(`/repair-order/${row.id}`, '_blank')
}

const getRowKey = (row: Project) => row.id

const getStatusType = (status: string) => {
  switch (status) {
    case '编辑中':
      return 'primary'
    case '已完成':
      return 'success'
    case '已取消':
      return 'danger'
    default:
      return 'info'
  }
}

const handleSelectionChange = (val: Project[]) => {
  selectedRows.value = val
}

const filteredData = computed(() => {
  return repairList.value.filter((item) => {
    if (filterForm.value.status && item.status !== filterForm.value.status) {
      return false
    }
    if (filterForm.value.customer && item.customer !== filterForm.value.customer) {
      return false
    }
    if (filterForm.value.contactPerson && item.contactPerson !== filterForm.value.contactPerson) {
      return false
    }
    if (
      filterForm.value.projectManager &&
      item.projectManager !== filterForm.value.projectManager
    ) {
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

const filterForm = ref({
  status: '',
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
    status: '',
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
      fetchRepairs()
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

.action-buttons {
  display: flex;
}

.filter-section {
  padding: 20px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-item label {
  font-size: 12px;
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

.total {
  font-size: 14px;
  color: #666;
}

.pagination {
  display: flex;
  gap: 5px;
}

.page-btn {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.page-btn.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.page-btn:disabled {
  cursor: not-allowed;
  color: #ccc;
}
</style>
