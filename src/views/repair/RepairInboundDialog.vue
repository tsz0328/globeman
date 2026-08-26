<template>
  <el-dialog
    :model-value="modelValue"
    width="80vw"
    align-center
    destroy-on-close
    class="repair-inbound-dialog"
    @update:model-value="emit('update:modelValue', $event)"
    @opened="onDialogOpened"
  >
    <template #header>
      <div class="inbound-dialog__title">
        <span class="inbound-dialog__title-text">维修入库 · 设备清单</span>
        <span v-if="orderName" class="inbound-dialog__order">订单：{{ orderName }}</span>
      </div>
    </template>

    <div class="inbound-dialog__body">
      <!-- 设备清单：已有明细只读 + 末尾多行可编辑新增行，每页行数随弹窗高度自动铺满 -->
      <div class="inbound-table-wrap" ref="tableRegionRef">
        <el-table
          :data="pageRows"
          border
          style="width: 100%"
          row-key="rowKey"
          :row-class-name="blankRowClassName"
        >
          <el-table-column type="index" label="序号" width="50" :index="indexMethod" />
          <el-table-column label="设备名称" min-width="140">
            <template #default="scope">
              <el-input
                v-if="scope.row.isBlank"
                v-model="scope.row.name"
                class="blank-row-input"
                size="small"
                placeholder="设备名称"
                :ref="(el: unknown) => setCellRef(scope.$index, 'name', el)"
                @keydown="onCellKeydown(scope.row, scope.$index, 'name', $event)"
                @blur="onBlankRowBlur(scope.row, $event)"
              />
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="品牌" width="120">
            <template #default="scope">
              <el-input
                v-if="scope.row.isBlank"
                v-model="scope.row.brand"
                class="blank-row-input"
                size="small"
                placeholder="品牌"
                :ref="(el: unknown) => setCellRef(scope.$index, 'brand', el)"
                @keydown="onCellKeydown(scope.row, scope.$index, 'brand', $event)"
                @blur="onBlankRowBlur(scope.row, $event)"
              />
              <span v-else>{{ scope.row.brand }}</span>
            </template>
          </el-table-column>
          <el-table-column label="型号" width="150">
            <template #default="scope">
              <el-input
                v-if="scope.row.isBlank"
                v-model="scope.row.model"
                class="blank-row-input"
                size="small"
                placeholder="型号"
                :ref="(el: unknown) => setCellRef(scope.$index, 'model', el)"
                @keydown="onCellKeydown(scope.row, scope.$index, 'model', $event)"
                @blur="onBlankRowBlur(scope.row, $event)"
              />
              <span v-else>{{ scope.row.model }}</span>
            </template>
          </el-table-column>
          <el-table-column label="参数" min-width="140">
            <template #default="scope">
              <el-input
                v-if="scope.row.isBlank"
                v-model="scope.row.spec"
                class="blank-row-input"
                size="small"
                placeholder="参数"
                :ref="(el: unknown) => setCellRef(scope.$index, 'spec', el)"
                @keydown="onCellKeydown(scope.row, scope.$index, 'spec', $event)"
                @blur="onBlankRowBlur(scope.row, $event)"
              />
              <span v-else>{{ scope.row.spec }}</span>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="110">
            <template #default="scope">
              <el-input
                v-if="scope.row.isBlank"
                v-model="scope.row.type"
                class="blank-row-input"
                size="small"
                placeholder="类型"
                :ref="(el: unknown) => setCellRef(scope.$index, 'type', el)"
                @keydown="onCellKeydown(scope.row, scope.$index, 'type', $event)"
                @blur="onBlankRowBlur(scope.row, $event)"
              />
              <span v-else>{{ scope.row.type }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="80" align="right">
            <template #default="scope">
              <el-input
                v-if="scope.row.isBlank"
                v-model="scope.row.number"
                class="blank-row-input"
                size="small"
                placeholder="数量"
                aria-label="数量"
                :ref="(el: unknown) => setCellRef(scope.$index, 'number', el)"
                @input="(val: string) => onNumberInput(scope.row, val)"
                @keydown="onCellKeydown(scope.row, scope.$index, 'number', $event)"
                @blur="onBlankRowBlur(scope.row, $event)"
              />
              <span v-else>{{ scope.row.number }}</span>
            </template>
          </el-table-column>
          <el-table-column label="已录 SN" width="110" align="center">
            <template #default="scope">
              <span v-if="scope.row.isBlank" class="inbound-dialog__hint">—</span>
              <span v-else class="inbound-dialog__count"
                >{{ scope.row.SN?.length || 0 }} / {{ scope.row.number }}</span
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="162" fixed="right">
            <template #default="scope">
              <template v-if="!scope.row.isBlank">
                <el-button type="primary" size="small" @click="openSnForm(scope.row)">
                  添加SN码
                </el-button>
                <el-button type="danger" size="small" @click="deleteOrderDevice(scope.row)"
                  >删除</el-button
                >
              </template>
              <span v-else class="inbound-dialog__hint">回车/失焦提交</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="inbound-dialog__footer">
        <el-pagination
          v-if="tableData.length > pageSize"
          class="inbound-pagination"
          background
          size="small"
          layout="total, prev, pager, next"
          :total="tableData.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleInbound">确定入库</el-button>
      <el-button @click="emit('update:modelValue', false)">关闭</el-button>
    </template>

    <!-- 添加 SN 码表单：表格化录入，每页行数由弹窗大小决定、自动铺满空白行 -->
    <el-dialog
      v-model="snFormVisible"
      title="添加 SN 码"
      width="60vw"
      align-center
      append-to-body
      destroy-on-close
      class="sn-form-dialog"
      @opened="onSnFormOpened"
      @close="resetSnForm"
    >
      <p v-if="snFormDetail" class="sn-form__hint">
        设备：{{ snFormDetail.name }}　已存在 {{ snFormExisting.length }} 条
        SN（已锁定），可继续补充其余 SN 码后提交
      </p>
      <SnCodeEditor
        ref="snEditorRef"
        v-model:rows="snFormRows"
        :existing-sn="snFormExisting"
        :device-id="snFormDetail?.id ?? ''"
      />
      <template #footer>
        <el-button @click="snFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSnFormConfirm">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { RepairOrderDetail } from '@/api/repair/RepairApi'
import SnCodeEditor, { type SnRow } from './SnCodeEditor.vue'
import { createDetailApi, deleteDetailApi } from '@/api/order/OrderDeviceApi'

const props = defineProps<{
  modelValue: boolean
  orderName?: string
  details: RepairOrderDetail[]
  orderId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'refresh'): void
}>()

// 添加 SN 码表单状态
const snFormVisible = ref(false)
const snFormDetail = ref<TableRow | null>(null)
const snFormExisting = ref<string[]>([]) // 该设备已存在的 SN（来自 getOrder），录入时锁定
const snFormRows = ref<SnRow[]>([])
const snEditorRef = ref<InstanceType<typeof SnCodeEditor>>()

// 点「添加SN码」：记录设备与已存在 SN，弹窗打开后由 SnCodeEditor 按弹窗大小预填
const openSnForm = (detail: TableRow) => {
  snFormDetail.value = detail
  snFormExisting.value = (detail.SN || []).map((s) => s.trim()).filter(Boolean)
  snFormRows.value = []
  snFormVisible.value = true
}

// 删除已有设备明细行（DELETE /client/order/deleteOrderDetail?id=）
const deleteOrderDevice = async (row: TableRow) => {
  if (row.isBlank || !row.id || row.id <= 0) return
  try {
    await ElMessageBox.confirm(`确定要删除设备「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await deleteDetailApi(Number(row.id))
    if (Number(res.code) === 200) {
      ElMessage.success('删除成功')
      emit('refresh')
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 弹窗打开动画结束、布局就绪后再预填：避免首开时过渡未结束导致测量行数偏小
const onSnFormOpened = () => {
  snEditorRef.value?.prefillFirstPage()
}

// 确定：SN 均为录入时即时提交（回车/失焦），此处仅关闭并刷新列表
const handleSnFormConfirm = () => {
  snFormVisible.value = false
  emit('refresh')
}

const resetSnForm = () => {
  snFormDetail.value = null
  snFormExisting.value = []
  snFormRows.value = []
}

// 入库：接口待定，先放置占位处理（点击不报错，便于后续对接真实接口）。
// TODO: 接口确认后，这里传入 props.orderId 与当前设备明细，调用对应的入库接口。
const handleInbound = () => {
  ElMessage.info('入库功能待对接（接口待定）')
}

// 表格行：只读明细行 + 可编辑新增行。number 允许字符串以便空白行输入过滤
type TableRow = Omit<RepairOrderDetail, 'number'> & {
  isBlank?: boolean
  number: number | string
  rowKey?: string
}

// 可编辑新增行唯一 key 自增计数器
let blankRowSeq = 0

// 创建一个可编辑空白新增行对象
const createBlankRow = (): TableRow => ({
  id: -1,
  isBlank: true,
  SN: [],
  name: '',
  brand: '',
  model: '',
  spec: '',
  type: '',
  number: '',
  rowKey: `new-row-${++blankRowSeq}`,
})

// 可编辑新增行数组（已有明细只读；新增行逐行即时提交，提交后由父组件刷新成只读明细）
const blankRows = ref<TableRow[]>([])

// 限制数量输入：只保留数字（纯整数），与添加订单表单一致
const onNumberInput = (row: TableRow, val: string) => {
  const cleaned = String(val).replace(/[^\d]/g, '')
  if (cleaned !== String(val)) row.number = cleaned
}

const tableData = computed<TableRow[]>(() => [
  // 已有明细：只读展示，rowKey 用设备 id（稳定 key，避免分页行状态串扰）
  ...props.details.map((d) => ({ ...d, rowKey: `detail-${d.id}` })),
  ...blankRows.value,
])

// 空白行底色区分
const blankRowClassName = ({ row }: { row: TableRow }) => (row.isBlank ? 'blank-row' : '')

// 空白行输入列顺序（决定回车流转顺序），与表格列一致
const ROW_COLUMNS = ['name', 'brand', 'model', 'spec', 'type', 'number'] as const

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

// 单元格键盘导航走迷宫式：
// - 回车：跳到下一列；末列 → 下一行首列；最后一行末列 → 提交本行 + 跳下一页
// - 左/右方向键：切换列；首列 → 上一行末列 / 末列 → 下一行首列，跨页回绕
// - 上/下方向键：切换行；页边界时向上→上一页、向下→下一页
const onCellKeydown = (row: TableRow, rowIndex: number, col: string, e: KeyboardEvent) => {
  const idx = ROW_COLUMNS.indexOf(col as (typeof ROW_COLUMNS)[number])
  if (idx < 0) return
  if (e.key === 'Enter') {
    e.preventDefault()
    if (idx < ROW_COLUMNS.length - 1) {
      focusCell(rowIndex, ROW_COLUMNS[idx + 1]!)
    } else {
      // 末列（数量）回车 → 提交本行；校验通过才跳下一行（末行则跳下一页），避免校验失败时焦点被带走
      if (submitBlankRow(row)) {
        if (rowIndex < pageRows.value.length - 1) {
          focusCell(rowIndex + 1, ROW_COLUMNS[0]!)
        } else {
          goNextPage()
        }
      }
    }
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    if (idx < ROW_COLUMNS.length - 1) {
      focusCell(rowIndex, ROW_COLUMNS[idx + 1]!)
    } else if (rowIndex < pageRows.value.length - 1) {
      focusCell(rowIndex + 1, ROW_COLUMNS[0]!)
    } else {
      goNextPage()
    }
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    if (idx > 0) {
      focusCell(rowIndex, ROW_COLUMNS[idx - 1]!)
    } else if (rowIndex > 0) {
      focusCell(rowIndex - 1, ROW_COLUMNS[ROW_COLUMNS.length - 1]!)
    } else if (currentPage.value > 1) {
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

// 分页：每页行数由「弹窗可容纳行数」动态决定，自动铺满空白行
const currentPage = ref(1)
const pageSize = ref(10)
const pageRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return tableData.value.slice(start, start + pageSize.value)
})

// 序号列连续编号（跨页不断号）
const indexMethod = (i: number) => (currentPage.value - 1) * pageSize.value + i + 1

// 动态测量：表格区域高度 + 实测行高/表头高 → 计算每页行数
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
    // 弹窗/窗口尺寸变化导致每页行数变化时，补足当前页空白行，避免表格下方留白
    ensurePageFilled(currentPage.value)
  })
  if (tableRegionRef.value) ro.observe(tableRegionRef.value)
})
onUnmounted(() => ro?.disconnect())

// 确保指定页已被新增空白行填满（不足则补足），使每页都“占满”
const ensurePageFilled = (page: number) => {
  const needed = page * pageSize.value
  const existing = tableData.value.length
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
}

// 切页：跳到的页若未填满则补空白行
const handlePageChange = (p: number) => {
  currentPage.value = p
  ensurePageFilled(p)
}

// 方向键向下翻页：跳到下一页首行，保持当前列
const goNextPageAtCol = (col: string) => {
  currentPage.value += 1
  ensurePageFilled(currentPage.value)
  nextTick(() => focusCell(0, col))
}

// 回车/右键末行翻页：跳到下一页首行首列
const goNextPage = () => {
  currentPage.value += 1
  ensurePageFilled(currentPage.value)
  nextTick(() => focusCell(0, ROW_COLUMNS[0]!))
}

// 方向键向上翻页：跳到上一页最后一行，保持当前列
const goPrevPageAtCol = (col: string) => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  nextTick(() => focusCell(pageRows.value.length - 1, col))
}

// 失焦提交：新行任意输入框失焦、且焦点真正离开该新增行（非行内列间切换）时提交设备；
// 全空行静默忽略（不提示），避免误触时弹出警告
const onBlankRowBlur = (row: TableRow, e: FocusEvent) => {
  const next = e.relatedTarget as HTMLElement | null
  if (next && next.closest && next.closest('.blank-row-input')) {
    return
  }
  if (!row.name.trim() && !row.brand.trim() && !row.model.trim()) {
    return
  }
  submitBlankRow(row)
}

// 已进入提交流程的空白行（防回车后失焦重复提交）
const submittingRows = new Set<TableRow>()

// 回车提交（仅末列触发）：显式提交，缺失必填项时给出提示；校验通过返回 true
const submitBlankRow = (row: TableRow): boolean => {
  if (!row.isBlank) return false
  if (submittingRows.has(row)) return false
  if (!row.name.trim()) {
    ElMessage.warning('请填写设备名称')
    return false
  }
  const num = Number(row.number)
  if (!row.number || Number.isNaN(num) || num < 1) {
    ElMessage.warning('请填写正确的数量')
    return false
  }
  if (!props.orderId) {
    ElMessage.warning('缺少订单 ID，无法新增设备')
    return false
  }
  submittingRows.add(row)
  doSubmit(row).finally(() => submittingRows.delete(row))
  return true
}

// 实际提交：调用 /client/order/addOrderDetail，成功后移除该行并刷新列表
const doSubmit = async (row: TableRow) => {
  const orderId = props.orderId
  if (!orderId) return
  const res = await createDetailApi({
    order: orderId,
    name: row.name.trim(),
    model: row.model.trim(),
    type: row.type.trim() || undefined,
    brand: row.brand.trim(),
    spec: row.spec.trim() || undefined,
    number: Number(row.number),
  })
  if (Number(res.code) === 200) {
    ElMessage.success('已添加设备')
    // 从可编辑新增行中移除已提交行（父组件刷新后出现在只读明细里）
    blankRows.value = blankRows.value.filter((r) => r !== row)
    emit('refresh')
    // 确保当前页末尾仍有空白行可继续录入
    ensurePageFilled(currentPage.value)
  } else {
    ElMessage.error(res.msg || '添加失败')
  }
}

// 弹窗打开动画结束、布局就绪后测量并铺满首页空白行（此时高度测量最准确）
const onDialogOpened = () => {
  nextTick(() => prefillFirstPage())
}
</script>

<style scoped>
.inbound-dialog__title {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.inbound-dialog__title-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--brand-700);
}

.inbound-dialog__order {
  font-size: 13px;
  color: #909399;
}

.inbound-dialog__count {
  font-variant-numeric: tabular-nums;
  color: #606266;
}

.sn-form__hint {
  margin: 0 0 16px;
  font-size: 13px;
  color: #909399;
}

/* 空白行提示占位（已录 SN / 操作列） */
.inbound-dialog__hint {
  font-size: 12px;
  color: #c0c4cc;
}

/* 表格末尾空白录入行底色，与只读行区分 */
:deep(.blank-row td) {
  background: #fafbff;
}

/* 空白行输入框在单元格内铺满 */
:deep(.blank-row-input) {
  width: 100%;
}

/* 底部操作栏：分页高度固定，避免分页出现时挤压表格区域、
   导致 ResizeObserver 重算每页行数的反馈循环（与 OrderAddDeviceEditor 一致） */
.inbound-dialog__footer {
  flex-shrink: 0;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 8px;
}

.inbound-pagination {
  margin: 0;
}
</style>

<style>
/* 添加 SN 码弹窗高度控制：class 落到 .el-dialog 上，用非 scoped 样式避开 teleport 导致的 scoped 失效 */
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

/* SN 录入表格编辑区弹性占满弹窗剩余空间，从而让内部按高度自动铺满空白行 */
.sn-form-dialog .sn-editor {
  flex: 1;
  min-height: 0;
}

/* 维修入库主弹窗：内容区弹性滚动 */
.repair-inbound-dialog {
  height: 60vh;
  display: flex;
  flex-direction: column;
}

.repair-inbound-dialog .el-dialog__body {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 中间层容器同样纵向 flex 撑满：缺这层会导致 .inbound-table-wrap 的 flex:1 不生效，
   表格区域高度退化为内容高度（只有几行），measure 测不到真实高度、无法铺满 */
.repair-inbound-dialog .inbound-dialog__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 设备表格区域弹性占满弹窗剩余空间，让内部按高度自动铺满空白行 */
.repair-inbound-dialog .inbound-table-wrap {
  flex: 1;
  min-height: 0;
}
</style>
