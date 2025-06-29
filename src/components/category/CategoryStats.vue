<script setup>
defineProps({
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
  }
})
</script>

<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">📊</div>
      <div class="stat-content">
        <div class="stat-label">전체 카테고리</div>
        <div class="stat-value">{{ total }}</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">👁️</div>
      <div class="stat-content">
        <div class="stat-label">활성 카테고리</div>
        <div class="stat-value active">{{ active }}</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🚫</div>
      <div class="stat-content">
        <div class="stat-label">비활성 카테고리</div>
        <div class="stat-value inactive">{{ inactive }}</div>
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