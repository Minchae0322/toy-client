<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <!-- 대시보드 요약 -->
      <div class="dash-top-area">
        <div class="dash-top-main">
          <DashboardTrendBanner :top-trend-name="topTrendName" />

          <!-- 실시간 요거 봄 섹션 -->
          <DashboardYogurtBom :hot-feed-ids="hotFeedIds" />
        </div>

        <!-- 우측 광고 (AdSense 승인 후 노출, dev에서는 placeholder) -->
        <div v-if="ADS_ENABLED || isDev" class="dash-ad-column">
          <AdSlot
            :slot-id="AD_SLOTS.DASHBOARD_RIGHT"
            :min-height="320"
            bordered
          />
        </div>
      </div>

      <div class="dashboard-content">
        <!-- 핫 피드 섹션 -->
        <DashboardHotFeeds :feeds="hotFeeds" :loading="feedsLoading" />

        <!-- 실시간 배틀 섹션 -->
        <DashboardBattles />

        <!-- 실시간 제품 랭킹 섹션 (버블 차트) -->
        <DashboardRanking @products-loaded="onProductsLoaded" />
      </div>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import AdSlot from '@/components/common/AdSlot.vue'
import DashboardBattles from '@/components/dashboard/DashboardBattles.vue'
import DashboardYogurtBom from '@/components/dashboard/DashboardYogurtBom.vue'
import DashboardHotFeeds from '@/components/dashboard/DashboardHotFeeds.vue'
import DashboardRanking from '@/components/dashboard/DashboardRanking.vue'
import DashboardTrendBanner from '@/components/dashboard/DashboardTrendBanner.vue'
import { ADS_ENABLED, AD_SLOTS } from '@/config/ads'
import { feedService } from '@/services/FeedService'

const isDev = import.meta.env.DEV

const hotFeeds = ref([])
const hotFeedIds = computed(() => hotFeeds.value.map(f => f.feedId))
const hotProducts = ref([])

const feedsLoading = ref(true)

const loadHotFeeds = async () => {
  feedsLoading.value = true
  try {
    const response = await feedService.getHotFeeds({ size: 5, sort: 'hotScore,desc' })
    if (response.success) {
      hotFeeds.value = response.data?.content || response.data || []
    }
  } catch (error) {
    console.error('피드 로드 실패:', error)
  } finally {
    feedsLoading.value = false
  }
}

const onProductsLoaded = (products) => {
  hotProducts.value = products
}

const topTrendName = computed(() => {
  let name = '트렌드'
  if (hotFeeds.value.length > 0) name = hotFeeds.value[0].productName || '인기 피드'
  else if (hotProducts.value.length > 0) name = hotProducts.value[0].name || '인기 제품'
  return name.length > 12 ? name.slice(0, 12) + '…' : name
})

onMounted(() => {
  loadHotFeeds()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  background: var(--bg-base);
  min-height: 100vh;
  color: var(--text-primary);
  font-family: 'SUIT', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, "Malgun Gothic", "맑은 고딕", sans-serif;
  display: flex;
  max-width: 100%;
  overflow-x: clip;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .app-container {
    padding: 0 2rem;
  }
}

@media (min-width: 1280px) {
  .app-container {
    padding: 0 3rem;
    max-width: 1920px;
    margin-left: auto;
    margin-right: auto;
  }
}

@media (min-width: 1920px) {
  .app-container {
    padding: 0 4rem;
  }
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  /* 모바일: 하단 BottomNavigation(60px) + 여유 + iOS 홈 인디케이터 회피 */
  padding-bottom: calc(5rem + env(safe-area-inset-bottom));
  padding-left: 1.5rem;
}

@media (max-width: 767px) {
  .main-content {
    padding-left: 0;
  }
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 2.5rem;
  }
}

/* 상단 2컬럼 레이아웃 */
.dash-top-area {
  display: flex;
  align-items: stretch;
  gap: 1.25rem;
}

.dash-top-main {
  flex: 1;
  min-width: 0;
}

.dash-ad-column {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

@media (max-width: 1024px) {
  .dash-ad-column { display: none; }
}

@media (max-width: 767px) {
  .dash-top-area {
    flex-direction: column;
  }
}


/* 글래스 배너 */
.glass-banner {
  position: relative;
  margin-bottom: 0.75rem;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.glass-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

.glass-banner:active {
  transform: scale(0.985);
}

.banner-glow {
  display: none;
}

.banner-inner {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: 18px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  transition: border-color 0.2s;
}

.glass-banner:hover .banner-inner {
  border-color: var(--border-strong);
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.banner-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: var(--c-danger-soft);
  color: var(--c-danger);
  font-size: 0.6875rem;
  font-weight: 700;
  border-radius: 8px;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  border: 1px solid rgba(220, 38, 38, 0.12);
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-danger);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
  animation: dot-blink 1.5s ease-in-out infinite;
}

@keyframes dot-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.banner-text-group {
  display: flex;
  flex-direction: column;
  gap: 0.1875rem;
  min-width: 0;
}

.banner-title {
  font-size: 0.9375rem;
  color: var(--text-primary);
  margin: 0;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-title strong {
  font-weight: 700;
  color: var(--text-primary);
}

.banner-sub {
  font-size: 0.75rem;
  color: var(--c-text-400);
  margin: 0;
  font-weight: 400;
}

.banner-action {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-400);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.glass-banner:hover .banner-action {
  background: var(--c-brand-soft);
  color: var(--c-brand-hover);
}

/* live dot */
.live-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  background: var(--c-danger);
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}


/* 대시보드 콘텐츠 */
.dashboard-content {
  max-width: 1200px;
}

/* 섹션 */
.content-section {
  background: var(--bg-elevated);
  border-radius: 16px;
  padding: 1.375rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-default);
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
}

@media (min-width: 768px) {
  .content-section {
    padding: 1.625rem;
    margin-bottom: 1.125rem;
  }
}

.content-section:last-child {
  margin-bottom: 0;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.title-with-badge {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 0.75rem;
  border-left: 3px solid var(--c-text-400);
}

.section-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.section-title .title-accent {
  color: var(--c-brand);
}

@media (min-width: 768px) {
  .section-title {
    font-size: 1.125rem;
  }
}

@media (min-width: 1280px) {
  .section-title {
    font-size: 1.3125rem;
  }
}

.sub-title {
  font-size: 12px;
  font-weight: 400;
  color: var(--c-text-400);
  padding-left: 0;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0.375rem 0.875rem;
  background: var(--bg-subtle);
  border: none;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--c-text-400);
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: inherit;
  text-decoration: none;
}

.view-all-btn:hover {
  background: var(--border-strong);
  color: var(--c-text-600);
}

@media (min-width: 1280px) {
  .view-all-btn {
    font-size: 0.875rem;
  }

  .view-all-link {
    font-size: 0.875rem;
  }

  .sub-title {
    font-size: 13px;
  }
}


/* 피드 카드 그리드 */
.feed-card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .feed-card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .feed-card-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
  }
}

/* 피드 카드 */
.feed-card {
  position: relative;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.feed-card:hover {
  border-color: var(--border-strong);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

/* 상단 뱃지 영역 */
.image-badges-top {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 3;
}


/* 급상승 뱃지 */
.trend-badge {
  display: flex;
  align-items: center;
  gap: 0.1875rem;
  padding: 0.1875rem 0.375rem;
  background: var(--c-danger);
  border-radius: 4px;
  font-size: 0.5625rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
  animation: pulse-trend 2s ease-in-out infinite;
}

@keyframes pulse-trend {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 좋아요 유저 목록 */
.recent-likers {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  z-index: 3;
}

.liker-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -8px;
  overflow: hidden;
  background: #8b7cc8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.liker-avatar:first-child {
  margin-left: 0;
}

.liker-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.liker-initial {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 0.5rem;
  font-weight: 600;
  color: white;
}

.liker-more {
  margin-left: 0.25rem;
  padding: 0.125rem 0.375rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border-radius: 10px;
  font-size: 0.5625rem;
  font-weight: 600;
  color: white;
}

/* 카드 헤더 */
.feed-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #8b7cc8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.header-info .nickname {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-info .time {
  display: block;
  font-size: 0.625rem;
  color: var(--c-text-400);
}

/* 카드 이미지 */
.feed-card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: var(--bg-subtle);
  overflow: hidden;
}

.feed-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.feed-card:hover .feed-card-image img {
  transform: scale(1.02);
}

.feed-card-image .no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--c-text-300);
}

/* 평가 뱃지 - 파스텔 스타일 */
.eval-badge {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 700;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.eval-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.eval-badge.best { background-color: var(--c-warning-soft); color: var(--c-warning); }
.eval-badge.best .eval-dot { background-color: var(--c-warning); }

.eval-badge.good { background-color: var(--c-success-soft); color: var(--c-success); }
.eval-badge.good .eval-dot { background-color: var(--c-success); }

.eval-badge.okay { background-color: var(--c-brand-soft); color: var(--c-brand); }
.eval-badge.okay .eval-dot { background-color: var(--c-brand); }

.eval-badge.bad { background-color: var(--c-danger-soft); color: var(--c-danger); }
.eval-badge.bad .eval-dot { background-color: var(--c-danger); }

/* 카드 바디 */
.feed-card-body {
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 리뷰 요약 */
.review-summary {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 제품 정보 행 */
.product-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: var(--bg-subtle);
  border-radius: 8px;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.category-tag {
  display: inline-block;
  font-size: 9px;
  font-weight: 600;
  color: var(--c-brand);
  text-transform: uppercase;
  margin-bottom: 1px;
}

.product-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  font-size: 12px;
  font-weight: 700;
  color: var(--c-brand);
  white-space: nowrap;
}

/* 하단 푸터 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-name {
  font-size: 10px;
  font-weight: 400;
  color: var(--c-text-400);
}

.card-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 500;
  color: var(--c-text-400);
}

/* 카드 콘텐츠 (레거시) */
.feed-card-content {
  padding: 0.625rem 0.75rem 0.5rem;
}

.content-text {
  font-size: 0.75rem;
  color: var(--c-text-600);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 카드 푸터 */
.feed-card-footer {
  padding: 0.5rem 0.75rem 0.75rem;
  border-top: 1px solid var(--bg-subtle);
}

.stats {
  display: flex;
  gap: 0.75rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: var(--c-text-400);
}

.stat svg {
  color: var(--c-text-300);
}

/* 스켈레톤 */
.avatar-skeleton {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.feed-card-image.skeleton {
  aspect-ratio: 1;
}

.skeleton-line.tiny {
  width: 60px;
  height: 8px;
}

/* 배틀 그리드 */
.battle-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .battle-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .battle-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}


/* 글래스 배너 모바일 대응 */
@media (max-width: 640px) {
  .banner-inner {
    padding: 0.875rem 1rem;
  }

  .banner-title {
    font-size: 0.875rem;
  }
}

@media (min-width: 1280px) {
  .banner-title {
    font-size: 1.0625rem;
  }

  .banner-sub {
    font-size: 0.8125rem;
  }

  .banner-tag {
    font-size: 0.75rem;
  }
}

/* 버블 차트 모바일 대응 */
@media (max-width: 767px) {
  .dash-bubble-area {
    min-height: 320px;
    border-radius: 12px;
  }

  .ranking-section .section-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .ranking-section .sub-title-row {
    flex-wrap: wrap;
    gap: 6px;
  }

  .ranking-section .sort-indicator {
    padding: 2px 8px;
  }

  .ranking-section .header-right-group {
    margin-left: auto;
  }

  .dash-bubble-tooltip {
    padding: 10px 12px;
    border-radius: 12px;
  }

  .dash-tooltip-name {
    font-size: 13px;
  }

  .dash-tooltip-metrics {
    gap: 8px;
    margin-top: 8px;
  }

  .dash-metric-value {
    font-size: 12px;
  }
}

/* 스켈레톤 */
.skeleton {
  background: linear-gradient(90deg, var(--bg-subtle) 25%, #ebebeb 50%, var(--bg-subtle) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 10px;
}

.battle-skeleton .skeleton {
  aspect-ratio: 16 / 9;
}

.product-skeleton .skeleton {
  aspect-ratio: 1;
  margin-bottom: 0.625rem;
}

.skeleton-info {
  padding: 0 0.125rem;
}

.skeleton-line {
  height: 10px;
  border-radius: 3px;
  margin-bottom: 0.375rem;
  background: linear-gradient(90deg, var(--bg-subtle) 25%, #ebebeb 50%, var(--bg-subtle) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
  width: 50%;
  height: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  background: var(--bg-subtle);
  border-radius: 12px;
}

.empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.625rem;
  color: var(--c-text-300);
}

.empty-text {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--c-text-400);
  margin: 0;
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .skeleton,
  .skeleton-line {
    animation: none;
    background: var(--bg-subtle);
  }

  .live-dot,
  .trend-badge {
    animation: none;
  }

  .feed-card:hover {
    transform: none;
  }

  .feed-card:hover .feed-card-image img {
    transform: none;
  }
}

/* ===== 모바일 컴팩트 레이아웃 ===== */
@media (max-width: 767px) {
  /* 섹션 컴팩트 */
  .content-section {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 12px;
  }

  /* 핫 피드 카드 컴팩트 */
  .dashboard-feed-scroll {
    gap: 10px;
    padding: 4px 2px 10px 0;
  }

  .dash-feed-card {
    flex: 0 0 140px;
    height: 200px;
    border-radius: 18px;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  }

  .dash-card-skeleton {
    flex: 0 0 140px;
    height: 200px;
    border-radius: 18px;
  }

  .card-overlay {
    padding: 10px;
  }

  .rank-num {
    font-size: 18px;
  }

  .trending-tag {
    font-size: 8px;
    padding: 3px 7px;
  }

  .eval-pill {
    font-size: 8px;
    padding: 2px 6px;
    margin-bottom: 4px;
  }

  .review-main {
    font-size: 11px;
    margin-bottom: 3px;
    -webkit-line-clamp: 1;
  }

  .product-name-sub {
    font-size: 10px;
  }

  /* 배틀 그리드 컴팩트 */
  .battle-grid {
    gap: 0.5rem;
  }

  .section-header {
    margin-bottom: 0.5rem;
  }

  .section-title {
    font-size: 1.125rem;
  }

  .sub-title {
    font-size: 10px;
    padding: 2px 6px;
  }

  .sort-indicator {
    padding: 2px 8px;
  }

  .sort-label {
    font-size: 10px;
  }

  .view-all-link,
  .view-all-btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.375rem;
  }

  /* 빈 상태 컴팩트 */
  .empty-state {
    padding: 1.5rem 0.75rem;
  }

  .empty-icon {
    width: 36px;
    height: 36px;
    margin-bottom: 0.5rem;
  }

  .empty-text {
    font-size: 0.8125rem;
  }
}

/* ===== 모바일 한정: 탭 가능한 카드 텍스트 선택 방지 (PC 드래그 선택 유지) ===== */
@media (max-width: 767px) {
  .glass-banner,
  .dash-feed-card,
  .feed-card,
  .battle-hot-card,
  .dash-trend-banner,
  .dash-bubble {
    -webkit-user-select: none;
    user-select: none;
  }
}

/* ===== 터치(비호버) 디바이스에서 sticky hover 무력화 ===== */
@media (hover: none) {
  .glass-banner:hover,
  .dash-feed-card:hover,
  .feed-card:hover,
  .battle-hot-card:hover,
  .dash-bubble:hover {
    transform: none;
    box-shadow: inherit;
  }
  .dash-feed-card:hover .card-visual-wrapper img,
  .feed-card:hover .feed-card-image img {
    transform: none;
  }
  .glass-banner:hover .banner-inner,
  .glass-banner:hover .banner-action {
    transform: none;
  }
}

</style>
