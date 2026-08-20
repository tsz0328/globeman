<script lang="ts">
// 设备明细行：纯本地录入，暂不调用保存接口
export interface DetailTableRow {
  equipmentName: string
  equipmentModel: string
  type: string
  brand: string
  spec: string
  quantity: number | string
}

export const createBlankRow = (): DetailTableRow => ({
  equipmentName: '',
  equipmentModel: '',
  type: '',
  brand: '',
  spec: '',
  quantity: '',
})
</script>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

// 与父组件双向绑定的设备明细数组
const rows = defineModel<DetailTableRow[]>('rows', { required: true })

// 设备明细分页：每页行数由“表单可容纳行数”动态决定（打开时铺满首页）
const currentPage = ref(1)
const pageSize = ref(7)
const pageRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return rows.value.slice(start, start + pageSize.value)
})

// 序号列连续编号（跨页不断号）
const indexMethod = (i: number) => (currentPage.value - 1) * pageSize.value + i + 1

// 动态测量：表格区域高度 + 实测行高/表头高 → 计算每页行数，让表格铺满表单
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

// 打开表单时调用：按可容纳行数预填空白行，铺满首页
const prefillFirstPage = () => {
  measure()
  if (rows.value.length < pageSize.value) {
    // 整体重赋值（defineModel 会触发 update:rows，确保父子同步）
    rows.value = rows.value.concat(
      Array.from({ length: pageSize.value - rows.value.length }, () => createBlankRow()),
    )
  }
  currentPage.value = 1
}

// 暴露给父组件：父组件在 el-dialog 的 @opened（打开动画结束、布局就绪）时调用，
// 此时测量高度最可靠，避免首开时过渡动画未结束导致测量的行数偏小、空白行铺不满
defineExpose({ prefillFirstPage })

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

// 设备明细列顺序（决定键盘导航的列流转顺序），与表格列一致
const ROW_COLUMNS = [
  'equipmentName',
  'equipmentModel',
  'type',
  'brand',
  'spec',
  'quantity',
]

// 各单元格输入框实例（行号 + 列名 定位，用于键盘导航时切换焦点）
const cellRefs = ref<Record<string, { focus: () => void } | null>>({})
const setCellRef = (rowIndex: number, col: string, el: unknown) => {
  const key = `${rowIndex}:${col}`
  if (el) cellRefs.value[key] = el as { focus: () => void }
  else delete cellRefs.value[key]
}
const focusCell = (rowIndex: number, col: string) => {
  cellRefs.value[`${rowIndex}:${col}`]?.focus()
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
  const idx = ROW_COLUMNS.indexOf(col)
  if (idx < 0) return
  if (e.key === 'Enter') {
    e.preventDefault()
    if (idx < ROW_COLUMNS.length - 1) {
      focusCell(rowIndex, ROW_COLUMNS[idx + 1]!)
    } else if (rowIndex < pageRows.value.length - 1) {
      // 跳到本页下一行首列
      focusCell(rowIndex + 1, ROW_COLUMNS[0]!)
    } else {
      // 本页最后一行末列回车 → 跳到下一页（空白行自动占满）
      goNextPage()
    }
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    if (idx < ROW_COLUMNS.length - 1) {
      focusCell(rowIndex, ROW_COLUMNS[idx + 1]!)
    } else if (rowIndex < pageRows.value.length - 1) {
      // 末列 → 下一行首列
      focusCell(rowIndex + 1, ROW_COLUMNS[0]!)
    } else {
      // 最后一行末列 → 下一页首行首列
      goNextPage()
    }
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    if (idx > 0) {
      focusCell(rowIndex, ROW_COLUMNS[idx - 1]!)
    } else if (rowIndex > 0) {
      // 首列 → 上一行末列
      focusCell(rowIndex - 1, ROW_COLUMNS[ROW_COLUMNS.length - 1]!)
    } else if (currentPage.value > 1) {
      // 第一行首列 → 上一页最后一行末列
      goPrevPageAtCol(ROW_COLUMNS[ROW_COLUMNS.length - 1]!)
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
  nextTick(() => focusCell(0, ROW_COLUMNS[0]!))
}

// 方向键向下翻页：跳到下一页首行，保持当前列
const goNextPageAtCol = (col: string) => {
  currentPage.value += 1
  ensurePageFilled(currentPage.value)
  nextTick(() => focusCell(0, col))
}

// 方向键向上翻页：跳到上一页最后一行，保持当前列
const goPrevPageAtCol = (col: string) => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  nextTick(() => focusCell(pageRows.value.length - 1, col))
}

// 限制数量输入：只保留数字（纯整数）
const filterNumberInput = (row: DetailTableRow, field: 'quantity', val: string) => {
  const cleaned = val.replace(/[^\d]/g, '')
  if (cleaned !== val) {
    row[field] = cleaned as never
  }
}
</script>

<template>
  <div class="detail-editor">
    <div class="detail-table-region" ref="tableRegionRef">
      <el-table :data="pageRows" border class="detail-table">
      <el-table-column type="index" label="序号" width="60" align="center" :index="indexMethod" />
      <el-table-column label="名称" min-width="120">
        <template #default="scope">
          <el-input v-model="scope.row.equipmentName" aria-label="名称" size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'equipmentName', el)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'equipmentName', $event)" />
        </template>
      </el-table-column>
      <el-table-column label="型号" min-width="120">
        <template #default="scope">
          <el-input v-model="scope.row.equipmentModel" aria-label="型号" size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'equipmentModel', el)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'equipmentModel', $event)" />
        </template>
      </el-table-column>
      <el-table-column label="类型" min-width="100">
        <template #default="scope">
          <el-input v-model="scope.row.type" aria-label="类型" size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'type', el)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'type', $event)" />
        </template>
      </el-table-column>
      <el-table-column label="品牌" min-width="100">
        <template #default="scope">
          <el-input v-model="scope.row.brand" aria-label="品牌" size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'brand', el)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'brand', $event)" />
        </template>
      </el-table-column>
      <el-table-column label="参数" min-width="120">
        <template #default="scope">
          <el-input v-model="scope.row.spec" aria-label="参数" size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'spec', el)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'spec', $event)" />
        </template>
      </el-table-column>
      <el-table-column label="数量" width="80" align="center">
        <template #default="scope">
          <el-input
            v-model="scope.row.quantity"
            aria-label="数量"
            size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'quantity', el)"
            @input="(val: string) => filterNumberInput(scope.row, 'quantity', val)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'quantity', $event)"
          />
        </template>
      </el-table-column>
    </el-table>
    </div>

    <div class="editor-footer">
      <el-pagination
        v-if="rows.length > pageSize"
        class="detail-pagination"
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
  margin-top: 8px;
}

.detail-pagination {
  margin: 0;
}
</style>
