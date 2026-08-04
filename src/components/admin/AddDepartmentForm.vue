<template>
  <el-dialog :title="title" v-model="visibleValue" width="450px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" @submit.prevent>
      <el-form-item prop="name" label="部门名称">
        <el-input
          v-model="form.name"
          placeholder="请输入部门名称"
          @keyup.enter.prevent="handleSubmit"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button native-type="button" @click="handleClose">取消</el-button>
      <el-button type="primary" native-type="button" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { createDepartmentApi } from '@/api/admin/CompanyApi'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const rules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
}

const form = ref({ name: '' })

const title = computed(() => '新建部门')

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
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const res = await createDepartmentApi(form.value.name)
    if (res.code === 200) {
      ElMessage.success('新建部门成功')
      emit('update:visible', false)
      emit('success')
    } else {
      ElMessage.error(res.msg || '新建部门失败')
    }
  } catch {
    ElMessage.error('新建部门失败')
  } finally {
    submitting.value = false
  }
}
</script>
