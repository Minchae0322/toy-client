<template>
  <span class="user-level-tag" :class="size" :style="tagStyle">
    <YogurtTierArt :tier="tier.art" :color="tierColor" :size="artSize" />
    <span class="lv-text">Lv.{{ level }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { getTierByLevel, getTierColor } from '@/data/levelSystemData.js'
import YogurtTierArt from './YogurtTierArt.vue'

const props = defineProps({
  level: { type: Number, required: true },
  size: { type: String, default: 'md', validator: (v) => ['xs', 'sm', 'md'].includes(v) },
  variant: { type: String, default: 'soft', validator: (v) => ['filled', 'soft', 'outline', 'dark'].includes(v) },
})

const tier = computed(() => getTierByLevel(props.level))
const tierColor = computed(() => getTierColor(props.level))

const artSize = computed(() => {
  if (props.size === 'xs') return 12
  if (props.size === 'sm') return 14
  return 16
})

const tagStyle = computed(() => {
  if (props.variant === 'filled') {
    return { background: tier.value.color, color: 'white' }
  }
  if (props.variant === 'soft') {
    return { background: tier.value.bgColor, color: tier.value.color }
  }
  if (props.variant === 'dark') {
    return {
      background: '#0A0E1A',
      color: '#ffffff',
      borderRadius: '999px',
    }
  }
  return {
    background: 'transparent',
    color: tier.value.color,
    boxShadow: `inset 0 0 0 1px ${tier.value.color}`,
  }
})
</script>

<style scoped>
.user-level-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 800;
  letter-spacing: -0.2px;
  line-height: 1;
  white-space: nowrap;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

.user-level-tag.xs {
  padding: 2px 6px;
  font-size: 10px;
  border-radius: 4px;
  gap: 2px;
}

.user-level-tag.sm {
  padding: 3px 7px;
  font-size: 11px;
  border-radius: 5px;
}

.user-level-tag.md {
  padding: 4px 9px;
  font-size: 12px;
  border-radius: 6px;
}

.lv-text { font-variant-numeric: tabular-nums; }
</style>
