<template>
  <div class="menu-container">
    <div class="menu-header">系统菜单</div>
    <div class="menu-items">
      <router-link to="/work/user" class="menu-item" active-class="active">
        <span class="menu-icon">👤</span>
        <span class="menu-text">用户管理</span>
      </router-link>
      <router-link to="/work/project" class="menu-item" active-class="active">
        <span class="menu-icon">📋</span>
        <span class="menu-text">项目管理</span>
      </router-link>
      <router-link to="/work/customer" class="menu-item" active-class="active">
        <span class="menu-icon">👥</span>
        <span class="menu-text">客户管理</span>
      </router-link>
      <router-link to="/work/company" class="menu-item" active-class="active">
        <span class="menu-icon">🏢</span>
        <span class="menu-text">公司管理</span>
      </router-link>
      <div class="menu-item sub-menu-header" @click="toggleRepairMenu">
        <span class="menu-icon">🔧</span>
        <span class="menu-text">维修</span>
        <span class="menu-arrow">{{ isRepairMenuOpen ? '▼' : '▶' }}</span>
      </div>
      <div class="sub-menu-items" v-show="isRepairMenuOpen">
        <router-link to="/work/repair-management" class="sub-menu-item" active-class="active">
          <span class="menu-text">维修管理</span>
        </router-link>
        <router-link to="/work/repair-accept" class="sub-menu-item" active-class="active">
          <span class="menu-text">维修接单</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isRepairMenuOpen = ref(false)

const toggleRepairMenu = () => {
  isRepairMenuOpen.value = !isRepairMenuOpen.value
}
</script>

<style scoped>
.menu-container {
  width: 180px;
  background-color: #2f4050;
  min-height: 100vh;
  padding-top: 20px;
}

.menu-header {
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  padding: 15px;
  background-color: #1f2d3d;
  margin-bottom: 10px;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  color: #a7b1c2;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: #1ab394;
  color: white;
}

.menu-item.active {
  background-color: #1ab394;
  color: white;
}

.menu-icon {
  font-size: 18px;
}

.menu-text {
  font-size: 14px;
}

.sub-menu-header {
  cursor: pointer;
}

.menu-arrow {
  margin-left: auto;
  font-size: 12px;
}

.sub-menu-items {
  padding-left: 20px;
}

.sub-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  color: #a7b1c2;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.sub-menu-item:hover {
  background-color: #1ab394;
  color: white;
}

.sub-menu-item.active {
  background-color: #1ab394;
  color: white;
}
</style>
