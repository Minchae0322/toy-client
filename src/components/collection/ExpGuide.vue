<template>
  <div class="section-card">
    <h3 class="section-title">EXP 획득 가이드</h3>
    <ul class="exp-rules-list">
      <li v-for="rule in expRules" :key="rule.code" class="exp-rule-item">
        <span class="exp-rule-icon-wrap">
          <component :is="rule.icon" :size="16" :stroke-width="2" />
        </span>
        <span class="exp-rule-action">{{ rule.label }}</span>
        <span class="exp-rule-value">+{{ rule.exp }} EXP</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import {
  Camera,
  MessageSquare,
  Vote,
  Swords,
  PackagePlus,
  Sparkles,
  Heart,
} from 'lucide-vue-next'

const expRules = [
  { code: 'FEED_CREATE',           label: '피드 작성',          exp: 30,  icon: Camera },
  { code: 'COMMENT_CREATE',        label: '댓글 작성',          exp: 5,   icon: MessageSquare },
  { code: 'BATTLE_VOTE',           label: '배틀 투표',          exp: 10,  icon: Vote },
  { code: 'BATTLE_CREATE',         label: '배틀 생성',          exp: 20,  icon: Swords },
  { code: 'BATTLE_ITEM_ADD',       label: '배틀 아이템 추가',    exp: 15,  icon: PackagePlus },
  { code: 'BATTLE_PREDICTION_HIT', label: '배틀 예측 적중',      exp: 100, icon: Sparkles },
  { code: 'FEED_REACTION',         label: '피드 하트 획득',      exp: 5,   icon: Heart },
]
</script>

<style scoped>
.section-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 16px;
  height: 100%;
}

@media (min-width: 768px) { .section-card { padding: 22px; } }

.section-title {
  font-size: 15px;
  font-weight: 800;
  color: #0A0E1A;
  margin-bottom: 16px;
  letter-spacing: -0.2px;
}

@media (min-width: 768px) { .section-title { font-size: 16px; } }

.exp-rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.exp-rule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #F1F5F9;
}

.exp-rule-item:first-child {
  border-top: none;
  padding-top: 4px;
}

.exp-rule-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #F3E8FF;
  color: #9333EA;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.exp-rule-action {
  flex: 1;
  font-size: 14px;
  color: #334155;
  font-weight: 600;
  letter-spacing: -0.1px;
  min-width: 0;
}

.exp-rule-value {
  font-size: 13px;
  font-weight: 800;
  color: #9333EA;
  white-space: nowrap;
  letter-spacing: -0.2px;
}
</style>
