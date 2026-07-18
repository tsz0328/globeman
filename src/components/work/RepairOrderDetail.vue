<template>
  <div class="order-detail">
    <div class="detail-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="title">维修订单详情</h2>
    </div>

    <div class="equipment-section">
      <h3 class="section-title">订单名称：{{ orderName }}</h3>
      <el-table :data="paginatedData" border style="width: 100%">
        <el-table-column prop="equipmentName" label="设备名称" width="150" />
        <el-table-column prop="equipmentModel" label="设备名称" width="150" />
        <el-table-column prop="manufacturer" label="生产厂家" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="unitPrice" label="单价" width="150" />
        <el-table-column prop="total" label="总价" width="150" />
        <el-table-column label="操作" width="73">
          <template #default="scope">
            <el-button type="info" size="small" @click="handleDetail(scope.row)"> 查看 </el-button>
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

    <!-- 设备详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="设备详情"
      width="800px"
      :draggable="false"
      align-center
      append-to-body
    >
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

        <!-- 设备详情表格 -->
        <el-table :data="paginatedDetailData" border :max-height="510" style="width: 100%">
          <el-table-column label="SN码">
            <template #default="scope">
              <el-input
                v-model="scope.row.sn"
                placeholder="编辑SN，回车提交"
                :readonly="scope.row.status === '维修中' || scope.row.status === '待维修'"
                @keyup.enter.prevent="handleInlineSnSubmit(scope.row, true)"
                @blur="handleInlineSnSubmit(scope.row, true)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="81">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status || '-' }}
              </el-tag>
            </template>
          </el-table-column>
          <!-- 操作列 -->
          <el-table-column label="操作" width="73">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="handleAccept(scope.row)"
                :disabled="scope.row.status !== '待维修' || scope.row.accepted"
              >
                接单
              </el-button>
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
import Cookies from 'js-cookie'

import { useDetail } from '@/composables/useDetail'

const route = useRoute()
const {
  fetchDetails: fetchRepairDetails,
  detailList: repairDetailList,
  getRepairDetail,
  addRepairSn,
  acceptRepair,
} = useDetail()

// 获取当前登录用户的账号
const getCurrentUserAccount = (): string => {
  return Cookies.get('account') || ''
}

// 接单处理
const handleAccept = async (row: EditableDetailData) => {
  const sn = String(row.sn || '').trim()
  if (!sn) {
    ElMessage.error('SN码不能为空')
    return
  }
  // 检查状态是否为待维修
  if (row.status && row.status !== '待维修') {
    ElMessage.warning('当前状态不可接单')
    return
  }
  // 检查登录用户信息是否有效
  const account = getCurrentUserAccount()
  if (!account) {
    ElMessage.error('未获取到登录用户信息')
    return
  }
  // 调用接单接口
  const success = await acceptRepair(sn, account)
  if (success) {
    ElMessage.success('接单成功')
    row.status = '维修中'
    row.accepted = true
    // 刷新设备详情列表
    await fetchRepairDetails(orderId.value)
  } else {
    ElMessage.error('接单失败')
  }
}

const orderId = ref(0)
const orderName = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const isProjectIdValid = ref(true)
const detailDialogVisible = ref(false)
const detailDataList = ref<EditableDetailData[]>([])
const detailCurrentPage = ref(1)
const detailPageSize = ref(10)

// 解析项目ID
const parseProjectId = (id: unknown): number => {
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10)
    return !isNaN(parsed) && parsed > 0 ? parsed : 0
  }
  return 0
}

// 设备详情数据接口
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
  accepted: boolean
  submitting?: boolean
  lastSn?: string
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

const getStatusType = (
  status: string,
): '' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  switch (status) {
    case '待维修':
      return 'primary'
    case '维修中':
      return 'warning'
    default:
      return 'info'
  }
}

// 处理设备详情弹窗显示
const handleDetail = async (row: EditableDetailData) => {
  // 检查数据ID是否有效
  if (!row.id) {
    ElMessage.error('无效的数据ID')
    return
  }
  // 清空设备详情列表
  detailCurrentPage.value = 1
  // 获取设备详情列表
  const res = await getRepairDetail(row.id)
  // 处理设备详情列表
  if (res && res.code === 200) {
    const dataValues = Object.values(res.data || {}) as unknown as Record<string, unknown>[]
    if (dataValues.length > 0) {
      detailDataList.value = dataValues.map((detail) => ({
        ...row,
        id: (detail.id as number) || row.id,
        equipmentName: (detail.name as string) || row.equipmentName,
        equipmentModel: (detail.model as string) || row.equipmentModel,
        manufacturer: (detail.manufacturer as string) || row.manufacturer,
        sn: (detail.sn as string) || row.sn || '',
        status: (detail.status as string) || row.status || '',
        accepted: false,
      }))
      detailDialogVisible.value = true
    } else {
      detailDataList.value = [
        {
          ...row,
          sn: row.sn || '',
          status: row.status || '',
          accepted: false,
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
        accepted: false,
      },
    ]
    detailDialogVisible.value = true
  }
}

const submitSn = async (sn: string, id: number, row?: EditableDetailData) => {
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
    if (row) {
      row.status = '维修中'
      row.accepted = true
    }
    await fetchRepairDetails(orderId.value)
    return true
  }

  ElMessage.error('提交失败')
  return false
}

const handleInlineSnSubmit = async (row: EditableDetailData, submit = false) => {
  if (!submit) {
    return
  }
  // 防止回车提交过程中失焦触发的并发重复提交
  if (row.submitting) {
    return
  }

  const targetId = Number(row.id)
  if (!targetId) {
    ElMessage.error('无效的数据ID')
    return
  }

  const trimmedSn = String(row.sn || '').trim()
  // 空值静默跳过，避免点进输入框又点出时误报"不能为空"
  if (!trimmedSn) {
    return
  }
  // 值与上次已提交的 SN 一致时跳过，避免多次失焦重复提交
  if (row.lastSn === trimmedSn) {
    return
  }

  row.submitting = true
  try {
    const success = await submitSn(trimmedSn, targetId, row)
    if (success) {
      row.sn = trimmedSn
      row.lastSn = trimmedSn
    }
  } finally {
    row.submitting = false
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
  justify-content: space-between;
  align-items: center;
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
  flex: 1;
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

/* 限制弹窗内容高度，防止表格行数过多时撑高弹窗导致 overlay 滚动、弹窗位置漂移 */
:deep(.el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
