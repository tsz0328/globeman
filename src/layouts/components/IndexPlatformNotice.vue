<script setup lang="ts">
import { computed } from 'vue'
import IndexCardHeader from './IndexCardHeader.vue'
import { announcements } from '@/api/platform/Announcement'

// 平台公告：取 type=platform 且已发布的列表，按发布时间倒序
const notices = computed(() =>
  announcements.value
    .filter((i) => i.type === 'platform' && i.enabled)
    .sort((a, b) => b.publishTime.localeCompare(a.publishTime))
    .map((i) => ({ title: i.title, paragraphs: i.content })),
)
</script>

<template>
  <IndexCardHeader title="平台公告" />
  <div class="notice-panel idx-base">
    <div v-for="(item, i) in notices" :key="i" class="notice-item">
      <div class="notice-title">
        <div class="line"></div>
        <h4 class="title-text">{{ item.title }}</h4>
      </div>
      <div class="notice-content">
        {{ item.paragraphs[0] }}
        <p v-for="(p, j) in item.paragraphs.slice(1)" :key="j">{{ p }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notice-panel {
  background-color: #fff;
  min-height: 300px;
  padding: 15px;
}

.notice-item {
  margin: 0 0 15px;
  background: #f8f8f8;
  padding: 10px 15px 10px 0;
}

.notice-title {
  display: flex;
  align-items: center;
}

.line {
  width: 3px;
  height: 11px;
  background: #0c1390;
  box-shadow: 0 2px 4px 0 #4bb5f3;
}

.title-text {
  margin-left: 5px;
  font-weight: 400;
  font-size: 14px;
  color: #4bb5f3;
  line-height: 29px;
}

.notice-content {
  padding-left: 6px;
  font-size: 14px;
  line-height: 29px;
  text-indent: 2em;
}

.notice-content p {
  font-size: 14px;
  line-height: 29px;
  text-indent: 2em;
}
</style>
