<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <div class="dashboard-shell">
        <!-- 브랜드 인트로 (yogurtte 정체성) -->
        <DashboardBrandHero />

        <!-- 메인: 요거픽 (사이트의 대표 기능) -->
        <DashboardBattles />

        <!-- 다른 코너 둘러보기 (탐색 진입점) -->
        <DashboardQuickNav />

        <!-- 핫 피드 섹션 -->
        <DashboardHotFeeds :feeds="hotFeeds" :loading="feedsLoading" />

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

const hotFeeds = ref([])
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
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  /* 모바일: 하단 BottomNavigation(60px) + 여유 + iOS 홈 인디케이터 회피 */
  padding-bottom: calc(5rem + env(safe-area-inset-bottom));
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 3rem;
  }
}

/* 콘텐츠 컨테이너: 가운데 정렬 + 일관된 좌우 여백 */
.dashboard-shell {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  /* 섹션 간 충분한 여백 — 콘텐츠가 숨쉬게 */
  gap: 40px;
}

@media (min-width: 768px) {
  .dashboard-shell {
    padding: 0 32px;
    gap: 52px;
  }
}

@media (min-width: 1024px) {
  .dashboard-shell {
    padding: 0 40px;
    gap: 64px;
  }
}

@media (min-width: 1280px) {
  .dashboard-shell {
    padding: 0 48px;
  }
}

@media (max-width: 480px) {
  .dashboard-shell {
    padding: 0 16px;
    gap: 32px;
  }
}

/* 첫 섹션(BrandHero) 위쪽 여백 */
.dashboard-shell > :first-child {
  margin-top: 12px;
}
@media (min-width: 768px) {
  .dashboard-shell > :first-child {
    margin-top: 20px;
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
