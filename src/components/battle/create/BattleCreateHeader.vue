<template>
  <header class="create-header">
    <div class="header-content">
      <!-- 좌측: 네비게이션 + 제목 -->
      <div class="header-left">
        <button class="back-btn" @click="$emit('back')" title="돌아가기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="divider"></div>
        <h1 class="page-title">요거픽 만들기</h1>
      </div>

      <!-- 중앙: 스텝 인디케이터 -->
      <div class="steps-wrapper">
        <div class="steps">
          <template v-for="(step, index) in steps" :key="index">
            <div
                class="step-item"
                :class="{
                  active: currentStep === index + 1,
                  completed: maxStepReached > index + 1 && currentStep !== index + 1
                }"
                @click="handleStepClick(index + 1)"
            >
              <div class="step-circle">
                <svg
                    v-if="maxStepReached > index + 1 && currentStep !== index + 1"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span v-else class="step-number">{{ index + 1 }}</span>
              </div>
              <span class="step-label">{{ step }}</span>
            </div>
            <div
                v-if="index < steps.length - 1"
                class="step-line"
                :class="{ completed: maxStepReached > index + 1 }"
            ></div>
          </template>
        </div>
      </div>

      <!-- 우측: 액션 버튼 -->
      <div class="header-right">
        <!-- 저장 상태 표시 -->
        <span v-if="lastSavedAt" class="save-status">
          {{ formatSavedTime(lastSavedAt) }}
        </span>

        <button
            class="save-draft-btn"
            :class="{ saving: isSaving }"
            :disabled="isSaving"
            @click="$emit('save-draft')"
        >
          <!-- 저장 중 스피너 -->
          <svg
              v-if="isSaving"
              class="spinner"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
          </svg>
          <!-- 저장 아이콘 -->
          <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span>{{ isSaving ? '저장 중...' : '임시저장' }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  steps: {
    type: Array,
    required: true
  },
  currentStep: {
    type: Number,
    required: true
  },
  maxStepReached: {
    type: Number,
    default: 1
  },
  lastSavedAt: {
    type: Date,
    default: null
  },
  isSaving: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['back', 'save-draft', 'go-to-step']);

/**
 * 스텝 클릭 핸들러 - 모든 스텝으로 이동 가능
 */
const handleStepClick = (stepNumber) => {
  emit('go-to-step', stepNumber);
};

/**
 * 저장 시간 포맷
 */
const formatSavedTime = (date) => {
  if (!date) return ''

  const now = new Date()
  const diff = now - date

  // 1분 이내
  if (diff < 60000) {
    return '방금 전 저장됨'
  }

  // 1시간 이내
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}분 전 저장됨`
  }

  // 오늘
  if (date.toDateString() === now.toDateString()) {
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const period = hours >= 12 ? '오후' : '오전'
    const hour12 = hours % 12 || 12
    return `오늘 ${period} ${hour12}:${minutes}`
  }

  // 그 외
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day} 저장됨`
}
</script>

<style scoped>
.create-header {
  background: var(--bg-elevated);
  padding: 0;
  border-bottom: 1px solid var(--border-strong);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  background: var(--header-blur-bg);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 60px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 48px;
}

/* ===== 좌측: 네비게이션 ===== */
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--c-text-500);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: var(--border-default);
  color: var(--text-primary);
}

.back-btn:active {
  transform: scale(0.95);
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--border-strong);
  flex-shrink: 0;
}

.page-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  white-space: nowrap;
}

/* ===== 중앙: 스텝 인디케이터 ===== */
.steps-wrapper {
  display: flex;
  justify-content: center;
  min-width: 0;
}

.steps {
  display: flex;
  align-items: center;
  gap: 4px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.step-item:hover .step-circle {
  transform: scale(1.1);
}

.step-item:hover .step-label {
  color: var(--text-primary);
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--border-default);
  border: 2px solid var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text-400);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.step-item.active .step-circle {
  background: var(--c-ink-900);
  border-color: var(--c-ink-900);
  color: white;
  transform: scale(1.05);
}

.step-item.completed .step-circle {
  background: var(--c-success);
  border-color: var(--c-success);
  color: white;
}

.step-number {
  font-variant-numeric: tabular-nums;
}

.step-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-400);
  transition: all 0.25s;
  white-space: nowrap;
}

.step-item.active .step-label {
  color: var(--text-primary);
  font-weight: 700;
}

.step-item.completed .step-label {
  color: var(--c-text-500);
}

.step-line {
  width: 40px;
  height: 2px;
  background: var(--border-strong);
  transition: background 0.25s;
  flex-shrink: 0;
}

.step-line.completed {
  background: var(--c-success);
}

/* ===== 우측: 액션 버튼 ===== */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.save-status {
  font-size: 12px;
  color: var(--c-text-400);
  white-space: nowrap;
}

.save-draft-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  color: var(--c-text-600);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}

.save-draft-btn:hover:not(:disabled) {
  border-color: var(--c-text-300);
  background: var(--bg-subtle);
}

.save-draft-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.save-draft-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.save-draft-btn.saving {
  color: var(--c-text-500);
}

.save-draft-btn svg {
  flex-shrink: 0;
}

.save-draft-btn .spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===== 반응형 ===== */
@media (max-width: 1200px) {
  .header-content {
    gap: 32px;
  }

  .step-label {
    display: none;
  }

  .step-line {
    width: 32px;
  }
}

@media (max-width: 1024px) {
  .header-content {
    padding: 16px 24px;
    grid-template-columns: 1fr auto;
    gap: 16px;
  }

  .steps-wrapper {
    grid-column: 1 / -1;
    order: 3;
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid #F0F0F3;
  }

  .step-label {
    display: block;
  }

  .step-line {
    width: 24px;
  }
}

@media (max-width: 640px) {
  .header-content {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-left {
    flex-shrink: 0;
  }

  .page-title {
    display: none;
  }

  .divider {
    display: none;
  }

  .back-btn {
    width: 36px;
    height: 36px;
  }

  .steps-wrapper {
    flex: 1;
    justify-content: center;
    grid-column: unset;
    order: unset;
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }

  .steps {
    justify-content: center;
  }

  .step-circle {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }

  .step-label {
    display: none;
  }

  .step-line {
    width: 20px;
  }

  .header-right {
    flex-shrink: 0;
    margin-left: auto;
  }

  .save-status {
    display: none;
  }

  .save-draft-btn span {
    display: none;
  }

  .save-draft-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 10px 12px;
    gap: 8px;
  }

  .back-btn {
    width: 32px;
    height: 32px;
  }

  .step-circle {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }

  .step-line {
    width: 16px;
  }

  .save-draft-btn {
    width: 32px;
    height: 32px;
  }
}
</style>