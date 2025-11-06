<template>
  <section class="hot-section">
    <!-- 섹션 헤더 -->
    <div class="section-header">
      <div class="title-group">
        <div class="hot-badge-large">
          <span class="badge-icon">🔥</span>
          HOT
        </div>
        <div>
          <h2 class="section-title">실시간 인기 배틀</h2>
          <p class="section-subtitle">지금 가장 핫한 투표 TOP 5</p>
        </div>
      </div>
      <button class="view-all-btn">
        전체보기 →
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="hot-loading">
      <div v-for="i in 5" :key="`skeleton-${i}`" class="skeleton-item">
        <div class="skeleton-rank"></div>
        <div class="skeleton-thumbnail"></div>
        <div class="skeleton-content">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    </div>

    <!-- 배틀 리스트 -->
    <div v-else class="hot-list">
      <article
          v-for="(battle, index) in battles.slice(0, 5)"
          :key="battle.id || battle.battleId"
          class="hot-item"
          :class="{ 'is-hovered': hoveredId === battle.id }"
          @mouseenter="hoveredId = battle.id"
          @mouseleave="hoveredId = null"
          @click="handleBattleClick(battle.id || battle.battleId)"
      >
        <!-- 랭킹 -->
        <div class="rank-badge" :class="`rank-${index + 1}`">
          {{ index + 1 }}
        </div>

        <!-- 썸네일 -->
        <div class="item-thumbnail">
          <img
              v-if="getBattleThumbnail(battle)"
              :src="getBattleThumbnail(battle)"
              :alt="battle.title"
              loading="lazy"
              @error="(e) => e.target.style.display = 'none'"
          >
          <div v-else class="thumbnail-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="6" width="16" height="12" rx="1" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
              <circle cx="8" cy="10" r="1.5" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
              <path d="M4 15l4-4 3 3 5-5 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
            </svg>
          </div>

          <!-- 마감 임박 배지 -->
          <div v-if="isUrgent(battle)" class="urgent-badge">
            {{ getDeadlineShort(battle) }}
          </div>
        </div>

        <!-- 컨텐츠 -->
        <div class="item-content">
          <div class="content-category">
            {{ getCategoryName(battle) || '전체' }}
          </div>
          <h3 class="content-title">{{ battle.title }}</h3>
        </div>

        <!-- 통계 -->
        <div class="item-stats">
          <div class="stat-column">
            <div class="stat-value">{{ formatNumber(getParticipants(battle)) }}</div>
            <div class="stat-label">참여자</div>
          </div>
          <div class="stat-column">
            <div class="stat-value" :class="`rank-color-${index + 1}`">
              {{ formatNumber(getVotes(battle)) }}
            </div>
            <div class="stat-label">투표</div>
          </div>
        </div>

        <!-- 화살표 -->
        <div class="item-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  battles: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['battle-click'])

const hoveredId = ref(null)

// 유틸리티 함수들
const formatNumber = (num) => {
  if (!num || num === 0) return '0'
  if (num >= 10000) return `${Math.floor(num / 10000)}만`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const getParticipants = (battle) => {
  return battle?.totalParticipants || 0
}

const getVotes = (battle) => {
  return battle?.totalVotes || 0
}

const getCategoryName = (battle) => {
  return battle?.subCategoryDetail?.subCategoryName ||
      battle?.subCategoryDetail?.categoryName ||
      battle?.categoryName ||
      null
}

const getBattleThumbnail = (battle) => {
  return battle?.thumbnailDto?.fileUrl ||
      battle?.thumbnailFile?.fileUrl ||
      (battle?.topItemImages?.[0]) ||
      null
}

const getDeadlineShort = (battle) => {
  if (!battle?.endDate) return '진행중'

  const now = new Date()
  const end = new Date(battle.endDate)
  const diff = end - now
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 0) return '종료'
  if (hours < 24) return `${hours}시간`
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days === 1) return '1일'
  if (days <= 99) return `${days}일`
  return '99+일'
}

const isUrgent = (battle) => {
  if (!battle?.endDate) return false
  const now = new Date()
  const end = new Date(battle.endDate)
  const diff = end - now
  const hours = Math.floor(diff / (1000 * 60 * 60))
  return hours < 24 && hours >= 0
}

const handleBattleClick = (battleId) => {
  router.push({ name: 'BattleDetail', params: { id: battleId } })
  emit('battle-click', battleId)
}
</script>

<style scoped>
.hot-section {
  margin-bottom: 32px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hot-badge-large {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
  letter-spacing: 0.03em;
}

.badge-icon {
  font-size: 14px;
}

.section-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
  margin: 0 0 2px;
}

.section-subtitle {
  font-size: 12px;
  font-weight: 500;
  color: #6B7280;
  margin: 0;
}

.view-all-btn {
  padding: 8px 14px;
  background: transparent;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #6B7280;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.view-all-btn:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

/* 로딩 스켈레톤 */
.hot-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
}

.skeleton-rank {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: linear-gradient(90deg, #F9FAFB 25%, #F3F4F6 50%, #F9FAFB 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

.skeleton-thumbnail {
  width: 80px;
  height: 56px;
  flex-shrink: 0;
  background: linear-gradient(90deg, #F9FAFB 25%, #F3F4F6 50%, #F9FAFB 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #F9FAFB 25%, #F3F4F6 50%, #F9FAFB 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-line.short {
  width: 60px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 배틀 리스트 */
.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.hot-item.is-hovered,
.hot-item:hover {
  background: #F9FAFB;
  border-color: #E5E7EB;
}

/* 랭킹 배지 */
.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 800;
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

.rank-badge.rank-4,
.rank-badge.rank-5 {
  background: #F3F4F6;
  color: #6B7280;
}

/* 썸네일 */
.item-thumbnail {
  position: relative;
  width: 80px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #F3F4F6;
}

.item-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.hot-item:hover .item-thumbnail img {
  transform: scale(1.05);
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  color: #D1D5DB;
}

.urgent-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 6px;
  background: rgba(239, 68, 68, 0.95);
  color: white;
  font-size: 9px;
  font-weight: 700;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

/* 컨텐츠 */
.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.content-category {
  display: inline-flex;
  align-self: flex-start;
  padding: 2px 8px;
  background: #F3F4F6;
  color: #6B7280;
  font-size: 10px;
  font-weight: 600;
  border-radius: 4px;
  letter-spacing: 0.02em;
}

.content-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 통계 */
.item-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-left: 16px;
  border-left: 1px solid #E5E7EB;
  flex-shrink: 0;
}

.stat-column {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.stat-value {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.stat-value.rank-color-1 {
  color: #EF4444;
}

.stat-value.rank-color-2 {
  color: #F59E0B;
}

.stat-value.rank-color-3 {
  color: #10B981;
}

.stat-label {
  font-size: 10px;
  color: #9CA3AF;
  font-weight: 500;
}

/* 화살표 */
.item-arrow {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D1D5DB;
  transition: all 0.2s;
  opacity: 0;
}

.hot-item:hover .item-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* 반응형 */
@media (max-width: 768px) {
  .hot-section {
    padding: 20px 16px;
    margin-bottom: 32px;
  }

  .item-stats {
    display: none;
  }

  .item-arrow {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .hot-item {
    gap: 12px;
    padding: 10px;
  }

  .rank-badge {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .item-thumbnail {
    width: 64px;
    height: 48px;
  }

  .content-title {
    font-size: 13px;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .hot-item,
  .item-thumbnail img,
  .item-arrow,
  .skeleton-rank,
  .skeleton-thumbnail,
  .skeleton-line {
    animation: none;
    transition: none;
  }
}
</style>