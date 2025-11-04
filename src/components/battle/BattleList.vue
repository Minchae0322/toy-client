<template>
  <div class="battles-container">
    <!-- 로딩 상태 -->
    <div v-if="loading && battles.length === 0" class="state-container">
      <div class="loading-spinner">
        <div class="spinner-icon"></div>
        <p class="loading-text">배틀을 불러오는 중입니다</p>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="battles.length === 0" class="state-container">
      <div class="empty-state">
        <div class="empty-icon-wrapper">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div class="empty-content">
          <h3 class="empty-title">배틀이 없습니다</h3>
          <p class="empty-description">새로운 배틀을 만들어 시작해보세요</p>
        </div>
      </div>
    </div>

    <!-- 배틀 그리드 -->
    <div v-else class="battles-grid">
      <BattleCard
          v-for="battle in battles"
          :key="battle.id || battle.battleId"
          :battle="battle"
          @click="handleBattleClick(battle.id || battle.battleId)"
      />
    </div>

    <!-- Intersection Observer Target -->
    <div v-if="hasNext" ref="observerTarget" class="observer-target"></div>

    <!-- 추가 로딩 -->
    <div v-if="loading && battles.length > 0" class="loading-more">
      <div class="spinner-icon small"></div>
      <span class="loading-more-text">더 불러오는 중</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BattleCard from '@/components/battle/BattleCard.vue'

defineProps({
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
    default: 'feed'
  }
})

const emit = defineEmits(['battle-click'])

const observerTarget = ref(null)

const handleBattleClick = (battleId) => {
  emit('battle-click', battleId)
}

defineExpose({
  observerTarget
})
</script>

<style scoped>
:root {
  --font-xs: 10.5px;
  --font-sm: 12px;
  --font-base: 13px;
  --font-md: 14px;
  --font-lg: 15px;

  --weight-medium: 500;
  --weight-semibold: 550;
  --weight-bold: 600;

  --space-1: 3px;
  --space-2: 6px;
  --space-3: 10px;
  --space-4: 14px;
  --space-5: 18px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 48px;

  --neutral-0: #FFFFFF;
  --neutral-50: #FAFAFA;
  --neutral-100: #F2F2F2;
  --neutral-200: #E8E8E8;
  --neutral-300: #D4D4D4;
  --neutral-400: #A3A3A3;
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-900: #0A0A0A;
}

.battles-container {
  position: relative;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 480px;
  padding: 80px 48px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.spinner-icon {
  width: 32px;
  height: 32px;
  border: 2px solid var(--neutral-100);
  border-top-color: var(--neutral-900);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.spinner-icon.small {
  width: 18px;
  height: 18px;
  border-width: 2px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--neutral-500);
  letter-spacing: -0.008em;
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  max-width: 340px;
}

.empty-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--neutral-50);
  border-radius: 50%;
  border: 1px solid var(--neutral-200);
}

.empty-icon {
  width: 36px;
  height: 36px;
  color: var(--neutral-400);
  stroke-width: 1.5;
}

.empty-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--neutral-900);
  letter-spacing: -0.014em;
  line-height: 1.3;
  margin: 0;
}

.empty-description {
  font-size: 13px;
  font-weight: 500;
  color: var(--neutral-500);
  line-height: 1.5;
  margin: 0;
  letter-spacing: -0.006em;
}

.battles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
  gap: var(--space-5);
  padding: var(--space-2) 0;
}

@media (min-width: 640px) {
  .battles-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (min-width: 1024px) {
  .battles-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-5);
  }
}

@media (min-width: 1280px) {
  .battles-grid {
    gap: var(--space-6);
  }
}

.observer-target {
  width: 100%;
  height: 1px;
  margin: var(--space-7) 0;
  pointer-events: none;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6) 0;
  margin-top: var(--space-5);
}

.loading-more-text {
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--neutral-500);
  letter-spacing: -0.006em;
}

@media (max-width: 768px) {
  .state-container {
    min-height: 400px;
    padding: 60px 32px;
  }

  .empty-icon-wrapper {
    width: 72px;
    height: 72px;
  }

  .empty-icon {
    width: 32px;
    height: 32px;
  }

  .empty-title {
    font-size: 14px;
  }

  .empty-description {
    font-size: 12px;
  }

  .battles-grid {
    gap: var(--space-4);
  }

  .loading-more {
    padding: var(--space-5) 0;
    margin-top: var(--space-4);
  }
}

@media (max-width: 480px) {
  .battles-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner-icon {
    animation-duration: 1.5s;
  }
}
</style>