<template>
  <el-dialog :title="title" v-model="visibleValue" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" @submit.prevent>
      <el-form-item prop="account" label="账号">
        <el-input
          v-model="form.account"
          placeholder="请输入账号"
          @keyup.enter.prevent="handleSubmit"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        />
      </el-form-item>
      <el-form-item prop="password" label="密码">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
          @keyup.enter.prevent="handleSubmit"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        />
      </el-form-item>
      <el-form-item prop="name" label="姓名">
        <el-input
          v-model="form.name"
          placeholder="请输入姓名"
          @keyup.enter.prevent="handleSubmit"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        />
      </el-form-item>
      <el-form-item prop="company" label="公司名称">
        <el-input
          v-model="form.company"
          placeholder="请输入公司名称"
          @keyup.enter.prevent="handleSubmit"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button native-type="button" @click="handleClose">取消</el-button>
      <el-button type="primary" native-type="button" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { CompanyFormData } from '@/api/admin/CompanyApi'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: CompanyFormData): void
}>()

const formRef = ref<FormInstance>()

const rules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  company: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
}

const form = ref<CompanyFormData>({
  account: '',
  password: '',
  name: '',
  company: '',
})

const title = computed(() => '新建公司')

const visibleValue = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const resetForm = () => {
  form.value = { account: '', password: '', name: '', company: '' }
  formRef.value?.clearValidate()
}

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

const handleKeydown = (event: KeyboardEvent) => {
  const currentInput = event.target as HTMLInputElement
  const formElement = currentInput.closest('.el-form')
  if (!formElement) return

  const formItems = formElement.querySelectorAll('.el-input__inner, .el-select__input')
  const currentIndex = Array.from(formItems).indexOf(currentInput)
  let targetIndex: number

  if (event.key === 'ArrowUp') {
    targetIndex = Math.max(currentIndex - 1, 0)
  } else if (event.key === 'ArrowDown') {
    targetIndex = Math.min(currentIndex + 1, formItems.length - 1)
  } else {
    return
  }

  const targetItem = formItems[targetIndex] as HTMLInputElement
  targetItem.focus()
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (!valid) return
    emit('submit', { ...form.value })
    emit('update:visible', false)
  })
}
</script>
