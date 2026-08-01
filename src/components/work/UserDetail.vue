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
      <el-descriptions v-if="info" :column="2" border>
        <el-descriptions-item label="账号">{{ info.account }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ info.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ info.sex || '—' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="info.status === 0" type="danger">禁用</el-tag>
          <el-tag v-else type="success">正常</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="公司">{{ info.company || '—' }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ info.department || '—' }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ info.role }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ info.phone || '—' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ info.email || '—' }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ info.card || '—' }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ info.address || '—' }}</el-descriptions-item>
        <el-descriptions-item label="出生日期">{{ info.birth || '—' }}</el-descriptions-item>
        <el-descriptions-item label="学历">{{ info.education || '—' }}</el-descriptions-item>
        <el-descriptions-item label="紧急联系人">{{ info.emergency || '—' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ info.time || '—' }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else description="未找到该用户" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getUserInfoApi, type UserInfo } from '@/api/UserApi'

const route = useRoute()
const info = ref<UserInfo | null>(null)
const loading = ref(false)

// 关闭当前标签页（本页由 window.open 在新标签打开）
const goBack = () => {
  window.close()
}

onMounted(async () => {
  const accountParam = route.params.id
  const account = typeof accountParam === 'string' ? decodeURIComponent(accountParam) : ''
  if (!account) {
    return
  }
  loading.value = true
  try {
    // 按账号调用 GET /client/user/getInfoUser 获取完整用户信息
    const res = await getUserInfoApi(account)
    if (res.code === 200 && res.data) {
      info.value = res.data
    } else {
      console.warn('获取用户信息返回异常:', res.msg)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
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
