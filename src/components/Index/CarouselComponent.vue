<script setup lang="ts">
import { Carousel, Navigation, Pagination, Slide } from 'vue3-carousel'

const carouselConfig = {
  itemsToShow: 1,
  wrapAround: true,
  autoplay: 3000,       // 这里！全小写！
  transition: 1200,
  pauseOnHover: true, // 鼠标放上去不暂停
}

const bannerList = [
  { id: 1, imgUrl: '/1.jpg' },
  { id: 2, imgUrl: '/2.jpg' },
]
</script>

<template>
  <Carousel v-bind="carouselConfig">
    <Slide v-for="item in bannerList" :key="item.id">
      <img :src="item.imgUrl" alt="轮播图" style="width: 100%; height: 450px" />
    </Slide>
    <template #addons>
      <Navigation />
      <Pagination />
    </template>
  </Carousel>
</template>

<style scoped>

</style>
