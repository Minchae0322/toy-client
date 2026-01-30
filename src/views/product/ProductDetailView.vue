<template>
  <div class="product-detail-view">
    <!-- 헤더 -->
    <header class="header">
      <div class="header-container">
        <button class="back-btn" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12.5 15L7.5 10L12.5 5"/>
          </svg>
        </button>
        <nav class="breadcrumb">
          <router-link to="/">홈</router-link>
          <span class="separator">/</span>
          <router-link to="/products">상품</router-link>
          <span class="separator">/</span>
          <span class="current">{{ product?.name || '상품 상세' }}</span>
        </nav>
        <div v-if="isLoggedIn && isOwner" class="header-actions">
          <button class="edit-btn" @click="editProduct">수정</button>
          <button class="delete-btn" @click="deleteProduct">삭제</button>
        </div>
      </div>
    </header>

    <!-- 메인 컨테이너 -->
    <main class="main-container">
      <!-- 로딩 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>상품 정보를 불러오는 중입니다</p>
      </div>

      <!-- 에러 -->
      <div v-else-if="error" class="error-container">
        <h3>상품을 불러올 수 없습니다</h3>
        <p>{{ error }}</p>
        <button @click="fetchProductData" class="retry-btn">다시 시도</button>
      </div>

      <!-- 콘텐츠 -->
      <template v-else-if="product">
        <div class="content-layout">
          <!-- 왼쪽: 피드/배틀 메인 -->
          <section class="main-content">
            <!-- 탭 네비게이션 -->
            <div class="tab-nav">
              <button
                  :class="['tab-btn', { active: activeTab === 'feed' }]"
                  @click="activeTab = 'feed'"
              >
                피드
                <span class="tab-count">{{ feeds.length }}</span>
              </button>
              <button
                  :class="['tab-btn', { active: activeTab === 'battle' }]"
                  @click="activeTab = 'battle'"
              >
                배틀
                <span class="tab-count">{{ battles.length }}</span>
              </button>
            </div>

            <!-- 피드 탭 -->
            <div v-if="activeTab === 'feed'" class="tab-content">
              <!-- 피드 작성 -->
              <div class="feed-write-box">
                <div class="user-avatar">😊</div>
                <input
                    type="text"
                    placeholder="이 상품에 대한 의견을 남겨보세요..."
                    class="feed-input"
                    @click="handleWriteFeed"
                    readonly
                />
                <button class="write-btn" @click="handleWriteFeed">작성</button>
              </div>

              <!-- 피드 목록 -->
              <FeedCard
                  v-for="feed in feeds"
                  :key="feed.id"
                  :feed="feed"
                  @like="handleFeedLike"
              />

              <!-- 로딩 상태 -->
              <div v-if="feedsLoading && feeds.length === 0" class="tab-loading">
                <div class="loading-spinner small"></div>
                <p>피드를 불러오는 중...</p>
              </div>

              <!-- 빈 상태 -->
              <div v-else-if="feeds.length === 0 && !feedsLoading" class="empty-state">
                <div class="empty-icon">📝</div>
                <p class="empty-title">아직 피드가 없어요</p>
                <p class="empty-desc">첫 번째 피드를 작성해보세요!</p>
              </div>

              <!-- 더보기 버튼 -->
              <button
                  v-if="hasMoreFeeds && feeds.length > 0"
                  class="load-more-btn"
                  :disabled="feedsLoading"
                  @click="fetchFeeds(route.params.id, true)"
              >
                <span v-if="feedsLoading">불러오는 중...</span>
                <span v-else>더보기</span>
              </button>
            </div>

            <!-- 배틀 탭 -->
            <div v-if="activeTab === 'battle'" class="tab-content">
              <!-- 배틀 생성 -->
              <button class="battle-create-btn" @click="handleCreateBattle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                새 배틀 만들기
              </button>

              <!-- 배틀 목록 -->
              <BattleCard
                  v-for="battle in battles"
                  :key="battle.id"
                  :battle="battle"
                  @vote="handleVote"
                  @view="viewBattle"
              />

              <!-- 로딩 상태 -->
              <div v-if="battlesLoading && battles.length === 0" class="tab-loading">
                <div class="loading-spinner small"></div>
                <p>배틀을 불러오는 중...</p>
              </div>

              <!-- 빈 상태 -->
              <div v-else-if="battles.length === 0 && !battlesLoading" class="empty-state">
                <div class="empty-icon">🏆</div>
                <p class="empty-title">참여 중인 배틀이 없어요</p>
                <p class="empty-desc">새로운 배틀을 시작해보세요!</p>
              </div>

              <!-- 더보기 버튼 -->
              <button
                  v-if="hasMoreBattles && battles.length > 0"
                  class="load-more-btn"
                  :disabled="battlesLoading"
                  @click="fetchBattles(route.params.id, true)"
              >
                <span v-if="battlesLoading">불러오는 중...</span>
                <span v-else>더보기</span>
              </button>
            </div>
          </section>

          <!-- 오른쪽: 상품 정보 사이드바 -->
          <aside class="product-sidebar">
            <div class="sidebar-sticky">
              <!-- 상품 이미지 -->
              <div class="product-image-wrapper">
                <img :src="product.thumbnailUrl || defaultImage" :alt="product.name" class="product-image"/>
              </div>

              <!-- 상품 정보 -->
              <div class="product-info-section">
                <div class="info-header">
                  <span class="brand">{{ product.brand }}</span>
                  <span class="category-badge">{{ product.category?.name || product.category }}</span>
                </div>
                <h1 class="product-name">{{ product.name }}</h1>
                <p class="product-price">{{ formatPrice(product.price) }}<span class="currency">원</span></p>
              </div>

              <!-- 통계 -->
              <div class="stats-section">
                <div class="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span>{{ product.avgRating?.toFixed(1) || '0.0' }}</span>
                </div>
                <div class="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>{{ formatCount(product.viewCount) }}</span>
                </div>
                <div class="stat-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span>{{ formatCount(product.likeCount) }}</span>
                </div>
              </div>

              <!-- 액션 버튼 -->
              <div class="action-section">
                <button :class="['action-btn', { active: userReaction.hasLike }]" @click="handleLikeAction">
                  <svg width="18" height="18" viewBox="0 0 24 24" :fill="userReaction.hasLike ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  좋아요
                </button>
                <button :class="['action-btn', { active: userReaction.hasBookmark }]" @click="handleBookmarkAction">
                  <svg width="18" height="18" viewBox="0 0 24 24" :fill="userReaction.hasBookmark ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  저장
                </button>
                <button class="action-btn" @click="handleShareAction">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                  공유
                </button>
              </div>

              <!-- 상세 정보 (조건부 렌더링) -->
              <div v-if="hasDetailContent" class="detail-section">
                <!-- 설명 -->
                <div
                    v-if="product.description"
                    class="detail-block description"
                    :class="{ 'has-more': hasDetailGrid || product.tags }"
                >
                  <p>{{ product.description }}</p>
                </div>

                <!-- 상세 그리드 -->
                <div v-if="hasDetailGrid" class="detail-grid" :class="{ 'has-tags': product.tags }">
                  <div v-if="product.feature" class="detail-item">
                    <span class="detail-label">특징</span>
                    <span class="detail-value">{{ product.feature }}</span>
                  </div>
                  <div v-if="product.distributor" class="detail-item">
                    <span class="detail-label">판매처</span>
                    <span class="detail-value">{{ product.distributor }}</span>
                  </div>
                  <div v-if="product.releaseDate" class="detail-item">
                    <span class="detail-label">출시일</span>
                    <span class="detail-value">{{ formatDate(product.releaseDate) }}</span>
                  </div>
                </div>

                <!-- 태그 -->
                <div v-if="product.tags" class="tags-wrapper">
                  <span v-for="tag in parseTags(product.tags)" :key="tag" class="tag">#{{ tag }}</span>
                </div>
              </div>

              <!-- 활동 요약 -->
              <div class="activity-section">
                <div class="activity-item">
                  <span class="activity-number">{{ feeds.length }}</span>
                  <span class="activity-label">피드</span>
                </div>
                <div class="activity-divider"></div>
                <div class="activity-item">
                  <span class="activity-number">{{ battles.length }}</span>
                  <span class="activity-label">배틀</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </template>
    </main>

    <!-- 로그인 모달 -->
    <LoginModal
        v-if="showLoginModal"
        :title="loginModalTitle"
        :message="loginModalMessage"
        @close="closeLoginModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { productService } from '@/services/ProductService.js'

import FeedCard from '@/components/product/detail/FeedCard.vue'
import BattleCard from '@/components/product/detail/BattleCard.vue'
import LoginModal from '@/components/product/detail/LoginModal.vue'

const route = useRoute()
const router = useRouter()
const { isLoggedIn, userId } = useAuth()
const { open } = useConfirmDialog()

const defaultImage = 'https://placehold.co/400x400?text=No+Image'

const loading = ref(true)
const error = ref(null)
const actionLoading = ref(false)
const showLoginModal = ref(false)
const loginModalTitle = ref('')
const loginModalMessage = ref('')
const activeTab = ref('feed')

const product = ref(null)
const feeds = ref([])
const battles = ref([])
const userReaction = ref({ hasLike: false, hasBookmark: false })

// 피드/배틀 페이지네이션 상태
const feedsLoading = ref(false)
const battlesLoading = ref(false)
const feedsCursor = ref(null)
const battlesCursor = ref(null)
const hasMoreFeeds = ref(true)
const hasMoreBattles = ref(true)

const isOwner = computed(() => {
  return isLoggedIn.value && userId.value && product.value?.creatorId === userId.value
})

// 상세 정보 섹션 표시 여부
const hasDetailContent = computed(() => {
  if (!product.value) return false
  return product.value.description || product.value.feature ||
      product.value.distributor || product.value.releaseDate || product.value.tags
})

// 상세 그리드 표시 여부
const hasDetailGrid = computed(() => {
  if (!product.value) return false
  return product.value.feature || product.value.distributor || product.value.releaseDate
})

const formatPrice = (price) => {
  if (!price) return '0'
  const num = typeof price === 'string' ? parseInt(price.replace(/,/g, '')) : price
  return num.toLocaleString()
}

const formatCount = (count) => {
  if (!count) return '0'
  if (count >= 10000) return (count / 10000).toFixed(1) + '만'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return count.toString()
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

const parseTags = (tags) => {
  if (!tags) return []
  return tags.split(';').map(tag => tag.trim()).filter(tag => tag)
}

const fetchProductData = async () => {
  try {
    loading.value = true
    error.value = null
    const productId = route.params.id
    const response = await productService.getProduct(productId)

    if (response.success) {
      product.value = response.data
      if (isLoggedIn.value && response.data.userReaction) {
        userReaction.value = response.data.userReaction
      }
      await Promise.all([fetchFeeds(productId), fetchBattles(productId)])
    } else {
      error.value = response.error || '상품을 불러올 수 없습니다.'
    }
  } catch (err) {
    error.value = err.message || '네트워크 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

const fetchFeeds = async (productId, loadMore = false) => {
  if (feedsLoading.value) return
  try {
    feedsLoading.value = true
    const options = {
      size: 20,
      cursor: loadMore ? feedsCursor.value : null
    }
    const response = await productService.getProductFeeds(productId, options)
    if (response.success) {
      const newFeeds = response.data?.content || response.data || []
      if (loadMore) {
        feeds.value = [...feeds.value, ...newFeeds]
      } else {
        feeds.value = newFeeds
      }
      feedsCursor.value = response.data?.nextCursor || null
      hasMoreFeeds.value = !!feedsCursor.value || newFeeds.length >= 20
    }
  } catch (err) {
    console.error('피드 조회 실패:', err)
  } finally {
    feedsLoading.value = false
  }
}

const fetchBattles = async (productId, loadMore = false) => {
  if (battlesLoading.value) return
  try {
    battlesLoading.value = true
    const options = {
      size: 20,
      cursor: loadMore ? battlesCursor.value : null
    }
    const response = await productService.getProductBattles(productId, options)
    if (response.success) {
      const newBattles = response.data?.content || response.data || []
      if (loadMore) {
        battles.value = [...battles.value, ...newBattles]
      } else {
        battles.value = newBattles
      }
      battlesCursor.value = response.data?.nextCursor || null
      hasMoreBattles.value = !!battlesCursor.value || newBattles.length >= 20
    }
  } catch (err) {
    console.error('배틀 조회 실패:', err)
  } finally {
    battlesLoading.value = false
  }
}

const showLoginRequiredModal = (title, message) => {
  loginModalTitle.value = title
  loginModalMessage.value = message
  showLoginModal.value = true
}
const closeLoginModal = () => { showLoginModal.value = false }

const handleLikeAction = async () => {
  if (!isLoggedIn.value) return showLoginRequiredModal('로그인이 필요합니다', '좋아요를 누르려면 로그인해주세요.')
  try {
    actionLoading.value = true
    const response = await productService.likeProduct(product.value.id)
    if (response.success) userReaction.value.hasLike = !userReaction.value.hasLike
  } catch (err) { console.error('좋아요 실패:', err) }
  finally { actionLoading.value = false }
}

const handleBookmarkAction = async () => {
  if (!isLoggedIn.value) return showLoginRequiredModal('로그인이 필요합니다', '저장하려면 로그인해주세요.')
  try {
    actionLoading.value = true
    const response = await productService.bookmarkProduct(product.value.id)
    if (response.success) userReaction.value.hasBookmark = !userReaction.value.hasBookmark
  } catch (err) { console.error('북마크 실패:', err) }
  finally { actionLoading.value = false }
}

const handleShareAction = async () => {
  try {
    if (navigator.share) {
      await navigator.share({ title: product.value.name, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      await open({ type: 'alert', title: '링크 복사 완료', message: '링크가 복사되었습니다!' })
    }
  } catch (err) { console.log('공유 취소:', err) }
}

const handleWriteFeed = () => {
  if (!isLoggedIn.value) return showLoginRequiredModal('로그인이 필요합니다', '피드를 작성하려면 로그인해주세요.')
  router.push(`/products/${product.value.id}/feed/write`)
}

const handleFeedLike = (feedId) => {
  if (!isLoggedIn.value) return showLoginRequiredModal('로그인이 필요합니다', '좋아요를 누르려면 로그인해주세요.')
  const feed = feeds.value.find(f => f.id === feedId)
  if (feed) {
    feed.liked = !feed.liked
    feed.likes += feed.liked ? 1 : -1
  }
}

const handleCreateBattle = () => {
  if (!isLoggedIn.value) return showLoginRequiredModal('로그인이 필요합니다', '배틀을 만들려면 로그인해주세요.')
  router.push(`/battle/create?productId=${product.value.id}`)
}

const handleVote = (battleId) => {
  if (!isLoggedIn.value) return showLoginRequiredModal('로그인이 필요합니다', '투표하려면 로그인해주세요.')
  router.push(`/battles/${battleId}`)
}

const viewBattle = (battleId) => { router.push(`/battle/${battleId}`) }
const editProduct = () => { router.push(`/products/${product.value.id}/edit`) }

const deleteProduct = async () => {
  const confirmed = await open({ type: 'danger', title: '상품 삭제', message: '정말로 이 상품을 삭제하시겠습니까?' })
  if (confirmed) {
    try {
      await productService.deleteProduct(product.value.id)
      await open({ type: 'alert', title: '삭제 완료', message: '상품이 삭제되었습니다.' })
      router.push('/products')
    } catch (err) { await open({ type: 'alert', title: '오류', message: '삭제에 실패했습니다.' }) }
  }
}

const goBack = () => { router.go(-1) }

onMounted(() => { fetchProductData() })

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) fetchProductData()
})

watch(isLoggedIn, (val) => {
  if (val) fetchProductData()
  else userReaction.value = { hasLike: false, hasBookmark: false }
})
</script>

<style scoped>
* { box-sizing: border-box; }

.product-detail-view {
  min-height: 100vh;
  background: #fff;
}

/* Header */
.header {
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #eee;
  background: #fff;
  color: #333;
  cursor: pointer;
  transition: background 0.15s;
}
.back-btn:hover { background: #f5f5f5; }
.breadcrumb {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #999;
}
.breadcrumb a { color: #666; text-decoration: none; }
.breadcrumb a:hover { color: #7c3aed; }
.breadcrumb .separator { color: #ddd; }
.breadcrumb .current { color: #333; font-weight: 500; }
.header-actions { display: flex; gap: 8px; }
.edit-btn, .delete-btn {
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.edit-btn { border: 1px solid #ddd; background: #fff; color: #333; }
.edit-btn:hover { background: #f5f5f5; }
.delete-btn { border: 1px solid #fecaca; background: #fff; color: #dc2626; }
.delete-btn:hover { background: #fef2f2; }

/* Main */
.main-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
}
.loading-container, .error-container {
  padding: 80px 24px;
  text-align: center;
}
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #eee;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-container h3 { font-size: 16px; color: #333; margin: 0 0 8px; }
.error-container p { font-size: 14px; color: #666; margin: 0; }
.retry-btn {
  margin-top: 16px;
  padding: 10px 20px;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

/* Layout */
.content-layout {
  display: flex;
  gap: 40px;
}
.main-content {
  flex: 1;
  min-width: 0;
}
.product-sidebar {
  width: 380px;
  flex-shrink: 0;
}
.sidebar-sticky {
  position: sticky;
  top: 80px;
}

/* Tab Navigation */
.tab-nav {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 10px;
  margin-bottom: 20px;
}
.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.15s;
}
.tab-btn:hover { color: #333; }
.tab-btn.active { background: #fff; color: #333; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.tab-count {
  padding: 2px 8px;
  background: rgba(0,0,0,0.06);
  border-radius: 10px;
  font-size: 12px;
}
.tab-btn.active .tab-count { background: #7c3aed; color: #fff; }

/* Tab Content */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Feed Write Box */
.feed-write-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
}
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.feed-input {
  flex: 1;
  padding: 10px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}
.feed-input::placeholder { color: #999; }
.write-btn {
  padding: 10px 20px;
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.write-btn:hover { background: #6d28d9; }

/* Battle Create */
.battle-create-btn {
  width: 100%;
  padding: 16px;
  background: #fff;
  border: 1px dashed #ddd;
  border-radius: 12px;
  color: #7c3aed;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.15s;
}
.battle-create-btn:hover { border-color: #7c3aed; background: #faf5ff; }

/* Empty State */
.empty-state {
  padding: 60px 24px;
  text-align: center;
  border: 1px solid #eee;
  border-radius: 12px;
}
.empty-icon { font-size: 40px; margin-bottom: 12px; }
.empty-title { font-size: 15px; font-weight: 500; color: #333; margin: 0 0 4px; }
.empty-desc { font-size: 13px; color: #999; margin: 0; }

/* Tab Loading */
.tab-loading {
  padding: 40px 24px;
  text-align: center;
  border: 1px solid #eee;
  border-radius: 12px;
}
.tab-loading p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #666;
}
.loading-spinner.small {
  width: 24px;
  height: 24px;
}

/* Load More Button */
.load-more-btn {
  width: 100%;
  padding: 14px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}
.load-more-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ddd;
}
.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Product Sidebar */
.product-image-wrapper {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
}
.product-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.product-info-section {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}
.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.brand {
  font-size: 13px;
  font-weight: 600;
  color: #7c3aed;
}
.category-badge {
  padding: 4px 10px;
  background: #f5f5f5;
  color: #666;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.product-name {
  font-size: 20px;
  font-weight: 600;
  color: #111;
  margin: 0 0 12px;
  line-height: 1.4;
}
.product-price {
  font-size: 24px;
  font-weight: 700;
  color: #111;
  margin: 0;
}
.currency {
  font-size: 16px;
  font-weight: 500;
  color: #666;
  margin-left: 2px;
}

/* Stats */
.stats-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

/* Actions */
.action-section {
  display: flex;
  gap: 8px;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}
.action-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s;
}
.action-btn:hover { background: #f5f5f5; }
.action-btn.active { border-color: #7c3aed; color: #7c3aed; background: #faf5ff; }

/* Detail Section - 조건부 여백 처리 */
.detail-section {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.detail-block.description {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}
.detail-block.description.has-more {
  margin-bottom: 16px;
}
.detail-block.description p {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #555;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.detail-grid.has-tags {
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.detail-label {
  font-size: 13px;
  color: #999;
}
.detail-value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  padding: 6px 12px;
  background: #f5f5f5;
  color: #666;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.tag:hover { background: #ede9fe; color: #7c3aed; }

/* Activity */
.activity-section {
  display: flex;
  align-items: center;
  padding: 20px 0;
}
.activity-item {
  flex: 1;
  text-align: center;
}
.activity-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #111;
}
.activity-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
.activity-divider {
  width: 1px;
  height: 40px;
  background: #eee;
}

/* FeedCard/BattleCard 이미지 4:3 비율 */
.tab-content :deep(.feed-image img) {
  aspect-ratio: 4 / 3;
  object-fit: cover;
  width: 100%;
  max-height: none;
}

.tab-content :deep(.feed-card),
.tab-content :deep(.battle-card) {
  border: 1px solid #eee;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-layout { flex-direction: column-reverse; gap: 24px; }
  .product-sidebar { width: 100%; }
  .sidebar-sticky { position: relative; top: 0; display: flex; flex-wrap: wrap; gap: 20px; }
  .product-image-wrapper { width: 200px; flex-shrink: 0; }
  .product-info-section { flex: 1; padding: 0; border: none; }
  .stats-section, .action-section, .detail-section, .activity-section { display: none; }
}

@media (max-width: 768px) {
  .main-container { padding: 16px; }
  .header-container { padding: 0 16px; }
  .breadcrumb { display: none; }
  .sidebar-sticky { flex-direction: column; }
  .product-image-wrapper { width: 100%; }
  .stats-section, .action-section { display: flex; }
  .detail-section, .activity-section { display: block; }
}
</style>