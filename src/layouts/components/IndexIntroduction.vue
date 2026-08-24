<script setup lang="ts">
import { computed } from 'vue'
import logoPng from '@/assets/logo.png'
import contentBg from '@/assets/contentBg.png'
import { intro } from '@/api/platform/Announcement'

// 公司介绍：默认 logo，标题/正文取 store（可在「公告管理 - 公司介绍」维护）
const introTitle = computed(() => intro.value.title || '湖南全球人信息技术有限公司')
const introContent = computed(() => intro.value.content || '')
</script>

<template>
  <div
    class="intro-box idx-base"
    :style="{ backgroundImage: `url(${contentBg})` }"
  >
    <div class="title">
      <img :src="intro.logoUrl || logoPng" alt="湖南全球人logo" />
      <div class="title-text">
        {{ introTitle }}
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（简称湖南全球人）
      </div>
    </div>
    <div class="intro-content">{{ introContent }}</div>
  </div>
</template>

<style scoped>
.intro-box {
  overflow: hidden;
  border-radius: 5px 5px 0 0;
  height: 399px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 100%;
  padding: 25px 30px 24px;
}

.title {
  margin: 0 0 14px;
  display: flex;
  justify-content: center;
}

.title img {
  border: 0;
  width: auto;
  height: 20px;
  margin-right: 5px;
  margin-top: 1px;
}

.title-text {
  color: #231916;
  font-size: 20px;
  font-weight: 500;
}

.intro-content {
  width: 385px;
  height: 320px;
  color: #333;
  font-size: 14px;
  line-height: 29px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
