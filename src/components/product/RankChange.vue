<template>
  <span v-if="isNew" class="rank-change new">NEW</span>
  <span v-else-if="change > 0" class="rank-change up">
    <svg class="arrow" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"/>
    </svg>
    {{ change }}
  </span>
  <span v-else-if="change < 0" class="rank-change down">
    <svg class="arrow" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
    </svg>
    {{ Math.abs(change) }}
  </span>
  <span v-else class="rank-change none">-</span>
</template>

<script setup>
defineProps({
  change: {
    type: Number,
    default: 0
  },
  isNew: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.rank-change {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
}

.rank-change.new {
  color: var(--c-brand);
}

.rank-change.up {
  color: var(--c-success);
}

.rank-change.down {
  color: var(--c-danger);
}

.rank-change.none {
  color: #d6d3d1;
}

.arrow {
  width: 14px;
  height: 14px;
}
</style>