<template>
  <el-dialog
    :model-value="modelValue"
    width="80vw"
    align-center
    destroy-on-close
    class="repair-inbound-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="inbound-dialog__title">
        <span class="inbound-dialog__title-text">维修入库 · 设备清单</span>
        <span v-if="orderName" class="inbound-dialog__order">订单：{{ orderName }}</span>
      </div>
    </template>

    <div class="inbound-dialog__body">
      <!-- 表格末尾常驻一行可编辑空白行：回车在列间流转，最后一列（数量）回车提交，提交后自动复位为新的空白行 -->
      <div class="inbound-table-wrap">
        <el-table :data="tableData" border style="width: 100%" row-key="id" :row-class-name="blankRowClassName">
          <el-table-column type="index" label="#" width="50" />
          <el-table-column label="设备名称" min-width="140">
            <template #default="scope">
              <el-input v-if="scope.row.isBlank" v-model="scope.row.name" class="blank-row-input"
                size="small" placeholder="设备名称"
                :ref="(el: unknown) => setCellRef(0, 'name', el)"
                @keydown="onCellKeydown(0, 'name', $event)" />
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="品牌" width="120">
            <template #default="scope">
              <el-input v-if="scope.row.isBlank" v-model="scope.row.brand" class="blank-row-input"
                size="small" placeholder="品牌"
                :ref="(el: unknown) => setCellRef(0, 'brand', el)"
                @keydown="onCellKeydown(0, 'brand', $event)" />
              <span v-else>{{ scope.row.brand }}</span>
            </template>
          </el-table-column>
          <el-table-column label="型号" width="150">
            <template #default="scope">
              <el-input v-if="scope.row.isBlank" v-model="scope.row.model" class="blank-row-input"
                size="small" placeholder="型号"
                :ref="(el: unknown) => setCellRef(0, 'model', el)"
                @keydown="onCellKeydown(0, 'model', $event)" />
              <span v-else>{{ scope.row.model }}</span>
            </template>
          </el-table-column>
          <el-table-column label="参数" min-width="140">
            <template #default="scope">
              <el-input v-if="scope.row.isBlank" v-model="scope.row.spec" class="blank-row-input"
                size="small" placeholder="参数"
                :ref="(el: unknown) => setCellRef(0, 'spec', el)"
                @keydown="onCellKeydown(0, 'spec', $event)" />
              <span v-else>{{ scope.row.spec }}</span>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="110">
            <template #default="scope">
              <el-input v-if="scope.row.isBlank" v-model="scope.row.type" class="blank-row-input"
                size="small" placeholder="类型"
                :ref="(el: unknown) => setCellRef(0, 'type', el)"
                @keydown="onCellKeydown(0, 'type', $event)" />
              <span v-else>{{ scope.row.type }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="80" align="right">
            <template #default="scope">
              <el-input v-if="scope.row.isBlank" v-model="scope.row.number" class="blank-row-input"
                size="small" placeholder="数量" aria-label="数量"
                :ref="(el: unknown) => setCellRef(0, 'number', el)"
                @input="onNumberInput" @keydown="onCellKeydown(0, 'number', $event)" />
              <span v-else>{{ scope.row.number }}</span>
            </template>
          </el-table-column>
          <el-table-column label="已录 SN" width="110" align="center">
            <template #default="scope">
              <span v-if="scope.row.isBlank" class="inbound-dialog__hint">—</span>
              <span v-else class="inbound-dialog__count">{{ scope.row.SN?.length || 0 }} / {{ scope.row.number }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button v-if="!scope.row.isBlank" type="primary" size="small" @click="openSnForm(scope.row)">
                添加SN码
              </el-button>
              <span v-else class="inbound-dialog__hint">回车/失焦提交</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="emit('update:modelValue', false)">关闭</el-button>
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
        设备：{{ snFormDetail.name }}　已存在
        {{ snFormExisting.length }} 条 SN（已锁定），可继续补充其余 SN 码后提交
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
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { RepairOrderDetail } from '@/api/repair/RepairApi'
import SnCodeEditor, { type SnRow } from './SnCodeEditor.vue'
import { createDetailApi } from '@/api/order/OrderDeviceApi'

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

// 表格末尾常驻的空白录入行：作为 tableData 的最后一行并入表格，回车/失焦即提交，提交后自动复位
// 空白行对象：number 允许字符串以便输入过滤，提交时再转 number
type BlankRow = Omit<RepairOrderDetail, 'number'> & { isBlank: boolean; number: number | string }

const blankRow = reactive<BlankRow>({
  id: -1,
  isBlank: true,
  SN: [],
  name: '',
  brand: '',
  model: '',
  spec: '',
  type: '',
  number: '',
})

// 限制数量输入：只保留数字（纯整数），与添加订单表单一致
const onNumberInput = (val: string | number) => {
  const cleaned = String(val).replace(/[^\d]/g, '')
  if (cleaned !== String(val)) blankRow.number = cleaned
}

// 表格行：只读明细行 + 末尾空白行。number 允许字符串以便空白行输入过滤
type TableRow = Omit<RepairOrderDetail, 'number'> & { isBlank?: boolean; number: number | string }

const tableData = computed<TableRow[]>(() => [...props.details, blankRow])

// 空白行底色区分
const blankRowClassName = ({ row }: { row: TableRow }) => (row.isBlank ? 'blank-row' : '')

// 空白行输入列顺序（决定回车流转顺序），与表格列一致
const ROW_COLUMNS = ['name', 'brand', 'model', 'spec', 'type', 'number'] as const

// 各单元格输入框实例（列名定位，用于回车切换焦点）
const cellRefs = ref<Record<string, { focus: () => void } | null>>({})
const setCellRef = (rowIndex: number, col: string, el: unknown) => {
  const key = `${rowIndex}:${col}`
  if (el) cellRefs.value[key] = el as { focus: () => void }
  else delete cellRefs.value[key]
}
const focusCell = (rowIndex: number, col: string) => {
  cellRefs.value[`${rowIndex}:${col}`]?.focus()
}

// 单元格键盘导航（与添加订单表单一致）：
// - 回车：跳到下一列；最后一列（数量）回车 → 提交空白行
// - 左右方向键：同列相邻列切换
const onCellKeydown = (rowIndex: number, col: string, e: KeyboardEvent) => {
  const idx = ROW_COLUMNS.indexOf(col as (typeof ROW_COLUMNS)[number])
  if (idx < 0) return
  if (e.key === 'Enter') {
    e.preventDefault()
    if (idx < ROW_COLUMNS.length - 1) {
      focusCell(rowIndex, ROW_COLUMNS[idx + 1]!)
    } else {
      // 最后一列（数量）回车 → 提交
      submitBlankRow()
    }
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    if (idx < ROW_COLUMNS.length - 1) focusCell(rowIndex, ROW_COLUMNS[idx + 1]!)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    if (idx > 0) focusCell(rowIndex, ROW_COLUMNS[idx - 1]!)
  }
}

// 回车提交（仅最后一列触发）：显式提交，缺失必填项时给出提示
const submitBlankRow = () => {
  if (!blankRow.name.trim()) {
    ElMessage.warning('请填写设备名称')
    return
  }
  const num = Number(blankRow.number)
  if (!blankRow.number || Number.isNaN(num) || num < 1) {
    ElMessage.warning('请填写正确的数量')
    return
  }
  if (!props.orderId) {
    ElMessage.warning('缺少订单 ID，无法新增设备')
    return
  }
  doSubmit()
}

// 实际提交：调用 /client/order/addOrderDetail，成功后复位空白行并刷新列表
const doSubmit = async () => {
  const orderId = props.orderId
  if (!orderId) return
  const res = await createDetailApi({
    order: orderId,
    name: blankRow.name.trim(),
    model: blankRow.model.trim(),
    type: blankRow.type.trim() || undefined,
    brand: blankRow.brand.trim(),
    spec: blankRow.spec.trim() || undefined,
    number: Number(blankRow.number),
  })
  if (Number(res.code) === 200) {
    ElMessage.success('已添加设备')
    blankRow.name = ''
    blankRow.brand = ''
    blankRow.model = ''
    blankRow.spec = ''
    blankRow.type = ''
    blankRow.number = ''
    emit('refresh')
  } else {
    ElMessage.error(res.msg || '添加失败')
  }
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

/* 维修入库主弹窗：60vw × 60vh，内容区弹性滚动 */
.repair-inbound-dialog {
  height: 60vh;
  display: flex;
  flex-direction: column;
}

.repair-inbound-dialog .el-dialog__body {
  flex: 1;
  overflow: auto;
}
</style>
