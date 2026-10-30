<template>
  <WorkPage :loading="loading">
    <!-- 头像板块 -->
    <div class="avatar-section">
      <el-image class="avatar-image" v-if="person.avatar" :src="getAvatarUrl(person.avatar)" />
      <img v-else class="avatar-image" :src="defaultAvatar" alt="" />
      <div class="avatar-info">
        <span class="avatar-info-name">{{ person.name || '-' }}</span>
        <span class="avatar-info-secondary">{{ person.company || '-' }}</span>
        <span class="avatar-info-secondary">{{ person.department || '-' }}</span>
      </div>
      <div class="edit-profile-actions edit-profile-btn">
        <el-button v-if="!editing" type="primary" :icon="Edit" @click="startEdit">修改资料信息</el-button>
        <template v-else>
          <el-upload ref="avatarUploadRef" action="." :show-file-list="false" accept="image/*" :auto-upload="false"
            :on-change="handleAvatarChange" class="avatar-upload">
            <el-button type="primary" :icon="Upload">上传头像</el-button>
          </el-upload>
          <el-button type="warning" :icon="Lock" @click="showPasswordDialog = true">修改密码</el-button>
        </template>
      </div>
    </div>

      <div class="profile-grid">
        <!-- 账号（只读） -->
        <div class="grid-cell label">
          <el-icon>
            <User />
          </el-icon>
          <span>账号</span>
        </div>
        <div class="grid-cell value">{{ person.account || '-' }}</div>

        <!-- 性别 -->
        <div class="grid-cell label">
          <el-icon>
            <Male />
          </el-icon>
          <span>性别</span>
        </div>
        <div class="grid-cell value">
          <el-select v-if="editing" v-model="editForm.sex" placeholder="请选择性别" class="cell-control">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
          <el-tag v-else-if="person.sex" :type="person.sex === '男' ? 'primary' : 'danger'" round>
            {{ person.sex }}
          </el-tag>
          <span v-else>-</span>
        </div>

        <!-- 邮箱 -->
        <div class="grid-cell label">
          <el-icon>
            <Message />
          </el-icon>
          <span>邮箱</span>
        </div>
        <div class="grid-cell value">
          <el-input v-if="editing" v-model="editForm.email" placeholder="请输入邮箱" class="cell-control" />
          <span v-else>{{ person.email || '-' }}</span>
        </div>

        <!-- 手机号码 -->
        <div class="grid-cell label">
          <el-icon>
            <Phone />
          </el-icon>
          <span>手机号码</span>
        </div>
        <div class="grid-cell value">
          <el-input v-if="editing" v-model="editForm.phone" placeholder="请输入手机号码" class="cell-control" />
          <span v-else>{{ person.phone || '-' }}</span>
        </div>

        <!-- 地区 -->
        <div class="grid-cell label">
          <el-icon>
            <Location />
          </el-icon>
          <span>地区</span>
        </div>
        <div class="grid-cell value">
          <el-input v-if="editing" v-model="editForm.address" placeholder="请输入地区" class="cell-control" />
          <span v-else>{{ person.address || '-' }}</span>
        </div>

        <!-- 角色（只读） -->
        <div class="grid-cell label">
          <el-icon>
            <Avatar />
          </el-icon>
          <span>角色</span>
        </div>
        <div class="grid-cell value">{{ person.role || '-' }}</div>

        <!-- 学历 -->
        <div class="grid-cell label">
          <el-icon>
            <Reading />
          </el-icon>
          <span>学历</span>
        </div>
        <div class="grid-cell value">
          <el-input v-if="editing" v-model="editForm.education" placeholder="请输入学历" class="cell-control" />
          <span v-else>{{ person.education || '-' }}</span>
        </div>

        <!-- 出生日期 -->
        <div class="grid-cell label">
          <el-icon>
            <Calendar />
          </el-icon>
          <span>出生日期</span>
        </div>
        <div class="grid-cell value">
          <el-date-picker v-if="editing" v-model="editForm.birth" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择出生日期" class="cell-control" />
          <span v-else>{{ person.birth || '-' }}</span>
        </div>

        <!-- 身份证 -->
        <div class="grid-cell label">
          <el-icon>
            <Tickets />
          </el-icon>
          <span>身份证</span>
        </div>
        <div class="grid-cell value">
          <el-input v-if="editing" v-model="editForm.card" placeholder="请输入身份证号" class="cell-control" />
          <span v-else>{{ person.card || '-' }}</span>
        </div>

        <!-- 紧急联系人 -->
        <div class="grid-cell label">
          <el-icon>
            <Warning />
          </el-icon>
          <span>紧急联系人</span>
        </div>
        <div class="grid-cell value">
          <el-input v-if="editing" v-model="editForm.emergency" placeholder="请输入紧急联系人" class="cell-control" />
          <span v-else>{{ person.emergency || '-' }}</span>
        </div>

        <!-- 注册日期（只读） -->
        <div class="grid-cell label">
          <el-icon>
            <Clock />
          </el-icon>
          <span>注册日期</span>
        </div>
        <div class="grid-cell value">{{ person.time || '-' }}</div>

        <!-- 状态（只读） -->
        <div class="grid-cell label">
          <el-icon>
            <CircleCheck />
          </el-icon>
          <span>状态</span>
        </div>
        <div class="grid-cell value">
          <el-tag v-if="person.status !== undefined" :type="person.status === 1 ? 'success' : 'danger'" size="large">
            {{ person.status === 1 ? '正常' : '禁用' }}
          </el-tag>
          <span v-else>-</span>
        </div>
      </div>

      <!-- 编辑态操作：保存 / 取消（表格下方） -->
      <div v-if="editing" class="profile-actions">
        <el-button type="primary" :loading="editLoading" @click="savePerson">保存</el-button>
        <el-button @click="cancelEdit">取消</el-button>
      </div>





    <!-- 修改密码弹窗 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="420px" :close-on-click-modal="false">
      <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="80px" :validate-on-rule-change="false">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </WorkPage>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import {
  User, Clock, Male, Message, Phone, Location,
  Avatar, Reading, Calendar, Tickets, Warning, CircleCheck, Upload, Lock, Edit
} from '@element-plus/icons-vue'
import defaultAvatar from '@/assets/default-avatar.svg'
import { getPersonApi, updateAvatarApi, updatePasswordApi, type PersonData, type PersonUpdatePayload } from '@/api/admin/PersonApi'
import { useAvatar } from '@/composables/common/useAvatar'
import WorkPage from '@/components/common/WorkPage.vue'

const loading = ref(false)
const person = ref<PersonData>({})

// 修改密码
const showPasswordDialog = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = ref({ newPassword: '', confirmPassword: '' })

const validateConfirmPassword = (_rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

watch(showPasswordDialog, (val) => {
  if (val) {
    passwordForm.value = { newPassword: '', confirmPassword: '' }
    // 用 setTimeout 放到宏任务末尾，确保晚于 Element Plus 内部的验证触发
    setTimeout(() => {
      passwordFormRef.value?.clearValidate()
    }, 0)
  }
})

const passwordRules: FormRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleChangePassword = async () => {
  const valid = await passwordFormRef.value?.validate().catch(() => false)
  if (!valid) return
  passwordLoading.value = true
  try {
    const res = await updatePasswordApi(passwordForm.value.newPassword)
    if (res.code === 200) {
      ElMessage.success('密码修改成功')
      showPasswordDialog.value = false
      passwordForm.value = { newPassword: '', confirmPassword: '' }
    } else {
      ElMessage.error(res.msg || '密码修改失败')
    }
  } catch {
    ElMessage.error('密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

const getAvatarUrl = (avatar: string): string => {
  if (!avatar) return ''
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  if (avatar.startsWith('/')) {
    return `/api${avatar}`
  }
  return `/api/${avatar}`
}

// === 修改资料信息（行内编辑，非弹窗）===
const editing = ref(false)
const editLoading = ref(false)
const editForm = ref<PersonUpdatePayload>({
  sex: '', email: '', phone: '', address: '', education: '', birth: '', card: '', emergency: '',
})

// 进入编辑：用当前资料预填本地副本（账号/角色/注册日期/状态/姓名不进 editForm，保持只读）
const startEdit = () => {
  const p = person.value
  editForm.value = {
    sex: p.sex ?? '',
    email: p.email ?? '',
    phone: p.phone ?? '',
    address: p.address ?? '',
    education: p.education ?? '',
    birth: p.birth ?? '',
    card: p.card ?? '',
    emergency: p.emergency ?? '',
  }
  editing.value = true
}

// 取消编辑：丢弃本地副本改动，退出编辑态
const cancelEdit = () => {
  editing.value = false
}

// 保存：当前为本地桩，直接合并到本地展示状态（刷新不持久）。
// 后端 updatePerson 接口就绪后，改调 updatePersonApi(editForm.value) 并把返回写入 person 即可。
const savePerson = async () => {
  // 轻量校验：邮箱/手机按格式校验（留空不校验）
  if (editForm.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.value.email)) {
    ElMessage.warning('邮箱格式不正确')
    return
  }
  if (editForm.value.phone && !/^1[3-9]\d{9}$/.test(editForm.value.phone)) {
    ElMessage.warning('手机号格式不正确')
    return
  }
  editLoading.value = true
  try {
    Object.assign(person.value, editForm.value)
    editing.value = false
    ElMessage.success('资料已更新')
  } catch {
    ElMessage.error('更新失败')
  } finally {
    editLoading.value = false
  }
}

const { setAvatar } = useAvatar()

const MAX_AVATAR_SIZE = 1 * 1024 * 1024 // 1MB

const handleAvatarChange = async (file: UploadFile) => {
  if (file.status !== 'ready' || !file.raw) return
  if (file.raw.size > MAX_AVATAR_SIZE) {
    ElMessage.error('头像图片大小不能超过 1MB')
    return
  }
  loading.value = true
  try {
    const res = await updateAvatarApi(file.raw)
    if (res.code === 200) {
      ElMessage.success('头像上传成功')
      await fetchPerson()
      // 同步更新页头小头像（cookie + 全局响应式状态）
      if (person.value.avatar) {
        setAvatar(person.value.avatar)
      }
    } else {
      ElMessage.error(res.msg || '头像上传失败')
    }
  } catch {
    ElMessage.error('头像上传失败')
  } finally {
    loading.value = false
  }
}

const fetchPerson = async () => {
  loading.value = true
  try {
    const res = await getPersonApi()
    if (res.code === 200 && res.data) {
      person.value = res.data
    } else {
      ElMessage.error(res.msg || '获取个人信息失败')
    }
  } catch {
    ElMessage.error('获取个人信息失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPerson()
})
</script>

<style scoped>
/* 头像区：头像 + 基本信息靠左排列，与下方信息网格留出间距 */
.avatar-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.avatar-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  flex: 1;
  margin-left: 16px;
}

.avatar-info-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.avatar-info-secondary {
  font-size: 13px;
  color: #909399;
}

.avatar-image {
  width: 100px;
  height: 100px;
  border-radius: 15%;
  object-fit: cover;
}

/* 修改资料信息操作区：固定在头像区最右侧 */
.edit-profile-btn {
  margin-left: auto;
}

.edit-profile-actions {
  display: flex;
  gap: 12px;
}

.avatar-upload {
  display: inline-flex;
}

/* 表格下方编辑操作区：保存 / 取消 */
.profile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

/* 行内编辑控件占满单元格宽度 */
.cell-control {
  width: 100%;
}

/* 日期选择器：Element Plus 默认给 .el-date-editor 设了 220px 宽度且特定性更高，
   这里用更高特定性强制占满单元格 */
.profile-grid :deep(.el-date-editor.cell-control) {
  width: 100%;
}

.profile-grid :deep(.el-date-editor.cell-control .el-input) {
  flex: 1;
}

.profile-grid {
  display: grid;
  grid-template-columns: 150px 1fr 150px 1fr;
  align-items: center;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.grid-cell {
  padding: 0 10px;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #e4e7ed;
  border-right: 1px solid #e4e7ed;
}

/* 每行第4个去掉右边框 */
.grid-cell:nth-child(4n) {
  border-right: none;
}

/* 最后4个去掉下边框 */
.grid-cell:nth-last-child(-n+4) {
  border-bottom: none;
}

.label {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  justify-content: flex-start;
}

.value {
  color: #303133;
  font-weight: 400;
}

:deep(.el-tag--primary) {
  background-color: #ecf5ff;
  border-color: #d9ecff;
  color: #409eff;
}
</style>
