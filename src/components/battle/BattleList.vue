<template>
  <div class="battles-container">
    <!-- 로딩 상태 -->
    <div v-if="loading && battles.length === 0" class="battles-grid">
      <div v-for="i in skeletonCount" :key="`skeleton-${i}`" class="skeleton-card">
        <div class="skeleton-thumbnail"></div>
        <div class="skeleton-content">
          <div class="skeleton-meta"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-title short"></div>
          <div class="skeleton-metrics"></div>
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="battles.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="38" stroke="#E5E7EB" stroke-width="2" stroke-dasharray="6 4"/>
          <rect x="24" y="28" width="32" height="24" rx="4" fill="#F3F4F6"/>
          <rect x="28" y="34" width="18" height="2" rx="1" fill="#D1D5DB"/>
          <rect x="28" y="40" width="24" height="2" rx="1" fill="#D1D5DB"/>
          <rect x="28" y="46" width="12" height="2" rx="1" fill="#D1D5DB"/>
        </svg>
      </div>
      <h3 class="empty-title">아직 배틀이 없어요</h3>
      <p class="empty-desc">첫 번째 배틀을 만들어 커뮤니티와 함께 투표를 시작해보세요</p>
      <button class="create-btn" @click="$emit('create-battle')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        배틀 만들기
      </button>
    </div>

    <!-- 배틀 그리드 -->
    <div v-else :class="['battles-grid', `view-${viewMode}`]">
      <TransitionGroup name="card">
        <BattleCard
            v-for="battle in battles"
            :key="battle.id || battle.battleId"
            :battle="battle"
            @click="handleBattleClick(battle.id || battle.battleId)"
        />
      </TransitionGroup>
    </div>

    <!-- 무한 스크롤 타겟 -->
    <div v-if="hasNext && battles.length > 0" ref="observerTarget" class="load-more-area">
      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <span>불러오는 중...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BattleCard from '@/components/battle/BattleCard.vue'

const router = useRouter()

const props = defineProps({
  battles: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasNext: {
    type: Boolean,
    default: true
  },
  viewMode: {
    type: String,
    default: 'grid',
    validator: v => ['grid', 'list'].includes(v)
  }
})

const emit = defineEmits(['battle-click', 'create-battle'])
const observerTarget = ref(null)

// 반응형 스켈레톤 개수 (SSR 호환)
const skeletonCount = computed(() => {
  if (typeof window === 'undefined') return 6
  const width = window.innerWidth
  if (width < 640) return 2
  if (width < 1024) return 4
  return 6
})

const handleBattleClick = (battleId) => {
  router.push({ name: 'BattleDetail', params: { id: battleId } })
  emit('battle-click', battleId)
}

defineExpose({ observerTarget })
</script>

<style scoped>
.battles-container {
  width: 100%;
  min-height: 300px;
  padding: 16px;
  box-sizing: border-box;
}

/* ===== 그리드 레이아웃 ===== */
.battles-grid {
  display: grid;
  gap: 16px;
}

/* 그리드 뷰 - 모바일 퍼스트 */
.battles-grid.view-grid {
  grid-template-columns: 1fr;
}

/* 리스트 뷰 */
.battles-grid.view-list {
  grid-template-columns: 1fr;
  gap: 12px;
}

/* ===== 반응형 브레이크포인트 ===== */
/* 소형 태블릿 (640px+) */
@media (min-width: 640px) {
  .battles-container {
    padding: 20px;
  }

  .battles-grid.view-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* 태블릿 (768px+) */
@media (min-width: 768px) {
  .battles-container {
    padding: 24px;
  }
}

/* 데스크탑 (1024px+) */
@media (min-width: 1024px) {
  .battles-container {
    padding: 32px;
  }

  .battles-grid.view-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

/* 대형 데스크탑 (1280px+) */
@media (min-width: 1280px) {
  .battles-container {
    padding: 40px 48px;
  }
}

/* 초대형 (1536px+) */
@media (min-width: 1536px) {
  .battles-grid.view-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

/* ===== 카드 애니메이션 ===== */
.card-enter-active {
  transition: all 0.3s ease-out;
}

.card-leave-active {
  transition: all 0.2s ease-in;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.card-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.card-move {
  transition: transform 0.3s ease;
}

/* ===== 스켈레톤 UI ===== */
.skeleton-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.skeleton-thumbnail {
  width: 100%;
  padding-bottom: 56.25%;
  background: linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-meta {
  height: 14px;
  width: 40%;
  background: linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title {
  height: 18px;
  width: 85%;
  background: linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title.short {
  width: 60%;
}

.skeleton-metrics {
  height: 48px;
  margin-top: 4px;
  background: linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 10px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== 빈 상태 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 24px;
  opacity: 0.8;
}

.empty-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.3px;
}

.empty-desc {
  margin: 0 0 24px;
  font-size: 14px;
  color: #6B7280;
  line-height: 1.6;
  max-width: 280px;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.25);
  font-family: inherit;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(147, 51, 234, 0.35);
}

.create-btn:active {
  transform: translateY(0);
}

/* ===== 무한 스크롤 로딩 ===== */
.load-more-area {
  margin-top: 32px;
  min-height: 60px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== 접근성 ===== */
@media (prefers-reduced-motion: reduce) {
  .skeleton-thumbnail,
  .skeleton-meta,
  .skeleton-title,
  .skeleton-metrics,
  .spinner {
    animation: none;
  }

  .card-enter-active,
  .card-leave-active,
  .card-move {
    transition: none;
  }

  .create-btn {
    transition: none;
  }
}

/* 포커스 상태 */
.create-btn:focus-visible {
  outline: 2px solid #9333ea;
  outline-offset: 2px;
}
</style>