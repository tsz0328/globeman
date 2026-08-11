<script setup lang="ts">
import { computed } from 'vue'
import router from '@/router'
import MenuComponent from '@/components/layout/MenuComponent.vue'
import { ElMessage } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'
import { useAvatar } from '@/composables/common/useAvatar'
import logoPng from '@/assets/logo.png'

const { currentAvatarUrl } = useAvatar()
const avatarUrl = computed(() => currentAvatarUrl.value)

function handleIndex() {
  router.push('/index')
}

function handleProfile() {
  router.push('/work/profile').then(() => {
  }).catch(() => {
    ElMessage.error('跳转失败')
  })
}
</script>

<template>
  <div class="head">
    <div class="head-left">
      <img :src="logoPng" class="logo-link" @click="handleIndex" alt="" />
    </div>
    <div class="head-right">
      <div class="notice">
        <el-icon class="notice-icon"><Bell /></el-icon>
      </div>
      <div class="avatar" @click="handleProfile">
        <img :src="avatarUrl" alt="" />
      </div>
    </div>
  </div>
  <div class="body">
    <div class="sidebar">
      <MenuComponent />
    </div>
    <div class="work">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.head {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  flex-direction: row;
  padding: 10px 0;
}

.body {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.head-left {
  width: 180px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.head-left img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: opacity 0.2s ease, filter 0.2s ease;
}

.logo-link {
  cursor: pointer;
}

.logo-link:hover {
  opacity: 0.75;
  filter: brightness(1.05);
  transform: scale(1.05);
}

.head-right {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.notice {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  cursor: pointer;
  color: #606266;
}

.notice-icon {
  font-size: 24px;
}

.notice:hover {
  color: #409eff;
}

.avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sidebar {
  width: 180px;
  height: calc(100vh - 60px);
}

.work {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>
