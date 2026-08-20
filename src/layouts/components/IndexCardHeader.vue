<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="idx-card-header idx-base">
    <div class="bg-box">
      <div class="bg1"></div>
      <div class="bg2"></div>
      <div class="bg3"></div>
      <div class="bg4"></div>
    </div>
    <div class="header-content">
      <div class="title-box">
        <span class="text">{{ title }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.idx-card-header {
  width: 100%;
  background: linear-gradient(90deg, #0c1390, #eeeeff);
  position: relative;
  height: 40px;
  border-radius: 6px 0 0 0;
}

.bg-box {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
}

.bg1 {
  width: 66px;
  height: 66px;
  background: linear-gradient(19deg, #4cb8f9, hsla(0, 0%, 100%, 0));
  right: 16px;
  bottom: -48px;
  border-radius: 2px;
  opacity: 0.2;
  transform: rotate(315deg);
  position: absolute;
}

.bg2 {
  border-radius: 2px;
  opacity: 0.2;
  transform: rotate(315deg);
  position: absolute;
  width: 36px;
  height: 36px;
  background: linear-gradient(240deg, #4cb8f9, hsla(0, 0%, 100%, 0) 30%);
  right: 73px;
  bottom: -29px;
}

.bg3 {
  width: 103px;
  height: 103px;
  background: linear-gradient(35deg, #4cb8f9, hsla(0, 0%, 100%, 0) 30%);
  right: 126px;
  top: -86px;
  border-radius: 2px;
  transform: rotate(315deg);
  position: absolute;
}

.bg4 {
  border-radius: 2px;
  transform: rotate(315deg);
  position: absolute;
  width: 91px;
  height: 91px;
  background: linear-gradient(45deg, #4cb8f9, hsla(0, 0%, 100%, 0) 30%);
  right: 175px;
  top: -82px;
}

.header-content {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}

.title-box {
  width: 100%;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}
</style>
