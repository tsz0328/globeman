import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// 代理环境切换：通过 .env 的 VITE_PROXY_MODE 控制，切环境只需改这一个变量。
//   local（默认） → 连本地后端 http://localhost:8080，转发前摘掉 /api 前缀
//   prod         → 连线上     https://www.globeman.cn，保留 /api 前缀（由生产反代摘掉）
// target 与 rewrite 由同一个开关推导，避免「只切一个」导致 404 / 写生产库。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = (env.VITE_PROXY_MODE ?? 'local') === 'prod'

  const apiProxy = isProd
    ? {
        target: 'https://www.globeman.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path,
      }
    : {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      }

  return {
    build: {
      outDir: 'static',
    },

    server: {
      allowedHosts: true,
      host: '0.0.0.0',
      port: 80,
      proxy: {
        '/api': apiProxy,
      },
    },

    plugins: [vue(), vueJsx(), vueDevTools()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
