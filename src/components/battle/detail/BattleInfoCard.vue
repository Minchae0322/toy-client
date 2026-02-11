<template>
  <section class="hero-section">
    <nav class="nav-bar">
      <button @click="$emit('back')" class="nav-btn back-btn" aria-label="목록으로 이동">
        <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        <span class="label">목록</span>
      </button>

      <button @click="$emit('share')" class="nav-btn share-btn" aria-label="공유하기">
        <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
      </button>
    </nav>

    <div class="badge-wrapper">
      <span class="pill category-pill">{{ categoryName }}</span>
      <span v-if="isWeightedVote" class="pill weighted-pill">
        <span class="pulse-dot"></span> 순위 투표
      </span>
    </div>

    <h1 class="main-title">{{ battle.title }}</h1>
    <p v-if="battle.description" class="sub-desc">{{ battle.description }}</p>

    <div class="stats-dashboard">
      <div class="stat-box">
        <span class="lab">남은 시간</span>
        <span class="val highlight">{{ formattedDaysLeft }}</span>
      </div>
      <div class="stat-box">
        <span class="lab">참여자</span>
        <span class="val">{{ formattedParticipants }}</span>
      </div>
      <div class="stat-box">
        <span class="lab">총 투표수</span>
        <span class="val">{{ formattedVotes }}</span>
      </div>
    </div>

    <button
        v-if="canUserAddItem"
        @click="$emit('add-product')"
        class="add-product-btn"
    >
      <div class="plus-circle">+</div>
      <span>내가 아는 좋은 아이템 추가하기</span>
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
/* 전체 레이아웃 */
.hero-section {
  text-align: center;
  padding: 32px 20px 56px;
  width: 100%;
  box-sizing: border-box;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
}

.main-title,
.sub-desc,
.badge-wrapper {
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
}

/* 네비게이션 */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
}

.nav-btn {
  background: #ffffff;
  border: 1px solid #f1f3f5;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.back-btn {
  padding: 10px 18px 10px 14px;
  font-weight: 600;
  font-size: 14px;
  gap: 6px;
}

.share-btn {
  width: 44px;
  height: 44px;
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  border-color: #e5e7eb;
  color: #111827;
}

/* 배지 */
.badge-wrapper {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.pill {
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.category-pill {
  background: #eff6ff;
  color: #3b82f6;
}

.weighted-pill {
  background: #fff7ed;
  color: #f97316;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background: #f97316;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

/* 타이틀 섹션 */
.main-title {
  font-size: 34px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
  margin: 0 auto 16px;
  line-height: 1.3;
}

.sub-desc {
  font-size: 17px;
  color: #6b7280;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
}

/* 통계 대시보드 */
.stats-dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #f9fafb;
  border-radius: 24px;
  padding: 28px;
  margin-top: 48px;
  border: 1px solid #f3f4f6;
}

.stat-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.stat-box:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 15%;
  height: 70%;
  width: 1px;
  background: #e5e7eb;
}

.stat-box .lab {
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
}

.stat-box .val {
  font-size: 24px;
  font-weight: 800;
  color: #1f2937;
}

.val.highlight {
  color: #4a6cf7;
}

/* 아이템 추가 버튼 */
.add-product-btn {
  width: 100%;
  margin-top: 24px;
  padding: 20px;
  background: #ffffff;
  border: 2px dashed #e5e7eb;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 700;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.plus-circle {
  width: 28px;
  height: 28px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s;
}

.add-product-btn:hover {
  border-color: #4a6cf7;
  background: #f8faff;
  color: #4a6cf7;
  transform: translateY(-2px);
}

.add-product-btn:hover .plus-circle {
  background: #4a6cf7;
  color: #ffffff;
}

/* 반응형 처리 */
@media (max-width: 640px) {
  .hero-section {
    padding: 24px 16px 40px;
  }

  .main-title {
    font-size: 26px;
  }

  .stats-dashboard {
    padding: 20px;
    grid-template-columns: 1fr; /* 모바일에서는 세로로 나열하여 가독성 확보 */
    gap: 20px;
  }

  .stat-box:not(:last-child)::after {
    display: none;
  }
}
</style>