<template>
  <el-dialog :title="title" v-model="visibleValue" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item prop="projectName">
        <template #label>归属项目</template>
        <el-input v-model="form.projectName" placeholder="请输入归属项目" :disabled="true" />
      </el-form-item>
      <el-form-item prop="name">
        <template #label>设备名称</template>
        <el-input v-model="form.name" placeholder="请输入设备名称" />
      </el-form-item>
      <el-form-item prop="model">
        <template #label>设备型号</template>
        <el-input v-model="form.model" placeholder="请输入设备型号" />
      </el-form-item>
      <el-form-item prop="manufacturer">
        <template #label>生产厂家</template>
        <el-input v-model="form.manufacturer" placeholder="请输入生产厂家" />
      </el-form-item>
      <el-form-item prop="number">
        <template #label>数量</template>
        <el-input v-model="form.number" placeholder="请输入数量" />
      </el-form-item>
      <el-form-item prop="price">
        <template #label>单价</template>
        <el-input v-model="form.price" placeholder="请输入单价" />
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

export interface DetailFormData {
  id?: number
  projectName?: string
  name: string
  model: string
  manufacturer: string
  number: string
  price: string
}

const props = defineProps<{
  visible: boolean
  editData?: DetailFormData | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: DetailFormData): void
}>()

const formRef = ref<FormInstance>()

const rules: FormRules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  model: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  manufacturer: [{ required: true, message: '请输入生产厂家', trigger: 'blur' }],
  number: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
}

const isEdit = computed(() => !!props.editData)
const title = computed(() => (isEdit.value ? '编辑设备' : '创建设备'))

const form = ref<DetailFormData>({
  projectName: '',
  name: '',
  model: '',
  manufacturer: '',
  number: '',
  price: '',
})

const visibleValue = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const resetForm = () => {
  form.value = { projectName: '', name: '', model: '', manufacturer: '', number: '', price: '' }
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
