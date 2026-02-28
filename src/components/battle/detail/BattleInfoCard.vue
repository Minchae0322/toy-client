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

    <!-- 참여 권한 안내 -->
    <div v-if="permissionType" class="permission-info">
      <span class="permission-badge">
        <svg class="permission-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        {{ permissionType.title }}
      </span>
      <div class="tooltip-wrapper">
        <button class="help-btn" type="button" aria-label="참여 권한 설명">?</button>
        <div class="tooltip">{{ permissionType.description }}</div>
      </div>
    </div>

    <button
        v-if="canUserAddItem"
        @click="$emit('add-product')"
        class="add-product-btn"
    >
      <div class="plus-circle">+</div>
      <span>나도 참여하기</span>
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

const permissionType = computed(() => {
  return props.battle.itemAddPermissionType || null
})
</script>

<style scoped>
/* 전체 레이아웃 */
.hero-section {
  text-align: center;
  padding: 48px 40px 56px;
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  font-family: 'SUIT', -apple-system, "system-ui", "Segoe UI", sans-serif;
}

.main-title,
.sub-desc,
.badge-wrapper,
.stats-dashboard,
.add-product-btn {
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
}

.nav-bar {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

/* 네비게이션 */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
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
  font-size: 38px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.03em;
  margin: 0 auto 12px;
  line-height: 1.3;
}

.sub-desc {
  font-size: 17px;
  color: #6b7280;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto 0;
}

/* 통계 대시보드 */
.stats-dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  margin-top: 36px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  font-size: 26px;
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
  border: 2px solid #f3e8ff;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 700;
  color: #9333ea;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: btn-glow 2.5s ease-in-out infinite;
}

@keyframes btn-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
    border-color: #f3e8ff;
  }
  50% {
    box-shadow: 0 0 20px 3px rgba(147, 51, 234, 0.15);
    border-color: #c084fc;
  }
}

.plus-circle {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #ffffff;
  transition: all 0.2s;
  animation: plus-pulse 2.5s ease-in-out infinite;
}

@keyframes plus-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.add-product-btn:hover {
  border-color: #c084fc;
  background: #faf5ff;
  color: #7c3aed;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(147, 51, 234, 0.12);
  animation: none;
}

.add-product-btn:hover .plus-circle {
  transform: scale(1.1);
  animation: none;
}

/* 참여 권한 안내 */
.permission-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.permission-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  color: #16a34a;
}

.permission-icon {
  width: 16px;
  height: 16px;
}

.tooltip-wrapper {
  position: relative;
  display: inline-flex;
}

.help-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid #d1d5db;
  background: #ffffff;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.help-btn:hover {
  border-color: #9333ea;
  color: #9333ea;
  background: #faf5ff;
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 14px;
  background: #1f2937;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  border-radius: 10px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #1f2937;
}

.tooltip-wrapper:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

/* 반응형 처리 */
@media (max-width: 768px) {
  .hero-section {
    padding: 28px 20px 36px;
  }

  .main-title {
    font-size: 26px;
    letter-spacing: -0.025em;
  }

  .sub-desc {
    font-size: 15px;
  }

  .stats-dashboard {
    margin-top: 28px;
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 20px 14px 28px;
  }

  .nav-bar {
    margin-bottom: 32px;
  }

  .back-btn {
    padding: 8px 14px 8px 10px;
    font-size: 13px;
  }

  .share-btn {
    width: 38px;
    height: 38px;
  }

  .badge-wrapper {
    margin-bottom: 14px;
  }

  .pill {
    padding: 5px 12px;
    font-size: 12px;
  }

  .main-title {
    font-size: 22px;
  }

  .sub-desc {
    font-size: 13px;
  }

  .stats-dashboard {
    padding: 16px;
    border-radius: 16px;
    margin-top: 24px;
  }

  .stat-box .lab {
    font-size: 10px;
  }

  .stat-box .val {
    font-size: 18px;
  }

  .add-product-btn {
    padding: 14px;
    font-size: 13px;
    border-radius: 14px;
    margin-top: 16px;
  }

  .plus-circle {
    width: 24px;
    height: 24px;
    font-size: 18px;
  }

  .permission-info {
    margin-top: 14px;
    position: relative;
  }

  .permission-badge {
    padding: 6px 12px;
    font-size: 11px;
    gap: 5px;
  }

  .permission-icon {
    width: 14px;
    height: 14px;
  }

  .help-btn {
    width: 18px;
    height: 18px;
    font-size: 11px;
  }

  .tooltip-wrapper {
    position: static;
  }

  .tooltip {
    position: absolute;
    font-size: 12px;
    padding: 8px 12px;
    white-space: normal;
    width: max-content;
    max-width: calc(100vw - 40px);
    text-align: center;
    left: 50%;
    right: auto;
    bottom: calc(100% + 8px);
    transform: translateX(-50%);
  }

  .tooltip::after {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
}
</style>