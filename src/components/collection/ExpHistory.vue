<template>
  <div class="section-card">
    <h3 class="section-title">최근 EXP 획득 내역</h3>
    <div class="exp-history">
      <div
        v-for="(entry, idx) in history"
        :key="idx"
        class="exp-history-item"
      >
        <div class="exp-history-left">
          <span class="exp-history-action">{{ entry.action }}</span>
          <span class="exp-history-date">{{ entry.date }}</span>
        </div>
        <span class="exp-history-value">+{{ entry.exp }} EXP</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  history: { type: Array, required: true },
})
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

.exp-history { display: flex; flex-direction: column; }

.exp-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #F1F5F9;
}

.exp-history-item:first-child { border-top: none; padding-top: 4px; }

.exp-history-left { display: flex; flex-direction: column; gap: 3px; }
.exp-history-action { font-size: 14px; font-weight: 600; color: #0f172a; }
.exp-history-date { font-size: 12px; color: #94a3b8; font-weight: 500; }
.exp-history-value {
  font-size: 14px;
  font-weight: 800;
  color: #16a34a;
  white-space: nowrap;
  letter-spacing: -0.2px;
}
</style>
