import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // 환경변수 로드 (현재 디렉토리에서)
  const env = loadEnv(mode, process.cwd(), '')

  // Proxy 타겟 URL (환경변수 또는 기본값)
  const proxyTargets = {
    auth: env.VITE_PROXY_AUTH_TARGET || 'http://localhost:8081',
    content: env.VITE_PROXY_CONTENT_TARGET || 'http://localhost:8082',
    user: env.VITE_PROXY_USER_TARGET || 'http://localhost:8083',
    chat: env.VITE_PROXY_CHAT_TARGET || 'http://localhost:8084',
  }

  console.log(`\n🔧 Vite Dev Server Proxy Configuration:`)
  console.log(`   Environment: ${env.VITE_ENV_NAME || 'local'}`)
  console.log(`   Auth:    ${proxyTargets.auth}`)
  console.log(`   Content: ${proxyTargets.content}`)
  console.log(`   User:    ${proxyTargets.user}`)
  console.log(`   Chat:    ${proxyTargets.chat}\n`)

  return {
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
      // MSA 환경 프록시 설정 (환경변수 기반)
      proxy: {
        // 채팅 서비스 WebSocket 프록시
        '^/api/ws': {
          target: proxyTargets.chat,
          changeOrigin: true,
          ws: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err)
            })
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url)
            })
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url)
            })
          }
        },
        // 채팅 API 프록시
        '^/api/chat': {
          target: proxyTargets.chat,
          changeOrigin: true,
        },
        // OAuth2 API 프록시 (인증 서버로)
        '^/api/oauth2': {
          target: proxyTargets.auth,
          changeOrigin: true,
        },
        // 인증 API 프록시
        '^/api/auth': {
          target: proxyTargets.auth,
          changeOrigin: true,
        },
        // 컨텐츠 API 프록시
        '^/api/content': {
          target: proxyTargets.content,
          changeOrigin: true,
        },
        // 사용자 API 프록시
        '^/api/users': {
          target: proxyTargets.user,
          changeOrigin: true,
        },
        // 기타 API들은 컨텐츠 서버로 (기본)
        '^/api': {
          target: proxyTargets.content,
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
          // CDN 캐시 전략: 파일명에 해시 포함
          entryFileNames: 'js/[name].[hash].js',
          chunkFileNames: 'js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            // 확장자별 폴더 분리
            const ext = assetInfo.name?.split('.').pop() || ''
            if (/css/i.test(ext)) {
              return 'css/[name].[hash].[ext]'
            }
            if (/png|jpe?g|gif|svg|webp|ico/i.test(ext)) {
              return 'images/[name].[hash].[ext]'
            }
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return 'fonts/[name].[hash].[ext]'
            }
            return 'assets/[name].[hash].[ext]'
          },
          globals: {
            'sockjs-client': 'SockJS'
          }
        }
      }
    }
  }
})
