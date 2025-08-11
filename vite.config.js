// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    // SockJS global 에러 해결
    global: 'globalThis',
  },
  server: {
    // MSA 환경 프록시 설정
    proxy: {
      // 채팅 서비스 WebSocket 프록시 (8084)
      '/api/ws': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        ws: true, // WebSocket 프록시 활성화
      },
      // 채팅 API 프록시 (8084)
      '/api/chat': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
      // 인증 API 프록시 (8081)
      '/api/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      // 컨텐츠 API 프록시 (8082)
      '/api/content': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      // 사용자 API 프록시 (8083)
      '/api/users': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      // 기타 API들은 컨텐츠 서버로 (기본)
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      }
    }
  },
  optimizeDeps: {
    include: [
      '@stomp/stompjs',
      'sockjs-client'
    ]
  },
  build: {
    rollupOptions: {
      output: {
        globals: {
          'sockjs-client': 'SockJS'
        }
      }
    }
  }
})