<script setup lang="ts">
import IndexCardHeader from '@/components/Index/IndexCardHeader.vue'
</script>

<template>
  <div class="message-panel idx-base">
    <IndexCardHeader title="通知" />
    <div class="message-content">
      <!-- TODO: 接入动态通知数据 -->
    </div>
  </div>
</template>

<style scoped>
.message-panel {
  width: 98%;
  height: 100%;
}

.message-content {
  min-height: 1215px;
  background-color: white;
}
</style>
