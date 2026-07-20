<template>
  <el-dialog :title="title" v-model="visibleValue" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item prop="name" label="项目名称">
  <el-input
          v-model="form.name"
          placeholder="请输入项目名称"
          @keyup.enter.prevent="handleEnter($event)"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        />
      </el-form-item>
      <el-form-item prop="type" label="项目类型">
  <el-select
          v-model="form.type"
          placeholder="请选择项目类型"
          @keyup.enter.prevent="handleEnter($event)"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        >
          <el-option label="维修项目" value="维修" />
          <el-option label="销售项目" value="销售" />
          <el-option label="采购项目" value="采购" />
        </el-select>
      </el-form-item>
      <el-form-item prop="leaderAccount" label="负责人">
  <el-select
          v-model="leaderName"
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
      </el-form-item>
      <el-form-item prop="customer" label="客户">
  <el-autocomplete
          v-model="customerName"
          :fetch-suggestions="queryCustomerSearch"
          placeholder="请输入客户名称"
          :trigger-on-focus="false"
          @select="handleCustomerSelect"
          @blur="handleCustomerBlur"
          @keyup.enter.prevent="handleEnter($event)"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        />
      </el-form-item>
      <el-form-item prop="contact" label="客户联系人">
  <el-autocomplete
          v-model="contactName"
          :fetch-suggestions="queryContactSearch"
          placeholder="请输入联系人"
          :trigger-on-focus="false"
          @select="handleContactSelect"
          @blur="handleContactBlur"
          @keyup.enter.prevent="handleSubmit"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
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
import { ElMessageBox } from 'element-plus'
import type { User } from '@/composables/useUser'
import type { Customer } from '@/composables/useCustomer'

// 项目表单属性接口
const props = defineProps<{
  visible: boolean
  editData?: ProjectFormData | null
  userList: User[]
  customerList: Customer[]
}>()

// 项目表单提交事件
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: ProjectFormData): void
}>()

const formRef = ref<FormInstance>()
const isModalVisible = ref(false)

const rules = {}

const isEdit = computed(() => !!props.editData)
const title = computed(() => (isEdit.value ? '编辑项目' : '新建项目'))

// 项目表单数据
const form = ref<ProjectFormData>({
  name: '',
  type: '',
  leaderAccount: '',
  customer: '',
  contact: '',
})

const leaderName = ref('')
const customerName = ref('')
const contactName = ref('')

// 使用 computed 创建双向绑定
const visibleValue = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

// 重置表单数据
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
    errors.push('项目名称')
  }
  if (!form.value.type.trim()) {
    errors.push('项目类型')
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

  emit('submit', { ...form.value })
  emit('update:visible', false)
}
</script>
<script lang="ts">
export interface ProjectFormData {
  id?: number
  name: string
  type: string
  leaderAccount: string
  customer: string
  contact: string
  time?: string
}
</script>
