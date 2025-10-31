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
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
        </svg>
        <h3 class="empty-title">진행 중인 배틀이 없습니다</h3>
        <p class="empty-description">첫 번째 배틀을 만들어보세요</p>
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
/* ==================== Design Tokens ==================== */
:root {
  /* Typography Scale (1.250 - Major Third) */
  --font-size-xs: 0.64rem;      /* 10.24px */
  --font-size-sm: 0.8rem;       /* 12.8px */
  --font-size-base: 1rem;       /* 16px */
  --font-size-md: 1.25rem;      /* 20px */
  --font-size-lg: 1.563rem;     /* 25px */
  --font-size-xl: 1.953rem;     /* 31.25px */

  /* Spacing Scale (8px base) */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.5rem;    /* 24px */
  --space-6: 2rem;      /* 32px */
  --space-7: 2.5rem;    /* 40px */
  --space-8: 3rem;      /* 48px */
  --space-10: 4rem;     /* 64px */
  --space-12: 6rem;     /* 96px */

  /* Colors - Neutral */
  --gray-50: #FAFBFC;
  --gray-100: #F5F6F7;
  --gray-200: #EBEDF0;
  --gray-300: #DDE1E6;
  --gray-400: #C1C7CD;
  --gray-500: #9CA3AF;
  --gray-600: #6B7280;
  --gray-700: #4B5563;
  --gray-800: #374151;
  --gray-900: #1F2937;
  --gray-950: #0A0D14;

  /* Semantic Colors */
  --color-text-primary: var(--gray-950);
  --color-text-secondary: var(--gray-600);
  --color-text-tertiary: var(--gray-500);
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: var(--gray-50);
  --color-border: var(--gray-200);

  /* Elevation */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Animation */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 350ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* ==================== Container ==================== */
.battles-container {
  position: relative;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

/* ==================== State Containers ==================== */
.state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 480px;
  padding: var(--space-10);
}

/* ==================== Loading State ==================== */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.spinner-icon {
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-text-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-icon.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-secondary);
  letter-spacing: -0.01em;
  margin: 0;
}

/* ==================== Empty State ==================== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--gray-300);
  margin-bottom: var(--space-2);
}

.empty-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin: 0;
}

.empty-description {
  font-size: var(--font-size-base);
  font-weight: 400;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* ==================== Battle Grid ==================== */
.battles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 400px), 1fr));
  gap: var(--space-6);
  padding: var(--space-2) 0;
}

/* Responsive Grid */
@media (min-width: 640px) {
  .battles-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (min-width: 1024px) {
  .battles-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-7);
  }
}

@media (min-width: 1280px) {
  .battles-grid {
    gap: var(--space-8);
  }
}

/* ==================== Intersection Observer ==================== */
.observer-target {
  width: 100%;
  height: 1px;
  margin: var(--space-8) 0;
  pointer-events: none;
}

/* ==================== Loading More ==================== */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-8) 0;
  margin-top: var(--space-6);
}

.loading-more-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-tertiary);
  letter-spacing: -0.01em;
}

/* ==================== Responsive Adjustments ==================== */
@media (max-width: 768px) {
  .state-container {
    min-height: 360px;
    padding: var(--space-8);
  }

  .empty-icon {
    width: 48px;
    height: 48px;
  }

  .empty-title {
    font-size: var(--font-size-base);
  }

  .empty-description {
    font-size: var(--font-size-sm);
  }

  .battles-grid {
    gap: var(--space-5);
  }

  .loading-more {
    padding: var(--space-6) 0;
    margin-top: var(--space-4);
  }
}

@media (max-width: 480px) {
  .battles-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}

/* ==================== Accessibility ==================== */
@media (prefers-reduced-motion: reduce) {
  .spinner-icon {
    animation-duration: 1.5s;
  }
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text-primary: var(--gray-50);
    --color-text-secondary: var(--gray-400);
    --color-text-tertiary: var(--gray-500);
    --color-bg-primary: var(--gray-950);
    --color-bg-secondary: var(--gray-900);
    --color-border: var(--gray-800);
  }
}
</style>