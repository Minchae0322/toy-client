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
        <h1 class="page-title">배틀 만들기</h1>
      </div>

      <!-- 중앙: 스텝 인디케이터 -->
      <div class="steps-wrapper">
        <div class="steps">
          <template v-for="(step, index) in steps" :key="index">
            <div
                class="step-item"
                :class="{
                  active: currentStep === index + 1,
                  completed: currentStep > index + 1
                }"
            >
              <div class="step-circle">
                <svg
                    v-if="currentStep > index + 1"
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
                :class="{ completed: currentStep > index + 1 }"
            ></div>
          </template>
        </div>
      </div>

      <!-- 우측: 액션 버튼 -->
      <button class="save-draft-btn" @click="$emit('save-draft')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        <span>임시저장</span>
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  steps: {
    type: Array,
    required: true
  },
  currentStep: {
    type: Number,
    required: true
  }
});

defineEmits(['back', 'save-draft']);
</script>

<style scoped>
.create-header {
  background: #FFFFFF;
  padding: 0;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.98);
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
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: #F3F4F6;
  color: #1A1A1A;
}

.back-btn:active {
  transform: scale(0.95);
}

.divider {
  width: 1px;
  height: 20px;
  background: #E5E7EB;
  flex-shrink: 0;
}

.page-title {
  font-size: 16px;
  font-weight: 700;
  color: #1A1A1A;
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
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #F3F4F6;
  border: 2px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #9CA3AF;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.step-item.active .step-circle {
  background: #1A1A1A;
  border-color: #1A1A1A;
  color: white;
  transform: scale(1.05);
}

.step-item.completed .step-circle {
  background: #10B981;
  border-color: #10B981;
  color: white;
}

.step-number {
  font-variant-numeric: tabular-nums;
}

.step-label {
  font-size: 13px;
  font-weight: 500;
  color: #9CA3AF;
  transition: all 0.25s;
  white-space: nowrap;
}

.step-item.active .step-label {
  color: #1A1A1A;
  font-weight: 700;
}

.step-item.completed .step-label {
  color: #6B7280;
}

.step-line {
  width: 40px;
  height: 2px;
  background: #E5E7EB;
  transition: background 0.25s;
  flex-shrink: 0;
}

.step-line.completed {
  background: #10B981;
}

/* ===== 우측: 액션 버튼 ===== */
.save-draft-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}

.save-draft-btn:hover {
  border-color: #D1D5DB;
  background: #F9FAFB;
}

.save-draft-btn:active {
  transform: scale(0.98);
}

.save-draft-btn svg {
  flex-shrink: 0;
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
  }

  .page-title {
    font-size: 15px;
  }

  .divider {
    display: none;
  }

  .back-btn {
    width: 36px;
    height: 36px;
  }

  .save-draft-btn span {
    display: none;
  }

  .save-draft-btn {
    width: 40px;
    height: 40px;
    padding: 0;
    justify-content: center;
  }

  .steps-wrapper {
    padding-top: 8px;
    margin-top: 4px;
  }

  .step-circle {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .step-label {
    display: none;
  }

  .step-line {
    width: 24px;
  }

  .step-item.active .step-label {
    display: block;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 10px 12px;
  }

  .page-title {
    font-size: 14px;
  }

  .step-circle {
    width: 26px;
    height: 26px;
    font-size: 11px;
  }

  .step-line {
    width: 16px;
  }

  .step-item.active .step-label {
    font-size: 10px;
  }
}
</style>