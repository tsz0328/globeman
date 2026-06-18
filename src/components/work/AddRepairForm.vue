<template>
  <el-dialog :title="title" v-model="visibleValue" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item prop="name">
        <template #label>维修名称</template>
        <el-input v-model="form.name" placeholder="请输入维修名称" />
      </el-form-item>
      <el-form-item prop="type">
        <template #label>维修类型</template>
        <el-select v-model="form.type" placeholder="请选择维修类型">
          <el-option label="设备维修" value="设备维修" />
          <el-option label="电路维修" value="电路维修" />
          <el-option label="管道维修" value="管道维修" />
          <el-option label="其他维修" value="其他" />
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
  editData?: RepairFormData | null
  userList: User[]
  customerList: Customer[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: RepairFormData): void
}>()

const formRef = ref<FormInstance>()

const rules = {}

const isEdit = computed(() => !!props.editData)
const title = computed(() => (isEdit.value ? '编辑维修' : '新建维修'))

const form = ref<RepairFormData>({
  name: '',
  type: '',
  leaderAccount: '',
  customer: '',
  contact: '',
})

const leaderName = ref('')
const customerName = ref('')
const contactName = ref('')

const visibleValue = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const resetForm = () => {
  form.value = { name: '', type: '', leaderAccount: '', customer: '', contact: '' }
  leaderName.value = ''
  customerName.value = ''
  contactName.value = ''
  formRef.value?.clearValidate()
}

watch(
  () => props.editData,
  (newData) => {
    if (newData) {
      form.value = { ...newData }
      const user = props.userList.find((u) => u.account === newData.leaderAccount)
      leaderName.value = user?.name || ''
      const customer = props.customerList.find((c) => c.name === newData.customer)
      customerName.value = customer?.name || ''
      contactName.value = customer?.contact || ''
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal && !props.editData) {
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
  cb: (suggestions: { value: string; label: string; contact: string }[]) => void,
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
        }))
    : customers.map((customer: Customer) => ({
        value: customer.name,
        label: customer.name,
        contact: customer.contact,
      }))
  cb(results)
}

const handleCustomerSelect = (item: { value: string; label: string; contact: string }) => {
  customerName.value = item.value
  form.value.customer = item.value
  contactName.value = item.contact
  form.value.contact = item.contact
}

const queryContactSearch = (
  queryString: string,
  cb: (suggestions: { value: string; label: string; customer: string }[]) => void,
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
        }))
    : customers.map((customer: Customer) => ({
        value: customer.contact,
        label: `${customer.contact} (${customer.name})`,
        customer: customer.name,
      }))
  cb(results)
}

const handleContactSelect = (item: { value: string; label: string; customer: string }) => {
  contactName.value = item.value
  form.value.contact = item.value
  customerName.value = item.customer
  form.value.customer = item.customer
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

const handleSubmit = async () => {
  if (!formRef.value) return
  emit('submit', { ...form.value })
  emit('update:visible', false)
}
</script>
<script lang="ts">
export interface RepairFormData {
  id?: number
  name: string
  type: string
  leaderAccount: string
  customer: string
  contact: string
  time?: string
}

export default {}
</script>