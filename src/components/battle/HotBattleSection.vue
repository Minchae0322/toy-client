<template>
  <section v-if="battles.length > 0 || loading" class="hot-section">
    <!-- 헤더 -->
    <div class="section-header">
      <h2 class="section-title">🔥 실시간 HOT</h2>
      <button class="view-all-btn" @click="$emit('view-all')">더보기</button>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="hot-scroll">
      <div v-for="i in 5" :key="`skeleton-${i}`" class="hot-card skeleton">
        <div class="skeleton-thumb"></div>
        <div class="skeleton-info">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line tiny"></div>
        </div>
      </div>
    </div>

    <!-- 배틀 리스트 -->
    <div v-else class="hot-scroll">
      <article
          v-for="(battle, index) in battles.slice(0, 5)"
          :key="battle.id || battle.battleId"
          class="hot-card"
          @click="handleBattleClick(battle.id || battle.battleId)"
      >
        <!-- 썸네일 -->
        <div class="thumb">
          <img
              :src="getBattleThumbnail(battle)"
              :alt="battle.title"
              loading="lazy"
              @error="handleImageError"
          />

          <!-- 순위 뱃지 -->
          <div class="rank-badge" :class="getRankClass(index)">
            {{ index + 1 }}
          </div>

          <!-- 1위 HOT 뱃지 -->
          <span class="hot-badge">HOT</span>
        </div>

        <!-- 정보 -->
        <div class="info">
          <h3 class="title">{{ battle.title }}</h3>
          <p class="votes">{{ formatNumber(battle.totalVotes || 0) }} 투표</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  battles: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['battle-click', 'view-all'])

const DEFAULT_THUMBNAIL = 'https://picsum.photos/200'

const formatNumber = (num) => {
  if (!num || num === 0) return '0'
  if (num >= 10000) return `${Math.floor(num / 10000)}만`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString()
}

const getBattleThumbnail = (battle) => {
  return battle?.thumbnailDto?.fileUrl
      || battle?.thumbnailFile?.fileUrl
      || battle?.topItemImages?.[0]
      || DEFAULT_THUMBNAIL
}

const getRankClass = (index) => {
  if (index === 0) return 'first'
  if (index === 1) return 'second'
  if (index === 2) return 'third'
  return ''
}

const handleBattleClick = (battleId) => {
  router.push({ name: 'BattleDetail', params: { id: battleId } })
  emit('battle-click', battleId)
}

const handleImageError = (event) => {
  event.target.src = DEFAULT_THUMBNAIL
}
</script>

<style scoped>
.hot-section {
  padding: 20px 16px 0;
}

@media (min-width: 768px) {
  .hot-section {
    padding: 24px 24px 0;
  }
}

@media (min-width: 1024px) {
  .hot-section {
    padding: 24px 32px 0;
  }
}

/* 헤더 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.view-all-btn {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.view-all-btn:hover {
  color: #64748b;
}

/* 스크롤 */
.hot-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin: 0 -16px;
  padding-left: 16px;
  padding-right: 16px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.hot-scroll::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .hot-scroll {
    margin: 0 -24px;
    padding-left: 24px;
    padding-right: 24px;
  }
}

@media (min-width: 1024px) {
  .hot-scroll {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    overflow-x: visible;
    margin: 0;
    padding-left: 0;
    padding-right: 0;
  }
}

/* 카드 */
.hot-card {
  flex-shrink: 0;
  width: 180px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.hot-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

@media (min-width: 1024px) {
  .hot-card {
    width: auto;
  }
}

/* 썸네일 4:3 */
.thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: #f8fafc;
  overflow: hidden;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.hot-card:hover .thumb img {
  transform: scale(1.03);
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
}

/* 순위 뱃지 */
.rank-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: #fff;
  color: #64748b;
}

.rank-badge.first {
  background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
  color: #fff;
  box-shadow: 0 2px 4px rgba(255, 184, 0, 0.3);
}

.rank-badge.second {
  background: linear-gradient(135deg, #e8e8e8 0%, #c0c0c0 100%);
  color: #fff;
  box-shadow: 0 2px 4px rgba(192, 192, 192, 0.3);
}

.rank-badge.third {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
  color: #fff;
  box-shadow: 0 2px 4px rgba(205, 127, 50, 0.3);
}

/* HOT 뱃지 */
.hot-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: #9333ea;
  border-radius: 4px;
}

/* 정보 */
.info {
  padding: 12px;
}

.title {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
  letter-spacing: -0.01em;
}

.votes {
  margin: 0;
  font-size: 11px;
  color: #94a3b8;
}

/* 스켈레톤 */
.skeleton {
  pointer-events: none;
}

.skeleton-thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skeleton-line {
  height: 13px;
  width: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
  width: 40%;
  height: 10px;
}

.skeleton-line.tiny {
  width: 50%;
  height: 10px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .hot-card,
  .thumb img,
  .skeleton-thumb,
  .skeleton-line {
    animation: none;
    transition: none;
  }
}
</style>