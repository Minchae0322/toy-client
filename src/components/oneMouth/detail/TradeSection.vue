<template>
  <div class="trade-section">
    <!-- 섹션 헤더 -->
    <div class="section-header">
      <div class="section-title-wrapper">
        <h2 class="section-title">🛒 개인거래</h2>
        <span class="section-count">{{ trades.length }}개</span>
      </div>
      <p class="section-description">이 상품으로 진행중인 개인거래입니다</p>
    </div>

    <!-- 거래 액션 -->
    <div class="trades-actions">
      <button class="create-trade-btn" @click="$emit('create-trade')">
        ➕ 거래 등록하기
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
          <div v-else class="trade-placeholder">🛒</div>
          <div class="trade-status-badge" :class="trade.oneMouthStatus.toLowerCase()">
            {{ getTradeStatusText(trade.oneMouthStatus) }}
          </div>
        </div>
        <div class="trade-info">
          <h4 class="trade-title">{{ trade.title }}</h4>
          <div class="trade-price">{{ formatPrice(trade.sellingPrice) }}</div>
          <div class="trade-meta">
            <span>📍 {{ trade.tradeLocation || '지역미정' }}</span>
            <span>👁 {{ trade.viewCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🛒</div>
      <p>아직 등록된 거래가 없습니다</p>
      <p class="empty-description">이 상품으로 첫 거래를 등록해보세요!</p>
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
  padding: 32px 24px;
  background: #fafbfc;
}

/* 섹션 헤더 */
.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin: 0;
}

.section-count {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
}

.section-description {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* 거래 액션 */
.trades-actions {
  margin-bottom: 24px;
}

.create-trade-btn {
  background: #1DCD9F;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  max-width: 300px;
}

.create-trade-btn:hover {
  background: #169976;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(29, 205, 159, 0.3);
}

/* 거래 그리드 */
.trades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.trade-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.trade-card:hover {
  border-color: #1DCD9F;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(29, 205, 159, 0.15);
}

.trade-image {
  width: 100%;
  height: 200px;
  background: #f8fafc;
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
  font-size: 56px;
  opacity: 0.3;
}

.trade-status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  backdrop-filter: blur(4px);
}

.trade-status-badge.on_sale {
  background: rgba(29, 205, 159, 0.9);
}

.trade-status-badge.reserved {
  background: rgba(245, 158, 11, 0.9);
}

.trade-status-badge.sold_out {
  background: rgba(100, 116, 139, 0.9);
}

.trade-info {
  padding: 16px;
}

.trade-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trade-price {
  font-size: 20px;
  font-weight: 700;
  color: #1DCD9F;
  margin-bottom: 12px;
}

.trade-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #64748b;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-state p {
  font-size: 18px;
  color: #000000;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px !important;
  color: #64748b !important;
  font-weight: 400 !important;
  margin-bottom: 24px !important;
}

.empty-state .create-trade-btn {
  margin: 0 auto;
}

@media (max-width: 768px) {
  .trade-section {
    padding: 24px 16px;
  }

  .section-title {
    font-size: 22px;
  }

  .create-trade-btn {
    max-width: 100%;
  }

  .trades-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .trade-section {
    padding: 20px 12px;
  }

  .section-title {
    font-size: 20px;
  }

  .trade-image {
    height: 180px;
  }

  .empty-icon {
    font-size: 64px;
  }
}
</style>