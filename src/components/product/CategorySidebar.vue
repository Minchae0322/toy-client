<template>
  <aside class="category-sidebar">
    <!-- 카테고리 섹션 -->
    <div class="sidebar-section">
      <h3 class="sidebar-title">카테고리</h3>
      <ul class="category-list">
        <li
            class="category-item"
            :class="{ active: !selectedCategoryId }"
            @click="$emit('select-category', null)"
        >
          <span class="category-name">전체</span>
        </li>
        <li
            v-for="category in categories"
            :key="category.categoryId"
            class="category-item"
            :class="{ active: selectedCategoryId === category.categoryId }"
            @click="$emit('select-category', category.categoryId)"
        >
          <span class="category-name">{{ category.categoryName }}</span>
          <span v-if="category.productCount" class="product-count">{{ category.productCount }}</span>
        </li>
      </ul>
    </div>

    <!-- 필터 섹션 -->
    <div class="sidebar-section">
      <h3 class="sidebar-title">필터</h3>
      <ul class="filter-list">
        <li
            class="filter-item"
            :class="{ active: filters.tradeAvailable }"
            @click="$emit('toggle-filter', 'tradeAvailable')"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11.3333 7.33334L8.66667 10L6 7.33334" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8.66667 10V2.66667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.3333 10V13.3333H3.33333V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>거래 가능</span>
        </li>
        <li
            class="filter-item"
            :class="{ active: filters.nearby }"
            @click="$emit('toggle-filter', 'nearby')"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 8.66667C9.10457 8.66667 10 7.77124 10 6.66667C10 5.5621 9.10457 4.66667 8 4.66667C6.89543 4.66667 6 5.5621 6 6.66667C6 7.77124 6.89543 8.66667 8 8.66667Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12.7133 11.38C11.6067 13.0533 9.91333 14 8 14C6.08667 14 4.39333 13.0533 3.28667 11.38C2.18 9.70667 2.18 7.62667 3.28667 5.95333C4.39333 4.28 6.08667 3.33333 8 3.33333C9.91333 3.33333 11.6067 4.28 12.7133 5.95333C13.82 7.62667 13.82 9.70667 12.7133 11.38Z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span>5km 이내</span>
        </li>
        <li
            class="filter-item"
            :class="{ active: filters.highRating }"
            @click="$emit('toggle-filter', 'highRating')"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.33334L10.06 5.50668L14.6667 6.18001L11.3333 9.42668L12.12 14.0133L8 11.8467L3.88 14.0133L4.66667 9.42668L1.33333 6.18001L5.94 5.50668L8 1.33334Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>4.0 이상</span>
        </li>
        <li
            class="filter-item"
            :class="{ active: filters.newProduct }"
            @click="$emit('toggle-filter', 'newProduct')"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14.6667 7.38667V8C14.6658 9.43762 14.2003 10.8365 13.3395 11.988C12.4787 13.1394 11.2688 13.9817 9.89016 14.3893C8.51154 14.7969 7.03809 14.748 5.68957 14.2497C4.34104 13.7515 3.18969 12.8307 2.40723 11.6247C1.62476 10.4187 1.25311 8.99194 1.34801 7.55749C1.44291 6.12304 1.99947 4.75755 2.93905 3.66471C3.87863 2.57188 5.14886 1.81025 6.55277 1.49343C7.95668 1.17662 9.42421 1.32157 10.74 1.90667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14.6667 2.66667L8 9.34L6 7.34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>신상품</span>
        </li>
      </ul>
    </div>

    <!-- 마이페이지 섹션 -->
    <div v-if="isLoggedIn" class="sidebar-section">
      <h3 class="sidebar-title">마이페이지</h3>
      <ul class="mypage-list">
        <li class="mypage-item" @click="$emit('go-to-my-products')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4H14M2 4V13.3333C2 13.5101 2.07024 13.6797 2.19526 13.8047C2.32029 13.9298 2.48986 14 2.66667 14H13.3333C13.5101 14 13.6797 13.9298 13.8047 13.8047C13.9298 13.6797 14 13.5101 14 13.3333V4M2 4L4 2H12L14 4M6 7.33333V9.33333M10 7.33333V9.33333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>내 상품</span>
        </li>
        <li class="mypage-item" @click="$emit('go-to-liked-products')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.8933 4.30668C13.7216 3.90582 13.4683 3.54392 13.15 3.24334C12.8327 2.94092 12.4583 2.70467 12.05 2.54834C11.6272 2.38667 11.1771 2.30334 10.7233 2.30334C10.0867 2.30334 9.465 2.46834 8.91667 2.78168C8.78333 2.85501 8.65667 2.93501 8.53667 3.02168C8.41667 2.93501 8.29 2.85501 8.15667 2.78168C7.60833 2.46834 6.98667 2.30334 6.35 2.30334C5.89 2.30334 5.44667 2.38668 5.02333 2.54834C4.61333 2.70501 4.24333 2.93834 3.92333 3.24334C3.60447 3.54349 3.35101 3.90545 3.17933 4.30668C3.00199 4.72249 2.91145 5.16845 2.91333 5.61834C2.91333 6.05168 2.99667 6.50168 3.16333 6.95834C3.30333 7.34501 3.50667 7.74168 3.76667 8.13834C4.16667 8.74168 4.71 9.36168 5.37667 9.98168C6.40333 10.9383 7.41667 11.6317 7.46 11.665L8.03667 12.0317C8.31 12.2217 8.76 12.2217 9.03333 12.0317L9.61 11.665C9.65333 11.6283 10.6633 10.9383 11.6933 9.98168C12.36 9.36168 12.9033 8.74168 13.3033 8.13834C13.5633 7.74168 13.77 7.34501 13.9067 6.95834C14.0733 6.50168 14.1567 6.05168 14.1567 5.61834C14.16 5.16668 14.0733 4.72168 13.8933 4.30668Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>찜한 상품</span>
        </li>
        <li class="mypage-item" @click="$emit('go-to-my-reviews')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 10.6667C14 11.0203 13.8595 11.3594 13.6095 11.6095C13.3594 11.8595 13.0203 12 12.6667 12H4.66667L2 14.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H12.6667C13.0203 2 13.3594 2.14048 13.6095 2.39052C13.8595 2.64057 14 2.97971 14 3.33333V10.6667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>내 리뷰</span>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  selectedCategoryId: {
    type: [Number, String, null],
    default: null
  },
  filters: {
    type: Object,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits([
  'select-category',
  'toggle-filter',
  'go-to-my-products',
  'go-to-liked-products',
  'go-to-my-reviews'
])
</script>

<style scoped>
.category-sidebar {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #F3F4F6;
  position: sticky;
  top: 24px;
  height: fit-content;
}

.sidebar-section {
  margin-bottom: 32px;
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  letter-spacing: -0.01em;
}

.category-list,
.filter-list,
.mypage-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item,
.filter-item,
.mypage-item {
  padding: 10px 14px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #6B7280;
  letter-spacing: -0.01em;
}

.category-item:hover,
.filter-item:hover,
.mypage-item:hover {
  background: #F9FAFB;
  color: #111827;
}

.category-item.active {
  background: #ECFDF5;
  color: #059669;
  font-weight: 600;
}

.filter-item,
.mypage-item {
  gap: 10px;
  justify-content: flex-start;
}

.filter-item.active {
  background: #ECFDF5;
  color: #059669;
  font-weight: 600;
}

.filter-item.active svg,
.mypage-item:hover svg {
  color: #059669;
}

.product-count {
  font-size: 12px;
  color: #9CA3AF;
  font-weight: 500;
}

.category-item.active .product-count {
  color: #059669;
}

@media (max-width: 1024px) {
  .category-sidebar {
    display: none;
  }
}
</style>