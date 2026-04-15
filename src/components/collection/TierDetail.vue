<template>
  <div class="section-card" :style="{ borderColor: tier.borderColor }">
    <div class="tier-detail-header">
      <div class="tier-detail-avatar">
        <span class="tier-detail-emoji">{{ tier.emoji }}</span>
      </div>
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
      <Target :size="16" :stroke-width="2.2" class="goal-icon" />
      <span class="goal-text">{{ tier.nextGoal }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getTierByLevel } from '@/data/levelSystemData.js'
import { Target } from '@/utils/collectionIcons.js'

const props = defineProps({
  userLevel: { type: Number, required: true },
})

const tier = computed(() => getTierByLevel(props.userLevel))
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
  margin-bottom: 4px;
  letter-spacing: -0.2px;
}

@media (min-width: 768px) { .section-title { font-size: 16px; } }

.tier-detail-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #F1F5F9;
}

.tier-detail-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F7F8FA;
  flex-shrink: 0;
}

.tier-detail-emoji { font-size: 26px; line-height: 1; }

.tier-description { font-size: 13px; color: #64748B; line-height: 1.5; margin-top: 4px; }

.feature-list { margin-bottom: 16px; }
.feature-list:last-of-type { margin-bottom: 0; }

.feature-heading {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 10px;
  letter-spacing: 0.3px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 14px;
  color: #334155;
  font-weight: 500;
}

.feature-item.restricted { color: #94a3b8; }

.feature-icon { font-size: 14px; line-height: 1; flex-shrink: 0; }

.next-goal {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #FAF5FF;
  border-radius: 10px;
  margin-top: 16px;
}

.goal-icon { color: #9333EA; flex-shrink: 0; }
.goal-text { font-size: 13.5px; font-weight: 600; color: #6d28d9; line-height: 1.4; }
</style>
