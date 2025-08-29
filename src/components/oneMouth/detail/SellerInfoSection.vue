<template>
  <section class="seller-section" @click="$emit('view-profile')">
    <div class="seller-profile">
      <div class="seller-avatar">
        <img v-if="food.seller.profileImage" :src="food.seller.profileImage" :alt="food.seller.name" />
        <User v-else :size="24" />
      </div>
      <div class="seller-info">
        <h3 class="seller-name">{{ food.seller.name }}</h3>
        <div class="seller-location">
          <MapPin :size="12" />
          <span>{{ food.location || '서울시 강남구' }}</span>
        </div>
      </div>
    </div>
    <div class="seller-stats">
      <div class="trust-score">
        <span class="score-value">{{ food.seller.rating || 4.5 }}</span>
        <span class="score-label">신뢰지수</span>
      </div>
      <ChevronRight :size="20" class="arrow-icon" />
    </div>
  </section>
</template>

<script setup>
import { User, MapPin, ChevronRight } from 'lucide-vue-next';

defineProps({
  food: {
    type: Object,
    required: true
  }
});

defineEmits(['view-profile']);
</script>

<style scoped>
.seller-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 8px solid #F8F9FA;
  cursor: pointer;
  transition: background 0.2s;
}

.seller-section:hover {
  background: #FAFBFC;
}

.seller-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.seller-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #F2F3F7;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #8B95A1;
}

.seller-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.seller-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.seller-name {
  font-size: 15px;
  font-weight: 600;
  color: #191F28;
}

.seller-location {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #8B95A1;
  font-size: 13px;
}

.seller-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trust-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.score-value {
  font-size: 18px;
  font-weight: 700;
  color: #FF6B6B;
}

.score-label {
  font-size: 11px;
  color: #8B95A1;
}

.arrow-icon {
  color: #B0B8C1;
}
</style>