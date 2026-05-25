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

      <!-- 상태 배지 (glass pill) -->
      <div class="badges-top">
        <span class="status-badge" :class="statusClass">
          <span class="status-dot" aria-hidden="true"></span>
          <span class="status-text">{{ statusText }}</span>
        </span>
        <span v-if="battle.voteType === 'MULTIPLE'" class="vote-type-badge">
          <ListOrdered :size="11" :stroke-width="2.6" />
          <span>순위</span>
        </span>
        <span v-if="isNew" class="new-badge" aria-label="새 배틀">NEW</span>
      </div>

      <!-- D-Day -->
      <span v-if="showDeadline" class="dday-badge" :class="ddayClass">
        <Flame v-if="ddayClass === 'urgent'" :size="11" :stroke-width="2.6" />
        <span>{{ dDayText }}</span>
      </span>
    </div>

    <!-- 컨텐츠 영역 -->
    <div class="card-content">
      <span class="category-chip">{{ categoryName }}</span>
      <h3 class="title">{{ battle.title }}</h3>

      <div class="stats">
        <span class="stat">
          <Users :size="12" :stroke-width="2.4" class="stat-icon" />
          <strong class="stat-num">{{ formatNumber(battle.totalVotes) }}</strong>
          <span class="stat-label">투표</span>
        </span>
        <span class="stat-divider" aria-hidden="true"></span>
        <span class="stat">
          <Eye :size="12" :stroke-width="2.4" class="stat-icon" />
          <strong class="stat-num">{{ formatNumber(battle.totalViews || 0) }}</strong>
          <span class="stat-label">조회</span>
        </span>
        <span v-if="isActive && daysLeftText" class="days-left">{{ daysLeftText }}</span>
      </div>

      <div v-if="!hideCreator" class="card-footer">
        <div
            class="creator"
            :class="{ 'is-clickable': creatorUserId != null }"
            role="link"
            tabindex="0"
            @click.stop.prevent="goToCreator"
            @keydown.enter.stop.prevent="goToCreator"
            @keydown.space.stop.prevent="goToCreator"
        >
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
import { useRouter } from 'vue-router'
import { Eye, Users, Flame, ListOrdered } from 'lucide-vue-next'
import UserLevelTag from '@/components/identity/UserLevelTag.vue'
import UserBadgeInline from '@/components/identity/UserBadgeInline.vue'

const router = useRouter()

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

const creatorUserId = computed(() => props.battle?.creatorUserInfo?.userId ?? props.battle?.creatorId ?? null)

const goToCreator = () => {
  const userId = creatorUserId.value
  if (userId == null) return
  router.push({ name: 'UserFeedList', params: { userId: String(userId) } })
}

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
  const days = dDay.value
  if (days === null) return false
  // 마감 임박(7일 이하)인 진행중 배틀에만 D-day 배지 노출
  if (days < 0 || days > 7) return false

  const status = props.battle?.status?.title || props.battle?.status

  if (status === 'NORMAL') {
    return isActiveByEndDate.value
  }

  if (props.battle?.isActive !== undefined) {
    return props.battle.isActive
  }

  return status === 'ACTIVE'
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
  position: relative;
  background: var(--bg-elevated);
  border-radius: 16px;
  border: 1px solid var(--border-default);
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
              border-color 0.22s ease,
              box-shadow 0.22s ease;
  will-change: transform;
}

.battle-card:hover {
  border-color: transparent;
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04);
}

.battle-card:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 2px;
}

/* 썸네일 */
.card-thumbnail {
  position: relative;
  aspect-ratio: 16 / 10;
  background: var(--bg-subtle);
  overflow: hidden;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.battle-card:hover .thumbnail-image {
  transform: scale(1.045);
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-300);
}

/* 배지 — glass pill 톤 */
.badges-top {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 5px;
  align-items: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px 4px 8px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1;
  border-radius: 999px;
  color: #ffffff;
  background: rgba(15, 18, 24, 0.62);
  backdrop-filter: saturate(140%) blur(10px);
  -webkit-backdrop-filter: saturate(140%) blur(10px);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--c-text-300);
  flex-shrink: 0;
}

.status-badge.active .status-dot {
  background: #34d399;
  box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.22);
  animation: status-pulse 1.8s ease-out infinite;
}

.status-badge.scheduled .status-dot {
  background: #fbbf24;
}

.status-badge.ended .status-dot {
  background: rgba(255, 255, 255, 0.55);
}

.status-badge.suspended .status-dot {
  background: #f87171;
}

@keyframes status-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.45); }
  60% { box-shadow: 0 0 0 5px rgba(52, 211, 153, 0); }
}

.new-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 7px;
  border-radius: 999px;
  background: var(--c-danger);
  color: #ffffff;
  font-size: 9.5px;
  font-weight: 800;
  font-family: inherit;
  letter-spacing: 0.5px;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.35);
}

.vote-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3.5px 7px 3.5px 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--c-brand);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
}

.vote-type-badge svg {
  display: block;
}

.dday-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 9px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1;
  border-radius: 999px;
  backdrop-filter: saturate(140%) blur(10px);
  -webkit-backdrop-filter: saturate(140%) blur(10px);
}

.dday-badge.normal {
  background: rgba(15, 18, 24, 0.62);
  color: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.dday-badge.urgent {
  background: var(--c-danger);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.32);
}

.dday-badge svg {
  display: block;
}

/* 컨텐츠 */
.card-content {
  padding: 14px 16px 16px;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 9px;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--c-text-500);
  background: var(--bg-subtle);
  border-radius: 999px;
  line-height: 1;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.35;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.035em;
  min-height: calc(1.35em * 2);
  word-break: keep-all;
  transition: color 0.18s ease;
}

.battle-card:hover .title {
  color: var(--c-brand);
}

.stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--c-text-400);
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.stats .stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.stats .stat-icon {
  color: var(--c-text-400);
  flex-shrink: 0;
}

.stats .stat-num {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--c-text-600);
  letter-spacing: -0.02em;
  line-height: 1;
}

.stats .stat-label {
  font-weight: 500;
  color: var(--c-text-400);
  line-height: 1;
}

.stats .stat-divider {
  width: 1px;
  height: 10px;
  background: var(--border-default);
  flex-shrink: 0;
}

.stats .days-left {
  margin-left: auto;
  font-size: 11.5px;
  color: var(--c-brand);
  font-weight: 700;
  letter-spacing: -0.01em;
  padding: 2px 7px;
  background: var(--c-brand-soft);
  border-radius: 999px;
  line-height: 1;
}

/* 푸터 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-default);
}

.creator {
  display: flex;
  align-items: center;
  gap: 7px;
  border-radius: 6px;
  outline: none;
  min-width: 0;
}

.creator.is-clickable {
  cursor: pointer;
}

.creator.is-clickable:hover .creator-name {
  color: var(--text-primary);
}

.creator.is-clickable:focus-visible {
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.4);
}

.creator-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-subtle);
  box-shadow: inset 0 0 0 1px var(--border-default);
  flex-shrink: 0;
}

.creator-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.creator-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-500);
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100px;
  transition: color 0.18s ease;
}

.action-hint {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 700;
  color: var(--c-text-400);
  letter-spacing: -0.01em;
  transition: color 0.2s ease, transform 0.2s ease;
}

.arrow-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.battle-card:hover .action-hint {
  color: var(--c-brand);
}

.battle-card:hover .arrow-icon {
  transform: translateX(3px);
}

/* 모바일 */
@media (max-width: 768px) {
  .battle-card {
    border-radius: 12px;
  }

  .battle-card:hover {
    transform: none;
  }

  .battle-card:hover .thumbnail-image {
    transform: none;
  }

  .card-thumbnail {
    aspect-ratio: 4 / 3;
  }

  .badges-top {
    top: 7px;
    left: 7px;
    gap: 4px;
  }

  .status-badge {
    padding: 3px 7px 3px 6px;
    font-size: 9.5px;
    gap: 4px;
  }

  .status-dot {
    width: 5px;
    height: 5px;
  }

  .vote-type-badge {
    padding: 3px 6px 3px 5px;
    font-size: 9px;
  }

  .vote-type-badge svg {
    width: 9px;
    height: 9px;
  }

  .new-badge {
    padding: 3px 5px;
    font-size: 8.5px;
  }

  .dday-badge {
    top: 7px;
    right: 7px;
    padding: 3px 7px;
    font-size: 9.5px;
  }

  .dday-badge svg {
    width: 9px;
    height: 9px;
  }

  .card-content {
    padding: 10px 10px 12px;
  }

  .category-chip {
    height: 19px;
    padding: 0 7px;
    font-size: 10px;
    margin-bottom: 6px;
  }

  .title {
    font-size: 14.5px;
    font-weight: 800;
    line-height: 1.3;
    margin-bottom: 8px;
    -webkit-line-clamp: 2;
    min-height: calc(1.3em * 2);
  }

  .stats {
    gap: 6px;
    font-size: 11px;
    flex-wrap: nowrap;
    overflow: hidden;
  }

  .stats .stat,
  .stats .stat-divider,
  .stats .days-left {
    white-space: nowrap;
  }

  .stats .stat-icon {
    width: 11px;
    height: 11px;
  }

  .stats .stat-num {
    font-size: 11.5px;
  }

  .stats .days-left {
    font-size: 10.5px;
    padding: 2px 6px;
  }

  .card-footer {
    margin-top: 10px;
    padding-top: 10px;
  }

  .creator-avatar {
    width: 18px;
    height: 18px;
  }

  .creator-name {
    font-size: 11px;
    max-width: 70px;
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
    top: 12px;
    left: 12px;
    gap: 6px;
  }

  .status-badge {
    font-size: 11.5px;
    padding: 5px 11px 5px 10px;
  }

  .status-dot {
    width: 7px;
    height: 7px;
  }

  .vote-type-badge {
    font-size: 11px;
    padding: 4.5px 9px 4.5px 8px;
  }

  .new-badge {
    font-size: 10.5px;
    padding: 5px 8px;
  }

  .dday-badge {
    top: 12px;
    right: 12px;
    font-size: 11.5px;
    padding: 5px 11px;
  }

  .card-content {
    padding: 18px 20px 20px;
  }

  .category-chip {
    height: 24px;
    font-size: 12px;
    padding: 0 11px;
    margin-bottom: 10px;
  }

  .title {
    font-size: 18.5px;
    margin-bottom: 14px;
  }

  .stats {
    gap: 10px;
    font-size: 13px;
  }

  .stats .stat-icon {
    width: 13px;
    height: 13px;
  }

  .stats .stat-num {
    font-size: 13.5px;
  }

  .stats .stat-divider {
    height: 11px;
  }

  .stats .days-left {
    font-size: 12.5px;
    padding: 3px 9px;
  }

  .card-footer {
    margin-top: 14px;
    padding-top: 14px;
  }

  .creator-avatar {
    width: 26px;
    height: 26px;
  }

  .creator-name {
    font-size: 13px;
    max-width: 140px;
  }

  .action-hint {
    font-size: 12.5px;
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