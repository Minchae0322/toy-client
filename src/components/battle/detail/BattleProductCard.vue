<template>
  <div class="product-card" @click="$emit('click')">
    <div class="product-image">
      <div class="product-rank">{{ product.rank }}</div>
      <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
      <svg v-else width="56" height="56" viewBox="0 0 24 24" fill="none">
        <path d="M2 18h20l-2-6h-3.5l-1.5-4h-6l-1.5 4H4l-2 6z" fill="#E5E7EB"/>
        <path d="M7 18v3M17 18v3" stroke="#9CA3AF" stroke-width="2"/>
      </svg>
    </div>
    <div class="product-content">
      <div class="product-name">{{ product.name }}</div>
      <div class="product-brand">{{ product.brand }}</div>
      <div class="product-stats">
        <div class="product-votes">
          <span class="vote-count">{{ product.voteCount }}</span>
          <span class="vote-percentage">{{ product.votePercentage.toFixed(1) }}%</span>
        </div>
        <div class="product-actions">
          <div class="action-icon" @click.stop="$emit('toggleLike')">
            <svg width="16" height="16" viewBox="0 0 24 24" :fill="product.isLiked ? '#FF3B30' : 'none'" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
          <div class="action-icon" @click.stop="$emit('openComments')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </div>
        </div>
      </div>
      <div class="vote-progress">
        <div class="vote-progress-fill" :style="{ width: `${product.votePercentage}%` }"></div>
      </div>
      <div class="product-submitter">
        <div class="submitter-avatar">{{ getInitials(product.submitterName) }}</div>
        <div class="submitter-name">@{{ product.submitterUsername }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'toggleLike', 'openComments'])

const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '?'
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #E8E8E8;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
  border-color: #D4D4D4;
}

.product-rank {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 36px;
  height: 36px;
  background: #0A0A0A;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.product-image {
  position: relative;
  height: 220px;
  background: #FAFAFA;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-content {
  padding: 20px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #0A0A0A;
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

.product-brand {
  font-size: 14px;
  color: #A3A3A3;
  margin-bottom: 16px;
  font-weight: 500;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-top: 1px solid #F2F2F2;
}

.product-votes {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vote-count {
  font-size: 22px;
  font-weight: 700;
  color: #0A0A0A;
  letter-spacing: -0.01em;
}

.vote-percentage {
  font-size: 14px;
  color: #10B981;
  font-weight: 600;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.action-icon {
  width: 34px;
  height: 34px;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  color: #A3A3A3;
}

.action-icon:hover {
  border-color: #A3A3A3;
  background: #FAFAFA;
  transform: scale(1.05);
  color: #0A0A0A;
}

.product-submitter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #F2F2F2;
}

.submitter-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #E8E8E8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #525252;
}

.submitter-name {
  font-size: 13px;
  color: #737373;
  font-weight: 500;
}

.vote-progress {
  margin-top: 12px;
  height: 6px;
  background: #F2F2F2;
  border-radius: 3px;
  overflow: hidden;
}

.vote-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>