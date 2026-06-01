<script setup lang="ts">
</script>

<template>
  <div class="login-title">
    <div class="bg-box">
      <div class="bg1"></div>
      <div class="bg2"></div>
      <div class="bg3"></div>
      <div class="bg4"></div>
    </div>
    <div class="login-content">
      <div class="title-box">
        <span class="text">平台公告</span>
      </div>
    </div>
  </div>

  <div class="content" style="height: 493px; padding: 15px;">
    <div class="list-item" style="height: 252px;">
      <div class="notice-title">
        <div class="line">

        </div>
        <h4 class="title-text" style="margin-left: 5px; line-height: 29px;"> 各供应商： </h4>
      </div>
      <div class="notice-content">根据中国铁塔一码到底全国推广工作要求，在线商务平台已于2023年8月4日上线全国全品类主设备一码到底。即2023年8月5日起接收的主设备订单需贴签扫码后才能发货。 请涉及的各主设备供应商根据近期实际供货量提前备签，避免因标签问题影响发货。
        <p>一码到底相关要求、培训视频、操作手册详见铁塔在线商务平台-下载专区。</p>
      </div>
    </div>
    <div class="list-item" style="height: 194px;">
      <div class="notice-title">
        <div class="line"></div>
        <h4 class="title-text" style="margin-left: 5px; line-height: 29px;"> 各供应商： </h4>
      </div>
      <div class="notice-content">中国铁塔秉承开放、平等和诚信原则与广大供应商开展合作。如有下列相关问题，可通过相关渠道反映，感谢配合！
        <p>1.进行欠款清理申诉，推动中小企业应付款清理工作。</p>
        <p>2.采购履约需要反馈的情形（如未履行采购手续向供应商进行借货等）。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-box {
  width: 100%;
  padding: 0 15px;
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: baseline;
  align-items: baseline;
  margin: 0;
  user-select: none;
  box-sizing: border-box;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
}

.login-title {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  width: 100%;
  background: linear-gradient(90deg, #0C1390, #eeeeff);
  position: relative;
  height: 40px;
  border-radius: 6px 0 0 0;
}

.bg-box {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
}

.bg1 {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  width: 66px;
  height: 66px;
  background: linear-gradient(19deg, #4CB8F9, hsla(0, 0%, 100%, 0));
  right: 16px;
  bottom: -48px;
  border-radius: 2px 2px 2px 2px;
  opacity: 0.2;
  transform: rotate(315deg);
  position: absolute;
}

.bg2 {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  border-radius: 2px 2px 2px 2px;
  opacity: 0.2;
  transform: rotate(315deg);
  position: absolute;
  width: 36px;
  height: 36px;
  background: linear-gradient(240deg, #4CB8F9, hsla(0, 0%, 100%, 0) 30%);
  right: 73px;
  bottom: -29px;
}

.bg3 {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  width: 103px;
  height: 103px;
  background: linear-gradient(35deg, #4CB8F9, hsla(0, 0%, 100%, 0) 30%);
  right: 126px;
  top: -86px;
  border-radius: 2px 2px 2px 2px;
  transform: rotate(315deg);
  position: absolute;
}

.bg4 {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  border-radius: 2px 2px 2px 2px;
  transform: rotate(315deg);
  position: absolute;
  width: 91px;
  height: 91px;
  background: linear-gradient(45deg, #4CB8F9, hsla(0, 0%, 100%, 0) 30%);
  right: 175px;
  top: -82px;
}

.login-content {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}

.content{
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  background-color: #fff;
  min-height: 300px;
  height: 493px;
  padding: 15px;
}

.list-item{
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  user-select: none;
  margin: 0 0 15px;
  box-sizing: border-box;
  background: #f8f8f8;
  padding: 10px 15px 10px 0;
  height: 252px;
}

.notice-title{
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
}

.line{
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  width: 3px;
  height: 11px;
  background: #0C1390;
  box-shadow: 0 2px 4px 0 #4BB5F3;
}

.title-text{
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0 0 0 5px;
  padding: 0;
  font-weight: 400;
  font-size: 14px;
  color: #4BB5F3;
  line-height: 29px;
}

.notice-content{
  -webkit-text-size-adjust: 100%;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0 0 0 6px;
  font-size: 14px;
  line-height: 29px;
  text-indent: 2em;
}

p{
  -webkit-text-size-adjust: 100%;
  --minWidth: 1320px;
  --maxWidth: 1576px;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  font-size: 14px;
  line-height: 29px;
  text-indent: 2em;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
}
</style>
