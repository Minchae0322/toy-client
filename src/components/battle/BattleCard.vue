<template>
  <article
      v-if="battle && battle.title"
      class="battle-card"
      @click="$emit('click', battle.id || battle.battleId)"
      role="button"
      tabindex="0"
      @keydown.enter="$emit('click', battle.id || battle.battleId)"
  >
    <!-- Header: 카테고리 & 배지 -->
    <header class="card-header">
      <span class="category-label">{{ categoryName }}</span>
      <span class="permission-badge" :class="`badge-${permissionClass}`">
        {{ permissionLabel }}
      </span>
    </header>

    <!-- Main Content: 제목 -->
    <h3 class="card-title">{{ battle.title }}</h3>

    <!-- Statistics Section -->
    <div class="card-stats">
      <div class="stat-item">
        <span class="stat-value">{{ formatNumber(battle.totalParticipants || battle.participantCount) }}</span>
        <span class="stat-label">참여자</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ formatNumber(battle.totalVotes) }}</span>
        <span class="stat-label">투표</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ itemCount }}</span>
        <span class="stat-label">아이템</span>
      </div>
    </div>

    <!-- Footer: 생성자 & D-Day -->
    <footer class="card-footer">
      <div class="creator-info">
        <svg class="creator-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
        </svg>
        <span class="creator-name">{{ creatorNickname }}</span>
      </div>
      <div class="dday-badge" :class="ddayClass">
        <svg v-if="dDay <= 7 && dDay > 0" class="dday-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
        </svg>
        <span class="dday-text">{{ dDayText }}</span>
      </div>
    </footer>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  battle: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

defineEmits(['click'])

// ==================== 포맷팅 ====================

const formatNumber = (num) => {
  if (!num || num === 0) return '0'
  if (num >= 10000) {
    return Math.floor(num / 1000) / 10 + '만'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// ==================== 카테고리 ====================

const categoryName = computed(() => {
  try {
    if (props.battle?.subCategoryDetail) {
      return props.battle.subCategoryDetail.subCategoryName ||
          props.battle.subCategoryDetail.categoryName ||
          '기타'
    }
    if (props.battle?.categoryName) {
      return props.battle.categoryName
    }
    return '기타'
  } catch (error) {
    console.error('카테고리 이름 파싱 오류:', error)
    return '기타'
  }
})

// ==================== 권한 타입 ====================

const permissionLabel = computed(() => {
  try {
    const type = props.battle?.itemAddPermissionType
    if (type === 'CREATOR_ONLY') return '큐레이션'
    if (type === 'PUBLIC_FREE') return '오픈'
    if (type === 'PUBLIC_APPROVAL') return '승인제'
    if (props.battle?.battleType === 'CURATION') return '큐레이션'
    if (props.battle?.battleType === 'OPEN') return '오픈배틀'
    return '큐레이션'
  } catch (error) {
    console.error('권한 레이블 파싱 오류:', error)
    return '큐레이션'
  }
})

const permissionClass = computed(() => {
  try {
    const type = props.battle?.itemAddPermissionType
    if (type === 'CREATOR_ONLY') return 'curation'
    if (type === 'PUBLIC_FREE') return 'open'
    if (type === 'PUBLIC_APPROVAL') return 'approval'
    if (props.battle?.battleType === 'CURATION') return 'curation'
    return 'curation'
  } catch (error) {
    console.error('권한 클래스 파싱 오류:', error)
    return 'curation'
  }
})

// ==================== 아이템 수 ====================

const itemCount = computed(() => {
  try {
    if (props.battle?.items && Array.isArray(props.battle.items)) {
      return props.battle.items.length
    }
    if (props.battle?.options && Array.isArray(props.battle.options)) {
      return props.battle.options.length
    }
    return props.battle?.itemCount || 0
  } catch (error) {
    console.error('아이템 수 파싱 오류:', error)
    return 0
  }
})

// ==================== 생성자 정보 ====================

const creatorNickname = computed(() => {
  try {
    if (props.battle?.creatorUserInfo?.nickname) {
      return props.battle.creatorUserInfo.nickname
    }
    if (props.battle?.createdBy?.nickname) {
      return props.battle.createdBy.nickname
    }
    return '알 수 없음'
  } catch (error) {
    console.error('생성자 닉네임 파싱 오류:', error)
    return '알 수 없음'
  }
})

// ==================== D-Day 계산 ====================

const dDay = computed(() => {
  try {
    if (!props.battle?.endDate) return 0
    const endDate = new Date(props.battle.endDate)
    const now = new Date()
    const diff = endDate - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  } catch (error) {
    console.error('D-Day 계산 오류:', error)
    return 0
  }
})

const dDayText = computed(() => {
  try {
    const status = props.battle?.status
    if (status === 'CLOSED' || status === 'EARLY_CLOSED' || status === 'ENDED') {
      return '종료됨'
    }
    if (status === 'DRAFT') {
      return '임시저장'
    }
    const days = dDay.value
    if (days < 0) return '종료됨'
    if (days === 0) return '오늘 마감'
    return `D-${days}`
  } catch (error) {
    console.error('D-Day 텍스트 파싱 오류:', error)
    return 'D-0'
  }
})

const ddayClass = computed(() => {
  const days = dDay.value
  if (days <= 0) return 'dday-ended'
  if (days <= 3) return 'dday-critical'
  if (days <= 7) return 'dday-urgent'
  return 'dday-normal'
})
</script>

<style scoped>
/* ==================== Design Tokens ==================== */
:root {
  /* Typography */
  --font-xs: 0.688rem;     /* 11px */
  --font-sm: 0.813rem;     /* 13px */
  --font-base: 0.938rem;   /* 15px */
  --font-md: 1.063rem;     /* 17px */
  --font-lg: 1.25rem;      /* 20px */
  --font-xl: 1.5rem;       /* 24px */

  /* Spacing */
  --space-1: 0.25rem;      /* 4px */
  --space-2: 0.5rem;       /* 8px */
  --space-3: 0.75rem;      /* 12px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-7: 2rem;         /* 32px */

  /* Colors - Neutral */
  --neutral-50: #FAFBFC;
  --neutral-100: #F5F6F7;
  --neutral-200: #EBEDF0;
  --neutral-300: #DDE1E6;
  --neutral-400: #C1C7CD;
  --neutral-500: #9CA3AF;
  --neutral-600: #6B7280;
  --neutral-700: #4B5563;
  --neutral-800: #374151;
  --neutral-900: #1F2937;
  --neutral-950: #111827;

  /* Semantic Colors */
  --text-primary: var(--neutral-950);
  --text-secondary: var(--neutral-600);
  --text-tertiary: var(--neutral-500);
  --bg-primary: #FFFFFF;
  --bg-secondary: var(--neutral-50);
  --border-light: var(--neutral-200);
  --border-default: var(--neutral-300);

  /* Accent Colors */
  --accent-curation-bg: #FEF3C7;
  --accent-curation-text: #92400E;
  --accent-open-bg: #DBEAFE;
  --accent-open-text: #1E40AF;
  --accent-approval-bg: #FCE7F3;
  --accent-approval-text: #9D174D;

  /* Status Colors */
  --status-critical: #DC2626;
  --status-urgent: #EA580C;
  --status-normal: var(--neutral-700);
  --status-ended: var(--neutral-500);

  /* Effects */
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 1rem;       /* 16px */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 12px 24px -4px rgba(0, 0, 0, 0.12);
  --shadow-hover: 0 16px 32px -8px rgba(0, 0, 0, 0.15);
}

/* ==================== Card Container ==================== */
.battle-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
  isolation: isolate;
}

.battle-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: var(--radius-lg);
  padding: 1px;
  background: linear-gradient(135deg, transparent, var(--border-default));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.battle-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
  border-color: var(--border-default);
}

.battle-card:hover::before {
  opacity: 1;
}

.battle-card:active {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

/* Focus state for accessibility */
.battle-card:focus {
  outline: 2px solid var(--neutral-400);
  outline-offset: 2px;
}

.battle-card:focus:not(:focus-visible) {
  outline: none;
}

/* ==================== Header ==================== */
.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.category-label {
  font-size: var(--font-xs);
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.permission-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-xs);
  font-weight: 700;
  letter-spacing: -0.01em;
  border-radius: var(--radius-sm);
  transition: all 180ms ease;
}

.badge-curation {
  background: var(--accent-curation-bg);
  color: var(--accent-curation-text);
}

.badge-open {
  background: var(--accent-open-bg);
  color: var(--accent-open-text);
}

.badge-approval {
  background: var(--accent-approval-bg);
  color: var(--accent-approval-text);
}

/* ==================== Title ==================== */
.card-title {
  margin: 0;
  font-size: var(--font-md);
  font-weight: 600;
  line-height: 1.45;
  color: var(--text-primary);
  letter-spacing: -0.02em;

  /* Multi-line ellipsis */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: keep-all;

  /* Minimum height for consistent card size */
  min-height: calc(var(--font-md) * 1.45 * 2);
}

/* ==================== Statistics ==================== */
.card-stats {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  border-top: 1px solid var(--neutral-100);
  border-bottom: 1px solid var(--neutral-100);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  text-align: center;
}

.stat-value {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: var(--font-xs);
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--neutral-200);
}

/* ==================== Footer ==================== */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.creator-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  flex: 1;
}

.creator-icon {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.creator-name {
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dday-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-sm);
  font-weight: 700;
  letter-spacing: -0.01em;
  border-radius: var(--radius-md);
  background: var(--neutral-100);
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 180ms ease;
}

.dday-icon {
  width: 14px;
  height: 14px;
}

.dday-text {
  font-variant-numeric: tabular-nums;
}

/* D-Day Status Colors */
.dday-critical {
  background: #FEE2E2;
  color: var(--status-critical);
}

.dday-critical .dday-icon {
  animation: pulse 2s ease-in-out infinite;
}

.dday-urgent {
  background: #FFEDD5;
  color: var(--status-urgent);
}

.dday-normal {
  color: var(--status-normal);
}

.dday-ended {
  background: var(--neutral-100);
  color: var(--status-ended);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* ==================== Responsive Design ==================== */
@media (max-width: 640px) {
  .battle-card {
    padding: var(--space-5);
    gap: var(--space-4);
  }

  .card-title {
    font-size: var(--font-base);
    min-height: calc(var(--font-base) * 1.45 * 2);
  }

  .card-stats {
    gap: var(--space-3);
    padding: var(--space-3) 0;
  }

  .stat-value {
    font-size: var(--font-md);
  }

  .stat-divider {
    height: 28px;
  }
}

/* ==================== Accessibility ==================== */
@media (prefers-reduced-motion: reduce) {
  .battle-card,
  .battle-card::before,
  .permission-badge,
  .dday-badge {
    transition: none;
  }

  .dday-critical .dday-icon {
    animation: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: var(--neutral-50);
    --text-secondary: var(--neutral-400);
    --text-tertiary: var(--neutral-500);
    --bg-primary: var(--neutral-900);
    --bg-secondary: var(--neutral-800);
    --border-light: var(--neutral-800);
    --border-default: var(--neutral-700);
  }
}
</style>