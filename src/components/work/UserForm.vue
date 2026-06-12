<template>
  <el-dialog :title="title" v-model="visibleValue" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item prop="account">
        <template #label>账号</template>
        <el-input v-model="form.account" placeholder="请输入账号" />
      </el-form-item>
      <el-form-item prop="password">
        <template #label>密码</template>
        <el-input v-model="form.password" type="password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item prop="name">
        <template #label>姓名</template>
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item prop="company">
        <template #label>公司</template>
        <el-select v-model="form.company" placeholder="请选择公司">
          <el-option
            v-for="company in companyList"
            :key="company.name"
            :label="company.name"
            :value="company.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="role">
        <template #label>角色</template>
        <el-select v-model="form.role" placeholder="请选择角色">
          <el-option
            v-for="role in roleList"
            :key="role.role"
            :label="role.name"
            :value="role.role"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { FormRules } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useRole } from '@/composables/useRole'
import { useCompany } from '@/composables/useCompany'

export interface UserFormData {
  account: string
  password: string
  name: string
  company: string
  role: string
}

const props = defineProps<{
  visible: boolean
  editData?: UserFormData | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: UserFormData): void
}>()

const formRef = ref<FormInstance>()
const { roleList, fetchRoles } = useRole()
const { companyList, fetchCompanies } = useCompany()

const rules: FormRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  company: [{ required: true, message: '请选择公司', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const isEdit = computed(() => !!props.editData)
const title = computed(() => (isEdit.value ? '编辑用户' : '创建用户'))

const form = ref<UserFormData>({
  account: '',
  password: '',
  name: '',
  company: '',
  role: '',
})

// 关键：使用 computed 创建双向绑定
const visibleValue = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

onMounted(() => {
  fetchRoles()
  fetchCompanies()
})

const resetForm = () => {
  form.value = { account: '', password: '', name: '', company: '', role: '' }
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
