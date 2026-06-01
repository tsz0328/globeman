<script setup lang="ts">
</script>

<template>
  <div class="background">
    <div class="login-title">
      <div data-v-5a922248="" class="bg-box">
        <div data-v-5a922248="" class="bg1"></div>
        <div data-v-5a922248="" class="bg2"></div>
        <div data-v-5a922248="" class="bg3"></div>
        <div data-v-5a922248="" class="bg4"></div>
      </div>
      <div data-v-5a922248="" class="login-content">
        <div data-v-4022d12a="" data-v-5a922248="" class="title-box">
          <span data-v-4022d12a="" data-v-5a922248="" class="text">通知</span>
        </div>
      </div>
    </div>
    <div class="content">

    </div>
  </div>
</template>

<style scoped>
.background{
  width: 98%;
  height: 100%;
}

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

.login-title {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
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

.content{
  height: 1215px;
  background-color: white;
}
</style>
