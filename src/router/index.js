import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import HomeView from '@/views/HomeView.vue'
import OAuthCallback from '@/views/OAuth2Callback.vue'
import OneMouthView from '@/views/OneMouthView.vue'
import OneMouthListView from "@/views/OneMouthListView.vue"; // ✅ 판매 글 작성

const routes = [
  { path: '/login', component: LoginView },
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/home', component: HomeView, meta: { requiresAuth: true } },
  { path: '/oauth/callback', component: OAuthCallback }, // ✅ 소셜 로그인 콜백
  { path: '/sell', component: OneMouthView, meta: { requiresAuth: false } }, // ✅ 판매 페이지
  { path: '/one-mouth/list', component: OneMouthListView, meta: { requiresAuth: false } }
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
