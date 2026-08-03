<template>
  <div class="profile-management">
    <div class="page-header">
      <h2 class="title">个人中心</h2>
    </div>
    <el-card v-loading="loading" class="profile-card">
      <!-- 头像板块 -->
      <div class="avatar-section">
        <el-image class="avatar-image" v-if="person.avatar" :src="getAvatarUrl(person.avatar)" />
        <el-avatar v-else :icon="UserFilled" />
        <div class="avatar-info">
          <span class="avatar-info-name">{{ person.name || '-' }}</span>
          <span class="avatar-info-secondary">{{ person.company || '-' }}</span>
          <span class="avatar-info-secondary">{{ person.department || '-' }}</span>
        </div>
        <div class="avatar-actions">
          <el-upload ref="avatarUploadRef" action="." :show-file-list="false" accept="image/*" :auto-upload="false"
            :on-change="handleAvatarChange" class="avatar-upload">
            <el-button type="primary" size="large" :icon="Upload">上传头像</el-button>
          </el-upload>
          <el-button type="warning" size="large" :icon="Lock" @click="showPasswordDialog = true">修改密码</el-button>
        </div>
      </div>

      <div class="profile-grid">
        <!-- 账户名 -->
        <div class="grid-cell label">
          <el-icon>
            <User />
          </el-icon>
          <span>账户名</span>
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
          <el-tag v-if="person.sex" :type="person.sex === '男' ? 'primary' : 'danger'" size="small" round>
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
        <div class="grid-cell value">{{ person.email || '-' }}</div>

        <!-- 手机号码 -->
        <div class="grid-cell label">
          <el-icon>
            <Phone />
          </el-icon>
          <span>手机号码</span>
        </div>
        <div class="grid-cell value">{{ person.phone || '-' }}</div>

        <!-- 地区 -->
        <div class="grid-cell label">
          <el-icon>
            <Location />
          </el-icon>
          <span>地区</span>
        </div>
        <div class="grid-cell value">{{ person.address || '-' }}</div>


        <!-- 角色 -->
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
        <div class="grid-cell value">{{ person.education || '-' }}</div>

        <!-- 出生日期 -->
        <div class="grid-cell label">
          <el-icon>
            <Calendar />
          </el-icon>
          <span>出生日期</span>
        </div>
        <div class="grid-cell value">{{ person.birth || '-' }}</div>

        <!-- 身份证 -->
        <div class="grid-cell label">
          <el-icon>
            <Tickets />
          </el-icon>
          <span>身份证</span>
        </div>
        <div class="grid-cell value">{{ person.card || '-' }}</div>

        <!-- 紧急联系人 -->
        <div class="grid-cell label">
          <el-icon>
            <Warning />
          </el-icon>
          <span>紧急联系人</span>
        </div>
        <div class="grid-cell value">{{ person.emergency || '-' }}</div>

        <!-- 注册日期 -->
        <div class="grid-cell label">
          <el-icon>
            <Clock />
          </el-icon>
          <span>注册日期</span>
        </div>
        <div class="grid-cell value">{{ person.time || '-' }}</div>

        <!-- 状态 -->
        <div class="grid-cell label">
          <el-icon>
            <CircleCheck />
          </el-icon>
          <span>状态</span>
        </div>
        <div class="grid-cell value">
          <el-tag v-if="person.status !== undefined" :type="person.status === 1 ? 'success' : 'danger'" size="small">
            {{ person.status === 1 ? '正常' : '禁用' }}
          </el-tag>
          <span v-else>-</span>
        </div>
      </div>
    </el-card>

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import {
  User, UserFilled, Clock, Male, Message, Phone, Location,
  Avatar, Reading, Calendar, Tickets, Warning, CircleCheck, Upload, Lock
} from '@element-plus/icons-vue'
import type { PersonData } from '@/api/UserApi'
import { getPersonApi, updateAvatarApi, updatePasswordApi } from '@/api/UserApi'
import { useAvatar } from '@/composables/useAvatar'

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
.profile-management {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 12px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.profile-card {
  border-radius: 4px;
}

.avatar-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 0 20px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 0;
}

.avatar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
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

.profile-grid {
  display: grid;
  grid-template-columns: 120px 1fr 120px 1fr;
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
