<template>
  <div class="soft-modern-v1">
    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>배틀 정보를 불러오는 중...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="loadBattle" class="btn-retry">다시 시도</button>
    </div>

    <!-- Content -->
    <template v-else-if="battle">
      <!-- Battle Info (전체 너비) -->
      <BattleInfoCard
          :battle="battle"
          :is-weighted-vote="isWeightedVote"
          :can-user-add-item="showAddItemButton"
          :is-creator="isCreator"
          @add-product="handleAddProduct"
          @back="goBack"
          @share="shareBattle"
          @report="handleReport"
      />

      <main class="content-wrapper">
        <!-- Vote Selection Bar -->
        <VoteSelectionBar
            v-if="canVote && hasSelectedItems"
            :selected-ranks="selectedRanks"
            :is-weighted-vote="isWeightedVote"
            :sorted-items="sortedItems"
            :submitting="submitting"
            :get-item-name="getItemName"
            @submit="submitVote"
            @remove="handleRemoveRank"
        />

        <!-- Product Grid -->
        <div class="pc-grid">
          <ProductCard
              v-for="(item, index) in displayedItems"
              :key="item.id"
              :ref="el => setProductCardRef(item.id, el)"
              :item="item"
              :battle-id="battleId"
              :display-rank="item.rank || (index + 1)"
              :product-rank="getProductRank(item.id)"
              :is-weighted-vote="isWeightedVote"
              :can-vote="canVote"
              :submitting="submitting"
              :percentage="getPercentage(item)"
              @vote="handleVote"
              @open-comments="scrollToComments"
              @submit-comment="handleInlineComment"
              @play-youtube="playYoutube"
          />
        </div>

        <!-- 더 보기 / 접기 -->
        <div v-if="sortedItems.length > itemsDisplayLimit" class="items-toggle-wrap">
          <button
              type="button"
              class="items-toggle-btn"
              @click="itemsExpanded = !itemsExpanded"
          >
            <template v-if="!itemsExpanded">
              <span>아이템 {{ hiddenItemsCount }}개 더 보기</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </template>
            <template v-else>
              <span>접기</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
            </template>
          </button>
        </div>

        <!-- PC 디바이더 -->
        <div class="pc-divider"></div>

        <!-- 전체 PICK 한마디 섹션 -->
        <section ref="argumentsSection" class="pc-arguments-section" v-if="hasComments">
          <!-- 필터 배너 (아이템 필터 적용 시) -->
          <div v-if="selectedItemFilter" class="filter-banner">
            <div class="filter-banner-content">
              <img :src="getItemImageById(selectedItemFilter)" :alt="filteredItemName" class="filter-item-img" />
              <div class="filter-info">
                <span class="filter-label">현재 보는 중</span>
                <span class="filter-name">{{ filteredItemName }}</span>
              </div>
            </div>
            <button class="clear-filter-btn" @click="clearItemFilter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              전체 PICK 보기
            </button>
          </div>

          <div class="section-heading">
            <div>
              <h2>
                {{ selectedItemFilter ? `${filteredItemName}의 PICK 한마디` : '전체 PICK 한마디' }}
                <span class="comment-total-count">{{ totalCommentCount }}</span>
              </h2>
              <p class="sub">참여자들의 생생한 PICK 한마디를 확인하세요</p>
            </div>
          </div>

          <div class="pc-tab-container">
            <div class="pc-tab-header">
              <button
                :class="['pc-tab-btn', { active: commentSortType === 'likeCount' }]"
                @click="commentSortType = 'likeCount'"
              >
                공감순
              </button>
              <button
                :class="['pc-tab-btn', { active: commentSortType === 'createdAt' }]"
                @click="commentSortType = 'createdAt'"
              >
                최신순
              </button>
            </div>

            <div class="pc-tab-content">
              <!-- 아이템 선택 안내 (필터 없을 때) — 사용자에게 다음 액션을 명확히 안내 -->
              <button
                v-if="!selectedItemFilter"
                type="button"
                class="comment-picker-prompt"
                :class="{ 'is-expanded': pickerExpanded }"
                @click="scrollToFirstItem"
              >
                <span class="picker-text">
                  <span class="picker-title">한마디 남길 아이템 선택</span>
                  <span class="picker-sub">위 아이템 카드의 <strong>‘PICK 한마디’</strong> 영역을 눌러 선택해 주세요</span>
                </span>
                <span
                  class="picker-toggle"
                  role="button"
                  :aria-label="pickerExpanded ? '설명 접기' : '설명 펼치기'"
                  :aria-expanded="pickerExpanded ? 'true' : 'false'"
                  @click.stop="pickerExpanded = !pickerExpanded"
                >
                  <svg class="toggle-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </span>
                <span class="picker-cta">아이템 보러가기</span>
              </button>

              <!-- 인라인 작성창 — 아이템(필터) 선택 시에만 표시 -->
              <form
                v-else
                class="inline-comment-form"
                @submit.prevent="submitInlineComment"
              >
                <img
                  :src="getItemImageById(selectedItemFilter)"
                  :alt="filteredItemName"
                  class="inline-comment-thumb"
                />
                <input
                  v-model="inlineCommentText"
                  type="text"
                  class="inline-comment-input"
                  :placeholder="`${filteredItemName}에 한마디 남기기 (100자 이내)`"
                  :disabled="submittingInlineComment"
                  maxlength="100"
                />
                <button
                  type="submit"
                  class="inline-comment-submit"
                  :disabled="!inlineCommentText.trim() || submittingInlineComment"
                >
                  {{ submittingInlineComment ? '작성 중...' : '작성' }}
                </button>
              </form>

              <!-- 로딩 -->
              <div v-if="commentsLoading && allLoadedComments.length === 0" class="loading-comments">
                <div class="spinner-small"></div>
                <span>코멘트 불러오는 중...</span>
              </div>

              <!-- 빈 상태 -->
              <div v-else-if="sortedComments.length === 0" class="empty-comments">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>아직 PICK 한마디가 없어요</p>
                <span>첫 번째 PICK 한마디를 남겨보세요!</span>
              </div>

              <div v-else class="pc-arg-grid">
                <div
                  v-for="(comment, index) in sortedComments"
                  :key="comment.commentId"
                  :class="['pc-arg-card', { best: index === 0 && commentSortType === 'likeCount' }]"
                  @click="scrollToItem(comment.itemId)"
                >
                  <img
                    class="arg-product-img"
                    :src="getItemImageById(comment.itemId)"
                    :alt="getItemNameById(comment.itemId)"
                  />
                  <div class="arg-body">
                    <div class="arg-meta">
                      <span class="arg-product-name">{{ getItemNameById(comment.itemId) }}</span>
                      <span v-if="index === 0 && commentSortType === 'likeCount'" class="best-badge">BEST</span>
                    </div>
                    <p class="arg-text">{{ comment.content }}</p>
                    <div class="arg-footer">
                      <div class="arg-user">
                        <img
                          v-if="comment.creatorProfileImageUrl && !failedProfileImages[comment.creatorProfileImageUrl]"
                          class="arg-user-avatar"
                          :src="comment.creatorProfileImageUrl"
                          :alt="comment.creatorNickname"
                          @error="handleProfileImageError(comment.creatorProfileImageUrl)"
                        />
                        <div v-else class="arg-user-avatar">{{ getAvatarInitial(comment.creatorNickname) }}</div>
                        <span>{{ comment.creatorNickname }} · {{ formatTimeAgo(comment.createdAt) }}</span>
                      </div>
                      <button
                        class="like-btn"
                        :class="{ liked: comment.hasLiked }"
                        @click.stop="handleCommentLike(comment)"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" :fill="comment.hasLiked ? 'currentColor' : 'none'">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        {{ comment.likeCount }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 더보기 버튼 -->
              <div v-if="commentsHasNext && !commentsLoading" class="load-more-comments">
                <button
                  class="load-more-btn"
                  :disabled="commentsLoading"
                  @click="loadMoreComments"
                >
                  <template v-if="commentsLoading">
                    <div class="spinner-small"></div>
                    불러오는 중...
                  </template>
                  <template v-else>
                    더보기
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polyline points="6 9 12 15 18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </template>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- 모바일 플로팅: 필터 활성 시 전체 PICK 빠른 해제 -->
      <button
          v-if="selectedItemFilter"
          class="mobile-floating-filter"
          :class="{ 'is-hidden': floatingFilterHidden }"
          @click="clearItemFilter"
      >
        <img
            v-if="getItemImageById(selectedItemFilter)"
            :src="getItemImageById(selectedItemFilter)"
            :alt="filteredItemName"
            class="floating-filter-thumb"
        />
        <span class="floating-filter-name">{{ filteredItemName }}</span>
        <span class="floating-filter-divider"></span>
        <span class="floating-filter-action">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          전체 PICK
        </span>
      </button>

      <!-- Add Product Modal -->
      <AddProductModal
          v-if="showAddModal"
          ref="addModalRef"
          :battle-id="battleId"
          @close="closeAddModal"
          @submit-image="submitImageItem"
          @select-product="submitSelectedProduct"
          @submit-youtube="submitYoutubeProduct"
      />

      <!-- Creator/Admin Floating Panel -->
      <BattleCreatorPanel
          :battle="battle"
          :battle-id="battleId"
          :is-creator="isCreator"
          :is-admin="isAdmin"
          @refresh="loadBattle"
      />

      <!-- Share Modal -->
      <ShareModal
          :visible="showShareModal"
          :title="battle?.title || ''"
          :description="battle?.description || ''"
          :image="getBattleImage()"
          @close="closeShareModal"
      />

      <!-- Report Modal -->
      <ReportModal
          v-if="battle"
          v-model:visible="showReportModal"
          target="battle"
          :target-id="battleId"
          :target-user-id="battle.creatorUserInfo?.userId"
          :target-user-nickname="battle.creatorUserInfo?.nickname || ''"
          :target-user-profile-image="battle.creatorUserInfo?.profileImage || ''"
          @submitted="handleReportSubmitted"
      />

      <!-- Comment Modal -->
      <BattleCommentModal
          :visible="showCommentModal"
          :battle-id="battleId"
          :item-id="selectedCommentItem?.id"
          :item-name="getItemName(selectedCommentItem)"
          :item-image="getItemImage(selectedCommentItem)"
          @close="closeCommentModal"
          @comment-created="handleCommentCreated"
      />

      <!-- Winner Celebration Modal (종료된 배틀, 세션당 1회) -->
      <Teleport to="body">
        <Transition name="winner-modal">
          <div
              v-if="showWinnerModal && displayWinnerData"
              class="winner-modal-overlay"
              @click.self="closeWinnerModal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="winner-modal-title"
          >
            <div :class="['winner-modal-card', `tier-${winnerEffectTier}`]">
              <div v-if="showConfetti" class="confetti-layer" aria-hidden="true">
                <span
                    v-for="piece in confettiPieces"
                    :key="piece.id"
                    class="confetti-piece"
                    :style="piece.style"
                ></span>
              </div>

              <button class="winner-modal-close" @click="closeWinnerModal" aria-label="닫기">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              <div class="winner-modal-header">
                <component :is="tierIconComponent" class="winner-modal-trophy" :size="22" :stroke-width="2.5" />
                <span class="winner-modal-label">{{ tierLabel }}</span>
                <span id="winner-modal-title" class="winner-modal-sub">{{ tierSubLabel }}</span>
              </div>

              <div class="winner-modal-body">
                <div class="winner-modal-img-wrap">
                  <img :src="getItemImage(displayWinnerData.item)" :alt="getItemName(displayWinnerData.item)" class="winner-modal-img" />
                  <span v-if="winnerEffectTier !== 'consolation'" class="winner-modal-crown" aria-hidden="true">
                    <Crown v-if="winnerEffectTier === 'gold'" :size="18" :stroke-width="2.5" />
                    <span v-else class="rank-num">{{ displayWinnerData.rank }}</span>
                  </span>
                </div>
                <div v-if="displayWinnerData.isMyPick" class="winner-modal-mypick-tag">MY PICK</div>
                <div class="winner-modal-name">{{ getItemName(displayWinnerData.item) }}</div>
                <div class="winner-modal-stats">
                  <span class="winner-modal-pct">{{ getPercentage(displayWinnerData.item) }}%</span>
                  <span class="winner-modal-divider"></span>
                  <span class="winner-modal-count">
                    {{ isWeightedVote ? `${displayWinnerData.item.totalScore || 0}점` : `${displayWinnerData.item.voteCount || 0}표` }}
                  </span>
                  <span class="winner-modal-divider"></span>
                  <span class="winner-modal-rank">{{ displayWinnerData.rank }}위</span>
                </div>
              </div>

              <button class="winner-modal-cta" @click="closeWinnerModal">
                결과 확인하기
              </button>

              <button
                  type="button"
                  class="winner-modal-mute"
                  @click="dismissWinnerModalForWeek"
              >
                일주일간 다시 보지 않기
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- YouTube Player Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showYoutubePlayer" class="youtube-modal-overlay" @click.self="closeYoutubePlayer">
            <div class="youtube-modal">
              <button class="youtube-modal-close" @click="closeYoutubePlayer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <div class="youtube-player-wrapper">
                <iframe
                    v-if="currentYoutubeEmbedUrl"
                    :src="currentYoutubeEmbedUrl"
                    frameborder="0"
                    allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    playsinline
                    allowfullscreen
                ></iframe>
              </div>
              <div v-if="currentYoutubeItem" class="youtube-modal-info">
                <h3>{{ getItemName(currentYoutubeItem) }}</h3>
                <a v-if="currentYoutubeItem.contentUrl" :href="currentYoutubeItem.contentUrl" target="_blank" class="youtube-original-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  YouTube에서 보기
                </a>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
</template>

<script>
import { battleService } from '@/services/BattleService.js'
import { getUserId, getCurrentUser } from '@/utils/auth.js'
import { normalizeYoutubeEmbedUrl } from '@/utils/youtubeEmbed.js'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { showExpGrant } from '@/composables/useExpToast'
import ShareModal from '@/components/common/ShareModal.vue'
import ReportModal from '@/components/common/ReportModal.vue'
import BattleInfoCard from '@/components/battle/detail/BattleInfoCard.vue'
import VoteSelectionBar from '@/components/battle/detail/VoteSelectionBar.vue'
import ProductCard from '@/components/battle/detail/ProductCard.vue'
import AddProductModal from '@/components/battle/detail/AddProductModal.vue'
import BattleCommentModal from '@/components/battle/detail/BattleCommentModal.vue'
import BattleCreatorPanel from '@/components/battle/detail/BattleCreatorPanel.vue'
import { Trophy, Crown, Award, Medal, Heart } from 'lucide-vue-next'

export default {
  name: 'BattleDetail',
  components: {
    ShareModal,
    ReportModal,
    BattleInfoCard,
    VoteSelectionBar,
    ProductCard,
    AddProductModal,
    BattleCommentModal,
    BattleCreatorPanel,
    Trophy,
    Crown,
    Award,
    Medal,
    Heart
  },
  setup() {
    const { open, openLoginRequired } = useConfirmDialog()
    return { open, openLoginRequired }
  },
  data() {
    return {
      battleId: null,
      battle: null,
      loading: true,
      error: null,
      selectedRanks: { 1: null, 2: null, 3: null },
      hasVoted: false,
      submitting: false,
      showAddModal: false,
      showShareModal: false,
      showReportModal: false,
      showCommentModal: false,
      selectedCommentItem: null,
      inlineCommentText: '',
      submittingInlineComment: false,
      commentSortType: 'likeCount',
      failedProfileImages: {},
      selectedItemFilter: null,
      productCardRefs: {},
      // 전체 코멘트 (API 로드 - lazy loading)
      allLoadedComments: [],
      commentsLoading: false,
      commentsPage: 0,
      commentsHasNext: false,
      commentsLoaded: false,
      // YouTube 플레이어
      showYoutubePlayer: false,
      currentYoutubeItem: null,
      currentYoutubeEmbedUrl: null,
      // 모바일 플로팅 필터 자동 숨김
      floatingFilterHidden: false,
      // 모바일 — picker prompt sub 설명 펼침 토글
      pickerExpanded: false,
      // 우승자 셀러브레이션 모달 (종료된 배틀, 세션당 1회)
      showWinnerModal: false,
      showConfetti: false,
      confettiPieces: [],
      // 아이템 점진적 노출 — 16개 초과면 '더 보기'로 펼침
      itemsExpanded: false,
      itemsDisplayLimit: 16
    }
  },
  computed: {
    isWeightedVote() {
      const voteType = this.battle?.voteType?.title || this.battle?.voteType
      return voteType === 'MULTIPLE'
    },
    isCreator() {
      if (!this.battle) return false
      const userId = getUserId()
      return !!userId && this.battle.creatorUserInfo?.userId === userId
    },
    isAdmin() {
      const user = getCurrentUser()
      return user?.role === 'ADMIN'
    },
    canVote() {
      if (!this.battle) return false

      const status = this.battle.status?.title || this.battle.status

      // 종료/중단/조기종료/취소 상태는 투표 불가
      if (status === 'CLOSED' || status === 'ENDED' || status === 'EARLY_CLOSED' || status === 'SUSPENDED') {
        return false
      }

      // isActive 필드가 명시적으로 false면 투표 불가
      if (this.battle.isActive === false) return false

      // endDate가 지났으면 투표 불가
      if (this.battle.endDate && new Date(this.battle.endDate) <= new Date()) {
        return false
      }

      // ACTIVE 또는 NORMAL 상태이고 위 조건 모두 통과 시 투표 가능
      return status === 'ACTIVE' || status === 'NORMAL'
    },
    canUserAddItem() {
      if (!this.battle) return false
      const userId = getUserId()
      const status = this.battle.status?.title || this.battle.status
      const permissionType = this.battle.itemAddPermissionType?.code || this.battle.itemAddPermissionType

      // 배틀이 NORMAL 상태가 아니면 추가 불가
      if (status !== 'NORMAL') return false

      // 로그인하지 않은 사용자는 추가 불가
      if (!userId) return false

      // CREATOR_ONLY: 생성자만 추가 가능
      if (permissionType === 'CREATOR_ONLY') {
        return this.battle.creatorUserInfo?.userId === userId
      }

      // PUBLIC_FREE, PUBLIC_APPROVAL: 로그인한 사용자 모두 추가 가능
      return true
    },
    showAddItemButton() {
      if (!this.battle) return false
      const status = this.battle.status?.title || this.battle.status
      const permissionType = this.battle.itemAddPermissionType?.code || this.battle.itemAddPermissionType

      // 배틀이 NORMAL 상태가 아니면 버튼 숨김
      if (status !== 'NORMAL') return false

      // CREATOR_ONLY: 생성자만 볼 수 있음
      if (permissionType === 'CREATOR_ONLY') {
        const userId = getUserId()
        return userId && this.battle.creatorUserInfo?.userId === userId
      }

      // PUBLIC_FREE, PUBLIC_APPROVAL: 로그인 여부 관계없이 버튼 표시
      return true
    },
    sortedItems() {
      if (!this.battle?.items) return []

      return [...this.battle.items]
          .filter(item => {
            const statusTitle = item.status?.title || item.status
            return statusTitle === 'ACTIVE'
          })
          .sort((a, b) => {
            // 서버에서 받은 rank가 있으면 rank 기준 정렬
            if (a.rank != null && b.rank != null) {
              return a.rank - b.rank
            }
            // rank가 없으면 점수 기준 정렬 (fallback)
            const scoreA = this.calculateItemScore(a)
            const scoreB = this.calculateItemScore(b)
            return scoreB - scoreA
          })
    },
    displayedItems() {
      // 아이템 많을 때 첫 화면 길이 제한 — 펼치면 전체 노출
      if (this.itemsExpanded) return this.sortedItems
      return this.sortedItems.slice(0, this.itemsDisplayLimit)
    },
    hiddenItemsCount() {
      return Math.max(0, this.sortedItems.length - this.itemsDisplayLimit)
    },
    totalScore() {
      return this.sortedItems.reduce((sum, item) => {
        return sum + this.calculateItemScore(item)
      }, 0)
    },
    hasSelectedItems() {
      return Object.values(this.selectedRanks).some(v => v !== null)
    },
    // 전체 변론 관련 computed
    hasComments() {
      // commentSummary로 체크 (lazy loading이므로 초기에는 allLoadedComments가 비어있음)
      return this.sortedItems.some(item => item.commentSummary?.commentCount > 0)
    },
    totalCommentCount() {
      // 전체 코멘트 수는 각 아이템의 commentCount 합산
      return this.sortedItems.reduce((sum, item) => sum + (item.commentSummary?.commentCount || 0), 0)
    },
    // 필터된 전체 코멘트 수 (로드된 데이터 기준)
    filteredCommentsCount() {
      if (this.selectedItemFilter) {
        return this.allLoadedComments.filter(c => c.itemId === this.selectedItemFilter).length
      }
      return this.allLoadedComments.length
    },
    sortedComments() {
      let comments = [...this.allLoadedComments]

      // 아이템 필터 적용
      if (this.selectedItemFilter) {
        comments = comments.filter(c => c.itemId === this.selectedItemFilter)
      }

      // 정렬은 API에서 이미 적용되어 옴 (클라이언트 사이드 재정렬 필요 없음)
      return comments
    },
    filteredItemName() {
      if (!this.selectedItemFilter) return null
      return this.getItemNameById(this.selectedItemFilter)
    },
    // 자연 종료된 배틀만 우승자 셀러브레이션 대상 (SUSPENDED 제외)
    // NORMAL/ACTIVE 상태라도 endDate가 지났으면 종료로 간주 (서버의 상태 전이가 lazy함)
    isEnded() {
      if (!this.battle) return false
      const status = this.battle.status?.title || this.battle.status
      if (status === 'SUSPENDED') return false
      if (status === 'CLOSED' || status === 'ENDED' || status === 'EARLY_CLOSED') return true
      if (status === 'NORMAL' || status === 'ACTIVE') {
        if (!this.battle.endDate) return false
        return new Date(this.battle.endDate) <= new Date()
      }
      return false
    },
    winnerItem() {
      if (!this.isEnded) return null
      const top = this.sortedItems[0]
      if (!top) return null
      // 투표가 1건도 없으면 우승자 의미가 없어서 표시하지 않음
      return this.calculateItemScore(top) > 0 ? top : null
    },
    // 내가 픽한 아이템들 (정렬된 상태에서 userBattleVote 가 있는 것)
    userPickedItems() {
      return this.sortedItems.filter(item => item.userBattleVote)
    },
    // 내 픽 중 최종 결과가 가장 좋은 것 (rank 가 가장 낮은)
    bestUserPickItem() {
      if (!this.userPickedItems.length) return null
      const withRank = this.userPickedItems.map((item, idx) => ({
        item,
        finalRank: item.rank || (this.sortedItems.indexOf(item) + 1)
      }))
      withRank.sort((a, b) => a.finalRank - b.finalRank)
      return withRank[0]
    },
    // 모달에 보여줄 아이템·등수·"내 픽 여부"
    displayWinnerData() {
      if (this.bestUserPickItem) {
        return {
          item: this.bestUserPickItem.item,
          rank: this.bestUserPickItem.finalRank,
          isMyPick: true
        }
      }
      if (this.winnerItem) {
        return { item: this.winnerItem, rank: 1, isMyPick: false }
      }
      return null
    },
    // 이펙트 톤: gold(1위) · silver(2위) · bronze(3위) · consolation(4위 이하)
    winnerEffectTier() {
      const data = this.displayWinnerData
      if (!data) return null
      if (data.rank === 1) return 'gold'
      if (data.rank === 2) return 'silver'
      if (data.rank === 3) return 'bronze'
      return 'consolation'
    },
    tierIconComponent() {
      switch (this.winnerEffectTier) {
        case 'gold': return 'Trophy'
        case 'silver': return 'Award'
        case 'bronze': return 'Medal'
        default: return 'Heart'
      }
    },
    tierLabel() {
      const data = this.displayWinnerData
      if (!data) return ''
      const isMine = data.isMyPick
      switch (this.winnerEffectTier) {
        case 'gold':   return isMine ? 'WINNER' : 'WINNER'
        case 'silver': return isMine ? '2위' : '2위'
        case 'bronze': return isMine ? '3위' : '3위'
        default:       return isMine ? `${data.rank}위` : `${data.rank}위`
      }
    },
    tierSubLabel() {
      const data = this.displayWinnerData
      if (!data) return ''
      if (data.isMyPick) {
        switch (this.winnerEffectTier) {
          case 'gold':   return '내 픽이 우승했어요!'
          case 'silver': return '아쉽게 2위, 잘했어요!'
          case 'bronze': return '입상! 3위로 마무리'
          default:       return '아쉽지만 다음 픽은 더 좋을 거예요'
        }
      }
      return '종료된 픽의 최종 결과'
    }
  },
  watch: {
    // 정렬 타입 변경 시 코멘트 다시 로드
    commentSortType() {
      if (this.commentsLoaded) {
        this.loadAllComments(true)
      }
    },
    // 같은 라우트로 다른 battleId 진입 시 이전 state 잔존 방지
    '$route.params.id'(newId, oldId) {
      if (!newId || newId === oldId) return
      this.resetBattleState()
      this.battleId = newId
      this.loadBattle()
    }
  },
  created() {
    this.battleId = this.$route.params.id || this.$route.query.id
    if (this.battleId) {
      this.loadBattle()
    } else {
      this.error = '배틀 ID가 없습니다.'
      this.loading = false
    }
  },
  mounted() {
    this._lastScrollY = window.scrollY || 0
    this._programmaticScrollUntil = 0
    this._onWindowScroll = () => {
      if (this._scrollRaf) return
      this._scrollRaf = requestAnimationFrame(() => {
        this._scrollRaf = null
        const y = window.scrollY || 0
        const dy = y - this._lastScrollY
        this._lastScrollY = y
        // 프로그램이 트리거한 smooth-scroll 중에는 자동 숨김 비활성 — 필터를 막 켰는데 숨어버리는 문제 방지
        if (Date.now() < this._programmaticScrollUntil) return
        if (y < 80) {
          this.floatingFilterHidden = false
        } else if (dy > 6) {
          this.floatingFilterHidden = true
        } else if (dy < -6) {
          this.floatingFilterHidden = false
        }
      })
    }
    window.addEventListener('scroll', this._onWindowScroll, { passive: true })
  },
  methods: {
    resetBattleState() {
      this.battle = null
      this.error = null
      this.loading = true
      this.selectedRanks = { 1: null, 2: null, 3: null }
      this.hasVoted = false
      this.submitting = false
      this.showAddModal = false
      this.showShareModal = false
      this.showCommentModal = false
      this.selectedCommentItem = null
      this.commentSortType = 'likeCount'
      this.failedProfileImages = {}
      this.selectedItemFilter = null
      this.productCardRefs = {}
      this.allLoadedComments = []
      this.commentsLoading = false
      this.commentsPage = 0
      this.commentsHasNext = false
      this.commentsLoaded = false
      this.showYoutubePlayer = false
      this.currentYoutubeItem = null
      this.currentYoutubeEmbedUrl = null
      this.showWinnerModal = false
      this.showConfetti = false
      this.confettiPieces = []
    },
    async loadBattle() {
      this.loading = true
      this.error = null

      try {
        const response = await battleService.getBattle(this.battleId)

        if (response.success && response.data) {
          this.battle = response.data
          this.checkUserVote()
          // 종료된 배틀이면 우승자 컨페티 1회 트리거 (세션 가드)
          this.maybeTriggerWinnerConfetti()
          // 전체 PICK 한마디 로드 (getAllComments API 사용)
          this.loadAllComments(true)
        } else {
          throw new Error(response.message || '배틀 정보를 불러올 수 없습니다.')
        }
      } catch (err) {
        console.error('배틀 정보 로드 실패:', err)
        this.error = err.message || '배틀 정보를 불러오는데 실패했습니다.'
      } finally {
        this.loading = false
      }
    },

    // 전체 코멘트 로드 (lazy loading - 더보기 클릭 시)
    async loadAllComments(reset = false) {
      if (this.commentsLoading) return

      this.commentsLoading = true

      try {
        if (reset) {
          this.commentsPage = 0
          this.allLoadedComments = []
        }

        const sortParam = this.commentSortType === 'likeCount' ? 'likeCount,desc' : 'createdAt,desc'
        const response = await battleService.getAllComments(this.battleId, {
          sort: sortParam,
          page: this.commentsPage,
          size: 10
        })

        if (response.success && response.data?.comments) {
          const newComments = response.data.comments.map(comment => ({
            itemId: comment.battleItemId,
            commentId: comment.commentId,
            creatorId: comment.creatorId,
            creatorNickname: comment.creatorNickname || '익명',
            creatorProfileImageUrl: comment.creatorProfileImageUrl || comment.creatorProfileUrl || null,
            content: comment.content || '',
            likeCount: comment.likeCount || 0,
            hasLiked: comment.isLiked || comment.hasLiked || false,
            isMine: comment.isMine || false,
            createdAt: comment.createdAt
          }))

          if (reset) {
            this.allLoadedComments = newComments
          } else {
            this.allLoadedComments = [...this.allLoadedComments, ...newComments]
          }

          this.commentsHasNext = response.data.hasNext
          this.commentsLoaded = true
        }
      } catch (err) {
        console.error('전체 코멘트 로드 실패:', err)
      } finally {
        this.commentsLoading = false
      }
    },

    // 코멘트 더보기
    loadMoreComments() {
      if (!this.commentsHasNext || this.commentsLoading) return
      this.commentsPage++
      this.loadAllComments(false)
    },

    checkUserVote() {
      if (this.battle?.items) {
        const hasUserVote = this.battle.items.some(item => item.userBattleVote)
        this.hasVoted = hasUserVote
      }
    },

    calculateItemScore(item) {
      // 순위 투표: totalScore(점수), 단순 투표: voteCount(투표수)
      if (this.isWeightedVote) {
        return item.totalScore || 0
      }
      return item.voteCount || 0
    },

    handleVote(itemId, rank) {
      if (this.submitting) return
      if (!this.canVote) {
        this.open({ type: 'alert', title: '투표 종료', message: '종료된 요거픽에는 투표할 수 없습니다.' })
        return
      }

      const newRanks = { ...this.selectedRanks }

      if (this.isWeightedVote) {
        Object.keys(newRanks).forEach(key => {
          if (newRanks[key] === itemId) newRanks[key] = null
        })

        if (this.selectedRanks[rank] === itemId) {
          newRanks[rank] = null
        } else {
          newRanks[rank] = itemId
        }

        // Auto-compact: 빈 rank가 있으면 아래 rank를 위로 promote
        // (1→2→3 비즈니스 룰을 시스템이 자동 유지, 사용자는 자유롭게 클릭)
        this.selectedRanks = this.compactRanks(newRanks)
      } else {
        newRanks[1] = this.selectedRanks[1] === itemId ? null : itemId
        this.selectedRanks = newRanks
      }
    },

    handleRemoveRank(rank) {
      if (this.submitting) return
      const newRanks = { ...this.selectedRanks }
      newRanks[rank] = null
      this.selectedRanks = this.compactRanks(newRanks)
    },

    // 빈 rank가 있으면 아래 rank를 위로 끌어올림 (1→2→3 순서 자동 유지)
    compactRanks(ranks) {
      const result = { 1: null, 2: null, 3: null }
      let next = 1
      if (ranks[1]) result[next++] = ranks[1]
      if (ranks[2]) result[next++] = ranks[2]
      if (ranks[3]) result[next++] = ranks[3]
      return result
    },

    async submitVote(argumentText = '') {
      if (this.submitting) return
      if (!this.canVote) {
        await this.open({ type: 'alert', title: '투표 종료', message: '종료된 요거픽에는 투표할 수 없습니다.' })
        return
      }

      // MULTIPLE/SINGLE 모두 최소 1개 이상 선택 필요
      if (!this.hasSelectedItems) {
        await this.open({ type: 'alert', title: '요거픽 선택 필요', message: '아이템을 선택해주세요' })
        return
      }

      this.submitting = true

      try {
        const votes = []

        if (this.isWeightedVote) {
          // MULTIPLE: 선택된 순위만 투표에 포함 (1~3개 가능)
          if (this.selectedRanks[1]) votes.push({ itemId: this.selectedRanks[1], rank: 1 })
          if (this.selectedRanks[2]) votes.push({ itemId: this.selectedRanks[2], rank: 2 })
          if (this.selectedRanks[3]) votes.push({ itemId: this.selectedRanks[3], rank: 3 })
        } else {
          votes.push({ itemId: this.selectedRanks[1], rank: 1 })
        }

        // 한줄 변론이 있으면 1위 상품에 코멘트 추가
        const comment = argumentText || null

        const response = await battleService.voteBattleItem(this.battleId, { votes, comment })

        if (response.success) {
          // POST /battles/{battleId}/vote 응답 data가 ExpGrantInfo로 변경됨 (breaking)
          // 게스트 투표는 ExpGrantInfo가 null/0이라 토스트 자동 숨김
          showExpGrant(response.data, { mode: 'burst-only' })
          const isGuest = !getUserId()
          const successMessage = isGuest
            ? '요거픽이 완료되었습니다!\n로그인하면 EXP를 받을 수 있어요.'
            : '요거픽이 완료되었습니다!'
          await this.open({ type: 'alert', title: '요거픽 완료', message: successMessage })
          this.hasVoted = true
          this.selectedRanks = { 1: null, 2: null, 3: null }
          await this.loadBattle()
        } else {
          throw new Error(response.message || '요거픽에 실패했습니다.')
        }
      } catch (err) {
        console.error('픽 실패:', err)
        await this.open({ type: 'alert', title: '오류', message: err.message || '요거픽에 실패했습니다.' })
      } finally {
        this.submitting = false
      }
    },

    // 모달에서 이미지 1장 추가 — 모달은 닫지 않음 (여러 장 연달아 추가 가능)
    async submitImageItem(data) {
      try {
        const item = {
          itemType: 'CUSTOM',
          customName: data.customName,
          customBrand: data.customBrand || null,
          customImageUrl: data.customImageUrl
        }
        const itemData = { items: [item] }
        // 이벤트 배틀(예: 21번) — eventId 는 body 최상위 필드로 동봉.
        // 백엔드는 매칭되는 이벤트 배틀일 때만 저장하고 응답에선 노출하지 않음.
        if (data.eventId) {
          itemData.eventId = data.eventId
        }
        const response = await battleService.addBattleItems(this.battleId, itemData)
        if (response.success) {
          showExpGrant(response.data, { mode: 'burst-only' })
          this.$refs.addModalRef?.markItemSuccess(data.id)
          await this.loadBattle()
        } else {
          throw new Error(response.message || '아이템 등록에 실패했습니다.')
        }
      } catch (err) {
        console.error('아이템 등록 실패:', err)
        this.$refs.addModalRef?.markItemFailure(data.id)
        await this.open({ type: 'alert', title: '오류', message: err.message || '아이템 등록에 실패했습니다.' })
      }
    },

    async submitSelectedProduct(product) {
      try {
        const itemData = {
          items: [{
            itemType: 'PRODUCT',
            productId: product.productId
          }]
        }
        const response = await battleService.addBattleItems(this.battleId, itemData)
        if (response.success) {
          showExpGrant(response.data, { mode: 'burst-only' })
          await this.loadBattle()
        } else {
          throw new Error(response.message || '아이템 등록에 실패했습니다.')
        }
      } catch (err) {
        console.error('아이템 등록 실패:', err)
        await this.open({ type: 'alert', title: '오류', message: err.message || '아이템 등록에 실패했습니다.' })
      } finally {
        this.$refs.addModalRef?.markProductDone()
      }
    },

    async submitYoutubeProduct(youtubeData) {
      let succeeded = false
      try {
        const itemData = {
          items: [{
            itemType: 'YOUTUBE',
            customName: youtubeData.customName,
            customBrand: youtubeData.customBrand || null,
            customImageUrl: youtubeData.customImageUrl,
            contentUrl: youtubeData.contentUrl || null
          }]
        }
        const response = await battleService.addBattleItems(this.battleId, itemData)
        if (response.success) {
          succeeded = true
          showExpGrant(response.data, { mode: 'burst-only' })
          await this.loadBattle()
        } else {
          throw new Error(response.message || '아이템 등록에 실패했습니다.')
        }
      } catch (err) {
        console.error('YouTube 아이템 등록 실패:', err)
        await this.open({ type: 'alert', title: '오류', message: err.message || '아이템 등록에 실패했습니다.' })
      } finally {
        this.$refs.addModalRef?.markYoutubeDone(succeeded)
      }
    },

    getProductRank(itemId) {
      const entry = Object.entries(this.selectedRanks).find(([_, id]) => id === itemId)
      return entry ? parseInt(entry[0]) : null
    },

    getPercentage(item) {
      if (item.votePercentage !== undefined && item.votePercentage !== null) {
        return (item.votePercentage * 100).toFixed(1)
      }

      if (!this.totalScore || this.totalScore === 0) return 0
      const score = this.calculateItemScore(item)
      return ((score / this.totalScore) * 100).toFixed(1)
    },

    getItemName(item) {
      if (!item) return '아이템명 없음'
      return item.battleItemProduct?.name || item.customName || '아이템명 없음'
    },

    getItemImage(item) {
      if (!item) return 'https://placehold.co/80x80?text=No+Image'
      return item.battleItemProduct?.thumbnailDto?.fileUrl ||
          item.customImageUrl ||
          'https://placehold.co/80x80?text=No+Image'
    },

    getItemImageById(itemId) {
      const item = this.sortedItems.find(i => i.id === itemId)
      return this.getItemImage(item)
    },

    getItemNameById(itemId) {
      const item = this.sortedItems.find(i => i.id === itemId)
      return this.getItemName(item)
    },

    getAvatarInitial(nickname) {
      return (nickname || '?').charAt(0).toUpperCase()
    },

    handleProfileImageError(imageUrl) {
      this.failedProfileImages = { ...this.failedProfileImages, [imageUrl]: true }
    },

    formatTimeAgo(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return '방금'
      if (minutes < 60) return `${minutes}분 전`
      if (hours < 24) return `${hours}시간 전`
      if (days < 7) return `${days}일 전`
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    },

    // PICK 한마디 섹션으로 스크롤
    scrollToComments(item) {
      // 해당 아이템으로 필터 설정
      this.selectedItemFilter = item?.id || null
      // 필터를 막 켰으니 플로팅 버튼이 바로 보이도록 명시적으로 해제
      this.floatingFilterHidden = false

      if (this.$refs.argumentsSection) {
        const element = this.$refs.argumentsSection
        const headerOffset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        // smooth-scroll 동안 스크롤 핸들러가 dy>0 으로 다시 숨기는 것 방지
        this._programmaticScrollUntil = Date.now() + 900

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })

        // 하이라이트 효과
        element.classList.add('highlight-section')
        setTimeout(() => {
          element.classList.remove('highlight-section')
        }, 1500)
      }
    },

    clearItemFilter() {
      this.selectedItemFilter = null
    },

    // 안내 카드 → 첫 아이템 카드 위치로 스크롤 (사용자가 코멘트 대상 고르도록)
    scrollToFirstItem() {
      const firstItem = this.sortedItems?.[0]
      if (firstItem) this.scrollToItem(firstItem.id)
    },

    // 아이템 카드로 스크롤
    scrollToItem(itemId) {
      const cardRef = this.productCardRefs[itemId]
      if (cardRef && cardRef.$el) {
        const element = cardRef.$el
        const headerOffset = 100
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })

        // 하이라이트 효과
        element.classList.add('highlight-card')
        setTimeout(() => {
          element.classList.remove('highlight-card')
        }, 1500)
      }
    },

    // ProductCard ref 설정
    setProductCardRef(itemId, el) {
      if (el) {
        this.productCardRefs[itemId] = el
      }
    },

    // 인라인 코멘트 작성
    async handleInlineComment(itemId, content) {
      // 로그인 체크
      const userId = getUserId()
      if (!userId) {
        const confirmed = await this.openLoginRequired('PICK 한마디를 남기려면 로그인이 필요합니다.')
        if (confirmed) {
          this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        }
        return
      }

      const cardRef = this.productCardRefs[itemId]
      if (cardRef) {
        cardRef.setCommentSubmitting(true)
      }

      try {
        const response = await battleService.createComment(this.battleId, itemId, content)

        if (response.success) {
          await this.open({ type: 'alert', title: '완료', message: 'PICK 한마디가 등록되었습니다!' })
          await this.loadBattle()
          // 코멘트가 이미 로드되어 있으면 새로고침
          if (this.commentsLoaded) {
            await this.loadAllComments(true)
          }
        } else {
          throw new Error(response.message || 'PICK 한마디 작성에 실패했습니다.')
        }
      } catch (err) {
        console.error('인라인 코멘트 작성 실패:', err)
        await this.open({ type: 'alert', title: '오류', message: err.message || 'PICK 한마디 작성에 실패했습니다.' })
      } finally {
        if (cardRef) {
          cardRef.setCommentSubmitting(false)
        }
      }
    },

    // 코멘트 모달 열기 (필요시 사용)
    openCommentModal(item) {
      this.selectedCommentItem = item
      this.showCommentModal = true
    },

    // 인라인 PICK 한마디 작성
    async submitInlineComment() {
      if (!this.selectedItemFilter) return
      const content = this.inlineCommentText.trim()
      if (!content) return

      // 로그인 체크
      const userId = getUserId()
      if (!userId) {
        const confirmed = await this.openLoginRequired('PICK 한마디를 작성하려면 로그인이 필요합니다.')
        if (confirmed) {
          this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        }
        return
      }

      try {
        this.submittingInlineComment = true
        const res = await battleService.createComment(this.battleId, this.selectedItemFilter, content)
        if (res.success) {
          this.inlineCommentText = ''
          await this.handleCommentCreated()
        } else {
          throw new Error(res.message || 'PICK 한마디 작성에 실패했습니다.')
        }
      } catch (err) {
        console.error('인라인 코멘트 작성 실패:', err)
        await this.open({
          type: 'alert',
          title: '오류',
          message: err.message || 'PICK 한마디 작성에 실패했습니다.'
        })
      } finally {
        this.submittingInlineComment = false
      }
    },

    // 코멘트 모달 닫기
    closeCommentModal() {
      this.showCommentModal = false
      this.selectedCommentItem = null
    },

    // 코멘트 생성/삭제 후 배틀 데이터 새로고침 (commentSummary 갱신)
    async handleCommentCreated() {
      await this.loadBattle()
      // 코멘트가 이미 로드되어 있으면 새로고침
      if (this.commentsLoaded) {
        await this.loadAllComments(true)
      }
    },

    // 코멘트 공감 토글
    async handleCommentLike(comment) {
      // 로그인 체크
      const userId = getUserId()
      if (!userId) {
        const confirmed = await this.openLoginRequired('공감하려면 로그인이 필요합니다.')
        if (confirmed) {
          this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        }
        return
      }

      if (!comment.commentId) {
        console.warn('commentId가 없습니다.')
        return
      }

      // allLoadedComments에서 코멘트 찾기
      const targetComment = this.allLoadedComments.find(c => c.commentId === comment.commentId)
      if (!targetComment) return

      // Optimistic update
      const prevLiked = targetComment.hasLiked
      const prevCount = targetComment.likeCount

      targetComment.hasLiked = !prevLiked
      targetComment.likeCount += targetComment.hasLiked ? 1 : -1

      try {
        const response = await battleService.toggleCommentLike(this.battleId, comment.itemId, comment.commentId)

        if (!response.success) {
          throw new Error('공감 처리에 실패했습니다.')
        }

        // 서버 응답으로 정확한 값 업데이트
        if (response.data) {
          if (response.data.likeCount !== undefined) {
            targetComment.likeCount = response.data.likeCount
          }
          if (response.data.isLiked !== undefined) {
            targetComment.hasLiked = response.data.isLiked
          }
        }
      } catch (err) {
        // Rollback on error
        targetComment.hasLiked = prevLiked
        targetComment.likeCount = prevCount
        console.error('공감 처리 실패:', err)
      }
    },

    closeAddModal() {
      this.showAddModal = false
    },

    async handleAddProduct() {
      const userId = getUserId()
      if (!userId) {
        const confirmed = await this.openLoginRequired('아이템을 등록하려면 로그인이 필요합니다.')
        if (confirmed) {
          this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        }
        return
      }
      this.showAddModal = true
    },

    goBack() {
      this.$router.push({ name: 'BattleList' })
    },

    shareBattle() {
      this.showShareModal = true
    },

    closeShareModal() {
      this.showShareModal = false
    },

    async handleReport() {
      const userId = getUserId()
      if (!userId) {
        await this.openLoginRequired('신고하려면 로그인이 필요합니다.')
        return
      }
      if (this.isCreator) return
      this.showReportModal = true
    },

    async handleReportSubmitted() {
      await this.open({ type: 'alert', title: '신고 접수', message: '신고가 접수되었습니다. 운영팀이 검토할게요.' })
    },

    getBattleImage() {
      const firstItem = this.sortedItems?.[0]
      if (!firstItem) return ''
      return firstItem.battleItemProduct?.thumbnailDto?.storedPath ||
          firstItem.customImageUrl ||
          ''
    },

    // YouTube 재생
    async playYoutube(item) {
      if (!item.embedUrl && !item.contentUrl) return

      // 네이티브 앱에서는 SFSafariViewController로 열어서 안정적으로 재생
      if (Capacitor.isNativePlatform()) {
        const url = item.contentUrl || item.embedUrl
        try {
          await Browser.open({ url, presentationStyle: 'popover' })
        } catch (e) {
          console.warn('[YouTube] Browser.open 실패, iframe fallback:', e)
          this.currentYoutubeItem = item
          this.currentYoutubeEmbedUrl = normalizeYoutubeEmbedUrl(item.embedUrl)
          this.showYoutubePlayer = true
        }
        return
      }

      // 웹: 기존 iframe 모달
      this.currentYoutubeItem = item
      this.currentYoutubeEmbedUrl = normalizeYoutubeEmbedUrl(item.embedUrl)
      this.showYoutubePlayer = true
    },

    closeYoutubePlayer() {
      this.showYoutubePlayer = false
      this.currentYoutubeItem = null
      this.currentYoutubeEmbedUrl = null
    },

    // 종료된 배틀 진입 시 우승자 셀러브레이션 모달 1회 트리거
    // - 세션당 배틀별 1회 (sessionStorage)
    // - 사용자가 "일주일간 다시 보지 않기" 누른 경우 만료 시각까지 스킵 (localStorage)
    maybeTriggerWinnerConfetti() {
      if (!this.isEnded || !this.displayWinnerData) return
      const sessionKey = `battle-winner-modal-${this.battleId}`
      const muteKey = `battle-winner-modal-mute-${this.battleId}`
      try {
        if (sessionStorage.getItem(sessionKey)) return
        const muteUntil = parseInt(localStorage.getItem(muteKey) || '0', 10)
        if (muteUntil && Date.now() < muteUntil) return
        sessionStorage.setItem(sessionKey, '1')
      } catch (_) { /* private mode 등 — 그냥 진행 */ }

      const tier = this.winnerEffectTier
      this.showWinnerModal = true

      // consolation(4위 이하)은 confetti 생략 — 위로 톤
      if (tier !== 'consolation') {
        this.confettiPieces = this.buildConfettiPieces(tier)
        this.showConfetti = true
        if (this._confettiTimer) clearTimeout(this._confettiTimer)
        this._confettiTimer = setTimeout(() => {
          this.showConfetti = false
          this.confettiPieces = []
        }, 3200)
      }
    },

    closeWinnerModal() {
      this.showWinnerModal = false
      this.showConfetti = false
      this.confettiPieces = []
      if (this._confettiTimer) {
        clearTimeout(this._confettiTimer)
        this._confettiTimer = null
      }
    },

    // 이 배틀의 우승자 모달을 일주일 동안 다시 보지 않도록 localStorage에 만료 시각 저장
    dismissWinnerModalForWeek() {
      try {
        const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000
        localStorage.setItem(`battle-winner-modal-mute-${this.battleId}`, String(expiry))
      } catch (_) { /* private mode / quota — 무시 */ }
      this.closeWinnerModal()
    },

    buildConfettiPieces(tier = 'gold') {
      // tier별 팔레트·개수 차등 (그라데이션 X — 솔리드만)
      const palettes = {
        gold:   { count: 40, colors: ['#EAB308', '#F59E0B', '#FACC15', '#9333EA', '#F97316', '#16A34A'] },
        silver: { count: 26, colors: ['#94A3B8', '#CBD5E1', '#9333EA', '#3B82F6', '#E5E7EB'] },
        bronze: { count: 18, colors: ['#B45309', '#D97706', '#F59E0B', '#9333EA', '#FBBF24'] }
      }
      const palette = palettes[tier] || palettes.gold
      const pieces = []
      for (let i = 0; i < palette.count; i++) {
        const size = 6 + Math.random() * 6
        pieces.push({
          id: i,
          style: {
            left: `${Math.random() * 100}%`,
            width: `${size}px`,
            height: `${size * 1.6}px`,
            background: palette.colors[i % palette.colors.length],
            animationDelay: `${Math.random() * 0.4}s`,
            animationDuration: `${1.8 + Math.random() * 1.2}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }
        })
      }
      return pieces
    }
  },
  beforeUnmount() {
    if (this._onWindowScroll) {
      window.removeEventListener('scroll', this._onWindowScroll)
    }
    if (this._scrollRaf) {
      cancelAnimationFrame(this._scrollRaf)
    }
    if (this._confettiTimer) {
      clearTimeout(this._confettiTimer)
    }
  }
}
</script>

<style scoped>
.soft-modern-v1 {
  background: var(--bg-base);
  min-height: 100vh;
  /* iOS 홈 인디케이터 회피 */
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
}

/* Loading & Error */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-default);
  border-top-color: var(--c-info);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  font-size: 16px;
  color: var(--c-danger);
}

.btn-retry {
  padding: 12px 24px;
  background: var(--c-info);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-retry:hover {
  background: var(--c-info-hover);
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* ============================= */
/* 우승자 셀러브레이션 모달 (종료된 배틀, 세션당 1회) */
/* ============================= */
.winner-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 15, 20, 0.62);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
  -webkit-tap-highlight-color: transparent;
}

.winner-modal-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 24px;
  padding: 28px 24px 22px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28), 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  overflow: hidden;
  isolation: isolate;
}

.confetti-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.confetti-piece {
  position: absolute;
  top: -16px;
  border-radius: 2px;
  opacity: 0;
  animation-name: confetti-fall;
  animation-timing-function: cubic-bezier(0.3, 0.6, 0.6, 1);
  animation-fill-mode: forwards;
  will-change: transform, opacity;
}

@keyframes confetti-fall {
  0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
  85%  { opacity: 1; }
  100% { transform: translateY(520px) rotate(720deg); opacity: 0; }
}

.winner-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: var(--bg-subtle);
  color: var(--c-text-500);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  transition: background 0.15s ease, color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.winner-modal-close:hover {
  background: var(--border-default);
  color: var(--text-primary);
}

.winner-modal-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 4px;
}

.winner-modal-trophy {
  color: var(--c-warning);
  flex-shrink: 0;
}

.winner-modal-label {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: var(--c-warning);
}

/* ── tier 별 톤 ── */
/* gold (1위) — 현재 기본값(워닝 옐로우) */

/* silver (2위) — 차분한 슬레이트 */
.winner-modal-card.tier-silver .winner-modal-trophy,
.winner-modal-card.tier-silver .winner-modal-label,
.winner-modal-card.tier-silver .winner-modal-pct {
  color: #64748B;
}
.winner-modal-card.tier-silver .winner-modal-img {
  border-color: #E2E8F0;
}
.winner-modal-card.tier-silver .winner-modal-crown {
  background: #94A3B8;
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.4);
}

/* bronze (3위) — 따뜻한 동색 */
.winner-modal-card.tier-bronze .winner-modal-trophy,
.winner-modal-card.tier-bronze .winner-modal-label,
.winner-modal-card.tier-bronze .winner-modal-pct {
  color: #B45309;
}
.winner-modal-card.tier-bronze .winner-modal-img {
  border-color: #FED7AA;
}
.winner-modal-card.tier-bronze .winner-modal-crown {
  background: #D97706;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
}

/* consolation (4위 이하) — 위로 톤, 중성 그레이 + 브랜드 살짝 */
.winner-modal-card.tier-consolation .winner-modal-trophy {
  color: #EF4444;
}
.winner-modal-card.tier-consolation .winner-modal-label {
  color: var(--c-text-600);
  letter-spacing: 0.4px;
}
.winner-modal-card.tier-consolation .winner-modal-pct {
  color: var(--c-text-600);
}
.winner-modal-card.tier-consolation .winner-modal-img {
  border-color: var(--border-default);
  filter: saturate(0.8);
}

.winner-modal-sub {
  width: 100%;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-400);
}

.winner-modal-body {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.winner-modal-img-wrap {
  position: relative;
}

.winner-modal-img {
  width: 132px;
  height: 132px;
  border-radius: 20px;
  object-fit: cover;
  border: 3px solid var(--c-warning-soft);
  background: var(--bg-mute);
}

.winner-modal-crown {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 38px;
  height: 38px;
  background: var(--c-warning);
  color: #ffffff;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(234, 179, 8, 0.5);
  border: 3px solid #ffffff;
  font-size: 15px;
  font-weight: 800;
}

.winner-modal-crown .rank-num {
  line-height: 1;
}

.winner-modal-mypick-tag {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: var(--c-brand);
  background: var(--c-brand-soft);
  padding: 4px 10px;
  border-radius: 999px;
}

.winner-modal-name {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
  width: 100%;
}

.winner-modal-stats {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.winner-modal-pct {
  font-size: 32px;
  font-weight: 800;
  color: var(--c-warning);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.6px;
  line-height: 1;
}

.winner-modal-divider {
  width: 1px;
  height: 18px;
  background: var(--border-strong);
  align-self: center;
}

.winner-modal-count {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text-500);
  font-variant-numeric: tabular-nums;
}

.winner-modal-rank {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text-500);
  font-variant-numeric: tabular-nums;
}

.winner-modal-cta {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 13px 20px;
  border: none;
  border-radius: 14px;
  background: var(--c-brand);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
  margin-top: 4px;
}

.winner-modal-cta:hover {
  background: var(--c-brand-hover);
}

.winner-modal-cta:active {
  transform: scale(0.98);
}

.winner-modal-mute {
  position: relative;
  z-index: 2;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-400);
  padding: 6px 8px;
  margin-top: -4px;
  cursor: pointer;
  letter-spacing: -0.01em;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: var(--border-strong);
  transition: color 0.15s ease, text-decoration-color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.winner-modal-mute:hover {
  color: var(--text-primary);
  text-decoration-color: var(--c-text-500);
}

/* 모달 트랜지션 */
.winner-modal-enter-active,
.winner-modal-leave-active {
  transition: opacity 0.22s ease;
}

.winner-modal-enter-active .winner-modal-card,
.winner-modal-leave-active .winner-modal-card {
  transition: transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.2), opacity 0.22s ease;
}

.winner-modal-enter-from,
.winner-modal-leave-to {
  opacity: 0;
}

.winner-modal-enter-from .winner-modal-card,
.winner-modal-leave-to .winner-modal-card {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

/* ── 다크모드 대응 — 카드 배경이 흰색 하드코딩이라 본문 텍스트(var(--text-primary)=거의 흰색)가 묻히는 문제 ── */
:root[data-theme="dark"] .winner-modal-card {
  background: var(--bg-elevated);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.4);
}

:root[data-theme="dark"] .winner-modal-crown {
  border-color: var(--bg-elevated);
}

:root[data-theme="dark"] .winner-modal-close {
  background: var(--bg-subtle);
  color: var(--c-text-500);
}

:root[data-theme="dark"] .winner-modal-close:hover {
  background: var(--bg-mute);
  color: var(--text-primary);
}

@media (max-width: 480px) {
  .winner-modal-card {
    max-width: 340px;
    padding: 24px 20px 18px;
    border-radius: 22px;
  }
  .winner-modal-img { width: 116px; height: 116px; border-radius: 18px; }
  .winner-modal-crown { width: 34px; height: 34px; top: -8px; right: -8px; }
  .winner-modal-name { font-size: 16px; }
  .winner-modal-pct { font-size: 28px; }
  .winner-modal-label { font-size: 13px; }
  .winner-modal-sub { font-size: 11px; }
}

@media (prefers-reduced-motion: reduce) {
  .winner-modal-enter-active .winner-modal-card,
  .winner-modal-leave-active .winner-modal-card {
    transition: opacity 0.15s ease;
    transform: none;
  }
  .winner-modal-enter-from .winner-modal-card,
  .winner-modal-leave-to .winner-modal-card {
    transform: none;
  }
  .confetti-piece { display: none; }
}

/* PC Grid - 3열 */
.pc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  padding: 4px 24px 36px;
  /* 빈 댓글 카드가 stretch 되며 공허해 보이는 현상 방지 */
  align-items: start;
}

/* 아이템 점진 노출 토글 — 16개 초과 시 노출 */
.items-toggle-wrap {
  display: flex;
  justify-content: center;
  margin: 18px 0 4px;
}
.items-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 100px;
  color: var(--text-primary);
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}
.items-toggle-btn:hover {
  background: var(--bg-subtle);
  border-color: var(--border-strong, var(--c-text-300));
}
.items-toggle-btn:active { transform: scale(0.98); }

/* PC 디바이더 — 양쪽 페이드 라인 */
.pc-divider {
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--border-default) 18%,
    var(--border-default) 82%,
    transparent 100%);
  margin: 28px 80px;
  border: 0;
}

@media (min-width: 1280px) {
  .pc-grid {
    gap: 20px;
    padding: 6px 24px 40px;
  }
}

/* ============================= */
/* PC 전체 변론 섹션              */
/* ============================= */
.pc-arguments-section {
  padding: 24px 24px 120px;
  transition: background 0.3s ease;
  border-radius: 20px;
  margin: 0 8px;
}

.pc-arguments-section.highlight-section {
  animation: highlightPulse 1.5s ease;
}

@keyframes highlightPulse {
  0% { background: transparent; }
  20% { background: rgba(147, 51, 234, 0.06); }
  100% { background: transparent; }
}

.pc-arguments-section .section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

/* ── 빈 상태 안내 카드 (필터 없을 때) — 부드러운 브랜드 톤 ── */
.comment-picker-prompt {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  margin: 0 0 18px;
  background: var(--c-brand-soft);
  border: 1px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: filter 0.15s ease, transform 0.1s ease;
}

.comment-picker-prompt:hover {
  filter: brightness(0.97);
}

.comment-picker-prompt:active {
  transform: scale(0.99);
}

.comment-picker-prompt .picker-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.comment-picker-prompt .picker-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.comment-picker-prompt .picker-sub {
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-500);
  letter-spacing: -0.01em;
}

.comment-picker-prompt .picker-sub strong {
  color: var(--c-brand);
  font-weight: 700;
}

.comment-picker-prompt .picker-cta {
  flex-shrink: 0;
  padding: 7px 12px;
  border-radius: 999px;
  background: var(--c-brand);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

/* PC 에선 sub 가 늘 보이므로 toggle 숨김 */
.comment-picker-prompt .picker-toggle {
  display: none;
}

@media (max-width: 767px) {
  .comment-picker-prompt {
    padding: 12px 14px;
    gap: 10px;
    /* 펼침 시 세로 stack 가능하도록 wrap 허용 */
    flex-wrap: wrap;
  }
  .comment-picker-prompt .picker-title {
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* sub 는 기본 숨김 — toggle 펼침 시 노출 */
  .comment-picker-prompt .picker-sub {
    display: none;
    font-size: 11px;
    margin-top: 4px;
    /* 펼치면 행 전체 차지 */
    flex-basis: 100%;
    line-height: 1.45;
  }
  .comment-picker-prompt.is-expanded .picker-sub {
    display: block;
  }
  /* toggle (꺽새) — 모바일에서만 노출 */
  .comment-picker-prompt .picker-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 50%;
    color: var(--c-brand);
    background: var(--bg-elevated);
    cursor: pointer;
    transition: background 0.15s ease;
  }
  .comment-picker-prompt .picker-toggle:active {
    background: var(--c-brand-soft);
  }
  .comment-picker-prompt .toggle-chevron {
    transition: transform 0.2s ease;
  }
  .comment-picker-prompt.is-expanded .toggle-chevron {
    transform: rotate(180deg);
  }
  .comment-picker-prompt .picker-cta {
    padding: 6px 10px;
    font-size: 11px;
  }
}

/* ── 인라인 PICK 한마디 작성 ── */
.inline-comment-form {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin: 0 0 18px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-strong);
  border-radius: 14px;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.inline-comment-form:focus-within:not(.is-disabled) {
  background: var(--bg-elevated);
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.inline-comment-form.is-disabled {
  background: var(--bg-subtle);
  cursor: not-allowed;
}

.inline-comment-thumb {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--bg-mute);
}

.inline-comment-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  font-family: inherit;
  padding: 6px 0;
}

.inline-comment-input::placeholder {
  color: var(--c-text-400);
  font-weight: 500;
}

.inline-comment-input:disabled {
  cursor: not-allowed;
}

.inline-comment-submit {
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: 999px;
  background: var(--c-brand);
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
  transition: background 0.15s ease, opacity 0.15s ease;
}

.inline-comment-submit:hover:not(:disabled) {
  background: var(--c-brand-hover);
}

.inline-comment-submit:disabled {
  background: var(--c-text-300);
  color: #ffffff;
  cursor: not-allowed;
}

@media (max-width: 767px) {
  .inline-comment-form {
    padding: 8px 10px;
    gap: 8px;
    margin-bottom: 14px;
  }
  .inline-comment-thumb { width: 28px; height: 28px; }
  .inline-comment-input { font-size: 13px; }
  .inline-comment-submit {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.pc-arguments-section .section-heading h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pc-arguments-section .section-heading h2 .comment-total-count {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-brand);
  background: var(--c-brand-soft);
  padding: 4px 10px;
  border-radius: 12px;
}

.pc-arguments-section .section-heading .sub {
  font-size: 14px;
  color: var(--c-text-400);
  margin-top: 4px;
}

/* 모바일 플로팅: 필터 해제 */
.mobile-floating-filter {
  display: none;
}

@media (max-width: 768px) {
  .mobile-floating-filter {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    position: fixed;
    bottom: calc(env(safe-area-inset-bottom, 0) + 16px);
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 12px 6px 6px;
    background: var(--c-brand);
    color: #ffffff;
    border: none;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
    font-family: inherit;
    box-shadow: 0 6px 18px rgba(168, 85, 247, 0.42), 0 2px 4px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    z-index: 900;
    max-width: calc(100vw - 24px);
    transition: transform 0.25s ease, opacity 0.25s ease, box-shadow 0.2s;
    -webkit-tap-highlight-color: transparent;
    will-change: transform, opacity;
  }

  .mobile-floating-filter:active {
    transform: translateX(-50%) scale(0.96);
  }

  /* 스크롤 다운 시 자동 숨김 (탭 통과 가능하도록 pointer-events 제거) */
  .mobile-floating-filter.is-hidden {
    transform: translateX(-50%) translateY(calc(100% + env(safe-area-inset-bottom, 0) + 24px));
    opacity: 0;
    pointer-events: none;
  }

  .floating-filter-thumb {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
  }

  .floating-filter-name {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .floating-filter-divider {
    width: 1px;
    height: 14px;
    background: rgba(255, 255, 255, 0.35);
    flex-shrink: 0;
  }

  .floating-filter-action {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
}

/* 필터 배너 */
.filter-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--c-brand-soft);
  border: 1.5px solid var(--c-brand-soft);
  border-radius: 16px;
  margin-bottom: 20px;
}

.filter-banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-item-img {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid var(--bg-elevated);
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.15);
}

.filter-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-brand);
}

.filter-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-brand);
}

.clear-filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--c-brand);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.clear-filter-btn:hover {
  background: var(--c-brand);
}

.pc-tab-container {
  background: var(--bg-elevated);
  border-radius: 20px;
  border: 1.5px solid var(--border-default);
  overflow: hidden;
}

.pc-tab-header {
  display: flex;
  border-bottom: 1.5px solid var(--border-default);
  padding: 0 24px;
}

.pc-tab-btn {
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text-400);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  position: relative;
  transition: color 0.2s;
}

.pc-tab-btn.active {
  color: var(--c-info);
}

.pc-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1.5px;
  left: 12px;
  right: 12px;
  height: 3px;
  background: var(--c-info);
  border-radius: 3px;
}

.pc-tab-btn .cnt {
  font-size: 12px;
  font-weight: 600;
  background: var(--border-default);
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 6px;
}

.pc-tab-btn.active .cnt {
  background: var(--c-info-soft);
  color: var(--c-info);
}

.pc-tab-content {
  padding: 20px 24px;
}

/* PC 변론 카드: 1열 리스트 */
.pc-arg-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pc-arg-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-subtle);
  border-radius: 10px;
  transition: all 0.15s;
  cursor: pointer;
}

.pc-arg-card:hover {
  background: var(--c-info-soft);
}

.pc-arg-card.best {
  background: var(--c-warning-soft);
  border: 1px solid var(--c-warning);
}

.pc-arg-card .arg-product-img {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.pc-arg-card .arg-body {
  flex: 1;
  min-width: 0;
}

.pc-arg-card .arg-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.pc-arg-card .arg-product-name {
  font-size: 11px;
  font-weight: 700;
  color: var(--c-info);
  background: var(--c-info-soft);
  padding: 2px 8px;
  border-radius: 4px;
}

.pc-arg-card .best-badge {
  font-size: 9px;
  font-weight: 700;
  color: var(--c-warning);
  background: var(--c-warning-soft);
  padding: 2px 5px;
  border-radius: 3px;
  border: 1px solid var(--c-warning);
}

.pc-arg-card .arg-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-600);
  line-height: 1.4;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pc-arg-card .arg-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.pc-arg-card .arg-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--c-text-400);
}

.pc-arg-card img.arg-user-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
}

.pc-arg-card div.arg-user-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--c-info-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  color: var(--c-info);
}

.pc-arg-card .like-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 10px;
  border-radius: 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  font-size: 11px;
  color: var(--c-text-400);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.pc-arg-card .like-btn:hover {
  border-color: var(--c-danger);
  color: var(--c-danger);
  background: var(--c-danger-soft);
}

.pc-arg-card .like-btn.liked {
  border-color: var(--c-danger);
  color: var(--c-danger);
  background: var(--c-danger-soft);
}

/* PICK 한마디 보기 버튼 */
.load-comments-prompt {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.load-comments-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: var(--c-brand);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(147, 51, 234, 0.2);
}

.load-comments-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(147, 51, 234, 0.35);
}

.load-comments-btn:active {
  transform: translateY(0);
}

/* 더보기 버튼 */
.load-more-comments {
  display: flex;
  justify-content: center;
  padding: 24px 0 8px;
}

.load-more-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  background: var(--border-default);
  color: var(--c-text-600);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  background: var(--border-strong);
}

.load-more-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.load-more-btn .spinner-small {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

/* 로딩 상태 */
.loading-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  color: var(--c-text-500);
  font-size: 14px;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-strong);
  border-top-color: var(--c-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 빈 상태 */
.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-comments svg {
  margin-bottom: 16px;
}

.empty-comments p {
  font-size: 16px;
  font-weight: 700;
  color: var(--c-text-600);
  margin: 0 0 6px;
}

.empty-comments span {
  font-size: 14px;
  color: var(--c-text-400);
}

@media (max-width: 768px) {
  .pc-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 2px 14px 32px;
  }

  .pc-divider {
    margin: 22px 24px;
    background: var(--border-default);
  }

  .pc-arguments-section {
    padding: 0 16px 120px;
  }

  .pc-arguments-section .section-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .pc-arguments-section .section-heading h2 {
    font-size: 18px;
  }

  /* 모바일에서는 필터 배너 숨김 — 하단 플로팅 [전체 PICK]으로 대체 */
  .filter-banner {
    display: none;
  }

  .pc-tab-header {
    padding: 0 16px;
  }

  .pc-tab-btn {
    padding: 14px 16px;
    font-size: 14px;
  }

  .pc-tab-content {
    padding: 16px;
  }

  .pc-arg-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .pc-arg-card {
    padding: 14px;
  }

  .pc-arg-card.best {
    grid-column: auto;
  }

  .pc-arg-card .arg-product-img {
    width: 80px;
    height: 80px;
  }

  .pc-arg-card .arg-text {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .pc-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 2px 12px 28px;
  }

  .pc-divider {
    margin: 18px 16px;
  }

  .pc-arguments-section {
    padding: 0 12px calc(120px + env(safe-area-inset-bottom));
  }

  .soft-modern-v1 {
    padding-bottom: calc(120px + env(safe-area-inset-bottom));
  }
}

/* ===== YouTube 플레이어 모달 ===== */
.youtube-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.youtube-modal {
  position: relative;
  width: 100%;
  max-width: 900px;
}

.youtube-modal-close {
  position: absolute;
  top: -50px;
  right: 0;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.youtube-modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.youtube-player-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 12px;
  background: var(--c-ink-900);
}

.youtube-player-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.youtube-modal-info {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.youtube-modal-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: white;
  flex: 1;
}

.youtube-original-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.youtube-original-link:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 모달 트랜지션 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  /* 터치 타깃을 Apple HIG 권장(44pt) 이상으로 유지 */
  .youtube-modal-close {
    top: -52px;
    width: 44px;
    height: 44px;
  }

  .youtube-modal-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .youtube-modal-info h3 {
    font-size: 15px;
  }

  .youtube-original-link {
    width: 100%;
    justify-content: center;
  }
}

/* 모바일/터치: sticky hover 차단 */
@media (hover: none) {
  .load-comments-btn:hover {
    transform: none;
  }
}
</style>
