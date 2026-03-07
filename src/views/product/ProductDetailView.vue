<template>
  <div class="product-detail-view">
    <!-- 헤더 -->
    <header class="detail-header">
      <button class="btn-back" @click="goBack" aria-label="뒤로 가기">
        <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="header-title">상품 상세</h1>
      <div class="header-actions">
        <button v-if="isLoggedIn" class="hdr-action-btn" @click="showHeaderMenu = !showHeaderMenu" aria-label="더보기">
          <svg class="hdr-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none"/>
          </svg>
        </button>
      </div>
      <Transition name="menu">
        <div v-if="showHeaderMenu" class="menu-overlay" @click="showHeaderMenu = false">
          <div class="menu-dropdown" @click.stop>
            <template v-if="isOwner">
              <button class="menu-item" @click="showHeaderMenu = false; editProduct()">
                <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                수정하기
              </button>
              <div class="menu-divider" />
              <button class="menu-item menu-item--danger" @click="showHeaderMenu = false; deleteProduct()">
                <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                삭제하기
              </button>
            </template>
            <template v-else>
              <button class="menu-item menu-item--danger" @click="showHeaderMenu = false">
                <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                신고하기
              </button>
            </template>
          </div>
        </div>
      </Transition>
    </header>

    <!-- 메인 컨테이너 -->
    <main class="main-container">
      <!-- 로딩 -->
      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p class="state-text">상품 정보를 불러오는 중입니다</p>
      </div>

      <!-- 에러 -->
      <div v-else-if="error" class="state-box">
        <p class="state-title">상품을 불러올 수 없습니다</p>
        <p class="state-text">{{ error }}</p>
        <button @click="fetchProductData" class="btn-solid">다시 시도</button>
      </div>

      <!-- 콘텐츠 -->
      <template v-else-if="product">
        <div class="content-layout">
          <!-- 왼쪽: 피드/배틀 메인 -->
          <section class="main-content">
            <!-- 탭 -->
            <div class="tab-bar">
              <button :class="['tab', { active: activeTab === 'feed' }]" @click="activeTab = 'feed'">
                피드 <span class="tab-count">{{ feeds.length }}</span>
              </button>
              <button :class="['tab', { active: activeTab === 'battle' }]" @click="activeTab = 'battle'">
                배틀 <span class="tab-count">{{ battles.length }}</span>
              </button>
              <div class="tab-indicator" :style="{ left: activeTab === 'feed' ? '0' : '50%' }"></div>
            </div>

            <!-- 피드 탭 -->
            <div v-if="activeTab === 'feed'" class="tab-content">
              <div class="write-box" @click="handleWriteFeed">
                <div class="write-avatar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <span class="write-placeholder">이 상품에 대한 의견을 남겨보세요</span>
                <span class="write-action">작성</span>
              </div>

              <FeedCard v-for="feed in feeds" :key="feed.id" :feed="feed" @like="handleFeedLike" />

              <div v-if="feedsLoading && feeds.length === 0" class="loading-box">
                <div class="spinner sm"></div>
                <p>피드를 불러오는 중...</p>
              </div>

              <div v-else-if="feeds.length === 0 && !feedsLoading" class="empty-box">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <p class="empty-title">아직 피드가 없어요</p>
                <p class="empty-desc">첫 번째 피드를 작성해보세요</p>
              </div>

              <button v-if="hasMoreFeeds && feeds.length > 0" class="btn-more" :disabled="feedsLoading" @click="fetchFeeds(route.params.id, true)">
                {{ feedsLoading ? '불러오는 중...' : '더보기' }}
              </button>
            </div>

            <!-- 배틀 탭 -->
            <div v-if="activeTab === 'battle'" class="tab-content">
              <button class="btn-outline full" @click="handleCreateBattle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                새 배틀 만들기
              </button>

              <BattleCard v-for="battle in battles" :key="battle.id" :battle="battle" @vote="handleVote" @view="viewBattle" />

              <div v-if="battlesLoading && battles.length === 0" class="loading-box">
                <div class="spinner sm"></div>
                <p>배틀을 불러오는 중...</p>
              </div>

              <div v-else-if="battles.length === 0 && !battlesLoading" class="empty-box">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                <p class="empty-title">참여 중인 배틀이 없어요</p>
                <p class="empty-desc">새로운 배틀을 시작해보세요</p>
              </div>

              <button v-if="hasMoreBattles && battles.length > 0" class="btn-more" :disabled="battlesLoading" @click="fetchBattles(route.params.id, true)">
                {{ battlesLoading ? '불러오는 중...' : '더보기' }}
              </button>
            </div>
          </section>

          <!-- 오른쪽: 상품 정보 사이드바 -->
          <aside class="product-sidebar">
            <div class="sidebar-sticky">
              <!-- 이미지 -->
              <div class="product-image-wrap">
                <img :src="product.thumbnailUrl || defaultImage" :alt="product.name" class="product-image"/>
              </div>

              <!-- 브랜드 + 카테고리 -->
              <div class="product-meta">
                <span class="brand">{{ product.brand }}</span>
                <span class="category">{{ product.category?.name || product.category }}</span>
              </div>

              <!-- 이름 -->
              <h1 class="product-name">{{ product.name }}</h1>

              <!-- 가격 -->
              <p class="product-price">{{ formatPrice(product.price) }}<span class="won">원</span></p>

              <!-- 설명 -->
              <p v-if="product.description" class="product-desc">{{ product.description }}</p>

              <!-- 상세 정보 -->
              <div v-if="hasDetailGrid || displayDate" class="info-table">
                <div v-if="product.feature" class="info-row">
                  <span class="info-key">특징</span>
                  <span class="info-val">{{ product.feature }}</span>
                </div>
                <div v-if="product.distributor" class="info-row">
                  <span class="info-key">판매처</span>
                  <span class="info-val">{{ product.distributor }}</span>
                </div>
                <div v-if="displayDate" class="info-row">
                  <span class="info-key">출시일</span>
                  <span class="info-val">{{ formatDate(displayDate) }}</span>
                </div>
              </div>

              <!-- 태그 -->
              <div v-if="product.tags" class="tags">
                <span v-for="tag in parseTags(product.tags)" :key="tag" class="tag">#{{ tag }}</span>
              </div>

              <!-- 통계 -->
              <div class="stats-row">
                <div class="stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {{ product.avgRating?.toFixed(1) || '0.0' }}
                </div>
                <span class="dot"></span>
                <div class="stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {{ formatCount(product.viewCount) }}
                </div>
                <span class="dot"></span>
                <div class="stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {{ formatCount(product.likeCount) }}
                </div>
                <span class="dot"></span>
                <div class="stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {{ formatCount(product.reviewCount) }}
                </div>
              </div>

              <!-- 액션 -->
              <div class="action-bar">
                <button :class="['action-btn', { on: userReaction.hasLike }]" @click="handleLikeAction">
                  <svg width="18" height="18" viewBox="0 0 24 24" :fill="userReaction.hasLike ? '#7c3aed' : 'none'" :stroke="userReaction.hasLike ? '#7c3aed' : '#666'" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span>좋아요</span>
                </button>
                <button :class="['action-btn', { on: userReaction.hasBookmark }]" @click="handleBookmarkAction">
                  <svg width="18" height="18" viewBox="0 0 24 24" :fill="userReaction.hasBookmark ? '#7c3aed' : 'none'" :stroke="userReaction.hasBookmark ? '#7c3aed' : '#666'" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>저장</span>
                </button>
                <button class="action-btn" @click="handleShareAction">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                  <span>공유</span>
                </button>
              </div>

              <!-- 캐리어 담기 -->
              <button :class="['carrier-btn', { on: isInCarrier }]" :disabled="carrierLoading" @click="handleAddToCarrier">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/>
                  <path v-if="isInCarrier" d="M9 15l2 2 4-4"/>
                  <template v-else><line x1="12" y1="12" x2="12" y2="18"/><line x1="9" y1="15" x2="15" y2="15"/></template>
                </svg>
                {{ isInCarrier ? '캐리어에 담김' : '캐리어에 담기' }}
              </button>

              <!-- 활동 -->
              <div class="activity-row">
                <div class="activity-item">
                  <span class="activity-num">{{ feeds.length }}</span>
                  <span class="activity-label">피드</span>
                </div>
                <div class="activity-div"></div>
                <div class="activity-item">
                  <span class="activity-num">{{ battles.length }}</span>
                  <span class="activity-label">배틀</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </template>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { productService } from '@/services/ProductService.js'
import { carrierService, CARRIER_TYPE } from '@/services/CarrierService.js'

import FeedCard from '@/components/product/detail/FeedCard.vue'
import BattleCard from '@/components/product/detail/BattleCard.vue'

const route = useRoute()
const router = useRouter()
const { isLoggedIn, userId } = useAuth()
const { open, openLoginRequired } = useConfirmDialog()

const defaultImage = 'https://placehold.co/400x400?text=No+Image'

const loading = ref(true)
const error = ref(null)
const actionLoading = ref(false)
const activeTab = ref('feed')
const isInCarrier = ref(false)
const carrierLoading = ref(false)
const showHeaderMenu = ref(false)

const product = ref(null)
const feeds = ref([])
const battles = ref([])
const userReaction = ref({ hasLike: false, hasBookmark: false })

const feedsLoading = ref(false)
const battlesLoading = ref(false)
const feedsCursor = ref(null)
const battlesCursor = ref(null)
const hasMoreFeeds = ref(true)
const hasMoreBattles = ref(true)

const isOwner = computed(() => {
  return isLoggedIn.value && userId.value && product.value?.creatorId === userId.value
})

const displayDate = computed(() => {
  if (!product.value) return null
  return product.value.releaseDate || product.value.createdAt || null
})

const hasDetailGrid = computed(() => {
  if (!product.value) return false
  return product.value.feature || product.value.distributor || displayDate.value
})

const formatPrice = (price) => {
  if (!price) return '0'
  const s = String(price).replace(/,/g, '').trim()
  const rangeMatch = s.match(/^(\d+)\s*[~\-–—]\s*(\d+)$/)
  if (rangeMatch) {
    return `${parseInt(rangeMatch[1]).toLocaleString()} ~ ${parseInt(rangeMatch[2]).toLocaleString()}`
  }
  const num = parseInt(s)
  return isNaN(num) ? '0' : num.toLocaleString()
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
      checkCarrierStatus()
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

const showLoginRequiredModal = async (message) => {
  const confirmed = await openLoginRequired(message)
  if (confirmed) {
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
  }
}

const handleLikeAction = async () => {
  if (!isLoggedIn.value) return showLoginRequiredModal('좋아요를 누르려면 로그인해주세요.')
  try {
    actionLoading.value = true
    const response = await productService.likeProduct(product.value.id)
    if (response.success) userReaction.value.hasLike = !userReaction.value.hasLike
  } catch (err) { console.error('좋아요 실패:', err) }
  finally { actionLoading.value = false }
}

const handleBookmarkAction = async () => {
  if (!isLoggedIn.value) return showLoginRequiredModal('저장하려면 로그인해주세요.')
  try {
    actionLoading.value = true
    const response = await productService.bookmarkProduct(product.value.id)
    if (response.success) userReaction.value.hasBookmark = !userReaction.value.hasBookmark
  } catch (err) { console.error('북마크 실패:', err) }
  finally { actionLoading.value = false }
}

const handleAddToCarrier = async () => {
  if (!isLoggedIn.value) return showLoginRequiredModal('캐리어에 담으려면 로그인해주세요.')
  if (isInCarrier.value || carrierLoading.value) return
  carrierLoading.value = true
  try {
    let carrierId = null
    const carriersRes = await carrierService.getMyCarriers()
    if (carriersRes.success && carriersRes.data?.length) {
      const carrier = carriersRes.data.find(c => c.isDefault) || carriersRes.data[0]
      carrierId = carrier.id
    } else {
      const createRes = await carrierService.createCarrier({ name: '내 캐리어', skinType: CARRIER_TYPE.DEFAULT, skinColor: '#7c3aed' })
      if (createRes.success) carrierId = createRes.data?.id
    }
    if (!carrierId) throw new Error('캐리어를 찾을 수 없습니다.')
    const res = await carrierService.addItem(carrierId, {
      productId: product.value.id,
      positionX: 0.5,
      positionY: 0.5,
      zIndex: 0
    })
    if (res.success) {
      isInCarrier.value = true
      await open({ type: 'alert', title: '캐리어에 담았어요', message: `${product.value.name}이(가) 캐리어에 추가되었습니다.` })
    }
  } catch (err) {
    console.error('캐리어 담기 실패:', err)
    await open({ type: 'alert', title: '오류', message: '캐리어에 담는데 실패했습니다.' })
  } finally {
    carrierLoading.value = false
  }
}

const checkCarrierStatus = async () => {
  if (!isLoggedIn.value || !product.value) return
  try {
    const res = await carrierService.getMyCarriers()
    if (res.success && res.data?.length) {
      const carrier = res.data.find(c => c.isDefault) || res.data[0]
      const detail = await carrierService.getCarrier(carrier.id)
      if (detail.success && detail.data?.items) {
        isInCarrier.value = detail.data.items.some(item => item.productId === product.value.id)
      }
    }
  } catch (e) { /* ignore */ }
}

const handleShareAction = async () => {
  try {
    if (navigator.share) {
      await navigator.share({ title: product.value.name, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      await open({ type: 'alert', title: '링크 복사 완료', message: '링크가 복사되었습니다.' })
    }
  } catch (err) { console.log('공유 취소:', err) }
}

const handleWriteFeed = () => {
  if (!isLoggedIn.value) return showLoginRequiredModal('피드를 작성하려면 로그인해주세요.')
  router.push(`/products/${product.value.id}/feed/write`)
}

const handleFeedLike = (feedId) => {
  if (!isLoggedIn.value) return showLoginRequiredModal('좋아요를 누르려면 로그인해주세요.')
  const feed = feeds.value.find(f => f.id === feedId)
  if (feed) {
    feed.liked = !feed.liked
    feed.likes += feed.liked ? 1 : -1
  }
}

const handleCreateBattle = () => {
  if (!isLoggedIn.value) return showLoginRequiredModal('배틀을 만들려면 로그인해주세요.')
  router.push(`/battles/create?productId=${product.value.id}`)
}

const handleVote = (battleId) => {
  if (!isLoggedIn.value) return showLoginRequiredModal('투표하려면 로그인해주세요.')
  router.push(`/battles/${battleId}`)
}

const viewBattle = (battleId) => { router.push(`/battles/${battleId}`) }
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

.product-detail-view { min-height: 100vh; background: #fff; }

/* ===== Header ===== */
.detail-header { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.97); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid #F2F4F6; padding: 0 12px; height: 52px; display: flex; align-items: center; gap: 4px; }
.btn-back { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: none; border: none; border-radius: 10px; cursor: pointer; color: #191F28; transition: background 0.15s ease; flex-shrink: 0; }
.btn-back:active { background: #F2F4F6; }
.back-icon { width: 22px; height: 22px; }
.header-title { flex: 1; font-size: 16px; font-weight: 700; color: #191F28; letter-spacing: -0.02em; margin: 0; padding-left: 4px; }
.header-actions { display: flex; align-items: center; gap: 0; flex-shrink: 0; }
.hdr-action-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: none; border: none; border-radius: 10px; cursor: pointer; color: #4E5968; transition: all 0.15s ease; }
.hdr-action-btn:active { background: #F2F4F6; }
.hdr-action-icon { width: 20px; height: 20px; }
.menu-overlay { position: fixed; inset: 0; z-index: 200; }
.menu-dropdown { position: absolute; top: 48px; right: 12px; background: #fff; border-radius: 12px; border: 1px solid #F2F4F6; box-shadow: 0 4px 24px rgba(0,0,0,0.08); min-width: 160px; padding: 4px; overflow: hidden; }
.menu-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px 12px; background: none; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; color: #191F28; cursor: pointer; transition: background 0.15s ease; text-align: left; }
.menu-item:active { background: #F2F4F6; }
.menu-item--danger { color: #E53935; }
.menu-item--danger:active { background: #FFF5F5; }
.menu-icon { width: 18px; height: 18px; flex-shrink: 0; }
.menu-divider { height: 1px; background: #F2F4F6; margin: 4px 0; }
.menu-enter-active { transition: opacity 0.15s ease; }
.menu-leave-active { transition: opacity 0.1s ease; }
.menu-enter-from, .menu-leave-to { opacity: 0; }

/* ===== Main ===== */
.main-container { max-width: 1200px; margin: 0 auto; padding: 28px 24px; }
.state-box { padding: 80px 24px; text-align: center; }
.state-title { font-size: 16px; font-weight: 600; color: #333; margin: 0 0 6px; }
.state-text { font-size: 14px; color: #888; margin: 0; }
.spinner { width: 28px; height: 28px; border: 2.5px solid #eee; border-top-color: #333; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 16px; }
.spinner.sm { width: 22px; height: 22px; }
@keyframes spin { to { transform: rotate(360deg); } }
.btn-solid { margin-top: 16px; padding: 10px 24px; background: #333; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
.btn-solid:hover { background: #222; }

/* ===== Layout ===== */
.content-layout { display: flex; gap: 48px; }
.main-content { flex: 1; min-width: 0; }
.product-sidebar { width: 360px; flex-shrink: 0; }
.sidebar-sticky { position: sticky; top: 76px; }

/* ===== Tabs ===== */
.tab-bar { position: relative; display: flex; border-bottom: 1px solid #f0f0f0; margin-bottom: 20px; }
.tab { flex: 1; padding: 14px 0; border: none; background: transparent; font-size: 15px; font-weight: 500; color: #aaa; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: color 0.15s; }
.tab:hover { color: #666; }
.tab.active { color: #111; }
.tab-count { font-size: 12px; font-weight: 600; padding: 1px 7px; border-radius: 10px; background: #f0f0f0; color: #888; }
.tab.active .tab-count { background: #111; color: #fff; }
.tab-indicator { position: absolute; bottom: -1px; width: 50%; height: 2px; background: #111; transition: left 0.2s ease; }

/* ===== Tab Content ===== */
.tab-content { display: flex; flex-direction: column; gap: 12px; }

/* Write Box */
.write-box { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #f8f8f8; border-radius: 12px; cursor: pointer; transition: background 0.15s; }
.write-box:hover { background: #f0f0f0; }
.write-avatar { width: 36px; height: 36px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.write-placeholder { flex: 1; font-size: 14px; color: #aaa; }
.write-action { font-size: 14px; font-weight: 600; color: #333; padding: 6px 16px; background: #fff; border-radius: 20px; border: 1px solid #e5e5e5; }

/* Empty / Loading */
.empty-box { padding: 56px 24px; text-align: center; }
.empty-box svg { margin: 0 auto 12px; display: block; }
.empty-title { font-size: 15px; font-weight: 600; color: #333; margin: 0 0 4px; }
.empty-desc { font-size: 13px; color: #aaa; margin: 0; }
.loading-box { padding: 40px 24px; text-align: center; }
.loading-box p { margin: 8px 0 0; font-size: 13px; color: #888; }

/* Buttons */
.btn-more { width: 100%; padding: 13px; background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; font-size: 14px; font-weight: 500; color: #666; cursor: pointer; transition: background 0.15s; }
.btn-more:hover:not(:disabled) { background: #f8f8f8; }
.btn-more:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-outline { padding: 14px; background: #fff; border: 1px solid #e5e5e5; border-radius: 10px; color: #333; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.15s; }
.btn-outline:hover { background: #f8f8f8; }
.btn-outline.full { width: 100%; }

/* ===== Sidebar ===== */
.product-image-wrap { border-radius: 12px; overflow: hidden; background: #f5f5f5; }
.product-image { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }

.product-meta { display: flex; align-items: center; gap: 8px; margin-top: 20px; }
.brand { font-size: 14px; font-weight: 600; color: #333; }
.category { font-size: 12px; color: #888; padding: 3px 8px; background: #f5f5f5; border-radius: 4px; }

.product-name { font-size: 20px; font-weight: 700; color: #111; margin: 10px 0 0; line-height: 1.4; letter-spacing: -0.3px; }

.product-price { font-size: 22px; font-weight: 700; color: #111; margin: 12px 0 0; letter-spacing: -0.3px; }
.won { font-size: 15px; font-weight: 500; color: #888; margin-left: 2px; }

.product-desc { font-size: 14px; line-height: 1.7; color: #666; margin: 16px 0 0; word-break: keep-all; }

/* Info Table */
.info-table { margin-top: 20px; padding: 16px; background: #fafafa; border-radius: 10px; display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; justify-content: space-between; align-items: center; }
.info-key { font-size: 13px; color: #999; }
.info-val { font-size: 13px; color: #333; font-weight: 500; }

/* Tags */
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
.tag { padding: 5px 12px; background: #f5f5f5; color: #666; border-radius: 6px; font-size: 12px; font-weight: 500; }

/* Stats Row */
.stats-row { display: flex; align-items: center; gap: 12px; padding: 16px 0; margin-top: 8px; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
.stat { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #666; font-weight: 500; }
.dot { width: 3px; height: 3px; border-radius: 50%; background: #ddd; }

/* Actions */
.action-bar { display: flex; gap: 0; margin-top: 16px; border: 1px solid #e5e5e5; border-radius: 10px; overflow: hidden; }
.action-btn { flex: 1; padding: 12px 0; background: #fff; border: none; border-right: 1px solid #f0f0f0; font-size: 12px; font-weight: 500; color: #666; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: background 0.15s; }
.action-btn:last-child { border-right: none; }
.action-btn:hover { background: #fafafa; }
.action-btn.on { color: #7c3aed; }
.action-btn span { font-size: 11px; }

/* Carrier Button */
.carrier-btn { width: 100%; margin-top: 10px; padding: 14px; background: #111; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.15s; }
.carrier-btn:hover { background: #222; }
.carrier-btn.on { background: #f5f3ff; color: #7c3aed; border: 1px solid #e9e5f5; }
.carrier-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Activity */
.activity-row { display: flex; align-items: center; margin-top: 16px; padding: 16px 0; }
.activity-item { flex: 1; text-align: center; }
.activity-num { display: block; font-size: 20px; font-weight: 700; color: #111; }
.activity-label { display: block; font-size: 12px; color: #aaa; margin-top: 2px; }
.activity-div { width: 1px; height: 32px; background: #f0f0f0; }

/* Feed/Battle Card Border */
.tab-content :deep(.feed-image img) { aspect-ratio: 4 / 3; object-fit: cover; width: 100%; max-height: none; }
.tab-content :deep(.feed-card),
.tab-content :deep(.battle-card) { border: 1px solid #f0f0f0; border-radius: 12px; }

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .content-layout { flex-direction: column-reverse; gap: 24px; }
  .product-sidebar { width: 100%; }
  .sidebar-sticky { position: relative; top: 0; display: flex; flex-wrap: wrap; gap: 20px; }
  .product-image-wrap { width: 200px; flex-shrink: 0; }
  .product-meta, .product-name, .product-price { margin-top: 0; }
  .product-info-block { flex: 1; }
  .product-desc, .info-table, .tags, .stats-row, .action-bar, .carrier-btn, .activity-row { display: none; }
}

@media (max-width: 768px) {
  .main-container { padding: 16px; }
  .detail-header { padding: 0 8px; }
  .sidebar-sticky { flex-direction: column; }
  .product-image-wrap { width: 100%; }
  .product-desc, .info-table, .tags { display: block; }
  .stats-row, .action-bar, .carrier-btn, .activity-row { display: flex; }
}
</style>
