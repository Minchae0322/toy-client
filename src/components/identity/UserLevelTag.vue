<template>
  <span class="user-level-tag" :class="size" :style="tagStyle">
    <component :is="TierIcon" :size="iconSize" :stroke-width="2.4" :style="iconStyle" />
    <span class="lv-text">Lv.{{ level }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { getTierByLevel } from '@/data/levelSystemData.js'
import { getTierIcon } from '@/utils/collectionIcons.js'

const props = defineProps({
  level: { type: Number, required: true },
  size: { type: String, default: 'md', validator: (v) => ['xs', 'sm', 'md'].includes(v) },
  variant: { type: String, default: 'soft', validator: (v) => ['filled', 'soft', 'outline', 'dark'].includes(v) },
})

const tier = computed(() => getTierByLevel(props.level))
const TierIcon = computed(() => getTierIcon(tier.value.tier))

const iconSize = computed(() => {
  if (props.size === 'xs') return 10
  if (props.size === 'sm') return 12
  return 14
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
      background: '#ffffff',
      color: '#1a1a1c',
      boxShadow: 'inset 0 0 0 1px #e5e5ea',
    }
  }
  return {
    background: 'transparent',
    color: tier.value.color,
    boxShadow: `inset 0 0 0 1px ${tier.value.color}`,
  }
})

const iconStyle = computed(() => {
  if (props.variant === 'dark') {
    return { color: tier.value.color }
  }
  return {}
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
