<script lang="ts">
// SN 码录入行：SN 串 + 是否已存在（已存在则锁定、不重复提交）
export interface SnRow {
  sn: string
  isExisting: boolean
}

export const createBlankSnRow = (): SnRow => ({ sn: '', isExisting: false })
</script>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { addSnApi, type RepairOrderDetail } from '@/api/repair/RepairApi'
import TableNavHint from '@/components/common/TableNavHint.vue'

// 键盘导航 / 提交规则提示：单列表，上下来回切行（到页边界自动翻页），回车或失焦即提交本行 SN
const NAV_HINT = '↑↓←→ 切换 SN 行 · Enter 提交本行 · 离开本行自动提交 · 到页边界自动翻页'

// 自包含弹窗：外部只需给「显隐 + 目标设备」，SN 行状态、分页、提交全部内部管理
const props = defineProps<{
  modelValue: boolean
  // 目标设备（维修订单明细行）；为 null 表示未选中
  device: RepairOrderDetail | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submitted'): void // 已录入完成，通知外部刷新列表
  (e: 'closed'): void // 关闭动画结束，外部可清空 device 引用
}>()

// 由 device 派生：设备名（提示文案）/ 明细 id（addSN 入参）/ 已存在 SN（铺入并锁定）
const deviceName = computed(() => props.device?.name ?? '')
const deviceId = computed<number | string>(() => props.device?.id ?? '')
const existingSn = computed(() =>
  (props.device?.SN || []).map((s) => s.trim()).filter(Boolean),
)

// SN 录入行（已存在锁定行 + 空白新增行）
// 注意：el-dialog 的 destroy-on-close 只销毁弹窗 body 内容，本组件实例不会被销毁，
// 故 rows / submittedKeys 会跨次残留，必须在打开时重铺、关闭时清空（见 watch 与 onDialogClosed）
const rows = ref<SnRow[]>([])

// 提示行展示的“已存在”条数：按当前锁定行实时统计（含本次已成功提交的），
// 不用 props.device.SN 的打开时快照——那个在整个录入过程中不更新，是静态旧值
const lockedCount = computed(() => rows.value.filter((r) => r.isExisting).length)

// 分页：每页行数由「弹窗可容纳行数」动态决定（打开时铺满首页）
const currentPage = ref(1)
const pageSize = ref(7)
const pageRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return rows.value.slice(start, start + pageSize.value)
})

// 序号列连续编号（跨页不断号）
const indexMethod = (i: number) => (currentPage.value - 1) * pageSize.value + i + 1

// 动态测量：根容器可用高度 + 实测行高/表头高 → 计算每页行数，并反推表格区精确高度
// 基准说明：不能用表格区自身高度做基准——它按内容收缩（余量沉到分页下方），
// 否则会变成「高度决定行数、行数又决定高度」的自激循环。故统一读根容器
// （高度由父弹窗给定，稳定），减去提示行与底部分页栏后才是表格可用高度。
// 与 AddOrderDeviceTable / OrderDetailDeviceTable 保持一致。
const rootRef = ref<HTMLElement>()
const hintRef = ref<HTMLElement>()
const footerRef = ref<HTMLElement>()
const tableRegionRef = ref<HTMLElement>()
const regionH = ref<number | null>(null) // 表格区精确高度（表头 + fit 行）
const ROW_H = ref(40) // el-table small 行高（兜底值，渲染后实测覆盖）
const HEADER_H = ref(41) // 表头高度（兜底值）

// 含 margin 的外框高度：分页栏带 margin-top，只取 rect.height 会少算
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
    // 优先用「录入行」实测行高：锁定行是纯文本，一旦与录入行不等高，
    // 按它算会高估可容纳行数 → 回写高度小于真实表格高度 → 溢出压住底栏。
    // 已存在 SN 铺满整页时可能没有录入行，此时退回首行
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
  // 表格区只占「表头 + fit 行」，余量不再夹在表格与分页之间，而是沉到分页栏下方
  regionH.value = HEADER_H.value + size * ROW_H.value
}

// 表格区高度样式：未测出前保持自适应
const regionStyle = computed(() =>
  regionH.value == null ? undefined : { height: `${regionH.value}px` },
)

// 按当前设备铺入已存在 SN（跨页）+ 补空白行填满首页；返回已存在行数组。
// 不测量高度、直接按当前 pageSize 铺满——供弹窗打开瞬间调用，消除上一次残留的行
const seedRows = () => {
  const seeded = existingSn.value.map((sn) => ({ sn, isExisting: true }))
  // 已存在 SN 全部铺入；若不足一页，补空白行把首页填满；保证末尾至少 1 个空白行便于继续录入
  const totalNeeded = Math.max(seeded.length + 1, pageSize.value)
  rows.value = seeded.concat(
    Array.from({ length: totalNeeded - seeded.length }, () => createBlankSnRow()),
  )
  currentPage.value = 1
  return seeded
}

// 打开表单时调用（布局就绪后）：测量可用高度 → 铺入已存在 SN + 补空白行填满首页
const prefillFirstPage = () => {
  measure()
  const seeded = seedRows()
  // 首开时表格可能还没渲染出数据行，行高只能取兜底值（40），算出的可容纳行数偏多；
  // 而表格区高度是按「表头 + fit 行」精确回写的，行高估小就会溢出压住分页。
  // 故渲染后重测真实行高，若可容纳行数变了就按新值重铺空白行
  nextTick(() => {
    const before = pageSize.value
    measure()
    if (pageSize.value === before) return
    const total = Math.max(seeded.length + 1, pageSize.value)
    rows.value = seeded.concat(
      Array.from({ length: total - seeded.length }, () => createBlankSnRow()),
    )
    currentPage.value = 1
  })
  // 聚焦首个空白行（位于已存在 SN 正下方），打开即可直接录入
  nextTick(() => focusFirstBlank())
}

// 聚焦首个空白新增行（位于已存在 SN 正下方，可能跨页）
const focusFirstBlank = () => {
  const firstBlank = existingSn.value.length
  const page = Math.floor(firstBlank / pageSize.value) + 1
  // 跳到其它页时，先把该页用空白行铺满（与 OrderDetailDeviceTable 一致），避免“第二页只躺两行数据+一行空白”未铺满
  if (page !== currentPage.value) {
    currentPage.value = page
    ensurePageFilled(page)
  }
  nextTick(() => {
    const local = firstBlank - (currentPage.value - 1) * pageSize.value
    focusCell(local)
  })
}

// 弹窗打开动画结束、布局就绪后再预填：避免首开时过渡未结束导致测量的行数偏小
const onDialogOpened = () => prefillFirstPage()

// 确定：SN 已在回车/失焦时逐条提交，关闭后的刷新统一由 @closed 按 hasSubmitted 触发
const handleConfirm = () => {
  emit('update:modelValue', false)
}

// 关闭动画结束后清空全部录入状态：组件实例不随弹窗销毁，不清就会残留到下次打开
const onDialogClosed = () => {
  rows.value = []
  submittedKeys.clear()
  cellRefs.value = {}
  currentPage.value = 1
  // 本次打开期间成功提交过 SN → 无论从「确定」、取消还是右上角 × 关闭都通知父级刷新。
  // 此前只有「确定」会刷新，× 掉弹窗后父表的“已录 SN x/y”一直是旧数据
  if (hasSubmitted) emit('submitted')
  emit('closed')
}

// 打开瞬间（动画开始前）就按当前设备铺入，并清空已提交记录：
// el-dialog 一旦 modelValue 为 true 就渲染内容，而 @opened 要等打开动画结束才触发；
// 中间这一帧若沿用上次残留的 rows，就会闪现上一个设备的行（含错误的“已存在”标签）
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    hasSubmitted = false
    submittedKeys.clear()
    seedRows()
  },
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

// 各单元格输入框实例（行号定位，用于键盘导航时切换焦点）
// input 为 ElInput 暴露的原生 input 元素，用于跳转后摆放光标位置
type CellInput = { focus: () => void; input?: HTMLInputElement | null }
const cellRefs = ref<Record<number, CellInput | null>>({})
const setCellRef = (rowIndex: number, el: unknown) => {
  if (el) cellRefs.value[rowIndex] = el as CellInput
  else delete cellRefs.value[rowIndex]
}

// 跳转后光标落点：从上方/左边进来落到文本开头，从下方/右边进来落到文本末尾，
// 这样落点始终在“进来的那一侧”，继续按同方向键才能穿过文本逐字移动，而不是一按就跳走
const focusCell = (rowIndex: number, caret: 'start' | 'end' = 'start') => {
  const cell = cellRefs.value[rowIndex]
  if (!cell) return
  cell.focus()
  const input = cell.input
  if (input && typeof input.setSelectionRange === 'function') {
    const pos = caret === 'start' ? 0 : input.value.length
    input.setSelectionRange(pos, pos)
  }
}

// 左右键是否应当“留在文本里移动光标”（不翻页）：
// - 有选区 或 按住 Shift（选词）→ 交给浏览器原生处理
// - 右键且光标不在文本末尾、左键且光标不在文本开头 → 交给浏览器在文字间移动
// - 只有光标已经顶到文本边界（或空输入框）时，才返回值 false 由调用方翻页
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

// 已提交（或正在提交）的行，避免回车后失焦重复提交
const submittedKeys = new Set<number>()

// 本次打开期间是否成功提交过 SN：关闭时据此决定是否通知父级刷新
// （SN 是逐条即时提交的，从「确定」、取消还是右上角 × 关闭都可能有已提交的数据）
let hasSubmitted = false

// 即时提交：某行输入完成（回车/失焦）即 POST addSN；已存在或空则跳过
const submitRow = async (globalIndex: number) => {
  const row = rows.value[globalIndex]
  if (!row || row.isExisting) return
  const sn = row.sn.trim()
  if (!sn) return
  if (submittedKeys.has(globalIndex)) return
  submittedKeys.add(globalIndex)
  try {
    const res = await addSnApi(sn, deviceId.value)
    if (Number(res.code) === 200) {
      // 提交成功 → 锁定该行（展示“已存在”，不再可编辑/重复提交）
      row.isExisting = true
      row.sn = sn
      hasSubmitted = true
      ElMessage.success(`SN ${sn} 添加成功`)
    } else {
      submittedKeys.delete(globalIndex) // 失败允许重试
      ElMessage.error(res.msg || '添加失败')
    }
  } catch {
    submittedKeys.delete(globalIndex)
    ElMessage.error('添加失败，请重试')
  }
}

// 沿方向找下一个可编辑（未锁定）行的全局索引；没有返回 -1。
// 已存在行是纯文本、没有输入框，无法承接焦点，导航时必须跳过，
// 否则方向键扫到锁定行会表现为“卡住不动”
const findEditableRow = (fromGlobal: number, delta: number): number => {
  let i = fromGlobal + delta
  while (i >= 0 && i < rows.value.length) {
    const row = rows.value[i]
    if (row && !row.isExisting) return i
    i += delta
  }
  return -1
}

// 聚焦全局行 gi（必须是可编辑行）：跨页则先切页并补空白行，再聚焦页内对应行
const focusGlobalRow = (gi: number, caret: 'start' | 'end') => {
  const page = Math.floor(gi / pageSize.value) + 1
  if (page !== currentPage.value) {
    currentPage.value = page
    ensurePageFilled(page)
  }
  nextTick(() => focusCell(gi - (page - 1) * pageSize.value, caret))
}

// 方向键移动焦点：跳到上/下一个可编辑行（锁定行直接跳过，可能跨页）。
// 跨页时先提交本行（与回车一致）；向下没有可编辑行则翻新页，向上没有则原地不动
const moveFocus = async (fromPageIndex: number, delta: number) => {
  const gi = toGlobalIndex(fromPageIndex)
  const target = findEditableRow(gi, delta)
  if (target >= 0) {
    const crosses = Math.floor(target / pageSize.value) !== currentPage.value - 1
    if (crosses) await submitRow(gi)
    focusGlobalRow(target, delta > 0 ? 'start' : 'end')
    return
  }
  if (delta > 0) {
    await submitRow(gi)
    goNextPage()
  }
}

// 单元格键盘导航：
// - 回车：立即提交本行 SN，再跳到下一个可编辑行（锁定行跳过，可能跨页）；没有可编辑行则翻新页
// - 上/下键：跳到上/下一个可编辑行（锁定行跳过）；跨页时先提交本行
// - 左/右键：单列表无横向列，与上下键一致——文字内移动光标，顶到边界则切行
const onCellKeydown = async (pageIndex: number, e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    const gi = toGlobalIndex(pageIndex)
    await submitRow(gi)
    const target = findEditableRow(gi, 1) // 刚提交的行已锁定，从下一行起找
    if (target >= 0) focusGlobalRow(target, 'start')
    else goNextPage()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    await moveFocus(pageIndex, -1)
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    await moveFocus(pageIndex, 1)
  } else if (e.key === 'ArrowLeft') {
    if (shouldMoveCaretInside(e)) return // 光标还没到文本开头 → 在文字间左移
    e.preventDefault()
    await moveFocus(pageIndex, -1) // 单列表：左键等同向上切行
  } else if (e.key === 'ArrowRight') {
    if (shouldMoveCaretInside(e)) return // 光标还没到文本末尾 → 在文字间右移
    e.preventDefault()
    await moveFocus(pageIndex, 1) // 单列表：右键等同向下切行
  }
}

// 失焦：立即提交本行 SN（与回车共用去重守卫，不会重复提交）。
// 末行失焦且焦点没有落回表格其它输入框/底栏时，翻到下一页——与回车、方向键的跨页行为一致；
// 点表格其它行（想回去改别行）或点分页/底部按钮时不抢焦点
const onCellBlur = async (pageIndex: number, e: FocusEvent) => {
  const globalIndex = toGlobalIndex(pageIndex)
  const isLastRow = pageIndex === pageRows.value.length - 1
  const to = e.relatedTarget as HTMLElement | null
  const focusStays =
    !!to && (to.closest('.sn-table') !== null || to.closest('.sn-editor__footer') !== null)
  if (!isLastRow || focusStays) {
    void submitRow(globalIndex)
    return
  }
  await submitRow(globalIndex)
  goNextPage()
}

const toGlobalIndex = (pageIndex: number) => (currentPage.value - 1) * pageSize.value + pageIndex

// 确保指定页已被空白行填满（不足则补足），使每页都“占满”
const ensurePageFilled = (page: number) => {
  const needed = page * pageSize.value
  if (rows.value.length < needed) {
    rows.value = rows.value.concat(
      Array.from({ length: needed - rows.value.length }, () => createBlankSnRow()),
    )
  }
}

// “下一页”：跳到表格下一页并补空白行占满，聚焦该页首个可编辑行（锁定行跳过），便于连续录单
const goNextPage = () => {
  currentPage.value += 1
  ensurePageFilled(currentPage.value)
  const pageStart = (currentPage.value - 1) * pageSize.value
  const gi = findEditableRow(pageStart - 1, 1) // 从新页首行起找第一个可编辑行
  nextTick(() => {
    if (gi >= 0) focusCell(gi - pageStart, 'start')
  })
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="添加 SN 码"
    width="60vw"
    align-center
    append-to-body
    destroy-on-close
    class="sn-form-dialog"
    @update:model-value="emit('update:modelValue', $event)"
    @opened="onDialogOpened"
    @closed="onDialogClosed"
  >
    <p v-if="deviceName" class="sn-form__hint">
      设备：{{ deviceName }}　已存在 {{ lockedCount }} 条 SN（已锁定），可继续补充其余 SN
      码后提交
    </p>
    <div class="sn-editor" ref="rootRef">
    <div ref="hintRef" class="sn-hint"><TableNavHint :text="NAV_HINT" /></div>
    <div class="sn-table-region" ref="tableRegionRef" :style="regionStyle">
      <el-table :data="pageRows" border class="sn-table">
        <el-table-column type="index" label="序号" width="60" align="center" :index="indexMethod" />
        <el-table-column label="SN 码" min-width="220">
          <template #default="scope">
            <!-- 已存在行：纯文本展示，无输入框、不可选中（无键盘事件、不注册 cellRefs） -->
            <span v-if="scope.row.isExisting" class="sn-locked">
              {{ scope.row.sn }}
              <span class="sn-editor__tag">已存在</span>
            </span>
            <el-input
              v-else
              v-model="scope.row.sn"
              placeholder="请输入 SN 码"
              size="small"
              :ref="(el: unknown) => setCellRef(scope.$index, el)"
              @keydown="onCellKeydown(scope.$index, $event)"
              @blur="onCellBlur(scope.$index, $event)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="sn-editor__footer" ref="footerRef">
      <el-button @click="goNextPage">下一页</el-button>
      <el-pagination
        v-if="rows.length > 0"
        class="sn-pagination"
        background
        layout="total, prev, pager, next"
        :total="rows.length"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
    </div>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
/* 设备提示：展示当前设备名与已存在的 SN 条数 */
.sn-form__hint {
  margin: 0 0 16px;
  font-size: 14px;
  color: #909399;
}

.sn-editor {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
}

.sn-hint {
  flex: none;
}

/* 表格区不再撑满（flex:1）：高度由 measure() 按「表头 + fit 行」精确回写，
   使表格底边与分页紧贴，装不下整行的余量沉到底部分页栏下方 */
.sn-table-region {
  flex: none;
}

.sn-table {
  width: 100%;
}

.sn-table :deep(.el-table__header-wrapper th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: bold;
  text-align: center;
}

.sn-editor__tag {
  font-size: 12px;
  color: #1ab394;
  background: rgba(26, 179, 148, 0.1);
  border-radius: 4px;
  padding: 0 6px;
  line-height: 18px;
}

/* 录入行与锁定行必须等高：
   el-input 默认是 inline-flex（行内盒），会带上基线下方约 5px 的行内空隙；
   而 .sn-locked 是块级 flex，没有这段空隙。两类行不等高时，measure() 按首行
   （打开时首行是锁定行）测出的行高偏小 → 每页行数算多 → 回写的「表头 + fit×行高」
   小于表格真实高度 → 全录入行的页面溢出、压住底部分页栏。
   故把 input 也改成块级 flex，抹掉基线空隙 */
.sn-table :deep(.el-input) {
  display: flex;
  width: 100%;
}

/* 已存在锁定行：纯文本展示。min-height 对齐 el-input small 的 24px，
   否则锁定行与录入行行高不一致，measure 按首行实测行高算每页行数会漂移 */
.sn-locked {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  color: #606266;
  word-break: break-all;
}

/* 底部操作栏：按钮与分页并排且高度固定，避免分页出现时挤压表格区域、
   导致 ResizeObserver 重算每页行数（10→9 的反馈循环） */
.sn-editor__footer {
  flex-shrink: 0;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sn-pagination {
  margin: 0;
}
</style>

<style>
/* 弹窗高度控制：class 落到 .el-dialog 上，用非 scoped 样式避开 teleport 导致的 scoped 失效 */
.sn-form-dialog {
  height: 60vh;
  display: flex;
  flex-direction: column;
}

.sn-form-dialog .el-dialog__body {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* SN 录入表格编辑区弹性占满弹窗剩余空间，使内部按高度动态计算每页行数。
   注意：measure() 以该容器高度为基准，必须保持由父级给定高度（不能改成按内容收缩） */
.sn-form-dialog .sn-editor {
  flex: 1;
  min-height: 0;
}
</style>
