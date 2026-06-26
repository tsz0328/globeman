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

    <el-dialog v-model="detailDialogVisible" title="设备详情" width="800px" :draggable="false">
      <div v-if="detailDataList.length > 0">
        <div class="detail-summary">
          <div class="summary-item">
            <span class="summary-label">设备名称：</span>
            <span>{{ detailCommonInfo.equipmentName || '-' }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">设备型号：</span>
            <span>{{ detailCommonInfo.equipmentModel || '-' }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">生产厂家：</span>
            <span>{{ detailCommonInfo.manufacturer || '-' }}</span>
          </div>
        </div>

        <el-table :data="paginatedDetailData" border style="width: 100%">
          <el-table-column label="SN码">
            <template #default="scope">
              <el-input
                v-model="scope.row.sn"
                class="edit-input"
                placeholder="编辑SN，回车提交"
                @keyup.enter="handleInlineSnSubmit(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status || '-' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin-top: 15px; text-align: right">
          <el-pagination
            v-model:current-page="detailCurrentPage"
            :page-size="detailPageSize"
            layout="total, prev, pager, next, jumper"
            :total="detailDataList.length"
          />
        </div>
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
const detailDataList = ref<EditableDetailData[]>([])
const detailCurrentPage = ref(1)
const detailPageSize = ref(7)
const currentDetailId = ref(0)

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

const paginatedDetailData = computed(() => {
  const start = (detailCurrentPage.value - 1) * detailPageSize.value
  const end = start + detailPageSize.value
  return detailDataList.value.slice(start, end)
})

const detailCommonInfo = computed(
  () =>
    detailDataList.value[0] || {
      equipmentName: '',
      equipmentModel: '',
      manufacturer: '',
    },
)

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

  detailCurrentPage.value = 1
  currentDetailId.value = row.id

  const res = await getRepairDetail(row.id)

  if (res && res.code === 200) {
    const dataValues = Object.values(res.data || {}) as unknown as Record<string, unknown>[]
    if (dataValues.length > 0) {
      detailDataList.value = dataValues.map((detail) => ({
        ...row,
        equipmentName: (detail.name as string) || row.equipmentName,
        equipmentModel: (detail.model as string) || row.equipmentModel,
        manufacturer: (detail.manufacturer as string) || row.manufacturer,
        sn: (detail.sn as string) || row.sn || '',
        status: (detail.status as string) || row.status || '',
      }))
      detailDialogVisible.value = true
    } else {
      detailDataList.value = [
        {
          ...row,
          sn: row.sn || '',
          status: row.status || '',
        },
      ]
      detailDialogVisible.value = true
    }
  } else {
    detailDataList.value = [
      {
        ...row,
        sn: row.sn || '',
        status: row.status || '',
      },
    ]
    detailDialogVisible.value = true
  }
}

const submitSn = async (sn: string, id: number) => {
  if (!id) {
    ElMessage.error('无效的数据ID')
    return false
  }
  if (!sn) {
    ElMessage.warning('SN码不能为空')
    return false
  }

  const success = await addRepairSn(sn, id)
  if (success) {
    ElMessage.success('提交成功')
    await fetchRepairDetails(orderId.value)
    return true
  }

  ElMessage.error('提交失败')
  return false
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

    await submitSn(sn.value, row.id)
  } catch {}
}

const handleInlineSnSubmit = async (row: EditableDetailData) => {
  if (!currentDetailId.value) {
    ElMessage.error('无效的数据ID')
    return
  }

  const trimmedSn = String(row.sn || '').trim()
  if (!trimmedSn) {
    ElMessage.warning('SN码不能为空')
    return
  }

  const success = await submitSn(trimmedSn, currentDetailId.value)
  if (success) {
    row.sn = trimmedSn
  }
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

.detail-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 18px;
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

.summary-item {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 220px;
}

.summary-label {
  color: #606266;
  font-weight: 600;
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

:deep(.el-input__wrapper) {
  background: transparent;
  box-shadow: none;
  padding: 0;
}

:deep(.el-input__inner) {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 0;
  margin: 0;
  font-size: inherit;
  font-family: inherit;
  color: inherit;
  text-align: inherit;
  cursor: text;
}
</style>
