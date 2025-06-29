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
  // 자동 계산 여부
  autoCalculate: {
    type: Boolean,
    default: false
  },
  // 데이터 소스 (배열이나 객체)
  dataSource: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['stats-updated'])

// 반응형 상태
const stats = ref({
  total: props.total,
  active: props.active,
  inactive: props.inactive
})

// 자동 계산된 통계
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

// 최종 표시할 통계
const displayStats = computed(() => {
  return props.autoCalculate ? computedStats.value : stats.value
})

// props 변경 감지
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

// 계산된 통계 변경 감지 및 이벤트 발생
watch(computedStats, (newStats) => {
  if (props.autoCalculate) {
    emit('stats-updated', newStats)
  }
}, { deep: true })

// 외부에서 호출 가능한 업데이트 함수
const updateStats = (newStats) => {
  stats.value = { ...stats.value, ...newStats }
  emit('stats-updated', stats.value)
}

// 컴포넌트 인스턴스에 노출
defineExpose({
  updateStats,
  currentStats: displayStats
})
</script>

<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">📊</div>
      <div class="stat-content">
        <div class="stat-label">전체 카테고리</div>
        <div class="stat-value">{{ displayStats.total }}</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">👁️</div>
      <div class="stat-content">
        <div class="stat-label">활성 카테고리</div>
        <div class="stat-value active">{{ displayStats.active }}</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🚫</div>
      <div class="stat-content">
        <div class="stat-label">비활성 카테고리</div>
        <div class="stat-value inactive">{{ displayStats.inactive }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.stat-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  transition: color 0.2s ease;
}

.stat-value.active {
  color: #10b981;
}

.stat-value.inactive {
  color: #ef4444;
}

/* 모바일 최적화 */
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 12px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-icon {
    font-size: 18px;
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-value {
    font-size: 16px;
  }
}

/* 태블릿 */
@media (min-width: 768px) and (max-width: 1023px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .stat-card {
    padding: 20px;
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .stats-grid {
    gap: 24px;
    margin-bottom: 24px;
  }

  .stat-card {
    padding: 24px;
  }

  .stat-icon {
    font-size: 24px;
  }

  .stat-label {
    font-size: 14px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>