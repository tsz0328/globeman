<template>
  <el-dialog :title="title" v-model="visibleValue" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="账号" prop="account">
        <el-input v-model="form.account" placeholder="请输入账号" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="公司" prop="company">
        <el-select v-model="form.company" placeholder="请选择公司">
          <el-option label="建设集团有限公司" value="建设集团有限公司" />
          <el-option label="科技有限公司" value="科技有限公司" />
          <el-option label="信息技术公司" value="信息技术公司" />
          <el-option label="数据库公司" value="数据库公司" />
        </el-select>
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色">
          <el-option
            v-for="role in roleList"
            :key="role.roleName"
            :label="role.roleName"
            :value="role.roleName"
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
import { getRolesApi, type RoleData } from '@/api/UserApi'
import { ElMessage } from 'element-plus'

export interface UserFormData {
  account: string
  password: string
  name: string
  company: string
  role: string
}

interface RoleOption {
  roleName: string
  description?: string
  id?: number
  permissions?: string[]
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
const roleList = ref<RoleOption[]>([])

const fetchRoles = async () => {
  try {
    const res = await getRolesApi()
    if (res.code === 200 && res.data && typeof res.data === 'object') {
      const roles = Array.isArray(res.data) ? res.data : Object.values(res.data)
      roleList.value = roles.map((item: RoleData): RoleOption => {
        const roleName =
          item.roleName ??
          (item as unknown as { role?: string }).role ??
          (item as unknown as { name?: string }).name ??
          ''
        const description = item.description ?? (item as unknown as { desc?: string }).desc ?? ''
        const permissions =
          item.permissions ?? (item as unknown as { perms?: string[] }).perms ?? []
        return {
          roleName,
          description,
          id: item.id,
          permissions,
        }
      })
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  }
}

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
