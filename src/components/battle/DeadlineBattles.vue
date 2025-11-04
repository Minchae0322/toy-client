<template>
  <section class="widget">
    <h3 class="widget-header">⏰ 마감 임박</h3>

    <div v-if="battles.length === 0" class="empty-message">
      마감 임박 배틀이 없습니다
    </div>

    <div
        v-for="battle in battles"
        :key="battle.id || battle.battleId"
        class="deadline-item"
    >
      <div class="deadline-info" @click="handleBattleClick(battle.id || battle.battleId)">
        <div class="deadline-title">{{ battle.title }}</div>
        <div class="deadline-time">{{ formatDeadline(battle) }}</div>
      </div>
      <button class="deadline-btn" @click.stop="handleVote(battle.id || battle.battleId)">
        투표
      </button>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  battles: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['vote'])

const formatDeadline = (battle) => {
  if (!battle?.endDate) return '종료'

  const endDate = new Date(battle.endDate)
  const now = new Date()
  const diff = endDate - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days <= 0) {
    return '종료'
  } else if (days === 0 || days < 1) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    return `${hours}시간 남음`
  } else {
    return `${days}일 남음`
  }
}

const handleBattleClick = (battleId) => {
  console.log('⏰ [Deadline] 마감 임박 배틀 클릭:', battleId)
  router.push({ name: 'BattleDetail', params: { id: battleId } })
}

const handleVote = (battleId) => {
  console.log('🗳️ [Deadline] 투표 버튼 클릭:', battleId)
  router.push({ name: 'BattleDetail', params: { id: battleId } })
  emit('vote', battleId)
}
</script>

<style scoped>
.widget {
  margin-bottom: 32px;
}

.widget-header {
  font-size: 13px;
  font-weight: 650;
  color: #0A0A0A;
  margin-bottom: 14px;
  letter-spacing: -0.008em;
}

.empty-message {
  font-size: 12.5px;
  color: #A3A3A3;
  text-align: center;
  padding: 18px 0;
}

.deadline-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px;
  background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
  border-radius: 10px;
  margin-bottom: 10px;
  border: 1px solid rgba(220, 38, 38, 0.08);
  transition: all 180ms ease;
}

.deadline-item:hover {
  background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.08);
}

.deadline-item:last-child {
  margin-bottom: 0;
}

.deadline-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.deadline-info:hover .deadline-title {
  color: #DC2626;
}

.deadline-title {
  font-size: 13px;
  font-weight: 540;
  color: #0A0A0A;
  margin-bottom: 3px;
  letter-spacing: -0.006em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 160ms ease;
}

.deadline-time {
  font-size: 11.5px;
  font-weight: 590;
  color: #DC2626;
  letter-spacing: -0.004em;
}

.deadline-btn {
  padding: 6px 12px;
  background: #DC2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 590;
  cursor: pointer;
  transition: all 180ms cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: inherit;
  letter-spacing: -0.004em;
  white-space: nowrap;
  flex-shrink: 0;
}

.deadline-btn:hover {
  background: #B91C1C;
  transform: scale(1.04);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.24);
}

.deadline-btn:active {
  transform: scale(0.98);
}
</style>
