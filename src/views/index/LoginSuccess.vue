<script setup lang="ts">
import Cookies from 'js-cookie'
import { useAvatar } from '@/composables/common/useAvatar'
import { ElMessage } from 'element-plus'
import router from '@/router'
import IndexCardHeader from '@/components/Index/IndexCardHeader.vue'

function clearUserInfo() {
  const allCookies = Cookies.get()
  for (const key in allCookies) {
    Cookies.remove(key, { path: '/' })
  }
}

function handleLogout() {
  clearUserInfo()
  // 重置页头头像单例，避免退出后残留上一个账号头像
  useAvatar().setAvatar('')
  ElMessage.success('退出成功')
  router.push('login')
}

function handleWork() {
  router.push({ name: 'Home' })
}
</script>

<template>
  <IndexCardHeader title="用户登录" />
  <div class="login-panel idx-base">
    <el-form @submit.prevent="">
      <el-form-item />
      <el-form-item />
      <el-form-item>
        <button type="button" class="idx-btn" @click="handleWork">工作台</button>
      </el-form-item>
      <div class="logout-link"><span @click="handleLogout">退出登录</span></div>
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

/* 空占位表单项需撑出与真实输入框相同的高度，避免按钮上移 */
.login-panel :deep(.el-form-item__content) {
  min-height: 32px;
}

.logout-link {
  font-size: 14px;
  color: #08138d;
  line-height: 2px;
  cursor: pointer;
}
</style>
