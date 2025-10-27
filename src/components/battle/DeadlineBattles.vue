<template>
  <section class="widget">
    <h3 class="widget-header">⏰ 마감 임박</h3>

    <div v-if="battles.length === 0" class="empty-message">
      마감 임박 배틀이 없습니다.
    </div>

    <div
        v-for="battle in battles"
        :key="battle.battleId"
        class="deadline-item"
    >
      <div class="deadline-info">
        <div class="deadline-title">{{ battle.title }}</div>
        <div class="deadline-time">{{ formatDeadline(battle.dDay) }}</div>
      </div>
      <button class="deadline-btn" @click="$emit('vote', battle.battleId)">
        투표
      </button>
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

defineEmits(['vote']);

const formatDeadline = (dDay) => {
  if (dDay === 0) {
    return '오늘 마감';
  } else if (dDay < 1) {
    const hours = Math.floor(dDay * 24);
    return `${hours}시간 남음`;
  } else {
    return `${dDay}일 남음`;
  }
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

.deadline-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #FEF2F2;
  border-radius: 12px;
  margin-bottom: 12px;
}

.deadline-info {
  flex: 1;
}

.deadline-title {
  font-size: 14px;
  font-weight: 500;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.deadline-time {
  font-size: 12px;
  font-weight: 600;
  color: #DC2626;
}

.deadline-btn {
  padding: 8px 16px;
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

.deadline-btn:hover {
  background: #B91C1C;
}
</style>