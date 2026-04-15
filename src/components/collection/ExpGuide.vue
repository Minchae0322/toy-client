<template>
  <div class="section-card">
    <h3 class="section-title">EXP 획득 가이드</h3>

    <div v-for="(rules, category) in rulesByCategory" :key="category" class="exp-category">
      <h4 class="exp-category-title">{{ category }}</h4>
      <div class="exp-rules-list">
        <div v-for="rule in rules" :key="rule.action" class="exp-rule-item">
          <span class="exp-rule-icon">{{ rule.icon }}</span>
          <span class="exp-rule-action">{{ rule.action }}</span>
          <div class="exp-rule-right">
            <span class="exp-rule-value">+{{ rule.exp }} EXP</span>
            <span v-if="rule.limit" class="exp-rule-limit">{{ rule.limit }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { EXP_RULES } from '@/data/levelSystemData.js'

const rulesByCategory = computed(() => ({
  '일상 활동': EXP_RULES.daily,
  '배틀 활동': EXP_RULES.battle,
  '소셜 활동': EXP_RULES.social,
  '특별 보너스': EXP_RULES.special,
}))
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

.exp-category { margin-bottom: 20px; }
.exp-category:last-child { margin-bottom: 0; }

.exp-category-title {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

.exp-rules-list { display: flex; flex-direction: column; }

.exp-rule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid #F1F5F9;
}

.exp-rule-item:first-child { border-top: none; }

.exp-rule-icon { font-size: 17px; flex-shrink: 0; width: 24px; text-align: center; }
.exp-rule-action { flex: 1; font-size: 14px; color: #334155; font-weight: 500; }

.exp-rule-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.exp-rule-value { font-size: 13px; font-weight: 800; color: #9333ea; white-space: nowrap; letter-spacing: -0.2px; }
.exp-rule-limit { font-size: 11px; color: #94a3b8; font-weight: 500; }
</style>
