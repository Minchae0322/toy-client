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
      // 채팅 서비스 WebSocket 프록시 (8084) - 가장 구체적인 패턴을 위에
      '^/api/ws': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        ws: true, // WebSocket 프록시 활성화
        secure: false,
        // SockJS 관련 모든 요청을 포함
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      // 채팅 API 프록시 (8084)
      '^/api/chat': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
      // 인증 API 프록시 (8081)
      '^/api/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      // 컨텐츠 API 프록시 (8082)
      '^/api/content': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      // 사용자 API 프록시 (8083)
      '^/api/users': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      // 기타 API들은 컨텐츠 서버로 (기본) - 가장 마지막에
      '^/api': {
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