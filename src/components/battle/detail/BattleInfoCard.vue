<template>
  <section class="hero-section">
    <!-- Navigation Bar -->
    <div class="nav-bar">
      <button @click="$emit('back')" class="nav-btn back-btn">
        <span class="icon">←</span>
        <span class="label">목록</span>
      </button>
      <button @click="$emit('share')" class="nav-btn share-btn">
        <span class="icon">↗</span>
      </button>
    </div>

    <div class="category-pill">{{ categoryName }}</div>
    <span v-if="isWeightedVote" class="weighted-pill">순위 투표</span>

    <h1 class="main-title">{{ battle.title }}</h1>
    <p v-if="battle.description" class="sub-desc">{{ battle.description }}</p>

    <div class="stats-row">
      <div class="stat-card">
        <span class="val">{{ formattedDaysLeft }}</span>
        <span class="lab">남은 시간</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-card">
        <span class="val">{{ formattedParticipants }}</span>
        <span class="lab">참여</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-card">
        <span class="val">{{ formattedVotes }}</span>
        <span class="lab">총 투표</span>
      </div>
    </div>

    <!-- Add Product Button -->
    <button
        v-if="canUserAddItem && !hasVoted"
        @click="$emit('add-product')"
        class="add-product-btn"
    >
      <span class="icon">+</span>
      내가 아는 좋은 제품 추가하기
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { battleUtils } from '@/services/BattleService.js'

const props = defineProps({
  battle: {
    type: Object,
    required: true
  },
  isWeightedVote: {
    type: Boolean,
    required: true
  },
  canUserAddItem: {
    type: Boolean,
    required: true
  },
  hasVoted: {
    type: Boolean,
    required: true
  }
})

defineEmits(['add-product', 'back', 'share'])

const categoryName = computed(() => {
  return props.battle.subCategoryDetail?.subCategoryName || '카테고리'
})

const formattedDaysLeft = computed(() => {
  return battleUtils.formatDaysLeft(props.battle.endDate)
})

const formattedParticipants = computed(() => {
  return battleUtils.formatCount(props.battle.totalParticipants)
})

const formattedVotes = computed(() => {
  return battleUtils.formatCount(props.battle.totalVotes)
})
</script>

<style scoped>
.hero-section {
  text-align: center;
  padding: 20px 20px 40px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

/* Navigation Bar */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.nav-btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  font-family: inherit;
  color: #666;
}

.back-btn {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
}

.back-btn .icon {
  font-size: 16px;
}

.share-btn {
  width: 40px;
  height: 40px;
  justify-content: center;
  padding: 0;
}

.share-btn .icon {
  font-size: 18px;
}

.nav-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #333;
}

.category-pill {
  display: inline-block;
  padding: 6px 14px;
  background: #f0f4ff;
  color: #4a6cf7;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
}

.weighted-pill {
  display: inline-block;
  padding: 6px 14px;
  background: #fff3e0;
  color: #f57c00;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  margin-left: 8px;
}

.main-title {
  font-size: 32px;
  font-weight: 800;
  margin: 20px 0 12px;
  letter-spacing: -0.5px;
  color: #111;
  line-height: 1.3;
}

.sub-desc {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.stats-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin-top: 32px;
}

.stat-card {
  text-align: center;
}

.stat-card .val {
  font-size: 24px;
  font-weight: 800;
  display: block;
  color: #111;
}

.stat-card .lab {
  font-size: 13px;
  color: #888;
  margin-top: 4px;
  display: block;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e5e5e5;
}

.add-product-btn {
  margin-top: 32px;
  padding: 14px 28px;
  background: #fff;
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  font-family: inherit;
}

.add-product-btn:hover {
  border-color: #4a6cf7;
  color: #4a6cf7;
  background: #f8faff;
}

.add-product-btn .icon {
  font-size: 18px;
  font-weight: 400;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 16px 32px;
  }

  .main-title {
    font-size: 24px;
  }

  .stats-row {
    gap: 20px;
  }

  .stat-card .val {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .stats-row {
    flex-wrap: wrap;
    gap: 16px;
  }

  .stat-divider {
    display: none;
  }

  .stat-card {
    min-width: 80px;
  }
}
</style>
