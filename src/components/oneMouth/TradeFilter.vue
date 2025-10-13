// ============================================================
// 2. TradeFilter.vue (사이드바 필터)
// ============================================================

<template>
  <aside class="sidebar">
    <!-- 카테고리 섹션 -->
    <div class="sidebar-section">
      <h3 class="section-title">카테고리</h3>
      <div class="category-list">
        <button
            class="category-item"
            :class="{ active: selectedCategory === '' }"
            @click="handleCategorySelect('')"
        >
          전체
        </button>

        <button
            v-for="category in categories"
            :key="category.categoryId"
            class="category-item"
            :class="{ active: selectedCategory === category.categoryId }"
            @click="handleCategorySelect(category.categoryId)"
        >
          {{ category.categoryName }}
        </button>
      </div>
    </div>

    <!-- 거래 상태 필터 -->
    <div class="sidebar-section">
      <h3 class="section-title">거래 상태</h3>
      <div class="filter-list">
        <label class="filter-label">
          <input
              type="radio"
              name="status"
              value=""
              :checked="selectedStatus === ''"
              @change="handleStatusChange('')"
              class="filter-radio"
          />
          <span>전체</span>
        </label>
        <label class="filter-label">
          <input
              type="radio"
              name="status"
              value="ON_SALE"
              :checked="selectedStatus === 'ON_SALE'"
              @change="handleStatusChange('ON_SALE')"
              class="filter-radio"
          />
          <span>판매중</span>
        </label>
        <label class="filter-label">
          <input
              type="radio"
              name="status"
              value="RESERVED"
              :checked="selectedStatus === 'RESERVED'"
              @change="handleStatusChange('RESERVED')"
              class="filter-radio"
          />
          <span>예약중</span>
        </label>
        <label class="filter-label">
          <input
              type="radio"
              name="status"
              value="SOLD_OUT"
              :checked="selectedStatus === 'SOLD_OUT'"
              @change="handleStatusChange('SOLD_OUT')"
              class="filter-radio"
          />
          <span>거래완료</span>
        </label>
      </div>
    </div>

    <!-- 가격대 필터 -->
    <div class="sidebar-section">
      <h3 class="section-title">가격대</h3>
      <div class="filter-list">
        <label class="filter-label">
          <input
              type="radio"
              name="price"
              value=""
              :checked="selectedPrice === ''"
              @change="handlePriceChange('')"
              class="filter-radio"
          />
          <span>전체</span>
        </label>
        <label class="filter-label">
          <input
              type="radio"
              name="price"
              value="0-10000"
              :checked="selectedPrice === '0-10000'"
              @change="handlePriceChange('0-10000')"
              class="filter-radio"
          />
          <span>1만원 이하</span>
        </label>
        <label class="filter-label">
          <input
              type="radio"
              name="price"
              value="10000-20000"
              :checked="selectedPrice === '10000-20000'"
              @change="handlePriceChange('10000-20000')"
              class="filter-radio"
          />
          <span>1만원 ~ 2만원</span>
        </label>
        <label class="filter-label">
          <input
              type="radio"
              name="price"
              value="20000-999999"
              :checked="selectedPrice === '20000-999999'"
              @change="handlePriceChange('20000-999999')"
              class="filter-radio"
          />
          <span>2만원 이상</span>
        </label>
      </div>
    </div>

    <!-- 지역 검색 -->
    <div class="sidebar-section">
      <h3 class="section-title">거래 지역</h3>
      <input
          type="text"
          class="location-input"
          :value="location"
          @input="handleLocationInput"
          placeholder="지역을 입력하세요"
      />
    </div>
  </aside>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  selectedCategory: {
    type: String,
    default: ''
  },
  selectedStatus: {
    type: String,
    default: ''
  },
  selectedPrice: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:category', 'update:status', 'update:price', 'update:location']);

const handleCategorySelect = (categoryId) => {
  emit('update:category', categoryId);
};

const handleStatusChange = (status) => {
  emit('update:status', status);
};

const handlePriceChange = (price) => {
  emit('update:price', price);
};

const handleLocationInput = (event) => {
  emit('update:location', event.target.value);
};
</script>

<style scoped>
.sidebar {
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  position: sticky;
  top: 32px;
  overflow: hidden;
}

.sidebar-section {
  padding: 24px;
  border-bottom: 1px solid #E5E7EB;
}

.sidebar-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
  letter-spacing: -0.01em;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  background: #F3F4F6;
  color: #111827;
}

.category-item.active {
  background: #EEF2FF;
  color: #4F46E5;
  font-weight: 600;
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6B7280;
  cursor: pointer;
  transition: color 0.2s;
}

.filter-label:hover {
  color: #111827;
}

.filter-radio {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #4F46E5;
}

.location-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: #F9FAFB;
  color: #111827;
  transition: all 0.2s;
}

.location-input:focus {
  outline: none;
  border-color: #4F46E5;
  background: #FFFFFF;
}

.location-input::placeholder {
  color: #9CA3AF;
}

@media (max-width: 1024px) {
  .sidebar {
    position: static;
  }
}

@media (max-width: 480px) {
  .sidebar-section {
    padding: 20px 16px;
  }
}
</style>
