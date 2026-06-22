<template>
  <div class="order-detail">
    <div class="detail-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="title">订单详情</h2>
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
        <el-table-column label="操作" width="133">
          <template #default="scope">
            <el-button type="info" size="small" @click="handleDetail(scope.row)"> 查看 </el-button>
            <el-button type="primary" size="small" @click="handleAdd(scope.row)"> 提交 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          layout="total, prev, pager, next, jumper"
          :total="displayData.length"
        />
      </div>
    </div>

    <el-dialog v-model="detailDialogVisible" title="设备详情" width="600px">
      <div v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备名称">{{
            detailData.equipmentName
          }}</el-descriptions-item>
          <el-descriptions-item label="设备型号">{{
            detailData.equipmentModel
          }}</el-descriptions-item>
          <el-descriptions-item label="SN码">{{ detailData.sn || '-' }}</el-descriptions-item>
          <el-descriptions-item label="生产厂家">{{
            detailData.manufacturer
          }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(detailData.status)">
              {{ detailData.status || '-' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { useDetail } from '@/composables/useDetail'

const route = useRoute()
const {
  fetchDetails: fetchRepairDetails,
  detailList: repairDetailList,
  getRepairDetail,
  addRepairSn,
} = useDetail()

const orderId = ref(0)
const orderName = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const isProjectIdValid = ref(true)
const detailDialogVisible = ref(false)
const detailData = ref<EditableDetailData | null>(null)

const parseProjectId = (id: unknown): number => {
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10)
    return !isNaN(parsed) && parsed > 0 ? parsed : 0
  }
  return 0
}

interface EditableDetailData {
  id: number
  projectId: number
  belongProject: string
  equipmentName: string
  equipmentModel: string
  manufacturer: string
  sn: string
  status: string
  quantity: number
  unitPrice: number
  total: number
}

const displayData = computed(() => repairDetailList.value)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return displayData.value.slice(start, end)
})

const goBack = () => {
  window.close()
}

const getStatusType = (status: string): '' | 'success' | 'warning' | 'danger' | 'info' => {
  switch (status) {
    case '待维修':
      return 'warning'
    case '维修中':
      return 'info'
    case '已完成':
      return 'success'
    case '已取消':
      return 'danger'
    default:
      return 'info'
  }
}

const handleDetail = async (row: EditableDetailData) => {
  if (!row.id) {
    ElMessage.error('无效的数据ID')
    return
  }

  const res = await getRepairDetail(row.id)

  if (res && res.code === 200) {
    const dataValues = Object.values(res.data || {}) as unknown as Record<string, unknown>[]
    if (dataValues.length > 0) {
      const detail = dataValues[0]!
      detailData.value = {
        ...row,
        equipmentName: (detail.name as string) || row.equipmentName,
        equipmentModel: (detail.model as string) || row.equipmentModel,
        manufacturer: (detail.manufacturer as string) || row.manufacturer,
        sn: (detail.sn as string) || row.sn || '',
        status: (detail.status as string) || row.status || '',
      }
      detailDialogVisible.value = true
    } else {
      detailData.value = {
        ...row,
        sn: row.sn || '',
        status: row.status || '',
      }
      detailDialogVisible.value = true
    }
  } else {
    detailData.value = {
      ...row,
      sn: row.sn || '',
      status: row.status || '',
    }
    detailDialogVisible.value = true
  }
}

const handleAdd = async (row: EditableDetailData) => {
  if (!row.id) {
    ElMessage.error('无效的数据ID')
    return
  }

  try {
    const sn = await ElMessageBox.prompt('请输入SN码', '提交', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })

    if (!sn.value) {
      return
    }

    const success = await addRepairSn(sn.value, row.id)
    if (success) {
      ElMessage.success('提交成功')
      await fetchRepairDetails(orderId.value)
    } else {
      ElMessage.error('提交失败')
    }
  } catch {}
}

onMounted(() => {
  const id = parseProjectId(route.params.id)

  if (id === 0) {
    isProjectIdValid.value = false
    ElMessage.error('无效的订单ID')
    return
  }

  orderId.value = id

  const nameParam = route.query.name as string
  if (nameParam) {
    orderName.value = decodeURIComponent(nameParam)
  }

  fetchRepairDetails(id)
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
  background-color: white;
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
