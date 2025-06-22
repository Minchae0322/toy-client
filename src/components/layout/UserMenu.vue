<template>
  <div class="user-menu">
    <div class="user-dropdown">
      <button class="user-trigger">
        <img
            :src="user?.profileImage || '/default-avatar.png'"
            :alt="user?.nickname || '사용자'"
            class="user-avatar"
        >
        <span class="user-name">{{ user?.nickname || '사용자' }}</span>
        <span v-if="isAdmin" class="admin-badge">관리자</span>
        <span class="dropdown-arrow">▼</span>
      </button>
      <div class="user-dropdown-content">
        <router-link to="/profile" class="user-link">
          👤 프로필
        </router-link>
        <router-link to="/my-posts" class="user-link">
          📝 내 게시글
        </router-link>
        <router-link to="/bookmarks" class="user-link">
          ⭐ 북마크
        </router-link>
        <router-link to="/settings" class="user-link">
          ⚙️ 설정
        </router-link>
        <hr class="menu-divider">
        <button @click="$emit('logout')" class="user-link logout">
          🚪 로그아웃
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

defineEmits(['logout'])
</script>

<style scoped>
/* 사용자 메뉴 스타일 */
</style>