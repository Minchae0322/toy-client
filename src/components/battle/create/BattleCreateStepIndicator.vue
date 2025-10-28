<template>
  <div class="step-indicator">
    <div class="steps">
      <template v-for="(step, index) in steps" :key="index">
        <div
            class="step"
            :class="{
              active: currentStep === index + 1,
              completed: currentStep > index + 1
            }"
        >
          <span class="step-number">{{ index + 1 }}</span>
          <span class="step-label">{{ step }}</span>
        </div>
        <div v-if="index < steps.length - 1" class="step-line"></div>
      </template>
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
  padding: 24px 40px;
  border-bottom: 1px solid #F0F0F3;
}

.steps {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 600px;
  margin: 0 auto;
}

.step {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F3F4F6;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.step.active .step-number {
  background: #1A1A1A;
  color: white;
}

.step.completed .step-number {
  background: #10B981;
  color: white;
}

.step-label {
  font-size: 14px;
  font-weight: 500;
  color: #9CA3AF;
}

.step.active .step-label {
  color: #1A1A1A;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #E5E7EB;
  margin: 0 -4px;
}

.step.completed ~ .step-line {
  background: #10B981;
}
</style>