<template>
  <div class="menu-wrapper">
    <el-menu
      :default-active="activePath"
      router
      class="menu"
      background-color="transparent"
      text-color="#d6e4ff"
      active-text-color="#ffffff"
    >
      <template v-for="item in visibleMenus" :key="item.path">
        <!-- 子菜单分组 -->
        <el-sub-menu v-if="item.children && item.children.length" :index="item.path">
          <template #title>
            <el-icon v-if="item.icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
            {{ child.title }}
          </el-menu-item>
        </el-sub-menu>
        <!-- 普通菜单项 -->
        <el-menu-item v-else :index="item.path">
          <el-icon v-if="item.icon">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { menuConfig } from '@/data/menuConfig'

const route = useRoute()
const activePath = computed(() => route.path)
const auth = useAuthStore()
const isAdmin = computed(() => auth.isAdmin)
// 按角色过滤菜单（adminOnly 项仅管理员可见）
const visibleMenus = computed(() => menuConfig.filter((item) => !item.adminOnly || isAdmin.value))
</script>

<style scoped>
.menu-wrapper {
  display: flex;
  flex-direction: column;
  padding: 16px 14px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  border-right: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  border-radius: 8px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

:deep(.el-menu-item.is-active) {
  /* 选中项：浅色"药丸"高亮 + 主色辉光，圆角友好、在深蓝渐变上明显跳出，且不引用任何旧色 */
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(46, 91, 255, 0.35);
}

:deep(.el-menu-item:not(.is-active):hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-sub-menu .el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  font-size: 18px;
}
</style>
