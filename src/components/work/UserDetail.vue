<template>
  <div class="user-detail-page">
    <div class="page-header">
      <el-button @click="goBack">← 返回</el-button>
      <h2 class="title">用户详情</h2>
    </div>

    <el-card v-loading="loading">
      <template #header>
        <span class="section-title">用户信息</span>
      </template>
      <el-descriptions v-if="user" :column="2" border>
        <el-descriptions-item label="用户ID">{{ user.id }}</el-descriptions-item>
        <el-descriptions-item label="账号">{{ user.account }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ user.name }}</el-descriptions-item>
        <el-descriptions-item label="公司">{{ user.company || '—' }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ user.role }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ user.createTime }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else description="未找到该用户" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUser, type User } from '@/composables/useUser'

const { userList, fetchUsers } = useUser()
const route = useRoute()
const user = ref<User | null>(null)
const loading = ref(false)

// 关闭当前标签页（本页由 window.open 在新标签打开）
const goBack = () => {
  window.close()
}

onMounted(async () => {
  const idParam = route.params.id
  const id = typeof idParam === 'string' ? Number(idParam) : 0
  loading.value = true
  try {
    // 强制重新拉取，确保拿到最新用户数据后按 id 匹配
    await fetchUsers(true)
    user.value = userList.value.find((u) => u.id === id) ?? null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.user-detail-page {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid black;
  gap: 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-right: auto;
}

.section-title {
  font-weight: 600;
}
</style>
