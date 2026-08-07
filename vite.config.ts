import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  build: {
    outDir: 'static',
  },

  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 80,
    proxy: {
      '/api': {
        target: 'https://www.globeman.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        // rewrite: (path) => path.replace(/^\/api/, ''),
        // 调试：打印每个接口请求的真实转发地址
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            console.log(
              ' 代理转发真实地址：',
              proxyReq.protocol + '//' + proxyReq.host + proxyReq.path,
            )
          })
        },
      },
    },
  },

  plugins: [vue(), vueJsx(), vueDevTools()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
