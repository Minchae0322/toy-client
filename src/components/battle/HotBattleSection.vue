<template>
  <section class="hot-section">
    <!-- 섹션 헤더 -->
    <div class="section-header">
      <div class="hot-badge">🔥 HOT</div>
      <button class="view-all-btn" @click="$emit('view-all')">
        전체보기
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="hot-scroll-container">
      <div class="hot-scroll">
        <div v-for="i in 5" :key="`skeleton-${i}`" class="hot-card skeleton-card">
          <div class="skeleton-rank"></div>
          <div class="skeleton-thumb"></div>
          <div class="skeleton-info">
            <div class="skeleton-category"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-vote"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 배틀 리스트 -->
    <div v-else class="hot-scroll-container">
      <div class="hot-scroll">
        <article
            v-for="(battle, index) in battles.slice(0, 5)"
            :key="battle.id || battle.battleId"
            class="hot-card"
            :class="{ 'is-active': hoveredId === (battle.id || battle.battleId) }"
            @mouseenter="hoveredId = battle.id || battle.battleId"
            @mouseleave="hoveredId = null"
            @click="handleBattleClick(battle.id || battle.battleId)"
        >
          <!-- 랭킹 배지 -->
          <div class="rank-badge" :class="`rank-${index + 1}`">
            {{ index + 1 }}
          </div>

          <!-- 썸네일 -->
          <div class="thumb-container">
            <img
                v-if="getBattleThumbnail(battle)"
                :src="getBattleThumbnail(battle)"
                :alt="battle.title"
                class="thumb-img"
                loading="lazy"
            />
            <div v-else class="thumb-placeholder">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor"/>
                <path d="M21 15l-5-5L9 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <!-- 마감 임박 -->
            <span v-if="getDeadlineShort(battle)" class="deadline-tag">
              {{ getDeadlineShort(battle) }}
            </span>
          </div>

          <!-- 카드 정보 -->
          <div class="card-content">
            <span v-if="getCategoryName(battle)" class="category">
              {{ getCategoryName(battle) }}
            </span>
            <h3 class="title">{{ battle.title }}</h3>
            <div class="vote-stats">
              <span class="vote-count" :class="`vote-rank-${index + 1}`">
                {{ formatNumber(getVotes(battle)) }}
              </span>
              <span class="vote-label">투표</span>
            </div>
          </div>
        </article>
      </div>
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

const emit = defineEmits(['battle-click', 'view-all'])

const hoveredId = ref(null)

const formatNumber = (num) => {
  if (!num || num === 0) return '0'
  if (num >= 10000) return `${Math.floor(num / 10000)}만`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString()
}

const getVotes = (battle) => battle?.totalVotes || 0

const getCategoryName = (battle) => {
  return battle?.subCategoryDetail?.subCategoryName
      || battle?.subCategoryDetail?.categoryName
      || battle?.categoryName
      || null
}

const getBattleThumbnail = (battle) => {
  return battle?.thumbnailDto?.fileUrl
      || battle?.thumbnailFile?.fileUrl
      || battle?.topItemImages?.[0]
      || null
}

const getDeadlineShort = (battle) => {
  if (!battle?.endDate) return null
  const diff = new Date(battle.endDate) - new Date()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 0) return null
  if (hours < 24) return `${hours}시간`
  if (hours < 72) return `${Math.floor(hours / 24)}일`
  return null
}

const handleBattleClick = (battleId) => {
  router.push({ name: 'BattleDetail', params: { id: battleId } })
  emit('battle-click', battleId)
}
</script>

<style scoped>
.hot-section {
  padding: 1px 16px;
  width: 100%;
  box-sizing: border-box;
}

/* 헤더 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}

.hot-badge {
  font-size: 18px;
  font-weight: 800;
  color: #0a0a0a;
  letter-spacing: -0.5px;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #737373;
  cursor: pointer;
  padding: 8px 4px;
  transition: color 0.2s;
  font-family: inherit;
}

.view-all-btn:hover {
  color: #0a0a0a;
}

.view-all-btn svg {
  transition: transform 0.2s;
}

.view-all-btn:hover svg {
  transform: translateX(2px);
}

/* 스크롤 컨테이너 */
.hot-scroll-container {
  margin: 0 -16px;
  padding: 0 16px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.hot-scroll-container::-webkit-scrollbar {
  display: none;
}

.hot-scroll {
  display: flex;
  gap: 12px;
  padding-bottom: 4px;
}

/* 카드 */
.hot-card {
  flex: 0 0 160px;
  background: #ffffff;
  border-radius: 16px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.hot-card:last-child {
  margin-right: 16px;
}

.hot-card.is-active,
.hot-card:hover {
  border-color: #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

/* 랭킹 */
.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 10px;
  background: #f5f5f5;
  color: #737373;
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  color: white;
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
  color: white;
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #c084fc 0%, #a855f7 100%);
  color: white;
}

/* 썸네일 */
.thumb-container {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
  margin-bottom: 12px;
}

.thumb-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4d4d4;
}

.deadline-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(239, 68, 68, 0.95);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

/* 콘텐츠 */
.card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category {
  font-size: 11px;
  font-weight: 600;
  color: #9333ea;
  letter-spacing: 0.3px;
}

.title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0a0a0a;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
  letter-spacing: -0.3px;
}

.vote-stats {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 4px;
}

.vote-count {
  font-size: 16px;
  font-weight: 800;
  color: #0a0a0a;
  letter-spacing: -0.5px;
}

.vote-count.vote-rank-1 { color: #9333ea; }
.vote-count.vote-rank-2 { color: #a855f7; }
.vote-count.vote-rank-3 { color: #c084fc; }

.vote-label {
  font-size: 12px;
  color: #a3a3a3;
  font-weight: 500;
}

/* 스켈레톤 */
.skeleton-card {
  pointer-events: none;
}

.skeleton-rank {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e5e5e5 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 10px;
}

.skeleton-thumb {
  width: 100%;
  padding-bottom: 100%;
  border-radius: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e5e5e5 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 12px;
}

.skeleton-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-category {
  width: 50px;
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e5e5e5 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-title {
  width: 100%;
  height: 40px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e5e5e5 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-vote {
  width: 60px;
  height: 20px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e5e5e5 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 반응형 - 태블릿 */
@media (min-width: 768px) {
  .hot-section {
    padding: 24px 24px;
  }

  .hot-scroll-container {
    margin: 0 -24px;
    padding: 0 24px;
  }

  .hot-card {
    flex: 0 0 180px;
  }

  .hot-card:last-child {
    margin-right: 24px;
  }

  .hot-scroll {
    gap: 16px;
  }
}

/* 반응형 - 데스크탑 */
@media (min-width: 1024px) {
  .hot-section {
    padding: 32px 32px;
  }

  .hot-scroll-container {
    margin: 0;
    padding: 0;
    overflow: visible;
  }

  .hot-scroll {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
  }

  .hot-card {
    flex: none;
  }

  .hot-card:last-child {
    margin-right: 0;
  }
}

/* 대형 모니터 */
@media (min-width: 1280px) {
  .hot-section {
    padding: 40px 48px;
  }

  .hot-scroll {
    gap: 20px;
  }

  .hot-card {
    padding: 16px;
  }

  .title {
    font-size: 15px;
  }

  .vote-count {
    font-size: 18px;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .hot-card,
  .view-all-btn svg,
  .skeleton-rank,
  .skeleton-thumb,
  .skeleton-category,
  .skeleton-title,
  .skeleton-vote {
    animation: none;
    transition: none;
  }
}

/* 포커스 상태 */
.hot-card:focus-visible {
  outline: 2px solid #9333ea;
  outline-offset: 2px;
}

.view-all-btn:focus-visible {
  outline: 2px solid #9333ea;
  outline-offset: 2px;
  border-radius: 4px;
}
</style>