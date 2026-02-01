<template>
  <div class="battles-container">
    <!-- 로딩 스켈레톤 -->
    <div v-if="loading && battles.length === 0" class="battles-grid">
      <article v-for="i in skeletonCount" :key="`skeleton-${i}`" class="skeleton-card">
        <!-- 썸네일 영역 -->
        <div class="skeleton-thumbnail">
          <div class="skeleton-image"></div>
          <!-- 배지 영역 -->
          <div class="skeleton-badges-top">
            <span class="skeleton-badge"></span>
            <span class="skeleton-badge small"></span>
          </div>
          <span class="skeleton-dday-badge"></span>
        </div>
        <!-- 컨텐츠 영역 -->
        <div class="skeleton-content">
          <div class="skeleton-category"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-title short"></div>
          <div class="skeleton-stats">
            <span class="skeleton-stat"></span>
            <span class="skeleton-stat"></span>
            <span class="skeleton-stat"></span>
          </div>
          <!-- 푸터 영역 -->
          <div class="skeleton-footer">
            <div class="skeleton-creator">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-creator-name"></div>
            </div>
            <div class="skeleton-action-hint"></div>
          </div>
        </div>
      </article>
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

/* ===== 스켈레톤 애니메이션 ===== */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ===== 스켈레톤 카드 (BattleCard와 동일한 레이아웃) ===== */
.skeleton-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  pointer-events: none;
}

/* 썸네일 영역 - BattleCard .card-thumbnail과 동일 */
.skeleton-thumbnail {
  position: relative;
  aspect-ratio: 16/10;
  background: #f8fafc;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 100%;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 배지 영역 - BattleCard .badges-top과 동일 */
.skeleton-badges-top {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
}

.skeleton-badge {
  width: 45px;
  height: 18px;
  background-color: rgba(229, 231, 235, 0.8);
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 4px;
}

.skeleton-badge.small {
  width: 30px;
}

.skeleton-dday-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 35px;
  height: 18px;
  background-color: rgba(229, 231, 235, 0.8);
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 4px;
}

/* 컨텐츠 영역 - BattleCard .card-content와 동일 */
.skeleton-content {
  padding: 16px;
}

.skeleton-category {
  width: 50px;
  height: 11px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 4px;
  margin-bottom: 6px;
}

.skeleton-title {
  width: 100%;
  height: 15px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 4px;
  margin-bottom: 6px;
}

.skeleton-title.short {
  width: 70%;
  margin-bottom: 10px;
}

/* 통계 영역 - BattleCard .stats와 동일 */
.skeleton-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 0;
}

.skeleton-stat {
  width: 55px;
  height: 11px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 4px;
}

.skeleton-stat:nth-child(2) { width: 50px; }
.skeleton-stat:nth-child(3) { width: 45px; }

/* 푸터 영역 - BattleCard .card-footer와 동일 */
.skeleton-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.skeleton-creator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  flex-shrink: 0;
}

.skeleton-creator-name {
  width: 50px;
  height: 11px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 4px;
}

.skeleton-action-hint {
  width: 60px;
  height: 11px;
  background-color: #e5e7eb;
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 4px;
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

/* 큰 화면: gap 확대 및 스켈레톤 확대 */
@media (min-width: 1280px) {
  .battles-grid {
    gap: 20px;
  }

  .skeleton-card {
    border-radius: 20px;
  }

  .skeleton-badges-top {
    top: 10px;
    left: 10px;
    gap: 6px;
  }

  .skeleton-badge {
    width: 52px;
    height: 22px;
    border-radius: 6px;
  }

  .skeleton-badge.small {
    width: 36px;
  }

  .skeleton-dday-badge {
    top: 10px;
    right: 10px;
    width: 42px;
    height: 22px;
    border-radius: 6px;
  }

  .skeleton-content {
    padding: 20px;
  }

  .skeleton-category {
    width: 60px;
    height: 13px;
    margin-bottom: 8px;
  }

  .skeleton-title {
    height: 18px;
    margin-bottom: 8px;
  }

  .skeleton-title.short {
    margin-bottom: 12px;
  }

  .skeleton-stats {
    gap: 14px;
  }

  .skeleton-stat {
    width: 65px;
    height: 13px;
  }

  .skeleton-stat:nth-child(2) { width: 58px; }
  .skeleton-stat:nth-child(3) { width: 52px; }

  .skeleton-footer {
    margin-top: 14px;
    padding-top: 14px;
  }

  .skeleton-avatar {
    width: 26px;
    height: 26px;
  }

  .skeleton-creator-name {
    width: 60px;
    height: 13px;
  }

  .skeleton-action-hint {
    width: 70px;
    height: 13px;
  }
}

/* 접근성: 모션 감소 선호 시 */
@media (prefers-reduced-motion: reduce) {
  .skeleton-image,
  .skeleton-badge,
  .skeleton-dday-badge,
  .skeleton-category,
  .skeleton-title,
  .skeleton-stat,
  .skeleton-avatar,
  .skeleton-creator-name,
  .skeleton-action-hint,
  .spinner {
    animation: none;
    background-color: #e5e7eb;
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

  /* 모바일 스켈레톤 - BattleCard 모바일과 동일 */
  .skeleton-card {
    border-radius: 12px;
  }

  .skeleton-thumbnail {
    aspect-ratio: 4/3;
  }

  .skeleton-badges-top {
    top: 6px;
    left: 6px;
    gap: 3px;
  }

  .skeleton-badge {
    width: 35px;
    height: 15px;
  }

  .skeleton-badge.small {
    width: 25px;
  }

  .skeleton-dday-badge {
    top: 6px;
    right: 6px;
    width: 28px;
    height: 15px;
  }

  .skeleton-content {
    padding: 10px;
  }

  .skeleton-category {
    width: 40px;
    height: 10px;
    margin-bottom: 4px;
  }

  .skeleton-title {
    height: 12px;
    margin-bottom: 4px;
  }

  .skeleton-title.short {
    width: 60%;
    margin-bottom: 6px;
  }

  .skeleton-stats {
    gap: 6px;
  }

  .skeleton-stat {
    width: 45px;
    height: 10px;
  }

  .skeleton-stat:nth-child(2) { width: 40px; }
  .skeleton-stat:nth-child(3) { width: 35px; }

  .skeleton-footer {
    margin-top: 8px;
    padding-top: 8px;
  }

  .skeleton-avatar {
    width: 16px;
    height: 16px;
  }

  .skeleton-creator-name {
    width: 40px;
    height: 10px;
  }

  .skeleton-action-hint {
    display: none;
  }
}
</style>