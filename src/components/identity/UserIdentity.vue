<template>
  <span class="user-identity" :class="size">
    <span class="nickname">{{ nickname }}</span>
    <UserLevelTag v-if="level != null" :level="level" :size="tagSize" :variant="tagVariant" />
    <span v-if="badgeIds && badgeIds.length" class="badge-row">
      <UserBadgeInline
        v-for="id in displayedBadges"
        :key="id"
        :badge-id="id"
        :size="tagSize === 'md' ? 'sm' : 'xs'"
      />
    </span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import UserLevelTag from './UserLevelTag.vue'
import UserBadgeInline from './UserBadgeInline.vue'

const props = defineProps({
  nickname: { type: String, required: true },
  level: { type: Number, default: null },
  badgeIds: { type: Array, default: () => [] },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  maxBadges: { type: Number, default: 3 },
  tagVariant: { type: String, default: 'soft' },
})

const tagSize = computed(() => {
  if (props.size === 'sm') return 'xs'
  if (props.size === 'lg') return 'md'
  return 'sm'
})

const displayedBadges = computed(() => props.badgeIds.slice(0, props.maxBadges))
</script>

<style scoped>
.user-identity {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

.nickname {
  font-weight: 700;
  color: #0A0E1A;
  letter-spacing: -0.2px;
}

.user-identity.sm .nickname { font-size: 13px; }
.user-identity.md .nickname { font-size: 14px; }
.user-identity.lg .nickname { font-size: 16px; }

.badge-row { display: inline-flex; align-items: center; gap: 3px; }
</style>
