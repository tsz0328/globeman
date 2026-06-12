<template>
  <el-dialog :title="title" v-model="visibleValue" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item prop="name">
        <template #label>公司名称</template>
        <el-input v-model="form.name" placeholder="请输入公司名称" />
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
import type { CompanyFormData } from '@/api/CompanyApi'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: CompanyFormData): void
}>()

const formRef = ref<FormInstance>()

const rules: FormRules = {
  name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
}

const form = ref<CompanyFormData>({
  name: '',
})

const title = computed(() => '新建公司')

const visibleValue = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const resetForm = () => {
  form.value = { name: '' }
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

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (valid) {
    emit('submit', { ...form.value })
    emit('update:visible', false)
  }
}
</script>
