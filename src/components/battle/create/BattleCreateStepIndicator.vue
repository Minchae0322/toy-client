<template>
  <div class="step-indicator">
    <div class="steps-container">
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
                  width="16"
                  height="16"
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
              class="step-connector"
              :class="{ completed: currentStep > index + 1 }"
          ></div>
        </template>
      </div>
      <div class="progress-bar">
        <div
            class="progress-fill"
            :style="{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
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
</script>

<style scoped>
.step-indicator {
  background: white;
  padding: 32px 0;
  border-bottom: 1px solid #E5E7EB;
}

.steps-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 60px;
  position: relative;
}

.steps {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex: 1;
  position: relative;
}

.step-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #F3F4F6;
  border: 3px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #9CA3AF;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
}

.step-item.active .step-circle {
  background: #1A1A1A;
  border-color: #1A1A1A;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(26, 26, 26, 0.15);
}

.step-item.completed .step-circle {
  background: #10B981;
  border-color: #10B981;
  color: white;
  animation: checkmark 0.4s ease;
}

@keyframes checkmark {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}

.step-number {
  font-variant-numeric: tabular-nums;
}

.step-label {
  font-size: 14px;
  font-weight: 600;
  color: #9CA3AF;
  text-align: center;
  transition: all 0.3s;
  white-space: nowrap;
}

.step-item.active .step-label {
  color: #1A1A1A;
  font-weight: 700;
}

.step-item.completed .step-label {
  color: #6B7280;
}

.step-connector {
  position: absolute;
  top: 22px;
  left: 0;
  right: 0;
  height: 3px;
  background: #E5E7EB;
  z-index: 1;
  transition: background 0.3s;
}

.progress-bar {
  position: absolute;
  top: 22px;
  left: 60px;
  right: 60px;
  height: 3px;
  background: #E5E7EB;
  border-radius: 2px;
  overflow: hidden;
  z-index: 1;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981 0%, #059669 100%);
  border-radius: 2px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 1024px) {
  .steps-container {
    padding: 0 24px;
  }

  .progress-bar {
    left: 24px;
    right: 24px;
  }
}

@media (max-width: 640px) {
  .step-indicator {
    padding: 24px 0;
  }

  .step-circle {
    width: 36px;
    height: 36px;
    font-size: 14px;
    border-width: 2px;
  }

  .step-item.active .step-circle {
    transform: scale(1.05);
  }

  .step-label {
    font-size: 12px;
  }

  .progress-bar {
    top: 18px;
  }
}
</style>