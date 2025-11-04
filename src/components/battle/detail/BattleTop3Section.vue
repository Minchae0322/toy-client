<template>
  <div class="top3-section">
    <h2 class="section-title">🏆 TOP 3</h2>
    <div class="top3-grid">
      <div
          v-for="product in products"
          :key="product.id"
          class="top-card"
          :class="getRankClass(product.rank)"
          @click="$emit('productClick', product.id)"
      >
        <div class="top-rank-badge">
          <component :is="getRankIcon(product.rank)" />
          <span class="rank-number">{{ product.rank }}</span>
        </div>
        <div class="top-product-image">
          <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
          <svg v-else width="90" height="90" viewBox="0 0 24 24" fill="none">
            <path d="M2 18h20l-2-6h-3.5l-1.5-4h-6l-1.5 4H4l-2 6z" fill="#E5E7EB"/>
            <path d="M7 18v3M17 18v3" stroke="#9CA3AF" stroke-width="2"/>
          </svg>
        </div>
        <div class="top-product-info">
          <h3 class="top-product-name">{{ product.name }}</h3>
          <p class="top-product-brand">{{ product.brand }}</p>
          <div class="top-vote-info">
            <span class="top-vote-count">{{ product.voteCount }}</span>
            <span class="top-vote-label">표</span>
            <span class="top-vote-percent">({{ product.votePercentage.toFixed(1) }}%)</span>
          </div>
          <div class="vote-progress">
            <div
                class="vote-progress-fill"
                :style="{
                width: `${product.votePercentage}%`,
                background: getProgressGradient(product.rank)
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  products: {
    type: Array,
    required: true
  }
})

defineEmits(['productClick'])

const getRankClass = (rank) => {
  if (rank === 1) return 'first'
  if (rank === 2) return 'second'
  if (rank === 3) return 'third'
  return ''
}

const getRankIcon = (rank) => {
  const gradientId = rank === 1 ? 'gold-gradient' : rank === 2 ? 'silver-gradient' : 'bronze-gradient'
  const stroke = rank === 1 ? '#F59E0B' : rank === 2 ? '#6B7280' : '#C2410C'

  return {
    template: `
      <svg width="${rank === 1 ? 36 : 32}" height="${rank === 1 ? 36 : 32}" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="url(#${gradientId})" stroke="${stroke}" stroke-width="2"/>
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${rank === 1 ? '#FBBF24' : rank === 2 ? '#D1D5DB' : '#FB923C'}"/>
            <stop offset="100%" style="stop-color:${rank === 1 ? '#F59E0B' : rank === 2 ? '#9CA3AF' : '#F97316'}"/>
          </linearGradient>
        </defs>
      </svg>
    `
  }
}

const getProgressGradient = (rank) => {
  if (rank === 1) return 'linear-gradient(90deg, #FBBF24, #F59E0B)'
  if (rank === 2) return 'linear-gradient(90deg, #D1D5DB, #9CA3AF)'
  if (rank === 3) return 'linear-gradient(90deg, #FB923C, #F97316)'
  return 'linear-gradient(90deg, #667eea, #764ba2)'
}
</script>

<style scoped>
.top3-section {
  background: white;
  padding: 40px;
  border-radius: 20px;
  margin-bottom: 48px;
  border: 1px solid #E8E8E8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

@media (max-width: 768px) {
  .top3-section {
    padding: 24px;
  }
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #0A0A0A;
  margin-bottom: 32px;
  letter-spacing: -0.02em;
}

.top3-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .top3-grid {
    grid-template-columns: 1fr;
  }
}

.top-card {
  background: #FAFAFA;
  border-radius: 16px;
  padding: 32px 28px;
  text-align: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 2px solid transparent;
  cursor: pointer;
}

.top-card.first {
  background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
  border-color: #F59E0B;
}

.top-card.second {
  background: linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%);
  border-color: #9CA3AF;
}

.top-card.third {
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
  border-color: #F97316;
}

.top-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
}

.top-rank-badge {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.rank-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 15px;
  font-weight: 700;
  color: white;
}

.top-product-image {
  margin-bottom: 20px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.top-product-name {
  font-size: 18px;
  font-weight: 700;
  color: #0A0A0A;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.top-product-brand {
  font-size: 14px;
  color: #737373;
  margin-bottom: 16px;
  font-weight: 500;
}

.top-vote-info {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
}

.top-vote-count {
  font-size: 32px;
  font-weight: 700;
  color: #0A0A0A;
  letter-spacing: -0.02em;
}

.top-vote-label {
  font-size: 15px;
  color: #737373;
  font-weight: 500;
}

.top-vote-percent {
  font-size: 15px;
  color: #10B981;
  font-weight: 600;
}

.vote-progress {
  height: 6px;
  background: #F2F2F2;
  border-radius: 3px;
  overflow: hidden;
}

.vote-progress-fill {
  height: 100%;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>