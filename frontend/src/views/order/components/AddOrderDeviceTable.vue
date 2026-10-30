<script lang="ts">
// 设备明细行：纯本地录入，暂不调用保存接口
export interface DetailTableRow {
  equipmentName: string
  equipmentModel: string
  /** 原型号（维修改造单：行数据带值或导入改造清单时显示/提交） */
  originalModel: string
  /** 改型号（维修改造单：行数据带值或导入改造清单时显示/提交） */
  refitModel: string
  /** 加工项目（维修单两种形态都有；其他类型历史数据带值时显示） */
  processItem: string
  brand: string
  spec: string
  sn: string
}

export const createBlankRow = (): DetailTableRow => ({
  equipmentName: '',
  equipmentModel: '',
  originalModel: '',
  refitModel: '',
  processItem: '',
  brand: '',
  spec: '',
  sn: '',
})
</script>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { ElTable } from 'element-plus'
import TableNavHint from '@/components/common/TableNavHint.vue'
import { computeColumnWidths, type ColSpec } from '@/views/order/utils/autoColumnWidth'

// 与父组件双向绑定的设备明细数组
const rows = defineModel<DetailTableRow[]>('rows', { required: true })

// 订单类型 + 行数据共同驱动条件列：
// - 维修改造型（行数据带 原型号/改型号 值，如「原型号/改型号」清单）→ 显示 原型号/改型号，替代 型号 列
// - 维修型号型（行数据带 型号 值，如「型号/加工项目」清单）→ 显示 型号 列
// - 销售单与采购单字段一致（品名/型号/品牌/参数/SN码）
const props = defineProps<{
  /** 订单类型两字值（销售/采购/维修），由父表单 form.type 传入驱动条件列 */
  orderType?: string
}>()
const isRepair = computed(() => props.orderType === '维修')
// 行数据是否带 原型号/改型号 值（含导入预填与手工录入）
const hasRefitData = computed(() =>
  rows.value.some((r) => r.originalModel.trim() || r.refitModel.trim()),
)
const showRefitColumns = computed(() => hasRefitData.value)
const showModelColumn = computed(() => !hasRefitData.value)
// 加工项目：维修单两种形态（改造型/型号型）都有；其他类型仅历史数据带值时显示
const showProcessColumn = computed(
  () => isRepair.value || rows.value.some((r) => r.processItem.trim()),
)

// 自动列宽：与订单详情弹窗同一套——固定列按内容测 :width，「参数」作弹性列 :min-width
// 吸收剩余空间（既不换行也不留大片空白）。录入态无固定只读行，直接对全量 rows 测量；
// 空白行内容为空不影响，导入有数据时列宽即贴合内容。
const colSpecs = computed<ColSpec[]>(() => {
  const specs: ColSpec[] = [{ key: 'equipmentName', label: '品名' }]
  if (showRefitColumns.value) {
    specs.push(
      { key: 'originalModel', label: '原型号' },
      { key: 'refitModel', label: '改型号' },
    )
  }
  if (showModelColumn.value) {
    specs.push({ key: 'equipmentModel', label: '型号' })
  }
  if (showProcessColumn.value) {
    specs.push({ key: 'processItem', label: '加工项目' })
  }
  specs.push(
    { key: 'brand', label: '品牌' },
    { key: 'spec', label: '参数', flex: true },
    { key: 'sn', label: 'SN码' },
  )
  return specs
})
const colWidths = computed(() => computeColumnWidths(rows.value, colSpecs.value))

// 表格实例：行数据（导入/预填）变化后强制重新布局，确保首开与导入后列宽立刻生效
const tableRef = ref<InstanceType<typeof ElTable>>()
watch(
  () => rows.value.length,
  () => nextTick(() => tableRef.value?.doLayout()),
)

// 键盘导航提示（表格上方小字）：本表只做本地录入，提交随整个订单表单
const NAV_HINT = '↑↓←→ 切换输入框 · Enter 跳下一格 · 文字内可先用 ←→ 移动光标'

// 设备明细分页：每页行数由“表单可容纳行数”动态决定（打开时铺满首页）
const currentPage = ref(1)
const pageSize = ref(7)
const pageRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return rows.value.slice(start, start + pageSize.value)
})

// 序号列连续编号（跨页不断号）
const indexMethod = (i: number) => (currentPage.value - 1) * pageSize.value + i + 1

// 动态测量：根容器可用高度 + 实测行高/表头高 → 计算每页行数，并反推表格区精确高度
// 基准说明：不能用表格区自身高度做基准——它现在按内容收缩（余量沉到分页下方），
// 否则会变成「高度决定行数、行数又决定高度」的自激循环。故统一读根容器
// （高度由父弹窗 80vh 给定，稳定），减去提示行与底部分页栏后才是表格可用高度。
const rootRef = ref<HTMLElement>()
const hintRef = ref<HTMLElement>()
const footerRef = ref<HTMLElement>()
const tableRegionRef = ref<HTMLElement>()
const regionH = ref<number | null>(null) // 表格区精确高度（表头 + fit 行）
const ROW_H = ref(40) // el-table small 行高（兜底值，渲染后实测覆盖）
const HEADER_H = ref(41) // 表头高度（兜底值）

// 含 margin 的外框高度：分页栏可能带 margin-top，只取 rect.height 会少算
const outerH = (el: HTMLElement | undefined) => {
  if (!el) return 0
  const cs = getComputedStyle(el)
  return (
    el.getBoundingClientRect().height +
    parseFloat(cs.marginTop || '0') +
    parseFloat(cs.marginBottom || '0')
  )
}

const measure = () => {
  const root = rootRef.value
  const region = tableRegionRef.value
  if (!root || !region) return
  const h = root.clientHeight
  if (h <= 0) return // 弹窗隐藏时根容器高度为 0，跳过

  const tableEl = region.querySelector('.el-table') as HTMLElement | null
  if (tableEl) {
    const headerEl = tableEl.querySelector('.el-table__header-wrapper') as HTMLElement | null
    const firstRow = tableEl.querySelector('.el-table__row') as HTMLElement | null
    // 用 getBoundingClientRect 取亚像素值（offsetHeight 会取整，累积误差让高度算不准）
    if (headerEl) HEADER_H.value = headerEl.getBoundingClientRect().height
    if (firstRow) ROW_H.value = firstRow.getBoundingClientRect().height
  }
  const avail = h - outerH(hintRef.value) - outerH(footerRef.value)
  // 按可容纳行数（floor）决定每页行数
  const fit = Math.floor((avail - HEADER_H.value) / ROW_H.value)
  const size = Math.max(1, fit)
  pageSize.value = size
  // 表格区只占「表头 + fit 行」，剩下的余量不再夹在表格与分页之间，
  // 而是由 flex 布局沉到底部分页栏下方。
  // 没有任何数据行时（空态高度与真实行高不同）退回自适应，避免回写的高度偏小压住分页
  regionH.value = pageRows.value.length > 0 ? HEADER_H.value + size * ROW_H.value : null
}

// 表格区高度样式：未测出前保持自适应
const regionStyle = computed(() =>
  regionH.value == null ? undefined : { height: `${regionH.value}px` },
)

// 打开表单时调用：按可容纳行数预填空白行，铺满首页
const prefillFirstPage = () => {
  measure()
  const added = Math.max(0, pageSize.value - rows.value.length)
  if (added > 0) {
    // 整体重赋值（defineModel 会触发 update:rows，确保父子同步）
    rows.value = rows.value.concat(Array.from({ length: added }, () => createBlankRow()))
  }
  currentPage.value = 1
  // 首次打开时表格还没有数据行，行高只能取兜底值（40），算出的可容纳行数偏多；
  // 而表格区高度是按「表头 + fit 行」精确回写的，行高估小就会溢出压住分页。
  // 故补行后重测一次真实行高进行修正，并把本次多补的空白行裁掉（不动已有数据）
  nextTick(() => {
    measure()
    if (added <= 0) return
    const excess = Math.min(added, rows.value.length - pageSize.value)
    if (excess > 0) rows.value = rows.value.slice(0, rows.value.length - excess)
  })
}

let ro: ResizeObserver | null = null

// 弹窗打开（@opened，布局就绪）时由父组件调用：挂载 ResizeObserver 监听容器尺寸变化，
// 并加 window resize 兜底，确保窗口缩放时每页行数实时重算（避免仅首开测量、缩放不刷新）
const startAutoPageSize = () => {
  // 先断开旧观察者，避免弹窗多次打开时重复挂载
  ro?.disconnect()
  ro = new ResizeObserver(() => {
    measure()
    // 窗口缩放时同步每页行数（不重新预填，避免打扰已录入的内容）
  })
  // 观察根容器而非表格区：表格区高度由 measure 反推写入，观察它会自激
  if (rootRef.value) ro.observe(rootRef.value)
  // window resize 兜底：直接触发测量，覆盖 ResizeObserver 不灵敏的场景
  window.removeEventListener('resize', measure)
  window.addEventListener('resize', measure)
}

// 暴露给父组件：prefillFirstPage 在 @opened 首测高度预填空白行；startAutoPageSize 挂载缩放监听
defineExpose({ prefillFirstPage, startAutoPageSize })

onUnmounted(() => {
  ro?.disconnect()
  window.removeEventListener('resize', measure)
})

// 切页：跳到的页若未填满则补空白行，保证每页都占满
const handlePageChange = (p: number) => {
  currentPage.value = p
  ensurePageFilled(p)
}

// 行数变化后防止当前页越界
watch(
  () => rows.value.length,
  () => {
    const maxPage = Math.max(1, Math.ceil(rows.value.length / pageSize.value))
    if (currentPage.value > maxPage) currentPage.value = maxPage
  },
)

// 设备明细列顺序（决定键盘导航的列流转顺序），与表格列一致，随订单类型 + 行数据形态切换：
// 维修改造型用 原型号/改型号 替代 型号 列；加工项目按维修/数据带值显示
const rowColumns = computed(() => {
  const cols: string[] = ['equipmentName']
  if (showRefitColumns.value) cols.push('originalModel', 'refitModel')
  if (showModelColumn.value) cols.push('equipmentModel')
  if (showProcessColumn.value) cols.push('processItem')
  cols.push('brand', 'spec', 'sn')
  return cols
})

// 各单元格输入框实例（行号 + 列名 定位，用于键盘导航时切换焦点）
// input 为 ElInput 暴露的原生 input 元素，用于跳转后摆放光标位置
type CellInput = { focus: () => void; input?: HTMLInputElement | null }
const cellRefs = ref<Record<string, CellInput | null>>({})
const setCellRef = (rowIndex: number, col: string, el: unknown) => {
  const key = `${rowIndex}:${col}`
  if (el) cellRefs.value[key] = el as CellInput
  else delete cellRefs.value[key]
}

// 跳转后光标落点：从左边进来（右键/回车）落到文本开头，从右边进来（左键）落到文本末尾。
// 这样落点始终在“进来的那一侧”，继续按同方向键才能穿过文本逐字移动，而不是一按就跳格。
const focusCell = (rowIndex: number, col: string, caret: 'start' | 'end' = 'start') => {
  const cell = cellRefs.value[`${rowIndex}:${col}`]
  if (!cell) return
  cell.focus()
  const input = cell.input
  if (input && typeof input.setSelectionRange === 'function') {
    const pos = caret === 'start' ? 0 : input.value.length
    input.setSelectionRange(pos, pos)
  }
}

// 左右键是否应当“留在文本里移动光标”（不跳格）：
// - 有选区 或 按住 Shift（选词）→ 交给浏览器原生处理
// - 右键且光标不在文本末尾、左键且光标不在文本开头 → 交给浏览器在文字间移动
// - 只有光标已经顶到文本边界（或空输入框）时，才返回值 false 由调用方跳格
const shouldMoveCaretInside = (e: KeyboardEvent) => {
  if (e.shiftKey) return true
  const input = e.target as HTMLInputElement | null
  if (!input || typeof input.selectionStart !== 'number' || input.selectionStart === null) {
    return false
  }
  // 存在选区：先让浏览器把选区收缩成光标
  if (input.selectionStart !== input.selectionEnd) return true
  const len = input.value.length
  return e.key === 'ArrowRight' ? input.selectionStart < len : input.selectionStart > 0
}

// 单元格键盘导航（与订单详情弹窗一致，像走迷宫一样上下/左右移动焦点）：
// - 回车：跳到下一列；末列回车 → 下一行首列；最后一行末列回车 → 跳到下一页（空白行自动占满）
// - 左/右方向键：切换列
// - 上/下方向键：切换行；页边界时向上→上一页、向下→下一页
const onCellKeydown = (
  _row: DetailTableRow,
  rowIndex: number,
  col: string,
  e: KeyboardEvent,
) => {
  const idx = rowColumns.value.indexOf(col)
  if (idx < 0) return
  if (e.key === 'Enter') {
    e.preventDefault()
    if (idx < rowColumns.value.length - 1) {
      focusCell(rowIndex, rowColumns.value[idx + 1]!)
    } else if (rowIndex < pageRows.value.length - 1) {
      // 跳到本页下一行首列
      focusCell(rowIndex + 1, rowColumns.value[0]!)
    } else {
      // 本页最后一行末列回车 → 跳到下一页（空白行自动占满）
      goNextPage()
    }
  } else if (e.key === 'ArrowRight') {
    if (shouldMoveCaretInside(e)) return // 光标还没到文本末尾 → 在文字间右移
    e.preventDefault()
    if (idx < rowColumns.value.length - 1) {
      focusCell(rowIndex, rowColumns.value[idx + 1]!, 'start')
    } else if (rowIndex < pageRows.value.length - 1) {
      // 末列 → 下一行首列
      focusCell(rowIndex + 1, rowColumns.value[0]!, 'start')
    } else {
      // 最后一行末列 → 下一页首行首列
      goNextPage()
    }
  } else if (e.key === 'ArrowLeft') {
    if (shouldMoveCaretInside(e)) return // 光标还没到文本开头 → 在文字间左移
    e.preventDefault()
    if (idx > 0) {
      focusCell(rowIndex, rowColumns.value[idx - 1]!, 'end')
    } else if (rowIndex > 0) {
      // 首列 → 上一行末列
      focusCell(rowIndex - 1, rowColumns.value[rowColumns.value.length - 1]!, 'end')
    } else if (currentPage.value > 1) {
      // 第一行首列 → 上一页最后一行末列
      goPrevPageAtCol(rowColumns.value[rowColumns.value.length - 1]!)
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (rowIndex > 0) {
      focusCell(rowIndex - 1, col, 'end') // 从下方进来 → 落到文本末尾
    } else if (currentPage.value > 1) {
      goPrevPageAtCol(col)
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (rowIndex < pageRows.value.length - 1) {
      focusCell(rowIndex + 1, col, 'start') // 从上方进来 → 落到文本开头
    } else {
      goNextPageAtCol(col)
    }
  }
}

// 确保指定页已被空白行填满（不足则补足），使每页都“占满”
const ensurePageFilled = (page: number) => {
  const needed = page * pageSize.value
  if (rows.value.length < needed) {
    rows.value = rows.value.concat(
      Array.from({ length: needed - rows.value.length }, () => createBlankRow()),
    )
  }
}

// “下一页”：跳到表格下一页，并补空白行让该页占满，便于继续录单
const goNextPage = () => {
  currentPage.value += 1
  ensurePageFilled(currentPage.value)
  // 跳到新页首行首列，便于连续录单
  nextTick(() => focusCell(0, rowColumns.value[0]!, 'start'))
}

// 方向键向下翻页：跳到下一页首行，保持当前列
const goNextPageAtCol = (col: string) => {
  currentPage.value += 1
  ensurePageFilled(currentPage.value)
  nextTick(() => focusCell(0, col, 'start'))
}

// 方向键向上翻页：跳到上一页最后一行，保持当前列
const goPrevPageAtCol = (col: string) => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  nextTick(() => focusCell(pageRows.value.length - 1, col, 'end'))
}
</script>

<template>
  <div class="detail-editor" ref="rootRef">
    <div ref="hintRef" class="detail-hint"><TableNavHint :text="NAV_HINT" /></div>
    <div class="detail-table-region" ref="tableRegionRef" :style="regionStyle">
      <el-table :data="pageRows" border class="detail-table" ref="tableRef">
      <el-table-column type="index" label="序号" width="60" align="center" :index="indexMethod" />
      <el-table-column label="品名" :width="colWidths.equipmentName">
        <template #default="scope">
          <el-input v-model="scope.row.equipmentName" aria-label="品名" size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'equipmentName', el)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'equipmentName', $event)" />
        </template>
      </el-table-column>
      <el-table-column v-if="showModelColumn" label="型号" :width="colWidths.equipmentModel">
        <template #default="scope">
          <el-input v-model="scope.row.equipmentModel" aria-label="型号" size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'equipmentModel', el)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'equipmentModel', $event)" />
        </template>
      </el-table-column>
      <!-- 维修改造型特有列：原型号 / 改型号（行数据带值时显示，替代型号列）+ 加工项目 -->
      <el-table-column v-if="showRefitColumns" label="原型号" :width="colWidths.originalModel">
        <template #default="scope">
          <el-input v-model="scope.row.originalModel" aria-label="原型号" size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'originalModel', el)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'originalModel', $event)" />
        </template>
      </el-table-column>
      <el-table-column v-if="showRefitColumns" label="改型号" :width="colWidths.refitModel">
        <template #default="scope">
          <el-input v-model="scope.row.refitModel" aria-label="改型号" size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'refitModel', el)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'refitModel', $event)" />
        </template>
      </el-table-column>
      <el-table-column v-if="showProcessColumn" label="加工项目" :width="colWidths.processItem">
        <template #default="scope">
          <el-input v-model="scope.row.processItem" aria-label="加工项目" size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'processItem', el)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'processItem', $event)" />
        </template>
      </el-table-column>
      <el-table-column label="品牌" :width="colWidths.brand">
        <template #default="scope">
          <el-input v-model="scope.row.brand" aria-label="品牌" size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'brand', el)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'brand', $event)" />
        </template>
      </el-table-column>
      <el-table-column label="参数" :min-width="colWidths.spec">
        <template #default="scope">
          <el-input v-model="scope.row.spec" aria-label="参数" size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'spec', el)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'spec', $event)" />
        </template>
      </el-table-column>
      <el-table-column label="SN码" :width="colWidths.sn">
        <template #default="scope">
          <el-input v-model="scope.row.sn" aria-label="SN码" size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'sn', el)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'sn', $event)" />
        </template>
      </el-table-column>
    </el-table>
    </div>

    <div class="editor-footer" ref="footerRef">
      <el-pagination
        v-if="rows.length > 0"
        class="detail-pagination"
        background
        layout="total, prev, pager, next"
        :total="rows.length"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.detail-editor {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
}

.detail-hint {
  flex: none;
}

/* 表格区不再撑满（flex:1）：高度由 measure() 按「表头 + fit 行」精确回写，
   使表格底边与分页紧贴，装不下整行的余量沉到分页栏下方 */
.detail-table-region {
  flex: none;
}

.detail-table {
  width: 100%;
}

.detail-table :deep(.el-table__header-wrapper th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: bold;
  text-align: center;
}

/* 底部操作栏：按钮与分页并排且高度固定，避免分页出现时挤压表格区域、
   导致 ResizeObserver 重算每页行数（10→9 的反馈循环） */
.editor-footer {
  flex-shrink: 0;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-pagination {
  margin: 0;
}
</style>
