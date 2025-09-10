<template>
  <div class="empty-trade-state">
    <!-- 메인 일러스트레이션 -->
    <div class="empty-illustration">
      <div class="empty-icon" :class="emptyType">
        {{ getEmptyIcon() }}
      </div>
      <div class="floating-elements">
        <div class="floating-element" v-for="n in 3" :key="n" :style="getFloatingStyle(n)">
          {{ getFloatingEmoji(n) }}
        </div>
      </div>
    </div>

    <!-- 메시지 섹션 -->
    <div class="empty-message">
      <h3 class="empty-title">{{ getEmptyTitle() }}</h3>
      <p class="empty-description">{{ getEmptyDescription() }}</p>

      <!-- 필터 태그들 (활성 필터가 있을 때) -->
      <div v-if="hasActiveFilters" class="active-filters-info">
        <p class="filters-note">현재 적용된 필터:</p>
        <div class="filter-tags">
          <span
              v-for="filter in activeFilterList"
              :key="filter.key"
              class="filter-tag"
          >
            {{ filter.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- 액션 버튼들 -->
    <div class="empty-actions">
      <!-- 기본 액션들 -->
      <div class="primary-actions">
        <button
            v-if="hasActiveFilters"
            class="action-btn primary clear-filters-btn"
            @click="clearFilters"
        >
          🔍 모든 거래 보기
        </button>

        <button
            class="action-btn secondary sell-btn"
            @click="startSelling"
        >
          💰 내가 첫 판매자가 되어보세요!
        </button>
      </div>

      <!-- 부가 액션들 -->
      <div class="secondary-actions" v-if="!hasActiveFilters">
        <button
            class="action-btn tertiary"
            @click="goToPopularProducts"
        >
          🔥 인기 상품 보러가기
        </button>

        <button
            class="action-btn tertiary"
            @click="setUpNotification"
        >
          🔔 새 거래 알림 설정
        </button>
      </div>

      <!-- 소셜 공유 -->
      <div class="social-actions" v-if="showSocialShare">
        <p class="social-text">친구들과 함께 거래해보세요!</p>
        <div class="social-buttons">
          <button
              class="social-btn"
              @click="shareToKakao"
              title="카카오톡 공유"
          >
            <span class="social-icon">💬</span>
            카카오톡
          </button>
          <button
              class="social-btn"
              @click="shareToLink"
              title="링크 복사"
          >
            <span class="social-icon">🔗</span>
            링크 복사
          </button>
        </div>
      </div>
    </div>

    <!-- 팁 섹션 -->
    <div class="tips-section" v-if="showTips">
      <h4 class="tips-title">💡 판매 팁</h4>
      <div class="tips-grid">
        <div
            v-for="tip in tips"
            :key="tip.id"
            class="tip-item"
        >
          <div class="tip-icon">{{ tip.icon }}</div>
          <div class="tip-content">
            <div class="tip-title">{{ tip.title }}</div>
            <div class="tip-description">{{ tip.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 통계 정보 -->
    <div class="stats-section" v-if="stats && !hasActiveFilters">
      <h4 class="stats-title">📊 이런 상품들이 인기예요</h4>
      <div class="stats-grid">
        <div
            v-for="stat in stats"
            :key="stat.category"
            class="stat-item"
            @click="applySuggestedFilter(stat)"
        >
          <div class="stat-icon">{{ stat.icon }}</div>
          <div class="stat-info">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-count">{{ stat.count }}건 거래중</div>
          </div>
          <div class="stat-action">👉</div>
        </div>
      </div>
    </div>

    <!-- 최근 활동 -->
    <div class="recent-activity" v-if="recentActivity.length > 0">
      <h4 class="activity-title">⏰ 최근 거래 활동</h4>
      <div class="activity-list">
        <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="activity-item"
        >
          <div class="activity-time">{{ formatTime(activity.time) }}</div>
          <div class="activity-content">
            <strong>{{ activity.productName }}</strong> {{ activity.action }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Props 정의
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  },
  emptyType: {
    type: String,
    default: 'no-trades', // 'no-trades' | 'filtered' | 'network-error' | 'loading-error'
    validator: value => ['no-trades', 'filtered', 'network-error', 'loading-error'].includes(value)
  },
  productName: {
    type: String,
    default: ''
  },
  showSocialShare: {
    type: Boolean,
    default: true
  },
  showTips: {
    type: Boolean,
    default: true
  },
  stats: {
    type: Array,
    default: () => []
  },
  recentActivity: {
    type: Array,
    default: () => []
  }
});

// Emit 정의
const emit = defineEmits([
  'clear-filters',
  'start-selling',
  'go-to-popular',
  'setup-notification',
  'apply-filter',
  'share-kakao',
  'share-link'
]);

// 반응형 데이터
const animationDelay = ref(0);

// 계산된 속성
const hasActiveFilters = computed(() => {
  if (!props.filters) return false;
  return Object.keys(props.filters).some(key => {
    const value = props.filters[key];
    if (key === 'priceRange') {
      return value && (value.min > 0 || value.max < 100000);
    }
    if (['sort'].includes(key)) {
      return false; // 정렬은 필터로 간주하지 않음
    }
    return value && value !== 'all' && value !== '';
  });
});

const activeFilterList = computed(() => {
  if (!hasActiveFilters.value) return [];

  const filters = [];

  if (props.filters.condition && props.filters.condition !== 'all') {
    const conditionLabels = {
      'new': '새상품',
      'like-new': '거의새것',
      'used': '사용감있음'
    };
    filters.push({
      key: 'condition',
      label: conditionLabels[props.filters.condition]
    });
  }

  if (props.filters.tradeMethod && props.filters.tradeMethod !== 'all') {
    const methodLabels = {
      'direct': '직거래',
      'delivery': '택배',
      'convenience': '편의점택배'
    };
    filters.push({
      key: 'tradeMethod',
      label: methodLabels[props.filters.tradeMethod]
    });
  }

  if (props.filters.priceRange) {
    const { min, max } = props.filters.priceRange;
    if (min > 0 || max < 100000) {
      filters.push({
        key: 'priceRange',
        label: `${min.toLocaleString()}원 - ${max.toLocaleString()}원`
      });
    }
  }

  if (props.filters.maxDistance && props.filters.maxDistance < 10000) {
    const distance = props.filters.maxDistance >= 1000
        ? `${(props.filters.maxDistance / 1000).toFixed(1)}km`
        : `${props.filters.maxDistance}m`;
    filters.push({
      key: 'maxDistance',
      label: `${distance} 이내`
    });
  }

  return filters;
});

// 팁 데이터
const tips = [
  {
    id: 1,
    icon: '📸',
    title: '좋은 사진 올리기',
    description: '밝고 선명한 사진이 거래 성공률을 높여요'
  },
  {
    id: 2,
    icon: '💬',
    title: '빠른 답변',
    description: '문의에 빨리 답변할수록 거래가 성사돼요'
  },
  {
    id: 3,
    icon: '📍',
    title: '편리한 거래장소',
    description: '지하철역이나 카페 근처가 좋아요'
  },
  {
    id: 4,
    icon: '⭐',
    title: '평점 관리',
    description: '좋은 평점은 신뢰도를 높여줘요'
  }
];

// 유틸리티 함수들
const getEmptyIcon = () => {
  switch (props.emptyType) {
    case 'filtered':
      return '🔍';
    case 'network-error':
      return '📶';
    case 'loading-error':
      return '⚠️';
    case 'no-trades':
    default:
      return '📦';
  }
};

const getEmptyTitle = () => {
  switch (props.emptyType) {
    case 'filtered':
      return '검색 결과가 없어요';
    case 'network-error':
      return '네트워크 연결을 확인해주세요';
    case 'loading-error':
      return '데이터를 불러올 수 없어요';
    case 'no-trades':
    default:
      return hasActiveFilters.value
          ? '조건에 맞는 거래가 없어요'
          : `아직 판매중인 ${props.productName || '상품'}이 없어요`;
  }
};

const getEmptyDescription = () => {
  switch (props.emptyType) {
    case 'filtered':
      return '다른 조건으로 검색해보시거나 필터를 초기화해보세요';
    case 'network-error':
      return '인터넷 연결을 확인하고 다시 시도해주세요';
    case 'loading-error':
      return '잠시 후 다시 시도해주세요';
    case 'no-trades':
    default:
      return hasActiveFilters.value
          ? '필터 조건을 조정해보시거나 모든 거래를 확인해보세요'
          : '이 상품의 첫 번째 판매자가 되어보세요! 다른 사람들이 관심있어 할 거예요.';
  }
};

const getFloatingEmoji = (index) => {
  const emojis = ['✨', '💫', '⭐'];
  return emojis[index - 1];
};

const getFloatingStyle = (index) => {
  return {
    animationDelay: `${index * 0.5}s`,
    left: `${20 + index * 20}%`,
    animationDuration: `${2 + index}s`
  };
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
  return date.toLocaleDateString();
};

// 이벤트 핸들러
const clearFilters = () => {
  emit('clear-filters');
};

const startSelling = () => {
  emit('start-selling');
};

const goToPopularProducts = () => {
  emit('go-to-popular');
};

const setUpNotification = () => {
  emit('setup-notification');
};

const applySuggestedFilter = (stat) => {
  emit('apply-filter', stat.filter);
};

const shareToKakao = () => {
  emit('share-kakao');
};

const shareToLink = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert('링크가 복사되었습니다!');
  });
  emit('share-link');
};

// 라이프사이클
onMounted(() => {
  // 애니메이션 지연 시간 설정
  animationDelay.value = Math.random() * 1000;
});
</script>

<style scoped>
.empty-trade-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

/* 메인 일러스트레이션 */
.empty-illustration {
  position: relative;
  margin-bottom: 32px;
}

.empty-icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin-bottom: 16px;
  position: relative;
  animation: float 3s ease-in-out infinite;
}

.empty-icon.no-trades {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e0);
}

.empty-icon.filtered {
  background: linear-gradient(135deg, #bee3f8, #90cdf4);
}

.empty-icon.network-error {
  background: linear-gradient(135deg, #fed7d7, #feb2b2);
}

.empty-icon.loading-error {
  background: linear-gradient(135deg, #feebcb, #f6ad55);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  font-size: 20px;
  animation: floating 3s ease-in-out infinite;
  opacity: 0.7;
}

@keyframes floating {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

/* 메시지 섹션 */
.empty-message {
  margin-bottom: 32px;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
}

.empty-description {
  font-size: 16px;
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 20px;
}

.active-filters-info {
  background: #f7fafc;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.filters-note {
  font-size: 14px;
  color: #718096;
  margin-bottom: 8px;
}

.filter-tags {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tag {
  background: #1DCD9F;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

/* 액션 버튼들 */
.empty-actions {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 400px;
}

.primary-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.secondary-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #1DCD9F, #16a085);
  color: white;
  box-shadow: 0 4px 15px rgba(29, 205, 159, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(29, 205, 159, 0.4);
}

.action-btn.secondary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.action-btn.secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.action-btn.tertiary {
  background: white;
  color: #4a5568;
  border: 2px solid #e2e8f0;
  font-size: 14px;
  padding: 8px 16px;
}

.action-btn.tertiary:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

/* 소셜 공유 */
.social-actions {
  text-align: center;
}

.social-text {
  font-size: 14px;
  color: #718096;
  margin-bottom: 12px;
}

.social-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.social-btn {
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.social-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.social-icon {
  font-size: 16px;
}

/* 팁 섹션 */
.tips-section {
  width: 100%;
  max-width: 500px;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
}

.tips-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.tip-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  text-align: left;
  transition: all 0.2s;
}

.tip-item:hover {
  border-color: #1DCD9F;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(29, 205, 159, 0.1);
}

.tip-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.tip-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.tip-description {
  font-size: 12px;
  color: #4a5568;
  line-height: 1.4;
}

/* 통계 섹션 */
.stats-section {
  width: 100%;
  max-width: 500px;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
}

.stats-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.stat-item:hover {
  background: #f7fafc;
  border-color: #1DCD9F;
  transform: translateX(4px);
}

.stat-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 50%;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 2px;
}

.stat-count {
  font-size: 12px;
  color: #718096;
}

.stat-action {
  font-size: 20px;
  color: #1DCD9F;
  transition: transform 0.2s;
}

.stat-item:hover .stat-action {
  transform: translateX(4px);
}

/* 최근 활동 */
.recent-activity {
  width: 100%;
  max-width: 500px;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
}

.activity-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  background: #f7fafc;
  border-radius: 8px;
  padding: 12px;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-time {
  font-size: 11px;
  color: #718096;
  white-space: nowrap;
}

.activity-content {
  flex: 1;
  margin-left: 12px;
  font-size: 13px;
  color: #4a5568;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .empty-trade-state {
    padding: 40px 16px;
  }

  .empty-icon {
    width: 100px;
    height: 100px;
    font-size: 40px;
  }

  .empty-title {
    font-size: 20px;
  }

  .empty-description {
    font-size: 14px;
  }

  .primary-actions,
  .secondary-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    font-size: 14px;
    padding: 10px 20px;
  }

  .tips-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .social-buttons {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .stat-item {
    padding: 12px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }

  .stat-label {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .empty-trade-state {
    padding: 30px 12px;
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }

  .empty-title {
    font-size: 18px;
  }

  .filter-tags {
    flex-direction: column;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .activity-content {
    margin-left: 0;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .empty-title {
    color: #e2e8f0;
  }

  .empty-description {
    color: #cbd5e0;
  }

  .active-filters-info {
    background: #2d3748;
  }

  .filters-note {
    color: #a0aec0;
  }

  .action-btn.tertiary {
    background: #2d3748;
    color: #e2e8f0;
    border-color: #4a5568;
  }

  .action-btn.tertiary:hover {
    background: #4a5568;
    border-color: #718096;
  }

  .social-btn {
    background: #2d3748;
    color: #e2e8f0;
    border-color: #4a5568;
  }

  .social-btn:hover {
    background: #4a5568;
    border-color: #718096;
  }

  .tip-item,
  .stat-item {
    background: #2d3748;
    border-color: #4a5568;
  }

  .tip-item:hover,
  .stat-item:hover {
    background: #4a5568;
  }

  .tip-title,
  .stat-label,
  .tips-title,
  .stats-title,
  .activity-title {
    color: #e2e8f0;
  }

  .tip-description,
  .stat-count,
  .activity-content {
    color: #cbd5e0;
  }

  .stat-icon {
    background: #4a5568;
  }

  .activity-item {
    background: #4a5568;
  }

  .activity-time {
    color: #a0aec0;
  }
}

/* 애니메이션 개선 */
.empty-trade-state {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tip-item,
.stat-item {
  animation: slideInUp 0.4s ease-out;
  animation-fill-mode: both;
}

.tip-item:nth-child(1) { animation-delay: 0.1s; }
.tip-item:nth-child(2) { animation-delay: 0.2s; }
.tip-item:nth-child(3) { animation-delay: 0.3s; }
.tip-item:nth-child(4) { animation-delay: 0.4s; }

.stat-item:nth-child(1) { animation-delay: 0.1s; }
.stat-item:nth-child(2) { animation-delay: 0.2s; }
.stat-item:nth-child(3) { animation-delay: 0.3s; }

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>