<template>
  <span
    v-if="showBadge"
    :class="['product-status-badge', statusClass, sizeClass]"
    :title="tooltip"
  >
    <svg v-if="iconPath" class="product-status-badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath"/>
    </svg>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: null },
  size: { type: String, default: 'md' } // 'sm' | 'md'
})

const normalized = computed(() => {
  const raw = typeof props.status === 'string'
    ? props.status
    : props.status?.title || props.status?.code || ''
  return (raw || '').toUpperCase()
})

const showBadge = computed(() => ['PENDING', 'REJECTED', 'DELETED'].includes(normalized.value))

const label = computed(() => ({
  PENDING: '승인 대기',
  REJECTED: '반려됨',
  DELETED: '삭제됨'
}[normalized.value] || ''))

const tooltip = computed(() => ({
  PENDING: '관리자 승인 대기 중인 제품입니다',
  REJECTED: '관리자에 의해 반려된 제품입니다',
  DELETED: '더 이상 사용할 수 없는 제품입니다'
}[normalized.value] || ''))

const statusClass = computed(() => `status-${normalized.value.toLowerCase()}`)
const sizeClass = computed(() => `size-${props.size}`)

const iconPath = computed(() => ({
  PENDING: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  REJECTED: 'M6 18L18 6M6 6l12 12',
  DELETED: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3'
}[normalized.value] || null))
</script>

<style scoped>
.product-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
  border-radius: 6px;
  letter-spacing: -0.1px;
  white-space: nowrap;
  line-height: 1;
}

.product-status-badge.size-md {
  padding: 4px 8px;
  font-size: 11px;
}

.product-status-badge.size-sm {
  padding: 2px 6px;
  font-size: 10px;
  border-radius: 5px;
}

.product-status-badge-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.size-sm .product-status-badge-icon {
  width: 10px;
  height: 10px;
}

.product-status-badge.status-pending {
  background: #FEF3C7;
  color: #B45309;
}

.product-status-badge.status-rejected {
  background: #FEE2E2;
  color: #B91C1C;
}

.product-status-badge.status-deleted {
  background: #E5E8EB;
  color: #6B7280;
}
</style>
