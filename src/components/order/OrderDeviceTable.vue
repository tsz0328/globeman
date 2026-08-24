<template>
  <div class="detail-editor">
    <div class="detail-table-region" ref="tableRegionRef">
      <el-table :data="pageRows" border class="detail-table" row-key="rowKey">
        <!-- 表格列 -->
        <el-table-column type="index" label="序号" width="60" align="center" :index="indexMethod" />
        <el-table-column label="品名" width="100">
          <template #default="scope">
            <el-input
              v-if="scope.row.isNew"
              v-model="scope.row.equipmentName"
              aria-label="品名"
              size="small"
              class="new-row-input"
              :ref="(el: unknown) => setCellRef(scope.$index, 'equipmentName', el)"
              @keydown="onCellKeydown(scope.row, scope.$index, 'equipmentName', $event)"
              @blur="handleNewRowBlur(scope.row, $event)"
            />
            <span v-else>{{ scope.row.equipmentName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="型号" width="100">
          <template #default="scope">
            <el-input
              v-if="scope.row.isNew"
              v-model="scope.row.equipmentModel"
              aria-label="型号"
              size="small"
              class="new-row-input"
              :ref="(el: unknown) => setCellRef(scope.$index, 'equipmentModel', el)"
              @keydown="onCellKeydown(scope.row, scope.$index, 'equipmentModel', $event)"
              @blur="handleNewRowBlur(scope.row, $event)"
            />
            <span v-else>{{ scope.row.equipmentModel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="scope">
            <el-input
              v-if="scope.row.isNew"
              v-model="scope.row.type"
              aria-label="类型"
              size="small"
              class="new-row-input"
              :ref="(el: unknown) => setCellRef(scope.$index, 'type', el)"
              @keydown="onCellKeydown(scope.row, scope.$index, 'type', $event)"
              @blur="handleNewRowBlur(scope.row, $event)"
            />
            <span v-else>{{ scope.row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column label="品牌">
          <template #default="scope">
            <el-input
              v-if="scope.row.isNew"
              v-model="scope.row.manufacturer"
              aria-label="品牌"
              size="small"
              class="new-row-input"
              :ref="(el: unknown) => setCellRef(scope.$index, 'manufacturer', el)"
              @keydown="onCellKeydown(scope.row, scope.$index, 'manufacturer', $event)"
              @blur="handleNewRowBlur(scope.row, $event)"
            />
            <span v-else>{{ scope.row.manufacturer }}</span>
          </template>
        </el-table-column>
        <el-table-column label="参数" width="100">
          <template #default="scope">
            <el-input
              v-if="scope.row.isNew"
              v-model="scope.row.spec"
              aria-label="参数"
              size="small"
              class="new-row-input"
              :ref="(el: unknown) => setCellRef(scope.$index, 'spec', el)"
              @keydown="onCellKeydown(scope.row, scope.$index, 'spec', $event)"
              @blur="handleNewRowBlur(scope.row, $event)"
            />
            <span v-else>{{ scope.row.spec }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="80" align="center">
          <template #default="scope">
            <el-input
              v-if="scope.row.isNew"
              v-model="scope.row.quantity"
              aria-label="数量"
              size="small"
              class="new-row-input"
              :ref="(el: unknown) => setCellRef(scope.$index, 'quantity', el)"
              @input="(val: string) => filterNumberInput(scope.row, 'quantity', val)"
              @keydown="onCellKeydown(scope.row, scope.$index, 'quantity', $event)"
              @blur="handleNewRowBlur(scope.row, $event)"
            />
            <span v-else>{{ scope.row.quantity }}</span>
          </template>
        </el-table-column>
        <!-- 操作列：已有明细行可删除；空白新增行（isNew）删除禁用；已提交（锁定态）全部禁用 -->
        <el-table-column label="操作" width="80" align="center" fixed="right">
          <template #default="scope">
            <el-button
              :disabled="isSubmitted || scope.row.isNew"
              type="danger"
              size="small"
              :loading="deleteLoadingId === scope.row.id"
              @click.stop="handleRowDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="detail-editor__footer">
      <el-pagination
        v-if="detailTableData.length > pageSize"
        class="detail-pagination"
        background
        size="small"
        layout="total, prev, pager, next"
        :total="detailTableData.length"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDetail } from '@/composables/detail/useDetail'
import { type Order } from '@/composables/order/useOrder'
import type { OrderItem } from '@/api/order/OrderApi'

const props = defineProps<{
  // 弹窗打开状态（与父组件 el-dialog 的 modelValue 同步）
  modelValue: boolean
  order: Order | null
  // 父组件已计算的派生状态，作为只读 prop 传入，避免子组件重复计算订单状态
  isSubmitted: boolean
}>()

// 明细变更（新增/删除）后通知父组件重新拉取订单列表，刷新内嵌 details
const emit = defineEmits<{
  (e: 'changed'): void
}>()

const { detailList, createDetail, deleteDetail } = useDetail()

// 删除按钮 loading 标识
const deleteLoadingId = ref<string | number | null>(null)

interface DetailTableRow {
  rowKey: string
  id?: number
  isNew?: boolean
  equipmentName: string
  equipmentModel: string
  type: string
  manufacturer: string
  spec: string
  sn: string
  quantity: number | string
  unitPrice: number | string
  total: number
}

// 新增行唯一 key 自增计数器
let newRowSeq = 0

// 创建一个空白新增行对象（可编辑；rowKey 唯一，避免多空白行冲突）
const createBlankRow = (): DetailTableRow => ({
  rowKey: `new-row-${++newRowSeq}`,
  id: -1,
  isNew: true,
  equipmentName: '',
  equipmentModel: '',
  type: '',
  manufacturer: '',
  spec: '',
  sn: '',
  quantity: '',
  unitPrice: '',
  total: 0,
})

// 可编辑新增行数组（已有明细为只读；新增行逐行即时提交，提交后转成已有明细）
const blankRows = ref<DetailTableRow[]>([])

// 新行可编辑列顺序（决定回车 / 方向键切换列的顺序）
const NEW_ROW_COLUMNS = [
  'equipmentName',
  'equipmentModel',
  'type',
  'manufacturer',
  'spec',
  'quantity',
]

// 各单元格输入框实例（行号 + 列名定位，用于键盘导航切换焦点）
const cellRefs = ref<Record<string, { focus: () => void } | null>>({})
const setCellRef = (rowIndex: number, col: string, el: unknown) => {
  const key = `${rowIndex}:${col}`
  if (el) cellRefs.value[key] = el as { focus: () => void }
  else delete cellRefs.value[key]
}
const focusCell = (rowIndex: number, col: string) => {
  cellRefs.value[`${rowIndex}:${col}`]?.focus()
}

// 单元格键盘导航（走迷宫式：上下切行、左右切列；参考 AddOrderForm 的 OrderAddDeviceEditor）：
// - 回车：跳到下一列；最后一列（数量）回车 → 提交本行
// - 左/右方向键：切换列
// - 上/下方向键：切换行；页边界时向上→上一页、向下→下一页
const onCellKeydown = (row: DetailTableRow, rowIndex: number, col: string, e: KeyboardEvent) => {
  const idx = NEW_ROW_COLUMNS.indexOf(col)
  if (idx < 0) return
  if (e.key === 'Enter') {
    e.preventDefault()
    if (idx < NEW_ROW_COLUMNS.length - 1) {
      focusCell(rowIndex, NEW_ROW_COLUMNS[idx + 1]!)
    } else if (rowIndex < pageRows.value.length - 1) {
      focusCell(rowIndex + 1, NEW_ROW_COLUMNS[0]!)
    } else {
      // 本页最后一行末列回车 → 提交本行（若为新增行），再跳到下一页（空白行自动铺满）
      handleNewRowSave(row)
      goNextPage()
    }
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    if (idx < NEW_ROW_COLUMNS.length - 1) {
      focusCell(rowIndex, NEW_ROW_COLUMNS[idx + 1]!)
    } else if (rowIndex < pageRows.value.length - 1) {
      // 末列 → 下一行首列
      focusCell(rowIndex + 1, NEW_ROW_COLUMNS[0]!)
    } else {
      // 最后一行末列 → 下一页首行首列
      goNextPage()
    }
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    if (idx > 0) {
      focusCell(rowIndex, NEW_ROW_COLUMNS[idx - 1]!)
    } else if (rowIndex > 0) {
      // 首列 → 上一行末列
      focusCell(rowIndex - 1, NEW_ROW_COLUMNS[NEW_ROW_COLUMNS.length - 1]!)
    } else if (currentPage.value > 1) {
      // 第一行首列 → 上一页最后一行末列
      goPrevPageAtCol(NEW_ROW_COLUMNS[NEW_ROW_COLUMNS.length - 1]!)
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (rowIndex > 0) {
      focusCell(rowIndex - 1, col)
    } else if (currentPage.value > 1) {
      goPrevPageAtCol(col)
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (rowIndex < pageRows.value.length - 1) {
      focusCell(rowIndex + 1, col)
    } else {
      goNextPageAtCol(col)
    }
  }
}

// 失焦提交：新行任意输入框失焦、且焦点真正离开新增行（非同行列间切换）时提交设备
const handleNewRowBlur = (row: DetailTableRow, e: FocusEvent) => {
  const next = e.relatedTarget as HTMLElement | null
  if (next && next.closest && next.closest('.new-row-input')) {
    return
  }
  handleNewRowSave(row)
}

// 计算表格数据：已有明细（只读）+ 可编辑新增行
const detailTableData = computed<DetailTableRow[]>(() => {
  const rows: DetailTableRow[] = detailList.value.map((item) => ({
    rowKey: item.rowKey ?? String(item.id),
    id: item.id,
    equipmentName: item.equipmentName,
    equipmentModel: item.equipmentModel,
    type: item.type || '',
    manufacturer: item.manufacturer || '',
    spec: item.spec || '',
    sn: item.sn || '',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
  }))
  // 已提交（锁定态）不再展示新增行；编辑中展示可编辑新增行
  if (!props.isSubmitted) rows.push(...blankRows.value)
  return rows
})

// 确保指定页已被新增空白行填满（不足则补足），使每页都“占满”（与 AddOrderForm 一致）
const ensurePageFilled = (page: number) => {
  const needed = page * pageSize.value
  const existing = detailTableData.value.length
  if (existing < needed) {
    const blanks = Array.from({ length: needed - existing }, () => createBlankRow())
    blankRows.value = blankRows.value.concat(blanks)
  }
}

// 打开表单 / 测量后：按可容纳行数把首页铺满可编辑空白行
const prefillFirstPage = () => {
  measure()
  blankRows.value = []
  ensurePageFilled(1)
  currentPage.value = 1
  // 编辑中（展示空白新增行）：聚焦首个空白新增行（位于已有明细正下方），打开即可直接录入
  if (!props.isSubmitted) {
    nextTick(() => focusFirstBlankRow())
  }
}

// 聚焦首个空白新增行（位于已有明细正下方，可能跨页）
const focusFirstBlankRow = () => {
  const existing = detailList.value.length
  const page = Math.floor(existing / pageSize.value) + 1
  if (page !== currentPage.value) {
    currentPage.value = page
    ensurePageFilled(page)
  }
  nextTick(() => {
    const local = existing - (currentPage.value - 1) * pageSize.value
    focusCell(local, NEW_ROW_COLUMNS[0]!)
  })
}

// 暴露给父组件：父组件在 el-dialog 的 @opened（打开动画结束、布局就绪）时调用，
// 此时测量高度最可靠，避免首开时过渡未结束导致测量的行数偏小、空白行铺不满
defineExpose({ prefillFirstPage })

// 分页：每页行数由「弹窗可容纳行数」动态决定（参考 AddOrderForm 的 OrderAddDeviceEditor），
// 但不自动补空白行铺满——仅按实际行数分页展示
const currentPage = ref(1)
const pageSize = ref(10)
const pageRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return detailTableData.value.slice(start, start + pageSize.value)
})

// 序号列连续编号（跨页不断号）
const indexMethod = (i: number) => (currentPage.value - 1) * pageSize.value + i + 1

// 动态测量：表格区域高度 + 实测行高/表头高 → 计算每页行数，让表格铺满弹窗
const tableRegionRef = ref<HTMLElement>()
const ROW_H = ref(40) // el-table small 行高（兜底值，渲染后实测覆盖）
const HEADER_H = ref(41) // 表头高度（兜底值）

const measure = () => {
  const region = tableRegionRef.value
  if (!region) return
  const h = region.clientHeight
  if (h <= 0) return // 弹窗隐藏时区域高度为 0，跳过

  const tableEl = region.querySelector('.el-table') as HTMLElement | null
  if (tableEl) {
    const headerEl = tableEl.querySelector('.el-table__header-wrapper') as HTMLElement | null
    const firstRow = tableEl.querySelector('.el-table__row') as HTMLElement | null
    if (headerEl) HEADER_H.value = headerEl.offsetHeight
    if (firstRow) ROW_H.value = firstRow.offsetHeight
  }
  // 按可容纳行数（floor）决定每页行数
  const fit = Math.floor((h - HEADER_H.value) / ROW_H.value)
  pageSize.value = Math.max(1, fit)
}

let ro: ResizeObserver | null = null
onMounted(() => {
  ro = new ResizeObserver(() => {
    measure()
    // 窗口缩放时同步每页行数（不重新预填，避免打扰已录入的内容）
  })
  if (tableRegionRef.value) ro.observe(tableRegionRef.value)
})
onUnmounted(() => ro?.disconnect())

// 切页：跳到的页若未填满则补空白行，保证每页都占满
const handlePageChange = (p: number) => {
  currentPage.value = p
  ensurePageFilled(p)
}

// 方向键向下翻页：跳到下一页首行，保持当前列（新页自动铺满空白行）
const goNextPageAtCol = (col: string) => {
  currentPage.value += 1
  ensurePageFilled(currentPage.value)
  nextTick(() => focusCell(0, col))
}

// 回车末行翻页：跳到下一页首行首列（新页自动铺满空白行）
const goNextPage = () => {
  currentPage.value += 1
  ensurePageFilled(currentPage.value)
  nextTick(() => focusCell(0, NEW_ROW_COLUMNS[0]!))
}

// 方向键向上翻页：跳到上一页最后一行，保持当前列
const goPrevPageAtCol = (col: string) => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  nextTick(() => focusCell(pageRows.value.length - 1, col))
}

watch(
  () => detailTableData.value.length,
  () => {
    const maxPage = Math.max(1, Math.ceil(detailTableData.value.length / pageSize.value))
    if (currentPage.value > maxPage) currentPage.value = maxPage
  },
)

// 删除已有明细行（DELETE /client/order/deleteOrderDetail?id=）
const handleRowDelete = async (row: DetailTableRow) => {
  if (!row.id || row.id <= 0) return
  try {
    await ElMessageBox.confirm(`确定要删除设备「${row.equipmentName}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    deleteLoadingId.value = row.id
    const success = await deleteDetail(row.id)
    if (success) {
      ElMessage.success('删除成功')
      // 本地 detailList 已由 useDetail 移除该行，再通知父组件重拉，同步 order.details
      emit('changed')
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  } finally {
    deleteLoadingId.value = null
  }
}

// 处理新增行保存（逐行即时提交）：成功后从可编辑新增行中移除，并确保末尾仍有空白行
const handleNewRowSave = async (row: DetailTableRow) => {
  if (!row.isNew) return
  if (!row.equipmentName && !row.equipmentModel && !row.quantity) {
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
  if (!props.order) return

  const success = await createDetail({
    order: props.order.id,
    name: row.equipmentName,
    model: row.equipmentModel,
    type: row.type || '',
    brand: row.manufacturer || '',
    spec: row.spec || '',
    number: quantity,
  })
  if (success) {
    ElMessage.success('添加设备成功')
    // 从可编辑新增行中移除已提交行（新明细 id 由后端生成，父组件重拉后出现在只读明细里）
    blankRows.value = blankRows.value.filter((r) => r !== row)
    // 通知父组件重新拉取订单列表，刷新内嵌 details
    emit('changed')
    // 确保当前页末尾仍有空白行可继续录入
    ensurePageFilled(currentPage.value)
    await nextTick()
  } else {
    ElMessage.error('添加设备失败')
  }
}

// 限制数量输入：只保留数字（纯整数）
const filterNumberInput = (row: DetailTableRow, field: 'quantity', val: string) => {
  if (field === 'quantity') {
    // 数量：只保留数字，纯整数
    const cleaned = val.replace(/[^\d]/g, '')
    if (cleaned !== val) {
      row[field] = cleaned as never
    }
  }
}

// 普通订单：明细已内嵌在 getOrder 响应（order.details），直接映射，不再请求 getInfoDetails
const mapOrderDetails = (details: OrderItem[]) => {
  if (!props.order) return
    detailList.value = details.map((d) => ({
    id: d.id,
    rowKey: String(d.id),
    projectId: props.order!.id,
    belongProject: '',
    equipmentName: d.name,
    equipmentModel: d.model,
    manufacturer: d.brand,
    sn: '',
    status: '',
    quantity: d.number,
    unitPrice: 0,
    total: 0,
    type: d.type || '',
    spec: d.spec || '',
  }))
}

// 监听 modelValue，当对话框打开时（含 destroy-on-close 每次重新挂载），映射订单明细
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.order) {
      mapOrderDetails(props.order.details ?? [])
      // 铺满首页空白行由父组件在 el-dialog @opened（布局就绪）时调 prefillFirstPage，
      // 避免首开过渡未结束导致测量行数偏小
    }
  },
  { immediate: true },
)

// 明细变更（新增/删除）后父组件重拉订单并更新 order 引用 → 弹窗打开时重新映射
watch(
  () => props.order,
  () => {
    if (!props.modelValue || !props.order) return
    mapOrderDetails(props.order.details ?? [])
  },
)
</script>

<style scoped>
.detail-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-table-region {
  flex: 1;
  min-height: 0;
}

.detail-table {
  width: 100%;
}

.detail-table :deep(.el-table),
.detail-table :deep(.el-table__inner-wrapper),
.detail-table :deep(table) {
  width: 100% !important;
}

.detail-table :deep(.el-table__header-wrapper th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: bold;
  text-align: center;
}

/* 底部操作栏：分页高度固定，避免分页出现时挤压表格区域、
   导致 ResizeObserver 重算每页行数的反馈循环（与 OrderAddDeviceEditor 一致） */
.detail-editor__footer {
  flex-shrink: 0;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 8px;
}

.detail-pagination {
  margin: 0;
}
</style>
