<template>
  <el-dialog :title="title" v-model="visibleValue" width="500px">
    <el-form ref="formRef" :model="form" label-width="100px">
      <el-form-item prop="account" label="账号">
  <el-input
          v-model="form.account"
          placeholder="请输入账号"
          @keyup.enter.prevent="handleEnter($event)"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        />
      </el-form-item>
      <el-form-item prop="password" label="密码">
  <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          @keyup.enter.prevent="handleEnter($event)"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        />
      </el-form-item>
      <el-form-item prop="name" label="姓名">
  <el-input
          v-model="form.name"
          placeholder="请输入姓名"
          @keyup.enter.prevent="handleEnter($event)"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        />
      </el-form-item>
      <el-form-item prop="company" label="公司">
        <template v-if="companyNames.length === 1">
          <el-input :model-value="companyNames[0]" disabled />
        </template>
        <template v-else>
          <el-select
            v-model="form.company"
            placeholder="请选择公司"
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
        </template>
      </el-form-item>
      <el-form-item prop="department" label="部门">
        <el-select
          v-model="form.department"
          placeholder="请选择部门"
          clearable
          @keyup.enter.prevent="handleEnter($event)"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        >
          <el-option
            v-for="name in departmentNames"
            :key="name"
            :label="name"
            :value="name"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="role" label="角色">
  <el-select
          v-model="form.role"
          placeholder="请选择角色"
          @keyup.enter.prevent="handleSubmit"
          @keydown.up.prevent="handleKeydown($event)"
          @keydown.down.prevent="handleKeydown($event)"
        >
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
import { ref, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessageBox } from 'element-plus'

export interface UserFormData {
  account: string
  password: string
  name: string
  company: string
  department: string
  role: string
}

export interface Role {
  id?: number
  name: string
  role: string
}

const props = defineProps<{
  visible: boolean
  editData?: UserFormData | null
  roleList: Role[]
  companyNames: string[]
  departmentNames: string[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: UserFormData): void
}>()

const formRef = ref<FormInstance>()
const isModalVisible = ref(false)

const isEdit = computed(() => !!props.editData)
const title = computed(() => (isEdit.value ? '编辑用户' : '创建用户'))

const form = ref<UserFormData>({
  account: '',
  password: '',
  name: '',
  company: '',
  department: '',
  role: '',
})

// 关键：使用 computed 创建双向绑定
const visibleValue = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const resetForm = () => {
  form.value = { account: '', password: '', name: '', company: '', department: '', role: '' }
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

// 公司列表只有一条时自动选中并锁定
watch(
  () => props.companyNames,
  (names) => {
    if (names.length === 1) {
      form.value.company = names[0]
    }
  },
  { immediate: true },
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

  if (!form.value.account.trim()) {
    errors.push('账号')
  }
  if (!form.value.password.trim()) {
    errors.push('密码')
  }
  if (!form.value.name.trim()) {
    errors.push('姓名')
  }
  if (!form.value.company.trim()) {
    errors.push('公司')
  }
  if (!form.value.role.trim()) {
    errors.push('角色')
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
<script lang="ts">
export default {}
</script>
