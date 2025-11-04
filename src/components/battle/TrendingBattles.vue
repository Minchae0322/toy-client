<template>
  <section class="widget">
    <h3 class="widget-header">실시간 인기 배틀</h3>

    <div v-if="battles.length === 0" class="empty-message">
      인기 배틀이 없습니다
    </div>

    <div
        v-for="(battle, index) in battles"
        :key="battle.battleId"
        class="trending-item"
        @click="$emit('battle-click', battle.battleId)"
    >
      <span class="trending-rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
      <div class="trending-content">
        <div class="trending-title">{{ battle.title }}</div>
        <div class="trending-meta">
          <strong>{{ battle.participantCount }}</strong>명 참여
          <span class="meta-divider">·</span>
          <strong>{{ formatNumber(battle.voteCount) }}</strong> 투표
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  battles: {
    type: Array,
    default: () => []
  }
});

defineEmits(['battle-click']);

const formatNumber = (num) => {
  if (num >= 10000) {
    return Math.floor(num / 1000) / 10 + '만';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
};
</script>

<style scoped>
.widget {
  margin-bottom: 28px;
}

.widget-header {
  font-size: 11.5px;
  font-weight: 600;
  color: #0A0A0A;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  opacity: 0.8;
}

.empty-message {
  font-size: 11.5px;
  color: #A3A3A3;
  text-align: center;
  padding: 16px 0;
  font-weight: 500;
}

.trending-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 0.5px solid #F2F2F2;
  cursor: pointer;
  transition: all 160ms ease;
}

.trending-item:hover {
  background: #FAFAFA;
  margin: 0 -10px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 6px;
}

.trending-item:last-child {
  border-bottom: none;
}

.trending-rank {
  min-width: 16px;
  font-size: 12px;
  font-weight: 700;
  color: #D4D4D4;
  font-variant-numeric: tabular-nums;
}

.trending-rank.top {
  color: #0A0A0A;
}

.trending-content {
  flex: 1;
  min-width: 0;
}

.trending-title {
  font-size: 12px;
  font-weight: 550;
  color: #0A0A0A;
  margin-bottom: 3px;
  line-height: 1.35;
  letter-spacing: -0.008em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: keep-all;
}

.trending-meta {
  font-size: 10.5px;
  color: #A3A3A3;
  font-weight: 500;
}

.trending-meta strong {
  color: #737373;
  font-weight: 600;
}

.meta-divider {
  margin: 0 4px;
  opacity: 0.5;
}
</style>