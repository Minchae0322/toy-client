<template>
  <div class="vote-bar-wrapper">
    <div class="vote-bar">
      <div class="bar-content">
        <div class="selection-info">
          <span class="info-label">선택:</span>

          <div v-if="isWeighted" class="rank-selections">
            <div v-for="rank in [1, 2, 3]" :key="rank" class="rank-group">
              <span :class="['rank-label', getRankClass(rank)]">{{ rank }}위</span>
              <span class="product-name">{{ getProductName(rank) }}</span>
            </div>
          </div>

          <span v-else class="simple-product">
            {{ getProductName(1) }}
          </span>
        </div>

        <button @click="$emit('submit-vote')" class="submit-btn">
          투표 완료하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedRanks: {
    type: Object,
    required: true
  },
  isWeighted: {
    type: Boolean,
    required: true
  },
  products: {
    type: Array,
    required: true
  }
})

defineEmits(['submit-vote'])

const getRankClass = (rank) => {
  const classes = {
    1: 'rank-1',
    2: 'rank-2',
    3: 'rank-3'
  }
  return classes[rank]
}

const getProductName = (rank) => {
  const productId = props.selectedRanks[rank]
  const product = props.products.find(p => p.id === productId)
  return product ? product.name : '미선택'
}
</script>

<style scoped>
.vote-bar-wrapper {
  position: sticky;
  top: 56px;
  max-width: 1400px;
  margin: 0 auto 24px;
  padding: 0 24px;
  z-index: 40;
}

.vote-bar {
  background: white;
  border: 1px solid #BFDBFE;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.info-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.rank-selections {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rank-label {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
}

.rank-label.rank-1 {
  background: #FEF3C7;
  color: #92400E;
}

.rank-label.rank-2 {
  background: #F3F4F6;
  color: #374151;
}

.rank-label.rank-3 {
  background: #FFEDD5;
  color: #9A3412;
}

.product-name,
.simple-product {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.submit-btn {
  padding: 10px 24px;
  background: #2563EB;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-family: inherit;
  white-space: nowrap;
}

.submit-btn:hover {
  background: #1D4ED8;
}

@media (max-width: 768px) {
  .vote-bar-wrapper {
    padding: 0 16px;
  }

  .bar-content {
    flex-direction: column;
    gap: 12px;
  }

  .submit-btn {
    width: 100%;
  }
}
</style>