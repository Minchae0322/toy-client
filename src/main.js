import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { tokenMonitor } from './api/interceptors.js'
import { initCapacitor } from './capacitor/bootstrap.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// 토큰 모니터링 시작 (앱 마운트 후)
tokenMonitor.start()

// 네이티브 앱(iOS/Android)에서만 동작 — 브라우저에서는 no-op
initCapacitor(router)