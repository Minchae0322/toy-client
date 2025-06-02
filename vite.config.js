import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: '/',           // 🔥 빌드 결과 경로 접두사 (nginx에 맞춰야 함)
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,              // 개발 서버 포트
    host: '0.0.0.0',         // 외부 접속 허용
    open: false
  }
})
