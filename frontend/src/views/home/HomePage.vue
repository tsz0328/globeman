<template>
  <div class="home">
    <!-- 欢迎横幅：品牌渐变 hero -->
    <div class="banner">
      <div class="banner-glow banner-glow-1" />
      <div class="banner-glow banner-glow-2" />
      <div class="banner-left">
        <div class="banner-text">
          <div class="banner-title">欢迎回来，{{ username }}</div>
          <div class="banner-sub">{{ roleText }} · {{ todayText }}</div>
        </div>
      </div>
      <div class="banner-pill">
        <span class="pill-num"><CountUp :value="totalTodo" /></span>
        <span class="pill-text">今日待处理</span>
      </div>
    </div>

    <!-- 核心指标卡 -->
    <div class="stat-grid">
      <div v-for="(card, i) in statCards" :key="card.key" class="card stat-card" :style="{ animationDelay: i * 60 + 'ms' }">
        <div class="stat-icon">
          <el-icon :size="22"><component :is="card.icon" /></el-icon>
        </div>
        <div class="stat-body">
          <div class="stat-value"><CountUp :value="card.value" /></div>
          <div class="stat-label">{{ card.label }}</div>
          <div v-if="card.sub" class="stat-sub">{{ card.sub }}</div>
        </div>
      </div>
    </div>

    <!-- 下半区：待办 + (公告 / 快捷入口) -->
    <div class="lower">
      <div class="card panel" style="animation-delay: 240ms">
        <div class="panel-head">
          <span>待我处理</span>
        </div>
        <div v-if="todos.length" class="todo-list">
          <div
            v-for="todo in todos"
            :key="todo.type"
            class="todo-item"
            @click="go(todo.route)"
          >
            <span class="todo-title">{{ todo.title }}</span>
            <span class="todo-count">{{ todo.count }}</span>
            <el-icon class="todo-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
        <el-empty v-else description="暂无待处理事项" :image-size="60" />
      </div>

      <div class="right-col">
        <div class="card panel" style="animation-delay: 300ms">
          <div class="panel-head panel-head--link">
            <span>最新公告</span>
            <span class="panel-more" @click="go('/work/platform-announcement')">
              查看全部<el-icon><ArrowRight /></el-icon>
            </span>
          </div>
          <div v-if="announcements.length" class="news-list">
            <div v-for="a in announcements" :key="a.id" class="news-item">
              <div class="news-title">{{ a.title }}</div>
              <div class="news-time">{{ a.publishTime }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无公告" :image-size="60" />
        </div>

        <div class="card panel" style="animation-delay: 360ms">
          <div class="panel-head">
            <span>快捷入口</span>
          </div>
          <div class="quick-grid">
            <div
              v-for="m in quickEntries"
              :key="m.path"
              class="quick-item"
              @click="go(m.path)"
            >
              <el-icon class="quick-icon"><component :is="m.icon" /></el-icon>
              <span class="quick-label">{{ m.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Component } from 'vue'
import { Tickets, Tools, Box, Coin, ArrowRight } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { menuConfig } from '@/data/menuConfig'
import { getDashboardApi } from '@/api/dashboard/DashboardApi'
import { getAnnouncementList } from '@/api/platform/AnnouncementApi'
import type { DashboardTodo } from '@/api/dashboard/types'
import CountUp from '@/components/common/CountUp.vue'

const router = useRouter()
const authStore = useAuthStore()

const username = computed(() => authStore.username || '未登录')
const roleText = computed(() => (authStore.isAdmin ? '管理员' : authStore.role || '员工'))
const totalTodo = computed(() => todos.value.reduce((s, t) => s + t.count, 0))

// 日期 + 星期（挂载时计算一次即可）
const todayText = (() => {
  const d = new Date()
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${week}`
})()

// 数据
const stat = ref({
  orderTotal: 0,
  repairPending: 0,
  assetCount: 0,
  assetTotalValue: 0,
  inventoryWarning: 0,
})
const todos = ref<DashboardTodo[]>([])
const announcements = ref<{ id: string; title: string; publishTime: string }[]>([])

onMounted(async () => {
  const [dash, news] = await Promise.all([getDashboardApi(), getAnnouncementList()])
  stat.value = dash.stat
  todos.value = dash.todos
  announcements.value = news
    .filter((i) => i.enabled)
    .slice(0, 5)
    .map((i) => ({ id: i.id, title: i.title, publishTime: i.publishTime }))
})

const statCards = computed(() => [
  { key: 'order', label: '订单总数', value: stat.value.orderTotal, icon: Tickets as Component },
  { key: 'repair', label: '维修待接', value: stat.value.repairPending, icon: Tools as Component },
  {
    key: 'asset',
    label: '固定资产',
    value: stat.value.assetCount,
    icon: Coin as Component,
    sub: `总值 ¥${stat.value.assetTotalValue.toLocaleString()}`,
  },
  { key: 'inv', label: '库存预警', value: stat.value.inventoryWarning, icon: Box as Component },
])

// 快捷入口：遍历菜单；非 admin 过滤 adminOnly；父级有 children 时跳第一个子路由
const quickEntries = computed(() => {
  const list = authStore.isAdmin ? menuConfig : menuConfig.filter((m) => !m.adminOnly)
  return list
    .filter((m) => m.path !== '/work/home' && m.path !== '/work/personalCenter')
    .map((m) => {
      const target = m.children?.[0] ?? m
      return {
        path: target.path,
        title: m.title,
        icon: (target.icon ?? Box) as Component,
      }
    })
})

function go(route: string) {
  router.push(route)
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 白卡片浮蓝底：静止态无阴影（贴合「无 box-shadow」约定），hover 才浮起一层极淡品牌色阴影 */
.card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 20px;
  border: 1px solid #eef0f5;
  animation: fadeUp 0.5s ease both;
  transition: border-color 0.2s ease, box-shadow 0.25s ease;
}
.card:hover {
  border-color: var(--brand-200);
  box-shadow: 0 8px 24px rgba(46, 91, 255, 0.1);
}

/* 入场错落动画（纯 CSS，无 JS 负担） */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 欢迎横幅：品牌渐变 hero ===== */
.banner {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 26px;
  border-radius: 14px;
  background: linear-gradient(120deg, var(--brand-800) 0%, var(--brand-600) 55%, var(--brand-500) 100%);
  animation: fadeUp 0.5s ease both;
}
/* 低透明度光晕增加纵深（不用阴影） */
.banner-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(8px);
  pointer-events: none;
}
.banner-glow-1 {
  width: 220px;
  height: 220px;
  top: -90px;
  right: 60px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22), transparent 70%);
}
.banner-glow-2 {
  width: 160px;
  height: 160px;
  bottom: -80px;
  right: 200px;
  background: radial-gradient(circle, rgba(126, 159, 255, 0.35), transparent 70%);
}
.banner-left {
  position: relative;
  z-index: 1;
}
.banner-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.3px;
}
.banner-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 4px;
}
.banner-pill {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 22px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(2px);
}
.pill-num {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.pill-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.82);
  margin-top: 2px;
}

/* ===== 指标卡 ===== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.stat-card {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: border-color 0.2s ease, transform 0.2s ease;
}
/* 右上角淡径向高光，避免阴影也能有层次 */
.stat-card::after {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--brand-50), transparent 70%);
  pointer-events: none;
}
.stat-card:hover {
  border-color: var(--brand-200);
}
.stat-icon {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(135deg, var(--brand-500), var(--brand-700));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--brand-900);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
.stat-sub {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 2px;
}

/* ===== 下半区两栏 ===== */
.lower {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  align-items: start;
}
.right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.panel-head {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 10px;
  margin-bottom: 8px;
  border-bottom: 1px solid #eef0f5;
}
/* 标题前品牌色竖条 */
.panel-head > span:first-child {
  position: relative;
  padding-left: 11px;
}
.panel-head > span:first-child::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--brand-400), var(--brand-600));
}
.panel-head--link {
  justify-content: space-between;
}
.panel-more {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 400;
  color: #909399;
  cursor: pointer;
  transition: color 0.2s ease;
}
.panel-more:hover {
  color: var(--brand-500);
}

/* 待办列表 */
.todo-item {
  display: flex;
  align-items: center;
  padding: 11px 10px;
  margin: 0 -10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.18s ease;
}
.todo-item + .todo-item {
  border-top: 1px solid #f2f4f7;
}
.todo-item:hover {
  background: var(--brand-50);
}
.todo-title {
  flex: 1;
  color: #606266;
  font-size: 14px;
}
.todo-count {
  font-weight: 700;
  color: var(--brand-500);
  font-size: 16px;
  margin-right: 8px;
  font-variant-numeric: tabular-nums;
}
.todo-arrow {
  color: #c0c4cc;
  transition: transform 0.2s ease, color 0.2s ease;
}
.todo-item:hover .todo-arrow {
  color: var(--brand-500);
  transform: translateX(3px);
}

/* 公告 */
.news-item {
  padding: 9px 0;
  border-bottom: 1px solid #f2f4f7;
}
.news-item:last-child {
  border-bottom: none;
}
.news-title {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.18s ease;
  cursor: default;
}
.news-item:hover .news-title {
  color: var(--brand-500);
}
.news-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 2px;
}

/* 快捷入口 */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 4px;
  border-radius: 10px;
  cursor: pointer;
  background: var(--brand-50);
  transition: background 0.2s ease, transform 0.2s ease;
}
.quick-item:hover {
  background: var(--brand-100);
  transform: translateY(-2px);
}
.quick-icon {
  font-size: 20px;
  color: var(--brand-500);
}
.quick-label {
  font-size: 12px;
  color: #606266;
}

/* 窄屏自适应 */
@media (max-width: 1100px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .lower {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
}
</style>
