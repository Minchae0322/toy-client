<template>
  <section class="section">
    <h2>
      판매 방식
      <span class="required">*</span>
    </h2>

    <div class="type-grid">
      <label
          v-for="type in saleTypes"
          :key="type.value"
          class="type-card"
          :class="{ active: modelValue === type.value }"
      >
        <input
            type="radio"
            :value="type.value"
            :checked="modelValue === type.value"
            @change="$emit('update:modelValue', type.value)"
        >
        <div class="type-content">
          <div class="type-icon">{{ type.icon }}</div>
          <div class="type-info">
            <h3>{{ type.label }}</h3>
            <p>{{ type.description }}</p>
          </div>
        </div>
        <div v-if="modelValue === type.value" class="check-icon">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M10 3L4.5 8.5L2 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </label>
    </div>
  </section>
</template>

<script setup>
defineProps({
  modelValue: String
});

defineEmits(['update:modelValue']);

const saleTypes = [
  {
    value: 'ONEMOUTH',
    label: '한입만',
    icon: '🍪',
    description: '소량만 판매하고 싶어요'
  },
  {
    value: 'NORMAL',
    label: '일반 판매',
    icon: '🛒',
    description: '일반적인 판매 방식'
  },
  {
    value: 'GROUP_BUY',
    label: '공동구매',
    icon: '👥',
    description: '여럿이 모여서 저렴하게'
  },
  {
    value: 'PROXY',
    label: '대리구매',
    icon: '🚀',
    description: '대신 구매해드려요'
  }
];
</script>

<style scoped>
.section {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.section h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

.required {
  color: #ef4444;
  margin-left: 0.25rem;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.type-card {
  position: relative;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.type-card:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.type-card.active {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.05);
}

.type-card input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.type-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.type-icon {
  width: 3rem;
  height: 3rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.type-info {
  flex: 1;
  min-width: 0;
}

.type-info h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.type-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.check-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  background: #4f46e5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .type-grid {
    grid-template-columns: 1fr;
  }
}
</style>