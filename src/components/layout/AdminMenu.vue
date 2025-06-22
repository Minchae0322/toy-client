<template>
  <div class="admin-menu">
    <div class="admin-dropdown">
      <button class="admin-trigger">
        🛠️ 관리자
        <span class="dropdown-arrow">▼</span>
      </button>
      <div class="admin-dropdown-content">
        <router-link :to="{ name: 'CategoryAdmin' }" class="admin-link">
          📂 카테고리 관리
        </router-link>
        <router-link to="/admin/users" class="admin-link">
          👥 사용자 관리
        </router-link>
        <router-link to="/admin/reports" class="admin-link">
          📊 신고 관리
        </router-link>
        <router-link to="/admin/analytics" class="admin-link">
          📈 통계 분석
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// 컴포넌트 로직
</script>

<style scoped>
/* 관리자 메뉴 스타일 */
</style>