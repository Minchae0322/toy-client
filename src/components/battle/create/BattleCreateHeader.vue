<template>
  <header class="create-header">
    <div class="header-content">
      <button class="back-btn" @click="$emit('back')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        돌아가기
      </button>
      <h1 class="page-title">배틀 만들기</h1>
      <button class="save-draft-btn" @click="$emit('save-draft')">임시저장</button>
    </div>
  </header>
</template>

<script setup>
defineEmits(['back', 'save-draft']);
</script>

<style scoped>
.create-header {
  background: #FFFFFF;
  padding: 24px 40px;
  border-bottom: 1px solid #F0F0F3;
  position: sticky;
  top: 0;
  z-index: 30;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #9CA3AF;
  color: #1A1A1A;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
  letter-spacing: -0.02em;
}

.save-draft-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-draft-btn:hover {
  border-color: #9CA3AF;
  color: #1A1A1A;
}
</style>