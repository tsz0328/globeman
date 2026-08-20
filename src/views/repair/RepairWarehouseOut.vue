<template>
  <WorkPage :loading="loading">
    <template #actions>
      <el-button>导入Excel</el-button>
      <el-button>导出Excel</el-button>
    </template>
    <template #filter>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="出库单号">
          <el-input v-model="filterForm.orderNo" placeholder="请输入出库单号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="客户">
          <el-input v-model="filterForm.customer" placeholder="请输入客户" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="filterForm.manager" placeholder="请输入负责人" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="出库时间">
          <el-date-picker v-model="filterForm.time" type="date" placeholder="选择日期" style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <el-table :data="paginatedData" border style="width: 100%" :row-key="getRowKey">
      <el-table-column prop="orderNo" label="出库单号" width="180" />
      <el-table-column prop="name" label="设备名称" />
      <el-table-column prop="customer" label="客户" />
      <el-table-column prop="manager" label="负责人" width="120" />
      <el-table-column prop="time" label="出库时间" width="180" />
      <el-table-column label="操作" width="73">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewDetail(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-section">
      <el-pagination v-model:current-page="currentPage" :page-size="pageSize"
        layout="total, prev, pager, next, jumper" :total="filteredData.length" />
    </div>
  </WorkPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import WorkPage from '@/components/common/WorkPage.vue'
import { useTableQuery } from '@/composables/common/useTableQuery'

// 维修出库（框架）：数据待接后端接口，字段按业务预留，接入时调整即可
interface RepairWarehouseOutItem {
  id: string
  orderNo: string
  name: string
  customer: string
  manager: string
  time: string
}

const loading = ref(false)
const list = ref<RepairWarehouseOutItem[]>([])

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleSearch, handleReset } = useTableQuery(
  list,
  (item: RepairWarehouseOutItem, form) => {
    if (form.orderNo && !item.orderNo.includes(form.orderNo)) return false
    if (form.customer && !item.customer.includes(form.customer)) return false
    if (form.manager && !item.manager.includes(form.manager)) return false
    if (form.time) {
      const filterDate = new Date(form.time)
      const itemDate = new Date(item.time)
      if (filterDate.toDateString() !== itemDate.toDateString()) return false
    }
    return true
  },
  { orderNo: '', customer: '', manager: '', time: null },
  8,
)

const filteredData = filteredList
const paginatedData = pagedList
const getRowKey = (row: RepairWarehouseOutItem) => row.id

const viewDetail = (row: RepairWarehouseOutItem) => {
  ElMessage.info(`查看出库单：${row.orderNo}`)
}
</script>

<style scoped>
/* 分页：右对齐，与上方表格留出间距（外层白卡已提供内边距） */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
