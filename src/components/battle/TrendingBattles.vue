<template>
  <section class="widget">
    <h3 class="widget-header">실시간 인기 배틀</h3>

    <div v-if="battles.length === 0" class="empty-message">
      인기 배틀이 없습니다.
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
          <strong>{{ battle.participantCount }}명</strong> 참여
          <span class="dot-separator"></span>
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
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
};
</script>

<style scoped>
.widget {
  margin-bottom: 40px;
}

.widget-header {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 20px;
  letter-spacing: -0.01em;
}

.empty-message {
  font-size: 13px;
  color: #9CA3AF;
  text-align: center;
  padding: 20px 0;
}

.trending-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #F9FAFB;
  cursor: pointer;
  transition: all 0.2s;
}

.trending-item:hover {
  background: #FAFBFC;
  margin: 0 -12px;
  padding-left: 12px;
  padding-right: 12px;
}

.trending-item:last-child {
  border-bottom: none;
}

.trending-rank {
  min-width: 20px;
  font-size: 14px;
  font-weight: 700;
  color: #D1D5DB;
}

.trending-rank.top {
  color: #1A1A1A;
}

.trending-content {
  flex: 1;
}

.trending-title {
  font-size: 14px;
  font-weight: 500;
  color: #1A1A1A;
  margin-bottom: 6px;
  line-height: 1.4;
}

.trending-meta {
  font-size: 12px;
  color: #9CA3AF;
}

.trending-meta strong {
  color: #6B7280;
  font-weight: 600;
}

.dot-separator {
  display: inline-block;
  width: 2px;
  height: 2px;
  background: #D1D5DB;
  border-radius: 50%;
  margin: 0 8px;
  vertical-align: middle;
}
</style>