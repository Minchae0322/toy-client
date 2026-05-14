<template>
  <div class="completion-status">
    <div class="status-header">
      <h3 class="status-title">작성 완료율</h3>
      <div class="percentage">{{ completionPercentage }}%</div>
    </div>

    <div class="progress-bar">
      <div
          class="progress-fill"
          :style="{ width: completionPercentage + '%' }"
          :class="{ 'complete': completionPercentage === 100 }"
      ></div>
    </div>

    <div class="checklist">
      <div class="checklist-item" :class="{ 'completed': form.name && form.name.trim() }">
        <span class="check-icon">{{ form.name && form.name.trim() ? '✓' : '○' }}</span>
        <span class="check-label">제품명 입력</span>
      </div>

      <div class="checklist-item" :class="{ 'completed': form.brand && form.brand.trim() }">
        <span class="check-icon">{{ form.brand && form.brand.trim() ? '✓' : '○' }}</span>
        <span class="check-label">브랜드 입력</span>
      </div>

      <div class="checklist-item" :class="{ 'completed': form.categoryId }">
        <span class="check-icon">{{ form.categoryId ? '✓' : '○' }}</span>
        <span class="check-label">카테고리 선택</span>
      </div>

      <div class="checklist-item" :class="{ 'completed': form.price && form.price.trim() }">
        <span class="check-icon">{{ form.price && form.price.trim() ? '✓' : '○' }}</span>
        <span class="check-label">가격 입력</span>
      </div>

      <div class="checklist-item" :class="{ 'completed': thumbnailFile }">
        <span class="check-icon">{{ thumbnailFile ? '✓' : '○' }}</span>
        <span class="check-label">대표 이미지 등록</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  completionPercentage: {
    type: Number,
    required: true
  },
  form: {
    type: Object,
    required: true
  },
  thumbnailFile: {
    type: Object,
    default: null
  }
})
</script>

<style scoped>
.completion-status {
  background: var(--bg-subtle);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid var(--border-strong);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--c-text-600);
  margin: 0;
  letter-spacing: -0.01em;
}

.percentage {
  font-size: 24px;
  font-weight: 700;
  color: var(--c-success);
  letter-spacing: -0.02em;
}

.progress-bar {
  height: 8px;
  background: var(--border-strong);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-success) 0%, var(--c-success) 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-fill.complete {
  background: linear-gradient(90deg, var(--c-success) 0%, #047857 100%);
}

.checklist {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-elevated);
  border-radius: 8px;
  border: 1px solid var(--border-strong);
  transition: all 0.2s;
}

.checklist-item.completed {
  background: var(--c-success-soft);
  border-color: var(--c-success);
}

.check-icon {
  font-size: 16px;
  font-weight: 700;
  color: var(--c-text-400);
}

.checklist-item.completed .check-icon {
  color: var(--c-success);
}

.check-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-500);
  letter-spacing: -0.01em;
}

.checklist-item.completed .check-label {
  color: var(--c-success);
  font-weight: 600;
}

@media (max-width: 768px) {
  .checklist {
    grid-template-columns: 1fr;
  }

  .percentage {
    font-size: 20px;
  }
}
</style>