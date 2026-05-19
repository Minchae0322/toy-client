<template>
  <span class="user-level-tag" :class="[size, variant === 'dark' ? 'is-dark' : '', { 'icon-only': !showLevel }]" :style="tagStyle">
    <YogurtTierArt :tier="tier.art" :color="tierColor" :size="artSize" />
    <span v-if="showLevel" class="lv-text">Lv.{{ level }}</span>
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
  showLevel: { type: Boolean, default: true },
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
    // 배경/텍스트/라운드는 CSS class (.is-dark)로 처리해 다크 모드 분기 가능하게
    return {}
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

/* 아이콘만 표시할 때: 가로/세로 패딩을 동일하게 맞춰 동그란 칩 형태로 */
.user-level-tag.icon-only { gap: 0; }
.user-level-tag.icon-only.xs { padding: 3px; border-radius: 999px; }
.user-level-tag.icon-only.sm { padding: 4px; border-radius: 999px; }
.user-level-tag.icon-only.md { padding: 5px; border-radius: 999px; }

/* ===== Dark variant — 닉네임 옆 작은 레벨 칩 ===== */
.user-level-tag.is-dark {
  background: #0A0E1A;
  color: #ffffff;
  border-radius: 999px;
}

/* 다크 모드 — 페이지(#0F1218)와 거의 같던 #0A0E1A 검정 → 한 단계 떠 보이는 톤으로 */
:root[data-theme="dark"] .user-level-tag.is-dark {
  background: #2A3142;
}
</style>
