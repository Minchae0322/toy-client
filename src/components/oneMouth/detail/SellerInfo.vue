<!-- SellerInfo.vue -->
<template>
  <section class="section">
    <h3 class="section-title">판매자 정보</h3>
    <div class="seller-card">
      <div class="seller-avatar">
        {{ seller?.nickname?.[0] || 'S' }}
      </div>
      <div class="seller-details">
        <div class="seller-header">
          <span class="seller-name">{{ seller?.nickname || '판매자' }}</span>
          <span v-if="seller?.isVerified" class="badge">인증</span>
        </div>
        <div class="seller-stats">
          <span class="stat">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" class="star">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            {{ seller?.rating || '4.8' }}
          </span>
          <span class="stat">판매 {{ seller?.salesCount || 0 }}건</span>
          <span class="stat">응답률 {{ seller?.responseRate || 99 }}%</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  seller: { type: Object, default: () => ({}) }
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

.seller-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
}

.seller-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  flex-shrink: 0;
}

.seller-details {
  flex: 1;
}

.seller-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.seller-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1A1A1A;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #F3F4F6;
  color: #6B7280;
  border-radius: 4px;
  font-weight: 500;
}

.seller-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.8125rem;
  color: #737373;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.star {
  color: #FBBF24;
}
</style>