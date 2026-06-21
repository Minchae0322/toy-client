<template>
  <div class="info-section">
    <div class="info-content">
      <section class="review-section">
        <div class="badge-row">
          <div :class="['eval-badge', getEvaluationClass(feed.feedEvaluation)]">
            <span class="eval-dot" />
            {{ getEvaluationLabel(feed.feedEvaluation) }}
          </div>
          <div v-if="feed.isTrending" class="trend-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            급상승
          </div>
          <span class="category-breadcrumb">
            카테고리 <span class="breadcrumb-arrow">›</span> {{ getCategoryName }}
          </span>
        </div>

        <div class="quote-wrapper">
          <svg class="quote-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
          <p class="review-text">{{ feed.review }}</p>
        </div>
      </section>

      <!-- 제품 연동 O: 캐노니컬 정보 + 상태별 스타일 -->
      <section
          v-if="hasProduct"
          :class="['product-info-banner', `status-${productStatusLower}`, { 'is-clickable': productLinkable }]"
          :role="productLinkable ? 'link' : null"
          :tabindex="productLinkable ? 0 : null"
          @click="handleProductBannerClick"
          @keydown.enter="handleProductBannerClick"
      >
        <div class="product-main">
          <span class="buy-place">
            <svg class="place-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {{ feed.buyPlace || '미등록' }}
          </span>
          <div class="product-title-row">
            <h1 class="product-title">{{ getProductName }}</h1>
            <ProductStatusBadge :status="productStatus" size="md" />
          </div>
        </div>
        <div class="price-area">
          <span class="price-label">구매가</span>
          <span class="price-value">{{ formattedBuyPrice }}</span>
        </div>
      </section>

      <!-- 연동 제품 상세 정보 (product 있을 때만, 배너 아래) -->
      <section v-if="hasProduct" :class="['linked-product-card', `status-${productStatusLower}`]">
        <div class="linked-product-header">
          <span class="linked-product-label">연동 제품</span>
          <button
              v-if="productLinkable"
              type="button"
              class="linked-product-detail-btn"
              @click="goToProductDetail"
          >
            상세보기
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
        <div class="linked-product-body">
          <img
              v-if="productThumbnailUrl"
              :src="productThumbnailUrl"
              :alt="feed.product?.name"
              class="linked-product-thumb"
              @click="productLinkable && goToProductDetail()"
              :class="{ 'is-clickable': productLinkable }"
          />
          <div v-else class="linked-product-thumb linked-product-thumb-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <div class="linked-product-meta">
            <span v-if="feed.product?.brand" class="linked-product-brand">{{ feed.product.brand }}</span>
            <span class="linked-product-name">{{ feed.product?.name }}</span>
            <span v-if="formattedOfficialPrice" class="linked-product-price">
              <span class="linked-product-price-label">정가</span>
              {{ formattedOfficialPrice }}
            </span>
          </div>
        </div>
        <p v-if="statusHelpText" class="linked-product-status-help">{{ statusHelpText }}</p>
      </section>

      <!-- 제품 연동 X: 사용자가 직접 입력한 상품명만 노출 -->
      <section
          v-else
          class="product-info-banner is-custom is-clickable"
          role="button"
          tabindex="0"
          @click="handleProductBannerClick"
          @keydown.enter="handleProductBannerClick"
      >
        <div class="product-main">
          <span class="buy-place">
            <svg class="place-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {{ feed.buyPlace || '미등록' }}
          </span>
          <div class="product-title-row">
            <h1 class="product-title">{{ feed.productNameCustom || '상품명 미등록' }}</h1>
            <span class="custom-tag">직접 입력</span>
          </div>
        </div>
        <div class="price-area">
          <span class="price-label">구매가</span>
          <span class="price-value">{{ formattedBuyPrice }}</span>
        </div>
      </section>

      <section class="interaction-bar">
        <div class="stat-group">
          <button
              :class="['stat-btn', { active: feed.userReactions?.hasLike }]"
              @click="$emit('like')"
          >
            <svg class="icon" viewBox="0 0 24 24" :fill="feed.userReactions?.hasLike ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{{ feed.likeCount || 0 }}</span>
          </button>
          <button class="stat-btn" @click="$emit('scroll-to-comments')">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{{ feed.commentCount || 0 }}</span>
          </button>
        </div>
        <button :class="['bookmark-btn', { active: isSaved }]" @click="$emit('save')">
          <svg class="icon" viewBox="0 0 24 24" :fill="isSaved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </section>

      <section v-if="feed.hashtags?.length" class="hashtag-section">
        <button
            v-for="tag in feed.hashtags"
            :key="tag.hashtagId"
            class="tag-chip"
            @click="$emit('search-hashtag', tag.name)"
        >
          #{{ tag.name }}
        </button>
      </section>
    </div>

    <div class="info-footer">
      <!-- 등록일시 · 조회수 (우측) -->
      <div class="post-meta">
        {{ formatDate(feed.createdAt) }} · 조회 {{ feed.viewCount?.toLocaleString() }}
      </div>
      <div class="divider" />

      <section class="author-section">
        <div class="author-click-zone" role="link" tabindex="0" @click="goToUser" @keydown.enter="goToUser">
          <img :src="getAuthorProfileImage" class="author-avatar" alt="" @error="onAvatarError" />
          <div class="author-meta">
            <div class="nickname-row">
              <span class="author-name">{{ getAuthorNickname }}</span>
              <UserLevelTag v-if="userLevel != null" :level="userLevel" size="xs" variant="dark" />
              <UserBadgeInline v-if="primaryBadgeId" :badge-id="primaryBadgeId" size="xs" />
            </div>
            <div v-if="tierName" class="tier-meta">
              <span class="tier-name" :style="{ color: tierMeta?.color }">{{ tierName }}</span>
            </div>
          </div>
        </div>
        <div class="author-actions">
          <button
              @click="isFollowing ? $emit('unfollow') : $emit('follow')"
              :class="['follow-btn', { active: isFollowing }]"
          >
            {{ isFollowing ? '팔로잉' : '팔로우' }}
          </button>
          <button class="message-btn" @click="handleSendMessage" :disabled="isCreatingChatRoom">
            <svg v-if="!isCreatingChatRoom" class="message-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H6l-4 4V6c0-1.1.9-2 2-2z"/>
              <line x1="9" y1="10" x2="15" y2="10"/>
              <line x1="9" y1="14" x2="13" y2="14"/>
            </svg>
            {{ isCreatingChatRoom ? '...' : '메시지' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ProductStatusBadge from '@/components/product/ProductStatusBadge.vue'
import UserLevelTag from '@/components/identity/UserLevelTag.vue'
import UserBadgeInline from '@/components/identity/UserBadgeInline.vue'
import { getTierByLevel } from '@/data/levelSystemData.js'
import { resolveProfileImage, onAvatarError } from '@/utils/defaultAvatar'

const props = defineProps({
  feed: { type: Object, required: true },
  isFollowing: { type: Boolean, default: false },
  isSaved: { type: Boolean, default: false }
})

const emit = defineEmits(['follow', 'unfollow', 'like', 'save', 'search-store', 'search-hashtag', 'scroll-to-comments', 'send-message'])

const isCreatingChatRoom = ref(false)

/* 헬퍼 함수 및 계산된 속성 */
const hasProduct = computed(() => !!props.feed?.product?.id)

const productStatus = computed(() => {
  const raw = props.feed?.product?.productStatus
  return (typeof raw === 'string' ? raw : raw?.title || raw?.code || '')?.toUpperCase() || null
})

const productStatusLower = computed(() => (productStatus.value || 'unknown').toLowerCase())
const productApproved = computed(() => !productStatus.value || productStatus.value === 'APPROVED')
const productLinkable = computed(() => hasProduct.value && productApproved.value)

// 제품 연동 O 케이스 전용. 캐노니컬 이름을 우선 노출 (REJECTED/DELETED는 strikethrough로 시각 표현)
const getProductName = computed(() =>
  props.feed?.product?.name || props.feed?.productNameCustom || '상품 정보'
)

const statusHelpText = computed(() => ({
  PENDING: '관리자 승인 대기 중인 제품입니다.',
  REJECTED: '반려된 제품이라 상세 페이지로 이동할 수 없습니다.',
  DELETED: '삭제된 제품이라 상세 페이지로 이동할 수 없습니다.'
}[productStatus.value] || ''))

const formattedBuyPrice = computed(() => {
  const p = props.feed?.buyPrice
  if (p == null) return '가격정보 없음'
  if (p === 0) return '무료'
  return formatPrice(p)
})

const formattedOfficialPrice = computed(() => {
  const p = props.feed?.product?.price
  if (p == null || p === '') return ''
  const n = Number(String(p).replace(/,/g, ''))
  return Number.isFinite(n) ? n.toLocaleString() + '원' : String(p)
})

const productThumbnailUrl = computed(() =>
  props.feed?.product?.thumbnailDto?.fileUrl || ''
)

const getCategoryName = computed(() => props.feed?.subCategoryDetail?.subCategoryName || props.feed?.subCategoryDetail?.categoryName || '카테고리')

const router = useRouter()

const handleProductBannerClick = () => {
  if (productLinkable.value) {
    router.push({ name: 'ProductDetail', params: { id: props.feed.product.id } })
  } else {
    // 미연동/PENDING/REJECTED/DELETED: 구매처 검색으로 폴백
    emit('search-store', getProductName.value)
  }
}

const goToProductDetail = () => {
  if (props.feed?.product?.id) {
    router.push({ name: 'ProductDetail', params: { id: props.feed.product.id } })
  }
}
const getAuthorProfileImage = computed(() => resolveProfileImage(props.feed?.userInfo?.profileImageFile?.fileUrl, props.feed?.userInfo?.profileImageUrl, props.feed?.userInfo?.profileImgUrl))
const getAuthorNickname = computed(() => props.feed?.userInfo?.nickname || '사용자')

// userRewardInfo 필드 규약 (백엔드 RewardResponse.UserRewardInfo):
//  - level / tier / totalExp / currentLevelExp / nextLevelExp / maxLevel / seasonExp / seasonCode
//  - nextLevelExp 는 "다음 레벨까지 남은" EXP (threshold 아님)
const userLevel = computed(() => props.feed?.userRewardInfo?.level ?? null)

const tierMeta = computed(() => userLevel.value != null ? getTierByLevel(userLevel.value) : null)
const tierName = computed(() => tierMeta.value?.name ?? '')

const primaryBadgeId = computed(() => {
  const u = props.feed?.userInfo
  return u?.primaryBadgeId || u?.representativeBadgeId || (Array.isArray(u?.badgeIds) ? u.badgeIds[0] : null)
})

const goToUser = () => {
  const userId = props.feed?.userInfo?.userId
  if (userId != null) router.push({ name: 'UserFeedList', params: { userId: String(userId) } })
}

const formatDate = (date) => date ? new Date(date).toLocaleDateString('ko-KR') : ''
const formatPrice = (price) => {
  if (!price && price !== 0) return '가격 미정'
  const s = String(price).replace(/,/g, '').trim()
  const m = s.match(/^(\d+)\s*~\s*(\d+)$/)
  if (m) return Number(m[1]).toLocaleString() + ' ~ ' + Number(m[2]).toLocaleString() + '원'
  const n = Number(s)
  return isNaN(n) ? '가격 미정' : n.toLocaleString() + '원'
}

const getEvaluationLabel = (ev) => {
  const code = typeof ev === 'string' ? ev : ev?.code
  return { 'BEST': '강추', 'GOOD': '추천', 'OKAY': '괜찮음', 'BAD': '비추천' }[code] || '평가 정보'
}

const getEvaluationClass = (ev) => {
  const code = typeof ev === 'string' ? ev : ev?.code
  return code?.toLowerCase() || ''
}

const handleSendMessage = () => {
  if (isCreatingChatRoom.value) return
  emit('send-message', props.feed)
}
</script>

<style scoped>
/* 색상: var(--text-primary) / var(--c-text-600) / var(--c-text-400) / var(--c-text-300) (토스 계열) */
/* 간격: 4px 그리드 */

.info-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 20px 24px;
  background: var(--bg-elevated);
}

.info-content { flex: 1; }
.info-footer { margin-top: auto; }

/* 리뷰 섹션 */
.review-section { margin-bottom: 20px; }

.badge-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }

.category-breadcrumb {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-400);
  letter-spacing: -0.01em;
}
.breadcrumb-arrow { margin: 0 2px; color: var(--c-text-300); }

/* 뱃지 */
.eval-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 100px;
  font-size: 12px; font-weight: 700;
}
.eval-badge.best { background-color: rgba(254,243,199,0.92); color: var(--c-warning); }
.eval-badge.good { background-color: rgba(220,252,231,0.92); color: var(--c-success); }
.eval-badge.okay { background-color: rgba(243,232,255,0.92); color: var(--c-brand); }
.eval-badge.bad { background-color: rgba(254,226,226,0.92); color: var(--c-danger); }

.eval-dot { width: 6px; height: 6px; border-radius: 50%; background-color: currentColor; opacity: 0.6; }

.trend-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 12px; border-radius: 100px;
  background: var(--c-danger);
  font-size: 12px; font-weight: 700; color: white;
  animation: pulse-trend 2s ease-in-out infinite;
}
@keyframes pulse-trend {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

/* 리뷰 텍스트 */
.quote-wrapper { position: relative; padding-left: 28px; }
.quote-icon {
  position: absolute; left: 0; top: 2px;
  width: 18px; height: 18px; color: var(--c-brand); opacity: 0.3;
}
.review-text {
  font-size: 16px; line-height: 1.7; color: var(--text-primary);
  font-weight: 600; white-space: pre-line; margin: 0;
  letter-spacing: -0.02em; word-break: keep-all;
  overflow-wrap: anywhere;
}

/* 제품 배너 */
.product-info-banner {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--bg-subtle); padding: 16px 20px; border-radius: 12px;
  margin-bottom: 16px; border: none;
  cursor: pointer; transition: all 0.15s ease;
}
.product-info-banner.is-clickable:hover { background: var(--bg-mute); }
.product-info-banner.is-clickable:active { transform: scale(0.98); background: var(--bg-mute); }

/* 상태별 스타일 */
.product-info-banner.status-pending {
  background: var(--c-warning-soft);
  box-shadow: inset 0 0 0 1px var(--c-warning);
}
.product-info-banner.status-pending .product-title { color: var(--c-warning); }

.product-info-banner.status-rejected,
.product-info-banner.status-deleted {
  background: var(--bg-subtle);
}
.product-info-banner.status-rejected .product-title,
.product-info-banner.status-deleted .product-title {
  color: var(--c-text-500);
  text-decoration: line-through;
}

.product-info-banner.is-custom { background: var(--bg-subtle); }
.custom-tag {
  display: inline-flex; align-items: center;
  padding: 3px 8px; border-radius: 6px;
  background: var(--border-default); color: var(--c-text-600);
  font-size: 10.5px; font-weight: 700;
  letter-spacing: -0.1px; flex-shrink: 0; white-space: nowrap;
}

/* 연동 제품 카드 (배너 아래) */
.linked-product-card {
  margin-top: -8px; /* 배너와의 간격 살짝 좁게 */
  margin-bottom: 16px;
  padding: 14px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--bg-mute);
  border-radius: 12px;
}
.linked-product-card.status-pending {
  background: var(--c-warning-soft);
  border-color: var(--c-warning);
}
.linked-product-card.status-rejected,
.linked-product-card.status-deleted {
  background: var(--bg-subtle);
  border-color: var(--border-default);
}

.linked-product-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px;
}
.linked-product-label {
  font-size: 11px; font-weight: 700;
  color: var(--c-text-400); letter-spacing: -0.1px;
  text-transform: uppercase;
}
.linked-product-detail-btn {
  display: inline-flex; align-items: center; gap: 2px;
  padding: 4px 8px 4px 10px; border: none; border-radius: 6px;
  background: transparent; color: var(--c-brand);
  font-size: 12px; font-weight: 700; letter-spacing: -0.1px;
  cursor: pointer; transition: background 0.15s ease;
}
.linked-product-detail-btn:hover { background: var(--c-brand-soft); }
.linked-product-detail-btn .arrow-icon { width: 14px; height: 14px; }

.linked-product-body {
  display: flex; align-items: center; gap: 12px;
}
.linked-product-thumb {
  width: 60px; height: 60px;
  border-radius: 10px; object-fit: cover;
  background: var(--bg-mute); flex-shrink: 0;
  border: 1px solid var(--bg-mute);
}
.linked-product-thumb.is-clickable { cursor: pointer; }
.linked-product-thumb.is-clickable:hover { opacity: 0.92; }
.linked-product-thumb-empty {
  display: flex; align-items: center; justify-content: center;
  color: var(--c-text-300);
}
.linked-product-thumb-empty svg { width: 24px; height: 24px; }

.linked-product-meta {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 2px;
}
.linked-product-brand {
  font-size: 11.5px; font-weight: 600;
  color: var(--c-text-400); letter-spacing: -0.1px;
}
.linked-product-name {
  font-size: 14px; font-weight: 700;
  color: var(--text-primary); letter-spacing: -0.01em;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.linked-product-price {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 13px; font-weight: 700;
  color: var(--text-primary); letter-spacing: -0.01em;
  margin-top: 2px;
}
.linked-product-price-label {
  font-size: 10.5px; font-weight: 600;
  color: var(--c-text-400); letter-spacing: -0.1px;
}

.linked-product-status-help {
  margin: 12px 0 0;
  padding-top: 10px;
  border-top: 1px dashed var(--border-default);
  font-size: 11.5px; font-weight: 500;
  color: var(--c-text-500); letter-spacing: -0.01em;
}
.linked-product-card.status-rejected .linked-product-name,
.linked-product-card.status-deleted .linked-product-name {
  color: var(--c-text-500);
  text-decoration: line-through;
}
.product-main { min-width: 0; flex: 1; }
.buy-place {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 600; color: var(--c-brand); margin-bottom: 4px;
}
.place-icon { width: 13px; height: 13px; flex-shrink: 0; }
.product-title-row {
  display: flex; align-items: center; gap: 8px; min-width: 0;
}
.product-title {
  font-size: 16px; font-weight: 700; color: var(--text-primary);
  margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  letter-spacing: -0.02em; min-width: 0;
}
.price-area { text-align: right; flex-shrink: 0; margin-left: 16px; }
.price-label { display: block; font-size: 11px; color: var(--c-text-400); margin-bottom: 2px; font-weight: 500; }
.price-value { font-size: 17px; font-weight: 700; color: var(--c-brand); white-space: nowrap; letter-spacing: -0.02em; }

/* 인터랙션 바 */
.interaction-bar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; padding: 12px 0;
  border-bottom: 1px solid var(--bg-mute);
}
.stat-group { display: flex; gap: 12px; }
.stat-btn {
  display: flex; align-items: center; gap: 4px;
  background: none; border: none; padding: 0;
  font-size: 14px; font-weight: 600; color: var(--c-text-400);
  cursor: pointer; transition: color 0.15s ease;
}
.stat-btn .icon { width: 20px; height: 20px; }
.stat-btn.active { color: var(--c-danger); }
.bookmark-btn {
  background: none; border: none; padding: 0;
  color: var(--c-text-400); cursor: pointer; transition: color 0.15s ease;
}
.bookmark-btn .icon { width: 22px; height: 22px; }
.bookmark-btn.active { color: var(--c-brand); }

/* 해시태그 */
.hashtag-section { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.tag-chip {
  padding: 6px 12px; border-radius: 8px;
  background: var(--bg-mute); border: none;
  font-size: 13px; font-weight: 500; color: var(--c-text-600);
  cursor: pointer; transition: background 0.15s ease;
}
.tag-chip:active { background: var(--border-default); }

/* 메타 */
.post-meta {
  text-align: right;
  font-size: 12px; color: var(--c-text-300);
  font-weight: 400; margin-bottom: 12px;
}

.divider { height: 1px; background: var(--bg-mute); margin-bottom: 16px; }

/* 작성자 */
.author-section { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.author-click-zone { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; cursor: pointer; }
.author-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  object-fit: cover; border: 1px solid var(--bg-mute);
  display: block;
  flex-shrink: 0;
}
.author-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.nickname-row { display: flex; align-items: center; gap: 6px; min-width: 0; flex-wrap: wrap; }
.author-name {
  font-size: 15px; font-weight: 700;
  color: var(--text-primary); letter-spacing: -0.01em;
}
.tier-meta {
  display: flex; align-items: center; gap: 4px;
  font-size: 11.5px; font-weight: 600;
  letter-spacing: -0.1px; line-height: 1;
}
.tier-meta .tier-name { font-weight: 700; }
.author-actions { display: flex; gap: 8px; }
.follow-btn {
  padding: 8px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 700; border: none;
  background: var(--c-ink-900); color: #ffffff;
  cursor: pointer; transition: all 0.15s ease;
}
.follow-btn:active { transform: scale(0.96); }
.follow-btn.active { background: var(--bg-mute); color: var(--c-text-400); }
.message-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 8px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 700; border: none;
  background: var(--c-brand); color: #ffffff;
  cursor: pointer; transition: all 0.15s ease;
}
.message-btn:active { transform: scale(0.96); }
.message-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.message-icon { width: 14px; height: 14px; flex-shrink: 0; }
</style>