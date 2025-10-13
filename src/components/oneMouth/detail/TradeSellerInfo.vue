<!-- TradeSellerInfo.vue -->
<template>
  <div class="seller-card">
    <div class="seller-header">
      <h3 class="seller-section-title">판매자 정보</h3>
    </div>

    <div class="seller-content">
      <div class="seller-profile">
        <div class="seller-avatar">
          {{ getInitial(seller.name) }}
        </div>
        <div class="seller-details">
          <div class="seller-name">{{ seller.name }}</div>
          <div class="seller-stats">
            <span class="stat-item">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.33334L9.83 5.04001L14 5.66001L11 8.58668L11.66 12.74L8 10.82L4.34 12.74L5 8.58668L2 5.66001L6.17 5.04001L8 1.33334Z" fill="#F59E0B"/>
              </svg>
              {{ seller.rating }}
            </span>
            <span class="stat-divider">·</span>
            <span class="stat-item">거래 {{ seller.tradeCount }}회</span>
            <span v-if="seller.responseRate" class="stat-divider">·</span>
            <span v-if="seller.responseRate" class="stat-item">
              응답률 {{ seller.responseRate }}%
            </span>
          </div>
        </div>
      </div>

      <button class="btn-seller-more" @click="viewSellerProfile">
        다른 판매상품 보기
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  seller: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['view-profile']);

const getInitial = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

const viewSellerProfile = () => {
  emit('view-profile', props.seller.id);
  console.log('판매자 프로필 보기:', props.seller.id);
};
</script>

<style scoped>
.seller-card {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.seller-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.seller-section-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.seller-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.seller-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 200px;
}

.seller-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.seller-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.seller-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.seller-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6B7280;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-divider {
  color: #D1D5DB;
}

.btn-seller-more {
  padding: 10px 20px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
}

.btn-seller-more:hover {
  border-color: #4F46E5;
  color: #4F46E5;
}

@media (max-width: 768px) {
  .seller-content {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-seller-more {
    width: 100%;
  }
}
</style>