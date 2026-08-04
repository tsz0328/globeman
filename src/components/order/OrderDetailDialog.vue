<template>
  <el-dialog :model-value="modelValue" width="70vw" align-center destroy-on-close class="order-detail-dialog"
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
            <span class="label">订单名称：</span><span class="value">{{ order.name || '' }}</span>
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

      <!-- 设备表格 -->
      <el-table :data="detailTableData" border class="detail-table" row-key="id" :expand-row-keys="expandedKeys"
        max-height="30vh"
        @expand-change="onExpandChange" :row-class-name="rowClassName" @row-click="onRowClick">
        <!-- 展开行 -->
        <el-table-column type="expand">
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

        <!-- 表格列 -->
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="品名" width="100">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.equipmentName" aria-label="品名" size="small"
              class="new-row-input"
              :ref="(el: unknown) => setNewRowRef('equipmentName', el)"
              @keydown="onNewRowKeydown(scope.row, 'equipmentName', $event)"
              @blur="handleNewRowBlur(scope.row, $event)" />
            <span v-else>{{ scope.row.equipmentName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="型号" width="100">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.equipmentModel" aria-label="型号" size="small"
              class="new-row-input"
              :ref="(el: unknown) => setNewRowRef('equipmentModel', el)"
              @keydown="onNewRowKeydown(scope.row, 'equipmentModel', $event)"
              @blur="handleNewRowBlur(scope.row, $event)" />
            <span v-else>{{ scope.row.equipmentModel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.type" aria-label="类型" size="small"
              class="new-row-input"
              :ref="(el: unknown) => setNewRowRef('type', el)"
              @keydown="onNewRowKeydown(scope.row, 'type', $event)"
              @blur="handleNewRowBlur(scope.row, $event)" />
            <span v-else>{{ scope.row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column label="品牌">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.manufacturer" aria-label="品牌" size="small"
              class="new-row-input"
              :ref="(el: unknown) => setNewRowRef('manufacturer', el)"
              @keydown="onNewRowKeydown(scope.row, 'manufacturer', $event)"
              @blur="handleNewRowBlur(scope.row, $event)" />
            <span v-else>{{ scope.row.manufacturer }}</span>
          </template>
        </el-table-column>
        <el-table-column label="参数" width="100">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.spec" aria-label="参数" size="small"
              class="new-row-input"
              :ref="(el: unknown) => setNewRowRef('spec', el)"
              @keydown="onNewRowKeydown(scope.row, 'spec', $event)"
              @blur="handleNewRowBlur(scope.row, $event)" />
            <span v-else>{{ scope.row.spec }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="80" align="center">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.quantity" aria-label="数量" size="small"
              class="new-row-input"
              :ref="(el: unknown) => setNewRowRef('quantity', el)"
              @input="(val: string) => filterNumberInput(scope.row, 'quantity', val)"
              @keydown="onNewRowKeydown(scope.row, 'quantity', $event)"
              @blur="handleNewRowBlur(scope.row, $event)" />
            <span v-else>{{ scope.row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="100" align="right">
          <template #default="scope">
            <el-input v-if="scope.row.isNew" v-model="scope.row.unitPrice" aria-label="单价" size="small"
              class="new-row-input"
              :ref="(el: unknown) => setNewRowRef('unitPrice', el)"
              @input="(val: string) => filterNumberInput(scope.row, 'unitPrice', val)"
              @keydown="onNewRowKeydown(scope.row, 'unitPrice', $event)"
              @blur="handleNewRowBlur(scope.row, $event)" />
            <span v-else>{{ scope.row.unitPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100" align="right">
          <template #default="scope">
            <span v-if="scope.row.isNew">
              {{ calcAmountText(scope.row.quantity, scope.row.unitPrice) }}
            </span>
            <span v-else>{{ scope.row.total }}</span>
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

    <!-- 表单底部 -->
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">关闭</el-button>
      <el-button type="primary" :loading="submitting" :disabled="isSubmitted" @click="handleSubmitOrder">提交</el-button>
      <el-button @click="printOrder">打印</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useDetail } from '@/composables/detail/useDetail'
import { useOrder, type Order } from '@/composables/order/useOrder'

const props = defineProps<{
  modelValue: boolean
  order: Order | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submitted'): void
}>()

const { fetchOrderDetails, detailList, createDetail, getRepairDetail, addRepairSn } = useDetail()
const { submitOrder } = useOrder()

// 订单是否已提交（锁定态）：成功后本地乐观置位 + 父组件回拉最新 status 后由 props.order.status 驱动
// 状态为 "已提交" 时：禁用「提交」按钮、隐藏新增设备行（不可再编辑/添加设备）
const SUBMITTED_STATUS = '已提交'
const submittedFlag = ref(false)
const isSubmitted = computed(() => submittedFlag.value || props.order?.status === SUBMITTED_STATUS)

interface DetailTableRow {
  id?: number
  isNew?: boolean
  equipmentName: string
  equipmentModel: string
  type: string
  manufacturer: string
  spec: string
  quantity: number | string
  unitPrice: number | string
  total: number
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
  type: '',
  manufacturer: '',
  spec: '',
  quantity: '',
  unitPrice: '',
  total: 0,
})

const newRow = ref<DetailTableRow>(createBlankRow())

// 新行可编辑列顺序（决定回车 / 方向键切换列的顺序）
const NEW_ROW_COLUMNS = [
  'equipmentName',
  'equipmentModel',
  'type',
  'manufacturer',
  'spec',
  'quantity',
  'unitPrice',
]

// 新行各列输入框实例（用于回车 / 方向键切换焦点）
const newRowRefs = ref<Record<string, { focus: () => void } | null>>({})
const setNewRowRef = (col: string, el: unknown) => {
  newRowRefs.value[col] = (el as { focus: () => void } | null) ?? null
}
const focusNewRowCol = (col: string) => {
  const inst = newRowRefs.value[col]
  if (inst && typeof inst.focus === 'function') inst.focus()
}

// 新行键盘导航：
// - 回车：跳到下一列；最后一列（单价）回车创建设备
// - 左右方向键：切换输入列
// 失焦创建：新行任意输入框失焦、且焦点真正离开新行（非同行列间切换）时也创建设备
const focusNewRowByOffset = (fromIdx: number, offset: number) => {
  const target = NEW_ROW_COLUMNS[fromIdx + offset]
  if (typeof target === 'string') focusNewRowCol(target)
}
const onNewRowKeydown = (row: DetailTableRow, col: string, e: KeyboardEvent) => {
  const idx = NEW_ROW_COLUMNS.indexOf(col)
  if (idx < 0) return
  if (e.key === 'Enter') {
    e.preventDefault()
    if (idx < NEW_ROW_COLUMNS.length - 1) {
      focusNewRowByOffset(idx, 1)
    } else {
      handleNewRowSave(row)
    }
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    if (idx < NEW_ROW_COLUMNS.length - 1) focusNewRowByOffset(idx, 1)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    if (idx > 0) focusNewRowByOffset(idx, -1)
  }
}

// 失焦创建：新行输入框失焦时，若焦点落在同行其它列（列间切换）则不创建，
// 仅当焦点真正离开新行（点其它行 / 按钮 / 弹窗外）才提交设备
const handleNewRowBlur = (row: DetailTableRow, e: FocusEvent) => {
  const next = (e.relatedTarget as HTMLElement | null)
  if (next && next.closest && next.closest('.new-row-input')) {
    return
  }
  handleNewRowSave(row)
}

// 计算表格数据，包括已有的明细和新添加的空白行
const detailTableData = computed<DetailTableRow[]>(() => {
  const rows: DetailTableRow[] = detailList.value.map((item) => ({
    id: item.id,
    equipmentName: item.equipmentName,
    equipmentModel: item.equipmentModel,
    type: item.type || '',
    manufacturer: item.manufacturer || '',
    spec: item.spec || '',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
  }))
  // 已提交（锁定态）不再展示新增设备行，避免继续编辑/添加设备
  if (!isSubmitted.value) rows.push(newRow.value)
  return rows
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
    !row.quantity &&
    !row.unitPrice
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
    order: props.order.id,
    name: row.equipmentName,
    model: row.equipmentModel,
    type: row.type || '',
    brand: row.manufacturer || '',
    spec: row.spec || '',
    number: quantity,
    price: unitPrice,
  })
  if (success) {
    ElMessage.success('添加设备成功')
    newRow.value = createBlankRow()
    await fetchOrderDetails(props.order.id)
    // 创建后自动聚焦新行首列，便于连续录单
    await nextTick()
    focusNewRowCol('equipmentName')
  } else {
    ElMessage.error('添加设备失败')
  }
}

// 限制数量/单价输入：
// - 数量：只能输入 0~9（纯整数）
// - 单价：只能输入 0~9 和小数点，小数点后最多2位
const filterNumberInput = (
  row: DetailTableRow,
  field: 'quantity' | 'unitPrice',
  val: string,
) => {
  let cleaned: string
  if (field === 'quantity') {
    // 数量：只保留数字，纯整数
    cleaned = val.replace(/[^\d]/g, '')
  } else {
    // 单价：保留数字和小数点，最多一个小数点，小数点后最多2位，.开头自动补0
    cleaned = val
      .replace(/[^\d.]/g, '')        // 只保留数字和小数点
      .replace(/(\..*)\./g, '$1')    // 最多一个小数点
      .replace(/^\./, '0.')          // .开头自动补0 → 0.
      .replace(/(\.\d{2})\d+/, '$1') // 小数点后最多2位
  }
  if (cleaned !== val) {
    row[field] = cleaned as never
  }
}

// 按"分"整数计算金额，避免 JS 浮点误差（439 × 3466.8 = 1521925.2 而非 1521925.200000002）
const calcAmountText = (
  qty: string | number,
  price: string | number,
): string => {
  const q = Number(qty)
  const p = Number(price)
  if (isNaN(q) || isNaN(p) || q <= 0 || p <= 0) return '0.00'
  // 用"分"做整数运算（单价 × 100 = 单价分；数量是整数）
  // 金额分 = 单价分 × 数量，金额元 = 金额分 / 100
  // 这样避开浮点，精确到分
  const priceCents = Math.round(p * 100)
  const totalCents = Math.round(priceCents) * q
  return (Math.round(totalCents) / 100).toFixed(2)
}

// 提交订单（PUT /client/order/submit?id=）
const submitting = ref(false)
const handleSubmitOrder = async () => {
  if (!props.order) return
  submitting.value = true
  try {
    const success = await submitOrder(props.order.id)
    if (success) {
      ElMessage.success('订单提交成功')
      // 乐观锁定：立即禁用提交 / 隐藏新增行，同时通知父组件回拉最新 status
      submittedFlag.value = true
      emit('submitted')
    } else {
      ElMessage.error('订单提交失败')
    }
  } finally {
    submitting.value = false
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
      // 重新打开时复位锁定态（若订单本身已是"已提交"，由 props.order.status 重新驱动）
      submittedFlag.value = false
      fetchOrderDetails(props.order.id)
    }
  },
)
</script>

<style scoped>
.form-header {
  text-align: center;
  margin-bottom: 16px;
}

/* 表格用 el-table 的 max-height 自行内部滚动（el-dialog 无 height 属性），
   故弹窗本体不再强制 80vh，表头/表尾保持不动，仅设备表格区域滚动 */

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

/* 展开列（箭头）默认显示，用户可直接点箭头展开 SN 子表；整行点击展开仍保留 */
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
