<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useDetail } from '@/composables/detail/useDetail'
import { useAuthStore } from '@/stores/auth'
import { getStatusTagType as getStatusType } from '@/composables/common/useOrderStatus'
import type { DetailData } from '@/api/order/OrderDeviceApi'

const props = defineProps<{
  orderId: string
  row: DetailData
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const { getRepairDetail, addRepairSn, acceptRepair, fetchDetails: fetchRepairDetails } = useDetail()

// 获取当前登录用户的账号
const auth = useAuthStore()
const getCurrentUserAccount = (): string => {
  return auth.account || ''
}

const dialogVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
})

const detailDataList = ref<EditableDetailData[]>([])
const detailCurrentPage = ref(1)
const detailPageSize = ref(10)
// 当前打开弹窗的父设备行 ID（用于提交 SN / 接单后刷新弹窗内表格）
const currentDetailParentId = ref(0)

// 设备详情数据接口（在 DetailData 基础上补充交互态字段）
interface EditableDetailData extends DetailData {
  accepted: boolean
  submitting?: boolean
  lastSn?: string
}

// 设备详情公共信息
const detailCommonInfo = computed(
  () =>
    detailDataList.value[0] || {
      equipmentName: '',
      equipmentModel: '',
      manufacturer: '',
    },
)

// 设备详情分页数据
const paginatedDetailData = computed(() => {
  const start = (detailCurrentPage.value - 1) * detailPageSize.value
  const end = start + detailPageSize.value
  return detailDataList.value.slice(start, end)
})

// 把 getRepairDetail 的响应映射为弹窗表格数据；baseRow 提供字段兜底与外层设备信息
const buildDetailList = (
  res: Awaited<ReturnType<typeof getRepairDetail>>,
  baseRow: DetailData,
): EditableDetailData[] => {
  const dataValues = Object.values(res?.data || {}) as unknown as Record<string, unknown>[]
  if (dataValues.length > 0) {
    return dataValues.map((detail) => ({
      ...baseRow,
      id: (detail.id as number) || baseRow.id,
      equipmentName: (detail.name as string) || baseRow.equipmentName,
      equipmentModel: (detail.model as string) || baseRow.equipmentModel,
      manufacturer: (detail.manufacturer as string) || baseRow.manufacturer,
      sn: (detail.sn as string) || '',
      status: (detail.status as string) || '',
      accepted: false,
      // 记录已提交 SN，避免刷新后失焦再次触发重复提交（仅取本行 SN，不回退到 baseRow）
      lastSn: (detail.sn as string) || '',
    }))
  }
  return [
    {
      ...baseRow,
      sn: baseRow.sn || '',
      status: baseRow.status || '',
      accepted: false,
      lastSn: baseRow.sn || '',
    },
  ]
}

// 提交 SN / 接单后，重新拉取弹窗内设备详情，使状态与后端同步（输入框立即变只读、状态标签即时更新）
const refreshDetailData = async () => {
  const parentId = currentDetailParentId.value
  if (!parentId) return
  const base = detailDataList.value[0]
  if (!base) return
  const res = await getRepairDetail(parentId)
  if (res && res.code === 200) {
    detailDataList.value = buildDetailList(res, base)
  } else {
    detailDataList.value = [
      {
        ...base,
        sn: base.sn || '',
        status: base.status || '',
        accepted: false,
        lastSn: base.sn || '',
      },
    ]
  }
}

// 弹窗打开时加载设备详情
const loadDetail = async () => {
  const row = props.row
  if (!row?.id) {
    ElMessage.error('无效的数据ID')
    return
  }
  detailCurrentPage.value = 1
  currentDetailParentId.value = row.id
  const res = await getRepairDetail(row.id)
  if (res && res.code === 200) {
    detailDataList.value = buildDetailList(res, row)
  } else {
    detailDataList.value = [
      {
        ...row,
        sn: row.sn || '',
        status: row.status || '',
        accepted: false,
        lastSn: row.sn || '',
      },
    ]
  }
}

onMounted(() => {
  if (props.visible) loadDetail()
})
watch(
  () => props.visible,
  (v) => {
    if (v) loadDetail()
  },
)

// 提交设备详情的SN码
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
    // 刷新外层设备列表（共享单例 repairDetailList，父组件外层表自动更新）
    await fetchRepairDetails(props.orderId)
    return true
  }

  ElMessage.error('提交失败')
  return false
}

// 处理弹窗内 SN 提交（回车或失焦触发）
const handleInlineSnSubmit = async (row: EditableDetailData, submit = false) => {
  if (!submit) {
    return
  }
  if (row.submitting) {
    return
  }

  const targetId = Number(row.id)
  if (!targetId) {
    ElMessage.error('无效的数据ID')
    return
  }

  const trimmedSn = String(row.sn || '').trim()
  if (!trimmedSn) {
    return
  }
  if (row.lastSn === trimmedSn) {
    return
  }

  row.submitting = true
  try {
    const success = await submitSn(trimmedSn, targetId)
    if (success) {
      await refreshDetailData()
    }
  } finally {
    row.submitting = false
  }
}

// 接单处理
const handleAccept = async (row: EditableDetailData) => {
  const sn = String(row.sn || '').trim()
  if (!sn) {
    ElMessage.error('SN码不能为空')
    return
  }
  if (row.status && row.status !== '待维修') {
    ElMessage.warning('当前状态不可接单')
    return
  }
  const account = getCurrentUserAccount()
  if (!account) {
    ElMessage.error('未获取到登录用户信息')
    return
  }
  const success = await acceptRepair(sn, account)
  if (success) {
    ElMessage.success('接单成功')
    row.accepted = true
    await fetchRepairDetails(props.orderId)
    await refreshDetailData()
  } else {
    ElMessage.error('接单失败')
  }
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
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
              aria-label="SN码"
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
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.detail-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 18px;
  padding: 12px 16px;
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

/* 限制弹窗内容高度，防止表格行数过多时撑高弹窗导致 overlay 滚动、弹窗位置漂移 */
:deep(.el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
