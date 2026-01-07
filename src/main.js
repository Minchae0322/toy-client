import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'  // css 폴더 제거
import App from './App.vue'
import router from './router'

// 🔥 인터셉터 등록 (앱 시작 전에!)
import './api/interceptors.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')