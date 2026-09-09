<template>
  <div class="detail-editor" ref="rootRef">
    <!-- 键盘导航提示：仅编辑态（有可录入空白行）时展示；已提交为只读，无导航 -->
    <div v-if="!isSubmitted" ref="hintRef" class="detail-hint">
      <TableNavHint :text="NAV_HINT" />
    </div>
    <div class="detail-table-region" ref="tableRegionRef" :style="regionStyle">
      <el-table :data="pageRows" border class="detail-table" row-key="rowKey">
        <!-- 表格列 -->
        <el-table-column type="index" label="序号" width="50" align="center" :index="indexMethod" />
        <el-table-column label="品名" min-width="140" align="center">
          <template #default="scope">
            <!-- 已有明细行（含已提交锁定态）一律纯文本：无输入框、无选中态；
                 只有新增空白行渲染 el-input。没有输入框 → 键盘导航/失焦提交天然不涉及已存在数据 -->
            <span v-if="!scope.row.isNew" class="readonly-text">{{ scope.row.equipmentName }}</span>
            <el-input
              v-else
              v-model="scope.row.equipmentName"
              aria-label="品名"
              size="small"
              :ref="(el: unknown) => setCellRef(scope.$index, 'equipmentName', el)"
              @keydown="onCellKeydown(scope.row, scope.$index, 'equipmentName', $event)"
              @blur="handleNewRowBlur(scope.row, $event)"
            />
          </template>
        </el-table-column>
        <el-table-column label="型号" min-width="150" align="center">
          <template #default="scope">
            <span v-if="!scope.row.isNew" class="readonly-text">{{ scope.row.equipmentModel }}</span>
            <el-input
              v-else
              v-model="scope.row.equipmentModel"
              aria-label="型号"
              size="small"
              :ref="(el: unknown) => setCellRef(scope.$index, 'equipmentModel', el)"
              @keydown="onCellKeydown(scope.row, scope.$index, 'equipmentModel', $event)"
              @blur="handleNewRowBlur(scope.row, $event)"
            />
          </template>
        </el-table-column>
        <el-table-column label="类型" min-width="110" align="center">
          <template #default="scope">
            <span v-if="!scope.row.isNew" class="readonly-text">{{ scope.row.type }}</span>
            <el-input
              v-else
              v-model="scope.row.type"
              aria-label="类型"
              size="small"
              :ref="(el: unknown) => setCellRef(scope.$index, 'type', el)"
              @keydown="onCellKeydown(scope.row, scope.$index, 'type', $event)"
              @blur="handleNewRowBlur(scope.row, $event)"
            />
          </template>
        </el-table-column>
        <el-table-column label="品牌" min-width="100" align="center">
          <template #default="scope">
            <span v-if="!scope.row.isNew" class="readonly-text">{{ scope.row.manufacturer }}</span>
            <el-input
              v-else
              v-model="scope.row.manufacturer"
              aria-label="品牌"
              size="small"
              :ref="(el: unknown) => setCellRef(scope.$index, 'manufacturer', el)"
              @keydown="onCellKeydown(scope.row, scope.$index, 'manufacturer', $event)"
              @blur="handleNewRowBlur(scope.row, $event)"
            />
          </template>
        </el-table-column>
        <el-table-column label="参数" min-width="130" align="center">
          <template #default="scope">
            <span v-if="!scope.row.isNew" class="readonly-text">{{ scope.row.spec }}</span>
            <el-input
              v-else
              v-model="scope.row.spec"
              aria-label="参数"
              size="small"
              :ref="(el: unknown) => setCellRef(scope.$index, 'spec', el)"
              @keydown="onCellKeydown(scope.row, scope.$index, 'spec', $event)"
              @blur="handleNewRowBlur(scope.row, $event)"
            />
          </template>
        </el-table-column>
        <el-table-column label="数量" width="80" align="center">
          <template #default="scope">
            <span v-if="!scope.row.isNew" class="readonly-text">{{ scope.row.quantity }}</span>
            <el-input
              v-else
              v-model="scope.row.quantity"
              aria-label="数量"
              size="small"
              :ref="(el: unknown) => setCellRef(scope.$index, 'quantity', el)"
              @input="(val: string) => filterNumberInput(scope.row, 'quantity', val)"
              @keydown="onCellKeydown(scope.row, scope.$index, 'quantity', $event)"
              @blur="handleNewRowBlur(scope.row, $event)"
            />
          </template>
        </el-table-column>
        <!-- 操作列：已有明细行可删除；空白新增行（isNew）删除禁用；已提交（锁定态）全部禁用 -->
        <el-table-column label="操作" width="73" align="center" fixed="right">
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

    <div class="detail-editor__footer" ref="footerRef">
      <!-- 编辑态：与 AddSnCodeDialog 一致，提供「下一页」按钮——跳到新页并自动补满空白行，便于连续录单。
           已提交（只读锁定态）无空白录入行，不需要该按钮 -->
      <el-button v-if="!isSubmitted" class="detail-next-page" @click="goNextPage">下一页</el-button>
      <el-pagination
        v-if="detailTableData.length > 0"
        class="detail-pagination"
        background
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
import TableNavHint from '@/components/common/TableNavHint.vue'

// 键盘导航提示：新行为「回车 / 失焦即时提交」，与本表 keyboard 规则一致
const NAV_HINT = '↑↓←→ 切换输入框 · Enter 跳下一格 · 离开本行自动保存该设备'

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
// input 为 ElInput 暴露的原生 input 元素，用于跳转后摆放光标位置
type CellInput = { focus: () => void; input?: HTMLInputElement | null }
const cellRefs = ref<Record<string, CellInput | null>>({})
const setCellRef = (rowIndex: number, col: string, el: unknown) => {
  const key = `${rowIndex}:${col}`
  if (el) cellRefs.value[key] = el as CellInput
  else delete cellRefs.value[key]
}

// 跳转后光标落点：从左边进来（右键/回车）落到文本开头，从右边进来（左键）落到文本末尾，
// 这样落点始终在“进来的那一侧”，继续按同方向键才能穿过文本逐字移动，而不是一按就跳格
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

// 页内行号 → 全局行号（跨页连续）
const toGlobalIndex = (pageIndex: number) => (currentPage.value - 1) * pageSize.value + pageIndex

// 沿方向找下一个可编辑行（isNew 新增行）的全局索引；没有返回 -1。
// 已有明细行渲染为纯文本、没有输入框，无法承接焦点，导航时必须跳过，
// 否则方向键扫到已存在行会表现为“卡住不动”
const findEditableRow = (fromGlobal: number, delta: number): number => {
  let i = fromGlobal + delta
  while (i >= 0 && i < detailTableData.value.length) {
    if (detailTableData.value[i]?.isNew) return i
    i += delta
  }
  return -1
}

// 聚焦全局行 gi 的指定列：跨页先切页并补空白行；同时记录 pendingFocus，
// 供父级重拉（提交成功后明细追加、行位置后移）后校正焦点
const focusGlobalCell = (gi: number, col: string, caret: 'start' | 'end') => {
  const page = Math.floor(gi / pageSize.value) + 1
  if (page !== currentPage.value) {
    currentPage.value = page
    ensurePageFilled(page)
  }
  const local = gi - (page - 1) * pageSize.value
  pendingFocus = { page, rowIndex: local, col, caret, at: Date.now() }
  nextTick(() => focusCell(local, col, caret))
}

// 沿方向跳到上/下一个可编辑行的指定列（已有明细行跳过，可跨页）。
// 跨页时先提交本行（与末行回车一致）：必填缺失 / 提交失败则停在原页让用户修正。
// 向下且已无可编辑行 → 翻新页；向上且已无可编辑行 → 原地不动
const goToEditableRow = async (
  row: DetailTableRow,
  rowIndex: number,
  delta: number,
  col: string,
  caret: 'start' | 'end',
) => {
  const gi = toGlobalIndex(rowIndex)
  const target = findEditableRow(gi, delta)
  if (target >= 0) {
    const targetPage = Math.floor(target / pageSize.value) + 1
    if (targetPage !== currentPage.value) {
      const r = await handleNewRowSave(row)
      if (r !== 'success' && r !== 'skipped') return
    }
    focusGlobalCell(target, col, caret)
    return
  }
  const r = await handleNewRowSave(row)
  if (r !== 'success' && r !== 'skipped') return
  if (delta > 0) goNextPageAtCol(col)
  else if (currentPage.value > 1) goPrevPageAtCol(col)
}

// 单元格键盘导航（走迷宫式：上下切行、左右切列）：
// - 回车：跳到下一列；末列回车 → 跳到下一个可编辑行首列（已有明细行跳过）
// - 左/右方向键：切换列；到行首/行尾列则换到上/下一个可编辑行的首/末列
// - 上/下方向键：切换行；到页边界时先提交本行，通过才翻到上/下一页
const onCellKeydown = async (
  row: DetailTableRow,
  rowIndex: number,
  col: string,
  e: KeyboardEvent,
) => {
  const idx = NEW_ROW_COLUMNS.indexOf(col)
  if (idx < 0) return
  const FIRST_COL = NEW_ROW_COLUMNS[0]!
  const LAST_COL = NEW_ROW_COLUMNS[NEW_ROW_COLUMNS.length - 1]!
  if (e.key === 'Enter') {
    e.preventDefault()
    if (idx < NEW_ROW_COLUMNS.length - 1) {
      focusCell(rowIndex, NEW_ROW_COLUMNS[idx + 1]!, 'start')
    } else {
      await goToEditableRow(row, rowIndex, 1, FIRST_COL, 'start')
    }
  } else if (e.key === 'ArrowRight') {
    // 可编辑行才先走光标，光标顶到文本末尾才跳格（纯文本行无输入框，不会触发本分支）
    if (shouldMoveCaretInside(e)) return
    e.preventDefault()
    if (idx < NEW_ROW_COLUMNS.length - 1) {
      focusCell(rowIndex, NEW_ROW_COLUMNS[idx + 1]!, 'start')
    } else {
      await goToEditableRow(row, rowIndex, 1, FIRST_COL, 'start')
    }
  } else if (e.key === 'ArrowLeft') {
    if (shouldMoveCaretInside(e)) return
    e.preventDefault()
    if (idx > 0) {
      focusCell(rowIndex, NEW_ROW_COLUMNS[idx - 1]!, 'end')
    } else {
      await goToEditableRow(row, rowIndex, -1, LAST_COL, 'end')
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    await goToEditableRow(row, rowIndex, -1, col, 'end') // 从下方进来 → 落到文本末尾
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    await goToEditableRow(row, rowIndex, 1, col, 'start') // 从上方进来 → 落到文本开头
  }
}

// 失焦提交：新行输入框失焦时提交设备。
// 同一行内切换焦点（←→/Enter 在列间移动、Tab）不提交，仍在编辑本行；
// 离开本行（切到其它行 / 翻页 / 点击别处）才提交——方向键切到另一行同样算离开本行。
// 注：已有明细行（含已提交锁定态）渲染为纯文本、无输入框，不会触发本函数
const handleNewRowBlur = (row: DetailTableRow, e: FocusEvent) => {
  const next = e.relatedTarget as HTMLElement | null
  if (next && next.closest) {
    const curTr = (e.target as HTMLElement | null)?.closest('tr')
    const nextTr = next.closest('tr')
    if (curTr && nextTr && curTr === nextTr) return // 焦点仍在本行内，不提交
  }
  void handleNewRowSave(row)
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

// 确保指定页已被新增空白行填满（不足则补足），使每页都“占满”。
// 已提交（只读锁定态）不铺空白录入行——此处统一拦截，避免调用点各自判断
const ensurePageFilled = (page: number) => {
  if (props.isSubmitted) return
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
  ensurePageFilled(1) // 已提交只读态内部直接返回，不铺空白行
  currentPage.value = 1
  // 首开时表格可能还没有数据行，行高只能取兜底值（40），算出的可容纳行数偏多；
  // 而表格区高度是按「表头 + fit 行」精确回写的，行高估小就会溢出压住分页。
  // 故渲染后重测一次真实行高，若可容纳行数变了就按新值重铺空白行
  // （blankRows 全是本次自动补的，重置安全，不碰已有明细）
  nextTick(() => {
    const before = pageSize.value
    measure()
    // 已提交只读态不铺空白行，无需重铺（measure 仍要跑，用于修正每页行数）
    if (!props.isSubmitted && pageSize.value !== before) {
      blankRows.value = []
      ensurePageFilled(1)
      currentPage.value = 1
    }
  })
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

// 分页：每页行数由「弹窗可容纳行数」动态决定，
// 但不自动补空白行铺满——仅按实际行数分页展示
const currentPage = ref(1)
const pageSize = ref(10)
const pageRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return detailTableData.value.slice(start, start + pageSize.value)
})

// 序号列连续编号（跨页不断号）
const indexMethod = (i: number) => (currentPage.value - 1) * pageSize.value + i + 1

// 动态测量：根容器可用高度 + 实测行高/表头高 → 计算每页行数，并反推表格区精确高度
// 基准说明：不能用表格区自身高度做基准——它按内容收缩（余量沉到分页下方），
// 否则会变成「高度决定行数、行数又决定高度」的自激循环。故统一读根容器
// （高度由父弹窗 80vh 给定，稳定），减去提示行与底部分页栏后才是表格可用高度。
// 与 AddOrderDeviceTable 保持一致。
const rootRef = ref<HTMLElement>()
const hintRef = ref<HTMLElement>()
const footerRef = ref<HTMLElement>()
const tableRegionRef = ref<HTMLElement>()
// 表格区高度按「当前页实际行数」而非 fit 容量：
// 空白行只在编辑态补（已提交态不铺），数据不满一页时若仍按 fit 容量撑高，
// 表格底边到分页之间就会留出大段空白。与 RepairOrderDeviceTable / RepairWarehouseInOrderDeviceDialog 一致
const regionH = computed<number | null>(() => {
  const n = pageRows.value.length
  if (n === 0) return null
  return HEADER_H.value + n * ROW_H.value
})
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
    // 优先用「录入行」实测行高：已有明细行是纯文本，一旦与录入行不等高，
    // 按它算出的每页行数会偏多/偏少 → 回写高度与实际表格高度不符。
    // 已提交态没有录入行（全是纯文本），此时退回首行
    const rowEls = Array.from(tableEl.querySelectorAll('.el-table__row')) as HTMLElement[]
    const sample =
      rowEls.find((r) => r.isConnected && r.querySelector('input')) ??
      rowEls.find((r) => r.isConnected)
    // 用 getBoundingClientRect 取亚像素值（offsetHeight 会取整，累积误差让高度算不准）
    if (headerEl) HEADER_H.value = headerEl.getBoundingClientRect().height
    if (sample) {
      const rh = sample.getBoundingClientRect().height
      if (rh > 0) ROW_H.value = rh
    }
  }
  const avail = h - outerH(hintRef.value) - outerH(footerRef.value)
  // 按可容纳行数（floor）决定每页行数
  const fit = Math.floor((avail - HEADER_H.value) / ROW_H.value)
  const size = Math.max(1, fit)
  pageSize.value = size
}

// 表格区高度样式：未测出前保持自适应
const regionStyle = computed(() =>
  regionH.value == null ? undefined : { height: `${regionH.value}px` },
)

let ro: ResizeObserver | null = null
onMounted(() => {
  ro = new ResizeObserver(() => {
    measure()
    // 窗口缩放时同步每页行数（不重新预填，避免打扰已录入的内容）
  })
  // 观察根容器而非表格区：表格区高度由 measure 反推写入，观察它会自激
  if (rootRef.value) ro.observe(rootRef.value)
})
onUnmounted(() => ro?.disconnect())

// 切页：跳到的页若未填满则补空白行，保证每页都占满（已提交只读态由 ensurePageFilled 内部跳过）
const handlePageChange = (p: number) => {
  currentPage.value = p
  ensurePageFilled(p)
}

// 方向键向下翻页：跳到下一页，保持当前列（新页自动铺满空白行）。
// 落点是该页**首个可编辑行**——已有明细跨页时新页开头可能全是纯文本行，
// 落在其上 focusCell 会空操作（无输入框），表现为翻页后“焦点丢了”
const goNextPageAtCol = (col: string) => {
  currentPage.value += 1
  ensurePageFilled(currentPage.value)
  const pageStart = (currentPage.value - 1) * pageSize.value
  const pageEnd = currentPage.value * pageSize.value
  const gi = findEditableRow(pageStart - 1, 1)
  const local = gi >= 0 && gi < pageEnd ? gi - pageStart : 0
  pendingFocus = { page: currentPage.value, rowIndex: local, col, caret: 'start', at: Date.now() }
  nextTick(() => focusCell(local, col, 'start'))
}

// 回车末行翻页 / 「下一页」按钮：跳到下一页首行首列（新页自动铺满空白行）
const goNextPage = () => goNextPageAtCol(NEW_ROW_COLUMNS[0]!)

// 方向键向上翻页：跳到上一页，保持当前列，落点是该页**最后一个可编辑行**
const goPrevPageAtCol = (col: string) => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  const pageStart = (currentPage.value - 1) * pageSize.value
  const pageEnd = Math.min(detailTableData.value.length, currentPage.value * pageSize.value)
  let local = pageEnd - 1 - pageStart
  for (let i = pageEnd - 1; i >= pageStart; i--) {
    if (detailTableData.value[i]?.isNew) {
      local = i - pageStart
      break
    }
  }
  pendingFocus = { page: currentPage.value, rowIndex: local, col, caret: 'end', at: Date.now() }
  nextTick(() => focusCell(local, col, 'end'))
}

// 跨页聚焦校正：末行提交成功会 emit('changed') 触发父级重拉订单，重拉完成后新明细
// 追加进 detailList，使其后所有空白行整体后移一格——先聚焦的单元格因 row-key 复用
// DOM 仍挂在原 input 上，视觉位置随之偏移一行（如"落在第 6 行而非第 5 行"）。
// 故翻页聚焦后记录目标，待 detailList 更新（重拉完成、行位置稳定）后再对焦一次。
// 纯翻页（无提交、detailList 不更新）时本 watch 不触发，仅靠上面的立即聚焦；
// 记录 5 秒内未被消费则作废，避免残留导致后续不相干的 detailList 更新误触发聚焦。
let pendingFocus: {
  page: number
  rowIndex: number
  col: string
  caret: 'start' | 'end'
  at: number
} | null = null

watch(detailList, () => {
  const target = pendingFocus
  pendingFocus = null
  if (!target || Date.now() - target.at > 5000) return
  if (currentPage.value !== target.page) return
  nextTick(() => focusCell(target.rowIndex, target.col, target.caret))
})

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

// 已提交（或正在提交）的行，避免回车后失焦重复提交（与 RepairWarehouseInOrderDeviceDialog 一致）
const submittingRows = new Set<DetailTableRow>()

// 新增行保存结果：skipped=无内容/已处理（不拦截导航）；invalid=校验失败；success/error=提交结果
type SaveResult = 'skipped' | 'invalid' | 'success' | 'error'

// 处理新增行保存（逐行即时提交）：成功后从可编辑新增行中移除，并确保末尾仍有空白行
const handleNewRowSave = async (row: DetailTableRow): Promise<SaveResult> => {
  if (!row.isNew) return 'skipped'
  // 回车后失焦会再次触发本函数，用 submittingRows 去重，避免重复提交同一条
  if (submittingRows.has(row)) return 'skipped'
  if (!row.equipmentName && !row.equipmentModel && !row.quantity) {
    return 'skipped'
  }
  if (!row.equipmentName) {
    ElMessage.warning('请输入品名')
    return 'invalid'
  }
  if (!row.equipmentModel) {
    ElMessage.warning('请输入型号')
    return 'invalid'
  }
  const quantity = Number(row.quantity)
  if (isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
    ElMessage.warning('数量必须为正整数')
    return 'invalid'
  }
  if (!props.order) {
    ElMessage.warning('缺少订单信息，无法新增设备')
    return 'invalid'
  }

  submittingRows.add(row)
  try {
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
      row.isNew = false // 标记已提交，失焦/二次触发时直接跳过，避免重复提交
      // 从可编辑新增行中移除已提交行（新明细 id 由后端生成，父组件重拉后出现在只读明细里）
      blankRows.value = blankRows.value.filter((r) => r !== row)
      // 通知父组件重新拉取订单列表，刷新内嵌 details
      emit('changed')
      // 确保当前页末尾仍有空白行可继续录入
      ensurePageFilled(currentPage.value)
      await nextTick()
      return 'success'
    } else {
      ElMessage.error('添加设备失败')
      return 'error'
    }
  } catch {
    ElMessage.error('添加设备失败')
    return 'error'
  } finally {
    submittingRows.delete(row)
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
  justify-content: flex-start;
  height: 100%;
}

.detail-hint {
  flex: none;
}

/* 表格区不再撑满（flex:1）：高度由 measure() 按「表头 + fit 行」精确回写，
   使表格底边与分页紧贴，装不下整行的余量沉到底部分页栏下方 */
.detail-table-region {
  flex: none;
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

/* 录入行与已有明细行必须等高：
   el-input 默认是 inline-flex（行内盒），会带基线下方约 5px 的行内空隙；
   .readonly-text 是块级元素，没有这段空隙。两类行不等高时，measure() 取样的
   行高与页面实际行高不符 → 回写高度「表头 + 行数 × 行高」偏离真实表格高度，
   轻则表格与分页之间留白、重则表格溢出压住底部分页栏 */
.detail-table :deep(.el-input) {
  display: flex;
  width: 100%;
}

/* 已有明细行（含已提交锁定态）：纯文本展示，无输入框外观、无选中态。
   高度对齐 el-input small 的 24px，保证与录入行等高 */
.detail-table .readonly-text {
  display: block;
  min-height: 24px;
  line-height: 24px;
  padding: 0 4px;
  color: #606266;
  word-break: break-all;
}

/* 底部操作栏：分页高度固定，避免分页出现时挤压表格区域、
   导致 ResizeObserver 重算每页行数的反馈循环（与 AddOrderDeviceTable 一致） */
.detail-editor__footer {
  flex-shrink: 0;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 「下一页」按钮：margin-right:auto 把剩余空间挤到按钮右侧，
   实现“按钮居左、分页居右”（与 AddSnCodeDialog 的 space-between 效果一致）。
   已提交态无此按钮，分页仍靠 flex-end 居右 */
.detail-next-page {
  margin-right: auto;
}

.detail-pagination {
  margin: 0;
}
</style>
