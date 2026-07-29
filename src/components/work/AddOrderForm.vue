<template>
  <el-dialog :title="title" v-model="visibleValue" width="900px">
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
              placeholder="请输入联系人电话（选填）"
              @keyup.enter.prevent="handleEnter($event)"
              @keydown.up.prevent="handleKeydown($event)"
              @keydown.down.prevent="handleKeydown($event)"
            />
          </div>
        </div>

        <div class="info-row">
          <div class="info-item">
            <span class="label">执行省份：</span>
            <el-input
              v-model="form.province"
              class="info-input"
              placeholder="请输入执行省份"
              @keyup.enter.prevent="handleEnter($event)"
              @keydown.up.prevent="handleKeydown($event)"
              @keydown.down.prevent="handleKeydown($event)"
            />
          </div>
          <div class="info-item">
            <span class="label">执行市：</span>
            <el-input
              v-model="form.city"
              class="info-input"
              placeholder="请输入执行市"
              @keyup.enter.prevent="handleEnter($event)"
              @keydown.up.prevent="handleKeydown($event)"
              @keydown.down.prevent="handleKeydown($event)"
            />
          </div>
        </div>

        <div class="info-row">
          <div class="info-item">
            <span class="label">执行区：</span>
            <el-input
              v-model="form.district"
              class="info-input"
              placeholder="请输入执行区"
              @keyup.enter.prevent="handleEnter($event)"
              @keydown.up.prevent="handleKeydown($event)"
              @keydown.down.prevent="handleKeydown($event)"
            />
          </div>
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
          <el-input v-model="scope.row.equipmentName" aria-label="品名" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="型号" min-width="120">
        <template #default="scope">
          <el-input v-model="scope.row.equipmentModel" aria-label="型号" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="序列号" min-width="120">
        <template #default="scope">
          <el-input v-model="scope.row.serialNo" aria-label="序列号" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="单位" width="80" align="center">
        <template #default="scope">
          <el-input v-model="scope.row.unit" aria-label="单位" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="数量" width="80" align="center">
        <template #default="scope">
          <el-input v-model="scope.row.quantity" aria-label="数量" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="单价" width="100" align="right">
        <template #default="scope">
          <el-input v-model="scope.row.unitPrice" aria-label="单价" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="金额" width="100" align="right">
        <template #default="scope">
          {{ (Number(scope.row.quantity) || 0) * (Number(scope.row.unitPrice) || 0) }}
        </template>
      </el-table-column>
      <el-table-column label="备注" min-width="120">
        <template #default="scope">
          <el-input v-model="scope.row.remark" aria-label="备注" size="small" />
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
import { ref, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import type { User } from '@/composables/useUser'
import type { Customer } from '@/composables/useCustomer'
interface DetailTableRow {
  equipmentName: string
  equipmentModel: string
  serialNo: string
  unit: string
  quantity: number | string
  unitPrice: number | string
  remark: string
}
const createBlankRow = (): DetailTableRow => ({
  equipmentName: '',
  equipmentModel: '',
  serialNo: '',
  unit: '',
  quantity: '',
  unitPrice: '',
  remark: '',
})

// 设备明细只存在本地，暂不调用保存接口
const detailRows = ref<DetailTableRow[]>([createBlankRow()])
const addDetailRow = () => {
  detailRows.value.push(createBlankRow())
}

const props = defineProps<{
  visible: boolean
  projectId?: string
  userList: User[]
  customerList: Customer[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: OrderSubmitPayload): void
}>()

const formRef = ref<FormInstance>()
const isModalVisible = ref(false)

const rules = {}

const title = computed(() => '创建订单')

const form = ref<OrderFormData>({
  projectId: props.projectId,
  name: '',
  type: '',
  leaderAccount: '',
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
    leaderAccount: '',
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
  detailRows.value = [createBlankRow()]
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
  form.value.leaderAccount = user?.account || ''
}

const queryCustomerSearch = (
  queryString: string,
  cb: (suggestions: { value: string; label: string; contact: string; phone?: string }[]) => void,
) => {
  const customers = props.customerList
  const results = queryString
    ? customers
        .filter((customer: Customer) =>
          customer.name.toLowerCase().includes(queryString.toLowerCase()),
        )
        .map((customer: Customer) => ({
          value: customer.name,
          label: customer.name,
          contact: customer.contact,
          phone: customer.phone,
        }))
    : customers.map((customer: Customer) => ({
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
        .filter((customer: Customer) =>
          customer.contact.toLowerCase().includes(queryString.toLowerCase()),
        )
        .map((customer: Customer) => ({
          value: customer.contact,
          label: `${customer.contact} (${customer.name})`,
          customer: customer.name,
          phone: customer.phone,
        }))
    : customers.map((customer: Customer) => ({
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

const handleSubmit = () => {
  if (isModalVisible.value) return

  const errors: string[] = []

  if (!form.value.name.trim()) {
    errors.push('订单名称')
  }
  if (!form.value.type.trim()) {
    errors.push('订单类型')
  }
  if (!form.value.leaderAccount.trim()) {
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

  // 组装设备明细：过滤完全空白的行；要求有品名且数量/单价为正，否则跳过（与后端 /details/create 字段对齐）
  const details: CreateOrderDetailInput[] = []
  for (const r of detailRows.value) {
    const name = r.equipmentName.trim()
    const model = r.equipmentModel.trim()
    const qty = Number(r.quantity)
    const price = Number(r.unitPrice)
    if (!name && !model) continue
    if (!name || !(qty > 0) || !(price > 0)) {
      console.warn('设备明细不完整，已跳过该行：', r)
      continue
    }
    details.push({ name, model, manufacturer: '', number: r.quantity, price: r.unitPrice })
  }

  emit('submit', { ...form.value, details })
  emit('update:visible', false)
}
</script>
<script lang="ts">
import type { CreateOrderDetailInput } from '@/composables/useOrder'

export interface OrderFormData {
  projectId?: string
  name: string
  type: string
  leaderAccount: string
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
