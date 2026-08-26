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
import { addSnApi } from '@/api/repair/RepairApi'

const props = defineProps<{
  // 已存在的 SN（来自 getOrder 返回的 detail.SN），铺入表格并锁定
  existingSn: string[]
  // 设备明细 id，用于 addSN 接口的 body.id
  deviceId: string | number
}>()

// 与父组件双向绑定的 SN 行数组（含已存在锁定行 + 空白新增行）
const rows = defineModel<SnRow[]>('rows', { required: true })

// 分页：每页行数由「弹窗可容纳行数」动态决定（打开时铺满首页）
const currentPage = ref(1)
const pageSize = ref(7)
const pageRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return rows.value.slice(start, start + pageSize.value)
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
  // 按可容纳行数（floor）决定每页行数；表格本身不设固定高度、由内容自适应，
  // 最后一行的表框天然贴合，无“最后一行到表底”的内部余数间隙
  const fit = Math.floor((h - HEADER_H.value) / ROW_H.value)
  pageSize.value = Math.max(1, fit)
}

// 打开表单时调用：已存在 SN 全部铺入（跨页），末尾补空白行铺满整页，并始终保证至少 1 个空白新增行
const prefillFirstPage = () => {
  measure()
  const seeded = props.existingSn.map((sn) => ({ sn, isExisting: true }))
  // 已存在 SN 全部铺入；若不足一页，补空白行把首页填满；保证末尾至少 1 个空白行便于继续录入
  const totalNeeded = Math.max(seeded.length + 1, pageSize.value)
  rows.value = seeded.concat(
    Array.from({ length: totalNeeded - seeded.length }, () => createBlankSnRow()),
  )
  currentPage.value = 1
  // 聚焦首个空白行（位于已存在 SN 正下方），打开即可直接录入
  nextTick(() => focusFirstBlank())
}

// 聚焦首个空白新增行（位于已存在 SN 正下方，可能跨页）
const focusFirstBlank = () => {
  const firstBlank = props.existingSn.length
  const page = Math.floor(firstBlank / pageSize.value) + 1
  // 跳到其它页时，先把该页用空白行铺满（与 OrderDeviceTable 一致），避免“第二页只躺两行数据+一行空白”未铺满
  if (page !== currentPage.value) {
    currentPage.value = page
    ensurePageFilled(page)
  }
  nextTick(() => {
    const local = firstBlank - (currentPage.value - 1) * pageSize.value
    focusCell(local)
  })
}

// 批量提交剩余未提交的新行（供父组件「确定」时兜底；与即时提交共用 submittedKeys 去重）
const submitRemaining = async (): Promise<{ added: number; error?: string }> => {
  const pending = rows.value
    .map((r, i) => ({ r, i }))
    .filter(({ r, i }) => !r.isExisting && !submittedKeys.has(i) && r.sn.trim())
  if (!pending.length) return { added: 0 }
  const results = await Promise.all(
    pending.map(async ({ r, i }) => {
      submittedKeys.add(i)
      const sn = r.sn.trim()
      try {
        const res = await addSnApi(sn, props.deviceId)
        if (Number(res.code) === 200) {
          r.isExisting = true
          r.sn = sn
          return true
        }
        submittedKeys.delete(i) // 失败允许重试
        return res.msg || '添加失败'
      } catch {
        submittedKeys.delete(i)
        return '添加失败'
      }
    }),
  )
  const added = results.filter((x) => x === true).length
  const errors = results.filter((x) => x !== true) as string[]
  return { added, error: errors.length ? errors.join('；') : undefined }
}

// 暴露给父组件：父组件在 el-dialog 的 @opened（打开动画结束、布局就绪）时调用，
// 此时测量高度最可靠，避免首开时过渡动画未结束导致测量的行数偏小、空白行铺不满
defineExpose({ prefillFirstPage, submitRemaining })

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

// 行数变化后防止当前页越界
watch(
  () => rows.value.length,
  () => {
    const maxPage = Math.max(1, Math.ceil(rows.value.length / pageSize.value))
    if (currentPage.value > maxPage) currentPage.value = maxPage
  },
)

// 各单元格输入框实例（行号定位，用于键盘导航时切换焦点）
const cellRefs = ref<Record<number, { focus: () => void } | null>>({})
const setCellRef = (rowIndex: number, el: unknown) => {
  if (el) cellRefs.value[rowIndex] = el as { focus: () => void }
  else delete cellRefs.value[rowIndex]
}
const focusCell = (rowIndex: number) => {
  cellRefs.value[rowIndex]?.focus()
}

// 已提交（或正在提交）的行，避免回车后失焦重复提交
const submittedKeys = new Set<number>()

// 即时提交：某行输入完成（回车/失焦）即 POST addSN；已存在或空则跳过
const submitRow = async (globalIndex: number) => {
  const row = rows.value[globalIndex]
  if (!row || row.isExisting) return
  const sn = row.sn.trim()
  if (!sn) return
  if (submittedKeys.has(globalIndex)) return
  submittedKeys.add(globalIndex)
  try {
    const res = await addSnApi(sn, props.deviceId)
    if (Number(res.code) === 200) {
      // 提交成功 → 锁定该行（展示“已存在”，不再可编辑/重复提交）
      row.isExisting = true
      row.sn = sn
    } else {
      submittedKeys.delete(globalIndex) // 失败允许重试
      ElMessage.error(res.msg || '添加失败')
    }
  } catch {
    submittedKeys.delete(globalIndex)
    ElMessage.error('添加失败，请重试')
  }
}

// 当前页内按方向移动焦点：delta=±1 上下移动（已存在锁定行也可被选中）
const moveFocusInPage = (fromPageIndex: number, delta: number) => {
  const target = fromPageIndex + delta
  if (target >= 0 && target < pageRows.value.length) {
    focusCell(target)
    return
  }
  // 页内到头：向上则去上一页，向下则去下一页（若存在）
  if (delta > 0) goNextPage()
  else goPrevPage()
}

// 单元格键盘导航：
// - 回车：立即提交本行 SN，再跳到下一行；本页最后一行回车 → 跳到下一页（空白行自动占满）
// - 上/下键：同页内上/下一行切换焦点（跳过已存在锁定行）；到页边界则切到上/下一页
// - 左/右键：上一页 / 下一页
const onCellKeydown = (pageIndex: number, e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    const gi = toGlobalIndex(pageIndex)
    void submitRow(gi)
    if (pageIndex < pageRows.value.length - 1) {
      focusCell(pageIndex + 1)
    } else {
      goNextPage()
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveFocusInPage(pageIndex, -1)
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveFocusInPage(pageIndex, 1)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    goPrevPage()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    goNextPage()
  }
}

// 失焦：立即提交本行 SN（与回车共用去重守卫，不会重复提交）
const onCellBlur = (pageIndex: number) => {
  void submitRow(toGlobalIndex(pageIndex))
}

const toGlobalIndex = (pageIndex: number) =>
  (currentPage.value - 1) * pageSize.value + pageIndex

// 确保指定页已被空白行填满（不足则补足），使每页都“占满”
const ensurePageFilled = (page: number) => {
  const needed = page * pageSize.value
  if (rows.value.length < needed) {
    rows.value = rows.value.concat(
      Array.from({ length: needed - rows.value.length }, () => createBlankSnRow()),
    )
  }
}

// “下一页”：跳到表格下一页，并补空白行让该页占满，便于继续录单
const goNextPage = () => {
  currentPage.value += 1
  ensurePageFilled(currentPage.value)
  // 跳到新页首行，便于连续录单
  nextTick(() => focusCell(0))
}

// “上一页”：跳到上一页并把焦点落到该页首行
const goPrevPage = () => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  nextTick(() => focusCell(0))
}
</script>

<template>
  <div class="sn-editor">
    <div class="sn-table-region" ref="tableRegionRef">
      <el-table :data="pageRows" border class="sn-table">
        <el-table-column type="index" label="序号" width="60" align="center" :index="indexMethod" />
        <el-table-column label="SN 码" min-width="220">
          <template #default="scope">
            <el-input
              v-model="scope.row.sn"
              :readonly="scope.row.isExisting"
              :placeholder="'请输入 SN 码'"
              size="small"
              :ref="(el: unknown) => setCellRef(scope.$index, el)"
              @keydown="onCellKeydown(scope.$index, $event)"
              @blur="onCellBlur(scope.$index)"
            >
              <template v-if="scope.row.isExisting" #suffix>
                <span class="sn-editor__tag">已存在</span>
              </template>
            </el-input>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="sn-editor__footer">
      <el-button size="small" @click="goNextPage">下一页</el-button>
      <el-pagination
        v-if="rows.length > pageSize"
        class="sn-pagination"
        background
        size="small"
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
.sn-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sn-table-region {
  flex: 1;
  min-height: 0;
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

/* 底部操作栏：按钮与分页并排且高度固定，避免分页出现时挤压表格区域、
   导致 ResizeObserver 重算每页行数（10→9 的反馈循环） */
.sn-editor__footer {
  flex-shrink: 0;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.sn-pagination {
  margin: 0;
}
</style>
