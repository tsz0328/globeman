<script setup lang="ts">
import Cookies from 'js-cookie'
import { ElMessage } from 'element-plus'
import router from '@/router'

async function clearUserInfo(){
  const allCookies = Cookies.get()
  for (const key in allCookies) {
    Cookies.remove(key, { path: '/' })
  }
}

async function handleLogout() {
  clearUserInfo()
  ElMessage.success('退出成功')
  router.push('login')
}

async function handleWork() {
  router.push({name: 'Home'})
}
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
        <span class="text">用户登录</span>
      </div>
    </div>
  </div>

  <div class="content" style="height: 240px; padding: 20px 15px">
    <form class="el-form el-form--label-left" @submit.prevent="">
      <div class="el-form-item is-required">
      </div>
      <div class="el-form-item" style="margin-bottom: 20px">
        <div class="el-form-item__content">
          <button class="loginBtn" @click="handleWork">工作台</button>
        </div>
      </div>
      <div class="logout" @click="handleLogout"><span> 退出登录 </span></div>
    </form>
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
  background: linear-gradient(90deg, #0c1390, #eeeeff);
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
  background: linear-gradient(19deg, #4cb8f9, hsla(0, 0%, 100%, 0));
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
  background: linear-gradient(240deg, #4cb8f9, hsla(0, 0%, 100%, 0) 30%);
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
  background: linear-gradient(35deg, #4cb8f9, hsla(0, 0%, 100%, 0) 30%);
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
  background: linear-gradient(45deg, #4cb8f9, hsla(0, 0%, 100%, 0) 30%);
  right: 175px;
  top: -82px;
}

.content {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  background-color: #fff;
  min-height: 240px;
  height: 300px;
  padding: 20px 15px;
  border-radius: 0 0 0 6px;
}

.el-form--label-left {
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
}

.is-required {
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
  margin: 0 0 36px;
  padding: 0;
  /*按钮之间的高度*/
  height: 96px;
  font-size: 14px;
}

.el-form-item__content {
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
  /*输入栏和按钮之间的高度*/
  line-height: 40px;
  position: relative;
  font-size: 14px;
}

.loginBtn {
  -webkit-text-size-adjust: 100%;
  --autoWidth: calc(80% - 2px);
  --loginNavFontSize: 14px;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  box-sizing: border-box;
  user-select: none;
  margin: 0;
  padding: 0;
  text-align: center;
  width: 100%;
  height: 40px;
  font-size: 14px;
  font-weight: 700;
  line-height: 40px;
  background: linear-gradient(180deg, #4cb8f9, #08138d);
  color: #fff;
  cursor: pointer;
  /* 清除button默认样式 */
  border: none;
  outline: none;
  border-radius: 0;
  appearance: none;
}

.loginBtn:hover {
  background: linear-gradient(180deg, #66c7ff, #1020b3);
}

.loginBtn:active {
  background: #08138d;
}

.logout {
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
  font-size: 14px;
  color: #08138d;
  line-height: 2px;
}
</style>
