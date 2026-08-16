<template>
  <el-table :data="detailTableData" border class="detail-table" row-key="id" :expand-row-keys="expandedKeys"
    max-height="30vh"
    @expand-change="onExpandChange" :row-class-name="rowClassName" @row-click="onRowClick">
    <!-- 展开行：编辑中状态不展示展开箭头，行不可展开 -->
    <el-table-column type="expand" v-if="!isEditing">
      <template #default="scope">
        <div v-if="!scope.row.isNew && scope.row.id" class="sn-panel">
          <div>
            序列号（共 {{ countRealSn(scope.row.id ?? 0) }} 条）
          </div>
          <SnSubTable :rows="snChildrenMap[scope.row.id ?? 0] || []" :is-repair="isRepair" @blur="onSnBlur" />
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
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useDetail } from '@/composables/detail/useDetail'
import { type Order } from '@/composables/order/useOrder'
import type { RepairOrderDetail } from '@/api/repair/RepairApi'
import SnSubTable from './SnSubTable.vue'
import type { SnRow } from './SnRow'

const props = defineProps<{
  // 弹窗打开状态（与父组件 el-dialog 的 modelValue 同步）
  modelValue: boolean
  order: Order | null
  // 父组件已计算的派生状态，作为只读 prop 传入，避免子组件重复计算订单状态
  isSubmitted: boolean
  isRepair: boolean
  isEditing: boolean
  // 维修订单：明细已随列表接口内联返回，传入后直接映射、不再二次请求订单明细接口
  details?: RepairOrderDetail[]
}>()

const { fetchOrderDetails, detailList, createDetail, addRepairSn, addSn } = useDetail()

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

// 创建 SN 子表的空白新增行（编辑态，失焦提交到 /client/repair/addSN）
const createBlankSnRow = (parentId: number): SnRow => ({
  id: 0,
  parentId,
  sn: '',
  status: '',
  isBlank: true,
})

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
  // 已提交（锁定态）或维修订单（只读）不再展示新增设备行，避免继续编辑/添加设备
  if (!props.isSubmitted && !props.isRepair) rows.push(newRow.value)
  return rows
})

// 每个设备行展开后的 SN 子记录（key = 设备明细 id）
const snChildrenMap = ref<Record<number, SnRow[]>>({})
// 当前已展开的设备行 id 列表（受控展开，便于新增后自动展开）
const expandedKeys = ref<number[]>([])

// 展开 SN 子表时初始化：不再调用 /repair/get?id 拉取既有 SN（该接口已弃用），
// 仅确保「订单已提交」时存在一条可编辑空白行供录入 SN；已初始化的不覆盖（保留本次会话已提交 SN）
const loadSnChildren = (detailId: number) => {
  if (!detailId || detailId <= 0) return
  if (snChildrenMap.value[detailId]) return
  // 仅订单状态为「已提交」时可录入 SN：追加一条可编辑空白行；草稿态不追加，SN 须待订单提交后方可录入
  snChildrenMap.value[detailId] = props.isSubmitted ? [createBlankSnRow(detailId)] : []
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
    } else {
      ElMessage.error('SN提交失败')
    }
  } finally {
    row.submitting = false
  }
}

// SN 输入框失焦 / 回车统一入口：空白新增行走 addSN，已提交行只读跳过，其余走 addRepairSn
const onSnBlur = (row: SnRow) => {
  if (row.isBlank) handleBlankSnSubmit(row)
  else if (row.committed) return
  else handleSnSubmit(row)
}

// 空白新增行失焦提交：POST /client/repair/addSN?SN={录入值}&id={设备明细 id}
const handleBlankSnSubmit = async (row: SnRow) => {
  if (row.submitting) return
  const trimmed = String(row.sn || '').trim()
  // 空白行：空值不做提交，保留空白行供继续录入
  if (!trimmed) return
  row.submitting = true
  try {
    const success = await addSn(trimmed, row.parentId)
    if (success) {
      ElMessage.success('SN提交成功')
      // 不重新拉取（/repair/get?id 已弃用）；本地把刚提交的 SN 标记为已提交行并补一条空白行
      const list = (snChildrenMap.value[row.parentId] || []).filter((r) => r !== row)
      const committed: SnRow = {
        id: -Date.now(),
        parentId: row.parentId,
        sn: trimmed,
        status: '',
        lastSn: trimmed,
        committed: true,
      }
      snChildrenMap.value[row.parentId] = [...list, committed, createBlankSnRow(row.parentId)]
    } else {
      ElMessage.error('SN提交失败')
    }
  } finally {
    row.submitting = false
  }
}

// 统计某设备真实的 SN 条数（不含空白新增行），用于子表标题展示
const countRealSn = (detailId: number): number => {
  const list = snChildrenMap.value[detailId] || []
  return list.filter((r) => !r.isBlank).length
}

// 展开/收起时同步已展开列表，并在展开时拉取 SN 子记录
const onExpandChange = (row: DetailTableRow, expandedRows: DetailTableRow[]) => {
  if (props.isEditing) return
  expandedKeys.value = expandedRows
    .map((r) => r.id)
    .filter((id): id is number => typeof id === 'number' && id > 0)
  // 维修订单的 SN 已内联在响应里，展开时不需再请求 /repair/get
  if (!props.isRepair && !row.isNew && row.id && row.id > 0 && expandedRows.includes(row)) {
    loadSnChildren(row.id)
  }
}

// 整行点击切换展开/收起（与展开箭头效果一致）；隐藏展开列后作为唯一入口
// 注意：点「展开箭头」本身也会冒泡触发 row-click，若不拦截会导致
// onExpandChange 刚把行展开、row-click 又立刻把它收起，空白行看不到。
// 因此当点击来自展开列（column.type === 'expand'）时直接跳过，展开只由 onExpandChange 处理。
const onRowClick = (row: DetailTableRow, column?: { type?: string }) => {
  if (props.isEditing) return
  if (column && column.type === 'expand') return
  // 新增行没有明细 id，不触发展开
  if (row.isNew || !row.id || row.id <= 0) return
  if (expandedKeys.value.includes(row.id)) {
    expandedKeys.value = expandedKeys.value.filter((id) => id !== row.id)
  } else {
    expandedKeys.value = [...expandedKeys.value, row.id]
    // 维修订单的 SN 已内联在响应里，展开时不需再请求 /repair/get
    if (!props.isRepair) loadSnChildren(row.id)
  }
}

// 给已有明细行添加可点击样式（光标变手型）；编辑中态不可展开，不显示手型
const rowClassName = ({ row }: { row: DetailTableRow }): string => {
  if (props.isEditing) return ''
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

// 监听 modelValue，当对话框打开时（含 destroy-on-close 每次重新挂载），获取/映射订单明细与 SN
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.order) {
      // 清空上一次展开的 SN 子记录，避免跨订单残留
      snChildrenMap.value = {}
      expandedKeys.value = []
      if (props.details && props.details.length) {
        // 维修订单：明细随列表接口内联返回，直接映射，不再请求订单明细接口
        detailList.value = props.details.map((d) => ({
          id: d.id,
          projectId: props.order!.id,
          belongProject: '',
          equipmentName: d.name,
          equipmentModel: d.model,
          manufacturer: d.brand,
          sn: (d.SN || []).join(','),
          status: '',
          quantity: d.number,
          unitPrice: 0,
          total: 0,
          type: d.type || '',
          spec: d.spec || '',
        }))
        // 维修订单的 SN 也已随响应内联返回（d.SN 数组），直接渲染成行
        props.details.forEach((d) => {
          const snList = d.SN || []
          snChildrenMap.value[d.id] = snList.map((sn, i) => ({
            id: i + 1,
            parentId: d.id,
            sn,
            status: '',
            lastSn: sn,
          }))
        })
      } else {
        fetchOrderDetails(props.order.id)
      }
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.detail-table {
  margin: 16px 0;
}

/* 展开列（箭头）默认显示，用户可直接点箭头展开 SN 子表；整行点击展开仍保留 */
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

.detail-table :deep(.el-table__header-wrapper th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: bold;
  text-align: center;
}
</style>
