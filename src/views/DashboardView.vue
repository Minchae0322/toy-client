<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <!-- 페이지 헤더 -->
      <header class="page-header">
        <h1 class="page-title">
          <svg class="title-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
          트렌드 <span class="title-accent">한눈에</span>
        </h1>
      </header>

      <!-- 통계 카드 -->
      <div class="stats-grid">
        <router-link :to="{ name: 'FeedHome' }" class="stat-card">
          <div class="stat-icon feeds">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ dashboardSummary.popularFeedCount }}</span>
            <span class="stat-label">인기 피드</span>
          </div>
          <div v-if="dashboardSummary.activeBattleCount > 0" class="live-dot"></div>
        </router-link>

        <router-link :to="{ name: 'BattleList' }" class="stat-card">
          <div class="stat-icon battles">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ dashboardSummary.activeBattleCount }}</span>
            <span class="stat-label">요거픽</span>
          </div>
          <div v-if="dashboardSummary.activeBattleCount > 0" class="live-dot"></div>
        </router-link>

        <router-link :to="{ name: 'ProductRanking' }" class="stat-card">
          <div class="stat-icon products">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ dashboardSummary.totalItemCount }}</span>
            <span class="stat-label">아이템</span>
          </div>
        </router-link>
      </div>

      <!-- 실시간 요거 봄 섹션 -->
      <section class="yogurt-bom-section">
        <div class="yb-left">
          <div class="yb-status-badge">
            <span class="pulse-dot"></span>
            LIVE
          </div>
          <div class="yb-title-group">
            <h2 class="yb-main-title">실시간<br/>요거 봄</h2>
            <span class="yb-update-time">{{ lastUpdateTime }}</span>
          </div>
        </div>

        <div class="yb-right">
          <div v-if="yogurtBomLoading" class="yb-list">
            <div v-for="i in 6" :key="i" class="yb-item skeleton-item">
              <div class="skeleton yb-sk-rank"></div>
              <div class="yb-sk-content">
                <div class="skeleton yb-sk-line"></div>
                <div class="skeleton yb-sk-line short"></div>
              </div>
            </div>
          </div>

          <div v-else-if="yogurtBomFeeds.length === 0" class="empty-state compact">
            <p class="empty-text">실시간 데이터가 없습니다</p>
          </div>

          <div v-else ref="ybSwipeRef" class="yb-swipe-container" @scroll="onYbSwipe">
            <div v-for="(page, pageIdx) in ybPages" :key="pageIdx" class="yb-swipe-page">
              <div class="yb-list">
                <router-link
                  v-for="(feed, index) in page"
                  :key="feed.feedId"
                  :to="{ name: 'FeedDetail', params: { id: feed.feedId } }"
                  class="yb-item"
                >
                  <span class="yb-rank-badge" :class="'rank-' + (pageIdx * 6 + index + 1)">{{ pageIdx * 6 + index + 1 }}</span>
                  <div class="yb-info">
                    <span class="yb-product">{{ feed.productName }}</span>
                    <span class="yb-author-name">{{ feed.buyPlace || '' }}</span>
                  </div>
                  <div class="yb-tag-group">
                    <span v-if="isHotFeed(feed)" class="yb-tag hot">HOT</span>
                    <span v-if="isNewFeed(feed)" class="yb-tag new">NEW</span>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="yb-pagination">
          <button
            class="yb-page-btn"
            :class="{ active: ybCurrentPage === 0 }"
            @click="setYbPage(0)"
          ></button>
          <button
            class="yb-page-btn"
            :class="{ active: ybCurrentPage === 1 }"
            @click="setYbPage(1)"
          ></button>
        </div>
      </section>

      <div class="dashboard-content">
        <!-- 핫 피드 섹션 -->
        <section class="content-section hot-feeds-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2 class="section-title">지금 뜨는 핫-기록</h2>
              <span class="sub-title">실시간 인기 리뷰</span>
            </div>
            <router-link :to="{ name: 'FeedHome' }" class="view-all-link">
              전체보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6" /></svg>
            </router-link>
          </div>

          <div v-if="feedsLoading" class="dashboard-feed-scroll">
            <div v-for="i in 3" :key="i" class="skeleton dash-card-skeleton"></div>
          </div>

          <div v-else-if="hotFeeds.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>
            <p class="empty-text">아직 인기 피드가 없습니다</p>
          </div>

          <div v-else class="dashboard-feed-scroll">
            <router-link
              v-for="(feed, index) in hotFeeds"
              :key="feed.feedId"
              :to="{ name: 'FeedDetail', params: { id: feed.feedId } }"
              class="dash-feed-card"
            >
              <div class="card-visual-wrapper">
                <img :src="feed.hotFeedThumbnailDto?.fileUrl" :alt="feed.productName" @error="handleImageError" />

                <div class="card-overlay">
                  <div class="overlay-top">
                    <span class="rank-num">0{{ index + 1 }}</span>
                    <span v-if="feed.isTrending" class="trending-tag">HOT</span>
                  </div>

                  <div class="overlay-bottom">
                    <span v-if="feed.feedEvaluation?.code" :class="['eval-pill', feed.feedEvaluation.code.toLowerCase()]">
                      {{ feed.feedEvaluation.description }}
                    </span>
                    <p v-if="feed.reviewSummary" class="review-main">"{{ feed.reviewSummary }}"</p>
                    <span class="product-name-sub">{{ feed.productName }}</span>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </section>

        <!-- 실시간 배틀 섹션 -->
        <section class="content-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2 class="section-title">실시간 요거픽</h2>
              <span class="sub-title">유저들이 직접 고르는 승부</span>
            </div>
            <router-link :to="{ name: 'BattleList' }" class="view-all-btn">
              전체보기
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </router-link>
          </div>

          <div v-if="battlesLoading" class="battle-hot-grid">
            <div v-for="i in 3" :key="i" class="battle-hot-card skeleton-card">
              <div class="battle-hot-thumb"><div class="skeleton"></div></div>
              <div class="battle-hot-body">
                <div class="skeleton" style="height: 12px; width: 60px; margin-bottom: 8px;"></div>
                <div class="skeleton" style="height: 16px; width: 80%; margin-bottom: 6px;"></div>
                <div class="skeleton" style="height: 12px; width: 50%;"></div>
              </div>
            </div>
          </div>
          <div v-else-if="hotBattles.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <p class="empty-text">진행 중인 요거픽이 없습니다</p>
          </div>
          <div v-else class="battle-hot-grid">
            <router-link
              v-for="battle in hotBattles.slice(0, 3)"
              :key="battle.id"
              :to="{ name: 'BattleDetail', params: { id: battle.id } }"
              class="battle-hot-card"
            >
              <!-- 썸네일 -->
              <div class="battle-hot-thumb">
                <img
                  v-if="battle.thumbnailDto?.fileUrl"
                  :src="battle.thumbnailDto.fileUrl"
                  :alt="battle.title"
                  @error="handleImageError"
                />
                <div v-else class="thumb-placeholder">{{ battle.title }}</div>
                <div class="thumb-line"></div>
                <div class="thumb-vs"><span class="thumb-vs-pill">VS</span></div>
                <span class="badge-dday"><span class="dday-dot"></span>{{ getDdayText(battle.endDate) }}</span>
              </div>
              <!-- 바디 -->
              <div class="battle-hot-body">
                <div class="battle-hot-category-row">
                  <span class="battle-hot-category">{{ battle.status?.description || '진행중' }}</span>
                  <div class="battle-hot-stats">
                    <span class="battle-hot-stat">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      {{ formatNumber(battle.totalViews || 0) }}
                    </span>
                    <span class="battle-hot-stat">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      {{ battle.totalCommentCount || 0 }}
                    </span>
                  </div>
                </div>
                <h3 class="battle-hot-title">{{ battle.title }}</h3>
                <p class="battle-hot-meta">{{ battle.totalParticipants || 0 }}개 참여 · {{ battle.totalVotes || 0 }} 투표</p>

                <div class="battle-divider"><span class="battle-label">Pick Rank</span></div>

                <!-- 순위 -->
                <template v-if="battle.topItems?.length > 0">
                  <div class="rank-item r1-item">
                    <div class="rank-row">
                      <div class="rank-left">
                        <div class="rank-badge r1">1</div>
                        <span class="rank-name">{{ battle.topItems[0]?.displayName || '-' }}</span>
                      </div>
                      <span class="rank-pct p1">{{ formatPercent(battle.topItems[0]?.votePercentage) }}%</span>
                    </div>
                  </div>
                  <div v-if="battle.topItems[1]" class="rank-item">
                    <div class="rank-row">
                      <div class="rank-left">
                        <div class="rank-badge r2">2</div>
                        <span class="rank-name">{{ battle.topItems[1]?.displayName || '-' }}</span>
                      </div>
                      <span class="rank-pct p2">{{ formatPercent(battle.topItems[1]?.votePercentage) }}%</span>
                    </div>
                  </div>
                </template>

                <!-- 게이지 바 -->
                <div v-if="battle.topItems?.length > 0" class="battle-gauge-wrap">
                  <div class="battle-gauge-track">
                    <div class="gauge-seg s1" :style="{ width: formatPercent(battle.topItems[0]?.votePercentage) + '%' }"></div>
                    <div v-if="battle.topItems[1]" class="gauge-seg s2" :style="{ width: formatPercent(battle.topItems[1]?.votePercentage) + '%' }"></div>
                    <div class="gauge-seg s3" :style="{ width: getEtcPercent(battle.topItems) + '%' }"></div>
                  </div>
                  <div class="gauge-labels">
                    <span class="gauge-label gl1"><span class="dot"></span>{{ truncateName(battle.topItems[0]?.displayName) }}</span>
                    <span v-if="battle.topItems[1]" class="gauge-label gl2"><span class="dot"></span>{{ truncateName(battle.topItems[1]?.displayName) }}</span>
                    <span class="gauge-label gl3"><span class="dot"></span>etc</span>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </section>

        <!-- 실시간 제품 랭킹 섹션 (버블 차트) -->
        <section class="content-section ranking-section">
          <div class="section-header">
            <div class="title-with-badge">
              <h2 class="section-title">실시간 제품 랭킹</h2>
              <div class="sub-title-row">
                <span class="sub-title">지금 가장 주목받는 아이템</span>
                <span class="sort-indicator">
                  <span class="sort-dot" style="width:12px;height:12px;background:#7c3aed;"></span>
                  <span class="sort-dot" style="width:9px;height:9px;background:#a78bfa;"></span>
                  <span class="sort-dot" style="width:6px;height:6px;background:#c4b5fd;"></span>
                  <span class="sort-label">크면 인기 많은 제품</span>
                </span>
              </div>
            </div>
            <div class="header-right-group">
              <router-link :to="{ name: 'ProductRanking' }" class="view-all-btn">
                전체보기
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </router-link>
            </div>
          </div>

          <div v-if="productsLoading" class="dash-bubble-wrapper">
            <div class="skeleton" style="width:100%;height:320px;border-radius:12px;"></div>
          </div>

          <div v-else-if="hotProducts.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <p class="empty-text">등록된 제품이 없습니다</p>
          </div>

          <div v-else class="dash-bubble-wrapper">
            <div
              ref="bubbleContainerRef"
              class="dash-bubble-area"
              :style="{ height: bubbleDims.h + 'px' }"
              @mousemove="handleBubbleMouseMove"
              @mouseleave="bubbleHovered = null"
            >
              <!-- 그리드 배경 -->
              <svg class="dash-grid-bg">
                <defs>
                  <pattern id="dashBgGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" stroke-width="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dashBgGrid)"/>
              </svg>

              <!-- 버블 -->
              <router-link
                v-for="(product, i) in dashBubbleProducts"
                :key="product.id"
                :to="{ name: 'ProductDetail', params: { id: product.id } }"
                class="dash-bubble"
                :class="{
                  'is-hovered': bubbleHovered === product.id,
                  'is-dimmed': bubbleHovered && bubbleHovered !== product.id,
                  'has-image': !!getProductThumbnail(product)
                }"
                :style="getDashBubbleStyle(i)"
                @mouseenter="bubbleHovered = product.id"
                @mouseleave="bubbleHovered = null"
              >
                <!-- 배경 이미지 -->
                <img v-if="getProductThumbnail(product)" :src="getProductThumbnail(product)" alt="" class="dash-bubble-bg-image" @error="handleImageError" />
                <div v-if="getProductThumbnail(product)" class="dash-bubble-overlay"></div>

                <span v-if="dashBubbleNodes[i]?.r > dashRadiusBounds.min * 1.3" class="dash-bubble-name" :style="{ fontSize: Math.max(9, dashBubbleNodes[i].r * 0.14) + 'px', color: getProductThumbnail(product) || i < 3 ? '#fff' : i < 6 ? '#3b1a6e' : '#4a3560', maxWidth: dashBubbleNodes[i].r * 1.4 + 'px' }">{{ product.name }}</span>
                <span v-if="dashBubbleNodes[i]?.r > dashRadiusBounds.min * 1.6" class="dash-bubble-brand" :style="{ fontSize: Math.max(8, dashBubbleNodes[i].r * 0.11) + 'px', color: getProductThumbnail(product) || i < 3 ? 'rgba(255,255,255,0.85)' : 'rgba(90,60,120,0.7)' }">{{ product.brand }}</span>

                <!-- Top 3 뱃지 -->
                <div v-if="i < 3" class="dash-rank-badge-top" :class="'rank-' + (i + 1)" :style="{ fontSize: Math.max(8, dashBubbleNodes[i].r * 0.12) + 'px' }">{{ i + 1 }}</div>
                <!-- 4위 이하 뱃지 -->
                <div v-else class="dash-rank-badge-sm" :style="{ width: Math.max(14, dashBubbleNodes[i].r * 0.24) + 'px', height: Math.max(14, dashBubbleNodes[i].r * 0.24) + 'px', fontSize: Math.max(7, dashBubbleNodes[i].r * 0.12) + 'px' }">{{ i + 1 }}</div>
              </router-link>

              <!-- 툴팁 -->
              <div v-if="bubbleTooltipProduct" class="dash-bubble-tooltip" :style="bubbleTooltipStyle">
                <div class="dash-tooltip-header">
                  <span class="dash-tooltip-name">{{ bubbleTooltipProduct.name }}</span>
                  <span class="dash-tooltip-rank">#{{ hotProducts.indexOf(bubbleTooltipProduct) + 1 }}</span>
                </div>
                <span class="dash-tooltip-brand">{{ bubbleTooltipProduct.brand }}</span>
                <div class="dash-tooltip-metrics">
                  <div class="dash-tooltip-metric">
                    <div class="dash-metric-label">평점</div>
                    <div class="dash-metric-value"><svg class="dash-star-icon" width="14" height="14" viewBox="0 0 14 14" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1.16666L8.795 4.81249L12.8333 5.40166L9.91667 8.24916L10.59 12.2717L7 10.3792L3.41 12.2717L4.08333 8.24916L1.16667 5.40166L5.205 4.81249L7 1.16666Z"/></svg> {{ bubbleTooltipProduct.averageRating ? Number(bubbleTooltipProduct.averageRating).toFixed(1) : '0.0' }}</div>
                  </div>
                  <div class="dash-tooltip-metric">
                    <div class="dash-metric-label">피드</div>
                    <div class="dash-metric-value">{{ formatNumber(bubbleTooltipProduct.reviewCount || 0) }}개</div>
                  </div>
                  <div class="dash-tooltip-metric">
                    <div class="dash-metric-label">관심도</div>
                    <div class="dash-metric-value purple">{{ Number(getProductPopularityScore(bubbleTooltipProduct)).toFixed(2) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'
import { feedService } from '@/services/FeedService'
import { battleService } from '@/services/BattleService'
import { productService } from '@/services/ProductService'
import { dashboardService } from '@/services/DashboardService'

const hotFeeds = ref([])
const hotBattles = ref([])
const hotProducts = ref([])


// 대시보드 요약 통계
const dashboardSummary = ref({
  activeBattleCount: 0,
  totalItemCount: 0,
  popularFeedCount: 0,
})
const summaryLoading = ref(true)


// ==================== 버블 차트 관련 ====================
const dashBubbleLimit = computed(() => bubbleDims.value.w < 600 ? 10 : 20)

const bubbleContainerRef = ref(null)
const bubbleDims = ref({ w: 0, h: 0 })
const bubbleHovered = ref(null)
const bubbleMousePos = ref({ x: 0, y: 0 })
let bubbleResizeObserver = null

function calcDashRadiusBounds(count, W, H) {
  const area = W * H
  if (count <= 0 || !area) return { min: 28, max: 110 }
  const maxR = Math.min(W, H) * (count === 1 ? 0.4 : count <= 3 ? 0.3 : 0.25)
  const minR = Math.max(20, maxR * 0.25)
  return { min: Math.round(minR), max: Math.round(Math.min(maxR, Math.min(W, H) * 0.45)) }
}

function getDashRadius(score, maxScore, minR, maxR) {
  if (!maxScore) return minR
  return minR + (maxR - minR) * Math.sqrt(score / maxScore)
}

function getDashRankColor(rank, total) {
  if (rank === 1) return { bg: '#7c3aed', border: '#7c3aed', glow: 'rgba(124,58,237,0.12)' }
  if (rank === 2) return { bg: '#6366f1', border: '#6366f1', glow: 'rgba(99,102,241,0.1)' }
  if (rank === 3) return { bg: '#8b5cf6', border: '#8b5cf6', glow: 'rgba(139,92,246,0.1)' }
  const n = Math.max(total || 20, 5)
  const t = Math.min((rank - 4) / (n - 4), 1)
  const r = Math.round(168 + t * (229 - 168))
  const g = Math.round(139 + t * (231 - 139))
  const b = Math.round(250 + t * (235 - 250))
  const bg = `rgb(${r},${g},${b})`
  const borderAlpha = 0.4 - t * 0.2
  return { bg, border: `rgba(139,92,246,${borderAlpha})`, glow: `rgba(139,92,246,${0.08 - t * 0.05})` }
}

function computeBubbleLayout(nodeList, W, H) {
  if (!nodeList.length || !W || !H) return []
  const cx = W / 2, cy = H / 2
  const n = nodeList.length

  if (n === 1) return [{ x: cx, y: cy }]

  const pos = nodeList.map((nd, i) => {
    const angle = (i / n) * Math.PI * 2
    const spread = n <= 5 ? 0.2 : 0.4
    const dist = 30 + Math.min(cx, cy) * spread * (i / n)
    return { x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, vx: 0, vy: 0, r: nd.r }
  })

  const gap = n <= 5 ? 4 : 6
  const centerPull = n <= 5 ? 0.015 : 0.01

  for (let tick = 0; tick < 300; tick++) {
    const alpha = Math.max(0.001, 1 - tick / 300)
    for (let i = 0; i < pos.length; i++) {
      const dx = cx - pos[i].x, dy = cy - pos[i].y
      const pull = centerPull * alpha * (i < 3 ? 1.8 : 0.3)
      pos[i].vx += dx * pull; pos[i].vy += dy * pull
      for (let j = i + 1; j < pos.length; j++) {
        const ddx = pos[i].x - pos[j].x, ddy = pos[i].y - pos[j].y
        const d = Math.sqrt(ddx * ddx + ddy * ddy) || 1
        const minD = pos[i].r + pos[j].r + gap
        if (d < minD) {
          const f = (minD - d) / d * 0.3
          pos[i].vx += ddx * f; pos[i].vy += ddy * f
          pos[j].vx -= ddx * f; pos[j].vy -= ddy * f
        }
      }
      pos[i].vx *= 0.7; pos[i].vy *= 0.7
      pos[i].x += pos[i].vx; pos[i].y += pos[i].vy
      const pad = pos[i].r + 2
      pos[i].x = Math.max(pad, Math.min(W - pad, pos[i].x))
      pos[i].y = Math.max(pad, Math.min(H - pad, pos[i].y))
    }
  }
  return pos.map(p => ({ x: p.x, y: p.y }))
}

const dashBubbleProducts = computed(() => {
  const sorted = [...hotProducts.value].sort((a, b) => getProductPopularityScore(b) - getProductPopularityScore(a))
  return sorted.slice(0, dashBubbleLimit.value)
})

const dashMaxScore = computed(() => getProductPopularityScore(dashBubbleProducts.value[0]) || 1)

const dashRadiusBounds = computed(() =>
  calcDashRadiusBounds(dashBubbleProducts.value.length, bubbleDims.value.w, bubbleDims.value.h)
)

const dashBubbleNodes = computed(() => {
  const { min, max } = dashRadiusBounds.value
  return dashBubbleProducts.value.map(p => ({ id: p.id, r: getDashRadius(getProductPopularityScore(p), dashMaxScore.value, min, max) }))
})

const dashBubblePositions = computed(() => computeBubbleLayout(dashBubbleNodes.value, bubbleDims.value.w, bubbleDims.value.h))

const bubbleTooltipProduct = computed(() => {
  if (!bubbleHovered.value) return null
  return hotProducts.value.find(p => p.id === bubbleHovered.value) || null
})

const bubbleTooltipStyle = computed(() => {
  if (!bubbleTooltipProduct.value) return {}
  const W = 240
  let left = bubbleMousePos.value.x - W / 2
  let top = bubbleMousePos.value.y - 140
  if (top < 0) top = bubbleMousePos.value.y + 10
  if (left < 0) left = 4
  if (left + W > bubbleDims.value.w) left = bubbleDims.value.w - W - 4
  return { left: left + 'px', top: top + 'px', width: W + 'px' }
})

function getDashBubbleStyle(i) {
  if (!dashBubblePositions.value[i] || !dashBubbleNodes.value[i]) return { display: 'none' }
  const pos = dashBubblePositions.value[i]
  const r = dashBubbleNodes.value[i].r
  const rank = i + 1
  const total = dashBubbleProducts.value.length
  const colors = getDashRankColor(rank, total)
  const product = dashBubbleProducts.value[i]
  const isHov = bubbleHovered.value === product?.id
  const hasImage = !!getProductThumbnail(product)

  return {
    left: (pos.x - r) + 'px',
    top: (pos.y - r) + 'px',
    width: (r * 2) + 'px',
    height: (r * 2) + 'px',
    background: hasImage ? '#000' : colors.bg,
    borderColor: isHov ? '#7c3aed' : colors.border,
    boxShadow: isHov ? `0 8px 32px ${colors.glow}, 0 0 0 4px rgba(124,58,237,0.1)`
      : `0 4px 16px ${colors.glow}`,
    zIndex: isHov ? 50 : rank <= 3 ? 10 : 1,
    textDecoration: 'none'
  }
}

function handleBubbleMouseMove(e) {
  if (!bubbleContainerRef.value) return
  const rect = bubbleContainerRef.value.getBoundingClientRect()
  bubbleMousePos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function initBubbleContainer() {
  if (!bubbleContainerRef.value) return
  const rect = bubbleContainerRef.value.getBoundingClientRect()
  bubbleDims.value = { w: rect.width, h: Math.max(500, Math.min(700, rect.width * 0.75)) }

  bubbleResizeObserver = new ResizeObserver(entries => {
    const entry = entries[0]
    if (entry) {
      const w = entry.contentRect.width
      bubbleDims.value = { w, h: Math.max(500, Math.min(700, w * 0.75)) }
    }
  })
  bubbleResizeObserver.observe(bubbleContainerRef.value)
}

watch(() => hotProducts.value.length, (len) => {
  if (len > 0) {
    nextTick(() => initBubbleContainer())
  }
})

const yogurtBomFeeds = ref([])
const lastUpdateTime = ref('')
const ybCurrentPage = ref(0)
const ybSwipeRef = ref(null)
let ybAutoSlideTimer = null

// 캐시 관리 (5분 유효)
const CACHE_DURATION = 5 * 60 * 1000
let yogurtBomCache = {
  data: null,
  timestamp: 0,
  updateTime: ''
}

const currentYogurtBomFeeds = computed(() => {
  const start = ybCurrentPage.value * 6
  return yogurtBomFeeds.value.slice(start, start + 6)
})

const ybPages = computed(() => {
  const pages = []
  for (let i = 0; i < yogurtBomFeeds.value.length; i += 6) {
    pages.push(yogurtBomFeeds.value.slice(i, i + 6))
  }
  return pages
})

const setYbPage = (page) => {
  ybCurrentPage.value = page
  if (ybSwipeRef.value) {
    const pageWidth = ybSwipeRef.value.offsetWidth
    ybSwipeRef.value.scrollTo({ left: page * pageWidth, behavior: 'smooth' })
  }
  resetYbAutoSlide()
}

let ybSwipeTimeout = null
const onYbSwipe = () => {
  if (!ybSwipeRef.value) return
  if (ybSwipeTimeout) clearTimeout(ybSwipeTimeout)
  ybSwipeTimeout = setTimeout(() => {
    const container = ybSwipeRef.value
    if (!container) return
    const pageWidth = container.offsetWidth
    const page = Math.round(container.scrollLeft / pageWidth)
    if (page !== ybCurrentPage.value) {
      ybCurrentPage.value = page
      resetYbAutoSlide()
    }
  }, 50)
}

const resetYbAutoSlide = () => {
  if (ybAutoSlideTimer) {
    clearInterval(ybAutoSlideTimer)
  }
  ybAutoSlideTimer = setInterval(() => {
    const nextPage = ybCurrentPage.value === 0 ? 1 : 0
    ybCurrentPage.value = nextPage
    if (ybSwipeRef.value) {
      const pageWidth = ybSwipeRef.value.offsetWidth
      ybSwipeRef.value.scrollTo({ left: nextPage * pageWidth, behavior: 'smooth' })
    }
  }, 5000)
}

const feedsLoading = ref(true)
const yogurtBomLoading = ref(true)
const battlesLoading = ref(true)
const productsLoading = ref(true)


const loadDashboardSummary = async () => {
  summaryLoading.value = true
  try {
    const response = await dashboardService.getSummary()
    if (response.success && response.data) {
      dashboardSummary.value = {
        activeBattleCount: response.data.activeBattleCount ?? 0,
        totalItemCount: response.data.totalItemCount ?? 0,
        popularFeedCount: response.data.popularFeedCount ?? 0,
      }
    }
  } catch (error) {
    console.error('대시보드 요약 로드 실패:', error)
  } finally {
    summaryLoading.value = false
  }
}

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

const loadHotBattles = async () => {
  battlesLoading.value = true
  try {
    const response = await battleService.getHotBattleList()
    if (response.success) {
      hotBattles.value = response.data || []
    }
  } catch (error) {
    console.error('배틀 로드 실패:', error)
  } finally {
    battlesLoading.value = false
  }
}

const loadHotProducts = async () => {
  productsLoading.value = true
  try {
    console.log('📦 [DASHBOARD] 제품 조회 시작')
    const response = await productService.getProducts({ status: 'APPROVED' }, { size: 20, sort: 'popularityScore,DESC' })
    console.log('📦 [DASHBOARD] 제품 응답:', response)
    if (response.success) {
      hotProducts.value = response.data?.content || response.data || []
      console.log('📦 [DASHBOARD] 제품 로드 완료:', hotProducts.value.length, '개')
    } else {
      console.warn('📦 [DASHBOARD] 제품 응답 실패:', response)
    }
  } catch (error) {
    console.error('📦 [DASHBOARD] 제품 로드 실패:', error)
  } finally {
    productsLoading.value = false
  }
}


const loadYogurtBomFeeds = async (forceRefresh = false) => {
  // 캐시가 유효하면 캐시 데이터 사용
  const now = Date.now()
  if (!forceRefresh && yogurtBomCache.data && (now - yogurtBomCache.timestamp < CACHE_DURATION)) {
    yogurtBomFeeds.value = yogurtBomCache.data
    lastUpdateTime.value = yogurtBomCache.updateTime
    yogurtBomLoading.value = false
    return
  }

  yogurtBomLoading.value = true
  try {
    const response = await feedService.getHotFeeds({ size: 12, sort: 'viewCount,desc' })
    if (response.success) {
      const feeds = response.data?.content || response.data || []
      yogurtBomFeeds.value = feeds

      // 업데이트 시간 설정 (YYYY.MM.DD (요일) HH:00) - 매시간 정각
      const date = new Date()
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const dayNames = ['일', '월', '화', '수', '목', '금', '토']
      const dayName = dayNames[date.getDay()]
      const hours = date.getHours().toString().padStart(2, '0')
      const updateTimeStr = `${year}.${month}.${day} (${dayName}) ${hours}:00`
      lastUpdateTime.value = updateTimeStr

      // 캐시 저장
      yogurtBomCache = {
        data: feeds,
        timestamp: now,
        updateTime: updateTimeStr
      }
    }
  } catch (error) {
    console.error('요거 봄 피드 로드 실패:', error)
  } finally {
    yogurtBomLoading.value = false
  }
}

const isNewFeed = (feed) => {
  if (!feed.createdAt) return false
  let createdAt
  if (Array.isArray(feed.createdAt)) {
    // LocalDateTime 배열 형식: [year, month, day, hour, minute, second]
    const [y, m, d, h = 0, min = 0, s = 0] = feed.createdAt
    createdAt = new Date(y, m - 1, d, h, min, s)
  } else {
    // "2026-02-08 14:00:33" 또는 "2026-02-08T14:00:33" 형식
    const dateStr = feed.createdAt.replace(' ', 'T')
    createdAt = new Date(dateStr)
  }
  if (isNaN(createdAt.getTime())) return false
  // KST 기준 현재시간으로부터 24시간 이내면 NEW
  const now = new Date()
  const diffHours = (now - createdAt) / (1000 * 60 * 60)
  return diffHours < 24
}

const isHotFeed = (feed) => {
  return hotFeeds.value.some(hotFeed => hotFeed.feedId === feed.feedId)
}

let refreshTimer = null

const formatNumber = (num) => {
  if (!num || num === 0) return '0'
  if (num >= 10000) return Math.floor(num / 10000) + '만'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatPercent = (votePercentage) => {
  if (!votePercentage) return 0
  return Math.round(votePercentage * 100)
}

const getEtcPercent = (topItems) => {
  if (!topItems || topItems.length === 0) return 0
  const first = topItems[0]?.votePercentage || 0
  const second = topItems[1]?.votePercentage || 0
  return Math.max(0, Math.round((1 - first - second) * 100))
}

const getDdayText = (endDate) => {
  if (!endDate) return '진행중'
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return '종료'
  if (diffDays === 0) return 'D-Day'
  return `D-${diffDays}`
}

const truncateName = (name, maxLength = 10) => {
  if (!name) return '-'
  return name.length > maxLength ? name.slice(0, maxLength) + '...' : name
}

const formatPrice = (price) => {
  if (!price) return ''
  return price.toLocaleString() + '원'
}

const getThumbnailUrl = (feed) => {
  return feed.thumbnailUrl?.fileUrl || feed.hotFeedThumbnailDto?.fileUrl || null
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const getProductThumbnail = (product) => {
  return product.thumbnailUrl || product.thumbnailDto?.fileUrl || 'https://placehold.co/56x56?text=No+Image'
}

const getProductPopularityScore = (product) => {
  if (!product) return 0
  if (product.popularityScore) return product.popularityScore
  return (product.viewCount || 0) + ((product.likeCount || 0) * 3) + ((product.reviewCount || 0) * 2)
}

const topTrendName = computed(() => {
  if (hotFeeds.value.length > 0) return hotFeeds.value[0].productName || '인기 피드'
  if (hotProducts.value.length > 0) return hotProducts.value[0].name || '인기 제품'
  return '트렌드'
})


onMounted(() => {
  loadDashboardSummary()
  loadHotFeeds()
  loadHotBattles()
  loadHotProducts()
  loadYogurtBomFeeds()

  // 요거 봄 자동 슬라이드 시작
  resetYbAutoSlide()

  refreshTimer = setInterval(() => {
    loadYogurtBomFeeds()
  }, 30000)

})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
  if (ybAutoSlideTimer) {
    clearInterval(ybAutoSlideTimer)
    ybAutoSlideTimer = null
  }
  if (ybSwipeTimeout) {
    clearTimeout(ybSwipeTimeout)
    ybSwipeTimeout = null
  }
  if (bubbleResizeObserver) {
    bubbleResizeObserver.disconnect()
    bubbleResizeObserver = null
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  background: #ffffff;
  min-height: 100vh;
  color: #1a1a1a;
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
  padding-bottom: 5rem;
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

/* 페이지 헤더 */
.page-header {
  padding: 1rem 0 0.625rem;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.375rem;
  font-weight: 800;
  color: #9333ea;
  margin: 0;
  letter-spacing: -0.03em;
}

.title-icon {
  color: #9333ea;
  flex-shrink: 0;
}

.title-accent {
  color: #1a1a1a;
}

@media (min-width: 768px) {
  .page-title { font-size: 1.5rem; }
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
  box-shadow: 0 8px 24px rgba(147, 51, 234, 0.08);
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
  background: #fff;
  border: 1px solid #f0f0f0;
  transition: border-color 0.2s;
}

.glass-banner:hover .banner-inner {
  border-color: #e9d5ff;
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
  background: #fef2f2;
  color: #dc2626;
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
  background: #ef4444;
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
  color: #1c1917;
  margin: 0;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-title strong {
  font-weight: 700;
  color: #1c1917;
}

.banner-sub {
  font-size: 0.75rem;
  color: #a8a29e;
  margin: 0;
  font-weight: 400;
}

.banner-action {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a3a3a3;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.glass-banner:hover .banner-action {
  background: #f3e8ff;
  color: #9333ea;
}

/* 통계 그리드 (컴팩트) */
.stats-grid {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  padding: 0.625rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #f0f0f0;
  position: relative;
  text-decoration: none;
}

.stat-card:hover {
  border-color: #e9d5ff;
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.08);
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.feeds { background: #fff5f5; color: #e53e3e; }
.stat-icon.battles { background: #fffaf0; color: #dd6b20; }
.stat-icon.products { background: #f0fff4; color: #38a169; }

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  display: block;
  font-size: 1.125rem;
  font-weight: 700;
  color: #7c3aed;
  line-height: 1.2;
}

.stat-label {
  display: block;
  font-size: 0.6875rem;
  color: #999;
  margin-top: 1px;
}

.live-dot {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 8px;
  height: 8px;
  background: #e53e3e;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

/* ===== 실시간 요거 봄 섹션 ===== */
.yogurt-bom-section {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 0.625rem;
  border: 1px solid #f0f0f0;
  position: relative;
  overflow: hidden;
  gap: 1rem;
}

/* ===== LEFT ===== */
.yb-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  min-width: 100px;
  padding: 0.75rem 1rem 0.75rem 0;
  border-right: 1px solid rgba(255, 220, 100, 0.25);
  background: rgba(255, 248, 225, 0.55);
  margin: -1rem 0 -1rem -1.25rem;
  padding-left: 1.25rem;
}

.yb-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 180, 0, 0.15);
  color: #B8860B;
  font-size: 0.625rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 100px;
  width: fit-content;
  letter-spacing: 0.03em;
}

.pulse-dot {
  width: 5px;
  height: 5px;
  background: #DAA520;
  border-radius: 50%;
  animation: yb-pulse 1.5s infinite;
}

@keyframes yb-pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(218, 165, 32, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(218, 165, 32, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(218, 165, 32, 0); }
}

.yb-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.yb-main-title {
  font-size: 1rem;
  font-weight: 700;
  color: #8B6914;
  line-height: 1.25;
  margin: 0;
}

.yb-update-time {
  font-size: 0.625rem;
  color: #999;
}

/* ===== RIGHT ===== */
.yb-right {
  flex: 1;
  min-width: 0;
}

.yb-swipe-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.yb-swipe-container::-webkit-scrollbar {
  display: none;
}

.yb-swipe-page {
  flex: 0 0 100%;
  min-width: 0;
  scroll-snap-align: start;
}

/* ===== 그리드 & 아이템 ===== */
.yb-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.25rem 0.75rem;
}

.yb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.15s ease;
  min-width: 0;
  overflow: hidden;
}

.yb-item:hover {
  background: #faf5ff;
}

.yb-rank-badge {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 800;
  flex-shrink: 0;
  background: #f5f5f5;
  color: #999;
}

.yb-rank-badge.rank-1 {
  background: #9333ea;
  color: #fff;
}

.yb-rank-badge.rank-2 {
  background: #a855f7;
  color: #fff;
}

.yb-rank-badge.rank-3 {
  background: #c4b5fd;
  color: #fff;
}

.yb-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.yb-product {
  font-size: 0.875rem;
  font-weight: 700;
  color: #111;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.yb-author-name {
  font-size: 0.6875rem;
  color: #bbb;
}

.yb-tag-group {
  display: flex;
  gap: 2px;
}

.yb-tag {
  font-size: 0.5625rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
  flex-shrink: 0;
}

.yb-tag.hot {
  background: #fef2f2;
  color: #ef4444;
}

.yb-tag.new {
  background: #f3e8ff;
  color: #9333ea;
}

/* 요거 봄 스켈레톤 */
.yb-item.skeleton-item {
  background: transparent;
}

.yb-sk-rank {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.yb-sk-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.yb-sk-line {
  height: 14px;
  border-radius: 4px;
  width: 60%;
}

.yb-sk-line.short {
  width: 30%;
  height: 12px;
}

/* ===== 페이지네이션 ===== */
.yb-pagination {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 5px;
  padding-top: 0.5rem;
}

.yb-page-btn {
  width: 6px;
  height: 6px;
  background: #e5e7eb;
  border: none;
  border-radius: 10px;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 0;
}

.yb-page-btn:hover {
  background: #c4b5fd;
}

.yb-page-btn.active {
  width: 16px;
  background: #9333ea;
}

/* 요거 봄 빈 상태 */
.empty-state.compact {
  padding: 1.5rem 1rem;
  background: #fafafa;
  border-radius: 10px;
}

/* 대시보드 콘텐츠 */
.dashboard-content {
  max-width: 1200px;
}

/* 섹션 */
.content-section {
  background: #fff;
  border-radius: 14px;
  padding: 1rem;
  margin-bottom: 0.625rem;
  border: 1px solid #f0f0f0;
}

@media (min-width: 768px) {
  .content-section {
    padding: 1.25rem;
    margin-bottom: 0.75rem;
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
  margin-bottom: 0.75rem;
}

.title-with-badge {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  padding-left: 10px;
  border-left: 3px solid #9333ea;
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
  color: #999;
  padding-left: 13px;
}

.sub-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: #f5f0ff;
  border: 1px solid #ede5ff;
  border-radius: 12px;
  white-space: nowrap;
}

.sort-dot {
  border-radius: 50%;
  flex-shrink: 0;
}

.sort-label {
  font-size: 11px;
  font-weight: 500;
  color: #8b5cf6;
  margin-left: 2px;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #999;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.view-all-btn:hover {
  background: #faf5ff;
  color: #9333ea;
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

/* 핫 피드 섹션 */
.hot-feeds-section {
  margin-bottom: 0.75rem !important;
}

.view-all-link {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0.375rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #999;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.view-all-link:hover {
  background: #faf5ff;
  color: #9333ea;
}

/* 가로 스크롤 영역 */
.dashboard-feed-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 6px 4px 14px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.dashboard-feed-scroll::-webkit-scrollbar {
  display: none;
}

/* 카드 디자인 */
.dash-feed-card {
  flex: 0 0 160px;
  height: 230px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;
}

@media (min-width: 640px) {
  .dash-feed-card {
    flex: 0 0 180px;
    height: 250px;
  }
}

@media (min-width: 1280px) {
  .dash-feed-card {
    flex: 0 0 200px;
    height: 280px;
  }
}

.dash-feed-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 30px rgba(124, 58, 237, 0.15);
}

.card-visual-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.card-visual-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.dash-feed-card:hover .card-visual-wrapper img {
  transform: scale(1.05);
}

/* 럭셔리 그라데이션 오버레이 */
.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.3) 0%,
    transparent 40%,
    rgba(0,0,0,0.85) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px;
}

@media (min-width: 640px) {
  .card-overlay {
    padding: 16px;
  }
}

.overlay-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.rank-num {
  font-size: 24px;
  font-weight: 900;
  color: rgba(255,255,255,0.35);
  font-style: italic;
  line-height: 1;
}

@media (min-width: 640px) {
  .rank-num {
    font-size: 26px;
  }
}

@media (min-width: 1280px) {
  .rank-num {
    font-size: 30px;
  }
}

.trending-tag {
  background: rgba(251, 113, 133, 0.85);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  letter-spacing: 0.3px;
}

.overlay-bottom {
  color: #fff;
}

.eval-pill {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  margin-bottom: 6px;
  backdrop-filter: blur(4px);
}

.eval-pill.best {
  background: rgba(251, 191, 36, 0.85);
  color: #fff;
}

.eval-pill.good {
  background: rgba(34, 197, 94, 0.8);
  color: #fff;
}

.eval-pill.okay {
  background: rgba(139, 92, 246, 0.8);
  color: #fff;
}

.eval-pill.bad {
  background: rgba(239, 68, 68, 0.8);
  color: #fff;
}

.review-main {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (min-width: 640px) {
  .review-main {
    font-size: 15px;
  }
}

@media (min-width: 1280px) {
  .review-main {
    font-size: 16px;
  }
}

.product-name-sub {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255,255,255,0.6);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 스켈레톤 */
.dash-card-skeleton {
  flex: 0 0 160px;
  height: 230px;
  border-radius: 20px;
}

@media (min-width: 640px) {
  .dash-card-skeleton {
    flex: 0 0 180px;
    height: 250px;
  }
}

@media (min-width: 1280px) {
  .dash-card-skeleton {
    flex: 0 0 200px;
    height: 280px;
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
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.feed-card:hover {
  border-color: #ddd;
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
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 4px;
  font-size: 0.5625rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  font-weight: 600;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-info .time {
  display: block;
  font-size: 0.625rem;
  color: #999;
}

/* 카드 이미지 */
.feed-card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
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
  color: #ccc;
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
  font-weight: 800;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.eval-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.eval-badge.best { background-color: #fef3c7; color: #92400e; }
.eval-badge.best .eval-dot { background-color: #f59e0b; }

.eval-badge.good { background-color: #dcfce7; color: #166534; }
.eval-badge.good .eval-dot { background-color: #10b981; }

.eval-badge.okay { background-color: #f3e8ff; color: #6b21a8; }
.eval-badge.okay .eval-dot { background-color: #9333ea; }

.eval-badge.bad { background-color: #fee2e2; color: #991b1b; }
.eval-badge.bad .eval-dot { background-color: #ef4444; }

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
  color: #1f2937;
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
  background: #f8f8fa;
  border-radius: 8px;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.category-tag {
  display: inline-block;
  font-size: 9px;
  font-weight: 800;
  color: #9333ea;
  text-transform: uppercase;
  margin-bottom: 1px;
}

.product-name {
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price {
  font-size: 12px;
  font-weight: 800;
  color: #9333ea;
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
  font-weight: 500;
  color: #999;
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
  font-weight: 600;
  color: #b0b0b0;
}

/* 카드 콘텐츠 (레거시) */
.feed-card-content {
  padding: 0.625rem 0.75rem 0.5rem;
}

.content-text {
  font-size: 0.75rem;
  color: #444;
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
  border-top: 1px solid #f5f5f5;
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
  color: #888;
}

.stat svg {
  color: #bbb;
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

/* ===== 배틀 핫 카드 ===== */
.battle-hot-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 640px) {
  .battle-hot-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .battle-hot-grid { grid-template-columns: repeat(3, 1fr); }
}

.battle-hot-card {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e8eaf4;
  box-shadow: 0 2px 16px rgba(100, 100, 180, 0.07);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  text-decoration: none;
  display: block;
}
.battle-hot-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 36px rgba(124, 110, 245, 0.13), 0 2px 8px rgba(0,0,0,0.04);
}

/* 썸네일 */
.battle-hot-thumb {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: linear-gradient(135deg, #c9b8f5 0%, #a78bfa 45%, #818cf8 100%);
}
.battle-hot-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.battle-hot-thumb .thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  font-weight: 500;
}
.thumb-line {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.thumb-line::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  left: 50%;
  width: 1px;
  background: linear-gradient(180deg, transparent 5%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.25) 60%, transparent 95%);
  transform: translateX(-50%);
}
.thumb-vs {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.thumb-vs-pill {
  background: rgba(255,255,255,0.22);
  border: 1.5px solid rgba(255,255,255,0.45);
  border-radius: 50px;
  padding: 6px 16px;
  font-size: 17px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 3px;
  text-shadow: 0 1px 8px rgba(0,0,0,0.18);
}
.badge-dday {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(255,255,255,0.7);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  color: #6d5dfc;
  font-size: 11.5px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.dday-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #f87171;
  animation: pulse 1.6s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.65); }
}

/* 바디 */
.battle-hot-body {
  padding: 14px 18px 20px;
  overflow: hidden;
}
.battle-hot-category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
}
.battle-hot-category {
  font-size: 10.5px;
  color: #c0c4d8;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.battle-hot-stats {
  display: flex;
  align-items: center;
  gap: 10px;
}
.battle-hot-stat {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #c8cce0;
}
.battle-hot-stat svg { stroke: #c8cce0; }
.battle-hot-title {
  font-size: 14.5px;
  font-weight: 800;
  color: #1a1d2e;
  margin-bottom: 5px;
  line-height: 1.45;
}
.battle-hot-meta {
  font-size: 11px;
  color: #d0d4e8;
  margin-bottom: 15px;
}

/* 디바이더 */
.battle-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 13px;
}
.battle-divider::before,
.battle-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #eff0f8;
}
.battle-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #b8bdd6;
  white-space: nowrap;
  text-transform: uppercase;
}

/* 순위 */
.rank-item { margin-bottom: 14px; }
.rank-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  gap: 8px;
}
.rank-left {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  gap: 8px;
}
.rank-badge {
  width: 22px;
  min-width: 22px;
  height: 22px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
  position: relative;
}
.rank-badge.r1 {
  background: linear-gradient(135deg, #fde68a, #fbbf24);
  color: #92400e;
  box-shadow: 0 2px 8px rgba(251,191,36,0.3);
}
.rank-badge.r2 {
  background: #f3f4f8;
  color: #9098b8;
}
.rank-name {
  font-size: 12px;
  font-weight: 600;
  color: #9098b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  margin-left: 4px;
}
.rank-item.r1-item .rank-name {
  color: #3d4270;
  font-weight: 700;
}
.rank-pct {
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}
.rank-pct.p1 { color: #7c6ef5; }
.rank-pct.p2 { color: #c8cce0; }

/* 게이지 바 */
.battle-gauge-wrap { margin-top: 13px; }
.battle-gauge-track {
  display: flex;
  width: 100%;
  height: 7px;
  border-radius: 99px;
  overflow: hidden;
  background: #f3f4f8;
  gap: 2px;
}
.gauge-seg {
  height: 100%;
  transition: width 1s cubic-bezier(0.4,0,0.2,1);
  flex-shrink: 0;
}
.gauge-seg.s1 {
  background: #a78bfa;
  border-radius: 99px 0 0 99px;
}
.gauge-seg.s2 { background: #fb7185; }
.gauge-seg.s3 {
  background: #e2e5f0;
  border-radius: 0 99px 99px 0;
}
.gauge-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  gap: 4px;
}
.gauge-label {
  font-size: 10px;
  font-weight: 600;
  color: #c8cce0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
}
.gauge-label .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.gauge-label.gl1 { flex: 1; }
.gauge-label.gl1 .dot { background: #a78bfa; }
.gauge-label.gl2 { flex: 1; justify-content: center; }
.gauge-label.gl2 .dot { background: #fb7185; }
.gauge-label.gl3 { flex: 1; justify-content: flex-end; }
.gauge-label.gl3 .dot { background: #d0d4e8; }

/* 스켈레톤 */
.battle-hot-card.skeleton-card .battle-hot-thumb {
  background: #e5e7eb;
}

/* 제품 랭킹 섹션 - 버블 차트 */
/* ========================================
   제품 랭킹 - 버블 차트
   ======================================== */
.ranking-section {
  background: #fff;
}

.dash-bubble-wrapper {
  position: relative;
}

.dash-bubble-area {
  position: relative;
  width: 100%;
  min-height: 320px;
  background: #fafafa;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  cursor: default;
  box-shadow: none;
}

.dash-grid-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.2;
}

/* 버블 */
.dash-bubble {
  position: absolute;
  border-radius: 50%;
  border: 2.5px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  text-decoration: none;
}
.dash-bubble:hover {
  transform: scale(1.08);
  z-index: 20 !important;
}
.dash-bubble.is-dimmed {
  filter: brightness(0.6) saturate(0.2);
  opacity: 0.7;
}

/* 버블 배경 이미지 */
.dash-bubble-bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  z-index: 0;
}
.dash-bubble-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1;
}
.dash-bubble.has-image .dash-bubble-name,
.dash-bubble.has-image .dash-bubble-brand {
  position: relative;
  z-index: 2;
  text-shadow: 0 1px 6px rgba(0,0,0,0.6);
}
.dash-bubble.has-image .dash-rank-badge-top,
.dash-bubble.has-image .dash-rank-badge-sm {
  z-index: 3;
}

.dash-bubble-name {
  font-weight: 700;
  margin-top: 3px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 6px;
  letter-spacing: -0.01em;
}
.dash-bubble-brand {
  margin-top: 2px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

/* Top 3 뱃지 */
.dash-rank-badge-top {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 900;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.02em;
  white-space: nowrap;
  z-index: 5;
}
.dash-rank-badge-top.rank-1 {
  background: #fbbf24;
  color: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
.dash-rank-badge-top.rank-2 {
  background: #94a3b8;
  color: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.dash-rank-badge-top.rank-3 {
  background: #d97706;
  color: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

/* 4위+ 뱃지 */
.dash-rank-badge-sm {
  position: absolute;
  top: -3px;
  right: -3px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #7c3aed;
  box-shadow: 0 1px 4px rgba(124,58,237,0.1);
  border: 1.5px solid rgba(139,92,246,0.3);
}

/* 툴팁 */
.dash-bubble-tooltip {
  position: absolute;
  z-index: 100;
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  border: 1px solid #e5e7eb;
  pointer-events: none;
  animation: tooltipFadeIn 0.15s ease;
}
.dash-tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.dash-tooltip-name {
  font-weight: 700;
  font-size: 14px;
  color: #111;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.dash-tooltip-rank {
  font-size: 11px;
  color: #7c3aed;
  font-weight: 700;
  flex-shrink: 0;
  margin-left: 8px;
}
.dash-tooltip-brand {
  font-size: 12px;
  color: #888;
}
.dash-tooltip-metrics {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}
.dash-tooltip-metric {
  display: flex;
  flex-direction: column;
}
.dash-metric-label {
  font-size: 10px;
  color: #aaa;
}
.dash-metric-value {
  font-weight: 700;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}
.dash-metric-value.purple {
  color: #7c3aed;
}
.dash-star-icon {
  flex-shrink: 0;
}

@keyframes tooltipFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
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
@media (max-width: 640px) {
  .dash-bubble-area {
    min-height: 260px;
  }
}

/* 스켈레톤 */
.skeleton {
  background: linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%);
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
  background: linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%);
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
  background: #fafafa;
  border-radius: 10px;
}

.empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.625rem;
  color: #bbb;
}

.empty-text {
  font-size: 0.875rem;
  color: #999;
  margin: 0;
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .skeleton,
  .skeleton-line {
    animation: none;
    background: #f0f0f0;
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
  /* 실시간 요거 봄 모바일 */
  .yogurt-bom-section {
    flex-direction: column;
    padding: 0;
    gap: 0;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .yb-left {
    border-right: none;
    border-bottom: 1px solid rgba(255, 220, 100, 0.25);
    padding: 0.75rem 0.875rem;
    margin: 0;
    flex-direction: row;
    align-items: center;
    min-width: auto;
    background: rgba(255, 248, 225, 0.55);
  }

  .yb-right {
    padding: 0.875rem;
  }

  .yb-title-group {
    flex: 1;
    margin-left: 0.5rem;
  }

  .yb-main-title {
    font-size: 0.875rem;
    margin: 0;
  }

  .yb-main-title br {
    display: none;
  }

  .yb-update-time {
    font-size: 0.625rem;
  }

  .yb-status-badge {
    font-size: 0.6rem;
    padding: 3px 8px;
    background: rgba(255, 180, 0, 0.15);
    color: #B8860B;
  }

  .yb-left .pulse-dot {
    background: #DAA520;
  }

  .yb-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 0.5rem;
  }

  .yb-item {
    padding: 0.3rem 0.375rem;
    gap: 0.4rem;
    border-radius: 8px;
  }

  .yb-rank-badge {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    font-size: 0.65rem;
  }

  .yb-info {
    flex-direction: row;
    align-items: center;
    gap: 0.25rem;
  }

  .yb-product {
    font-size: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  .yb-author-name {
    font-size: 0.625rem;
    margin-top: 0;
    flex-shrink: 0;
    max-width: 40%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .yb-tag {
    font-size: 0.55rem;
    padding: 1px 4px;
  }

  .yb-pagination {
    flex-direction: row;
    margin-top: 0;
    padding: 0.5rem 0.875rem 0.75rem;
    justify-content: center;
  }

  .yb-page-btn.active {
    width: 20px;
    height: 6px;
  }

  .yb-sk-rank {
    width: 14px;
    height: 14px;
  }

  .yb-sk-line {
    height: 12px;
  }

  .yb-sk-line.short {
    height: 10px;
  }

  /* 상단 모바일 */
  .page-header {
    padding: 0.75rem 0 0.5rem;
  }

  .page-title {
    font-size: 1.25rem;
  }


  /* 글래스 배너 컴팩트 */
  .glass-banner {
    margin-bottom: 0.5rem;
    border-radius: 14px;
  }

  .banner-inner {
    padding: 0.625rem 0.875rem;
    border-radius: 14px;
  }

  .banner-tag {
    padding: 0.25rem 0.5rem;
    font-size: 0.625rem;
    border-radius: 6px;
  }

  .tag-dot {
    width: 5px;
    height: 5px;
  }

  .banner-text-group {
    gap: 0.125rem;
  }

  .banner-title {
    font-size: 0.8125rem;
  }

  .banner-sub {
    font-size: 0.6875rem;
  }

  .banner-action {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }

  .banner-action svg {
    width: 14px;
    height: 14px;
  }

  /* 통계 카드 컴팩트 */
  .stats-grid {
    gap: 0.375rem;
  }

  .stat-card {
    padding: 0.5rem;
    border-radius: 8px;
    gap: 0.375rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .stat-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }

  .stat-icon svg {
    width: 14px;
    height: 14px;
  }

  .stat-value {
    font-size: 0.9375rem;
  }

  .stat-label {
    font-size: 0.5625rem;
  }

  .live-dot {
    top: 0.375rem;
    right: 0.375rem;
    width: 5px;
    height: 5px;
  }

  /* 섹션 컴팩트 */
  .content-section {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 12px;
  }

  .hot-feeds-section {
    margin-bottom: 0.5rem !important;
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
</style>
