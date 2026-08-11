<script setup lang="ts">
import logoPng from '@/assets/logo.png'
import contentBg from '@/assets/contentBg.png'
</script>

<template>
  <div
    class="intro-box idx-base"
    :style="{ backgroundImage: `url(${contentBg})` }"
  >
    <div class="title">
      <img :src="logoPng" alt="湖南全球人logo" />
      <div class="title-text">
        湖南全球人信息技术有限公司
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;（简称湖南全球人）
      </div>
    </div>
    <!-- TODO: 以下公司介绍为中国铁塔占位文案，需替换为湖南全球人实际介绍 -->
    <div class="intro-content">
      是按照中央和国务院有关要求，在国资委、工信部联合组成的铁塔公司协调组的直接领导和协调推动下，由中国移动、中国联通和中国电信共同出资设立的大型通信基础设施综合服务企业。公司主营铁塔的建设、维护和运营，兼营基站机房、电源、空调等配套设施和室内分布系统的建设、维护和运营以及基站设备的维护。公司于2014年3月26日酝酿筹建，经过三个多月周密有序的部署筹备，于7月18日顺利揭牌成立。公司实行总分架构，总部设在北京，同时在全国设立了31个省级分公司和各地市分公司。公司注册资本金为100亿元人民币由中国移动、中国联通和中国电信按三家电信企业分别按40%、30.1%和29.9%的比例出资组成...
    </div>
  </div>
</template>

<style scoped>
.intro-box {
  overflow: hidden;
  border-radius: 5px 5px 0 0;
  height: 399px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  width: 100%;
  padding: 25px 30px 24px;
}

.title {
  margin: 0 0 14px;
  display: flex;
  justify-content: center;
}

.title img {
  border: 0;
  width: auto;
  height: 20px;
  margin-right: 5px;
  margin-top: 1px;
}

.title-text {
  color: #231916;
  font-size: 20px;
  font-weight: 500;
}

.intro-content {
  width: 385px;
  height: 320px;
  color: #333;
  font-size: 14px;
  line-height: 29px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
