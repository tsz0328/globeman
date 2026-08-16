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
import { ref, computed, watch, nextTick } from 'vue'

// 与父组件双向绑定的设备明细数组
const rows = defineModel<DetailTableRow[]>('rows', { required: true })

// 设备明细分页：每页最多 7 行
const currentPage = ref(1)
const pageSize = ref(7)
const pageRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return rows.value.slice(start, start + pageSize.value)
})

// 序号列连续编号（跨页不断号）
const indexMethod = (i: number) => (currentPage.value - 1) * pageSize.value + i + 1

// 切页
const handlePageChange = (p: number) => {
  currentPage.value = p
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

// 单元格键盘导航（与订单详情弹窗一致）：
// - 回车：跳到下一列；末列回车 → 下一行首列；最后一行末列回车 → 新增一行并聚焦其首列
// - 左右方向键：同列切换
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
      // 本页最后一行末列回车 → 新增一行（自动跳到新行所在页）
      addDetailRow()
    }
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    if (idx < ROW_COLUMNS.length - 1) focusCell(rowIndex, ROW_COLUMNS[idx + 1]!)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    if (idx > 0) focusCell(rowIndex, ROW_COLUMNS[idx - 1]!)
  }
}

const addDetailRow = () => {
  rows.value.push(createBlankRow())
  const total = rows.value.length
  // 新增行若超出当前页则自动跳到新行所在页
  const newPage = Math.max(1, Math.ceil(total / pageSize.value))
  currentPage.value = newPage
  const localIndex = total - 1 - (newPage - 1) * pageSize.value
  // 新增后自动聚焦新行首列，便于连续录单
  nextTick(() => focusCell(localIndex, ROW_COLUMNS[0]!))
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
  <div>
    <el-table :data="pageRows" border class="detail-table" max-height="400">
      <el-table-column type="index" label="序号" width="60" align="center" :index="indexMethod" />
      <el-table-column label="品名" min-width="120">
        <template #default="scope">
          <el-input v-model="scope.row.equipmentName" aria-label="品名" size="small"
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

    <el-pagination
      v-if="rows.length > pageSize"
      class="detail-pagination"
      background
      layout="total, prev, pager, next"
      :total="rows.length"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
    />

    <div class="table-actions">
      <el-button size="small" @click="addDetailRow">+ 添加一行</el-button>
    </div>
  </div>
</template>

<style scoped>
.detail-table {
  margin: 16px 0;
}

.detail-table :deep(.el-table__header-wrapper th) {
  background-color: #f5f7fa;
  color: #333;
  font-weight: bold;
  text-align: center;
}

.table-actions {
  margin: 8px 0;
}

.detail-pagination {
  margin: 12px 0 4px;
  display: flex;
  justify-content: flex-end;
}
</style>
