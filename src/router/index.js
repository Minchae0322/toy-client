import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@/router/guards/authGuard.js'

// Views import
import LoginView from '@/views/LoginView.vue'

import HomeView from '@/views/HomeView.vue'
import OAuthCallback from '@/views/OAuth2Callback.vue'
import OneMouthView from '@/views/OneMouthView.vue'
import OneMouthListView from "@/views/OneMouthListView.vue"
import OneMouthDetailView from "@/views/OneMouthDetailView.vue"
import CategoryAdminView from "@/views/CategoryAdminView.vue"

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },

  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/oauth/callback',
    name: 'OAuthCallback',
    component: OAuthCallback
  },
  {
    path: '/sell',
    name: 'Sell',
    component: OneMouthView,
    meta: { requiresAuth: false }
  },
  {
    path: '/one-mouth/list',
    name: 'OneMouthList',
    component: OneMouthListView,
    meta: { requiresAuth: true }
  },
  {
    path: '/one-mouth/detail',
    name: 'OneMouthDetail',
    component: OneMouthDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/category',
    name: 'CategoryAdmin',
    component: CategoryAdminView,
    meta: {
      requiresAuth: false,
      requiresAdmin: false,
      title: '카테고리 관리'
    }
  },
  {
    path: '/',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 가드 적용
router.beforeEach(authGuard)

export default router