<template>
  <div class="battles-container">
    <!-- 로딩 상태 - 스켈레톤 UI -->
    <div v-if="loading && battles.length === 0" class="loading-grid">
      <div v-for="i in 6" :key="`skeleton-${i}`" class="skeleton-card">
        <div class="skeleton-thumbnail"></div>
        <div class="skeleton-content">
          <div class="skeleton-meta"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-metrics"></div>
        </div>
      </div>
    </div>

    <!-- 빈 상태 - 개선된 일러스트레이션 -->
    <div v-else-if="battles.length === 0" class="empty-state">
      <div class="empty-illustration">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="58" stroke="url(#gradient)" stroke-width="2" stroke-dasharray="8 4" opacity="0.2"/>
          <rect x="35" y="40" width="50" height="40" rx="8" fill="url(#gradient)" opacity="0.1"/>
          <rect x="40" y="50" width="30" height="3" rx="1.5" fill="url(#gradient)" opacity="0.3"/>
          <rect x="40" y="58" width="40" height="3" rx="1.5" fill="url(#gradient)" opacity="0.2"/>
          <rect x="40" y="66" width="20" height="3" rx="1.5" fill="url(#gradient)" opacity="0.2"/>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="120" y2="120">
              <stop stop-color="#6366F1"/>
              <stop offset="1" stop-color="#8B5CF6"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h3 class="empty-title">아직 배틀이 없어요</h3>
      <p class="empty-description">
        첫 번째 배틀을 만들어 커뮤니티와 함께 투표를 시작해보세요
      </p>
      <button class="empty-action">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        배틀 만들기
      </button>
    </div>

    <!-- 배틀 그리드 - 반응형 최적화 -->
    <div v-else :class="['battles-grid', `view-${viewMode}`]">
      <transition-group name="battle-card">
        <BattleCard
            v-for="battle in battles"
            :key="battle.id || battle.battleId"
            :battle="battle"
            @click="handleBattleClick(battle.id || battle.battleId)"
        />
      </transition-group>
    </div>

    <!-- Intersection Observer Target -->
    <div v-if="hasNext" ref="observerTarget" class="observer-target">
      <div v-if="loading && battles.length > 0" class="loading-more">
        <div class="loading-spinner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span>더 불러오는 중...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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
    validator: value => ['grid', 'list'].includes(value)
  }
})

const emit = defineEmits(['battle-click', 'create-battle'])

const observerTarget = ref(null)

const handleBattleClick = (battleId) => {
  router.push({ name: 'BattleDetail', params: { id: battleId } })
  emit('battle-click', battleId)
}

defineExpose({
  observerTarget
})
</script>

<style scoped>
.battles-container {
  width: 100%;
  min-height: 400px;
}

/* 배틀 그리드 - 반응형 최적화 */
.battles-grid {
  display: grid;
  gap: 24px;
  animation: fadeIn 0.5s ease-out;
}

.battles-grid.view-grid {
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
}

.battles-grid.view-list {
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .battles-grid.view-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .battles-grid.view-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1536px) {
  .battles-grid.view-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 카드 애니메이션 */
.battle-card-enter-active,
.battle-card-leave-active {
  transition: all 0.3s ease;
}

.battle-card-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.battle-card-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 로딩 그리드 - 스켈레톤 UI */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

@media (min-width: 768px) {
  .loading-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .loading-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.skeleton-card {
  border-radius: 16px;
  overflow: hidden;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.skeleton-thumbnail {
  width: 100%;
  padding-bottom: 56.25%;
  background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  padding: 20px;
}

.skeleton-meta {
  height: 16px;
  width: 60%;
  background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-title {
  height: 20px;
  width: 90%;
  background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 16px;
}

.skeleton-metrics {
  height: 60px;
  background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 빈 상태 - 일러스트레이션 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  animation: fadeIn 0.6s ease-out;
}

.empty-illustration {
  margin-bottom: 32px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.empty-description {
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 24px;
  max-width: 320px;
  line-height: 1.6;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  font-family: inherit;
}

.empty-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.empty-action:active {
  transform: translateY(0);
}

/* Observer Target & Loading More */
.observer-target {
  width: 100%;
  min-height: 1px;
  margin-top: 40px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .skeleton-thumbnail,
  .skeleton-meta,
  .skeleton-title,
  .skeleton-metrics,
  .loading-spinner,
  .empty-illustration {
    animation: none;
  }

  .battle-card-enter-active,
  .battle-card-leave-active {
    transition: none;
  }
}
</style>