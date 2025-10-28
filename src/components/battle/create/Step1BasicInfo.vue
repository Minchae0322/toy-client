<template>
  <div class="form-section">
    <div class="form-group">
      <label class="form-label">
        배틀 제목 <span class="required">*</span>
      </label>
      <input
          :value="battleForm.title"
          @input="$emit('update:battleForm', { ...battleForm, title: $event.target.value })"
          type="text"
          class="form-input"
          placeholder="예: 2025년 2월 최고의 스니커즈는?"
          maxlength="50"
      >
      <div class="char-counter">{{ battleForm.title.length }} / 50</div>
      <div class="form-hint">명확하고 흥미로운 제목을 작성해주세요</div>
    </div>

    <div class="form-group">
      <label class="form-label">
        배틀 타입 <span class="required">*</span>
      </label>
      <div class="battle-type-selector">
        <div
            v-for="type in battleTypes"
            :key="type.value"
            class="type-option"
            :class="{ selected: battleForm.type === type.value }"
            @click="$emit('update:battleForm', { ...battleForm, type: type.value })"
        >
          <div class="type-icon">{{ type.icon }}</div>
          <div class="type-title">{{ type.title }}</div>
          <div class="type-desc">{{ type.desc }}</div>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">
        카테고리 <span class="required">*</span>
      </label>
      <div class="category-grid">
        <div
            v-for="category in categories"
            :key="category.value"
            class="category-item"
            :class="{ selected: battleForm.category === category.value }"
            @click="$emit('update:battleForm', { ...battleForm, category: category.value })"
        >
          <div class="category-emoji">{{ category.emoji }}</div>
          <div class="category-name">{{ category.name }}</div>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">
        배틀 기간 <span class="required">*</span>
      </label>
      <div class="date-selector">
        <div class="date-input-group">
          <span class="date-label">시작일</span>
          <input
              :value="battleForm.startDate"
              @input="$emit('update:battleForm', { ...battleForm, startDate: $event.target.value })"
              type="date"
              class="form-input"
          >
        </div>
        <div class="date-input-group">
          <span class="date-label">종료일</span>
          <input
              :value="battleForm.endDate"
              @input="$emit('update:battleForm', { ...battleForm, endDate: $event.target.value })"
              type="date"
              class="form-input"
          >
        </div>
      </div>
      <div class="form-hint">최소 7일, 최대 31일까지 설정 가능합니다</div>
    </div>

    <div class="form-group">
      <label class="form-label">배틀 설명</label>
      <textarea
          :value="battleForm.description"
          @input="$emit('update:battleForm', { ...battleForm, description: $event.target.value })"
          class="form-input textarea"
          placeholder="배틀에 대한 설명이나 투표 기준을 알려주세요 (선택)"
          maxlength="200"
      ></textarea>
      <div class="char-counter">{{ battleForm.description.length }} / 200</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  battleForm: {
    type: Object,
    required: true
  },
  battleTypes: {
    type: Array,
    required: true
  },
  categories: {
    type: Array,
    required: true
  }
});

defineEmits(['update:battleForm']);
</script>

<style scoped>
.form-section {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #F0F0F3;
}

.form-group {
  margin-bottom: 32px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.required {
  color: #DC2626;
}

.form-hint {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1A1A1A;
}

.textarea {
  min-height: 100px;
  resize: vertical;
}

.char-counter {
  text-align: right;
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
}

.battle-type-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.type-option {
  padding: 20px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.type-option:hover {
  border-color: #9CA3AF;
}

.type-option.selected {
  border-color: #1A1A1A;
  background: #FAFBFC;
}

.type-icon {
  width: 40px;
  height: 40px;
  background: #F3F4F6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 12px;
}

.type-option.selected .type-icon {
  background: #1A1A1A;
}

.type-title {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.4;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.category-item {
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  border-color: #9CA3AF;
  background: #FAFBFC;
}

.category-item.selected {
  border-color: #1A1A1A;
  background: #1A1A1A;
  color: white;
}

.category-emoji {
  font-size: 24px;
  margin-bottom: 4px;
}

.category-name {
  font-size: 12px;
  font-weight: 500;
}

.date-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-label {
  font-size: 12px;
  color: #6B7280;
  font-weight: 500;
}
</style>