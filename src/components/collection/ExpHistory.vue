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
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-title { font-size: 16px; font-weight: 700; color: #222; margin-bottom: 16px; }

.exp-history { display: flex; flex-direction: column; gap: 2px; }

.exp-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 4px;
  border-bottom: 1px solid #f3f4f6;
}

.exp-history-item:last-child { border-bottom: none; }

.exp-history-left { display: flex; flex-direction: column; gap: 2px; }
.exp-history-action { font-size: 13px; font-weight: 500; color: #222; }
.exp-history-date { font-size: 11px; color: #64748B; }
.exp-history-value { font-size: 14px; font-weight: 700; color: #22c55e; white-space: nowrap; }
</style>
