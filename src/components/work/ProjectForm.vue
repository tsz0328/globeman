<template>
  <el-dialog :title="title" v-model="visibleValue" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item prop="name">
        <template #label>项目名称</template>
        <el-input v-model="form.name" placeholder="请输入项目名称" />
      </el-form-item>
      <el-form-item prop="type">
        <template #label>项目类型</template>
        <el-select v-model="form.type" placeholder="请选择项目类型">
          <el-option label="维修项目" value="维修" />
          <el-option label="销售项目" value="销售" />
          <el-option label="采购项目" value="采购" />
        </el-select>
      </el-form-item>
      <el-form-item prop="status">
        <template #label>项目状态</template>
        <el-select v-model="form.status" placeholder="请选择项目状态">
          <el-option label="进行中" value="进行中" />
          <el-option label="已完成" value="已完成" />
          <el-option label="已取消" value="已取消" />
        </el-select>
      </el-form-item>
      <el-form-item prop="creator">
        <template #label>项目负责人</template>
        <el-input v-model="form.creator" placeholder="请输入项目负责人" />
      </el-form-item>
      <el-form-item prop="customer">
        <template #label>客户</template>
        <el-input v-model="form.customer" placeholder="请输入客户" />
      </el-form-item>
      <el-form-item prop="contact">
        <template #label>联系人</template>
        <el-input v-model="form.contact" placeholder="请输入联系人" />
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

// 项目表单数据接口
export interface ProjectFormData {
  id?: number
  name: string
  type: string
  status?: string
  creator: string
  customer: string
  contact: string
  time?: string
}

// 项目表单属性接口
const props = defineProps<{
  visible: boolean
  editData?: ProjectFormData | null
}>()

// 项目表单提交事件
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: ProjectFormData): void
}>()

const formRef = ref<FormInstance>()

// 项目表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择项目状态', trigger: 'change' }],
  creator: [{ required: true, message: '请输入项目负责人', trigger: 'blur' }],
  customer: [{ required: true, message: '请输入客户', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
}

const isEdit = computed(() => !!props.editData)
const title = computed(() => (isEdit.value ? '编辑项目' : '新建项目'))

// 项目表单数据
const form = ref<ProjectFormData>({
  name: '',
  type: '',
  status: '',
  creator: '',
  customer: '',
  contact: '',
})

// 关键：使用 computed 创建双向绑定
const visibleValue = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

// 重置表单数据
const resetForm = () => {
  form.value = { name: '', type: '', status: '进行中', creator: '', customer: '', contact: '' }
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
<script lang="ts">
export default {}
</script>
