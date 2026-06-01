<script setup lang="ts"></script>

<template>
  <router-view></router-view>
</template>

<style>
/* 全局样式：统一 html 和 body 的基础样式 */
html,
body {
  margin: 0; /* 清除浏览器默认的外边距，让页面紧贴窗口边缘 */
  padding: 0; /* 清除浏览器默认的内边距，避免多余空白 */
  overflow-x: hidden; /* 隐藏水平方向的滚动条，防止页面左右滑动 */
  width: 100%; /* 让 html 和 body 宽度占满整个浏览器窗口 */
  background-color: #f6f6f6;
}

html ::-webkit-scrollbar {
  /*隐藏纵向滚动条，但保留滚动功能 */
  /* 针对 WebKit 浏览器（Chrome, Safari, Edge 等） */
  width: 0; /* 隐藏垂直滚动条 */
  background: transparent; /* 可选，使滚动条背景透明 */
}
/* 针对 Firefox */
html {
  scrollbar-width: none; /* 隐藏滚动条 */
}
</style>
