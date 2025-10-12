<template>
  <div class="search-header">
    <div class="search-container">
      <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17.5 17.5L13.875 13.875" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <input
          type="text"
          class="search-input"
          placeholder="상품명, 브랜드를 검색해보세요"
          :value="keyword"
          @input="$emit('update:keyword', $event.target.value)"
          @keyup.enter="$emit('search')"
      >
      <button
          v-if="keyword"
          class="clear-btn"
          @click="$emit('clear')"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <div v-if="isLoggedIn" class="action-section">
      <router-link to="/products/create" class="create-product-btn">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 3.75V14.25M3.75 9H14.25" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>상품 등록</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  keyword: {
    type: String,
    default: ''
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:keyword', 'search', 'clear'])
</script>

<style scoped>
.search-header {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #F3F4F6;
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.search-container {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 48px 12px 48px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  background: #FAFAFA;
  color: #111827;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.search-input:focus {
  outline: none;
  border-color: #059669;
  background: white;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.search-input::placeholder {
  color: #9CA3AF;
}

.clear-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #E5E7EB;
  color: #6B7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #D1D5DB;
  color: #374151;
}

.action-section {
  display: flex;
  gap: 12px;
}

.create-product-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #059669;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.create-product-btn:hover {
  background: #047857;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

@media (max-width: 768px) {
  .search-header {
    flex-direction: column;
    padding: 16px;
  }

  .search-container {
    width: 100%;
  }

  .action-section {
    width: 100%;
  }

  .create-product-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .search-input {
    font-size: 13px;
    padding: 11px 44px 11px 44px;
  }
}
</style>