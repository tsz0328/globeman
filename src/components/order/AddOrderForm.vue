<template>
  <el-dialog :title="title" v-model="visibleValue" width="80vw">
    <!-- 表单内容 -->
    <el-form ref="formRef" :model="form" :rules="rules">
      <div class="form-info">
        <div class="info-row">
          <div class="info-item">
            <span class="label">订单名称（必填）：</span>
            <el-input
              v-model="form.name"
              class="info-input"
              placeholder="请输入订单名称"
              @keyup.enter.prevent="handleEnter($event)"
              @keydown.up.prevent="handleKeydown($event)"
              @keydown.down.prevent="handleKeydown($event)"
            />
          </div>
          <div class="info-item">
            <span class="label">订单类型（必填）：</span>
            <el-select
              v-model="form.type"
              class="info-input"
              placeholder="请选择订单类型"
              @keyup.enter.prevent="handleEnter($event)"
              @keydown.up.prevent="handleKeydown($event)"
              @keydown.down.prevent="handleKeydown($event)"
            >
              <el-option label="销售订单" value="销售订单" />
              <el-option label="采购订单" value="采购订单" />
              <el-option label="维修订单" value="维修订单" />
            </el-select>
          </div>
        </div>

        <div class="info-row">
          <div class="info-item">
            <span class="label">负责人（必填）：</span>
            <el-select
              v-model="leaderName"
              class="info-input"
              placeholder="请选择负责人"
              @change="handleLeaderChange"
              @keyup.enter.prevent="handleEnter($event)"
              @keydown.up.prevent="handleKeydown($event)"
              @keydown.down.prevent="handleKeydown($event)"
            >
              <el-option
                v-for="user in props.userList"
                :key="user.account"
                :label="user.name"
                :value="user.name"
              />
            </el-select>
          </div>
          <div class="info-item">
            <span class="label">客户（必填）：</span>
            <el-autocomplete
              v-model="customerName"
              class="info-input"
              :fetch-suggestions="queryCustomerSearch"
              placeholder="请输入客户名称"
              :trigger-on-focus="false"
              @select="handleCustomerSelect"
              @blur="handleCustomerBlur"
              @keyup.enter.prevent="handleEnter($event)"
              @keydown.up.prevent="handleKeydown($event)"
              @keydown.down.prevent="handleKeydown($event)"
            />
          </div>
        </div>

        <div class="info-row">
          <div class="info-item">
            <span class="label">客户联系人（必填）：</span>
            <el-autocomplete
              v-model="contactName"
              class="info-input"
              :fetch-suggestions="queryContactSearch"
              placeholder="请输入联系人"
              :trigger-on-focus="false"
              @select="handleContactSelect"
              @blur="handleContactBlur"
              @keyup.enter.prevent="handleEnter($event)"
              @keydown.up.prevent="handleKeydown($event)"
              @keydown.down.prevent="handleKeydown($event)"
            />
          </div>
          <div class="info-item">
            <span class="label">联系人电话：</span>
            <el-input
              v-model="form.contactPhone"
              class="info-input"
              placeholder="请输入联系人电话"
              @keyup.enter.prevent="handleEnter($event)"
              @keydown.up.prevent="handleKeydown($event)"
              @keydown.down.prevent="handleKeydown($event)"
            />
          </div>
        </div>

        <div class="info-row">
          <div class="info-item info-item-full">
            <span class="label">执行省市区：</span>
            <el-cascader
              v-model="selectedRegion"
              :options="regionData"
              :props="{ value: 'label', emitPath: true }"
              class="info-input"
              placeholder="请选择省/市/区"
              clearable
              @keyup.enter.prevent="handleEnter($event)"
            />
          </div>
        </div>

        <div class="info-row">
          <div class="info-item">
            <span class="label">送修地址：</span>
            <el-input
              v-model="form.address"
              class="info-input"
              placeholder="请输入送修地址"
              @keyup.enter.prevent="handleSubmit"
              @keydown.up.prevent="handleKeydown($event)"
              @keydown.down.prevent="handleKeydown($event)"
            />
          </div>
        </div>
      </div>
    </el-form>

    <!-- 设备明细表格 -->
    <el-table :data="detailRows" border class="detail-table" max-height="400">
      <el-table-column type="index" label="序号" width="60" align="center" />
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
      <el-table-column label="单价" width="100" align="right">
        <template #default="scope">
          <el-input
            v-model="scope.row.unitPrice"
            aria-label="单价"
            size="small"
            :ref="(el: unknown) => setCellRef(scope.$index, 'unitPrice', el)"
            @input="(val: string) => filterNumberInput(scope.row, 'unitPrice', val)"
            @keydown="onCellKeydown(scope.row, scope.$index, 'unitPrice', $event)"
          />
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100" align="right">
        <template #default="scope">
          {{ calcAmountText(scope.row.quantity, scope.row.unitPrice) }}
        </template>
      </el-table-column>
    </el-table>

    <div class="table-actions">
      <el-button size="small" @click="addDetailRow">+ 添加一行</el-button>
    </div>

    <!-- 弹窗底部盖章区 -->
    <div class="form-footer">
      <div class="footer-row">
        <div class="footer-item">
          <div><span class="label">采购单位（甲方盖章）：</span></div>
          <div><span class="label">代表人（签名）：</span></div>
          <div><span class="label">日期：</span></div>
        </div>
        <div class="footer-item">
          <div><span class="label">供应单位（甲方盖章）：</span></div>
          <div><span class="label">代表人（签名）：</span></div>
          <div><span class="label">日期：</span></div>
        </div>
      </div>
    </div>

    <!-- 弹窗底部 -->
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { regionData } from '@/data/chinaArea'
import type { OrderManager, OrderCustomer } from '@/api/order/OrderApi'
interface DetailTableRow {
  equipmentName: string
  equipmentModel: string
  type: string
  brand: string
  spec: string
  quantity: number | string
  unitPrice: number | string
}
const createBlankRow = (): DetailTableRow => ({
  equipmentName: '',
  equipmentModel: '',
  type: '',
  brand: '',
  spec: '',
  quantity: '',
  unitPrice: '',
})

// 设备明细只存在本地，暂不调用保存接口
const detailRows = ref<DetailTableRow[]>([createBlankRow()])
const addDetailRow = () => {
  detailRows.value.push(createBlankRow())
  const newIndex = detailRows.value.length - 1
  // 新增后自动聚焦新行首列，便于连续录单
  nextTick(() => focusCell(newIndex, ROW_COLUMNS[0]!))
}

// 设备明细列顺序（决定键盘导航的列流转顺序），与表格列一致
const ROW_COLUMNS = [
  'equipmentName',
  'equipmentModel',
  'type',
  'brand',
  'spec',
  'quantity',
  'unitPrice',
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
    } else if (rowIndex < detailRows.value.length - 1) {
      focusCell(rowIndex + 1, ROW_COLUMNS[0]!)
    } else {
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

const props = defineProps<{
  visible: boolean
  projectId?: string
  userList: OrderManager[]
  customerList: OrderCustomer[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: OrderSubmitPayload): void
}>()

const formRef = ref<FormInstance>()
const isModalVisible = ref(false)

const rules = {}

// 省市区级联选择器的值，格式: [provinceCode, cityCode, districtCode] 或 ['provinceName', 'cityName', 'districtName']
// regionData 中 value 是行政区划代码, label 是名称
// 我们选择 label 作为值以便直接用于表单
const selectedRegion = ref<string[]>([])

// 同步级联选择器 → form.province/city/district
watch(selectedRegion, (val) => {
  if (val && val.length >= 1) {
    form.value.province = val[0] || ''
    form.value.city = val[1] || ''
    form.value.district = val[2] || ''
  } else {
    form.value.province = ''
    form.value.city = ''
    form.value.district = ''
  }
})

const title = computed(() => '创建订单')

const form = ref<OrderFormData>({
  projectId: props.projectId,
  name: '',
  type: '',
  manager: '',
  customer: '',
  contact: '',
  contactPhone: '',
  province: '',
  city: '',
  district: '',
  address: '',
})

const leaderName = ref('')
const customerName = ref('')
const contactName = ref('')

const visibleValue = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const resetForm = () => {
  form.value = {
    projectId: props.projectId,
    name: '',
    type: '',
    manager: '',
    customer: '',
    contact: '',
    contactPhone: '',
    province: '',
    city: '',
    district: '',
    address: '',
  }
  leaderName.value = ''
  customerName.value = ''
  contactName.value = ''
  selectedRegion.value = []
  detailRows.value = [createBlankRow()]
  cellRefs.value = {}
  formRef.value?.clearValidate()
}

watch(
  () => props.projectId,
  (newId) => {
    form.value.projectId = newId
  },
)

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      resetForm()
    }
  },
)

const handleClose = () => {
  emit('update:visible', false)
}

const focusNextField = (currentInput: HTMLInputElement, direction: 'next' | 'prev') => {
  const formElement = currentInput.closest('.el-form')
  if (!formElement) return

  const formItems = formElement.querySelectorAll('.el-input__inner, .el-select__input')
  const currentIndex = Array.from(formItems).indexOf(currentInput)
  let targetIndex: number

  if (direction === 'next') {
    targetIndex = Math.min(currentIndex + 1, formItems.length - 1)
  } else {
    targetIndex = Math.max(currentIndex - 1, 0)
  }

  const targetItem = formItems[targetIndex] as HTMLInputElement
  targetItem.focus()
}

const handleKeydown = (event: KeyboardEvent) => {
  const currentInput = event.target as HTMLInputElement

  if (event.key === 'ArrowUp') {
    focusNextField(currentInput, 'prev')
  } else if (event.key === 'ArrowDown') {
    focusNextField(currentInput, 'next')
  }
}

const handleLeaderChange = (name: string) => {
  const user = props.userList.find((u) => u.name === name)
  form.value.manager = user?.account || ''
}

const queryCustomerSearch = (
  queryString: string,
  cb: (suggestions: { value: string; label: string; contact: string; phone?: string }[]) => void,
) => {
  const customers = props.customerList
  const results = queryString
    ? customers
        .filter((customer: OrderCustomer) =>
          customer.name.toLowerCase().includes(queryString.toLowerCase()),
        )
        .map((customer: OrderCustomer) => ({
          value: customer.name,
          label: customer.name,
          contact: customer.contact,
          phone: customer.phone,
        }))
    : customers.map((customer: OrderCustomer) => ({
        value: customer.name,
        label: customer.name,
        contact: customer.contact,
        phone: customer.phone,
      }))
  cb(results)
}

const handleCustomerSelect = (item: {
  value: string
  label: string
  contact: string
  phone?: string
}) => {
  customerName.value = item.value
  form.value.customer = item.value
  contactName.value = item.contact
  form.value.contact = item.contact
  form.value.contactPhone = item.phone || ''
}

const queryContactSearch = (
  queryString: string,
  cb: (suggestions: { value: string; label: string; customer: string; phone?: string }[]) => void,
) => {
  const customers = props.customerList
  const results = queryString
    ? customers
        .filter((customer: OrderCustomer) =>
          customer.contact.toLowerCase().includes(queryString.toLowerCase()),
        )
        .map((customer: OrderCustomer) => ({
          value: customer.contact,
          label: `${customer.contact} (${customer.name})`,
          customer: customer.name,
          phone: customer.phone,
        }))
    : customers.map((customer: OrderCustomer) => ({
        value: customer.contact,
        label: `${customer.contact} (${customer.name})`,
        customer: customer.name,
        phone: customer.phone,
      }))
  cb(results)
}

const handleContactSelect = (item: {
  value: string
  label: string
  customer: string
  phone?: string
}) => {
  contactName.value = item.value
  form.value.contact = item.value
  customerName.value = item.customer
  form.value.customer = item.customer
  form.value.contactPhone = item.phone || ''
}

const handleCustomerBlur = () => {
  if (customerName.value && !form.value.customer) {
    form.value.customer = customerName.value
  }
}

const handleContactBlur = () => {
  if (contactName.value && !form.value.contact) {
    form.value.contact = contactName.value
  }
}

const handleEnter = (event: KeyboardEvent) => {
  const currentInput = event.target as HTMLInputElement
  const formElement = currentInput.closest('.el-form')
  if (!formElement) return

  const formItems = formElement.querySelectorAll('.el-input__inner, .el-select__input')
  const currentIndex = Array.from(formItems).indexOf(currentInput)

  if (currentIndex < formItems.length - 1) {
    focusNextField(currentInput, 'next')
  } else {
    handleSubmit()
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

const handleSubmit = () => {
  if (isModalVisible.value) return

  const errors: string[] = []

  if (!form.value.name.trim()) {
    errors.push('订单名称')
  }
  if (!form.value.type.trim()) {
    errors.push('订单类型')
  }
  if (!form.value.manager.trim()) {
    errors.push('负责人')
  }
  if (!form.value.customer.trim()) {
    errors.push('客户')
  }
  if (!form.value.contact.trim()) {
    errors.push('客户联系人')
  }

  if (errors.length > 0) {
    ;(document.activeElement as HTMLElement | null)?.blur()
    isModalVisible.value = true

    ElMessageBox.alert(`请填写以下必填项：\n${errors.join('、')}`, '提示', {
      confirmButtonText: '确定',
    })
      .then(() => {
        isModalVisible.value = false
      })
      .catch(() => {
        isModalVisible.value = false
      })
    return
  }

  // 组装设备明细：要求有品名且数量/单价为正数，否则报错提示
  const details: CreateOrderDetailInput[] = []
  const detailErrors: string[] = []
  for (let i = 0; i < detailRows.value.length; i++) {
    const r = detailRows.value[i]
    if (!r) continue
    const name = r.equipmentName.trim()
    const model = r.equipmentModel.trim()
    const typeStr = r.type.trim()
    const brandStr = r.brand.trim()
    const specStr = r.spec.trim()
    const qtyStr = String(r.quantity).trim()
    const priceStr = String(r.unitPrice).trim()

    // 完全空行跳过
    if (!name && !model && !typeStr && !brandStr && !specStr && !qtyStr && !priceStr) continue

    // 品名为空
    if (!name) {
      detailErrors.push(`第 ${i + 1} 行：品名不能为空`)
      continue
    }
    // 数量校验
    const qty = Number(qtyStr)
    if (!qtyStr || isNaN(qty) || qty <= 0) {
      detailErrors.push(`第 ${i + 1} 行：数量必须为正数（当前值："${r.quantity || ''}"）`)
      continue
    }
    // 单价校验
    const price = Number(priceStr)
    if (!priceStr || isNaN(price) || price <= 0) {
      detailErrors.push(`第 ${i + 1} 行：单价必须为正数（当前值："${r.unitPrice || ''}"）`)
      continue
    }

    details.push({ name, model, type: typeStr, brand: brandStr, spec: specStr, number: qtyStr, price: priceStr })
  }

  if (detailErrors.length > 0) {
    ;(document.activeElement as HTMLElement | null)?.blur()
    isModalVisible.value = true
    ElMessageBox.alert(`设备明细校验不通过：\n${detailErrors.join('\n')}`, '提示', {
      confirmButtonText: '确定',
    })
      .then(() => {
        isModalVisible.value = false
      })
      .catch(() => {
        isModalVisible.value = false
      })
    return
  }

  emit('submit', { ...form.value, details })
  emit('update:visible', false)
}
</script>
<script lang="ts">
import type { CreateOrderDetailInput } from '@/composables/order/useOrder'

export interface OrderFormData {
  projectId?: string
  name: string
  type: string
  manager: string
  customer: string
  contact: string
  contactPhone: string
  province: string
  city: string
  district: string
  address: string
}

// 提交载荷：订单表单 + 可选的设备明细（供父组件接收并转交 createOrder）
export interface OrderSubmitPayload extends OrderFormData {
  details?: CreateOrderDetailInput[]
}
</script>

<style scoped>
.form-info {
  border: 1px solid #dcdfe6;
  border-bottom: none;
  margin-bottom: 0;
}

.info-row {
  display: flex;
  border-bottom: 1px solid #dcdfe6;
}

.info-item {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-right: 1px solid #dcdfe6;
}

.info-item:last-child {
  border-right: none;
}

.info-item-full {
  flex: 2;
}

.info-item .label {
  white-space: nowrap;
  font-weight: 500;
}

.info-input {
  flex: 1;
  min-width: 0;
  margin-left: 8px;
}

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

.form-footer {
  border: 1px solid #dcdfe6;
}

.footer-row {
  display: flex;
}

.footer-item {
  flex: 1;
  padding: 12px;
  border-right: 1px solid #dcdfe6;
}

.footer-item:last-child {
  border-right: none;
}

.footer-item div {
  margin-bottom: 8px;
}

.footer-item div:last-child {
  margin-bottom: 0;
}
</style>
