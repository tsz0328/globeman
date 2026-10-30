<template>
  <span>{{ display }}</span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{ value: number; duration?: number }>(),
  { duration: 800 },
)

const display = ref('0')
let raf = 0

function animate(to: number) {
  cancelAnimationFrame(raf)
  const from = 0
  const start = performance.now()
  const dur = props.duration
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / dur)
    const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
    const val = Math.round(from + (to - from) * eased)
    display.value = val.toLocaleString()
    if (t < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

onMounted(() => animate(props.value))
watch(
  () => props.value,
  (v) => animate(v),
)
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>
