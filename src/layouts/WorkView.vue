<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import WorkSideMenu from './WorkSideMenu.vue'
import { ElMessage } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'
import { useAvatar } from '@/composables/common/useAvatar'
import { useAuthStore } from '@/stores/auth'
import logoPng from '@/assets/logo.png'

// 顶栏头像依赖登录时通过 getInfoUser 写入 cookie 的值（useAvatar 单例）
const { currentAvatarUrl } = useAvatar()
const avatarUrl = computed(() => currentAvatarUrl.value)

const route = useRoute()
const authStore = useAuthStore()
// 用户名来自登录时写入 cookie 的 username，直接复用，无需新接口
const username = computed(() => authStore.username || '未登录')

// 面包屑：按当前路由路径查菜单配置（src/data/menuConfig.ts），与侧边菜单、页面标题同源联动
import { getMenuTitle } from '@/data/menuConfig'
const currentTitle = computed(() => getMenuTitle(route.path))

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
  <div class="layout">
    <!-- 左侧列：logo 在顶部、菜单在其下方，同宽 200px，整体占满整屏高度 -->
    <div class="side-col">
      <div class="side-brand">
        <img :src="logoPng" class="side-logo" @click="handleIndex" alt="" />
      </div>
      <div class="side-menu">
        <WorkSideMenu />
      </div>
    </div>
    <!-- 右侧列：head 只覆盖内容区（不再压在 logo 上方），下方为内容 -->
    <div class="main-col">
      <div class="head">
        <div class="head-left">
          <span class="breadcrumb">
            <span class="crumb-root">工作台</span>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">{{ currentTitle }}</span>
          </span>
        </div>
        <div class="head-right">
          <span class="username">{{ username }}</span>
          <div class="notice">
            <el-icon class="notice-icon"><Bell /></el-icon>
          </div>
          <div class="avatar" @click="handleProfile">
            <img :src="avatarUrl" alt="" />
          </div>
        </div>
      </div>
      <div class="work">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* 左侧列：固定 200px 宽、占满整屏高度；logo 在顶部，菜单在其下 */
.side-col {
  width: 200px;
  flex-shrink: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  z-index: 1;
  background: var(--brand-sidebar-gradient);
}

/* 左侧列顶部品牌区：白色底、与菜单同宽、居中 logo；
   logo 本身是深蓝透明底，必须衬白才能看清；高度 80px 与右侧顶栏对齐 */
.side-brand {
  flex-shrink: 0;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.side-logo {
  max-height: 60px;
  width: auto;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.side-logo:hover {
  opacity: 0.8;
  transform: scale(1.1);
}

.side-menu {
  flex: 1;
  min-height: 0;
  /* 菜单项过多时允许内部滚动，避免被裁切 */
  overflow-y: auto;
}

/* 右侧列：顶栏 + 内容，占满剩余宽度 */
.main-col {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.head {
  flex-shrink: 0;
  height: 80px;
  display: flex;
  align-items: center;
  flex-direction: row;
  padding: 0 24px;
  /* 顶栏保持白色（用户偏好）：与下方蓝色内容区以颜色对比分隔，无任何装饰线/阴影 */
  background-color: #ffffff;
}

.head-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.head-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
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

.work {
  flex: 1;
  min-height: 0;
  /* 关键修复：内容超过可视高度时，在内容区内部滚动，而不是裁掉底部 */
  overflow-y: auto;
  /* 品牌蓝内容背景（支持渐变）：linear-gradient 是 <image> 类型，必须走 background-image，
     不能写进 background-color（否则声明被丢弃，背景回退为 transparent） */
  background-image: var(--brand-content-bg);
  /* 白卡片容器的外间距，统一呼吸感，避免业务页贴边 */
  padding: 24px;
  box-sizing: border-box;
}

/* 内容区：浅蓝品牌底作为可见的页面背景场，业务页（白表/白输入框）直接浮在其上，
   形成"蓝场白卡"层次；不再套白色全铺卡片，否则会盖住蓝底 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-family: sans-serif;
}

.crumb-root {
  color: #606266;
  font-weight: 500;
}

.crumb-sep {
  color: #c0c4cc;
}

.crumb-current {
  /* 面包屑当前模块名用主色，带出天际蓝焦点 */
  color: var(--brand-500);
  font-weight: 500;
}

.username {
  margin-right: 16px;
  color: #303133;
  font-size: 14px;
  font-family: sans-serif;
}
</style>
