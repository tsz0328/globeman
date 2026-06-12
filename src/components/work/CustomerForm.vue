<template>
  <el-dialog :title="title" v-model="visibleValue" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item prop="name">
        <template #label>客户名称</template>
        <el-input v-model="form.name" placeholder="请输入客户名称" />
      </el-form-item>
      <el-form-item prop="company">
        <template #label>公司名称</template>
        <el-input v-model="form.company" placeholder="请输入公司名称" />
      </el-form-item>
      <el-form-item prop="contact">
        <template #label>联系人</template>
        <el-input v-model="form.contact" placeholder="请输入联系人" />
      </el-form-item>
      <el-form-item prop="phone">
        <template #label>联系电话</template>
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
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
import type { FormRules } from 'element-plus'
import type { FormInstance } from 'element-plus'

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
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: CustomerFormData): void
}>()

const formRef = ref<FormInstance>()

const rules: FormRules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  company: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
}

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

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (valid) {
    emit('submit', { ...form.value })
    emit('update:visible', false)
  }
}
</script>
