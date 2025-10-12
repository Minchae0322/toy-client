<template>
  <aside class="right-sidebar">
    <!-- 실시간 랭킹 -->
    <div class="widget">
      <h3 class="widget-title">실시간 랭킹</h3>
      <div
          v-for="(product, index) in topProducts"
          :key="product.id"
          class="ranking-item"
          @click="$emit('view-product', product.id)"
      >
        <div class="rank-number" :class="{ top3: index < 3 }">
          {{ index + 1 }}
        </div>
        <div class="ranking-info">
          <div class="ranking-name">{{ product.name }}</div>
          <div class="ranking-brand">{{ product.brand }}</div>
        </div>
        <div v-if="index === 0" class="trend-badge hot">급상승</div>
        <div v-else-if="index === 2" class="trend-badge new">신규</div>
      </div>
    </div>

    <!-- 내 근처 인기 -->
    <div class="widget">
      <h3 class="widget-title">내 근처 인기</h3>
      <div
          v-for="product in nearbyProducts"
          :key="product.id"
          class="ranking-item"
          @click="$emit('view-product', product.id)"
      >
        <div class="ranking-info">
          <div class="ranking-name">{{ product.name }}</div>
          <div class="ranking-meta">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 6.5C6.82843 6.5 7.5 5.82843 7.5 5C7.5 4.17157 6.82843 3.5 6 3.5C5.17157 3.5 4.5 4.17157 4.5 5C4.5 5.82843 5.17157 6.5 6 6.5Z" stroke="currentColor" stroke-width="1.2"/>
              <path d="M9.535 8.535C8.455 9.89 7.07 10.5 6 10.5C4.93 10.5 3.545 9.89 2.465 8.535C1.385 7.18 1.385 5.32 2.465 3.965C3.545 2.61 4.93 2 6 2C7.07 2 8.455 2.61 9.535 3.965C10.615 5.32 10.615 7.18 9.535 8.535Z" stroke="currentColor" stroke-width="1.2"/>
            </svg>
            <span>{{ getRandomDistance() }}</span>
            <span class="divider">·</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L7.545 4.13L11 4.605L8.5 7.045L9.09 10.485L6 8.865L2.91 10.485L3.5 7.045L1 4.605L4.455 4.13L6 1Z" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.2"/>
            </svg>
            <span>{{ formatRating(product.averageRating) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 사용자 통계 -->
    <div v-if="isLoggedIn" class="widget">
      <h3 class="widget-title">나만의 정보</h3>
      <div class="user-stats">
        <div class="user-stat-item">
          <div class="user-stat-number">{{ userStats.likedCount }}</div>
          <div class="user-stat-label">찜한 상품</div>
        </div>
        <div class="user-stat-item">
          <div class="user-stat-number">{{ userStats.reviewCount }}</div>
          <div class="user-stat-label">작성한 리뷰</div>
        </div>
        <div class="user-stat-item">
          <div class="user-stat-number">{{ userStats.productCount }}</div>
          <div class="user-stat-label">등록한 상품</div>
        </div>
      </div>
    </div>

    <!-- 카테고리별 현황 -->
    <div class="widget">
      <h3 class="widget-title">카테고리별 현황</h3>
      <div
          v-for="stat in categoryStats"
          :key="stat.categoryId"
          class="category-stat-item"
      >
        <div class="category-stat-info">
          <div class="category-stat-name">{{ stat.categoryName }}</div>
          <div class="category-stat-count">{{ stat.productCount }}개</div>
        </div>
        <div class="category-progress">
          <div
              class="category-progress-bar"
              :style="{ width: `${stat.percentage}%` }"
          ></div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  topProducts: {
    type: Array,
    required: true
  },
  nearbyProducts: {
    type: Array,
    required: true
  },
  userStats: {
    type: Object,
    required: true
  },
  categoryStats: {
    type: Array,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['view-product'])

const formatRating = (rating) => {
  if (!rating) return '0.0'
  return typeof rating === 'number' ? rating.toFixed(1) : rating
}

const getRandomDistance = () => {
  const distances = ['100m', '300m', '500m', '1km']
  return distances[Math.floor(Math.random() * distances.length)]
}
</script>

<style scoped>
.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 24px;
  height: fit-content;
}

.widget {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #F3F4F6;
}

.widget-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  letter-spacing: -0.01em;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  border-bottom: 1px solid #F9FAFB;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
  margin-bottom: 4px;
}

.ranking-item:hover {
  background: #F9FAFB;
}

.ranking-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.rank-number {
  width: 28px;
  height: 28px;
  background: #F3F4F6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #9CA3AF;
  flex-shrink: 0;
}

.rank-number.top3 {
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
}

.ranking-info {
  flex: 1;
  min-width: 0;
}

.ranking-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.ranking-brand {
  font-size: 11px;
  color: #9CA3AF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.ranking-meta {
  font-size: 11px;
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.divider {
  color: #D1D5DB;
}

.trend-badge {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.trend-badge.hot {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: white;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.25);
}

.trend-badge.new {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.25);
}

/* 사용자 통계 */
.user-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.user-stat-item {
  text-align: center;
  padding: 16px 10px;
  background: #FAFAFA;
  border-radius: 10px;
  transition: all 0.2s;
  border: 1px solid #F3F4F6;
}

.user-stat-item:hover {
  background: #F9FAFB;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.user-stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.user-stat-label {
  font-size: 11px;
  color: #6B7280;
  font-weight: 600;
}

/* 카테고리 통계 */
.category-stat-item {
  margin-bottom: 16px;
}

.category-stat-item:last-child {
  margin-bottom: 0;
}

.category-stat-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-stat-name {
  font-size: 13px;
  color: #374151;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.category-stat-count {
  font-size: 12px;
  color: #059669;
  font-weight: 700;
}

.category-progress {
  height: 6px;
  background: #F3F4F6;
  border-radius: 3px;
  overflow: hidden;
}

.category-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #059669, #047857);
  border-radius: 3px;
  transition: width 0.4s ease;
}

@media (max-width: 1024px) {
  .right-sidebar {
    display: none;
  }
}
</style>