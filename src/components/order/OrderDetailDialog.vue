<template>
  <el-dialog :model-value="modelValue" width="1000px" align-center destroy-on-close class="order-detail-dialog"
    @update:model-value="emit('update:modelValue', $event)">
    <!-- 订单详情 -->
    <div class="order-detail-form" v-if="order">
      <div class="form-header">
        <h2 class="form-title">维修订单</h2>
      </div>
      <div class="form-info">
        <div class="info-row">
          <div class="info-item">
            <span class="label">客户单位：</span><span class="value">{{ order.customer || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单号：</span><span class="value">{{ order.id || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">合同编号：</span><span class="value"></span>
          </div>
          <div class="info-item">
            <span class="label">入库时间：</span><span class="value">{{ order.createTime || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item full">
            <span class="label">付款条件（盖章后有效）：</span><span class="value"></span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">项目名称：</span><span class="value">{{ order.name || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item full">
            <span class="label">收货信息：</span><span class="value">{{ order.address || '' }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="label">联系人：</span><span class="value">{{ order.contact || '' }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span><span class="value">{{ order.contactPhone || '' }}</span>
          </div>
        </div>
      </div>
      <!-- 表格 -->
      <el-table :data="detailTableData" border class="detail-table" max-height="400" row-key="id"
        :expand-row-keys="expandedKeys" @expand-change="onExpandChange" :row-class-name="rowClassName"
        @row-click="onRowClick">
        <el-table-column type="expand" width="0">
          <template #default="scope">
            <div v-if="!scope.row.isNew && scope.row.id" class="sn-panel">
              <div class="sn-panel-title">
                序列号（共 {{ (snChildrenMap[scope.row.id ?? 0] || []).length }} 条）
              </div>
              <el-table :data="snChildrenMap[scope.row.id ?? 0] || []" border size="small" class="sn-sub-table">
                <el-table-column label="序号" type="index" width="50" align="center" />
                <el-table-column label="SN码" min-width="220">
                  <template #default="snScope">
                    <el-input v-model="snScope.row.sn" size="small" placeholder="编辑SN，回车提交" aria-label="SN码"
                      :readonly="snScope.row.status === '维修中' || snScope.row.status === '待维修'"
                      @keyup.enter.prevent="handleSnSubmit(snScope.row)" @blur="handleSnSubmit(snScope.row)" />
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="90" align="center">
                  <template #default="snScope">
                    <el-tag :type="getSnStatusType(snScope.row.status)" size="small">
                      {{ snScope.row.status || '-' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="品名" width="100">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.equipmentName" aria-label="品名" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.equipmentName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="型号" width="100">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.equipmentModel" aria-label="型号" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.equipmentModel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="厂商" width="100">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.manufacturer" aria-label="厂商" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.manufacturer }}</span>
          </template>
        </el-table-column>
        <el-table-column label="序列号" width="100">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.serialNo" aria-label="序列号" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.serialNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="80" align="center">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.quantity" aria-label="数量" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="100" align="right">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.unitPrice" aria-label="单价" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.unitPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100" align="right">
          <template #default="scope">
            <span v-if="scope.row.isNew">
              {{ (Number(scope.row.quantity) || 0) * (Number(scope.row.unitPrice) || 0) }}
            </span>
            <span v-else>{{ scope.row.total }}</span>
          </template>
        </el-table-column>
        <!-- 备注列：不设 width，作为唯一弹性列吸收剩余空间（fit 默认开启），
             其余列均为固定 width，故不会出现多余空白列，表格精确铺满 -->
        <el-table-column label="备注">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.remark" aria-label="备注" size="small"
              @keydown.enter.prevent="handleNewRowSave(scope.row)" @blur="handleNewRowSave(scope.row)" />
            <span v-else>{{ scope.row.remark }}</span>
          </template>
        </el-table-column>
      </el-table>
      <!-- 表单底部 -->
      <div class="form-footer">
        <div class="footer-row">
          <div class="footer-item">
            <div><span class="label">采购单位（甲方盖章）：</span></div>
            <div><span class="label">代表人（签名）：</span></div>
            <div><span class="label">日期：</span></div>
          </div>
          <div class="footer-item">
            <div><span class="label">供应单位（甲方盖章）：</span></div>
            <div><span class="label">代表人（签名）：</span></div>
            <div><span class="label">日期：</span></div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">关闭</el-button>
      <el-button type="primary" @click="printOrder">打印</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useDetail } from '@/composables/detail/useDetail'
import type { Order } from '@/composables/order/useOrder'

const props = defineProps<{
  modelValue: boolean
  order: Order | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { fetchDetails, detailList, createDetail, getRepairDetail, addRepairSn } = useDetail()

interface DetailTableRow {
  id?: number
  isNew?: boolean
  equipmentName: string
  equipmentModel: string
  manufacturer: string
  serialNo: string
  quantity: number | string
  unitPrice: number | string
  total: number
  remark: string
}

// SN 子记录（每条序列号一行，对应后端 repair 子表）
interface SnRow {
  id: number
  parentId: number
  sn: string
  status: string
  lastSn?: string
  submitting?: boolean
}

//创建一个空白行对象
const createBlankRow = (): DetailTableRow => ({
  id: -1,
  isNew: true,
  equipmentName: '',
  equipmentModel: '',
  manufacturer: '',
  serialNo: '',
  quantity: '',
  unitPrice: '',
  total: 0,
  remark: '',
})

const newRow = ref<DetailTableRow>(createBlankRow())

// 计算表格数据，包括已有的明细和新添加的空白行
const detailTableData = computed<DetailTableRow[]>(() => {
  return [
    ...detailList.value.map((item) => ({
      id: item.id,
      equipmentName: item.equipmentName,
      equipmentModel: item.equipmentModel,
      manufacturer: item.manufacturer || '',
      serialNo: item.sn || '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      remark: '',
    })),
    newRow.value,
  ]
})

// 每个设备行展开后的 SN 子记录（key = 设备明细 id）
const snChildrenMap = ref<Record<number, SnRow[]>>({})
// 当前已展开的设备行 id 列表（受控展开，便于新增后自动展开）
const expandedKeys = ref<number[]>([])

// 拉取某设备明细下的 N 条序列号子记录（N = 数量）
const loadSnChildren = async (detailId: number, force = false) => {
  if (!detailId || detailId <= 0) return
  if (!force && snChildrenMap.value[detailId]) return
  const res = await getRepairDetail(detailId)
  if (res && res.code === 200) {
    const dataValues = Object.values(res.data || {}) as unknown as Record<string, unknown>[]
    snChildrenMap.value[detailId] = dataValues.map((d) => ({
      id: (d.id as number) || 0,
      parentId: detailId,
      sn: (d.sn as string) || '',
      status: (d.status as string) || '',
      lastSn: (d.sn as string) || '',
    }))
  } else {
    snChildrenMap.value[detailId] = []
  }
}

// 提交单条 SN（回车/失焦触发），复用 addRepairSn，并做重复提交防护
const handleSnSubmit = async (row: SnRow) => {
  if (row.submitting) return
  if (!row.id) {
    ElMessage.error('无效的数据ID')
    return
  }
  const trimmed = String(row.sn || '').trim()
  // 空值静默跳过，避免点进输入框又点出时误报
  if (!trimmed) return
  // 与已提交 SN 一致时跳过，避免多次失焦重复提交
  if (row.lastSn === trimmed) return

  row.submitting = true
  try {
    const success = await addRepairSn(trimmed, row.id)
    if (success) {
      row.lastSn = trimmed
      ElMessage.success('SN提交成功')
      // 重新拉取，使状态与后端同步
      await loadSnChildren(row.parentId, true)
    } else {
      ElMessage.error('SN提交失败')
    }
  } finally {
    row.submitting = false
  }
}

// SN 状态标签颜色
const getSnStatusType = (
  status: string,
): '' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  if (status === '待维修') return 'primary'
  if (status === '维修中') return 'warning'
  return 'info'
}

// 展开/收起时同步已展开列表，并在展开时拉取 SN 子记录
const onExpandChange = (row: DetailTableRow, expandedRows: DetailTableRow[]) => {
  expandedKeys.value = expandedRows
    .map((r) => r.id)
    .filter((id): id is number => typeof id === 'number' && id > 0)
  if (!row.isNew && row.id && row.id > 0 && expandedRows.includes(row)) {
    loadSnChildren(row.id)
  }
}

// 整行点击切换展开/收起（与展开箭头效果一致）；隐藏展开列后作为唯一入口
const onRowClick = (row: DetailTableRow) => {
  // 新增行没有明细 id，不触发展开
  if (row.isNew || !row.id || row.id <= 0) return
  if (expandedKeys.value.includes(row.id)) {
    expandedKeys.value = expandedKeys.value.filter((id) => id !== row.id)
  } else {
    expandedKeys.value = [...expandedKeys.value, row.id]
    loadSnChildren(row.id)
  }
}

// 给已有明细行添加可点击样式（光标变手型）
const rowClassName = ({ row }: { row: DetailTableRow }): string => {
  return !row.isNew && row.id && row.id > 0 ? 'clickable-row' : ''
}

// 处理新行保存逻辑
const handleNewRowSave = async (row: DetailTableRow) => {
  if (!row.isNew) return
  if (
    !row.equipmentName &&
    !row.equipmentModel &&
    !row.serialNo &&
    !row.quantity &&
    !row.unitPrice &&
    !row.remark
  ) {
    return
  }
  if (!row.equipmentName) {
    ElMessage.warning('请输入品名')
    return
  }
  if (!row.equipmentModel) {
    ElMessage.warning('请输入型号')
    return
  }
  const quantity = Number(row.quantity)
  if (isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
    ElMessage.warning('数量必须为正整数')
    return
  }
  const unitPrice = Number(row.unitPrice)
  if (isNaN(unitPrice) || unitPrice <= 0) {
    ElMessage.warning('单价必须为正数')
    return
  }
  if (!props.order) return

  const success = await createDetail({
    orderId: props.order.id,
    name: row.equipmentName,
    model: row.equipmentModel,
    manufacturer: row.manufacturer || '',
    number: String(quantity),
    price: String(unitPrice),
  })
  if (success) {
    ElMessage.success('添加设备成功')
    // 记录已有明细 id，用于找出刚新增的那条
    const beforeIds = new Set(detailList.value.map((d) => d.id))
    newRow.value = createBlankRow()
    await fetchDetails(props.order.id)
    // 自动展开刚添加的设备，让其数量对应的 N 条 SN 空白行直接出现在下方
    const newId = detailList.value.find((d) => !beforeIds.has(d.id))?.id
    if (newId != null) {
      expandedKeys.value = [...expandedKeys.value, newId]
      await loadSnChildren(newId)
    }
  } else {
    ElMessage.error('添加设备失败')
  }
}

// 打印订单
const printOrder = () => {
  const printContent = document.querySelector('.order-detail-form') as HTMLElement | null
  if (!printContent) return
  const originalBody = document.body.innerHTML
  document.body.innerHTML = printContent.outerHTML
  window.print()
  document.body.innerHTML = originalBody
  window.location.reload()
}

// 监听 modelValue，当对话框打开时，获取订单明细
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.order) {
      // 清空上一次展开的 SN 子记录，避免跨订单残留
      snChildrenMap.value = {}
      expandedKeys.value = []
      fetchDetails(props.order.id)
    }
  },
)
</script>

<style scoped>
.form-header {
  text-align: center;
  margin-bottom: 16px;
}

.form-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  letter-spacing: 4px;
}

.form-info {
  border: 1px solid #dcdfe6;
  border-bottom: none;
  margin-bottom: 0;
}

.info-row {
  display: flex;
  border-bottom: 1px solid #dcdfe6;
}

.info-item {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-right: 1px solid #dcdfe6;
}

.info-item:last-child {
  border-right: none;
}

.info-item.full {
  flex: none;
  width: 100%;
  border-right: none;
}

.info-item .label {
  white-space: nowrap;
  font-weight: 500;
}

.info-item .value {
  min-width: 80px;
  flex: 1;
  margin-left: 4px;
  min-height: 18px;
}

.detail-table {
  margin: 16px 0;
}

/* 隐藏展开箭头列（整行点击已替代其功能） */
.detail-table :deep(.el-table__expand-column) {
  display: none !important;
}
/* 展开列的 <col> 宽度归零（width 对 <col> 生效，display:none 对 <col> 不生效），
   确保 fit 不会把展开列当成弹性列去吸收剩余空间（否则会生成"备注后空白列"） */
.detail-table :deep(colgroup col.el-table__expand-column),
.detail-table :deep(colgroup col[name="__expand__"]) {
  width: 0 !important;
}

/* 表格强制撑满容器宽度；列宽分配交给 fit 默认行为（仅「备注」一列无 width = 弹性列） */
.detail-table {
  width: 100%;
}
.detail-table :deep(.el-table),
.detail-table :deep(.el-table__inner-wrapper),
.detail-table :deep(table) {
  width: 100% !important;
}

/* 已有明细行可点击，光标变手型 */
.detail-table :deep(.clickable-row) {
  cursor: pointer;
}

.sn-panel {
  padding: 10px 16px;
}

.sn-panel-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.detail-table :deep(.el-table__header-wrapper th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: bold;
  text-align: center;
}

.form-footer {
  border: 1px solid #dcdfe6;
}

.footer-row {
  display: flex;
}

.footer-item {
  flex: 1;
  padding: 12px;
  border-right: 1px solid #dcdfe6;
}

.footer-item:last-child {
  border-right: none;
}

.footer-item div {
  margin-bottom: 8px;
}

.footer-item div:last-child {
  margin-bottom: 0;
}

@media print {

  .order-detail-dialog :deep(.el-dialog__header),
  .order-detail-dialog :deep(.el-dialog__footer) {
    display: none !important;
  }

  .order-detail-dialog :deep(.el-dialog__body) {
    padding: 0 !important;
  }
}
</style>
