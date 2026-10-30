<template>
  <WorkPage :loading="loading">
    <!-- 筛选条件（与维修接单/维修列表一致） -->
    <template #filter>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="工单名称">
          <el-input
            v-model="filterForm.headName"
            placeholder="请输入工单名称"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="设备型号">
          <el-input
            v-model="filterForm.model"
            placeholder="请输入设备型号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="SN码">
          <el-input
            v-model="filterForm.sn"
            placeholder="请输入SN码"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <!-- 表格数据：维修出库 = 已完成、待出库的维修工单 -->
    <el-table :data="paginatedData" border style="width: 100%" :row-key="getRowKey">
      <el-table-column prop="headName" label="工单名称" :min-width="colWidths.headName" show-overflow-tooltip />
      <el-table-column prop="name" label="设备名称" :min-width="colWidths.name" show-overflow-tooltip />
      <el-table-column prop="brand" label="品牌" :min-width="colWidths.brand" show-overflow-tooltip />
      <el-table-column prop="model" label="设备型号" :min-width="colWidths.model" show-overflow-tooltip />
      <el-table-column prop="sn" label="SN码" :min-width="colWidths.sn">
        <template #default="scope">
          {{ scope.row.sn || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="account" label="接单人" :min-width="colWidths.account" />
      <el-table-column label="完成时间" width="137" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.repairTime || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewRepair(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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
import { ref, computed, onMounted } from 'vue'
import WorkPage from '@/components/common/WorkPage.vue'
import {
  getFinishedRepairsApi,
  type RepairAcceptItem,
} from '@/api/repair/RepairApi'
import { useTableQuery } from '@/composables/common/useTableQuery'
import { sortByTimeDesc } from '@/utils/sort'
import { computeColumnWidths, type ColSpec } from '@/views/order/utils/autoColumnWidth'

type RepairItem = RepairAcceptItem

const list = ref<RepairItem[]>([])
const loading = ref(false)

// === 自动列宽：未被固定（无 width）的列按内容自适应；完成时间 137 / 操作 80 保持原宽 ===
const COL_SPECS: ColSpec[] = [
  { key: 'headName', label: '工单名称' },
  { key: 'name', label: '设备名称' },
  { key: 'brand', label: '品牌' },
  { key: 'model', label: '设备型号' },
  { key: 'sn', label: 'SN码' },
  { key: 'account', label: '接单人' },
]
const colWidths = computed(() => computeColumnWidths(list.value, COL_SPECS))

const fetchList = async () => {
  loading.value = true
  try {
    const response = await getFinishedRepairsApi()
    if (response.code === 200) {
      // 按完成时间降序（最新完成的在最上）
      list.value = sortByTimeDesc(
        Array.isArray(response.data) ? response.data : [],
        (i) => i.repairTime,
      )
    }
  } catch (error) {
    console.error('获取维修出库失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)

const getRowKey = (row: RepairItem) => row.id

// 查看：跳转到设备维修信息详情页（/repair-device-detail/:id，依赖列表的 id 字段）
const viewRepair = (row: RepairItem) => {
  window.open(`/repair-device-detail/${row.id}`, '_blank')
}

// 筛选 + 前端切片分页（统一 useTableQuery，与维修接单/维修列表一致）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleReset } = useTableQuery(
  list,
  (item: RepairItem, form) => {
    if (form.headName && !item.headName.includes(form.headName)) return false
    if (form.model && !item.model.includes(form.model)) return false
    if (form.sn && !(item.sn || '').includes(form.sn)) return false
    return true
  },
  { headName: '', model: '', sn: '' },
  8,
)

// 兼容模板绑定名
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
