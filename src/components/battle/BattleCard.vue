<template>
  <router-link
      v-if="battle && battle.title"
      :to="{ name: 'BattleDetail', params: { id: battle.id || battle.battleId } }"
      class="battle-card"
  >
    <!-- 썸네일 영역 -->
    <div class="card-thumbnail">
      <img
          v-if="thumbnailUrl && !imageError"
          :src="thumbnailUrl"
          :alt="battle.title"
          class="thumbnail-image"
          @error="handleImageError"
          loading="lazy"
      >
      <div v-else class="thumbnail-placeholder">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </div>

      <!-- 상태 배지 -->
      <div class="badges-top">
        <span class="status-badge" :class="statusClass">{{ statusText }}</span>
        <span v-if="isNew" class="new-badge" aria-label="새 배틀">NEW</span>
        <span v-if="battle.voteType === 'MULTIPLE'" class="vote-type-badge">순위</span>
      </div>

      <!-- D-Day -->
      <span v-if="showDeadline" class="dday-badge" :class="ddayClass">
        {{ dDayText }}
      </span>
    </div>

    <!-- 컨텐츠 영역 -->
    <div class="card-content">
      <p class="category">{{ categoryName }}</p>
      <h3 class="title">{{ battle.title }}</h3>

      <div class="stats">
        <span class="stat">
          <strong class="stat-num">{{ formatNumber(battle.totalVotes) }}</strong>
          <span class="stat-label">투표</span>
        </span>
        <span class="stat-dot">·</span>
        <span class="stat">
          <strong class="stat-num">{{ formatNumber(battle.totalViews || 0) }}</strong>
          <span class="stat-label">조회</span>
        </span>
        <span v-if="isActive && daysLeftText" class="days-left">{{ daysLeftText }}</span>
      </div>

      <div v-if="!hideCreator" class="card-footer">
        <div class="creator">
          <div v-if="creatorProfileImage" class="creator-avatar">
            <img :src="creatorProfileImage" :alt="creatorNickname" @error="handleAvatarError">
          </div>
          <div v-else class="creator-avatar placeholder"></div>
          <span class="creator-name">{{ creatorNickname }}</span>
          <UserLevelTag v-if="creatorLevel != null" :level="creatorLevel" size="xs" variant="dark" />
          <UserBadgeInline v-if="primaryBadgeId" :badge-id="primaryBadgeId" size="xs" />
        </div>
        <span class="action-hint">
          참여하기
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed, ref } from 'vue'
import UserLevelTag from '@/components/identity/UserLevelTag.vue'
import UserBadgeInline from '@/components/identity/UserBadgeInline.vue'

const props = defineProps({
  battle: {
    type: Object,
    required: true,
    default: () => ({})
  },
  hideCreator: {
    type: Boolean,
    default: false
  }
})

const imageError = ref(false)
const avatarError = ref(false)

// 생성 후 3일 이내인 배틀에 NEW 뱃지
const isNew = computed(() => {
  const created = props.battle?.createdAt
  if (!created) return false
  const ms = Date.now() - new Date(created).getTime()
  return ms >= 0 && ms < 3 * 24 * 60 * 60 * 1000
})

const handleImageError = () => imageError.value = true
const handleAvatarError = () => avatarError.value = true

const formatNumber = (num) => {
  if (!num || num === 0) return '0'
  if (num >= 10000) return `${Math.floor(num / 10000)}만`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const thumbnailUrl = computed(() => {
  if (imageError.value) return null
  return props.battle?.thumbnailDto?.fileUrl
      || props.battle?.thumbnailFile?.fileUrl
      || props.battle?.topItemImages?.[0]
      || null
})

const creatorProfileImage = computed(() => {
  if (avatarError.value) return null
  return props.battle?.creatorUserInfo?.profileImageFile?.fileUrl || null
})

const categoryName = computed(() => {
  return props.battle?.subCategoryDetail?.subCategoryName
      || props.battle?.categoryName
      || '기타'
})

// endDate 기준으로 진행 여부를 판단하는 헬퍼 함수
const isActiveByEndDate = computed(() => {
  if (!props.battle?.endDate) return true
  return new Date(props.battle.endDate) > new Date()
})

const statusText = computed(() => {
  const status = props.battle?.status?.title || props.battle?.status

  // status가 NORMAL인 경우 endDate로 판단
  if (status === 'NORMAL') {
    return isActiveByEndDate.value ? '진행중' : '종료됨'
  }

  // isActive 필드를 우선 사용하고, 없으면 기존 status로 폴백
  if (props.battle?.isActive !== undefined) {
    return props.battle.isActive ? '진행중' : '종료'
  }

  const map = { ACTIVE: '진행중', SCHEDULED: '예정', CLOSED: '종료', ENDED: '종료', EARLY_CLOSED: '조기종료', SUSPENDED: '중단됨' }
  return map[status] || '대기'
})

const statusClass = computed(() => {
  const status = props.battle?.status?.title || props.battle?.status

  // status가 NORMAL인 경우 endDate로 판단
  if (status === 'NORMAL') {
    return isActiveByEndDate.value ? 'active' : 'ended'
  }

  // isActive 필드를 우선 사용하고, 없으면 기존 status로 폴백
  if (props.battle?.isActive !== undefined) {
    return props.battle.isActive ? 'active' : 'ended'
  }

  const map = { ACTIVE: 'active', SCHEDULED: 'scheduled', CLOSED: 'ended', ENDED: 'ended', EARLY_CLOSED: 'ended', SUSPENDED: 'suspended' }
  return map[status] || 'draft'
})

const itemCount = computed(() => {
  return props.battle?.items?.length
      || props.battle?.options?.length
      || props.battle?.itemCount
      || 0
})

const creatorNickname = computed(() => {
  return props.battle?.creatorUserInfo?.nickname
      || props.battle?.createdBy?.nickname
      || '알 수 없음'
})

// userRewardInfo (레벨/tier) · creatorUserInfo (뱃지)
const creatorLevel = computed(() => props.battle?.userRewardInfo?.level ?? null)
const primaryBadgeId = computed(() => {
  const u = props.battle?.creatorUserInfo
  return u?.primaryBadgeId || u?.representativeBadgeId || (Array.isArray(u?.badgeIds) ? u.badgeIds[0] : null)
})

const dDay = computed(() => {
  if (!props.battle?.endDate) return null
  const diff = new Date(props.battle.endDate) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const dDayText = computed(() => {
  const status = props.battle?.status?.title || props.battle?.status

  // status가 NORMAL인 경우 endDate로 판단
  if (status === 'NORMAL') {
    const days = dDay.value
    if (days === null) return ''
    if (days < 0) return '종료'
    if (days === 0) return '오늘 마감'
    return `D-${days}`
  }

  // isActive 필드를 우선 사용하고, 없으면 기존 status로 폴백
  if (props.battle?.isActive !== undefined) {
    if (!props.battle.isActive) return '종료'
  } else {
    if (status === 'CLOSED' || status === 'ENDED') return '종료'
  }

  const days = dDay.value
  if (days === null) return ''
  if (days < 0) return '종료'
  if (days === 0) return '오늘 마감'
  return `D-${days}`
})

const showDeadline = computed(() => {
  const status = props.battle?.status?.title || props.battle?.status

  // status가 NORMAL인 경우 endDate가 있으면 항상 D-day 배지 표시
  if (status === 'NORMAL') {
    return dDay.value !== null
  }

  // isActive 필드를 우선 사용하고, 없으면 기존 status로 폴백
  if (props.battle?.isActive !== undefined) {
    return props.battle.isActive && dDay.value !== null
  }

  return status === 'ACTIVE' && dDay.value !== null
})

const ddayClass = computed(() => {
  const days = dDay.value
  if (days === null) return ''
  if (days <= 3) return 'urgent'
  return 'normal'
})

const isActive = computed(() => {
  const status = props.battle?.status?.title || props.battle?.status

  // status가 NORMAL인 경우 endDate로 판단
  if (status === 'NORMAL') {
    return isActiveByEndDate.value
  }

  if (props.battle?.isActive !== undefined) {
    return props.battle.isActive
  }

  return status === 'ACTIVE'
})

const daysLeftText = computed(() => {
  const days = dDay.value
  if (days === null || days < 0) return ''
  if (days === 0) return '오늘 마감'
  if (days === 1) return '1일 남음'
  return `${days}일 남음`
})
</script>

<style scoped>
.battle-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #F2F4F6;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
}

.battle-card:hover {
  border-color: #E5E8EB;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

/* 썸네일 */
.card-thumbnail {
  position: relative;
  aspect-ratio: 16 / 10;
  background: #F7F8FA;
  overflow: hidden;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #B0B8C1;
}

/* 배지 */
.badges-top {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
}

.status-badge {
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
}

.status-badge.active {
  background: #10b981;
  color: #fff;
}

.status-badge.scheduled {
  background: #f59e0b;
  color: #fff;
}

.status-badge.ended {
  background: #8B95A1;
  color: #fff;
}

.status-badge.suspended {
  background: #ef4444;
  color: #fff;
}

.status-badge.draft {
  background: #E5E8EB;
  color: #8B95A1;
}

.new-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: #FFFFFF;
  color: #DC2626;
  font-size: 10px;
  font-weight: 800;
  font-family: inherit;
  letter-spacing: 0.5px;
  line-height: 1;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.vote-type-badge {
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
  background: #f3e8ff;
  color: #9333EA;
}

.dday-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
}

.dday-badge.normal {
  background: rgba(255, 255, 255, 0.95);
  color: #4E5968;
}

.dday-badge.urgent {
  background: #ef4444;
  color: #fff;
}

/* 컨텐츠 */
.card-content {
  padding: 16px;
}

.category {
  font-size: 12px;
  color: #8B95A1;
  margin: 0 0 4px;
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: #191F28;
  line-height: 1.5;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.02em;
  min-height: calc(1.5em * 2);
}

.stats {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
  color: #8B95A1;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.stats .stat {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
}

.stats .stat-num {
  font-size: 12.5px;
  font-weight: 600;
  color: #6B7684;
  letter-spacing: -0.02em;
}

.stats .stat-label {
  font-weight: 400;
  color: #8B95A1;
}

.stats .stat-dot {
  color: #E5E8EB;
  font-weight: 600;
}

.stats .days-left {
  margin-left: auto;
  font-size: 12px;
  color: #9333EA;
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* 푸터 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #F2F4F6;
}

.creator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.creator-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  background: #E5E8EB;
}

.creator-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.creator-name {
  font-size: 12px;
  color: #8B95A1;
}

.action-hint {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 500;
  color: #9333EA;
  opacity: 0;
  transition: opacity 0.2s;
}

.arrow-icon {
  width: 14px;
  height: 14px;
}

.battle-card:hover .action-hint {
  opacity: 1;
}

/* 모바일 */
@media (max-width: 768px) {
  .battle-card {
    border-radius: 12px;
  }

  .card-thumbnail {
    aspect-ratio: 4 / 3;
  }

  .badges-top {
    top: 6px;
    left: 6px;
    gap: 3px;
  }

  .status-badge {
    padding: 2px 5px;
    font-size: 9px;
  }

  .vote-type-badge {
    padding: 2px 5px;
    font-size: 9px;
  }

  .dday-badge {
    top: 6px;
    right: 6px;
    padding: 2px 5px;
    font-size: 9px;
  }

  .card-content {
    padding: 10px;
  }

  .category {
    font-size: 10px;
    margin-bottom: 2px;
  }

  .title {
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 6px;
    -webkit-line-clamp: 2;
    min-height: calc(1.4em * 2);
  }

  .stats {
    gap: 6px;
    font-size: 11px;
    flex-wrap: nowrap;
    overflow: hidden;
  }

  .stats .stat,
  .stats .stat-dot,
  .stats .days-left {
    white-space: nowrap;
  }

  .stats .stat-num {
    font-size: 11.5px;
  }

  .card-footer {
    margin-top: 8px;
    padding-top: 8px;
  }

  .creator-avatar {
    width: 16px;
    height: 16px;
  }

  .creator-name {
    font-size: 10px;
    max-width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .action-hint {
    display: none;
  }
}

/* 큰 화면 */
@media (min-width: 1280px) {
  .battle-card {
    border-radius: 18px;
  }

  .badges-top {
    top: 9px;
    left: 9px;
    gap: 5px;
  }

  .status-badge {
    font-size: 12px;
    padding: 4px 9px;
  }

  .dday-badge {
    top: 9px;
    right: 9px;
    font-size: 11px;
  }

  .card-content {
    padding: 18px;
  }

  .category {
    font-size: 13px;
  }

  .title {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .stats {
    gap: 10px;
    font-size: 13px;
  }

  .stats .stat-num {
    font-size: 13.5px;
  }

  .card-footer {
    margin-top: 12px;
    padding-top: 12px;
  }

  .creator-avatar {
    width: 24px;
    height: 24px;
  }

  .creator-name {
    font-size: 13px;
  }

  .action-hint {
    font-size: 13px;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .battle-card,
  .action-hint {
    transition: none;
  }
}
</style>