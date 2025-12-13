<template>
  <div class="trade-card" @click="$emit('click')">
    <!-- 판매 방식 리본 -->
    <div class="sale-type-ribbon" :class="saleTypeClass">
      {{ saleTypeLabel }}
    </div>

    <!-- 이미지 -->
    <div class="image-wrap">
      <img
          :src="trade.thumbnailUrl || '/api/placeholder/400/400'"
          :alt="trade.title"
          class="product-image"
      />
      <span v-if="trade.oneMouthStatus" class="product-status" :class="statusClass">
        {{ statusLabel }}
      </span>
      <button
          class="favorite-btn"
          :class="{ active: trade.isFavorite }"
          @click.stop="toggleFavorite"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>

    <!-- 정보 -->
    <div class="card-info">
      <h3 class="title">{{ trade.title }}</h3>
      <p class="description">{{ trade.description }}</p>

      <!-- 판매 방식별 특별 정보 -->
      <div v-if="specialInfo" class="sale-info" :class="saleTypeClass">
        {{ specialInfo }}
      </div>

      <!-- 공동구매 진행바 -->
      <div v-if="isGroupBuy && trade.groupBuyInfo" class="group-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-text">
          {{ trade.groupBuyInfo.currentCount }}/{{ trade.groupBuyInfo.targetCount }}명 참여 •
          {{ trade.groupBuyInfo.daysLeft }}일 남음
        </div>
      </div>

      <!-- 가격 -->
      <div class="price-wrap">
        <span class="buy-price">{{ formatPrice(trade.sellingPrice) }}원</span>
        <span v-if="trade.originalPrice && trade.originalPrice > trade.sellingPrice" class="price-original">
          {{ formatPrice(trade.originalPrice) }}원
        </span>
      </div>

      <!-- 메타 정보 -->
      <div class="meta">
        <span class="meta-item">
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          {{ trade.tradeLocation || '위치 미정' }}
        </span>
        <span class="meta-item">
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
          </svg>
          {{ getRelativeTime(trade.createdAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  trade: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

// 판매 방식
const saleTypeClass = computed(() => {
  const types = props.trade.saleTypes || [];
  if (types.includes('ONEMOUTH')) return 'onemouth';
  if (types.includes('GROUP_BUY')) return 'group';
  if (types.includes('PROXY')) return 'proxy';
  return 'normal';
});

const saleTypeLabel = computed(() => {
  const types = props.trade.saleTypes || [];
  if (types.length > 1) {
    if (types.includes('ONEMOUTH')) return '한입만+일반';
    return types.map(t => {
      if (t === 'ONEMOUTH') return '한입만';
      if (t === 'NORMAL') return '일반';
      if (t === 'GROUP_BUY') return '공구';
      if (t === 'PROXY') return '대리';
      return '';
    }).join('+');
  }

  const type = types[0] || 'NORMAL';
  if (type === 'ONEMOUTH') return '한입만';
  if (type === 'GROUP_BUY') return '공구';
  if (type === 'PROXY') return '대리';
  return '일반';
});

// 상태
const statusClass = computed(() => {
  const status = props.trade.oneMouthStatus;
  if (status === 'RESERVED') return 'reserved';
  if (status === 'SOLD_OUT') return 'sold';
  return '';
});

const statusLabel = computed(() => {
  const status = props.trade.oneMouthStatus;
  if (status === 'ON_SALE') return '판매중';
  if (status === 'RESERVED') return '예약중';
  if (status === 'SOLD_OUT') return '판매완료';
  return '판매중';
});

// 특별 정보
const specialInfo = computed(() => {
  const types = props.trade.saleTypes || [];

  if (types.includes('ONEMOUTH') && props.trade.onemouthInfo) {
    return `${props.trade.onemouthInfo.quantity}개 한입 • ${props.trade.onemouthInfo.remaining}개 남음`;
  }

  if (types.includes('PROXY') && props.trade.proxyInfo) {
    return `수수료 +${props.trade.proxyInfo.fee}% • ${props.trade.proxyInfo.duration}일 소요`;
  }

  return null;
});

// 공동구매
const isGroupBuy = computed(() => {
  return (props.trade.saleTypes || []).includes('GROUP_BUY');
});

const progressPercent = computed(() => {
  if (!props.trade.groupBuyInfo) return 0;
  const { currentCount, targetCount } = props.trade.groupBuyInfo;
  return Math.min((currentCount / targetCount) * 100, 100);
});

// 유틸
const formatPrice = (price) => {
  if (!price) return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const getRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const date = new Date(timestamp);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
};

const toggleFavorite = () => {
  // API 호출 로직
  console.log('Toggle favorite:', props.trade.oneMouthId);
};
</script>

<style scoped>
.trade-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.trade-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.sale-type-ribbon {
  position: absolute;
  top: 0.75rem;
  left: 0;
  padding: 0.375rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  border-radius: 0 6px 6px 0;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sale-type-ribbon.onemouth {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.sale-type-ribbon.normal {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
}

.sale-type-ribbon.group {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.sale-type-ribbon.proxy {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
}

.image-wrap {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-status {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.375rem 0.75rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  backdrop-filter: blur(8px);
}

.product-status.reserved {
  background: rgba(245, 158, 11, 0.9);
}

.product-status.sold {
  background: rgba(115, 115, 115, 0.9);
}

.favorite-btn {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-btn:hover {
  background: white;
  transform: scale(1.1);
}

.favorite-btn svg {
  color: #525252;
}

.favorite-btn.active svg {
  fill: #EF4444;
  color: #EF4444;
}

.card-info {
  padding: 1.25rem;
}

.title {
  font-size: 1rem;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.description {
  font-size: 0.8125rem;
  color: #737373;
  margin-bottom: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sale-info {
  padding: 0.625rem 0.875rem;
  margin-bottom: 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.sale-info.onemouth {
  background: #D1FAE5;
  color: #047857;
}

.sale-info.group {
  background: #FEF3C7;
  color: #92400E;
}

.sale-info.proxy {
  background: #EDE9FE;
  color: #5B21B6;
}

.group-progress {
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 6px;
  background: #F3F4F6;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.375rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #F59E0B 0%, #D97706 100%);
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.75rem;
  color: #92400E;
  font-weight: 600;
}

.price-wrap {
  margin-bottom: 0.75rem;
}

.buy-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1A1A1A;
}

.price-original {
  font-size: 0.875rem;
  color: #A3A3A3;
  text-decoration: line-through;
  margin-left: 0.5rem;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #A3A3A3;
  padding-top: 0.75rem;
  border-top: 1px solid #F3F4F6;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>