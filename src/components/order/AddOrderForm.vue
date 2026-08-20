<template>
  <el-dialog
    class="order-form-dialog"
    :title="title"
    v-model="visibleValue"
    width="80vw"
    align-center
    @opened="onDialogOpened"
  >
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
            <el-select filterable
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
            <el-select filterable
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
              :trigger-on-focus="true"
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
              :trigger-on-focus="true"
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
          <div class="info-item">
            <span class="label">执行省市区：</span>
            <el-cascader
              :key="cascaderMountKey"
              v-model="selectedRegion"
              :options="regionData"
              :props="{ value: 'label', emitPath: true }"
              class="info-input"
              placeholder="请选择省/市/区"
              clearable
              @keyup.enter.prevent="handleEnter($event)"
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

    <!-- 设备表格（子组件：本地录入 + 键盘导航） -->
    <OrderAddDeviceEditor ref="detailEditorRef" v-model:rows="detailRows" />

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
import OrderAddDeviceEditor, { type DetailTableRow, createBlankRow } from './OrderAddDeviceEditor.vue'

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

// 设备明细只存在本地，暂不调用保存接口（编辑器在子组件内管理）
const detailRows = ref<DetailTableRow[]>([createBlankRow()])

// 子组件引用：弹窗打开动画结束（@opened，布局就绪）后触发「按表单高度预填空白行」
const detailEditorRef = ref<InstanceType<typeof OrderAddDeviceEditor>>()

// 弹窗打开过渡完全结束、布局稳定后再预填：避免首开时过渡未结束导致测量高度偏差
const onDialogOpened = () => {
  nextTick(() => detailEditorRef.value?.prefillFirstPage())
}

// 级联选择器每次打开重新挂载的 key：清除其内部“展开路径”缓存（与 v-model 解耦）
const cascaderMountKey = ref(0)

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
    } else {
      // 弹窗打开：强制级联选择器重新挂载，清除上次的“展开路径”缓存
      cascaderMountKey.value++
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

    // 完全空行跳过
    if (!name && !model && !typeStr && !brandStr && !specStr && !qtyStr) continue

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
    details.push({ name, model, type: typeStr, brand: brandStr, spec: specStr, number: qtyStr })
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
import type {
  CreateOrderDetailInput,
  OrderFormData,
  OrderSubmitPayload,
} from '@/api/order/types'

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
  flex: 1 1 auto;
  min-width: 0;
  margin-left: 8px;
}

/* el-cascader 默认不带 width:100%，显式铺满单元格 */
.info-item :deep(.el-cascader) {
  width: 100%;
}
</style>

<style>
/* 弹窗高度控制：class 落到 .el-dialog 上，用非 scoped 样式避开 teleport 导致的 scoped 失效 */
.order-form-dialog {
  height: 80vh;
  display: flex;
  flex-direction: column;
}
/* 设备明细编辑区 */
.order-form-dialog .el-dialog__body {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 表单元信息区固定高度，不挤压；设备明细表格弹性占满剩余空间 */
.order-form-dialog .el-dialog__body > .el-form {
  flex: none;
}
/* 设备明细编辑区 */
.order-form-dialog .detail-editor {
  flex: 1;
  min-height: 0;
}
</style>
