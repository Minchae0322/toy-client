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
  background: #F9FAFB;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid #E5E7EB;
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
  color: #374151;
  margin: 0;
  letter-spacing: -0.01em;
}

.percentage {
  font-size: 24px;
  font-weight: 700;
  color: #059669;
  letter-spacing: -0.02em;
}

.progress-bar {
  height: 8px;
  background: #E5E7EB;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #059669 0%, #10B981 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-fill.complete {
  background: linear-gradient(90deg, #059669 0%, #047857 100%);
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
  background: white;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  transition: all 0.2s;
}

.checklist-item.completed {
  background: #ECFDF5;
  border-color: #10B981;
}

.check-icon {
  font-size: 16px;
  font-weight: 700;
  color: #9CA3AF;
}

.checklist-item.completed .check-icon {
  color: #059669;
}

.check-label {
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  letter-spacing: -0.01em;
}

.checklist-item.completed .check-label {
  color: #059669;
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