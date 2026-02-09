import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { tokenMonitor } from './api/interceptors.js'
import { useAuthStore } from './stores/auth.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 🔒 앱 초기화 시 토큰 재발급 (새로고침 대응)
// Refresh Token은 HttpOnly 쿠키에 있으므로 /reissue API 호출
const authStore = useAuthStore()
authStore.initializeAuth().then(() => {
    console.log('✅ [Main] 인증 초기화 완료')
}).catch((error) => {
    console.log('ℹ️ [Main] 비로그인 상태로 시작:', error?.message)
})

app.mount('#app')

// 토큰 모니터링 시작 (앱 마운트 후)
tokenMonitor.start()