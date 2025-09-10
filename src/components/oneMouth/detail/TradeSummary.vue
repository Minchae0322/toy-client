<template>
  <div class="trade-summary">
    <!-- 요약 헤더 -->
    <div class="summary-header">
      <h3 class="summary-title">📊 거래 현황</h3>
      <div class="summary-period">
        <select v-model="selectedPeriod" @change="updatePeriod" class="period-select">
          <option value="all">전체</option>
          <option value="today">오늘</option>
          <option value="week">1주일</option>
          <option value="month">1개월</option>
        </select>
      </div>
    </div>

    <!-- 메인 통계 그리드 -->
    <div class="summary-grid">
      <div class="summary-item primary">
        <div class="summary-icon">🛒</div>
        <div class="summary-content">
          <div class="summary-label">판매중</div>
          <div class="summary-value">{{ totalTrades }}건</div>
          <div class="summary-change" :class="changeClass(tradesChange)">
            {{ tradesChange > 0 ? '+' : '' }}{{ tradesChange }}
          </div>
        </div>
      </div>

      <div class="summary-item secondary">
        <div class="summary-icon">💰</div>
        <div class="summary-content">
          <div class="summary-label">평균가격</div>
          <div class="summary-value">{{ formatPrice(averagePrice) }}</div>
          <div class="summary-discount" v-if="discountRate > 0">
            정가대비 {{ discountRate }}% 할인
          </div>
        </div>
      </div>

      <div class="summary-item accent">
        <div class="summary-icon">🔥</div>
        <div class="summary-content">
          <div class="summary-label">최저가</div>
          <div class="summary-value">{{ formatPrice(lowestPrice) }}</div>
          <div class="summary-extra" v-if="lowestPriceSeller">
            {{ lowestPriceSeller }}
          </div>
        </div>
      </div>

      <div class="summary-item info">
        <div class="summary-icon">📍</div>
        <div class="summary-content">
          <div class="summary-label">가장가까운</div>
          <div class="summary-value">{{ formatDistance(nearestDistance) }}</div>
          <div class="summary-extra" v-if="nearestSeller">
            {{ nearestSeller }}
          </div>
        </div>
      </div>
    </div>

    <!-- 상세 통계 -->
    <div class="detailed-stats">
      <!-- 가격 분포 차트 -->
      <div class="stats-section">
        <h4 class="stats-title">💸 가격 분포</h4>
        <div class="price-distribution">
          <div
              v-for="range in priceRanges"
              :key="range.label"
              class="price-range-item"
          >
            <div class="price-range-label">{{ range.label }}</div>
            <div class="price-range-bar">
              <div
                  class="price-range-fill"
                  :style="{ width: range.percentage + '%' }"
              ></div>
            </div>
            <div class="price-range-count">{{ range.count }}건</div>
          </div>
        </div>
      </div>

      <!-- 거래방법 분포 -->
      <div class="stats-section">
        <h4 class="stats-title">🚚 거래방법</h4>
        <div class="trade-methods">
          <div
              v-for="method in tradeMethods"
              :key="method.type"
              class="method-item"
              :class="{ 'most-popular': method.isPopular }"
          >
            <div class="method-icon">{{ method.icon }}</div>
            <div class="method-info">
              <div class="method-name">{{ method.name }}</div>
              <div class="method-stats">
                <span class="method-count">{{ method.count }}건</span>
                <span class="method-percentage">({{ method.percentage }}%)</span>
              </div>
            </div>
            <div v-if="method.isPopular" class="popular-badge">인기</div>
          </div>
        </div>
      </div>

      <!-- 상품 상태 분포 -->
      <div class="stats-section">
        <h4 class="stats-title">✨ 상품 상태</h4>
        <div class="condition-stats">
          <div
              v-for="condition in conditionStats"
              :key="condition.type"
              class="condition-item"
          >
            <div class="condition-indicator" :style="{ backgroundColor: condition.color }"></div>
            <div class="condition-label">{{ condition.label }}</div>
            <div class="condition-count">{{ condition.count }}건</div>
            <div class="condition-avg-price">평균 {{ formatPrice(condition.avgPrice) }}</div>
          </div>
        </div>
      </div>

      <!-- 판매자 평점 분포 -->
      <div class="stats-section">
        <h4 class="stats-title">⭐ 판매자 평점</h4>
        <div class="rating-distribution">
          <div class="rating-summary">
            <div class="avg-rating">
              <span class="rating-number">{{ averageRating.toFixed(1) }}</span>
              <div class="rating-stars">
                <span v-for="n in 5" :key="n" class="star"
                      :class="{ 'filled': n <= Math.round(averageRating) }">
                  ⭐
                </span>
              </div>
            </div>
            <div class="rating-breakdown">
              <div
                  v-for="rating in ratingBreakdown"
                  :key="rating.stars"
                  class="rating-bar"
              >
                <span class="rating-label">{{ rating.stars }}⭐</span>
                <div class="rating-bar-container">
                  <div
                      class="rating-bar-fill"
                      :style="{ width: rating.percentage + '%' }"
                  ></div>
                </div>
                <span class="rating-count">{{ rating.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 추천 액션 -->
    <div class="recommendation-section" v-if="recommendations.length > 0">
      <h4 class="stats-title">💡 추천</h4>
      <div class="recommendations">
        <div
            v-for="rec in recommendations"
            :key="rec.id"
            class="recommendation-item"
            :class="rec.type"
        >
          <div class="rec-icon">{{ rec.icon }}</div>
          <div class="rec-content">
            <div class="rec-title">{{ rec.title }}</div>
            <div class="rec-description">{{ rec.description }}</div>
          </div>
          <button
              v-if="rec.action"
              class="rec-action-btn"
              @click="handleRecommendationAction(rec)"
          >
            {{ rec.actionText }}
          </button>
        </div>
      </div>
    </div>

    <!-- 새로고침 버튼 -->
    <div class="summary-actions">
      <button
          class="refresh-btn"
          @click="refreshData"
          :disabled="loading"
      >
        <span class="refresh-icon" :class="{ 'spinning': loading }">🔄</span>
        {{ loading ? '새로고침 중...' : '새로고침' }}
      </button>
      <div class="last-updated">
        마지막 업데이트: {{ formatLastUpdated }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// Props 정의
const props = defineProps({
  trades: {
    type: Array,
    required: true
  },
  officialPrice: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Emit 정의
const emit = defineEmits(['period-change', 'refresh', 'action']);

// 반응형 데이터
const selectedPeriod = ref('all');
const lastUpdated = ref(new Date());

// 필터된 거래 데이터
const filteredTrades = computed(() => {
  const now = new Date();
  const trades = props.trades;

  if (selectedPeriod.value === 'all') return trades;

  return trades.filter(trade => {
    const tradeDate = new Date(trade.createdAt);
    const diffTime = now - tradeDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    switch (selectedPeriod.value) {
      case 'today':
        return diffDays < 1;
      case 'week':
        return diffDays < 7;
      case 'month':
        return diffDays < 30;
      default:
        return true;
    }
  });
});

// 기본 통계
const totalTrades = computed(() => filteredTrades.value.length);

const averagePrice = computed(() => {
  if (filteredTrades.value.length === 0) return 0;
  const sum = filteredTrades.value.reduce((acc, trade) => acc + trade.price, 0);
  return Math.round(sum / filteredTrades.value.length);
});

const lowestPrice = computed(() => {
  if (filteredTrades.value.length === 0) return 0;
  return Math.min(...filteredTrades.value.map(trade => trade.price));
});

const nearestDistance = computed(() => {
  if (filteredTrades.value.length === 0) return 0;
  return Math.min(...filteredTrades.value.map(trade => trade.distance));
});

const lowestPriceSeller = computed(() => {
  const cheapest = filteredTrades.value.find(trade => trade.price === lowestPrice.value);
  return cheapest ? cheapest.sellerName : '';
});

const nearestSeller = computed(() => {
  const nearest = filteredTrades.value.find(trade => trade.distance === nearestDistance.value);
  return nearest ? nearest.sellerName : '';
});

const discountRate = computed(() => {
  if (props.officialPrice === 0 || averagePrice.value === 0) return 0;
  return Math.round(((props.officialPrice - averagePrice.value) / props.officialPrice) * 100);
});

const tradesChange = computed(() => {
  // 이전 기간과 비교한 변화량 (실제로는 API에서 받아와야 함)
  return Math.floor(Math.random() * 10) - 5; // 임시 데이터
});

// 가격 분포 계산
const priceRanges = computed(() => {
  const ranges = [
    { label: '1만원 이하', min: 0, max: 10000, count: 0 },
    { label: '1-2만원', min: 10000, max: 20000, count: 0 },
    { label: '2-3만원', min: 20000, max: 30000, count: 0 },
    { label: '3-4만원', min: 30000, max: 40000, count: 0 },
    { label: '4만원 이상', min: 40000, max: Infinity, count: 0 }
  ];

  filteredTrades.value.forEach(trade => {
    const range = ranges.find(r => trade.price > r.min && trade.price <= r.max);
    if (range) range.count++;
  });

  const maxCount = Math.max(...ranges.map(r => r.count));

  return ranges.map(range => ({
    ...range,
    percentage: maxCount > 0 ? (range.count / maxCount) * 100 : 0
  }));
});

// 거래방법 분포
const tradeMethods = computed(() => {
  const methods = {
    direct: { type: 'direct', name: '직거래', icon: '🤝', count: 0 },
    delivery: { type: 'delivery', name: '택배', icon: '📦', count: 0 },
    convenience: { type: 'convenience', name: '편의점택배', icon: '🏪', count: 0 }
  };

  filteredTrades.value.forEach(trade => {
    if (methods[trade.tradeMethod]) {
      methods[trade.tradeMethod].count++;
    }
  });

  const total = filteredTrades.value.length;
  const result = Object.values(methods).map(method => ({
    ...method,
    percentage: total > 0 ? Math.round((method.count / total) * 100) : 0
  }));

  // 가장 많이 사용되는 방법 표시
  const maxCount = Math.max(...result.map(m => m.count));
  result.forEach(method => {
    method.isPopular = method.count === maxCount && method.count > 0;
  });

  return result.sort((a, b) => b.count - a.count);
});

// 상품 상태 분포
const conditionStats = computed(() => {
  const conditions = {
    new: { type: 'new', label: '새상품', color: '#1DCD9F', count: 0, totalPrice: 0 },
    'like-new': { type: 'like-new', label: '거의새것', color: '#3182ce', count: 0, totalPrice: 0 },
    used: { type: 'used', label: '사용감있음', color: '#f6ad55', count: 0, totalPrice: 0 }
  };

  filteredTrades.value.forEach(trade => {
    if (conditions[trade.condition]) {
      conditions[trade.condition].count++;
      conditions[trade.condition].totalPrice += trade.price;
    }
  });

  return Object.values(conditions).map(condition => ({
    ...condition,
    avgPrice: condition.count > 0 ? Math.round(condition.totalPrice / condition.count) : 0
  })).filter(c => c.count > 0);
});

// 평점 분포
const averageRating = computed(() => {
  if (filteredTrades.value.length === 0) return 0;
  const sum = filteredTrades.value.reduce((acc, trade) => acc + trade.sellerRating, 0);
  return sum / filteredTrades.value.length;
});

const ratingBreakdown = computed(() => {
  const breakdown = [
    { stars: 5, count: 0 },
    { stars: 4, count: 0 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 }
  ];

  filteredTrades.value.forEach(trade => {
    const rating = Math.round(trade.sellerRating);
    const item = breakdown.find(b => b.stars === rating);
    if (item) item.count++;
  });

  const total = filteredTrades.value.length;

  return breakdown.map(item => ({
    ...item,
    percentage: total > 0 ? (item.count / total) * 100 : 0
  }));
});

// 추천 시스템
const recommendations = computed(() => {
  const recs = [];

  // 최저가 알림 설정 추천
  if (filteredTrades.value.length > 3) {
    recs.push({
      id: 'price-alert',
      type: 'info',
      icon: '🔔',
      title: '가격 알림 설정',
      description: `현재 최저가 ${formatPrice(lowestPrice.value)} 이하로 떨어지면 알려드려요`,
      action: 'setPriceAlert',
      actionText: '설정하기'
    });
  }

  // 판매 추천
  if (averagePrice.value > 0 && props.officialPrice > averagePrice.value) {
    recs.push({
      id: 'sell-recommendation',
      type: 'success',
      icon: '💰',
      title: '지금이 판매 기회!',
      description: `평균 거래가가 정가보다 ${discountRate.value}% 높아요`,
      action: 'startSelling',
      actionText: '판매하기'
    });
  }

  // 거래 팁
  if (filteredTrades.value.length > 0) {
    const popularMethod = tradeMethods.value[0];
    if (popularMethod && popularMethod.percentage > 60) {
      recs.push({
        id: 'trade-tip',
        type: 'tip',
        icon: '💡',
        title: '거래 팁',
        description: `이 상품은 ${popularMethod.name}가 ${popularMethod.percentage}%로 가장 인기있어요`,
        action: null,
        actionText: null
      });
    }
  }

  return recs;
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

const changeClass = (change) => {
  if (change > 0) return 'positive';
  if (change < 0) return 'negative';
  return 'neutral';
};

const formatLastUpdated = computed(() => {
  const now = new Date();
  const diff = Math.floor((now - lastUpdated.value) / (1000 * 60));

  if (diff < 1) return '방금 전';
  if (diff < 60) return `${diff}분 전`;
  if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
  return lastUpdated.value.toLocaleDateString();
});

// 이벤트 핸들러
const updatePeriod = () => {
  emit('period-change', selectedPeriod.value);
};

const refreshData = () => {
  lastUpdated.value = new Date();
  emit('refresh');
};

const handleRecommendationAction = (recommendation) => {
  emit('action', recommendation.action, recommendation);
};

// 라이프사이클
onMounted(() => {
  // 자동 새로고침 설정 (5분마다)
  const interval = setInterval(() => {
    if (!props.loading) {
      refreshData();
    }
  }, 5 * 60 * 1000);

  onUnmounted(() => {
    clearInterval(interval);
  });
});

// 거래 데이터 변경 감지
watch(() => props.trades, () => {
  lastUpdated.value = new Date();
}, { deep: true });
</script>

<style scoped>
.trade-summary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
  position: relative;
  overflow: hidden;
}

.trade-summary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(29, 205, 159, 0.9), rgba(22, 160, 133, 0.8));
  z-index: 1;
}

.trade-summary > * {
  position: relative;
  z-index: 2;
}

/* 요약 헤더 */
.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.period-select {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
}

.period-select option {
  background: #2d3748;
  color: white;
}

/* 메인 통계 그리드 */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-item {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.summary-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.summary-content {
  flex: 1;
}

.summary-label {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 4px;
  text-transform: uppercase;
  font-weight: 500;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 2px;
}

.summary-change {
  font-size: 11px;
  font-weight: 600;
}

.summary-change.positive {
  color: #68d391;
}

.summary-change.negative {
  color: #fc8181;
}

.summary-change.neutral {
  opacity: 0.7;
}

.summary-discount {
  font-size: 11px;
  opacity: 0.8;
  color: #fbb6ce;
}

.summary-extra {
  font-size: 10px;
  opacity: 0.8;
  margin-top: 2px;
}

/* 상세 통계 */
.detailed-stats {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.stats-section {
  margin-bottom: 24px;
}

.stats-section:last-child {
  margin-bottom: 0;
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 가격 분포 */
.price-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-range-item {
  display: grid;
  grid-template-columns: 1fr 2fr 60px;
  gap: 12px;
  align-items: center;
}

.price-range-label {
  font-size: 13px;
  font-weight: 500;
}

.price-range-bar {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  height: 8px;
  overflow: hidden;
}

.price-range-fill {
  background: linear-gradient(90deg, #68d391, #38b2ac);
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.price-range-count {
  font-size: 12px;
  text-align: right;
  font-weight: 600;
}

/* 거래방법 */
.trade-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  position: relative;
}

.method-item.most-popular {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.method-icon {
  font-size: 20px;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.method-stats {
  display: flex;
  gap: 8px;
  font-size: 12px;
  opacity: 0.8;
}

.popular-badge {
  background: #fbb6ce;
  color: #2d3748;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

/* 상품 상태 */
.condition-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.condition-item {
  display: grid;
  grid-template-columns: 12px 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
}

.condition-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.condition-label {
  font-size: 14px;
  font-weight: 500;
}

.condition-count {
  font-size: 13px;
  font-weight: 600;
}

.condition-avg-price {
  font-size: 11px;
  opacity: 0.8;
}

/* 평점 분포 */
.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rating-summary {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.avg-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.rating-number {
  font-size: 32px;
  font-weight: 700;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 12px;
  opacity: 0.3;
}

.star.filled {
  opacity: 1;
}

.rating-breakdown {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bar {
  display: grid;
  grid-template-columns: 30px 1fr 40px;
  gap: 8px;
  align-items: center;
}

.rating-label {
  font-size: 12px;
  text-align: right;
}

.rating-bar-container {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  height: 6px;
  overflow: hidden;
}

.rating-bar-fill {
  background: #fbb6ce;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.rating-count {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

/* 추천 섹션 */
.recommendation-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.recommendation-item.info {
  border-left-color: #63b3ed;
}

.recommendation-item.success {
  border-left-color: #68d391;
}

.recommendation-item.tip {
  border-left-color: #fbb6ce;
}

.rec-icon {
  font-size: 20px;
}

.rec-content {
  flex: 1;
}

.rec-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.rec-description {
  font-size: 12px;
  opacity: 0.8;
  line-height: 1.4;
}

.rec-action-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.rec-action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 액션 버튼들 */
.summary-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 14px;
  transition: transform 0.5s;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.last-updated {
  font-size: 11px;
  opacity: 0.7;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .trade-summary {
    padding: 20px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .summary-item {
    padding: 12px;
  }

  .summary-value {
    font-size: 18px;
  }

  .rating-summary {
    flex-direction: column;
    gap: 16px;
  }

  .price-range-item,
  .condition-item,
  .rating-bar {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .summary-actions {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .detailed-stats {
    padding: 16px;
  }

  .stats-title {
    font-size: 14px;
  }

  .method-item,
  .recommendation-item {
    padding: 8px;
  }

  .recommendation-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>