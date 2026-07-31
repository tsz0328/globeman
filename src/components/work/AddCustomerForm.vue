<template>
  <el-dialog :title="title" v-model="visibleValue" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" @submit.prevent>
      <el-form-item prop="name" label="客户名称">
  <el-input
          v-model="form.name"
          placeholder="请输入客户名称"
          @keyup.enter.prevent="handleEnter($event)"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        />
      </el-form-item>
      <el-form-item prop="company" label="公司名称">
  <el-select
          v-model="form.company"
          placeholder="请选择公司"
          style="width: 100%"
          @keyup.enter.prevent="handleEnter($event)"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        >
          <el-option
            v-for="name in companyNames"
            :key="name"
            :label="name"
            :value="name"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="contact" label="联系人">
  <el-input
          v-model="form.contact"
          placeholder="请输入联系人"
          @keyup.enter.prevent="handleEnter($event)"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        />
      </el-form-item>
      <el-form-item prop="phone" label="联系电话">
  <el-input
          v-model="form.phone"
          placeholder="请输入联系电话"
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

export interface CustomerFormData {
  id?: number
  name: string
  company: string
  contact: string
  phone: string
}

const props = defineProps<{
  visible: boolean
  editData?: CustomerFormData | null
  companyNames: string[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: CustomerFormData): void
}>()

const formRef = ref<FormInstance>()
const isModalVisible = ref(false)

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

const handleKeydown = (event: KeyboardEvent) => {
  const currentInput = event.target as HTMLInputElement

  if (event.key === 'ArrowUp') {
    focusNextField(currentInput, 'prev')
  } else if (event.key === 'ArrowDown') {
    focusNextField(currentInput, 'next')
  }
}

const handleSubmit = () => {
  if (isModalVisible.value) return

  const errors: string[] = []

  if (!form.value.name.trim()) {
    errors.push('客户名称')
  }
  if (!form.value.company.trim()) {
    errors.push('公司名称')
  }
  if (!form.value.contact.trim()) {
    errors.push('联系人')
  }
  if (!form.value.phone.trim()) {
    errors.push('联系电话')
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
