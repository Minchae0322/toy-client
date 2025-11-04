<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <!-- 헤더 -->
      <header class="detail-header">
        <div class="header-content">
          <button class="back-btn" @click="goBack">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            배틀 목록
          </button>
          <div class="header-actions">
            <button class="share-btn" @click="handleShare">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
              </svg>
            </button>
            <button class="more-btn" @click="handleMore">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="19" cy="12" r="1"/>
                <circle cx="5" cy="12" r="1"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- 배틀 정보 섹션 -->
      <section v-if="battle" class="battle-info-section">
        <div class="battle-info-container">
          <div class="battle-main-info">
            <div class="battle-meta">
              <span class="battle-category">
                {{ battle.subCategoryDetail?.categoryName }} > {{ battle.subCategoryDetail?.subCategoryName }}
              </span>
              <span class="battle-type-badge" :class="{ open: battle.itemAddPermissionType !== 'CREATOR_ONLY' }">
                {{ battleUtils.getItemAddPermissionLabel(battle.itemAddPermissionType) }}
              </span>
            </div>
            <h1 class="battle-title">{{ battle.title }}</h1>
            <p class="battle-description">{{ battle.description }}</p>
            <div class="battle-creator">
              <div class="creator-avatar">{{ getInitials(battle.creatorUserInfo?.nickname) }}</div>
              <div class="creator-info">
                <div class="creator-name">@{{ battle.creatorUserInfo?.nickname || '알 수 없음' }}</div>
                <div class="creator-level">{{ battle.creatorUserInfo?.role || 'USER' }}</div>
              </div>
              <button class="follow-btn" @click="handleFollow">
                팔로우
              </button>
            </div>
          </div>

          <div class="battle-stats-card">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ formatCount(battle.totalParticipants) }}</span>
                <span class="stat-label">참여자</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ formatCount(battle.totalVotes) }}</span>
                <span class="stat-label">총 투표수</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ items.length }}</span>
                <span class="stat-label">등록 제품</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ formatCount(battle.totalViews) }}</span>
                <span class="stat-label">조회수</span>
              </div>
            </div>
            <div class="battle-timer">
              <div class="timer-label">{{ battle.status === 'ACTIVE' ? '남은 시간' : battleUtils.getBattleStatusLabel(battle.status) }}</div>
              <div class="timer-value">{{ remainingTime }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 액션 버튼 섹션 -->
      <section class="action-section">
        <div class="action-container">
          <div class="action-tabs">
            <div
                v-for="tab in tabs"
                :key="tab.id"
                class="action-tab"
                :class="{ active: activeTab === tab.id }"
                @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </div>
          </div>
          <div class="action-buttons" v-if="battle?.status === 'ACTIVE'">
            <button class="participate-btn" @click="handleParticipate">제품 등록하기</button>
            <button class="vote-btn" @click="handleVote">투표하기</button>
          </div>
        </div>
      </section>

      <!-- 제품 리스트 -->
      <section class="products-section">
        <!-- TOP 3 섹션 -->
        <div v-if="activeTab === 'products' && topProducts.length > 0" class="top3-section">
          <h2 class="section-title" style="margin-bottom: 32px;">🏆 TOP 3</h2>
          <div class="top3-grid">
            <div
                v-for="product in topProducts"
                :key="product.id"
                class="top-card"
                :class="getRankClass(product.rank)"
                @click="openProductDetail(product.id)"
            >
              <div class="top-rank-badge">
                <component :is="getRankIcon(product.rank)" />
                <span class="rank-number">{{ product.rank }}</span>
              </div>
              <div class="top-product-image">
                <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
                <svg v-else width="90" height="90" viewBox="0 0 24 24" fill="none">
                  <path d="M2 18h20l-2-6h-3.5l-1.5-4h-6l-1.5 4H4l-2 6z" fill="#E5E7EB"/>
                  <path d="M7 18v3M17 18v3" stroke="#9CA3AF" stroke-width="2"/>
                </svg>
              </div>
              <div class="top-product-info">
                <h3 class="top-product-name">{{ product.name }}</h3>
                <p class="top-product-brand">{{ product.brand }}</p>
                <div class="top-vote-info">
                  <span class="top-vote-count">{{ product.voteCount }}</span>
                  <span class="top-vote-label">표</span>
                  <span class="top-vote-percent">({{ product.votePercentage.toFixed(1) }}%)</span>
                </div>
                <div class="vote-progress">
                  <div
                      class="vote-progress-fill"
                      :style="{
                      width: `${product.votePercentage}%`,
                      background: getProgressGradient(product.rank)
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 전체 제품 리스트 -->
        <div v-if="activeTab === 'products'">
          <div class="section-header" style="margin-top: 56px;">
            <h2 class="section-title">전체 참여 제품</h2>
            <div class="filter-controls">
              <select v-model="sortBy" class="sort-select">
                <option value="voteCount">득표순</option>
                <option value="latest">최신순</option>
              </select>
              <select v-model="filterStatus" class="sort-select">
                <option value="all">전체</option>
                <option value="available">활성</option>
                <option value="soldout">비활성</option>
              </select>
            </div>
          </div>

          <div class="products-grid">
            <div
                v-for="product in filteredProducts"
                :key="product.id"
                class="product-card"
                @click="openProductDetail(product.id)"
            >
              <div class="product-image">
                <div class="product-rank">{{ product.rank }}</div>
                <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
                <svg v-else width="56" height="56" viewBox="0 0 24 24" fill="none">
                  <path d="M2 18h20l-2-6h-3.5l-1.5-4h-6l-1.5 4H4l-2 6z" fill="#E5E7EB"/>
                  <path d="M7 18v3M17 18v3" stroke="#9CA3AF" stroke-width="2"/>
                </svg>
              </div>
              <div class="product-content">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-brand">{{ product.brand }}</div>
                <div class="product-stats">
                  <div class="product-votes">
                    <span class="vote-count">{{ product.voteCount }}</span>
                    <span class="vote-percentage">{{ product.votePercentage.toFixed(1) }}%</span>
                  </div>
                  <div class="product-actions">
                    <div class="action-icon" @click.stop="toggleLike(product.id)">
                      <svg width="16" height="16" viewBox="0 0 24 24" :fill="product.isLiked ? '#FF3B30' : 'none'" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </div>
                    <div class="action-icon" @click.stop="openComments(product.id)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="vote-progress">
                  <div class="vote-progress-fill" :style="{ width: `${product.votePercentage}%` }"></div>
                </div>
                <div class="product-submitter">
                  <div class="submitter-avatar">{{ getInitials(product.submitterName) }}</div>
                  <div class="submitter-name">@{{ product.submitterUsername }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="hasMoreItems && remainingProductCount > 0" class="load-more">
            <button class="load-more-btn" @click="loadMoreProducts">
              더 보기 ({{ remainingProductCount }}개 남음)
            </button>
          </div>

          <div v-if="filteredProducts.length === 0" class="empty-state">
            <p>등록된 제품이 없습니다.</p>
          </div>
        </div>

        <!-- 내가 투표한 제품 탭 -->
        <div v-if="activeTab === 'myVotes'" class="my-votes-section">
          <div v-if="myVotedItems.length === 0" class="empty-state">
            <p>아직 투표한 제품이 없습니다.</p>
          </div>
          <div v-else class="products-grid">
            <!-- 동일한 제품 카드 구조 사용 -->
          </div>
        </div>

        <!-- 토론 탭 -->
        <div v-if="activeTab === 'discussions'" class="discussions-section">
          <div class="discussion-list">
            <p style="text-align: center; color: #9CA3AF; padding: 40px;">토론 기능은 준비 중입니다.</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom Navigation - Mobile Only -->
    <nav class="bottom-nav">
      <button class="bottom-nav-item" @click="$router.push('/feed')">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
        <span>홈</span>
      </button>
      <button class="bottom-nav-item active" @click="$router.push('/battle')">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/>
        </svg>
        <span>배틀</span>
      </button>
      <button class="bottom-nav-fab" @click="handleParticipate">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
      </button>
      <button class="bottom-nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
        </svg>
        <span>메시지</span>
      </button>
      <button class="bottom-nav-item" @click="$router.push('/profile')">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
        </svg>
        <span>MY</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { battleService, battleUtils, useBattle } from '@/services/BattleService'
import AppSidebar from '@/components/feed/AppSidebar.vue'

const router = useRouter()
const route = useRoute()

// Composable 사용
const {
  getBattle,
  addBattleItems,
  voteBattleItem,
  reportBattleItem
} = useBattle()

// State
const battle = ref(null)
const items = ref([])
const myVotedItems = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const hasMoreItems = ref(true)
const loading = ref(false)
const error = ref(null)

const activeTab = ref('products')
const sortBy = ref('voteCount')
const filterStatus = ref('all')

const tabs = ref([
  { id: 'products', label: '전체 제품' },
  { id: 'myVotes', label: '내가 투표한 제품' },
  { id: 'discussions', label: '토론' }
])

// Computed
const topProducts = computed(() => {
  if (!items.value || items.value.length === 0) return []

  // voteCount 기준으로 정렬하여 상위 3개
  const sorted = [...items.value].sort((a, b) => {
    return (b.voteCount || 0) - (a.voteCount || 0)
  })

  return sorted.slice(0, 3).map((item, index) => ({
    id: item.id,
    rank: index + 1,
    name: item.battleItemProduct?.name || item.customName || '제품명 없음',
    brand: item.battleItemProduct?.brand || item.customBrand || '',
    imageUrl: item.battleItemProduct?.thumbnailDto?.storedPath || item.customImageUrl || null,
    voteCount: item.voteCount || 0,
    votePercentage: battleUtils.calculateVotePercentage(
        item.voteCount || 0,
        battle.value?.totalVotes || 0
    ),
    submitterName: item.submitterUserInfo?.nickname || '알 수 없음',
    submitterUsername: item.submitterUserInfo?.email?.split('@')[0] || 'unknown'
  }))
})

const filteredProducts = computed(() => {
  if (!items.value || items.value.length === 0) return []

  // TOP 3 제외한 나머지
  let filtered = items.value.slice(3)

  // 상태 필터링
  if (filterStatus.value === 'available') {
    filtered = filtered.filter(item => item.itemStatus === 'ACTIVE')
  } else if (filterStatus.value === 'soldout') {
    filtered = filtered.filter(item => item.itemStatus !== 'ACTIVE')
  }

  // 정렬
  if (sortBy.value === 'voteCount') {
    filtered.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
  } else if (sortBy.value === 'latest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return filtered.map((item, index) => ({
    id: item.id,
    rank: index + 4, // TOP 3 다음부터
    name: item.battleItemProduct?.name || item.customName || '제품명 없음',
    brand: item.battleItemProduct?.brand || item.customBrand || '',
    imageUrl: item.battleItemProduct?.thumbnailDto?.storedPath || item.customImageUrl || null,
    voteCount: item.voteCount || 0,
    votePercentage: battleUtils.calculateVotePercentage(
        item.voteCount || 0,
        battle.value?.totalVotes || 0
    ),
    isLiked: item.userBattleVote?.hasLike || false,
    isAvailable: item.itemStatus === 'ACTIVE',
    submitterName: item.submitterUserInfo?.nickname || '알 수 없음',
    submitterUsername: item.submitterUserInfo?.email?.split('@')[0] || 'unknown',
    itemStatus: item.itemStatus
  }))
})

const remainingProductCount = computed(() => {
  return Math.max(0, (battle.value?.totalItems || 0) - items.value.length)
})

const remainingTime = computed(() => {
  if (!battle.value || battle.value.status !== 'ACTIVE') {
    return battleUtils.getBattleStatusLabel(battle.value?.status)
  }

  return battleUtils.formatDaysLeft(battle.value.endDate)
})

// Utils
const formatCount = (num) => {
  return battleUtils.formatCount(num)
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.substring(0, 2).toUpperCase()
}

const getRankClass = (rank) => {
  if (rank === 1) return 'first'
  if (rank === 2) return 'second'
  if (rank === 3) return 'third'
  return ''
}

const getRankIcon = (rank) => {
  const gradientId = rank === 1 ? 'gold-gradient' : rank === 2 ? 'silver-gradient' : 'bronze-gradient'
  const stroke = rank === 1 ? '#F59E0B' : rank === 2 ? '#6B7280' : '#C2410C'

  return {
    template: `
      <svg width="${rank === 1 ? 36 : 32}" height="${rank === 1 ? 36 : 32}" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="url(#${gradientId})" stroke="${stroke}" stroke-width="2"/>
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${rank === 1 ? '#FBBF24' : rank === 2 ? '#D1D5DB' : '#FB923C'}"/>
            <stop offset="100%" style="stop-color:${rank === 1 ? '#F59E0B' : rank === 2 ? '#9CA3AF' : '#F97316'}"/>
          </linearGradient>
        </defs>
      </svg>
    `
  }
}

const getProgressGradient = (rank) => {
  if (rank === 1) return 'linear-gradient(90deg, #FBBF24, #F59E0B)'
  if (rank === 2) return 'linear-gradient(90deg, #D1D5DB, #9CA3AF)'
  if (rank === 3) return 'linear-gradient(90deg, #FB923C, #F97316)'
  return 'linear-gradient(90deg, #667eea, #764ba2)'
}

// API Methods
const loadBattleDetail = async () => {
  try {
    loading.value = true
    error.value = null

    const battleId = route.params.id
    console.log('🔍 [BATTLE_DETAIL] 배틀 상세 로드:', battleId)

    const response = await getBattle(battleId)

    if (response.success && response.data) {
      battle.value = response.data
      console.log('✅ [BATTLE_DETAIL] 배틀 상세 로드 성공:', battle.value)

      // 배틀에 포함된 아이템 목록 설정
      if (response.data.items && Array.isArray(response.data.items)) {
        items.value = response.data.items
        console.log('📦 [BATTLE_DETAIL] 아이템 목록:', items.value.length, '개')
      }
    } else {
      throw new Error(response.error || '배틀 정보를 불러올 수 없습니다.')
    }
  } catch (err) {
    console.error('❌ [BATTLE_DETAIL] 배틀 상세 로드 실패:', err)
    error.value = err.message || '배틀 정보를 불러올 수 없습니다.'
    alert(error.value)
    router.push('/battle')
  } finally {
    loading.value = false
  }
}

const loadMoreProducts = async () => {
  if (loading.value || !hasMoreItems.value) return

  try {
    loading.value = true

    // 추가 페이지 로드 로직
    // 현재는 getBattle에서 모든 아이템을 가져오므로 별도 구현 불필요
    // 필요시 페이징 API 추가

    hasMoreItems.value = false
  } catch (err) {
    console.error('❌ [BATTLE_DETAIL] 제품 추가 로드 실패:', err)
  } finally {
    loading.value = false
  }
}

// Event Handlers
const goBack = () => {
  router.push('/battle')
}

const handleShare = async () => {
  const url = window.location.href

  if (navigator.share) {
    try {
      await navigator.share({
        title: battle.value?.title,
        text: battle.value?.description,
        url: url
      })
    } catch (err) {
      console.log('공유 취소됨')
    }
  } else {
    await navigator.clipboard.writeText(url)
    alert('링크가 클립보드에 복사되었습니다.')
  }
}

const handleMore = () => {
  // 더보기 메뉴 표시
  console.log('더보기 메뉴')
}

const handleFollow = async () => {
  try {
    // TODO: 팔로우 API 구현
    console.log('팔로우/언팔로우')
    alert('팔로우 기능은 준비 중입니다.')
  } catch (err) {
    console.error('팔로우 실패:', err)
  }
}

const handleParticipate = () => {
  if (!battle.value) return

  if (battle.value.status !== 'ACTIVE') {
    alert('종료된 배틀입니다.')
    return
  }

  // 아이템 추가 권한 체크
  if (!battleUtils.canAddItem(battle.value, null)) { // TODO: userId 전달
    alert('아이템을 추가할 수 없습니다.')
    return
  }

  router.push(`/battle/${route.params.id}/submit`)
}

const handleVote = () => {
  if (!battle.value) return

  if (battle.value.status !== 'ACTIVE') {
    alert('종료된 배틀입니다.')
    return
  }

  if (!battleUtils.canVote(battle.value)) {
    alert('투표 기간이 아닙니다.')
    return
  }

  router.push(`/battle/${route.params.id}/vote`)
}

const openProductDetail = (productId) => {
  router.push(`/battle/${route.params.id}/products/${productId}`)
}

const toggleLike = async (productId) => {
  try {
    // TODO: 좋아요 API 구현
    console.log('좋아요 토글:', productId)

    const item = items.value.find(i => i.id === productId)
    if (item) {
      // 임시로 토글
      const currentLike = item.userBattleVote?.hasLike || false
      if (!item.userBattleVote) {
        item.userBattleVote = {}
      }
      item.userBattleVote.hasLike = !currentLike
    }
  } catch (err) {
    console.error('좋아요 실패:', err)
  }
}

const openComments = (productId) => {
  router.push(`/battle/${route.params.id}/products/${productId}#comments`)
}

// Watchers
watch(sortBy, () => {
  console.log('정렬 기준 변경:', sortBy.value)
})

watch(filterStatus, () => {
  console.log('필터 상태 변경:', filterStatus.value)
})

// Lifecycle
onMounted(async () => {
  await loadBattleDetail()
})

// Timer update
let timerInterval = null
onMounted(() => {
  timerInterval = setInterval(() => {
    if (battle.value?.status === 'ACTIVE') {
      // Force re-computation
      battle.value = { ...battle.value }
    }
  }, 60000) // Update every minute
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
:root {
  --neutral-0: #FFFFFF;
  --neutral-50: #FAFAFA;
  --neutral-100: #F2F2F2;
  --neutral-200: #E8E8E8;
  --neutral-300: #D4D4D4;
  --neutral-400: #A3A3A3;
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-900: #0A0A0A;
  --bg: #FAFAFA;
  --accent: #0A0A0A;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Pretendard', system-ui, sans-serif;
  background: var(--bg);
  color: var(--neutral-900);
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  background: var(--bg);
  min-height: 100vh;
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding-bottom: 68px;
  }
}

/* 헤더 */
.detail-header {
  background: white;
  border-bottom: 1px solid var(--neutral-200);
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.95);
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid var(--neutral-300);
  border-radius: 8px;
  color: var(--neutral-500);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.back-btn:hover {
  border-color: var(--neutral-400);
  background: var(--neutral-50);
  color: var(--neutral-900);
  transform: translateX(-2px);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.share-btn, .more-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--neutral-200);
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.share-btn:hover, .more-btn:hover {
  border-color: var(--neutral-400);
  background: var(--neutral-50);
  transform: translateY(-1px);
}

/* 배틀 정보 섹션 */
.battle-info-section {
  background: white;
  padding: 48px 0;
  border-bottom: 1px solid var(--neutral-200);
}

.battle-info-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  gap: 48px;
}

@media (max-width: 1024px) {
  .battle-info-container {
    flex-direction: column;
    gap: 32px;
  }
}

.battle-main-info {
  flex: 1;
}

.battle-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.battle-category {
  padding: 6px 12px;
  background: #EFF6FF;
  color: #1E40AF;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.battle-type-badge {
  padding: 6px 12px;
  background: #FEF3C7;
  color: #92400E;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.battle-type-badge.open {
  background: #DBEAFE;
  color: #1E40AF;
}

.battle-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--neutral-900);
  margin-bottom: 20px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

@media (max-width: 768px) {
  .battle-title {
    font-size: 28px;
  }
}

.battle-description {
  font-size: 16px;
  color: var(--neutral-500);
  line-height: 1.7;
  margin-bottom: 32px;
}

.battle-creator {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: var(--neutral-50);
  border-radius: 12px;
  border: 1px solid var(--neutral-200);
}

.creator-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 20px;
}

.creator-info {
  flex: 1;
}

.creator-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--neutral-900);
  margin-bottom: 2px;
}

.creator-level {
  font-size: 13px;
  color: var(--neutral-500);
  font-weight: 400;
}

.follow-btn {
  padding: 10px 24px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.follow-btn:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 통계 카드 */
.battle-stats-card {
  width: 360px;
  background: linear-gradient(135deg, #5B68DF 0%, #6B46C1 100%);
  border-radius: 20px;
  padding: 36px 32px;
  color: white;
  box-shadow: 0 20px 40px rgba(91, 104, 223, 0.3);
}

@media (max-width: 1024px) {
  .battle-stats-card {
    width: 100%;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
  margin-bottom: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 40px;
  font-weight: 700;
  display: block;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

.battle-timer {
  text-align: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.timer-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 10px;
  font-weight: 500;
}

.timer-value {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* 액션 섹션 */
.action-section {
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid var(--neutral-200);
  position: sticky;
  top: 69px;
  z-index: 25;
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.95);
}

.action-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .action-container {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}

.action-tabs {
  display: flex;
  gap: 32px;
}

@media (max-width: 768px) {
  .action-tabs {
    gap: 16px;
    overflow-x: auto;
  }
}

.action-tab {
  padding: 10px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--neutral-400);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.action-tab.active {
  color: var(--neutral-900);
  border-bottom-color: var(--neutral-900);
}

.action-tab:hover:not(.active) {
  color: var(--neutral-500);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .action-buttons {
    width: 100%;
  }

  .action-buttons button {
    flex: 1;
  }
}

.participate-btn, .vote-btn {
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.participate-btn {
  background: var(--accent);
  color: white;
}

.participate-btn:hover {
  background: #000000;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.vote-btn {
  background: #10B981;
  color: white;
}

.vote-btn:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

/* 제품 섹션 */
.products-section {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 32px;
}

@media (max-width: 768px) {
  .products-section {
    padding: 32px 16px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--neutral-900);
  letter-spacing: -0.02em;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.sort-select {
  padding: 9px 16px;
  background: white;
  border: 1px solid var(--neutral-300);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.sort-select:hover {
  border-color: var(--neutral-400);
}

/* TOP 3 섹션 */
.top3-section {
  background: white;
  padding: 40px;
  border-radius: 20px;
  margin-bottom: 48px;
  border: 1px solid var(--neutral-200);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

@media (max-width: 768px) {
  .top3-section {
    padding: 24px;
  }
}

.top3-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .top3-grid {
    grid-template-columns: 1fr;
  }
}

.top-card {
  background: var(--neutral-50);
  border-radius: 16px;
  padding: 32px 28px;
  text-align: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 2px solid transparent;
  cursor: pointer;
}

.top-card.first {
  background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
  border-color: #F59E0B;
}

.top-card.second {
  background: linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%);
  border-color: #9CA3AF;
}

.top-card.third {
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
  border-color: #F97316;
}

.top-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
}

.top-rank-badge {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.rank-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 15px;
  font-weight: 700;
  color: white;
}

.top-product-image {
  margin-bottom: 20px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.top-product-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--neutral-900);
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.top-product-brand {
  font-size: 14px;
  color: var(--neutral-500);
  margin-bottom: 16px;
  font-weight: 500;
}

.top-vote-info {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
}

.top-vote-count {
  font-size: 32px;
  font-weight: 700;
  color: var(--neutral-900);
  letter-spacing: -0.02em;
}

.top-vote-label {
  font-size: 15px;
  color: var(--neutral-500);
  font-weight: 500;
}

.top-vote-percent {
  font-size: 15px;
  color: #10B981;
  font-weight: 600;
}

/* 제품 그리드 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1280px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--neutral-200);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
  border-color: var(--neutral-300);
}

.product-rank {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 36px;
  height: 36px;
  background: var(--accent);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.product-image {
  position: relative;
  height: 220px;
  background: var(--neutral-50);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-content {
  padding: 20px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--neutral-900);
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

.product-brand {
  font-size: 14px;
  color: var(--neutral-400);
  margin-bottom: 16px;
  font-weight: 500;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-top: 1px solid var(--neutral-100);
}

.product-votes {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vote-count {
  font-size: 22px;
  font-weight: 700;
  color: var(--neutral-900);
  letter-spacing: -0.01em;
}

.vote-percentage {
  font-size: 14px;
  color: #10B981;
  font-weight: 600;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.action-icon {
  width: 34px;
  height: 34px;
  border: 1px solid var(--neutral-200);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--neutral-400);
}

.action-icon:hover {
  border-color: var(--neutral-400);
  background: var(--neutral-50);
  transform: scale(1.05);
  color: var(--neutral-900);
}

.product-submitter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--neutral-100);
}

.submitter-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--neutral-200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--neutral-600);
}

.submitter-name {
  font-size: 13px;
  color: var(--neutral-500);
  font-weight: 500;
}

/* 투표 진행 바 */
.vote-progress {
  margin-top: 12px;
  height: 6px;
  background: var(--neutral-100);
  border-radius: 3px;
  overflow: hidden;
}

.vote-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 더보기 */
.load-more {
  text-align: center;
  padding: 48px 0;
}

.load-more-btn {
  padding: 14px 36px;
  background: white;
  border: 1px solid var(--neutral-300);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--neutral-500);
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.load-more-btn:hover {
  border-color: var(--neutral-400);
  color: var(--neutral-900);
  background: var(--neutral-50);
  transform: translateY(-2px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--neutral-400);
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-top: 0.5px solid var(--neutral-200);
  z-index: 50;
  display: none;
  align-items: center;
  justify-content: space-around;
  padding: 4px 0 6px;
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.02);
}

@media (max-width: 1024px) {
  .bottom-nav {
    display: flex;
  }
}

.bottom-nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 5px 8px;
  background: transparent;
  border: none;
  color: var(--neutral-400);
  cursor: pointer;
  transition: color 160ms ease;
  font-family: inherit;
}

.bottom-nav-item.active {
  color: var(--neutral-900);
}

.bottom-nav-item .icon {
  width: 20px;
  height: 20px;
}

.bottom-nav-item span {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: -0.006em;
}

.bottom-nav-fab {
  width: 48px;
  height: 48px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(10, 10, 10, 0.16), 0 1px 3px rgba(10, 10, 10, 0.08);
  margin-top: -24px;
  transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-nav-fab:hover {
  background: #000000;
  transform: translateY(-0.5px) scale(1.01);
  box-shadow: 0 6px 16px rgba(10, 10, 10, 0.2), 0 2px 4px rgba(10, 10, 10, 0.1);
}

.bottom-nav-fab:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(10, 10, 10, 0.12);
}

.bottom-nav-fab .icon {
  width: 24px;
  height: 24px;
  stroke-width: 2.5;
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-nav {
    padding-bottom: max(6px, env(safe-area-inset-bottom));
  }
}
</style>