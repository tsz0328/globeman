<script setup lang="ts">
// 键盘导航表格的统一提示行：放在表格上方，一行灰色小字说明按键用法。
// 只统一语义与样式，文案由各表格按自身导航规则传入（各表规则并不一致：
// 有的 Enter 跳下一格、有的 Enter 提交，SN 表还是单列 + 左右翻页）。
defineProps<{ text: string }>()
</script>

<template>
  <p class="table-nav-hint">{{ text }}</p>
</template>

<style scoped>
/* flex: none：不参与表格区域的高度分配，避免挤压/干扰按高度自动铺满行数的测量 */
.table-nav-hint {
  flex: none;
  margin: 0 0 6px;
  font-size: 12px;
  line-height: 18px;
  color: #909399;
}
</style>
