<template>
  <section class="battle-info-section">
    <div class="battle-info-container">
      <div class="battle-main-info">
        <div class="battle-meta">
          <span class="battle-category">
            {{ battle.subCategoryDetail?.categoryName }} > {{ battle.subCategoryDetail?.subCategoryName }}
          </span>
          <span class="battle-type-badge" :class="{ open: battle.itemAddPermissionType !== 'CREATOR_ONLY' }">
            {{ getItemAddPermissionLabel(battle.itemAddPermissionType) }}
          </span>
        </div>
        <h1 class="battle-title">{{ battle.title }}</h1>
        <p class="battle-description">{{ battle.description }}</p>
        <div class="battle-creator">
          <div class="creator-avatar">{{ getInitials(battle.creatorUserInfo?.nickname) }}</div>
          <div class="creator-info">
            <div class="creator-name">@{{ battle.creatorUserInfo?.nickname || '알 수 없음' }}</div>
            <div class="creator-level">{{ battle.creatorUserInfo?.role || 'USER' }}</div>
          </div>
          <button class="follow-btn" @click="$emit('follow')">팔로우</button>
        </div>
      </div>

      <div class="battle-stats-card">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ formatCount(battle.totalParticipants) }}</span>
            <span class="stat-label">참여자</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatCount(battle.totalVotes) }}</span>
            <span class="stat-label">총 투표수</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ battle.items?.length || 0 }}</span>
            <span class="stat-label">등록 제품</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatCount(battle.totalViews) }}</span>
            <span class="stat-label">조회수</span>
          </div>
        </div>
        <div class="battle-timer">
          <div class="timer-label">
            {{ battle.status === 'ACTIVE' ? '남은 시간' : getBattleStatusLabel(battle.status) }}
          </div>
          <div class="timer-value">{{ remainingTime }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { battleUtils } from '@/services/BattleService'

defineProps({
  battle: {
    type: Object,
    required: true
  },
  remainingTime: {
    type: String,
    required: true
  }
})

defineEmits(['follow'])

const formatCount = (num) => battleUtils.formatCount(num)
const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '?'
const getItemAddPermissionLabel = (type) => battleUtils.getItemAddPermissionLabel(type)
const getBattleStatusLabel = (status) => battleUtils.getBattleStatusLabel(status)
</script>

<style scoped>
.battle-info-section {
  background: white;
  padding: 48px 0;
  border-bottom: 1px solid #E8E8E8;
}

.battle-info-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  gap: 48px;
}

@media (max-width: 1024px) {
  .battle-info-container {
    flex-direction: column;
    gap: 32px;
  }
}

.battle-main-info {
  flex: 1;
}

.battle-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.battle-category {
  padding: 6px 12px;
  background: #EFF6FF;
  color: #1E40AF;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.battle-type-badge {
  padding: 6px 12px;
  background: #FEF3C7;
  color: #92400E;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.battle-type-badge.open {
  background: #DBEAFE;
  color: #1E40AF;
}

.battle-title {
  font-size: 36px;
  font-weight: 700;
  color: #0A0A0A;
  margin-bottom: 20px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

@media (max-width: 768px) {
  .battle-title {
    font-size: 28px;
  }
}

.battle-description {
  font-size: 16px;
  color: #737373;
  line-height: 1.7;
  margin-bottom: 32px;
}

.battle-creator {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: #FAFAFA;
  border-radius: 12px;
  border: 1px solid #E8E8E8;
}

.creator-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 20px;
}

.creator-info {
  flex: 1;
}

.creator-name {
  font-size: 15px;
  font-weight: 600;
  color: #0A0A0A;
  margin-bottom: 2px;
}

.creator-level {
  font-size: 13px;
  color: #737373;
}

.follow-btn {
  padding: 10px 24px;
  background: #0A0A0A;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.follow-btn:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.battle-stats-card {
  width: 360px;
  background: linear-gradient(135deg, #5B68DF 0%, #6B46C1 100%);
  border-radius: 20px;
  padding: 36px 32px;
  color: white;
  box-shadow: 0 20px 40px rgba(91, 104, 223, 0.3);
}

@media (max-width: 1024px) {
  .battle-stats-card {
    width: 100%;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
  margin-bottom: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 40px;
  font-weight: 700;
  display: block;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

.battle-timer {
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.timer-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 10px;
  font-weight: 500;
}

.timer-value {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
</style>