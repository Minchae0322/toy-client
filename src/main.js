import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { tokenMonitor } from './api/interceptors.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// 토큰 모니터링 시작 (앱 마운트 후)
tokenMonitor.start()