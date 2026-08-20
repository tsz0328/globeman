<template>
  <div class="order-detail" v-loading="loading">
    <div class="detail-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="title">维修订单详情</h2>
    </div>

    <div class="equipment-section">
      <h3 class="section-title">订单名称：{{ orderName }}</h3>
      <el-table :data="paginatedData" border style="width: 100%">
        <el-table-column prop="equipmentName" label="设备名称" width="150" />
        <el-table-column prop="equipmentModel" label="设备型号" width="150" />
        <el-table-column prop="manufacturer" label="生产厂家" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="unitPrice" label="单价" width="150" />
        <el-table-column prop="total" label="总价" width="150" />
        <el-table-column label="操作" width="73">
          <template #default="scope">
            <el-button type="info" size="small" @click="openDetail(scope.row)"> 查看 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          layout="total, prev, pager, next, jumper"
          :total="displayData.length"
        />
      </div>
    </div>

    <!-- 设备详情弹窗（子组件自管理 SN 表 / 接单 / 分页） -->
    <RepairDetailDialog
      v-if="selectedRow"
      v-model:visible="detailDialogVisible"
      :order-id="orderId"
      :row="selectedRow"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useDetail } from '@/composables/detail/useDetail'
import { useTableQuery } from '@/composables/common/useTableQuery'
import type { DetailData } from '@/api/order/OrderDeviceApi.ts'
import RepairDetailDialog from './RepairDetailDialog.vue'

// 设备详情路由参数
const route = useRoute()
const { fetchDetails: fetchRepairDetails, detailList: repairDetailList } = useDetail()

const orderId = ref('')
const orderName = ref('')
const detailDialogVisible = ref(false)
const selectedRow = ref<DetailData | null>(null)

// 弹窗：点击"查看"打开设备详情
const openDetail = (row: DetailData) => {
  selectedRow.value = row
  detailDialogVisible.value = true
}

// 解析项目ID
const parseProjectId = (id: unknown): string => {
  if (typeof id === 'string') return id
  if (typeof id === 'number') return String(id)
  return ''
}

// 设备详情列表
const displayData = computed(() => repairDetailList.value)

// 前端切片分页（统一 useTableQuery，本页无筛选，仅做分页）
const { currentPage, pageSize, pagedList } = useTableQuery(displayData, () => true, {}, 8)
// 兼容原模板绑定名
const paginatedData = pagedList

// 返回上一页
const goBack = () => {
  window.close()
}

const loading = ref(false)

// 页面加载时获取维修订单详情
onMounted(async () => {
  const id = parseProjectId(route.params.id)

  if (!id) {
    ElMessage.error('无效的订单ID')
    return
  }

  orderId.value = id

  const nameParam = route.query.name as string
  if (nameParam) {
    orderName.value = decodeURIComponent(nameParam)
  }

  loading.value = true
  try {
    await fetchRepairDetails(id)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.order-detail {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid black;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.equipment-section {
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0 0 15px 0;
}

.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}
</style>
