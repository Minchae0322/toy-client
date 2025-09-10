<template>
  <div
      class="trade-item-card"
      :class="[
      `view-${viewMode}`,
      {
        'own-trade': isOwnTrade,
        'urgent': trade.isUrgent,
        'featured': trade.isFeatured
      }
    ]"
  >
    <!-- 이미지 영역 -->
    <div class="trade-image">
      <img
          :src="trade.imageUrl || '/placeholder-trade.jpg'"
          :alt="trade.title"
          class="trade-img"
          @error="handleImageError"
          loading="lazy"
      />

      <!-- 상품 상태 뱃지 -->
      <div class="condition-badge" :class="trade.condition">
        {{ getConditionText(trade.condition) }}
      </div>

      <!-- 긴급/특별 뱃지 -->
      <div v-if="trade.isUrgent" class="urgent-badge">🔥 급매</div>
      <div v-if="trade.isFeatured" class="featured-badge">⭐ 추천</div>

      <!-- 이미지 개수 표시 -->
      <div v-if="trade.imageCount > 1" class="image-count">
        📷 {{ trade.imageCount }}
      </div>
    </div>

    <!-- 정보 영역 -->
    <div class="trade-info">
      <!-- 가격 정보 -->
      <div class="price-section">
        <div class="trade-price">{{ formatPrice(trade.price) }}</div>
        <div v-if="trade.originalPrice && trade.originalPrice > trade.price" class="original-price">
          {{ formatPrice(trade.originalPrice) }}
        </div>
        <div v-if="discountRate > 0" class="discount-rate">
          {{ discountRate }}% 할인
        </div>
      </div>

      <!-- 제목과 설명 -->
      <div class="trade-title">{{ trade.title }}</div>
      <div v-if="trade.description && viewMode === 'grid'" class="trade-description">
        {{ truncateText(trade.description, 60) }}
      </div>

      <!-- 상품 정보 -->
      <div class="trade-meta">
        <div class="meta-item">
          <span class="meta-label">수량</span>
          <span class="meta-value">{{ trade.quantity }}{{ trade.unit || '개' }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">거래방법</span>
          <span class="meta-value">{{ getTradeMethodText(trade.tradeMethod) }}</span>
        </div>
        <div v-if="trade.location" class="meta-item">
          <span class="meta-label">위치</span>
          <span class="meta-value">{{ trade.location }}</span>
        </div>
      </div>

      <!-- 판매자 정보 -->
      <div class="seller-section">
        <div class="seller-profile">
          <div class="seller-avatar">
            <img
                v-if="trade.sellerProfileImage"
                :src="trade.sellerProfileImage"
                :alt="trade.sellerName"
                @error="handleAvatarError"
            />
            <span v-else class="avatar-placeholder">
              {{ trade.sellerName.charAt(0) }}
            </span>
          </div>

          <div class="seller-info">
            <div class="seller-name">{{ trade.sellerName }}</div>
            <div class="seller-stats">
              <span class="seller-rating">
                ⭐ {{ trade.sellerRating.toFixed(1) }}
              </span>
              <span class="seller-trades">
                거래 {{ trade.sellerTradeCount || 0 }}회
              </span>
            </div>
          </div>
        </div>

        <div class="distance-info">
          <span class="distance">{{ formatDistance(trade.distance) }}</span>
        </div>
      </div>

      <!-- 거래 상태 및 시간 정보 -->
      <div class="trade-status-section">
        <div class="trade-status" :class="trade.status">
          {{ getStatusText(trade.status) }}
        </div>
        <div class="trade-time">
          {{ formatTimeAgo(trade.createdAt) }}
        </div>
        <div v-if="trade.viewCount" class="view-count">
          👁️ {{ trade.viewCount }}
        </div>
      </div>
    </div>

    <!-- 액션 버튼들 -->
    <div class="trade-actions">
      <button
          v-if="!isOwnTrade && trade.status === 'available'"
          class="action-btn chat-btn"
          @click="handleChatClick"
          :disabled="chatLoading"
      >
        <span v-if="chatLoading" class="btn-spinner"></span>
        {{ chatLoading ? '연결중...' : '💬 채팅하기' }}
      </button>

      <button
          v-if="isOwnTrade"
          class="action-btn edit-btn"
          @click="handleEditClick"
      >
        ✏️ 수정
      </button>

      <button
          class="action-btn favorite-btn"
          :class="{ 'favorited': trade.isFavorited }"
          @click="handleFavoriteClick"
          :disabled="favoriteLoading"
      >
        {{ trade.isFavorited ? '💚' : '🤍' }}
        {{ trade.favoriteCount || 0 }}
      </button>

      <div class="dropdown-menu" v-if="showDropdown">
        <button
            class="dropdown-item"
            @click="handleShareClick"
        >
          📤 공유하기
        </button>
        <button
            v-if="!isOwnTrade"
            class="dropdown-item"
            @click="handleReportClick"
        >
          🚨 신고하기
        </button>
        <button
            v-if="isOwnTrade"
            class="dropdown-item danger"
            @click="handleDeleteClick"
        >
          🗑️ 삭제하기
        </button>
      </div>

      <button
          class="action-btn more-btn"
          @click="toggleDropdown"
          :class="{ 'active': showDropdown }"
      >
        ⋯
      </button>
    </div>

    <!-- 호버 오버레이 (그리드 뷰에서만) -->
    <div v-if="viewMode === 'grid'" class="hover-overlay">
      <button class="quick-view-btn" @click.stop="handleQuickView">
        👁️ 빠른보기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props 정의
const props = defineProps({
  trade: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'list', // 'list' | 'grid'
    validator: value => ['list', 'grid'].includes(value)
  },
  currentUserId: {
    type: [String, Number],
    default: null
  }
});

// Emit 정의
const emit = defineEmits([
  'chat',
  'favorite',
  'report',
  'edit',
  'delete',
  'share',
  'quick-view'
]);

// 반응형 데이터
const chatLoading = ref(false);
const favoriteLoading = ref(false);
const showDropdown = ref(false);

// 계산된 속성
const isOwnTrade = computed(() => {
  return props.currentUserId &&
      String(props.currentUserId) === String(props.trade.sellerId);
});

const discountRate = computed(() => {
  if (!props.trade.originalPrice || props.trade.originalPrice <= props.trade.price) {
    return 0;
  }
  return Math.round(
      ((props.trade.originalPrice - props.trade.price) / props.trade.originalPrice) * 100
  );
});

// 유틸리티 함수
const formatPrice = (price) => {
  return `${price.toLocaleString()}원`;
};

const formatDistance = (distance) => {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)}km`;
  }
  return `${distance}m`;
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString();
};

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const getConditionText = (condition) => {
  const conditionMap = {
    'new': '새상품',
    'like-new': '거의새것',
    'used': '사용감있음'
  };
  return conditionMap[condition] || '상태미정';
};

const getTradeMethodText = (method) => {
  const methodMap = {
    'direct': '직거래',
    'delivery': '택배',
    'convenience': '편의점택배'
  };
  return methodMap[method] || '거래방법 미정';
};

const getStatusText = (status) => {
  const statusMap = {
    'available': '판매중',
    'reserved': '예약중',
    'sold': '거래완료',
    'hidden': '숨김'
  };
  return statusMap[status] || '상태미정';
};

// 이벤트 핸들러
const handleChatClick = async (event) => {
  event.stopPropagation();
  if (chatLoading.value || isOwnTrade.value) return;

  chatLoading.value = true;
  try {
    emit('chat', props.trade, event);
  } finally {
    setTimeout(() => {
      chatLoading.value = false;
    }, 1000);
  }
};

const handleFavoriteClick = async (event) => {
  event.stopPropagation();
  if (favoriteLoading.value) return;

  favoriteLoading.value = true;
  try {
    emit('favorite', props.trade, event);
  } finally {
    setTimeout(() => {
      favoriteLoading.value = false;
    }, 500);
  }
};

const handleReportClick = (event) => {
  event.stopPropagation();
  showDropdown.value = false;
  emit('report', props.trade, event);
};

const handleEditClick = (event) => {
  event.stopPropagation();
  emit('edit', props.trade, event);
};

const handleDeleteClick = (event) => {
  event.stopPropagation();
  showDropdown.value = false;
  emit('delete', props.trade, event);
};

const handleShareClick = (event) => {
  event.stopPropagation();
  showDropdown.value = false;
  emit('share', props.trade, event);
};

const handleQuickView = (event) => {
  emit('quick-view', props.trade, event);
};

const toggleDropdown = (event) => {
  event.stopPropagation();
  showDropdown.value = !showDropdown.value;
};

const handleImageError = (event) => {
  event.target.src = '/placeholder-trade.jpg';
};

const handleAvatarError = (event) => {
  event.target.style.display = 'none';
};

// 외부 클릭 시 드롭다운 닫기
const handleOutsideClick = () => {
  showDropdown.value = false;
};

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});
</script>

<style scoped>
.trade-item-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.trade-item-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.trade-item-card.own-trade {
  border-color: #e2e8f0;
  background: #f7fafc;
}

.trade-item-card.urgent {
  border-color: #f56565;
  background: linear-gradient(135deg, #fff5f5, #ffffff);
}

.trade-item-card.featured {
  border-color: #ffd700;
  background: linear-gradient(135deg, #fffbf0, #ffffff);
}

/* 리스트 뷰 레이아웃 */
.trade-item-card.view-list {
  display: flex;
  padding: 16px;
  gap: 16px;
  align-items: flex-start;
}

.trade-item-card.view-list .trade-image {
  flex: 0 0 100px;
  height: 100px;
}

.trade-item-card.view-list .trade-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trade-item-card.view-list .trade-actions {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

/* 그리드 뷰 레이아웃 */
.trade-item-card.view-grid {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.trade-item-card.view-grid .trade-image {
  height: 160px;
  margin-bottom: 0;
}

.trade-item-card.view-grid .trade-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trade-item-card.view-grid .trade-actions {
  padding: 0 16px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 이미지 영역 */
.trade-image {
  position: relative;
  background: #f7fafc;
  border-radius: 8px;
  overflow: hidden;
}

.view-grid .trade-image {
  border-radius: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.trade-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.trade-item-card:hover .trade-img {
  transform: scale(1.05);
}

/* 뱃지들 */
.condition-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  color: white;
}

.condition-badge.new {
  background: #1DCD9F;
}

.condition-badge.like-new {
  background: #3182ce;
}

.condition-badge.used {
  background: #f6ad55;
}

.urgent-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #ff6b6b, #ff4757);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.featured-badge {
  position: absolute;
  top: 32px;
  right: 8px;
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  color: #744210;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

.image-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
}

/* 가격 섹션 */
.price-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.trade-price {
  font-size: 18px;
  font-weight: 700;
  color: #1DCD9F;
}

.view-grid .trade-price {
  font-size: 16px;
}

.original-price {
  font-size: 14px;
  color: #a0aec0;
  text-decoration: line-through;
}

.discount-rate {
  background: #fed7d7;
  color: #e53e3e;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
}

/* 제목과 설명 */
.trade-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  line-height: 1.4;
  margin-bottom: 4px;
}

.view-grid .trade-title {
  font-size: 14px;
}

.trade-description {
  font-size: 13px;
  color: #4a5568;
  line-height: 1.4;
}

/* 메타 정보 */
.trade-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.view-grid .trade-meta {
  flex-direction: column;
  gap: 6px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.meta-label {
  color: #718096;
  font-weight: 500;
}

.meta-value {
  color: #4a5568;
  font-weight: 600;
}

/* 판매자 섹션 */
.seller-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.seller-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.seller-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seller-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #4a5568;
  font-size: 14px;
  font-weight: 600;
}

.seller-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.seller-name {
  font-size: 13px;
  font-weight: 600;
  color: #2d3748;
}

.seller-stats {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #718096;
}

.seller-rating {
  color: #1DCD9F;
  font-weight: 500;
}

.distance-info {
  text-align: right;
}

.distance {
  font-size: 12px;
  color: #4a5568;
  font-weight: 500;
}

/* 거래 상태 섹션 */
.trade-status-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.view-list .trade-status-section {
  border-top: none;
  padding-top: 0;
}

.trade-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.trade-status.available {
  background: #c6f6d5;
  color: #22543d;
}

.trade-status.reserved {
  background: #fed7ca;
  color: #c05621;
}

.trade-status.sold {
  background: #e2e8f0;
  color: #4a5568;
}

.trade-time {
  font-size: 11px;
  color: #718096;
}

.view-count {
  font-size: 11px;
  color: #718096;
}

/* 액션 버튼들 */
.trade-actions {
  position: relative;
  gap: 8px;
}

.view-list .trade-actions {
  min-width: 120px;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 32px;
}

.chat-btn {
  background: #1DCD9F;
  color: white;
  flex: 1;
}

.chat-btn:hover:not(:disabled) {
  background: #16a085;
}

.chat-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.edit-btn {
  background: #3182ce;
  color: white;
  flex: 1;
}

.edit-btn:hover {
  background: #2c5282;
}

.favorite-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  padding: 6px 8px;
}

.favorite-btn.favorited {
  background: #fed7d7;
  color: #e53e3e;
  border-color: #feb2b2;
}

.favorite-btn:hover {
  background: #edf2f7;
}

.more-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  padding: 0;
}

.more-btn:hover,
.more-btn.active {
  background: #edf2f7;
}

.btn-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 드롭다운 메뉴 */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 120px;
  padding: 4px 0;
}

.dropdown-item {
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  font-size: 12px;
  color: #4a5568;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f7fafc;
}

.dropdown-item.danger {
  color: #e53e3e;
}

.dropdown-item.danger:hover {
  background: #fed7d7;
}

/* 호버 오버레이 (그리드 뷰) */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.trade-item-card.view-grid:hover .hover-overlay {
  opacity: 1;
  pointer-events: auto;
}

.quick-view-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #2d3748;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-view-btn:hover {
  background: white;
  transform: scale(1.05);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .trade-item-card.view-list {
    padding: 12px;
    gap: 12px;
  }

  .trade-item-card.view-list .trade-image {
    flex: 0 0 80px;
    height: 80px;
  }

  .trade-price {
    font-size: 16px;
  }

  .trade-title {
    font-size: 14px;
  }

  .trade-actions {
    flex-direction: column;
    gap: 6px;
    min-width: 100px;
  }

  .action-btn {
    font-size: 11px;
    padding: 5px 8px;
    min-height: 28px;
  }

  .seller-avatar {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .trade-item-card.view-list {
    flex-direction: column;
    gap: 12px;
  }

  .trade-item-card.view-list .trade-image {
    flex: none;
    height: 120px;
    align-self: stretch;
  }

  .trade-item-card.view-list .trade-info {
    order: 1;
  }

  .trade-item-card.view-list .trade-actions {
    order: 2;
    flex-direction: row;
    justify-content: space-between;
    min-width: auto;
  }

  .trade-meta {
    flex-direction: column;
    gap: 4px;
  }

  .price-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .trade-item-card {
    background: #2d3748;
    color: #e2e8f0;
  }

  .trade-item-card.own-trade {
    background: #1a202c;
    border-color: #4a5568;
  }

  .trade-title,
  .seller-name {
    color: #e2e8f0;
  }

  .meta-value {
    color: #cbd5e0;
  }

  .meta-label,
  .seller-stats,
  .trade-time,
  .view-count,
  .distance {
    color: #a0aec0;
  }

  .trade-status-section {
    border-color: #4a5568;
  }

  .action-btn {
    border-color: #4a5568;
  }

  .favorite-btn,
  .more-btn {
    background: #4a5568;
    color: #e2e8f0;
  }

  .dropdown-menu {
    background: #2d3748;
    border-color: #4a5568;
  }

  .dropdown-item {
    color: #e2e8f0;
  }

  .dropdown-item:hover {
    background: #4a5568;
  }
}
</style>