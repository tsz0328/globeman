<template>
  <div class="work-page">
    <!-- 页头：标题（左） + 操作区（右）。标题默认跟随菜单配置联动，可用 #title 槽覆盖 -->
    <header class="work-page__header">
      <div class="work-page__title">
        <slot name="title">{{ fallbackTitle }}</slot>
      </div>
      <div class="work-page__actions"><slot name="actions" /></div>
    </header>

    <!-- 筛选区（可选，注入 el-form inline 即可） -->
    <section v-if="$slots.filter" class="work-page__filter">
      <slot name="filter" />
    </section>

    <!-- 内容区（表格 + 分页等），落在白卡内浮于蓝底之上。
         loading 绑定在这里：加载圈只盖表格卡，不遮标题/操作/筛选区 -->
    <section class="work-page__body" v-loading="loading">
      <slot />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getMenuTitle } from '@/data/menuConfig'

// 通用工作台页面骨架：三段式（标题+操作 / 筛选 / 内容）。
// 各管理页只通过 slot 注入内容，结构天然一致；后续统一调样式只改这一处。
// 标题默认取当前路由路径对应的菜单名（与侧边菜单、顶栏面包屑同源联动），
// 页面若需要自定义标题（如带返回按钮），仍可用 #title 槽覆盖。
const props = withDefaults(defineProps<{ loading?: boolean }>(), { loading: false })

const route = useRoute()
const fallbackTitle = computed(() => getMenuTitle(route.path))
</script>

<style scoped>
.work-page {
  position: relative; /* 承载 v-loading 遮罩 */
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.work-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.work-page__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--brand-500);
}

.work-page__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* 筛选区：白卡浮于蓝底，与内容卡视觉一致（无阴影，靠蓝底对比区分） */
.work-page__filter {
  background: #ffffff;
  border-radius: 10px;
  padding: 16px 18px;
}

/* 筛选表单：紧凑化 + 垂直居中。
   Element Plus inline 表单的 .el-form-item 默认带 margin-bottom: 18px，
   且 inline-flex 原子盒的垂直 margin 会计入行盒高度 → 白卡底部多出空白、
   筛选项整体偏上不居中。这里改为 flex 布局：行间距统一 12px，
   卡片高度贴合内容，筛选项在卡片内自然垂直居中。 */
.work-page__filter :deep(.el-form--inline) {
  display: flex;
  flex-wrap: wrap;
  row-gap: 12px;
}

.work-page__filter :deep(.el-form--inline .el-form-item) {
  margin-bottom: 0;
}

/* 内容区：白卡浮于蓝底，承载表格与分页（无阴影，靠蓝底对比区分）。
   position: relative 让 v-loading 遮罩以本卡为定位基准（只盖表格，不遮标题/操作/筛选） */
.work-page__body {
  position: relative;
  background: #ffffff;
  border-radius: 10px;
  padding: 16px 18px;
}
</style>
