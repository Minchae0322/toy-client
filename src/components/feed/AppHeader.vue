<template>
  <header class="header">
    <div class="header-container">
      <div class="header-left">
        <div class="search-box">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="브랜드, 제품, 사람 검색..." v-model="searchQuery" />
        </div>
      </div>

    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';

const searchQuery = ref('');
</script>

<style scoped>
.header {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(8px);
  background: var(--header-blur-bg);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  max-width: 100%;
}

@media (min-width: 1024px) {
  .header-container {
    padding: 20px 32px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 480px;
  display: none;
}

@media (min-width: 768px) {
  .search-box {
    display: block;
  }
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--secondary);
  stroke-width: 2;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--primary);
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--bg-elevated);
}

.search-box input::placeholder {
  color: var(--secondary);
}

</style>