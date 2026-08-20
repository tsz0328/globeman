<script setup lang="ts">
import { Phone, Message } from '@element-plus/icons-vue'
</script>

<template>
  <div class="footer-box idx-base">
    <div class="footer-content">
      <div class="top">
        <div class="left">
          <div class="contact-us">
            <p class="contact-us-text">联系我们</p>
            <!-- TODO: 以下联系方式为中国铁塔占位数据，需替换为湖南全球人实际信息 -->
            <p class="contact-us-text">010 - 56592233</p>
          </div>
          <div class="contact-method">
            <div class="contact-method-item first-width">
              <h5>业务支撑</h5>
              <p class="contact-method-text">
                <span>业务流程</span><span>|</span><span>业务规则</span>
              </p>
              <p class="phone-num">
                <el-icon><Phone /></el-icon>
                010-56592233转2
              </p>
              <p class="email">
                <el-icon><Message /></el-icon>
                top-yunying@chinatowercom.cn
              </p>
            </div>
            <div class="contact-method-item normal-width">
              <h5>投诉建议</h5>
              <p class="contact-method-text">
                <span>欠款清理申诉</span>
              </p>
              <p class="phone-num">
                <el-icon><Phone /></el-icon>
                010-56592233转3
              </p>
              <p class="email">
                <el-icon><Message /></el-icon>
                tousu@chinatowercom.cn
              </p>
            </div>
            <div class="contact-method-item normal-width">
              <h5>系统支撑</h5>
              <p class="contact-method-text">
                <span>系统操作</span>
              </p>
              <p class="phone-num">
                <el-icon><Phone /></el-icon>
                010-56592233转1
              </p>
            </div>
          </div>
        </div>
        <div class="right">
          <!-- TODO: 替换为实际二维码图片 -->
          <div class="code-item">
            <div class="qr-placeholder"></div>
            <p>铁塔官方微信公众号</p>
            <p>扫一扫随时掌握最新动态</p>
          </div>
          <div class="code-item">
            <div class="qr-placeholder"></div>
            <p>铁塔MOA</p>
          </div>
        </div>
      </div>
      <div class="bottom">
        <div class="bottom-box">
          <!-- TODO: 版权信息需替换为湖南全球人 -->
          <p class="text">版权所有 © 中国铁塔股份有限公司</p>
          <p class="text jump">铁塔官网：www.china-tower.com</p>
          <p class="text">京ICP备14039488号</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.footer-box {
  height: 290px;
  background: #e8e8e8;
  margin: 10px 0 0;
  padding: 20px 0 0;
  color: #181818;
  width: 100%;
}

.footer-content {
  color: #181818;
  max-width: 1410px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
  background: #e8e8e8;
}

.top {
  display: flex;
  justify-content: center;
}

.bottom {
  margin: 18px 0 0;
  display: flex;
  justify-content: center;
}

.left {
  width: calc(100% - 593px);
  max-width: 978px;
  height: 236px;
  border-bottom: 1px solid #000;
}

.right {
  margin: 0 88px 0 0;
  width: 390px;
  height: 236px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  border-bottom: 1px solid #000;
}

.contact-us {
  margin: 0 0 11px;
}

.contact-method {
  display: flex;
}

.contact-us-text {
  margin: 0 0 4px;
  color: #181818;
  font-size: 24px;
  font-weight: 700;
}

.first-width {
  min-width: 250px;
  width: 33.33%;
  max-width: 326px;
  height: 122px;
  font-size: 14px;
}

.normal-width {
  min-width: 210px;
  width: 33.33%;
  max-width: 326px;
  height: 122px;
  font-size: 14px;
}

.contact-method-item h5 {
  font-size: 14px;
  margin-bottom: 4px;
}

.contact-method-text {
  font-size: 14px;
  margin-bottom: 4px;
}

.contact-method-text span {
  margin-right: 4px;
}

.phone-num,
.email {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
}

.code-item {
  font-size: 14px;
  margin: 0 0 8px;
  width: 163px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-placeholder {
  width: 163px;
  height: 163px;
  margin-bottom: 8px;
  background: #d3d1c7;
  border: 1px dashed #888780;
}

.code-item p {
  font-size: 14px;
  line-height: 24px;
}

.bottom-box {
  display: flex;
}

.text {
  font-size: 12px;
  color: #3e3e40;
}

.jump {
  font-size: 12px;
  color: #3e3e40;
  cursor: pointer;
  margin: 0 34px;
}
</style>
