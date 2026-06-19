<template>
  <el-dialog :title="title" v-model="visibleValue" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" @submit.prevent>
      <el-form-item prop="name">
        <template #label>客户名称</template>
        <el-input
          v-model="form.name"
          placeholder="请输入客户名称"
          @keyup.enter.prevent="handleEnter($event)"
        />
      </el-form-item>
      <el-form-item prop="company">
        <template #label>公司名称</template>
        <el-select
          v-model="form.company"
          placeholder="请选择公司"
          style="width: 100%"
          @keyup.enter.prevent="handleEnter($event)"
        >
          <el-option
            v-for="company in companyList"
            :key="company.id"
            :label="company.name"
            :value="company.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="contact">
        <template #label>联系人</template>
        <el-input
          v-model="form.contact"
          placeholder="请输入联系人"
          @keyup.enter.prevent="handleEnter($event)"
        />
      </el-form-item>
      <el-form-item prop="phone">
        <template #label>联系电话</template>
        <el-input
          v-model="form.phone"
          placeholder="请输入联系电话"
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

export interface CustomerFormData {
  id?: number
  name: string
  company: string
  contact: string
  phone: string
}

export interface Company {
  id?: number
  name: string
}

const props = defineProps<{
  visible: boolean
  editData?: CustomerFormData | null
  companyList: Company[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: CustomerFormData): void
}>()

const formRef = ref<FormInstance>()

const rules = {}

const isEdit = computed(() => !!props.editData)
const title = computed(() => (isEdit.value ? '编辑客户' : '新建客户'))

const form = ref<CustomerFormData>({
  name: '',
  company: '',
  contact: '',
  phone: '',
})

const visibleValue = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const resetForm = () => {
  form.value = { name: '', company: '', contact: '', phone: '' }
  formRef.value?.clearValidate()
}

watch(
  () => props.editData,
  (newData) => {
    if (newData) {
      form.value = { ...newData }
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

const handleEnter = (event: KeyboardEvent) => {
  const currentInput = event.target as HTMLInputElement
  const formElement = currentInput.closest('.el-form')
  if (!formElement) return

  const formItems = formElement.querySelectorAll('.el-input__inner, .el-select__input')
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
