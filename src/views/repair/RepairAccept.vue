<template>
  <WorkPage :loading="loading">
    <!-- 快速接单 -->
    <template #actions>
      <div class="quick-order">
        <span class="quick-order__label">快速接单：</span>
        <el-input
          v-model="snCode"
          placeholder="请输入SN码"
          style="width: 250px"
          @keyup.enter="handleTakeOrder"
        />
        <el-button type="primary" @click="handleTakeOrder">接单</el-button>
      </div>
    </template>

    <!-- 筛选条件 -->
    <template #filter>
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="状态">
          <el-select
            filterable
            v-model="filterForm.status"
            placeholder="全部状态"
            style="width: 150px"
          >
            <el-option label="全部状态" value="" />
            <el-option label="维修中" value="维修中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
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

    <!-- 表格数据 -->
    <el-table
      :data="paginatedData"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
      :row-key="getRowKey"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="headName" label="工单名称" min-width="140" show-overflow-tooltip />
      <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="brand" label="品牌" min-width="110" show-overflow-tooltip />
      <el-table-column prop="model" label="设备型号" min-width="120" show-overflow-tooltip />
      <el-table-column prop="type" label="类型" min-width="100" />
      <el-table-column prop="spec" label="参数" min-width="110" show-overflow-tooltip />
      <el-table-column prop="sn" label="SN码" min-width="140" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="account" label="使用人" min-width="100" />
      <el-table-column label="时间" min-width="160" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.time || '-' }}
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAcceptInfoApi, repairTakeApi, type RepairAcceptItem } from '@/api/repair/RepairApi'
import { useTableQuery } from '@/composables/common/useTableQuery'
import WorkPage from '@/components/common/WorkPage.vue'

type TakenDetail = RepairAcceptItem

const takenList = ref<TakenDetail[]>([])
const selectedRows = ref<TakenDetail[]>([])
const loading = ref(false)
const snCode = ref('')

const fetchTakenDetails = async () => {
  try {
    const response = await getAcceptInfoApi()
    if (response.code === 200) {
      takenList.value = Array.isArray(response.data) ? response.data : []
    }
  } catch (error) {
    console.error('获取接单列表失败:', error)
  }
}

// 快速接单：输入 SN 码提交（POST /client/repair/acceptSN?sn=），成功后刷新已接单列表
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
      fetchTakenDetails()
    } else {
      ElMessage.error(res.msg || '接单失败')
    }
  } catch {
    ElMessage.error('接单失败')
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

const getRowKey = (row: TakenDetail) => row.sn

// 查看：跳转到设备维修信息详情页（/repair-device-detail/:id，依赖接单列表补充的 id 字段）
const viewRepair = (row: TakenDetail) => {
  window.open(`/repair-device-detail/${row.id}`, '_blank')
}

import { getStatusTagType as getStatusType } from '@/composables/common/useOrderStatus'

const handleSelectionChange = (val: TakenDetail[]) => {
  selectedRows.value = val
}

// 筛选 + 前端切片分页（统一 useTableQuery）
const { filterForm, currentPage, pageSize, filteredList, pagedList, handleReset } = useTableQuery(
  takenList,
  (item: TakenDetail, form) => {
    if (form.status && item.status !== form.status) return false
    if (form.headName && !item.headName.includes(form.headName)) return false
    if (form.model && !item.model.includes(form.model)) return false
    if (form.sn && !item.sn.includes(form.sn)) return false
    return true
  },
  { status: '', headName: '', model: '', sn: '' },
  8,
)

// 兼容原模板绑定名
const filteredData = filteredList
const paginatedData = pagedList
</script>

<style scoped>
/* 快速接单：落在内容白卡顶部，纯行内块，不另起卡片/阴影 */
.quick-order {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quick-order__label {
  font-size: 16px;
  font-weight: 600;
  color: var(--brand-700);
  white-space: nowrap;
}

/* 分页：右对齐，与上方表格留出间距（外层白卡已提供内边距） */
.pagination-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
