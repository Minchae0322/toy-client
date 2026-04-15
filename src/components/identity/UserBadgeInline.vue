<template>
  <span
    class="user-badge-inline"
    :class="size"
    :style="{ background: badge.color + '14' }"
    :title="badge.name"
  >
    <span class="badge-emoji">{{ badge.emoji }}</span>
    <span v-if="showLabel" class="badge-label" :style="{ color: badge.color }">{{ badge.name }}</span>
    <span v-if="count > 1" class="badge-count" :style="{ color: badge.color }">×{{ count }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { getBadgeById } from '@/data/levelSystemData.js'

const props = defineProps({
  badgeId: { type: String, required: true },
  count: { type: Number, default: 1 },
  size: { type: String, default: 'sm', validator: (v) => ['xs', 'sm', 'md'].includes(v) },
  showLabel: { type: Boolean, default: false },
})

const badge = computed(() => getBadgeById(props.badgeId) || { color: '#94A3B8', name: '', emoji: '' })
</script>

<style scoped>
.user-badge-inline {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 700;
  letter-spacing: -0.1px;
  line-height: 1;
  white-space: nowrap;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

.user-badge-inline.xs {
  width: 20px;
  height: 20px;
  justify-content: center;
  border-radius: 5px;
  padding: 0;
}

.user-badge-inline.sm {
  width: 24px;
  height: 24px;
  justify-content: center;
  border-radius: 6px;
  padding: 0;
}

.user-badge-inline.md {
  padding: 4px 9px;
  font-size: 11px;
  border-radius: 6px;
}

.user-badge-inline.xs:has(.badge-label),
.user-badge-inline.sm:has(.badge-label) {
  width: auto;
  height: auto;
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 5px;
}

.badge-emoji { line-height: 1; }
.user-badge-inline.xs .badge-emoji { font-size: 12px; }
.user-badge-inline.sm .badge-emoji { font-size: 14px; }
.user-badge-inline.md .badge-emoji { font-size: 14px; }

.badge-label { font-size: inherit; }
.badge-count { font-variant-numeric: tabular-nums; opacity: 0.85; font-size: 10px; }
</style>
