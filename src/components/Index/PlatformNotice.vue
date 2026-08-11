<script setup lang="ts">
import IndexCardHeader from '@/components/Index/IndexCardHeader.vue'

const notices = [
  {
    title: '各供应商：',
    paragraphs: [
      '根据中国铁塔一码到底全国推广工作要求，在线商务平台已于2023年8月4日上线全国全品类主设备一码到底。即2023年8月5日起接收的主设备订单需贴签扫码后才能发货。请涉及的各主设备供应商根据近期实际供货量提前备签，避免因标签问题影响发货。',
      '一码到底相关要求、培训视频、操作手册详见铁塔在线商务平台-下载专区。',
    ],
  },
  {
    title: '各供应商：',
    paragraphs: [
      '中国铁塔秉承开放、平等和诚信原则与广大供应商开展合作。如有下列相关问题，可通过相关渠道反映，感谢配合！',
      '1.进行欠款清理申诉，推动中小企业应付款清理工作。',
      '2.采购履约需要反馈的情形（如未履行采购手续向供应商进行借货等）。',
    ],
  },
]
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
