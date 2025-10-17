<!-- ProductInfo.vue -->
<template>
  <section class="section">
    <h3 class="section-title">상품 정보</h3>
    <div class="content">
      <p class="description">{{ product.description || '상품 설명이 없습니다.' }}</p>

      <div v-if="product.product" class="specs">
        <div class="spec-item">
          <span class="spec-label">원산지</span>
          <span class="spec-value">{{ product.product.origin || '국내산' }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">브랜드</span>
          <span class="spec-value">{{ product.product.brand || '-' }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">유통기한</span>
          <span class="spec-value">{{ product.product.expiryDate || '제조일로부터 7일' }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">보관방법</span>
          <span class="spec-value">{{ product.product.storageMethod || '냉장보관' }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  product: { type: Object, required: true }
})
</script>

<style scoped>
.section {
  padding-top: 3rem;
  border-top: 1px solid #E5E5E5;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1A1A1A;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.description {
  color: #525252;
  line-height: 1.7;
  font-size: 0.9375rem;
}

.specs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.spec-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.spec-label {
  font-size: 0.8125rem;
  color: #737373;
  font-weight: 500;
}

.spec-value {
  font-size: 0.9375rem;
  color: #1A1A1A;
}
</style>