<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useLogin } from '@/composables/auth/useLogin'
import router from '@/router'
import { User, Lock } from '@element-plus/icons-vue'
import IndexCardHeader from '@/components/Index/IndexCardHeader.vue'

const { login } = useLogin()

interface LoginForm {
  account: string
  password: string
}

const loginForm = reactive<LoginForm>({
  account: '',
  password: '',
})

const buttonStatus = ref(false)
const buttonText = ref('登录')

async function loginRequest() {
  try {
    buttonStatus.value = true
    buttonText.value = '登录中'
    const { success, message } = await login(loginForm)
    if (success) {
      ElMessage.success(message)
      router.push({ name: 'LoginSuccess' })
    } else {
      ElMessage.error(message)
    }
  } catch {
    ElMessage.error('网络异常')
  } finally {
    buttonStatus.value = false
    buttonText.value = '登录'
  }
}
</script>

<template>
  <IndexCardHeader title="用户登录" />
  <div class="login-panel idx-base">
    <el-form @submit.prevent="">
      <el-form-item>
        <el-input
          v-model="loginForm.account"
          placeholder="请输入"
          name="userName"
          autocomplete="off"
          aria-label="用户名"
        >
          <template #prepend>
            <el-icon><User /></el-icon>
            <span class="prepend-label">用户名</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入"
          name="password"
          autocomplete="off"
          aria-label="密码"
          show-password
        >
          <template #prepend>
            <el-icon><Lock /></el-icon>
            <span class="prepend-label">密码</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <button type="button" class="idx-btn" @click="loginRequest" :disabled="buttonStatus">
          {{ buttonText }}
        </button>
      </el-form-item>
      <div class="forget-pass"><span>忘记密码</span></div>
    </el-form>
  </div>
</template>

<style scoped>
.login-panel {
  background-color: #fff;
  min-height: 240px;
  padding: 20px 15px;
  border-radius: 0 0 0 6px;
}

.login-panel :deep(.el-form-item) {
  margin-bottom: 36px;
}

.login-panel :deep(.el-input-group__prepend) {
  width: 90px;
  background: #f7f7f7;
  border-right: 0;
  color: #909399;
}

.prepend-label {
  margin-left: 7px;
}

.forget-pass {
  font-size: 14px;
  color: #08138d;
  line-height: 2px;
}
</style>
