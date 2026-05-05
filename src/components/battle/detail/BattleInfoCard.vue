<template>
  <section class="hero-section">
    <nav class="nav-bar">
      <button @click="$emit('back')" class="nav-btn back-btn" aria-label="목록으로 이동">
        <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        <span class="label">목록</span>
      </button>

      <div class="nav-actions">
        <button @click="$emit('share')" class="nav-btn share-btn" aria-label="공유하기">
          <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
        </button>
        <button v-if="!isCreator" @click="$emit('report')" class="nav-btn report-btn" aria-label="신고하기">
          <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
        </button>
      </div>
    </nav>

    <div v-if="isWeightedVote || showDetails" class="badge-wrapper">
      <span v-if="showDetails" class="pill category-pill">{{ categoryName }}</span>
      <span v-if="isWeightedVote" class="pill weighted-pill">
        <span class="pulse-dot"></span> 순위 투표
      </span>
      <span v-if="permissionType && showDetails" class="pill permission-pill">
        <svg class="permission-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        {{ permissionType.title }}
        <span class="tooltip-wrapper">
          <button class="help-btn" type="button" aria-label="참여 권한 설명">?</button>
          <span class="tooltip">{{ permissionType.description }}</span>
        </span>
      </span>
    </div>

    <h1 class="main-title">{{ battle.title }}</h1>
    <p v-if="battle.description" class="sub-desc" :class="{ clamped: !showDetails }">{{ battle.description }}</p>

    <div v-if="creatorNickname && showDetails" class="creator-row">
      <img
        v-if="creatorProfileImage"
        :src="creatorProfileImage"
        :alt="creatorNickname"
        class="creator-avatar"
      />
      <div v-else class="creator-avatar placeholder">{{ creatorInitial }}</div>
      <span class="creator-label">만든이</span>
      <span class="creator-name">{{ creatorNickname }}</span>
      <UserLevelTag v-if="creatorLevel != null" :level="creatorLevel" size="xs" variant="dark" />
      <UserBadgeInline v-if="primaryBadgeId" :badge-id="primaryBadgeId" size="xs" />
    </div>

    <!-- 접힌 상태: 단일 시간 pill -->
    <div v-if="!showDetails" class="time-pill">
      <span class="time-pill-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <polyline points="12 7 12 12 15 14"/>
        </svg>
      </span>
      <span class="time-pill-label">남은 시간</span>
      <span class="time-pill-value">
        <span class="live-dot" aria-hidden="true"></span>
        {{ formattedDaysLeft }}
      </span>
    </div>

    <!-- 펼친 상태: 3-col stats-dashboard (원래 디자인) -->
    <div v-else class="stats-dashboard">
      <div class="stat-item time">
        <span class="stat-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <polyline points="12 7 12 12 15 14"/>
          </svg>
        </span>
        <span class="stat-text">
          <span class="stat-label">남은 시간</span>
          <span class="stat-value highlight">
            <span class="live-dot" aria-hidden="true"></span>
            {{ formattedDaysLeft }}
          </span>
        </span>
      </div>
      <div class="stat-item people">
        <span class="stat-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/>
            <circle cx="11" cy="7" r="4"/>
          </svg>
        </span>
        <span class="stat-text">
          <span class="stat-label">참여자</span>
          <span class="stat-value">{{ formattedParticipants }}</span>
        </span>
      </div>
      <div class="stat-item votes">
        <span class="stat-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </span>
        <span class="stat-text">
          <span class="stat-label">총 투표수</span>
          <span class="stat-value">{{ formattedVotes }}</span>
        </span>
      </div>
    </div>

    <button
        type="button"
        class="details-toggle"
        :aria-expanded="showDetails"
        @click="showDetails = !showDetails"
    >
      <span>{{ showDetails ? '간단히 보기' : '자세히 보기' }}</span>
      <svg
          class="chevron"
          :class="{ rotated: showDetails }"
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>

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
import { computed, ref } from 'vue'
import { battleUtils } from '@/services/BattleService.js'
import UserLevelTag from '@/components/identity/UserLevelTag.vue'
import UserBadgeInline from '@/components/identity/UserBadgeInline.vue'

const showDetails = ref(false)

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
  isCreator: {
    type: Boolean,
    default: false
  }
})

defineEmits(['add-product', 'back', 'share', 'report'])

const categoryName = computed(() => {
  return props.battle.subCategoryDetail?.subCategoryName || '카테고리'
})

// 만든이 정보 (creatorUserInfo: 닉네임/프로필/뱃지 · userRewardInfo: 레벨/tier)
const creatorNickname = computed(() => props.battle?.creatorUserInfo?.nickname || null)
const creatorProfileImage = computed(() => props.battle?.creatorUserInfo?.profileImageFile?.fileUrl || null)
const creatorInitial = computed(() => (creatorNickname.value || '?').charAt(0).toUpperCase())
const creatorLevel = computed(() => props.battle?.userRewardInfo?.level ?? null)
const primaryBadgeId = computed(() => {
  const u = props.battle?.creatorUserInfo
  return u?.primaryBadgeId || u?.representativeBadgeId || (Array.isArray(u?.badgeIds) ? u.badgeIds[0] : null)
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
  const type = props.battle.itemAddPermissionType
  if (!type) return null
  // CREATOR_ONLY는 생성자 본인에게만 숨김 (자기 설정이라 알 필요 X).
  // 다른 유저에게는 "큐레이션 배틀" 맥락 전달 위해 그대로 노출.
  const code = type.code || type
  if (code === 'CREATOR_ONLY' && props.isCreator) return null
  return type
})
</script>

<style scoped>
/* 전체 레이아웃 */
.hero-section {
  text-align: center;
  padding: 24px 40px 36px;
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  font-family: 'SUIT', -apple-system, "system-ui", "Segoe UI", sans-serif;
}

.main-title,
.sub-desc,
.badge-wrapper,
.stats-dashboard,
.details-toggle,
.add-product-btn {
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
}

/* details-toggle은 inline-flex라 margin:auto가 안 먹음 → 래퍼 없이 가운데 정렬 */
.details-toggle {
  display: flex;
  width: fit-content;
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
  margin-bottom: 22px;
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

.share-btn,
.report-btn {
  width: 44px;
  height: 44px;
}

.nav-actions {
  display: flex;
  gap: 8px;
}

.report-btn:hover { color: #dc2626; border-color: #fecaca; }

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
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
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

.permission-pill {
  background: #f0fdf4;
  color: #16a34a;
  position: relative;
}

.permission-pill .permission-icon {
  width: 14px;
  height: 14px;
}

/* 참여 권한 도움말 (permission-pill 내부) */
.tooltip-wrapper {
  position: relative;
  display: inline-flex;
  margin-left: 2px;
}

.help-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(22, 163, 74, 0.35);
  background: #ffffff;
  color: #16a34a;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
  line-height: 1;
}

.help-btn:hover {
  border-color: #16a34a;
  background: #ecfdf5;
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
  font-size: 46px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.035em;
  margin: 0 auto 10px;
  line-height: 1.18;
}

.sub-desc {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
  max-width: 500px;
  margin: 0 auto 0;
}
.sub-desc.clamped {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.creator-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 12px auto 0;
  padding: 6px 14px 6px 6px;
  background: #F7F8FA;
  border: 1px solid #EEF0F3;
  border-radius: 999px;
}
.creator-row .creator-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #6b7280;
  flex-shrink: 0;
}
.creator-row .creator-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.creator-row .creator-label {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  letter-spacing: -0.1px;
}
.creator-row .creator-name {
  font-size: 13px;
  font-weight: 700;
  color: #18181b;
  letter-spacing: -0.2px;
}

/* 통계 대시보드 — tile cards with accent chips */
.stats-dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  background: transparent;
  border: none;
  padding: 0;
  margin-top: 18px;
  box-shadow: none;
}

/* 접힌 상태: 시간 단독 pill */
.time-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  margin: 18px auto 0;
  padding: 9px 18px 9px 9px;
  background: #f5f8ff;
  border: 1px solid #e0e8ff;
  border-radius: 999px;
}

.time-pill-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e0e8ff;
  color: #4a6cf7;
  flex-shrink: 0;
}

.time-pill-icon svg {
  width: 15px;
  height: 15px;
}

.time-pill-label {
  font-size: 12px;
  font-weight: 600;
  color: #8a92a3;
  letter-spacing: -0.1px;
}

.time-pill-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 800;
  color: #4a6cf7;
  letter-spacing: -0.02em;
  font-feature-settings: 'tnum' 1;
}

.time-pill .live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4a6cf7;
  flex-shrink: 0;
}

/* 자세히 보기 토글 */
.details-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 14px auto 0;
  padding: 7px 16px;
  background: #ffffff;
  border: 1px solid #eef0f3;
  border-radius: 999px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s ease;
}

.details-toggle:hover {
  background: #f7f8fa;
  color: #374151;
  border-color: #d8dde5;
}

.details-toggle .chevron {
  transition: transform 0.2s ease;
}

.details-toggle .chevron.rotated {
  transform: rotate(180deg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: #ffffff;
  border: 1px solid #eceff3;
  border-radius: 16px;
  min-width: 0;
  transition: border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.stat-item:hover {
  border-color: #d8dde5;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
}

.stat-item.time {
  background: #f5f8ff;
  border-color: #e0e8ff;
}

.stat-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  flex-shrink: 0;
}

.stat-item.time .stat-icon-wrap {
  background: #e0e8ff;
  color: #4a6cf7;
}

.stat-item.people .stat-icon-wrap {
  background: #f3e8ff;
  color: #9333ea;
}

.stat-item.votes .stat-icon-wrap {
  background: #ecfdf5;
  color: #10b981;
}

.stat-icon-wrap svg {
  width: 18px;
  height: 18px;
}

.stat-text {
  display: inline-flex;
  flex-direction: column;
  text-align: left;
  gap: 4px;
  min-width: 0;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #8a92a3;
  letter-spacing: -0.1px;
  line-height: 1;
}

.stat-value {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.04em;
  font-feature-settings: 'tnum' 1;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.stat-value.highlight {
  color: #4a6cf7;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4a6cf7;
  box-shadow: 0 0 0 0 rgba(74, 108, 247, 0.5);
  animation: livepulse 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  flex-shrink: 0;
}

@keyframes livepulse {
  0% { box-shadow: 0 0 0 0 rgba(74, 108, 247, 0.45); transform: scale(1); }
  70% { box-shadow: 0 0 0 8px rgba(74, 108, 247, 0); transform: scale(1.05); }
  100% { box-shadow: 0 0 0 0 rgba(74, 108, 247, 0); transform: scale(1); }
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
  background: #9333ea;
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

/* 반응형 처리 */
@media (max-width: 768px) {
  .hero-section {
    padding: 14px 20px 28px;
  }

  .nav-bar {
    margin-bottom: 18px;
  }

  .badge-wrapper {
    margin-bottom: 12px;
  }

  /* 모바일: pulse-dot 애니메이션 제거 — 시선 분산 줄임 */
  .pulse-dot { animation: none; }

  .main-title {
    font-size: 30px;
    letter-spacing: -0.03em;
    margin: 0 auto 10px;
    line-height: 1.22;
  }

  .sub-desc {
    font-size: 14px;
    line-height: 1.5;
  }

  .creator-row {
    margin: 12px auto 0;
    padding: 5px 12px 5px 5px;
  }
  .creator-row .creator-avatar { width: 22px; height: 22px; }
  /* 모바일: "만든이" 라벨 숨김 — 아바타+이름으로 충분 */
  .creator-row .creator-label { display: none; }
  .creator-row .creator-name { font-size: 12px; }

  /* 모바일: stats를 가벼운 인라인 행으로 — 큰 타일 카드 → 단일 슬랩 */
  .stats-dashboard {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0;
    margin-top: 14px;
    padding: 10px 6px;
    background: #f7f8fa;
    border: 1px solid #eef0f3;
    border-radius: 14px;
  }
  .stat-item,
  .stat-item.time {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 4px 6px;
    background: transparent;
    border: none;
    border-radius: 0;
    box-shadow: none;
    position: relative;
    min-width: 0;
  }
  .stat-item:hover {
    transform: none;
    box-shadow: none;
    border: none;
  }
  /* 인라인 stat 사이 얇은 세로 구분선 */
  .stat-item + .stat-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 22px;
    background: #e3e6eb;
  }
  .stat-icon-wrap,
  .stat-item.time .stat-icon-wrap,
  .stat-item.people .stat-icon-wrap,
  .stat-item.votes .stat-icon-wrap {
    width: auto;
    height: auto;
    background: transparent;
    border-radius: 0;
    flex-shrink: 0;
  }
  .stat-icon-wrap svg { width: 15px; height: 15px; }
  .stat-text {
    flex-direction: column;
    align-items: flex-start;
    gap: 1px;
    min-width: 0;
  }
  .stat-label { font-size: 10px; line-height: 1; }
  .stat-value { font-size: 14px; gap: 4px; line-height: 1.1; }
  /* 모바일: live-dot 펄스 애니메이션 제거 — 인라인에서는 과함 */
  .live-dot {
    width: 5px;
    height: 5px;
    animation: none;
    box-shadow: none;
  }

  /* 접힌 상태 시간 pill: 모바일 사이즈 다운 */
  .time-pill {
    margin-top: 14px;
    gap: 8px;
    padding: 7px 14px 7px 7px;
  }
  .time-pill-icon {
    width: 26px;
    height: 26px;
  }
  .time-pill-icon svg {
    width: 13px;
    height: 13px;
  }
  .time-pill-label {
    font-size: 11px;
  }
  .time-pill-value {
    font-size: 14px;
    gap: 5px;
  }
  .time-pill .live-dot {
    width: 5px;
    height: 5px;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 10px 14px 22px;
  }

  .nav-bar {
    margin-bottom: 12px;
  }

  .back-btn {
    padding: 7px 13px 7px 9px;
    font-size: 13px;
  }

  .share-btn {
    width: 36px;
    height: 36px;
  }

  .badge-wrapper {
    margin-bottom: 10px;
    gap: 6px;
  }

  .pill {
    padding: 4px 10px;
    font-size: 11px;
  }

  .main-title {
    font-size: 26px;
    letter-spacing: -0.03em;
    margin: 0 auto 8px;
    line-height: 1.2;
  }

  .sub-desc {
    font-size: 13px;
    line-height: 1.45;
  }

  .creator-row {
    margin: 10px auto 0;
  }

  /* 모바일 작은 화면: stats 더 압축 */
  .stats-dashboard {
    margin-top: 12px;
    padding: 8px 4px;
    border-radius: 12px;
  }
  .stat-item,
  .stat-item.time {
    gap: 6px;
    padding: 3px 4px;
  }
  .stat-icon-wrap svg { width: 13px; height: 13px; }
  .stat-label { font-size: 9px; }
  .stat-value { font-size: 13px; gap: 4px; }
  .stat-item + .stat-item::before { height: 20px; }

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

}

/* 모바일/터치: sticky hover 차단 */
@media (hover: none) {
  .nav-btn:hover,
  .add-product-btn:hover {
    transform: none;
  }
  .add-product-btn:hover .plus-circle {
    transform: none;
  }
}

</style>