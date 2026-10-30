import { fileURLToPath } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

// vite.config.ts 用的是「函数式」 defineConfig(({ mode }) => ({...}))，
// 默认导出 viteConfig 是一个函数（UserConfigFnObject），不是配置对象。
// 直接把它传给 mergeConfig 会因类型不匹配（期望对象、实得函数）报 never 错误，
// 所以这里先调用它拿到实际配置对象，再展开合并 test 段。
export default defineConfig(async (configEnv) => {
  const base = await viteConfig(configEnv)
  return {
    ...base,
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }
})
