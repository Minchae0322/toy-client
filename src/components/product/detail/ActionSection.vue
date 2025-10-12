<template>
  <div class="action-section">
    <!-- 로그인 안내 -->
    <div v-if="!isLoggedIn" class="login-notice">
      <div class="login-notice-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 6.66667V10" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 13.3333H10.0083" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="login-notice-content">
        <span class="login-notice-text">로그인하시면 찜하기, 리뷰 작성 등 더 많은 기능을 이용할 수 있습니다</span>
        <router-link to="/login" class="login-link">로그인하기</router-link>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="action-buttons">
      <button
          class="action-btn bookmark-btn"
          :class="{
          active: isLoggedIn && userReaction.hasBookmark,
          disabled: !isLoggedIn
        }"
          @click="$emit('bookmark')"
          :disabled="actionLoading || !isLoggedIn"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M14.1667 17.5L10 13.3333L5.83333 17.5V4.16667C5.83333 3.72464 6.00893 3.30072 6.32149 2.98816C6.63405 2.67559 7.05797 2.5 7.5 2.5H12.5C12.942 2.5 13.366 2.67559 13.6785 2.98816C13.9911 3.30072 14.1667 3.72464 14.1667 4.16667V17.5Z" :stroke="isLoggedIn && userReaction.hasBookmark ? 'white' : 'currentColor'" :fill="isLoggedIn && userReaction.hasBookmark ? 'white' : 'none'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ isLoggedIn ? (userReaction.hasBookmark ? '찜 완료' : '찜하기') : '찜하기' }}</span>
      </button>

      <button class="action-btn share-btn" @click="$emit('share')">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 6.66667C16.3807 6.66667 17.5 5.54738 17.5 4.16667C17.5 2.78595 16.3807 1.66667 15 1.66667C13.6193 1.66667 12.5 2.78595 12.5 4.16667C12.5 5.54738 13.6193 6.66667 15 6.66667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 12.5C6.38071 12.5 7.5 11.3807 7.5 10C7.5 8.61929 6.38071 7.5 5 7.5C3.61929 7.5 2.5 8.61929 2.5 10C2.5 11.3807 3.61929 12.5 5 12.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15 18.3333C16.3807 18.3333 17.5 17.214 17.5 15.8333C17.5 14.4526 16.3807 13.3333 15 13.3333C13.6193 13.3333 12.5 14.4526 12.5 15.8333C12.5 17.214 13.6193 18.3333 15 18.3333Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7.15833 11.175L12.85 14.6583" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12.8417 5.34167L7.15833 8.825" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>공유</span>
      </button>
    </div>

    <!-- 로그인한 사용자 리액션 버튼 -->
    <div v-if="isLoggedIn" class="reaction-buttons">
      <button
          class="reaction-btn"
          :class="{ active: userReaction.hasLike }"
          @click="$emit('like')"
          :disabled="actionLoading"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4.66667 14.6667H3.33333C2.97971 14.6667 2.64057 14.5262 2.39052 14.2761C2.14048 14.0261 2 13.687 2 13.3333V8.66667C2 8.31304 2.14048 7.97391 2.39052 7.72386C2.64057 7.47381 2.97971 7.33333 3.33333 7.33333H4.66667M9.33333 6V3.33333C9.33333 2.8029 9.12262 2.29419 8.74755 1.91912C8.37247 1.54405 7.86377 1.33333 7.33333 1.33333L4.66667 7.33333V14.6667H11.8067C12.1189 14.6703 12.4211 14.5599 12.6561 14.3557C12.8912 14.1514 13.0427 13.867 13.08 13.5567L13.9867 7.55667C14.0102 7.37329 13.9951 7.18711 13.9424 7.00988C13.8896 6.83266 13.8004 6.66859 13.6806 6.52858C13.5609 6.38857 13.4133 6.27576 13.2474 6.19744C13.0815 6.11912 12.9011 6.07708 12.7183 6.07333H9.33333Z" :stroke="userReaction.hasLike ? '#059669' : 'currentColor'" :fill="userReaction.hasLike ? '#ECFDF5' : 'none'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ userReaction.hasLike ? '좋아함' : '좋아요' }}</span>
      </button>

      <button
          class="reaction-btn"
          :class="{ active: userReaction.hasInterest }"
          @click="$emit('interest')"
          :disabled="actionLoading"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.33334L10.06 5.50668L14.6667 6.18001L11.3333 9.42668L12.12 14.0133L8 11.8467L3.88 14.0133L4.66667 9.42668L1.33333 6.18001L5.94 5.50668L8 1.33334Z" :stroke="userReaction.hasInterest ? '#059669' : 'currentColor'" :fill="userReaction.hasInterest ? '#ECFDF5' : 'none'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ userReaction.hasInterest ? '관심있음' : '관심상품' }}</span>
      </button>

      <button
          class="reaction-btn"
          :class="{ active: userReaction.hasWish }"
          @click="$emit('wish')"
          :disabled="actionLoading"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13.8933 4.30668C13.7216 3.90582 13.4683 3.54392 13.15 3.24334C12.8327 2.94092 12.4583 2.70467 12.05 2.54834C11.6272 2.38667 11.1771 2.30334 10.7233 2.30334C10.0867 2.30334 9.465 2.46834 8.91667 2.78168C8.78333 2.85501 8.65667 2.93501 8.53667 3.02168C8.41667 2.93501 8.29 2.85501 8.15667 2.78168C7.60833 2.46834 6.98667 2.30334 6.35 2.30334C5.89 2.30334 5.44667 2.38668 5.02333 2.54834C4.61333 2.70501 4.24333 2.93834 3.92333 3.24334C3.60447 3.54349 3.35101 3.90545 3.17933 4.30668C3.00199 4.72249 2.91145 5.16845 2.91333 5.61834C2.91333 6.05168 2.99667 6.50168 3.16333 6.95834C3.30333 7.34501 3.50667 7.74168 3.76667 8.13834C4.16667 8.74168 4.71 9.36168 5.37667 9.98168C6.40333 10.9383 7.41667 11.6317 7.46 11.665L8.03667 12.0317C8.31 12.2217 8.76 12.2217 9.03333 12.0317L9.61 11.665C9.65333 11.6283 10.6633 10.9383 11.6933 9.98168C12.36 9.36168 12.9033 8.74168 13.3033 8.13834C13.5633 7.74168 13.77 7.34501 13.9067 6.95834C14.0733 6.50168 14.1567 6.05168 14.1567 5.61834C14.16 5.16668 14.0733 4.72168 13.8933 4.30668Z" :stroke="userReaction.hasWish ? '#059669' : 'currentColor'" :fill="userReaction.hasWish ? '#ECFDF5' : 'none'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>{{ userReaction.hasWish ? '위시리스트' : '위시리스트 추가' }}</span>
      </button>
    </div>

    <!-- 통계 정보 -->
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-number">{{ product.reviewCount || 0 }}</div>
        <div class="stat-label">리뷰</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ formatCount(product.viewCount) }}</div>
        <div class="stat-label">조회수</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ formatCount(product.likeCount) }}</div>
        <div class="stat-label">찜</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ formatCount(product.interestCount || 0) }}</div>
        <div class="stat-label">관심</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { productUtils } from '@/services/ProductService.js'

const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    required: true
  },
  product: {
    type: Object,
    required: true
  },
  userReaction: {
    type: Object,
    required: true
  },
  actionLoading: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['bookmark', 'share', 'like', 'interest', 'wish'])

const formatCount = (count) => productUtils.formatCount(count)
</script>

<style scoped>
.action-section {
  padding: 32px;
  border-bottom: 1px solid #F3F4F6;
  background: #FAFAFA;
}

/* 로그인 안내 */
.login-notice {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #ECFDF5;
  border-radius: 12px;
  border: 1px solid #D1FAE5;
}

.login-notice-icon {
  flex-shrink: 0;
}

.login-notice-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.login-notice-text {
  flex: 1;
  font-size: 14px;
  color: #065F46;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.01em;
  min-width: 200px;
}

.login-link {
  padding: 8px 16px;
  background: #059669;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.login-link:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

/* 액션 버튼 */
.action-buttons {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: 2px solid #E5E7EB;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-size: 15px;
  background: white;
  color: #374151;
  letter-spacing: -0.01em;
}

.action-btn:hover:not(:disabled):not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.bookmark-btn {
  border-color: #059669;
  color: #059669;
}

.bookmark-btn:hover:not(:disabled):not(.disabled) {
  background: #F0FDF4;
  border-color: #047857;
}

.bookmark-btn.active {
  background: #059669;
  color: white;
  border-color: #059669;
}

.bookmark-btn.active:hover {
  background: #047857;
  border-color: #047857;
}

.share-btn {
  border-color: #D1D5DB;
  color: #6B7280;
}

.share-btn:hover:not(:disabled) {
  background: #F9FAFB;
  border-color: #9CA3AF;
  color: #374151;
}

.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #F9FAFB;
  color: #9CA3AF;
  border-color: #E5E7EB;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 리액션 버튼 */
.reaction-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

.reaction-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.reaction-btn:hover:not(:disabled) {
  border-color: #059669;
  color: #059669;
  background: #F9FAFB;
}

.reaction-btn.active {
  border-color: #059669;
  background: #ECFDF5;
  color: #059669;
}

.reaction-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 통계 그리드 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
  padding: 16px 12px;
  background: white;
  border-radius: 10px;
  border: 1px solid #F3F4F6;
  transition: all 0.2s;
}

.stat-item:hover {
  border-color: #E5E7EB;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.stat-number {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 13px;
  color: #6B7280;
  font-weight: 600;
  letter-spacing: -0.01em;
}

@media (max-width: 768px) {
  .action-section {
    padding: 24px;
  }

  .login-notice {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .login-notice-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .login-notice-text {
    min-width: auto;
  }

  .login-link {
    align-self: stretch;
    text-align: center;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .reaction-buttons {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .action-section {
    padding: 20px;
  }

  .login-notice {
    padding: 14px;
  }

  .login-notice-text {
    font-size: 13px;
  }

  .action-btn {
    padding: 12px 16px;
    font-size: 14px;
  }

  .reaction-btn {
    font-size: 12px;
    padding: 9px 10px;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .stat-item {
    padding: 12px 8px;
  }

  .stat-number {
    font-size: 18px;
  }

  .stat-label {
    font-size: 11px;
  }
}
</style>