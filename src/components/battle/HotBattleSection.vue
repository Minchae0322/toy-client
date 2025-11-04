<template>
  <section class="hot-section">
    <!-- 섹션 헤더 - 더 눈에 띄게 -->
    <div class="section-header">
      <div class="title-group">
        <div class="hot-badge-large">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.5 1c0 1.5-.5 2.5-1.5 3.5-.5-1.5-1.5-2.5-2.5-3 0 2.5-1.5 5.5-1.5 7.5a5 5 0 0010 0c0-2-1.5-5-1.5-7.5-1 1-1.5 2-2 2.5z"/>
          </svg>
          HOT
        </div>
        <div>
          <h2 class="section-title">지금 가장 인기있는 배틀</h2>
          <p class="section-subtitle">실시간 참여자 수 TOP 5</p>
        </div>
      </div>
      <button class="view-all-btn">
        전체보기
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="hot-loading">
      <div v-for="i in 5" :key="`skeleton-${i}`" class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-stats"></div>
        </div>
      </div>
    </div>

    <!-- 핫 배틀 카드 - 가독성 개선 -->
    <div v-else class="hot-grid">
      <article
          v-for="(battle, index) in battles.slice(0, 5)"
          :key="battle.id || battle.battleId"
          class="hot-card"
          :class="`rank-${index + 1}`"
          @click="handleBattleClick(battle.id || battle.battleId)"
      >
        <!-- 썸네일 -->
        <div class="card-image">
          <img
              v-if="getBattleThumbnail(battle)"
              :src="getBattleThumbnail(battle)"
              :alt="battle.title"
              loading="lazy"
              @error="(e) => e.target.style.opacity = '0'"
          >
          <div class="image-placeholder">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="8" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
              <circle cx="11" cy="13" r="2" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
              <path d="M6 20l5-5 4 4 7-7 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
            </svg>
          </div>

          <!-- 랭킹 표시 - 더 크고 명확하게 -->
          <div class="rank-indicator">
            <span class="rank-number">{{ index + 1 }}</span>
            <span class="rank-text">위</span>
          </div>

          <!-- 마감 시간 배지 -->
          <div v-if="getDeadlineClass(battle)" class="deadline-badge" :class="getDeadlineClass(battle)">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="6" cy="6" r="5" stroke="currentColor" fill="none" stroke-width="1"/>
              <path d="M6 3v3l2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            {{ getDeadlineShort(battle) }}
          </div>
        </div>

        <!-- 컨텐츠 -->
        <div class="card-content">
          <!-- 카테고리 -->
          <div class="card-category">
            {{ getCategoryName(battle) || '전체' }}
          </div>

          <!-- 제목 - 더 크게 -->
          <h3 class="card-title">{{ battle.title }}</h3>

          <!-- 핵심 통계 - 더 명확하게 -->
          <div class="card-stats">
            <div class="stat-item primary">
              <div class="stat-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 00-11.215 0c-.22.578.254 1.139.872 1.139h9.47z"/>
                </svg>
              </div>
              <div>
                <div class="stat-value">{{ formatNumber(getParticipants(battle)) }}</div>
                <div class="stat-label">참여자</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 11l6-6 6 6"/>
                </svg>
              </div>
              <div>
                <div class="stat-value">{{ formatNumber(getVotes(battle)) }}</div>
                <div class="stat-label">투표</div>
              </div>
            </div>
          </div>

          <!-- 생성자 정보 -->
          <div class="card-footer">
            <img
                v-if="getCreatorAvatar(battle)"
                :src="getCreatorAvatar(battle)"
                :alt="getCreatorName(battle)"
                class="creator-avatar"
                @error="(e) => e.target.style.display = 'none'"
            >
            <div v-else class="creator-avatar-placeholder">
              {{ getCreatorName(battle).charAt(0).toUpperCase() }}
            </div>
            <span class="creator-name">{{ getCreatorName(battle) }}</span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
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

const getCreatorName = (battle) => {
  return battle?.creatorUserInfo?.nickname || '알 수 없음'
}

const getCreatorAvatar = (battle) => {
  return battle?.creatorUserInfo?.profileImageFile?.fileUrl || null
}

const getDeadlineShort = (battle) => {
  if (!battle?.endDate) return '진행중'

  const now = new Date()
  const end = new Date(battle.endDate)
  const diff = end - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (days < 0) return '종료'
  if (hours < 24) return `${hours}시간`
  if (days === 1) return '1일'
  if (days <= 99) return `${days}일`
  return '99+일'
}

const getDeadlineClass = (battle) => {
  if (!battle?.endDate) return ''

  const now = new Date()
  const end = new Date(battle.endDate)
  const diff = end - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days <= 1) return 'critical'
  if (days <= 3) return 'urgent'
  return ''
}

const handleBattleClick = (battleId) => {
  router.push({ name: 'BattleDetail', params: { id: battleId } })
  emit('battle-click', battleId)
}
</script>

<style scoped>
.hot-section {
  margin-bottom: 48px;
  padding: 0;
  background: transparent;
  border-radius: 0;
  border: none;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.title-group {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.hot-badge-large {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  font-size: 13px;
  font-weight: 800;
  border-radius: 12px;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.hot-badge-large svg {
  animation: flicker 1.5s ease-in-out infinite;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.section-title {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
}

.section-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  margin: 0;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.view-all-btn:hover {
  background: #111827;
  border-color: #111827;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 로딩 스켈레톤 */
.hot-loading {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

@media (min-width: 768px) {
  .hot-loading {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .hot-loading {
    display: flex;
    gap: 16px;
    overflow: hidden;
  }
}

.skeleton-card {
  flex: 0 0 260px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.skeleton-image {
  width: 100%;
  height: 150px;
  background: linear-gradient(90deg, #F9FAFB 25%, #F3F4F6 50%, #F9FAFB 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  padding: 20px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #F9FAFB 25%, #F3F4F6 50%, #F9FAFB 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-stats {
  height: 40px;
  background: linear-gradient(90deg, #F9FAFB 25%, #F3F4F6 50%, #F9FAFB 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  margin-top: 16px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 핫 그리드 */
.hot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

@media (min-width: 768px) {
  .hot-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .hot-grid {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: thin;
    scrollbar-color: #FCD34D transparent;
  }

  .hot-grid::-webkit-scrollbar {
    height: 6px;
  }

  .hot-grid::-webkit-scrollbar-track {
    background: transparent;
  }

  .hot-grid::-webkit-scrollbar-thumb {
    background: #FCD34D;
    border-radius: 3px;
  }
}

/* 핫 카드 */
.hot-card {
  flex: 0 0 260px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
}

.hot-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

/* 랭킹별 스타일 */
.hot-card.rank-1 {
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.15);
}

.hot-card.rank-1 .rank-indicator {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
}

.hot-card.rank-2 .rank-indicator {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
}

.hot-card.rank-3 .rank-indicator {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

/* 카드 이미지 */
.card-image {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
  background: #F9FAFB;
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  transition: transform 0.3s, opacity 0.3s;
}

.hot-card:hover .card-image img {
  transform: scale(1.08);
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
  color: #D1D5DB;
}

/* 랭킹 인디케이터 */
.rank-indicator {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
  color: white;
  border-radius: 10px;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.rank-number {
  font-size: 18px;
  font-weight: 800;
}

.rank-text {
  font-size: 11px;
  font-weight: 600;
}

/* 마감 시간 배지 */
.deadline-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: white;
  color: #374151;
  font-size: 12px;
  font-weight: 700;
  border-radius: 8px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.deadline-badge.critical {
  background: #FEE2E2;
  color: #DC2626;
}

.deadline-badge.urgent {
  background: #FED7AA;
  color: #EA580C;
}

/* 카드 컨텐츠 */
.card-content {
  padding: 20px;
}

.card-category {
  font-size: 11px;
  font-weight: 700;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}

/* 통계 */
.card-stats {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #F3F4F6;
  border-bottom: 1px solid #F3F4F6;
  margin-bottom: 12px;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item.primary {
  color: #EF4444;
}

.stat-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}

.stat-item.primary .stat-icon {
  opacity: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: #6B7280;
  font-weight: 500;
}

/* 카드 푸터 - 생성자 */
.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.creator-avatar,
.creator-avatar-placeholder {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
}

.creator-avatar {
  object-fit: cover;
  border: 1px solid #E5E7EB;
}

.creator-avatar-placeholder {
  background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}

.creator-name {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 반응형 */
@media (max-width: 768px) {
  .hot-section {
    padding: 20px 16px;
    margin-bottom: 32px;
  }

  .section-title {
    font-size: 18px;
  }

  .hot-card {
    flex: 0 0 240px;
  }

  .card-image {
    height: 140px;
  }

  .card-content {
    padding: 16px;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .hot-badge-large,
  .hot-badge-large svg,
  .hot-card,
  .card-image img {
    animation: none;
    transition: none;
  }

  .skeleton-image,
  .skeleton-line,
  .skeleton-stats {
    animation: none;
  }
}
</style>