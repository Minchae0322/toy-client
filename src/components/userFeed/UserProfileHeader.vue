<template>
  <section class="profile-section">
    <!-- 프로필 헤더 -->
    <div class="profile-header">
      <div class="profile-left">
        <!-- 아바타 -->
        <div class="avatar-wrapper">
          <img
              v-if="userInfo.profileImageUrl"
              :src="userInfo.profileImageUrl"
              :alt="userInfo.nickname"
              class="avatar"
          />
          <div v-else class="avatar avatar-placeholder">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
            </svg>
          </div>
          <span class="level-tag">Lv.{{ userInfo.level || 1 }}</span>
        </div>

        <!-- 프로필 정보 -->
        <div class="profile-info">
          <h1 class="username">{{ userInfo.nickname || '사용자' }}</h1>
          <p v-if="userInfo.bio" class="bio">{{ userInfo.bio }}</p>
          <div class="meta-info">
            <span class="meta-text">
              <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {{ userInfo.location || '위치 미설정' }}
            </span>
            <span class="divider">·</span>
            <span class="meta-text">{{ userInfo.joinDate || '2024.01' }} 가입</span>
          </div>
        </div>
      </div>

      <!-- 팔로우 버튼 -->
      <button
          class="follow-btn"
          :class="{ active: isFollowing }"
          @click="handleFollow"
      >
        <svg v-if="!isFollowing" class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        {{ isFollowing ? '팔로잉' : '팔로우' }}
      </button>
    </div>

    <!-- 통계 바 -->
    <div class="stats-bar">
      <div class="stat">
        <span class="stat-value">{{ userStats.feeds || 0 }}</span>
        <span class="stat-label">게시물</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ formatNumber(userStats.followers) }}</span>
        <span class="stat-label">팔로워</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ formatNumber(userStats.following) }}</span>
        <span class="stat-label">팔로잉</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ formatNumber(userStats.totalLikes) }}</span>
        <span class="stat-label">좋아요</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  },
  userStats: {
    type: Object,
    required: true
  },
  isFollowing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['follow']);

const handleFollow = () => {
  emit('follow');
};

const formatNumber = (num) => {
  if (!num) return 0;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num;
};
</script>

<style scoped>
/* ==================== 프로필 섹션 ==================== */
.profile-section {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #DBDBDB;
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .profile-section {
    padding: 24px 32px 20px;
  }
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .profile-section {
    padding: 32px 40px 24px;
  }
}

/* ==================== 프로필 헤더 ==================== */
.profile-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

/* 태블릿 이상: 가로 레이아웃 */
@media (min-width: 768px) {
  .profile-header {
    flex-direction: row;
    align-items: flex-start;
    gap: 32px;
    margin-bottom: 20px;
  }
}

/* ==================== 프로필 왼쪽 (아바타 + 정보) ==================== */
.profile-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

/* 태블릿 이상: 가로 레이아웃 */
@media (min-width: 768px) {
  .profile-left {
    flex-direction: row;
    align-items: flex-start;
    gap: 24px;
  }
}

/* ==================== 아바타 ==================== */
.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 77px;
  height: 77px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #DBDBDB;
}

/* 태블릿 */
@media (min-width: 768px) {
  .avatar {
    width: 110px;
    height: 110px;
  }
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .avatar {
    width: 150px;
    height: 150px;
  }
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667EEA, #764BA2);
  color: white;
}

.avatar-placeholder svg {
  width: 40%;
  height: 40%;
}

/* 레벨 태그 */
.level-tag {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 8px;
  background: #F97316;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 10px;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .level-tag {
    font-size: 11px;
    padding: 3px 10px;
  }
}

/* ==================== 프로필 정보 ==================== */
.profile-info {
  flex: 1;
  min-width: 0;
  text-align: center;
}

/* 태블릿 이상: 왼쪽 정렬 */
@media (min-width: 768px) {
  .profile-info {
    text-align: left;
  }
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

/* 태블릿 */
@media (min-width: 768px) {
  .username {
    font-size: 22px;
    font-weight: 400;
    margin-bottom: 6px;
  }
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .username {
    font-size: 28px;
    margin-bottom: 8px;
  }
}

.bio {
  font-size: 13px;
  color: #262626;
  line-height: 1.5;
  margin-bottom: 8px;
  word-break: break-word;
}

@media (min-width: 768px) {
  .bio {
    font-size: 14px;
  }
}

/* 메타 정보 */
.meta-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #737373;
}

/* 태블릿 이상: 왼쪽 정렬 */
@media (min-width: 768px) {
  .meta-info {
    justify-content: flex-start;
    font-size: 13px;
  }
}

.meta-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .meta-icon {
    width: 14px;
    height: 14px;
  }
}

.divider {
  color: #DBDBDB;
}

/* ==================== 팔로우 버튼 ==================== */
.follow-btn {
  width: 100%;
  height: 32px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #0095F6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

/* 태블릿 이상: 고정 너비 */
@media (min-width: 768px) {
  .follow-btn {
    width: auto;
    min-width: 120px;
  }
}

.follow-btn:hover {
  background: #1877F2;
}

.follow-btn.active {
  background: transparent;
  color: #262626;
  border: 1px solid #DBDBDB;
}

.follow-btn.active:hover {
  background: #FAFAFA;
}

.follow-btn .icon {
  width: 16px;
  height: 16px;
}

/* ==================== 통계 바 ==================== */
.stats-bar {
  display: flex;
  justify-content: space-around;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #EFEFEF;
}

/* 태블릿 이상 */
@media (min-width: 768px) {
  .stats-bar {
    justify-content: flex-start;
    gap: 40px;
    padding-top: 16px;
  }
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .stats-bar {
    gap: 48px;
    padding-top: 20px;
  }
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

/* 태블릿 이상: 가로 레이아웃 */
@media (min-width: 768px) {
  .stat {
    flex-direction: row;
    gap: 4px;
    align-items: baseline;
  }
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #262626;
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .stat-value {
    font-size: 15px;
    font-weight: 600;
  }
}

.stat-label {
  font-size: 12px;
  color: #737373;
  font-weight: 400;
}

/* 데스크탑 */
@media (min-width: 1024px) {
  .stat-label {
    font-size: 14px;
  }
}

/* ==================== 애니메이션 ==================== */
.profile-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 터치 최적화 ==================== */
@media (hover: none) and (pointer: coarse) {
  .follow-btn {
    min-height: 44px;
  }
}

/* ==================== 작은 모바일 (320px) ==================== */
@media (max-width: 375px) {
  .profile-section {
    padding: 12px;
  }

  .username {
    font-size: 16px;
  }

  .bio {
    font-size: 12px;
  }

  .stats-bar {
    gap: 12px;
  }

  .stat-label {
    font-size: 11px;
  }
}

/* ==================== 큰 데스크탑 (1440px+) ==================== */
@media (min-width: 1440px) {
  .profile-section {
    padding: 40px 48px 28px;
  }

  .username {
    font-size: 32px;
  }
}
</style>