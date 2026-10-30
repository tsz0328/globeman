<template>
  <el-dialog :title="title" v-model="visibleValue" width="640px" @closed="handleClosed" border>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <div class="form-grid">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入资产名称" aria-label="名称" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="form.model" placeholder="请输入型号" aria-label="型号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入类型" aria-label="类型" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入价格（正数）" aria-label="价格" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="SN码" prop="sn">
          <el-input v-model="form.sn" placeholder="请输入SN码" aria-label="SN码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="使用人" prop="account">
          <el-select v-model="form.account" placeholder="请选择使用人" aria-label="使用人" filterable clearable
            style="width: 100%">
            <el-option v-for="m in managerOptions" :key="m.account" :label="m.name" :value="m.account" />
          </el-select>
        </el-form-item>
        <el-form-item label="放置位置" prop="location" class="full-width">
          <el-input v-model="form.location" placeholder="请输入放置位置" aria-label="放置位置" />
        </el-form-item>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { addAssetsApi, updateAssetsApi, type AddAssetInput, type AssetItem } from '@/api/asset/AssetApi'
import { getOrderManagersApi, type OrderManager } from '@/api/order/OrderApi'

const props = defineProps<{ visible: boolean; editData?: AssetItem | null }>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: []
}>()

const visibleValue = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

// 新增 / 修改 标题切换
const title = computed(() => (props.editData ? '修改固定资产' : '新增固定资产'))

// 编辑模式：仅"使用人""放置位置"可改，其余字段只读
const isEdit = computed(() => !!props.editData)

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 使用人下拉（GET /client/order/getInfoManager）：显示姓名，提交账号
const managerOptions = ref<OrderManager[]>([])
const fetchManagerOptions = async () => {
  if (managerOptions.value.length) return // 已加载则不重复请求
  try {
    const res = await getOrderManagersApi()
    if (res.code === 200 && Array.isArray(res.data)) {
      managerOptions.value = res.data
    }
  } catch (error) {
    console.error('加载使用人下拉失败:', error)
  }
}

// 仅 name 必填；其余字段按实体允许为空（与新增请求体示例一致）
const form = reactive<AddAssetInput>({
  name: '',
  model: '',
  type: '',
  price: '',
  sn: '',
  account: '',
  location: '',
})

// 价格校验：仅允许大于 0 的数字
const validatePrice = (
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void,
) => {
  if (!value || value.trim() === '') {
    callback()
    return
  }
  const num = Number(value)
  if (Number.isNaN(num) || num <= 0) {
    callback(new Error('价格必须为大于 0 的数字'))
    return
  }
  callback()
}

// 新增模式校验名称/价格必填；编辑模式仅改使用人、放置位置，无需必填校验
const rules = computed<FormRules<AddAssetInput>>(() =>
  isEdit.value
    ? {}
    : {
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      price: [
        { required: true, message: '请输入价格', trigger: 'blur' },
        { validator: validatePrice, trigger: 'blur' },
      ],
    },
)

const resetForm = () => {
  form.name = ''
  form.model = ''
  form.type = ''
  form.price = ''
  form.sn = ''
  form.account = ''
  form.location = ''
  formRef.value?.clearValidate()
}

// 编辑时回填行数据（price 后端可能返回 number，统一转字符串）
const fillForm = (row: AssetItem) => {
  form.name = row.name ?? ''
  form.model = row.model ?? ''
  form.type = row.type ?? ''
  form.price = row.price === '' || row.price === null || row.price === undefined ? '' : String(row.price)
  form.sn = row.sn ?? ''
  form.account = row.account ?? ''
  form.location = row.location ?? ''
  formRef.value?.clearValidate()
}

const handleClosed = () => {
  resetForm()
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const res = props.editData
      ? await updateAssetsApi({
        id: props.editData.id ?? '',
        account: form.account,
        location: form.location,
      })
      : await addAssetsApi({ ...form })
    if (res.code === 200) {
      ElMessage.success(props.editData ? '修改成功' : '新增成功')
      emit('submit')
      emit('update:visible', false)
    } else {
      ElMessage.error(res.msg || (props.editData ? '修改失败' : '新增失败'))
    }
  } catch (error) {
    console.error('保存固定资产失败:', error)
    ElMessage.error(props.editData ? '修改失败，请稍后重试' : '新增失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 打开时：编辑模式回填、新增模式清空
watch(
  () => props.visible,
  (v) => {
    if (v) {
      if (props.editData) fillForm(props.editData)
      else resetForm()
      fetchManagerOptions()
    }
  },
)
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 28px;
  row-gap: 4px;
  padding: 8px 4px;
}

.full-width {
  grid-column: 1 / -1;
}
</style>
