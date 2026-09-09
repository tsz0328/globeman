<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Carousel, Navigation, Pagination, Slide } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'
import { getCarouselListApi, type CarouselItem } from '@/api/platform/CarouselApi'

const carouselConfig = {
  itemsToShow: 1,
  wrapAround: true,
  autoplay: 3000, // 自动播放间隔(ms)
  transition: 1200,
  pauseOnHover: true, // 鼠标悬停时暂停自动播放
}

// 与项目约定一致：后端图片为相对路径时拼 /api 前缀，完整 http(s) 地址则原样使用
const getImageUrl = (imgPath: string): string => {
  if (!imgPath) return ''
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath
  return imgPath.startsWith('/') ? `/api${imgPath}` : `/api/${imgPath}`
}

const bannerList = ref<CarouselItem[]>([])

const fetchBanners = async () => {
  try {
    const res = await getCarouselListApi()
    if (res.code === 200 && Array.isArray(res.data)) {
      // 过滤掉已停用(status=1)的轮播图，只展示启用项（含历史无 status 字段的旧图）
      // 再按 sort 升序，保证轮播顺序稳定（后端未保证顺序时也能正常显示）
      bannerList.value = [...res.data]
        .filter((item) => item.status !== 1)
        .sort((a, b) => a.sort - b.sort)
    }
  } catch (e) {
    console.error('获取首页轮播图失败:', e)
  }
}

onMounted(fetchBanners)
</script>

<template>
  <Carousel v-bind="carouselConfig">
    <Slide v-for="(item, idx) in bannerList" :key="item.url || idx">
      <img
        :src="getImageUrl(item.url)"
        alt="轮播图"
        style="width: 100%; height: 100%; object-fit: cover"
      />
    </Slide>
    <template #addons>
      <Navigation />
      <Pagination />
    </template>
  </Carousel>
</template>

<style scoped>
/* 让库读取高度，与 IndexView 外层 .carousel 的 450px 对齐，避免图片显示不全 */
:deep(.carousel) {
  height: 450px;
}
</style>
