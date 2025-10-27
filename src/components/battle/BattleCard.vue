<template>
  <div class="battle-card" @click="$emit('click', battle.battleId)">
    <div class="battle-meta">
      <span class="battle-category">{{ battle.categoryName }}</span>
      <span class="battle-type" :class="{ curation: battle.battleType === 'CURATION' }">
        {{ battle.battleType === 'CURATION' ? '큐레이션' : '오픈배틀' }}
      </span>
    </div>

    <div class="battle-title">{{ battle.title }}</div>

    <div class="battle-stats">
      <div class="battle-stat">
        <span class="stat-value">{{ formatNumber(battle.participantCount) }}</span>
        <span class="stat-label">참여자</span>
      </div>
      <div class="battle-stat">
        <span class="stat-value">{{ formatNumber(battle.totalVotes) }}</span>
        <span class="stat-label">투표</span>
      </div>
      <div class="battle-stat">
        <span class="stat-value">{{ battle.options?.length || 0 }}</span>
        <span class="stat-label">제품</span>
      </div>
    </div>

    <div class="battle-footer">
      <div class="battle-creator">@{{ battle.createdBy.nickname }}</div>
      <div class="battle-dday" :class="{ urgent: dDay <= 7 }">
        {{ dDayText }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  battle: {
    type: Object,
    required: true
  }
});

defineEmits(['click']);

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const dDay = computed(() => {
  if (!props.battle.endDate) return 0;

  const endDate = new Date(props.battle.endDate);
  const now = new Date();
  const diff = endDate - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return days;
});

const dDayText = computed(() => {
  if (props.battle.status === 'ENDED') {
    return '종료됨';
  }

  const days = dDay.value;

  if (days < 0) {
    return '종료됨';
  } else if (days === 0) {
    return '오늘 마감';
  } else {
    return `D-${days}`;
  }
});
</script>

<style scoped>
.battle-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  border: 1px solid #F0F0F3;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.battle-card:hover {
  border-color: #E5E7EB;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.battle-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.battle-category {
  font-size: 12px;
  color: #9CA3AF;
  font-weight: 500;
}

.battle-type {
  padding: 3px 8px;
  background: #F3F4F6;
  color: #6B7280;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.battle-type.curation {
  background: #FEF3C7;
  color: #92400E;
}

.battle-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  line-height: 1.4;
  margin-bottom: 20px;
  letter-spacing: -0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.battle-stats {
  display: flex;
  gap: 32px;
  padding: 20px 0;
  border-top: 1px solid #F9FAFB;
  border-bottom: 1px solid #F9FAFB;
  margin-bottom: 20px;
}

.battle-stat {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #9CA3AF;
}

.battle-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.battle-creator {
  font-size: 13px;
  color: #6B7280;
}

.battle-dday {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
}

.battle-dday.urgent {
  color: #DC2626;
}

@media (max-width: 768px) {
  .battle-card {
    padding: 20px;
  }

  .battle-stats {
    gap: 16px;
  }

  .stat-value {
    font-size: 18px;
  }
}
</style>