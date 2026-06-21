<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <div class="dashboard-shell">
        <!-- 브랜드 인트로 (yogurtte 정체성) -->
        <DashboardBrandHero />

        <!-- 다른 코너 둘러보기 (탐색 진입점) -->
        <DashboardQuickNav />

        <!-- 최신 피드 (매번 새로운 콘텐츠) -->
        <DashboardHotFeeds :feeds="latestFeeds" :loading="feedsLoading" />

        <!-- 요거픽 (사이트의 대표 기능) -->
        <DashboardBattles />

        <!-- 실시간 제품 랭킹 섹션 (버블 차트) -->
        <DashboardRanking @products-loaded="onProductsLoaded" />

        <!-- PC 우측 광고 (AdSense 승인 후 노출, dev에서는 placeholder) -->
        <div v-if="ADS_ENABLED || isDev" class="dash-ad-row">
          <AdSlot
            :slot-id="AD_SLOTS.DASHBOARD_RIGHT"
            :min-height="180"
            bordered
          />
        </div>
      </div>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
defineOptions({ name: 'DashboardView' })

import { ref, onMounted } from 'vue'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import AdSlot from '@/components/common/AdSlot.vue'
import DashboardBattles from '@/components/dashboard/DashboardBattles.vue'
import DashboardBrandHero from '@/components/dashboard/DashboardBrandHero.vue'
import DashboardQuickNav from '@/components/dashboard/DashboardQuickNav.vue'
import DashboardHotFeeds from '@/components/dashboard/DashboardHotFeeds.vue'
import DashboardRanking from '@/components/dashboard/DashboardRanking.vue'
import { ADS_ENABLED, AD_SLOTS } from '@/config/ads'
import { feedService } from '@/services/FeedService'

const isDev = import.meta.env.DEV

const latestFeeds = ref([])
const hotProducts = ref([])

const feedsLoading = ref(true)

const loadLatestFeeds = async () => {
  feedsLoading.value = true
  try {
    const response = await feedService.getFeedsWithCursor({ size: 6, isActive: true })
    if (response.success && response.data) {
      latestFeeds.value = response.data.feeds || []
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

onMounted(loadLatestFeeds)
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
  /* PC — 사이드바와 시각적 분리를 위한 좌측 여백 (다른 메뉴 페이지와 통일) */
  padding-left: 1.5rem;
}

@media (max-width: 767px) {
  .main-content {
    padding-left: 0;
  }
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 3rem;
  }
}

/* 콘텐츠 컨테이너: 가운데 정렬 — 좌우 여백은 .app-container가 처리 */
.dashboard-shell {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  /* 컴팩트 레이아웃 — 섹션을 촘촘하게 */
  gap: 26px;
}

@media (min-width: 768px) {
  .dashboard-shell {
    gap: 34px;
  }
}

@media (min-width: 1024px) {
  .dashboard-shell {
    gap: 40px;
  }
}

@media (max-width: 480px) {
  .dashboard-shell {
    gap: 22px;
  }
}

/* QuickNav는 Hero 바로 아래에 더 가깝게 붙임 */
.dashboard-shell > :nth-child(2) {
  margin-top: -10px;
}
@media (max-width: 480px) {
  .dashboard-shell > :nth-child(2) {
    margin-top: -8px;
  }
}

/* 첫 섹션(BrandHero) 위쪽 여백 */
.dashboard-shell > :first-child {
  margin-top: 10px;
}
@media (min-width: 768px) {
  .dashboard-shell > :first-child {
    margin-top: 16px;
  }
}

.dash-ad-row {
  width: 100%;
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
</style>
