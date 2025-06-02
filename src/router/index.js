import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import OAuthCallback from '@/views/OAuth2Callback.vue'
import OneMouthView from "@/views/OneMouthView.vue"; // ✅ 콜백 컴포넌트

const routes = [
  { path: '/login', component: LoginView },
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/oauth/callback', component: OAuthCallback }, // ✅ 소셜 로그인 콜백 경로
  { path: '/sell', component: OneMouthView, meta: { requiresAuth: false } } // ✅ 새 페이지 추가
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
