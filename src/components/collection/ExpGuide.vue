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
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-title { font-size: 16px; font-weight: 700; color: #222; margin-bottom: 16px; }

.exp-category { margin-bottom: 16px; }
.exp-category:last-child { margin-bottom: 0; }

.exp-category-title {
  font-size: 13px;
  font-weight: 700;
  color: #222;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #E2E8F0;
}

.exp-rules-list { display: flex; flex-direction: column; gap: 2px; }

.exp-rule-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  border-radius: 8px;
  transition: background 0.15s;
}

.exp-rule-item:hover { background: #f8fafc; }

.exp-rule-icon { font-size: 16px; flex-shrink: 0; width: 22px; text-align: center; }
.exp-rule-action { flex: 1; font-size: 13px; color: #222; }

.exp-rule-right { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.exp-rule-value { font-size: 13px; font-weight: 700; color: #9333ea; white-space: nowrap; }
.exp-rule-limit { font-size: 10px; color: #64748B; }
</style>
