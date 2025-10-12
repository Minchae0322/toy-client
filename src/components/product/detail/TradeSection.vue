<template>
  <div class="trade-section">
    <!-- 섹션 헤더 -->
    <div class="section-header">
      <div class="section-title-wrapper">
        <h2 class="section-title">개인거래</h2>
        <span class="section-count">{{ trades.length }}</span>
      </div>
      <p class="section-description">이 상품으로 진행중인 개인거래입니다</p>
    </div>

    <!-- 거래 액션 -->
    <div class="trades-actions">
      <button class="create-trade-btn" @click="$emit('create-trade')">
        거래 등록하기
      </button>
    </div>

    <!-- 거래 목록 -->
    <div v-if="trades.length > 0" class="trades-grid">
      <div
          v-for="trade in trades"
          :key="trade.oneMouthId"
          class="trade-card"
          @click="$emit('view-trade', trade.oneMouthId)"
      >
        <div class="trade-image">
          <img v-if="trade.thumbnailUrl" :src="trade.thumbnailUrl" :alt="trade.title" />
          <div v-else class="trade-placeholder">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M6 14H42M6 14V38C6 39.1046 6.89543 40 8 40H40C41.1046 40 42 39.1046 42 38V14M6 14L10 8H38L42 14M18 24V30M30 24V30" stroke="#D1D5DB" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="trade-status-badge" :class="trade.oneMouthStatus.toLowerCase()">
            {{ getTradeStatusText(trade.oneMouthStatus) }}
          </div>
        </div>
        <div class="trade-info">
          <h4 class="trade-title">{{ trade.title }}</h4>
          <div class="trade-price">{{ formatPrice(trade.sellingPrice) }}</div>
          <div class="trade-meta">
            <span class="trade-location">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 7.58333C8.01083 7.58333 8.82917 6.765 8.82917 5.75417C8.82917 4.74333 8.01083 3.925 7 3.925C5.98917 3.925 5.17083 4.74333 5.17083 5.75417C5.17083 6.765 5.98917 7.58333 7 7.58333Z" stroke="currentColor" stroke-width="1.2"/>
                <path d="M2.115 4.95251C3.26 -0.0649896 10.7458 -0.0591563 11.885 4.95834C12.5283 7.91001 10.7225 10.4042 9.1 11.9692C8.0375 12.99 5.9625 12.99 4.89417 11.9692C3.2775 10.4042 1.47167 7.90417 2.115 4.95251Z" stroke="currentColor" stroke-width="1.2"/>
              </svg>
              {{ trade.tradeLocation || '지역미정' }}
            </span>
            <span class="trade-views">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9.04167 7C9.04167 8.12833 8.12833 9.04167 7 9.04167C5.87167 9.04167 4.95833 8.12833 4.95833 7C4.95833 5.87167 5.87167 4.95833 7 4.95833C8.12833 4.95833 9.04167 5.87167 9.04167 7Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 11.8125C9.04583 11.8125 10.9308 10.5558 12.1525 8.3975C12.6367 7.5275 12.6367 6.46667 12.1525 5.59667C10.9308 3.43834 9.04583 2.18167 7 2.18167C4.95417 2.18167 3.06917 3.43834 1.8475 5.59667C1.36333 6.46667 1.36333 7.5275 1.8475 8.3975C3.06917 10.5558 4.95417 11.8125 7 11.8125Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ trade.viewCount }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" class="empty-icon">
        <path d="M10 23.3333H70M10 23.3333V63.3333C10 65.1743 11.4924 66.6667 13.3333 66.6667H66.6667C68.5076 66.6667 70 65.1743 70 63.3333V23.3333M10 23.3333L16.6667 13.3333H63.3333L70 23.3333M30 40V50M50 40V50" stroke="#D1D5DB" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3 class="empty-title">아직 등록된 거래가 없습니다</h3>
      <p class="empty-description">이 상품으로 첫 거래를 등록해보세요</p>
      <button class="create-trade-btn" @click="$emit('create-trade')">
        첫 거래 등록하기
      </button>
    </div>
  </div>
</template>

<script setup>
import { productUtils } from '@/services/ProductService.js'

const props = defineProps({
  trades: {
    type: Array,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  },
  productId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['create-trade', 'view-trade'])

const formatPrice = (price) => productUtils.formatPrice(price)

const getTradeStatusText = (status) => {
  const statusMap = {
    'ON_SALE': '판매중',
    'RESERVED': '예약중',
    'SOLD_OUT': '판매완료'
  }
  return statusMap[status] || '알 수 없음'
}
</script>

<style scoped>
.trade-section {
  padding: 32px;
  background: #FAFAFA;
}

/* 섹션 헤더 */
.section-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #F3F4F6;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.02em;
}

.section-count {
  font-size: 15px;
  color: #6B7280;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.section-description {
  font-size: 14px;
  color: #9CA3AF;
  margin: 0;
  font-weight: 500;
}

/* 거래 액션 */
.trades-actions {
  margin-bottom: 24px;
}

.create-trade-btn {
  background: #059669;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: -0.01em;
}

.create-trade-btn:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

/* 거래 그리드 */
.trades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.trade-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.trade-card:hover {
  border-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(5, 150, 105, 0.15);
}

.trade-image {
  width: 100%;
  height: 200px;
  background: #F9FAFB;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.trade-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trade-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.trade-status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  backdrop-filter: blur(8px);
  letter-spacing: -0.01em;
}

.trade-status-badge.on_sale {
  background: rgba(5, 150, 105, 0.95);
}

.trade-status-badge.reserved {
  background: rgba(217, 119, 6, 0.95);
}

.trade-status-badge.sold_out {
  background: rgba(107, 114, 128, 0.95);
}

.trade-info {
  padding: 16px;
}

.trade-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.trade-price {
  font-size: 20px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.trade-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #6B7280;
  font-weight: 500;
}

.trade-location,
.trade-views {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #F3F4F6;
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.8;
}

.empty-title {
  font-size: 18px;
  color: #111827;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.empty-description {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .trade-section {
    padding: 24px;
  }

  .section-title {
    font-size: 18px;
  }

  .trades-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .trade-section {
    padding: 20px;
  }

  .section-title {
    font-size: 17px;
  }

  .trade-image {
    height: 180px;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
  }

  .empty-title {
    font-size: 16px;
  }
}
</style>