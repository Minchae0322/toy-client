<template>
  <article
      v-if="battle && battle.title"
      class="battle-card"
      @click="handleClick"
      role="button"
      tabindex="0"
      @keydown.enter="handleClick"
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
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
          <circle cx="10" cy="12" r="2" fill="currentColor" opacity="0.3"/>
          <path d="M4 22l6-6 4 4 8-8 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
        </svg>
      </div>

      <!-- VS 배지 -->
      <div class="vs-badge">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>
        </svg>
        <span>VS</span>
      </div>

      <!-- 상태/마감 정보 -->
      <div class="info-badges">
        <span class="status-badge" :class="statusClass">{{ statusText }}</span>
        <span v-if="showDeadline" class="deadline-badge" :class="deadlineClass">{{ dDayText }}</span>
      </div>
    </div>

    <!-- 컨텐츠 영역 -->
    <div class="card-content">
      <!-- 카테고리 & 권한 -->
      <div class="card-header">
        <span class="category">{{ categoryName }}</span>
        <span class="separator">·</span>
        <span class="permission">{{ permissionLabel }}</span>
      </div>

      <!-- 배틀 제목 - 강조 -->
      <h3 class="battle-title">
        <span class="title-icon">⚔️</span>
        {{ battle.title }}
      </h3>

      <!-- 배틀 통계 바 -->
      <div class="battle-stats-bar">
        <div class="stat-group">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <span class="stat-value">{{ formatNumber(battle.totalParticipants || battle.participantCount) }}</span>
            <span class="stat-label">참여자</span>
          </div>
        </div>

        <div class="stat-divider"></div>

        <div class="stat-group">
          <div class="stat-icon">🗳️</div>
          <div class="stat-content">
            <span class="stat-value">{{ formatNumber(battle.totalVotes) }}</span>
            <span class="stat-label">투표</span>
          </div>
        </div>

        <div class="stat-divider"></div>

        <div class="stat-group">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <span class="stat-value">{{ itemCount }}</span>
            <span class="stat-label">항목</span>
          </div>
        </div>
      </div>

      <!-- 하단 정보 -->
      <div class="card-footer">
        <div class="creator">
          <img
              v-if="creatorProfileImage"
              :src="creatorProfileImage"
              :alt="creatorNickname"
              class="creator-avatar"
              @error="handleAvatarError"
          >
          <div v-else class="creator-avatar-placeholder">
            {{ creatorNickname.charAt(0).toUpperCase() }}
          </div>
          <span class="creator-name">{{ creatorNickname }}</span>
        </div>

        <div class="action-hint">
          <span>투표하기</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  battle: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['click'])

const imageError = ref(false)
const avatarError = ref(false)

const handleClick = () => {
  const battleId = props.battle.id || props.battle.battleId
  router.push({name: 'BattleDetail', params: {id: battleId}})
  emit('click', battleId)
}

const handleImageError = () => {
  imageError.value = true
}

const handleAvatarError = () => {
  avatarError.value = true
}

const formatNumber = (num) => {
  if (!num || num === 0) return '0'
  if (num >= 10000) return `${Math.floor(num / 10000)}만`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

const thumbnailUrl = computed(() => {
  if (imageError.value) return null
  if (props.battle?.thumbnailDto?.fileUrl) return props.battle.thumbnailDto.fileUrl
  if (props.battle?.thumbnailFile?.fileUrl) return props.battle.thumbnailFile.fileUrl
  if (props.battle?.topItemImages?.[0]) return props.battle.topItemImages[0]
  return null
})

const creatorProfileImage = computed(() => {
  if (avatarError.value) return null
  return props.battle?.creatorUserInfo?.profileImageFile?.fileUrl || null
})

const categoryName = computed(() => {
  return props.battle?.subCategoryDetail?.subCategoryName ||
      props.battle?.categoryName ||
      '기타'
})

const statusText = computed(() => {
  const status = props.battle?.status?.title || props.battle?.status
  if (status === 'ACTIVE') return '진행중'
  if (status === 'SCHEDULED') return '예정'
  if (status === 'CLOSED' || status === 'ENDED') return '종료'
  return '대기'
})

const statusClass = computed(() => {
  const status = props.battle?.status?.title || props.battle?.status
  if (status === 'ACTIVE') return 'active'
  if (status === 'SCHEDULED') return 'scheduled'
  if (status === 'CLOSED' || status === 'ENDED') return 'ended'
  return 'draft'
})

const permissionLabel = computed(() => {
  const type = props.battle?.itemAddPermissionType?.code || props.battle?.itemAddPermissionType
  if (type === 'CREATOR_ONLY') return '큐레이션'
  if (type === 'PUBLIC_FREE') return '오픈'
  if (type === 'PUBLIC_APPROVAL') return '승인제'
  return '큐레이션'
})

const itemCount = computed(() => {
  return props.battle?.items?.length ||
      props.battle?.options?.length ||
      props.battle?.itemCount ||
      0
})

const creatorNickname = computed(() => {
  return props.battle?.creatorUserInfo?.nickname ||
      props.battle?.createdBy?.nickname ||
      '알 수 없음'
})

const dDay = computed(() => {
  if (!props.battle?.endDate) return null
  const endDate = new Date(props.battle.endDate)
  const now = new Date()
  const diff = endDate - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const dDayText = computed(() => {
  const status = props.battle?.status?.title || props.battle?.status
  if (status === 'CLOSED' || status === 'ENDED') return '종료'

  const days = dDay.value
  if (days === null) return ''
  if (days < 0) return '종료'
  if (days === 0) return '오늘 마감'
  if (days === 1) return '내일 마감'
  if (days <= 7) return `${days}일 남음`
  return `D-${days}`
})

const showDeadline = computed(() => {
  const status = props.battle?.status?.title || props.battle?.status
  return status === 'ACTIVE' && dDay.value !== null
})

const deadlineClass = computed(() => {
  const days = dDay.value
  if (days === null) return ''
  if (days <= 1) return 'critical'
  if (days <= 3) return 'urgent'
  return 'normal'
})
</script>

<style scoped>
.battle-card {
  position: relative;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.battle-card:hover {
  border-color: #EF4444;
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.12);
  transform: translateY(-3px);
}

/* 썸네일 */
.card-thumbnail {
  position: relative;
  width: 100%;
  padding-bottom: 56%;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  overflow: hidden;
}

.thumbnail-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.battle-card:hover .thumbnail-image {
  transform: scale(1.04);
}

.thumbnail-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D1D5DB;
}

/* VS 배지 */
.vs-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.95);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  backdrop-filter: blur(8px);
}

/* 상태 배지들 */
.info-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.status-badge {
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  backdrop-filter: blur(8px);
}

.status-badge.active {
  background: #10B981;
  color: white;
}

.status-badge.scheduled {
  background: #F59E0B;
  color: white;
}

.status-badge.ended {
  background: #6B7280;
  color: white;
}

.deadline-badge {
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  backdrop-filter: blur(8px);
  color: #111827;
}

.deadline-badge.critical {
  background: #EF4444;
  color: white;
}

.deadline-badge.urgent {
  background: #F97316;
  color: white;
}

/* 컨텐츠 */
.card-content {
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.category {
  font-size: 11px;
  font-weight: 700;
  color: #EF4444;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.separator {
  color: #D1D5DB;
  font-weight: 300;
}

.permission {
  font-size: 11px;
  font-weight: 600;
  color: #9CA3AF;
}

/* 배틀 제목 강조 */
.battle-title {
  margin: 0 0 14px;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
  color: #111827;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  min-height: 44px;
}

.title-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

/* 배틀 통계 바 */
.battle-stats-bar {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  margin-bottom: 12px;
}

.stat-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 18px;
  line-height: 1;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  font-weight: 600;
  color: #6B7280;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: #E5E7EB;
  margin: 0 4px;
}

/* 푸터 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.creator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.creator-avatar,
.creator-avatar-placeholder {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
}

.creator-avatar {
  object-fit: cover;
  border: 1px solid #E5E7EB;
}

.creator-avatar-placeholder {
  background: #9CA3AF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
}

.creator-name {
  font-size: 12px;
  font-weight: 500;
  color: #6B7280;
}

.action-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #EF4444;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  opacity: 0;
  transition: opacity 0.2s;
}

.battle-card:hover .action-hint {
  opacity: 1;
}

/* 반응형 */
@media (max-width: 640px) {
  .card-content {
    padding: 14px;
  }

  .battle-title {
    font-size: 16px;
    min-height: 42px;
  }

  .stat-icon {
    font-size: 16px;
  }

  .stat-value {
    font-size: 15px;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .battle-card,
  .thumbnail-image,
  .action-hint {
    transition: none;
  }

  .battle-card:hover {
    transform: none;
  }

  .battle-card:hover .thumbnail-image {
    transform: none;
  }
}
</style>