<template>
  <WorkPage :loading="loading">
    <template #actions>
      <el-button>导入Excel</el-button>
      <el-button>导出Excel</el-button>
    </template>
    <template #filter>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="状态">
          <el-select filterable v-model="filterForm.status" placeholder="全部状态" style="width: 150px">
            <el-option label="全部状态" value="" />
            <el-option label="维修中" value="维修中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="filterForm.name" placeholder="请输入设备名称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="设备型号">
          <el-input v-model="filterForm.model" placeholder="请输入设备型号" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="SN码">
          <el-input v-model="filterForm.sn" placeholder="请输入SN码" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

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
            <el-button type="primary" size="small" @click="viewRepair(scope.row)">查看</el-button>
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
  </WorkPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTakenDetailsApi, type TakenDetailData } from '@/api/repair/RepairApi'
import { useTableQuery } from '@/composables/common/useTableQuery'
import WorkPage from '@/components/common/WorkPage.vue'

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
const selectedRows = ref<TakenDetail[]>([])
const loading = ref(false)

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

onMounted(async () => {
  loading.value = true
  try {
    await fetchTakenDetails()
  } finally {
    loading.value = false
  }
})

const viewRepair = (row: TakenDetail) => {
  window.open(`/equipment-repair-information/${row.id}`, '_blank')
}

const getRowKey = (row: TakenDetail) => row.id

import { getStatusTagType as getStatusType } from '@/composables/common/useOrderStatus'

const handleSelectionChange = (val: TakenDetail[]) => {
  selectedRows.value = val
}

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleSearch, handleReset } = useTableQuery(
  takenList,
  (item: TakenDetail, form) => {
    if (form.status && item.status !== form.status) return false
    if (form.name && !item.name.includes(form.name)) return false
    if (form.model && !item.model.includes(form.model)) return false
    if (form.sn && !item.sn.includes(form.sn)) return false
    return true
  },
  { status: '', name: '', model: '', sn: '' },
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
