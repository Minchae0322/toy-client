<template>
  <div>
    <div class="section-header">
      <h2 class="section-title">전체 참여 제품</h2>
      <div class="filter-controls">
        <select :value="sortBy" @change="$emit('update:sortBy', $event.target.value)" class="sort-select">
          <option value="voteCount">득표순</option>
          <option value="latest">최신순</option>
        </select>
        <select :value="filterStatus" @change="$emit('update:filterStatus', $event.target.value)" class="sort-select">
          <option value="all">전체</option>
          <option value="available">활성</option>
          <option value="soldout">비활성</option>
        </select>
      </div>
    </div>

    <div class="products-grid">
      <BattleProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          @click="$emit('productClick', product.id)"
          @toggle-like="$emit('toggleLike', product.id)"
          @open-comments="$emit('openComments', product.id)"
      />
    </div>

    <div v-if="hasMore && remainingCount > 0" class="load-more">
      <button class="load-more-btn" @click="$emit('loadMore')">
        더 보기 ({{ remainingCount }}개 남음)
      </button>
    </div>

    <div v-if="products.length === 0" class="empty-state">
      <p>등록된 제품이 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import BattleProductCard from './BattleProductCard.vue'

defineProps({
  products: {
    type: Array,
    required: true
  },
  sortBy: {
    type: String,
    required: true
  },
  filterStatus: {
    type: String,
    required: true
  },
  remainingCount: {
    type: Number,
    default: 0
  },
  hasMore: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'update:sortBy',
  'update:filterStatus',
  'productClick',
  'toggleLike',
  'openComments',
  'loadMore'
])
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 56px 0 32px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #0A0A0A;
  letter-spacing: -0.02em;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.sort-select {
  padding: 9px 16px;
  background: white;
  border: 1px solid #D4D4D4;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.sort-select:hover {
  border-color: #A3A3A3;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1280px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}

.load-more {
  text-align: center;
  padding: 48px 0;
}

.load-more-btn {
  padding: 14px 36px;
  background: white;
  border: 1px solid #D4D4D4;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #737373;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.load-more-btn:hover {
  border-color: #A3A3A3;
  color: #0A0A0A;
  background: #FAFAFA;
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #A3A3A3;
}
</style>