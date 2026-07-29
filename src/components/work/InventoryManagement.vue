<template>
  <div class="inventory-management">
    <div class="page-header">
      <h2 class="title">库存管理</h2>
    </div>
    <div class="content-card">
      <el-empty />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.inventory-management {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid black;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.content-card {
  background-color: white;
  padding: 40px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
