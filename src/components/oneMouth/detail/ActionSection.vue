<template>
  <div class="action-section">
    <!-- 로그인 안내 -->
    <div v-if="!isLoggedIn" class="login-notice">
      <div class="login-notice-content">
        <span>💡</span>
        <span>로그인하시면 찜하기, 리뷰 작성 등 더 많은 기능을 이용할 수 있어요!</span>
        <router-link to="/login" class="login-link">로그인하기</router-link>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="action-buttons">
      <button
          class="action-btn"
          :class="{
          primary: isLoggedIn && userReaction.hasBookmark,
          secondary: !isLoggedIn || !userReaction.hasBookmark,
          disabled: !isLoggedIn
        }"
          @click="$emit('bookmark')"
          :disabled="actionLoading"
      >
        {{ isLoggedIn
          ? (userReaction.hasBookmark ? '💖 찜했음' : '❤️ 찜하기')
          : '❤️ 찜하기 (로그인 필요)'
        }}
      </button>
      <button class="action-btn secondary" @click="$emit('share')">
        📤 공유
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
        👍 {{ userReaction.hasLike ? '좋아함' : '좋아요' }}
      </button>
      <button
          class="reaction-btn"
          :class="{ active: userReaction.hasInterest }"
          @click="$emit('interest')"
          :disabled="actionLoading"
      >
        🌟 {{ userReaction.hasInterest ? '관심있음' : '관심상품' }}
      </button>
      <button
          class="reaction-btn"
          :class="{ active: userReaction.hasWish }"
          @click="$emit('wish')"
          :disabled="actionLoading"
      >
        🎁 {{ userReaction.hasWish ? '위시리스트' : '위시리스트 추가' }}
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
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.login-notice {
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #e0f2fe, #f0f9ff);
  border-radius: 12px;
  border-left: 4px solid #1DCD9F;
}

.login-notice-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.login-notice-content span:first-child {
  font-size: 20px;
}

.login-notice-content span:nth-child(2) {
  flex: 1;
  font-size: 14px;
  color: #0369a1;
}

.login-link {
  padding: 6px 16px;
  background: #1DCD9F;
  color: white;
  text-decoration: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s;
  white-space: nowrap;
}

.login-link:hover {
  background: #169976;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: 2px solid #1DCD9F;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-size: 14px;
}

.action-btn.primary {
  background: #1DCD9F;
  color: white;
}

.action-btn.secondary {
  background: white;
  color: #1DCD9F;
}

.action-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f1f5f9;
  color: #94a3b8;
  border-color: #e2e8f0;
}

.action-btn:hover:not(:disabled):not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 205, 159, 0.3);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-btn:focus {
  outline: 2px solid #1DCD9F;
  outline-offset: 2px;
}

.reaction-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.reaction-btn {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  flex: 1;
  min-width: 120px;
}

.reaction-btn:hover:not(:disabled) {
  border-color: #1DCD9F;
  color: #1DCD9F;
}

.reaction-btn.active {
  border-color: #1DCD9F;
  background: #f0fdfa;
  color: #065f46;
}

.reaction-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reaction-btn:focus {
  outline: 2px solid #1DCD9F;
  outline-offset: 2px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #222222;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .action-section {
    padding: 20px;
  }

  .login-notice-content {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: 8px;
  }

  .login-link {
    align-self: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .reaction-buttons {
    flex-direction: column;
  }

  .reaction-btn {
    min-width: auto;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .login-notice-content span:nth-child(2) {
    font-size: 13px;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .stat-item {
    padding: 8px;
  }

  .stat-number {
    font-size: 16px;
  }

  .stat-label {
    font-size: 10px;
  }
}
</style>