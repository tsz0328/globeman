<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import 'vue3-carousel/carousel.css'
import PlatformNoticeComponent from '@/components/Index/PlatformNotice.vue'
import Introduction from '@/components/Index/Introduction.vue'
import Message from '@/components/Index/Message.vue'
import Foot from '@/components/Index/Foot.vue'
import Carousel from '@/components/Index/Carousel.vue'
import Cookies from 'js-cookie'
import router from '@/router'
import { Promotion } from '@element-plus/icons-vue'
import logoPng from '@/assets/logo.png'

const time = ref('')
const pad = (n: number):string => n.toString().padStart(2, '0')
const week:string[] = ['日', '一', '二', '三', '四', '五', '六']

const update = (): void => {
  const d = new Date()
  time.value = `${d.getFullYear()}年${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 星期${week[d.getDay()]} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

//页面加载时，自动检查是否有登入
onMounted(() => {
  // 检查登录状态
  if (Cookies.get('token')) {
    router.replace({ name: 'LoginSuccess' })
  } else {
    router.replace({ name: 'Login' })
  }

  // 更新时间
  update()
  const t = setInterval(update, 1000)
  onUnmounted(() => clearInterval(t))
})
</script>

<template>
  <div class="main">
    <div class="head idx-base">
      <div class="logo">
        <div class="logo_left">
          <img :src="logoPng" alt="logo" />
        </div>
        <div class="logo_right">
          <div class="company_name">湖南全球人信息技术有限公司</div>
          <p class="company_n">Hunan Global Person Information Technology Company Limited</p>
        </div>
      </div>
      <div class="time">
        {{ time }}
      </div>
      <!-- TODO: 搜索栏暂无功能，待接入公告搜索接口 -->
      <div class="search">
        <div class="search-icon">
          <input
            id="announcementSearch"
            name="announcementSearch"
            type="text"
            class="search-input"
            aria-label="公告标题搜索"
            placeholder="请输入公告标题包含的关键字"
          />
          <button type="button" class="search-button">搜索</button>
        </div>
      </div>
    </div>
    <div class="body">
      <!--轮播图-->
      <div class="carousel">
        <Carousel />
      </div>
      <div class="notice idx-base">
        <div class="new">
          <h4>
            <el-icon class="notice-bell">
              <Promotion />
            </el-icon>
            最新公告
          </h4>
        </div>
        <div class="notice-content">
          <!-- TODO: 接入动态最新公告数据 -->
        </div>
      </div>
      <div class="content">
        <div class="announcement">
          <Message />
        </div>
        <div class="side">
          <div class="login">
            <router-view></router-view>
          </div>
          <div class="platform-notice">
            <PlatformNoticeComponent />
          </div>
          <div class="introduction">
            <Introduction />
          </div>
        </div>
      </div>
    </div>
    <div class="foot">
      <Foot />
    </div>
  </div>
</template>

<style scoped>
.main {
  width: 100%;
  display: flex;
  flex-direction: column; /*让 flex 容器里的子元素，从上往下竖着排列*/
  align-items: center;
}

.head {
  width: 1440px;
  height: 80px;
  display: flex;
  background-color: white;
}

.logo {
  width: 480px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  overflow: hidden;
}

.logo_left {
  width: 80px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo_left img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo_right {
  width: 360px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
}

.company_name {
  cursor: pointer;
  padding: 0;
  font-size: 24px;
  font-weight: 350;
  line-height: 31px;
}

.company_n {
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  font-weight: 300;
  color: #000;
  height: 12px;
}

.time {
  width: 36%;
  height: 100%;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search {
  width: 33%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: start;
}

.search-icon {
  width: 90%;
  height: 54%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
}

.search-input {
  flex: 1;
  height: 60%;
  border: none;
  outline: none;
  padding: 0 15px;
  font-size: 16px;
}

/* 输入框内的提示文字样式 */
.search-input::placeholder {
  color: #999; /* 提示文字颜色：浅灰色 */
  font-size: 16px; /* 提示文字大小 */
}

.search-button {
  width: 16%;
  height: 100%;
}

.body {
  width: 1440px;
  display: flex;
  flex-direction: column;
}

.carousel {
  width: 100%;
  height: 380px;
}

.notice {
  width: 100%;
  height: 40px;
  opacity: 0.95;
  backdrop-filter: blur(7px);
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  padding: 10px 0 10px 28px;
}

.new {
  padding: 0;
  width: 105px;
}

.new h4 {
  padding: 0;
  font-size: 14px;
  color: #0C1390;
  font-weight: 500;
}

.new .notice-bell {
  font-size: 17px;
  color: #0C1390;
  font-weight: 500;
  vertical-align: -3px;
  margin-right: 2px;
}

.notice-content {
  padding: 0;
  font-size: 12px;
  color: #333;
  font-style: normal;
  height: 40px;
  width: 100%;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
}

.content {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.announcement {
  width: 70%;
  background-color: #f6f6f6;
}

.side{
  width: 30%;
  background-color: #f6f6f6;
  display: flex;
  flex-direction: column;
}

.login {
  width: 100%;
  min-height: 300px;
}

.platform-notice{
  width: 100%;
  min-height: 555px;
}

.introduction{
  width: 100%;
  min-height: 420px;
}

.foot{
  width: 100%;
  height: 320px;
  background-color: #e8e8e8;
}
</style>
