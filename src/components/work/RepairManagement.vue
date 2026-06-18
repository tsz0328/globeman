<template>
  <div class="repair-management">
    <div class="page-header">
      <h2 class="title">维修管理</h2>
      <div class="action-buttons">
        <el-button type="primary" @click="addRepair">+新建维修</el-button>
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
      </div>
    </div>
    <div class="filter-section">
      <div class="filter-item">
        <label>维修类型：</label>
        <el-select v-model="filterForm.repairType" placeholder="全部类型" style="width: 150px">
          <el-option label="全部类型" value="" />
          <el-option label="设备维修" value="设备维修" />
          <el-option label="电路维修" value="电路维修" />
          <el-option label="管道维修" value="管道维修" />
          <el-option label="其他维修" value="其他" />
        </el-select>
      </div>
      <div class="filter-item">
        <label>维修状态：</label>
        <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 150px">
          <el-option label="全部状态" value="" />
          <el-option label="编辑中" value="编辑中" />
          <el-option label="已完成" value="已完成" />
          <el-option label="已取消" value="已取消" />
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
        <label>客户联系人：</label>
        <el-select v-model="filterForm.contactPerson" placeholder="全部联系人" style="width: 150px">
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
        <label>维修负责人：</label>
        <el-select v-model="filterForm.repairManager" placeholder="全部负责人" style="width: 150px">
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
      <el-table :data="paginatedData" border style="width: 100%">
        <el-table-column prop="repairName" label="维修名称" />
        <el-table-column prop="customer" label="客户" width="120" />
        <el-table-column prop="contactPerson" label="客户联系人" width="100" />
        <el-table-column prop="repairManager" label="负责人" width="100" />
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column prop="repairType" label="维修类型" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="cooperativeUnit" label="归属公司" />
        <el-table-column label="操作" width="100">
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

    <RepairForm
      v-model:visible="repairFormVisible"
      @submit="handleRepairSubmit"
      :user-list="userList"
      :customer-list="customerList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import RepairForm from './AddRepairForm.vue'
import type { RepairFormData } from './AddRepairForm.vue'
import { useRepair, type Repair } from '@/composables/useRepair'
import { useUser } from '@/composables/useUser'
import { useCustomer } from '@/composables/useCustomer'

const { repairList, fetchRepairs, createRepair } = useRepair()
const { userList, fetchUsers } = useUser()
const { customerList, fetchCustomers } = useCustomer()

const currentPage = ref(1)
const pageSize = ref(8)
const repairFormVisible = ref(false)

onMounted(() => {
  fetchRepairs()
  fetchUsers()
  fetchCustomers()
})

const addRepair = () => {
  repairFormVisible.value = true
}

const viewRepair = (row: Repair) => {
  // 跳转到订单管理页面，根据 sourceType 自动隐藏提交和删除按钮
  window.open(`/order/${row.id}?sourceType=repair`, '_blank')
}

const handleRepairSubmit = async (data: RepairFormData) => {
  try {
    const success = await createRepair(data)
    if (success) {
      repairFormVisible.value = false
      ElMessage.success('创建成功')
    }
  } catch (error) {
    console.error('提交维修失败:', error)
  }
}

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

const filteredData = computed(() => {
  return repairList.value.filter((item) => {
    if (filterForm.value.repairType && !item.repairType.includes(filterForm.value.repairType)) {
      return false
    }
    if (filterForm.value.status && item.status !== filterForm.value.status) {
      return false
    }
    if (filterForm.value.customer && item.customer !== filterForm.value.customer) {
      return false
    }
    if (filterForm.value.contactPerson && item.contactPerson !== filterForm.value.contactPerson) {
      return false
    }
    if (filterForm.value.repairManager && item.repairManager !== filterForm.value.repairManager) {
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
  repairType: '',
  status: '',
  customer: '',
  contactPerson: '',
  repairManager: '',
  createTime: null,
})

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterForm.value = {
    repairType: '',
    status: '',
    customer: '',
    contactPerson: '',
    repairManager: '',
    createTime: null,
  }
  currentPage.value = 1
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
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: grid;
  grid-template-columns: 1fr 1fr auto;
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
