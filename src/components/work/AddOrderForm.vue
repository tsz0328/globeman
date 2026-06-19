<template>
  <el-dialog :title="title" v-model="visibleValue" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item prop="name">
        <template #label>订单名称</template>
        <el-input
          v-model="form.name"
          placeholder="请输入订单名称"
          @keyup.enter.prevent="handleEnter($event)"
        />
      </el-form-item>
      <el-form-item prop="type">
        <template #label>订单类型</template>
        <el-select v-model="form.type" placeholder="请选择订单类型">
          <el-option label="销售订单" value="销售订单" />
          <el-option label="采购订单" value="采购订单" />
          <el-option label="维修订单" value="维修订单" />
        </el-select>
      </el-form-item>
      <el-form-item prop="leaderAccount">
        <template #label>负责人</template>
        <el-select v-model="leaderName" placeholder="请选择负责人" @change="handleLeaderChange">
          <el-option
            v-for="user in props.userList"
            :key="user.account"
            :label="user.name"
            :value="user.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="customer">
        <template #label>客户</template>
        <el-autocomplete
          v-model="customerName"
          :fetch-suggestions="queryCustomerSearch"
          placeholder="请输入客户名称"
          :trigger-on-focus="false"
          @select="handleCustomerSelect"
          @blur="handleCustomerBlur"
          @keyup.enter.prevent="handleEnter($event)"
        />
      </el-form-item>
      <el-form-item prop="contact">
        <template #label>客户联系人</template>
        <el-autocomplete
          v-model="contactName"
          :fetch-suggestions="queryContactSearch"
          placeholder="请输入联系人"
          :trigger-on-focus="false"
          @select="handleContactSelect"
          @blur="handleContactBlur"
          @keyup.enter.prevent="handleEnter($event)"
        />
      </el-form-item>
      <el-form-item prop="contactPhone">
        <template #label>联系人电话</template>
        <el-input
          v-model="form.contactPhone"
          placeholder="请输入联系人电话（选填）"
          @keyup.enter.prevent="handleEnter($event)"
        />
      </el-form-item>
      <el-form-item prop="province">
        <template #label>执行省份</template>
        <el-input
          v-model="form.province"
          placeholder="请输入执行省份"
          @keyup.enter.prevent="handleEnter($event)"
        />
      </el-form-item>
      <el-form-item prop="city">
        <template #label>执行市</template>
        <el-input
          v-model="form.city"
          placeholder="请输入执行市"
          @keyup.enter.prevent="handleEnter($event)"
        />
      </el-form-item>
      <el-form-item prop="district">
        <template #label>执行区</template>
        <el-input
          v-model="form.district"
          placeholder="请输入执行区"
          @keyup.enter.prevent="handleEnter($event)"
        />
      </el-form-item>
      <el-form-item prop="repairAddress">
        <template #label>送修地址</template>
        <el-input
          v-model="form.repairAddress"
          placeholder="请输入送修地址"
          @keyup.enter.prevent="handleSubmit"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { User } from '@/composables/useUser'
import type { Customer } from '@/composables/useCustomer'

const props = defineProps<{
  visible: boolean
  projectId?: number
  userList: User[]
  customerList: Customer[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: OrderFormData): void
}>()

const formRef = ref<FormInstance>()

const rules = {}

const title = computed(() => '创建订单')

const form = ref<OrderFormData>({
  projectId: props.projectId?.toString() || '',
  name: '',
  type: '',
  leaderAccount: '',
  customer: '',
  contact: '',
  contactPhone: '',
  province: '',
  city: '',
  district: '',
  repairAddress: '',
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
    projectId: props.projectId?.toString() || '',
    name: '',
    type: '',
    leaderAccount: '',
    customer: '',
    contact: '',
    contactPhone: '',
    province: '',
    city: '',
    district: '',
    repairAddress: '',
  }
  leaderName.value = ''
  customerName.value = ''
  contactName.value = ''
  formRef.value?.clearValidate()
}

watch(
  () => props.projectId,
  (newId) => {
    form.value.projectId = newId?.toString() || ''
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
  const formItems = currentInput.closest('.el-form')?.querySelectorAll('.el-input__inner')
  if (!formItems) return

  const currentIndex = Array.from(formItems).indexOf(currentInput)
  if (currentIndex < formItems.length - 1) {
    ;(formItems[currentIndex + 1] as HTMLInputElement).focus()
  } else {
    handleSubmit()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  emit('submit', { ...form.value })
  emit('update:visible', false)
}
</script>
<script lang="ts">
export interface OrderFormData {
  projectId: string
  name: string
  type: string
  leaderAccount: string
  customer: string
  contact: string
  contactPhone: string
  province: string
  city: string
  district: string
  repairAddress: string
}

export default {}
</script>
