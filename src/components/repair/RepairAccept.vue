<template>
  <div class="repair-accept">
    <div class="page-header">
      <h2 class="title">维修接单</h2>
      <div class="action-buttons">
        <el-button>导入Excel</el-button>
        <el-button>导出Excel</el-button>
      </div>
    </div>
    <div class="filter-section">
      <div class="filter-item">
        <label for="status">状态：</label>
        <el-select id="status" aria-label="状态" v-model="filterForm.status" placeholder="全部状态" style="width: 150px">
          <el-option label="全部状态" value="" />
          <el-option label="维修中" value="维修中" />
          <el-option label="已完成" value="已完成" />
        </el-select>
      </div>
      <div class="filter-item">
        <label for="equipmentName">设备名称：</label>
        <el-input id="equipmentName" aria-label="设备名称" v-model="filterForm.name" placeholder="请输入设备名称" style="width: 150px" />
      </div>
      <div class="filter-item">
        <label for="equipmentModel">设备型号：</label>
        <el-input id="equipmentModel" aria-label="设备型号" v-model="filterForm.model" placeholder="请输入设备型号" style="width: 150px" />
      </div>
      <div class="filter-item">
        <label for="snCode">SN码：</label>
        <el-input id="snCode" aria-label="SN码" v-model="filterForm.sn" placeholder="请输入SN码" style="width: 150px" />
      </div>
      <div class="filter-item">
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
        <el-table-column prop="name" label="设备名称" />
        <el-table-column prop="model" label="设备型号" />
        <el-table-column prop="manufacturer" label="生产厂家" />
        <el-table-column prop="sn" label="SN码" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="repairman" label="维修人" width="100" />
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
import { getTakenDetailsApi, type TakenDetailData } from '@/api/detail/DetailApi'

interface TakenDetail {
  id: number
  detailsId: number
  projectId: string
  orderId: string
  name: string
  model: string
  manufacturer: string
  sn: string
  status: string
  repairman: string
  repairmanAccount: string
}

const takenList = ref<TakenDetail[]>([])
const currentPage = ref(1)
const pageSize = ref(8)
const selectedRows = ref<TakenDetail[]>([])

const fetchTakenDetails = async () => {
  try {
    const response = await getTakenDetailsApi()
    if (response.code === 200) {
      const data = response.data
      if (typeof data === 'object' && data !== null) {
        takenList.value = Object.values(data).map((item: TakenDetailData) => ({
          id: item.id,
          detailsId: item.details_id,
          projectId: item.project_id,
          orderId: item.order_id,
          name: item.name,
          model: item.model,
          manufacturer: item.manufacturer,
          sn: item.sn,
          status: item.status,
          repairman: item.repairman,
          repairmanAccount: item.repairman_account,
        }))
      } else {
        takenList.value = []
      }
    }
  } catch (error) {
    console.error('获取接单列表失败:', error)
  }
}

onMounted(() => {
  fetchTakenDetails()
})

const viewRepair = (row: TakenDetail) => {
  window.open(`/equipment-repair-information/${row.id}`, '_blank')
}

const getRowKey = (row: TakenDetail) => row.id

const getStatusType = (status: string) => {
  switch (status) {
    case '待维修':
      return 'warning'
    case '维修中':
      return 'primary'
    case '已完成':
      return 'success'
    default:
      return 'info'
  }
}

const handleSelectionChange = (val: TakenDetail[]) => {
  selectedRows.value = val
}

const filterForm = ref({
  status: '',
  name: '',
  model: '',
  sn: '',
})

const filteredData = computed(() => {
  return takenList.value.filter((item) => {
    if (filterForm.value.status && item.status !== filterForm.value.status) {
      return false
    }
    if (filterForm.value.name && !item.name.includes(filterForm.value.name)) {
      return false
    }
    if (filterForm.value.model && !item.model.includes(filterForm.value.model)) {
      return false
    }
    if (filterForm.value.sn && !item.sn.includes(filterForm.value.sn)) {
      return false
    }
    return true
  })
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  filterForm.value = {
    status: '',
    name: '',
    model: '',
    sn: '',
  }
  currentPage.value = 1
}
</script>

<style scoped>
.repair-accept {
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
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
}

.filter-item {
  display: flex;
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
