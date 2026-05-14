<template>
  <div class="products-grid">
    <div
        v-for="product in products"
        :key="product.id"
        class="product-card"
        @click="$emit('view-product', product.id)"
    >
      <div class="product-image">
        <img
            v-if="getThumbnailUrl(product)"
            :src="getThumbnailUrl(product)"
            :alt="product.name"
            @error="handleImageError"
        >
        <div v-else class="product-placeholder">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M16 18.6667H48M16 18.6667V50.6667C16 52.1394 17.1939 53.3333 18.6667 53.3333H45.3333C46.8061 53.3333 48 52.1394 48 50.6667V18.6667M16 18.6667L21.3333 10.6667H42.6667L48 18.6667M26.6667 32V40M37.3333 32V40" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="product-badge">
          {{ getProductBadge(product.productType) }}
        </div>
        <button
            class="heart-btn"
            @click.stop="$emit('like', product.id)"
            :class="{ liked: likedProducts.has(product.id) }"
        >
          <svg v-if="likedProducts.has(product.id)" width="20" height="20" viewBox="0 0 20 20" fill="#EF4444">
            <path d="M17.3667 5.38333C17.152 4.88227 16.8354 4.4299 16.4375 4.05417C16.0409 3.67615 15.5729 3.38083 15.0625 3.18542C14.5341 2.98333 13.9714 2.87917 13.4042 2.87917C12.6084 2.87917 11.8313 3.08542 11.1459 3.47708C10.9792 3.56875 10.8209 3.66875 10.6709 3.77708C10.5209 3.66875 10.3625 3.56875 10.1959 3.47708C9.51045 3.08542 8.73337 2.87917 7.9375 2.87917C7.36254 2.87917 6.80837 2.98333 6.28004 3.18542C5.76671 3.38125 5.30421 3.67292 4.90421 4.05417C4.50559 4.42936 4.18876 4.88181 3.97421 5.38333C3.75248 5.90311 3.63931 6.46056 3.64171 7.02292C3.64171 7.56458 3.74587 8.12708 3.95421 8.69792C4.12921 9.18125 4.38337 9.67708 4.70837 10.1729C5.45837 11.3021 6.5375 12.4521 7.97087 13.7271C9.25421 14.8729 10.5209 15.7896 10.575 15.8313L11.2959 16.2896C11.6375 16.5271 12.1 16.5271 12.4417 16.2896L13.1625 15.8313C13.2167 15.7854 14.4792 14.8729 15.7667 13.7271C17.2 12.4521 18.2792 11.3021 19.0292 10.1729C19.3542 9.67708 19.6125 9.18125 19.7834 8.69792C19.9917 8.12708 20.0959 7.56458 20.0959 7.02292C20.1 6.45833 19.9917 5.90208 19.3667 5.38333Z" fill="#EF4444"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M17.3667 5.38333C17.152 4.88227 16.8354 4.4299 16.4375 4.05417C16.0409 3.67615 15.5729 3.38083 15.0625 3.18542C14.5341 2.98333 13.9714 2.87917 13.4042 2.87917C12.6084 2.87917 11.8313 3.08542 11.1459 3.47708C10.9792 3.56875 10.8209 3.66875 10.6709 3.77708C10.5209 3.66875 10.3625 3.56875 10.1959 3.47708C9.51045 3.08542 8.73337 2.87917 7.9375 2.87917C7.36254 2.87917 6.80837 2.98333 6.28004 3.18542C5.76671 3.38125 5.30421 3.67292 4.90421 4.05417C4.50559 4.42936 4.18876 4.88181 3.97421 5.38333C3.75248 5.90311 3.63931 6.46056 3.64171 7.02292C3.64171 7.56458 3.74587 8.12708 3.95421 8.69792C4.12921 9.18125 4.38337 9.67708 4.70837 10.1729C5.45837 11.3021 6.5375 12.4521 7.97087 13.7271C9.25421 14.8729 10.5209 15.7896 10.575 15.8313L11.2959 16.2896C11.6375 16.5271 12.1 16.5271 12.4417 16.2896L13.1625 15.8313C13.2167 15.7854 14.4792 14.8729 15.7667 13.7271C17.2 12.4521 18.2792 11.3021 19.0292 10.1729C19.3542 9.67708 19.6125 9.18125 19.7834 8.69792C19.9917 8.12708 20.0959 7.56458 20.0959 7.02292C20.1 6.45833 19.9917 5.90208 17.3667 5.38333Z" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="product-info">
        <div class="product-name">{{ product.name }}</div>
        <div class="product-brand">{{ product.brand }}</div>
        <div v-if="product.price" class="product-price">{{ formatPrice(product.price) }}</div>
        <div class="product-stats">
          <span class="stat">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.16666L8.795 4.81249L12.8333 5.40166L9.91667 8.24916L10.59 12.2717L7 10.3792L3.41 12.2717L4.08333 8.24916L1.16667 5.40166L5.205 4.81249L7 1.16666Z" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ formatRating(product.averageRating) }}
          </span>
          <span class="stat">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M12.25 9.33333C12.25 9.55435 12.1622 9.76631 12.0059 9.92259C11.8496 10.0789 11.6377 10.1667 11.4167 10.1667H4.08333L1.75 12.5V2.91667C1.75 2.69565 1.83781 2.48369 1.99409 2.32741C2.15036 2.17113 2.36232 2.08333 2.58333 2.08333H11.4167C11.6377 2.08333 11.8496 2.17113 12.0059 2.32741C12.1622 2.48369 12.25 2.69565 12.25 2.91667V9.33333Z" stroke="#9CA3AF" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ formatCount(product.reviewCount) }}
          </span>
        </div>
        <div class="distance">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 6.5C6.82843 6.5 7.5 5.82843 7.5 5C7.5 4.17157 6.82843 3.5 6 3.5C5.17157 3.5 4.5 4.17157 4.5 5C4.5 5.82843 5.17157 6.5 6 6.5Z" stroke="#6B7280" stroke-width="1.2"/>
            <path d="M9.535 8.535C8.455 9.89 7.07 10.5 6 10.5C4.93 10.5 3.545 9.89 2.465 8.535C1.385 7.18 1.385 5.32 2.465 3.965C3.545 2.61 4.93 2 6 2C7.07 2 8.455 2.61 9.535 3.965C10.615 5.32 10.615 7.18 9.535 8.535Z" stroke="#6B7280" stroke-width="1.2"/>
          </svg>
          {{ getRandomDistance() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { productUtils } from '@/services/ProductService.js'

const props = defineProps({
  products: {
    type: Array,
    required: true
  },
  likedProducts: {
    type: Set,
    required: true
  }
})

const emit = defineEmits(['like', 'view-product'])

const getThumbnailUrl = (product) => {
  if (product.thumbnailDto?.fileUrl) return product.thumbnailDto.fileUrl
  if (product.thumbnailUrl) return product.thumbnailUrl
  if (product.attachments && product.attachments.length > 0) return product.attachments[0].fileUrl
  return null
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const formatRating = (rating) => {
  if (!rating) return '0.0'
  return typeof rating === 'number' ? rating.toFixed(1) : rating
}

const formatCount = (count) => {
  if (!count) return '0'
  return productUtils.formatCount(count)
}

const formatPrice = (price) => {
  if (!price && price !== 0) return ''
  const s = String(price).replace(/,/g, '').trim()
  if (s === '0') return '무료'
  const rangeMatch = s.match(/^(\d+)\s*~\s*(\d+)$/)
  if (rangeMatch) {
    return Number(rangeMatch[1]).toLocaleString() + ' ~ ' + Number(rangeMatch[2]).toLocaleString() + '원'
  }
  const num = Number(s)
  if (isNaN(num)) return ''
  return num.toLocaleString() + '원'
}

const getProductBadge = (productType) => {
  const badgeMap = {
    'SALE': '판매',
    'AUCTION': '경매',
    'FREE': '무료',
    'EXCHANGE': '교환'
  }
  return badgeMap[productType] || '판매'
}

const getRandomDistance = () => {
  const distances = ['100m', '200m', '300m', '500m', '750m', '1km', '1.5km']
  return distances[Math.floor(Math.random() * distances.length)]
}
</script>

<style scoped>
.products-grid {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-top: none;
  border-radius: 0 0 12px 12px;
}

.product-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
}

.product-card:hover {
  border-color: var(--border-strong);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.product-image {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: var(--bg-subtle);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--c-success) 0%, #047857 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.heart-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 36px;
  height: 36px;
  background: var(--header-blur-bg);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.heart-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.heart-btn.liked {
  animation: heartbeat 0.3s ease;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.01em;
  min-height: 45px;
}

.product-brand {
  font-size: 13px;
  color: var(--c-text-400);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--c-success);
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.product-stats {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}

.stat {
  font-size: 13px;
  color: var(--c-text-500);
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.distance {
  font-size: 13px;
  color: var(--c-text-500);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .product-image {
    height: 180px;
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 16px;
    gap: 12px;
  }

  .product-image {
    height: 160px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-image {
    height: 200px;
  }
}
</style>