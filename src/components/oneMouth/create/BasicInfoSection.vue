<template>
  <section class="section">
    <h2>기본 정보</h2>

    <div class="form-group">
      <label>
        제목
        <span class="required">*</span>
      </label>
      <input
          :value="title"
          @input="$emit('update:title', $event.target.value)"
          type="text"
          placeholder="상품 제목을 입력하세요"
          maxlength="500"
          class="input"
      >
      <div class="char-count">{{ title.length }}/500</div>
    </div>

    <div class="form-group">
      <label>상품 설명</label>
      <textarea
          :value="description"
          @input="$emit('update:description', $event.target.value)"
          rows="5"
          placeholder="상품에 대해 자세히 설명해주세요"
          maxlength="2000"
          class="textarea"
      ></textarea>
      <div class="char-count">{{ description.length }}/2000</div>
    </div>

    <div class="form-group">
      <label>거래 희망 지역</label>
      <input
          :value="location"
          @input="$emit('update:location', $event.target.value)"
          type="text"
          placeholder="예: 서울시 강남구"
          maxlength="255"
          class="input"
      >
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  location: String
});

defineEmits(['update:title', 'update:description', 'update:location']);
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.required {
  color: #ef4444;
  margin-left: 0.25rem;
}

.input,
.textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 120px;
}

.char-count {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: right;
}
</style>