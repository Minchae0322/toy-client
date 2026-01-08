<template>
  <div class="battles-container">
    <!-- 로딩 스켈레톤 -->
    <div v-if="loading && battles.length === 0" class="battles-grid">
      <div v-for="i in skeletonCount" :key="`skeleton-${i}`" class="skeleton-card">
        <div class="skeleton-thumbnail"></div>
        <div class="skeleton-content">
          <div class="skeleton-line w-24"></div>
          <div class="skeleton-line w-full"></div>
          <div class="skeleton-line w-3/4"></div>
          <div class="skeleton-line w-32 mt"></div>
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="battles.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <p class="empty-text">아직 배틀이 없어요</p>
      <button class="create-btn" @click="$emit('create-battle')">
        + 새 배틀 만들기
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

    <!-- 무한 스크롤 -->
    <div v-if="hasNext && battles.length > 0" ref="observerTarget" class="load-more">
      <div v-if="loading" class="loading">
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
  battles: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: true },
  viewMode: { type: String, default: 'grid', validator: v => ['grid', 'list'].includes(v) }
})

const emit = defineEmits(['battle-click', 'create-battle'])
const observerTarget = ref(null)

const skeletonCount = computed(() => {
  if (typeof window === 'undefined') return 6
  const w = window.innerWidth
  return w < 640 ? 2 : w < 1024 ? 4 : 6
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
  min-height: 200px;
}

/* 그리드 */
.battles-grid {
  display: grid;
  gap: 12px;
}

.battles-grid.view-grid {
  grid-template-columns: repeat(3, 1fr);
}

.battles-grid.view-list {
  grid-template-columns: 1fr;
}

/* 스켈레톤 */
.skeleton-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.skeleton-thumbnail {
  aspect-ratio: 16/10;
  background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-line.w-24 { width: 96px; }
.skeleton-line.w-full { width: 100%; }
.skeleton-line.w-3\/4 { width: 75%; }
.skeleton-line.w-32 { width: 128px; }
.skeleton-line.mt { margin-top: 4px; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
}

.empty-icon {
  margin-bottom: 16px;
  color: #cbd5e1;
}

.empty-text {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px;
}

.create-btn {
  font-size: 14px;
  font-weight: 500;
  color: #9333ea;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.2s;
}

.create-btn:hover {
  color: #7e22ce;
}

/* 로딩 */
.load-more {
  margin-top: 24px;
  min-height: 48px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e2e8f0;
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 애니메이션 */
.card-enter-active {
  transition: all 0.3s ease-out;
}

.card-leave-active {
  transition: all 0.2s ease-in;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.card-leave-to {
  opacity: 0;
}

.card-move {
  transition: transform 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-thumbnail,
  .skeleton-line,
  .spinner {
    animation: none;
  }

  .card-enter-active,
  .card-leave-active,
  .card-move {
    transition: none;
  }
}

/* 모바일: 2열 그리드 */
@media (max-width: 768px) {
  .battles-grid.view-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>