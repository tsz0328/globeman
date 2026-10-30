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
            <el-select
              filterable
              v-model="form.type"
              class="info-input"
              placeholder="请选择订单类型"
              @keyup.enter.prevent="handleEnter($event)"
              @keydown.up.prevent="handleKeydown($event)"
              @keydown.down.prevent="handleKeydown($event)"
            >
              <el-option
                v-for="t in ORDER_TYPES"
                :key="t.value"
                :label="t.label"
                :value="t.value"
              />
            </el-select>
          </div>
        </div>

        <div class="info-row">
          <div class="info-item">
            <span class="label">负责人（必填）：</span>
            <el-select
              filterable
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

    <!-- 设备表格（子组件：本地录入 + 键盘导航）；列形态随明细数据自动切换（维修改造型/型号型/普通） -->
    <AddOrderDeviceTable ref="detailEditorRef" v-model:rows="detailRows" :order-type="form.type" />

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
import { ORDER_TYPES } from '@/constants/orderEnums'
import AddOrderDeviceTable, { type DetailTableRow, createBlankRow } from './AddOrderDeviceTable.vue'

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
const detailEditorRef = ref<InstanceType<typeof AddOrderDeviceTable>>()

// 弹窗打开过渡完全结束、布局稳定后再预填：避免首开时过渡未结束导致测量高度偏差
const onDialogOpened = () => {
  nextTick(() => {
    detailEditorRef.value?.prefillFirstPage()
    // 挂载“容器尺寸 + window resize”双监听，窗口缩放时每页行数实时重算
    detailEditorRef.value?.startAutoPageSize()
  })
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

// 外部预填：用于「导入设备清单」场景——先把文件里能识别的订单头与设备明细填进来，
// 识别不到的（客户 / 联系人 / 地址 / 类型等）由用户手补。
// 约定在弹窗打开前调用：打开时 watch(visible) 不会重置表单，@opened 的 prefillFirstPage
// 也只会在已有行之后补足空白行，不会覆盖预填的设备明细。
const prefill = (data: {
  name?: string
  type?: string
  managerName?: string
  customer?: string
  contact?: string
  contactPhone?: string
  province?: string
  city?: string
  district?: string
  address?: string
  devices?: DetailTableRow[]
}) => {
  if (data.name) form.value.name = data.name
  if (data.type) form.value.type = data.type

  // 负责人下拉以姓名展示，需反查账号后写入 form.manager
  if (data.managerName) {
    leaderName.value = data.managerName
    form.value.manager = props.userList.find((u) => u.name === data.managerName)?.account ?? ''
  }
  if (data.customer) {
    customerName.value = data.customer
    form.value.customer = data.customer
  }
  if (data.contact) {
    contactName.value = data.contact
    form.value.contact = data.contact
  }
  if (data.contactPhone) form.value.contactPhone = data.contactPhone

  if (data.province || data.city || data.district) {
    selectedRegion.value = [data.province, data.city, data.district].filter(Boolean) as string[]
    cascaderMountKey.value++ // 强制级联重新挂载，刷新展开路径缓存
  }
  if (data.address) form.value.address = data.address

  if (data.devices && data.devices.length > 0) detailRows.value = [...data.devices]
}

defineExpose({ prefill })

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

/** 把行号按错误类型分组 */
function addErrorRow(map: Map<string, number[]>, message: string, row: number) {
  const rows = map.get(message) ?? []
  rows.push(row)
  map.set(message, rows)
}

/** 把连续行号压缩成「第 1~17 行」/「第 5 行」/「第 1~3、5、7 行」 */
function compressRanges(rows: number[]): string {
  if (rows.length === 0) return ''
  if (rows.length === 1) return `第 ${rows[0]} 行`
  const first = rows[0]
  if (first === undefined) return ''
  const ranges: string[] = []
  let start = first
  let prev = first
  for (let i = 1; i < rows.length; i++) {
    const curr = rows[i]
    if (curr === undefined) continue
    if (curr === prev + 1) {
      prev = curr
      continue
    }
    ranges.push(start === prev ? `第 ${start} 行` : `第 ${start}~${prev} 行`)
    start = curr
    prev = curr
  }
  ranges.push(start === prev ? `第 ${start} 行` : `第 ${start}~${prev} 行`)
  return ranges.join('、')
}

/** 把错误分组渲染成「第 1~17 行：品名不能为空」这样的行 */
function formatErrorMap(map: Map<string, number[]>): string[] {
  const lines: string[] = []
  map.forEach((rows, message) => {
    lines.push(`${compressRanges(rows)}：${message}`)
  })
  return lines
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

  // 组装设备明细：要求有品名（维修改造单用 原型号/改型号 替代型号，不强制），否则报错提示
  const details: CreateOrderDetailInput[] = []
  const errorMap: Map<string, number[]> = new Map()
  for (let i = 0; i < detailRows.value.length; i++) {
    const r = detailRows.value[i]
    if (!r) continue
    const name = r.equipmentName.trim()
    const model = r.equipmentModel.trim()
    const originalStr = r.originalModel.trim()
    const refitStr = r.refitModel.trim()
    const processStr = r.processItem.trim()
    const brandStr = r.brand.trim()
    const specStr = r.spec.trim()
    const snStr = r.sn.trim()

    // 完全空行跳过（仅填了 SN 但无品名的行不视为空，交给下方品名校验报错，避免 SN 被静默丢弃）
    if (!name && !model && !originalStr && !refitStr && !processStr && !brandStr && !specStr && !snStr) continue

    // 品名为空
    if (!name) {
      addErrorRow(errorMap, '品名不能为空', i + 1)
      continue
    }
    details.push({
      name,
      model,
      originalModel: originalStr,
      refitModel: refitStr,
      processItem: processStr,
      brand: brandStr,
      spec: specStr,
      sn: snStr,
    })
  }

  if (errorMap.size > 0) {
    ;(document.activeElement as HTMLElement | null)?.blur()
    isModalVisible.value = true
    const lines = ['设备明细校验不通过：', ...formatErrorMap(errorMap)]
    ElMessageBox.alert(lines.join('<br>'), '提示', {
      confirmButtonText: '确定',
      dangerouslyUseHTMLString: true,
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
import type { CreateOrderDetailInput, OrderFormData, OrderSubmitPayload } from '@/api/order/types'
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
