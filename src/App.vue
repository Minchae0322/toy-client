<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const isAuthPage = computed(() =>
  ['/login', '/register'].includes(route.path)
)
</script>

<template>
  <header v-if="!isAuthPage" class="app-header">
    <nav class="main-nav">
      <RouterLink to="/login">로그인</RouterLink>
      <RouterLink to="/register">회원가입</RouterLink>
    </nav>
  </header>

  <main :class="['app-main', { 'no-padding': isAuthPage }]">
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.logo {
  display: block;
}

.main-nav a {
  margin-left: 1rem;
  font-weight: bold;
  text-decoration: none;
  color: #333;
}

.main-nav a.router-link-exact-active {
  color: #42b983;
}

.app-main {
  padding: 2rem;
}

.app-main.no-padding {
  padding: 0;
}
</style>
