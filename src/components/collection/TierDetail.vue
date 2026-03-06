<template>
  <div class="section-card" :style="{ borderColor: tier.borderColor }">
    <div class="tier-detail-header">
      <span class="tier-detail-emoji">{{ tier.emoji }}</span>
      <div>
        <h3 class="section-title">{{ tier.name }} 등급</h3>
        <p class="tier-description">{{ tier.description }}</p>
      </div>
    </div>

    <div class="feature-list">
      <h4 class="feature-heading">사용 가능한 기능</h4>
      <div v-for="feature in tier.features" :key="feature" class="feature-item available">
        <span class="feature-icon">✅</span>
        <span>{{ feature }}</span>
      </div>
    </div>

    <div class="feature-list" v-if="tier.restrictions.length > 0">
      <h4 class="feature-heading">제한 사항</h4>
      <div v-for="restriction in tier.restrictions" :key="restriction" class="feature-item restricted">
        <span class="feature-icon">🔒</span>
        <span>{{ restriction }}</span>
      </div>
    </div>

    <div class="next-goal" v-if="tier.nextGoal">
      <span class="goal-icon">🎯</span>
      <span class="goal-text">{{ tier.nextGoal }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getTierByLevel } from '@/data/levelSystemData.js'

const props = defineProps({
  userLevel: { type: Number, required: true },
})

const tier = computed(() => getTierByLevel(props.userLevel))
</script>

<style scoped>
.section-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-title { font-size: 16px; font-weight: 700; color: #222; margin-bottom: 2px; }

.tier-detail-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.tier-detail-emoji { font-size: 32px; line-height: 1; }

.tier-description { font-size: 13px; color: #64748B; line-height: 1.5; }

.feature-list { margin-bottom: 12px; }

.feature-heading {
  font-size: 12px;
  font-weight: 600;
  color: #64748B;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  color: #222;
}

.feature-item.restricted { color: #64748B; }

.feature-icon { font-size: 14px; line-height: 1; flex-shrink: 0; }

.next-goal {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 10px;
  margin-top: 12px;
}

.goal-icon { font-size: 18px; flex-shrink: 0; }
.goal-text { font-size: 13px; font-weight: 600; color: #7c3aed; }
</style>
