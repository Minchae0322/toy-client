import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // ✅ '@' → 'src' 경로 매핑
    }
  },
  server: {
    port: 3000,           // ✅ 개발 서버 포트
    open: true            // ✅ 자동 브라우저 열기
  }
})
