<!-- CategoryStats.vue -->
<script setup>
import { computed, watch, ref } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    default: 0
  },
  active: {
    type: Number,
    default: 0
  },
  inactive: {
    type: Number,
    default: 0
  },
  autoCalculate: {
    type: Boolean,
    default: false
  },
  dataSource: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['stats-updated'])

const stats = ref({
  total: props.total,
  active: props.active,
  inactive: props.inactive
})

const computedStats = computed(() => {
  if (!props.autoCalculate || !props.dataSource.length) {
    return {
      total: props.total,
      active: props.active,
      inactive: props.inactive
    }
  }

  const total = props.dataSource.length
  const active = props.dataSource.filter(item =>
      item.status === 'active' || item.active === true || item.isActive === true
  ).length
  const inactive = total - active

  return { total, active, inactive }
})

const displayStats = computed(() => {
  return props.autoCalculate ? computedStats.value : stats.value
})

watch(() => [props.total, props.active, props.inactive],
    ([newTotal, newActive, newInactive]) => {
      stats.value = {
        total: newTotal,
        active: newActive,
        inactive: newInactive
      }
    },
    { immediate: true }
)

watch(computedStats, (newStats) => {
  if (props.autoCalculate) {
    emit('stats-updated', newStats)
  }
}, { deep: true })

const updateStats = (newStats) => {
  stats.value = { ...stats.value, ...newStats }
  emit('stats-updated', stats.value)
}

defineExpose({
  updateStats,
  currentStats: displayStats
})
</script>

<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon total">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ displayStats.total }}</div>
        <div class="stat-label">전체 카테고리</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon active">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
          <path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ displayStats.active }}</div>
        <div class="stat-label">활성 상태</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon inactive">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
          <path d="M15 9l-6 6m0-6l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ displayStats.inactive }}</div>
        <div class="stat-label">비활성 상태</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: var(--bg-elevated);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.total {
  background: var(--c-info-soft);
  color: var(--c-info);
}

.stat-icon.active {
  background: var(--c-success-soft);
  color: var(--c-success);
}

.stat-icon.inactive {
  background: var(--c-danger-soft);
  color: var(--c-danger);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-500);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>