<template>
  <article
      v-if="battle && battle.title"
      class="battle-card"
      @click="$emit('click', battle.id || battle.battleId)"
      role="button"
      tabindex="0"
      @keydown.enter="$emit('click', battle.id || battle.battleId)"
  >
    <header class="card-header">
      <span class="category-label">{{ categoryName }}</span>
      <span class="permission-badge" :class="`badge-${permissionClass}`">
        {{ permissionLabel }}
      </span>
    </header>

    <h3 class="card-title">{{ battle.title }}</h3>

    <div class="card-stats">
      <div class="stat-item">
        <span class="stat-value">{{ formatNumber(battle.totalParticipants || battle.participantCount) }}</span>
        <span class="stat-label">참여</span>
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
:root {
  --font-xs: 11px;
  --font-sm: 12.5px;
  --font-base: 14px;
  --font-lg: 15.5px;
  --font-xl: 17px;

  --weight-medium: 500;
  --weight-semibold: 590;
  --weight-bold: 650;

  --space-1: 3px;
  --space-2: 6px;
  --space-3: 10px;
  --space-4: 14px;
  --space-5: 18px;

  --neutral-0: #FFFFFF;
  --neutral-50: #FAFAFA;
  --neutral-100: #F2F2F2;
  --neutral-200: #E8E8E8;
  --neutral-300: #D4D4D4;
  --neutral-400: #A3A3A3;
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-800: #262626;
  --neutral-900: #0A0A0A;

  --badge-curation-bg: #FEF3E0;
  --badge-curation-text: #92400E;
  --badge-open-bg: #E0F2FE;
  --badge-open-text: #1E40AF;
  --badge-approval-bg: #F3E8FF;
  --badge-approval-text: #6B21A8;

  --status-critical: #DC2626;
  --status-critical-bg: #FEE2E2;
  --status-urgent: #EA580C;
  --status-urgent-bg: #FFEDD5;
}

.battle-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: 18px;
  background: var(--neutral-0);
  border: 1px solid var(--neutral-200);
  border-radius: 12px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.battle-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border-color: var(--neutral-300);
}

.battle-card:active {
  transform: scale(0.99);
}

.battle-card:focus {
  outline: 2px solid #007AFF;
  outline-offset: 2px;
}

.battle-card:focus:not(:focus-visible) {
  outline: none;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.category-label {
  font-size: var(--font-xs);
  font-weight: var(--weight-semibold);
  color: var(--neutral-500);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.permission-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: var(--weight-bold);
  letter-spacing: 0.01em;
  border-radius: 4px;
}

.badge-curation {
  background: var(--badge-curation-bg);
  color: var(--badge-curation-text);
}

.badge-open {
  background: var(--badge-open-bg);
  color: var(--badge-open-text);
}

.badge-approval {
  background: var(--badge-approval-bg);
  color: var(--badge-approval-text);
}

.card-title {
  margin: 0;
  font-size: var(--font-lg);
  font-weight: var(--weight-semibold);
  line-height: 1.35;
  color: var(--neutral-900);
  letter-spacing: -0.014em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: keep-all;
  min-height: calc(var(--font-lg) * 1.35 * 2);
}

.card-stats {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--neutral-100);
  border-bottom: 1px solid var(--neutral-100);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: var(--font-xl);
  font-weight: var(--weight-bold);
  color: var(--neutral-900);
  letter-spacing: -0.014em;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: var(--font-xs);
  font-weight: var(--weight-medium);
  color: var(--neutral-500);
}

.stat-divider {
  width: 1px;
  height: 22px;
  background: var(--neutral-200);
  flex-shrink: 0;
}

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
  width: 13px;
  height: 13px;
  color: var(--neutral-500);
  flex-shrink: 0;
}

.creator-name {
  font-size: var(--font-sm);
  font-weight: var(--weight-medium);
  color: var(--neutral-600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dday-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  font-size: var(--font-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: -0.008em;
  border-radius: 6px;
  background: var(--neutral-100);
  color: var(--neutral-700);
  white-space: nowrap;
  flex-shrink: 0;
}

.dday-icon {
  width: 11px;
  height: 11px;
}

.dday-text {
  font-variant-numeric: tabular-nums;
}

.dday-critical {
  background: var(--status-critical-bg);
  color: var(--status-critical);
}

.dday-urgent {
  background: var(--status-urgent-bg);
  color: var(--status-urgent);
}

.dday-normal {
  background: var(--neutral-100);
  color: var(--neutral-700);
}

.dday-ended {
  background: var(--neutral-100);
  color: var(--neutral-500);
}

@media (max-width: 640px) {
  .battle-card {
    padding: 16px;
    gap: 12px;
  }

  .card-title {
    font-size: var(--font-base);
    min-height: calc(var(--font-base) * 1.35 * 2);
  }

  .stat-value {
    font-size: var(--font-lg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .battle-card {
    transition: none;
  }
}
</style>