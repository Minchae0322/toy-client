<template>
  <article class="battle-card" @click="$emit('view', battle.id)">
    <!-- 헤더 -->
    <div class="battle-header">
      <div class="header-left">
        <span :class="['status-badge', statusClass]">
          <span v-if="statusClass === 'live'" class="pulse-dot"></span>
          {{ statusText }}
        </span>
        <h3 class="title">{{ battle.title }}</h3>
      </div>
      <span class="end-date">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {{ battle.endDate }}
      </span>
    </div>

    <!-- 아이템 목록 -->
    <div class="items-list">
      <div
          v-for="item in battle.items"
          :key="item.rank"
          :class="['item-row', { 'is-this': item.isThis }]"
      >
        <!-- 순위 -->
        <div :class="['rank-badge', `rank-${item.rank}`]">
          {{ item.rank }}
        </div>

        <!-- 이름 -->
        <div class="item-info">
          <span class="item-name">{{ item.name }}</span>
          <span v-if="item.isThis" class="this-badge">이 상품</span>
        </div>

        <!-- 프로그레스 바 -->
        <div class="progress-bar">
          <div
              class="progress-fill"
              :class="{ 'is-this': item.isThis }"
              :style="{ width: `${item.votes}%` }"
          ></div>
        </div>

        <!-- 투표율 -->
        <span :class="['votes', { 'is-this': item.isThis }]">{{ item.votes }}%</span>
      </div>
    </div>

    <!-- 푸터 -->
    <div class="battle-footer">
      <div class="stats">
        <span class="stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          </svg>
          {{ formatNumber(battle.participants) }}명 참여
        </span>
        <span class="stat">{{ formatNumber(battle.totalVotes) }} 투표</span>
      </div>
      <button
          v-if="isLive"
          class="vote-btn"
          @click.stop="$emit('vote', battle.id)"
      >
        투표하기
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  battle: {
    type: Object,
    required: true
  }
})

defineEmits(['vote', 'view'])

const normalizedStatus = computed(() => {
  const status = props.battle.status
  if (typeof status === 'object') {
    return status?.title || 'NORMAL'
  }
  return status || 'LIVE'
})

const statusClass = computed(() => {
  const status = normalizedStatus.value.toUpperCase()
  switch (status) {
    case 'LIVE':
    case 'NORMAL':
      return 'live'
    case 'UPCOMING':
    case 'PENDING':
      return 'upcoming'
    case 'ENDED':
    case 'FINISHED':
      return 'ended'
    default:
      return 'live'
  }
})

const statusText = computed(() => {
  const status = normalizedStatus.value.toUpperCase()
  switch (status) {
    case 'LIVE':
    case 'NORMAL':
      return 'LIVE'
    case 'UPCOMING':
    case 'PENDING':
      return '예정'
    case 'ENDED':
    case 'FINISHED':
      return '종료'
    default:
      return 'LIVE'
  }
})

const isLive = computed(() => {
  const status = normalizedStatus.value.toUpperCase()
  return status === 'LIVE' || status === 'NORMAL'
})

const formatNumber = (num) => (num || 0).toLocaleString()
</script>

<style scoped>
.battle-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.15s;
}

.battle-card:hover {
  border-color: var(--border-strong);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.battle-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.status-badge.live {
  background: var(--c-danger);
  color: white;
}

.status-badge.upcoming {
  background: var(--c-brand-soft);
  color: var(--c-brand-hover);
}

.status-badge.ended {
  background: var(--bg-subtle);
  color: var(--c-text-400);
}

.pulse-dot {
  width: 5px;
  height: 5px;
  background: var(--bg-elevated);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.end-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--c-text-400);
  flex-shrink: 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-subtle);
  border-radius: 8px;
  transition: all 0.15s;
}

.item-row.is-this {
  background: var(--c-brand-soft);
  outline: 1px solid #ede9fe;
}

.rank-badge {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.rank-badge.rank-1 { background: var(--c-warning); color: #78350f; }
.rank-badge.rank-2 { background: var(--border-strong); color: var(--c-text-600); }
.rank-badge.rank-3 { background: var(--c-bronze); color: white; }
.rank-badge.rank-4,
.rank-badge.rank-5 { background: var(--border-default); color: var(--c-text-400); }

.item-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.item-row.is-this .item-name {
  color: var(--c-brand-hover);
  font-weight: 600;
}

.this-badge {
  padding: 2px 6px;
  background: #ede9fe;
  color: var(--c-brand-hover);
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  flex-shrink: 0;
}

.progress-bar {
  width: 100px;
  height: 6px;
  background: var(--border-strong);
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}

.progress-fill {
  height: 100%;
  background: var(--c-text-300);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-fill.is-this {
  background: var(--c-brand-hover);
}

.votes {
  width: 44px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-500);
  flex-shrink: 0;
}

.votes.is-this {
  color: var(--c-brand-hover);
}

.battle-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-default);
}

.stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--c-text-400);
}

.vote-btn {
  padding: 10px 18px;
  background: var(--c-brand-hover);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.vote-btn:hover {
  background: var(--c-brand-hover);
}

@media (max-width: 640px) {
  .progress-bar {
    width: 70px;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .end-date {
    display: none;
  }
}
</style>