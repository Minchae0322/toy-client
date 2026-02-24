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
          @add-product="handleAddProduct"
          @back="goBack"
          @share="shareBattle"
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
              v-for="(item, index) in sortedItems"
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

      <!-- Add Product Modal -->
      <AddProductModal
          v-if="showAddModal"
          :image-preview="newProduct.imagePreview"
          :image-uploading="newProduct.imageUploading"
          :upload-failed="newProduct.uploadFailed"
          :name="newProduct.name"
          :brand="newProduct.brand"
          :submitting="submitting"
          @close="closeAddModal"
          @update:image="handleImageUpload"
          @clear-image="clearImage"
          @update:name="newProduct.name = $event"
          @update:brand="newProduct.brand = $event"
          @submit="submitNewProduct"
          @select-product="submitSelectedProduct"
          @submit-youtube="submitYoutubeProduct"
      />

      <!-- Share Modal -->
      <ShareModal
          :visible="showShareModal"
          :title="battle?.title || ''"
          :description="battle?.description || ''"
          :image="getBattleImage()"
          @close="closeShareModal"
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
                    :src="currentYoutubeEmbedUrl + '?autoplay=1'"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
import { fileService } from '@/services/FileService.js'
import { getUserId } from '@/utils/auth.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import ShareModal from '@/components/common/ShareModal.vue'
import BattleInfoCard from '@/components/battle/detail/BattleInfoCard.vue'
import VoteSelectionBar from '@/components/battle/detail/VoteSelectionBar.vue'
import ProductCard from '@/components/battle/detail/ProductCard.vue'
import AddProductModal from '@/components/battle/detail/AddProductModal.vue'
import BattleCommentModal from '@/components/battle/detail/BattleCommentModal.vue'

export default {
  name: 'BattleDetail',
  components: {
    ShareModal,
    BattleInfoCard,
    VoteSelectionBar,
    ProductCard,
    AddProductModal,
    BattleCommentModal
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
      newProduct: {
        name: '',
        brand: '',
        imageFile: null,
        imagePreview: null,
        imageUploading: false,
        uploadFailed: false,
        uploadedImageUrl: null
      },
      showShareModal: false,
      showCommentModal: false,
      selectedCommentItem: null,
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
      currentYoutubeEmbedUrl: null
    }
  },
  computed: {
    isWeightedVote() {
      const voteType = this.battle?.voteType?.title || this.battle?.voteType
      return voteType === 'MULTIPLE'
    },
    canVote() {
      if (!this.battle) return false

      const status = this.battle.status?.title || this.battle.status
      // ACTIVE 또는 NORMAL 상태일 때 투표 가능 (다시 투표도 가능)
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
    }
  },
  watch: {
    // 정렬 타입 변경 시 코멘트 다시 로드
    commentSortType() {
      if (this.commentsLoaded) {
        this.loadAllComments(true)
      }
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
  methods: {
    async loadBattle() {
      this.loading = true
      this.error = null

      try {
        const response = await battleService.getBattle(this.battleId)

        if (response.success && response.data) {
          this.battle = response.data
          this.checkUserVote()
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

      // 로그인 체크
      const userId = getUserId()
      if (!userId) {
        this.openLoginRequired('투표하려면 로그인이 필요합니다.').then(confirmed => {
          if (confirmed) {
            this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
          }
        })
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
      } else {
        newRanks[1] = this.selectedRanks[1] === itemId ? null : itemId
      }

      this.selectedRanks = newRanks
    },

    handleRemoveRank(rank) {
      if (this.submitting) return
      const newRanks = { ...this.selectedRanks }
      newRanks[rank] = null
      this.selectedRanks = newRanks
    },

    async submitVote(argumentText = '') {
      if (this.submitting) return

      // 로그인 체크
      const userId = getUserId()
      if (!userId) {
        const confirmed = await this.openLoginRequired('투표하려면 로그인이 필요합니다.')
        if (confirmed) {
          this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        }
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
          await this.open({ type: 'alert', title: '요거픽 완료', message: '요거픽이 완료되었습니다!' })
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

    async submitNewProduct() {
      if (this.submitting) return

      // 업로드 중인 경우 대기
      if (this.newProduct.imageUploading) {
        await this.open({ type: 'alert', title: '잠시만요', message: '이미지 업로드가 진행 중입니다. 잠시 후 다시 시도해주세요.' })
        return
      }

      // 업로드 실패한 경우
      if (this.newProduct.uploadFailed || !this.newProduct.uploadedImageUrl) {
        await this.open({ type: 'alert', title: '이미지 오류', message: '이미지를 다시 업로드해주세요.' })
        return
      }

      if (!this.newProduct.name) {
        await this.open({ type: 'alert', title: '입력 필요', message: '아이템명을 입력해주세요' })
        return
      }

      this.submitting = true

      try {
        // 이미 업로드된 URL 사용
        const itemData = {
          items: [{
            itemType: 'CUSTOM',
            customName: this.newProduct.name,
            customBrand: this.newProduct.brand || null,
            customImageUrl: this.newProduct.uploadedImageUrl
          }]
        }

        const response = await battleService.addBattleItems(this.battleId, itemData)

        if (response.success) {
          await this.open({ type: 'alert', title: '등록 완료', message: '아이템이 등록되었습니다!' })
          this.closeAddModal()
          await this.loadBattle()
        } else {
          throw new Error(response.message || '아이템 등록에 실패했습니다.')
        }
      } catch (err) {
        console.error('아이템 등록 실패:', err)
        await this.open({ type: 'alert', title: '오류', message: err.message || '아이템 등록에 실패했습니다.' })
      } finally {
        this.submitting = false
      }
    },

    async submitSelectedProduct(product) {
      if (this.submitting) return

      this.submitting = true

      try {
        const itemData = {
          items: [{
            itemType: 'PRODUCT',
            productId: product.productId
          }]
        }

        const response = await battleService.addBattleItems(this.battleId, itemData)

        if (response.success) {
          await this.open({ type: 'alert', title: '등록 완료', message: '아이템이 등록되었습니다!' })
          this.closeAddModal()
          await this.loadBattle()
        } else {
          throw new Error(response.message || '아이템 등록에 실패했습니다.')
        }
      } catch (err) {
        console.error('아이템 등록 실패:', err)
        await this.open({ type: 'alert', title: '오류', message: err.message || '아이템 등록에 실패했습니다.' })
      } finally {
        this.submitting = false
      }
    },

    async submitYoutubeProduct(youtubeData) {
      if (this.submitting) return

      this.submitting = true

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
          await this.open({ type: 'alert', title: '등록 완료', message: '아이템이 등록되었습니다!' })
          this.closeAddModal()
          await this.loadBattle()
        } else {
          throw new Error(response.message || '아이템 등록에 실패했습니다.')
        }
      } catch (err) {
        console.error('YouTube 아이템 등록 실패:', err)
        await this.open({ type: 'alert', title: '오류', message: err.message || '아이템 등록에 실패했습니다.' })
      } finally {
        this.submitting = false
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

      if (this.$refs.argumentsSection) {
        const element = this.$refs.argumentsSection
        const headerOffset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

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

    // 이미지 리사이징 유틸 함수
    resizeImage(file, maxSize = 1920, quality = 0.85) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        const objectUrl = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(objectUrl)

          let { width, height } = img

          // 이미 충분히 작으면 원본 반환
          if (width <= maxSize && height <= maxSize) {
            resolve(file)
            return
          }

          // 비율 유지하면서 리사이징
          if (width > height) {
            height = Math.round((height / width) * maxSize)
            width = maxSize
          } else {
            width = Math.round((width / height) * maxSize)
            height = maxSize
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const resizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                resolve(resizedFile)
              } else {
                reject(new Error('이미지 변환 실패'))
              }
            },
            'image/jpeg',
            quality
          )
        }

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl)
          reject(new Error('이미지 로드 실패'))
        }

        img.src = objectUrl
      })
    },

    async handleImageUpload(e) {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > 5 * 1024 * 1024) {
        await this.open({ type: 'alert', title: '파일 크기 초과', message: '파일 크기는 5MB 이하여야 합니다.' })
        return
      }

      // 상태 초기화
      this.newProduct.uploadFailed = false
      this.newProduct.uploadedImageUrl = null

      try {
        // 1. 이미지 리사이징
        const resizedFile = await this.resizeImage(file, 1920, 0.85)

        // 2. 로컬 미리보기 생성
        this.newProduct.imageFile = resizedFile
        this.newProduct.imagePreview = URL.createObjectURL(resizedFile)
        this.newProduct.imageUploading = true

        // 3. S3 업로드
        const uploadResult = await fileService.uploadFiles(resizedFile, { fileCode: 'BATTLE_ITEM' })

        if (uploadResult.success && uploadResult.data) {
          this.newProduct.uploadedImageUrl = uploadResult.data.fileUrl
          this.newProduct.imageUploading = false
          console.log('✅ 배틀 아이템 이미지 업로드 완료:', uploadResult.data.fileUrl)
        } else {
          throw new Error(uploadResult.error || '업로드 실패')
        }
      } catch (error) {
        console.error('❌ 이미지 업로드 실패:', error)
        this.newProduct.imageUploading = false
        this.newProduct.uploadFailed = true
        await this.open({ type: 'alert', title: '업로드 실패', message: '이미지 업로드에 실패했습니다. 다시 시도해주세요.' })
      }
    },

    clearImage() {
      if (this.newProduct.imagePreview && this.newProduct.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(this.newProduct.imagePreview)
      }
      this.newProduct.imageFile = null
      this.newProduct.imagePreview = null
      this.newProduct.imageUploading = false
      this.newProduct.uploadFailed = false
      this.newProduct.uploadedImageUrl = null
    },

    closeAddModal() {
      this.showAddModal = false
      if (this.newProduct.imagePreview && this.newProduct.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(this.newProduct.imagePreview)
      }
      this.newProduct = {
        name: '',
        brand: '',
        imageFile: null,
        imagePreview: null,
        imageUploading: false,
        uploadFailed: false,
        uploadedImageUrl: null
      }
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

    getBattleImage() {
      const firstItem = this.sortedItems?.[0]
      if (!firstItem) return ''
      return firstItem.battleItemProduct?.thumbnailDto?.storedPath ||
          firstItem.customImageUrl ||
          ''
    },

    // YouTube 재생
    playYoutube(item) {
      if (item.embedUrl) {
        this.currentYoutubeItem = item
        this.currentYoutubeEmbedUrl = item.embedUrl
        this.showYoutubePlayer = true
      }
    },

    closeYoutubePlayer() {
      this.showYoutubePlayer = false
      this.currentYoutubeItem = null
      this.currentYoutubeEmbedUrl = null
    }
  },
  beforeUnmount() {
    if (this.newProduct.imagePreview && this.newProduct.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.newProduct.imagePreview)
    }
  }
}
</script>

<style scoped>
.soft-modern-v1 {
  background: #fdfeff;
  min-height: 100vh;
  padding-bottom: 100px;
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
  border: 3px solid #f0f0f0;
  border-top-color: #4a6cf7;
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
  color: #ef4444;
}

.btn-retry {
  padding: 12px 24px;
  background: #4a6cf7;
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
  background: #3a5ce7;
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* PC Grid - 3열 */
.pc-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 0 24px 32px;
}

/* PC 디바이더 */
.pc-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 32px 24px;
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

.pc-arguments-section .section-heading h2 {
  font-size: 22px;
  font-weight: 800;
  color: #111;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pc-arguments-section .section-heading h2 .comment-total-count {
  font-size: 14px;
  font-weight: 700;
  color: #9333ea;
  background: #f3e8ff;
  padding: 4px 10px;
  border-radius: 12px;
}

.pc-arguments-section .section-heading .sub {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 4px;
}

/* 필터 배너 */
.filter-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border: 2px solid #e9d5ff;
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
  border: 2px solid #fff;
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
  color: #9333ea;
}

.filter-name {
  font-size: 15px;
  font-weight: 700;
  color: #581c87;
}

.clear-filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #9333ea;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.clear-filter-btn:hover {
  background: #7e22ce;
}

.pc-tab-container {
  background: #fff;
  border-radius: 20px;
  border: 1.5px solid #f0f0f0;
  overflow: hidden;
}

.pc-tab-header {
  display: flex;
  border-bottom: 1.5px solid #f0f0f0;
  padding: 0 24px;
}

.pc-tab-btn {
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 700;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  position: relative;
  transition: color 0.2s;
}

.pc-tab-btn.active {
  color: #4a6cf7;
}

.pc-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1.5px;
  left: 12px;
  right: 12px;
  height: 3px;
  background: #4a6cf7;
  border-radius: 3px;
}

.pc-tab-btn .cnt {
  font-size: 12px;
  font-weight: 600;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 6px;
}

.pc-tab-btn.active .cnt {
  background: #eff2ff;
  color: #4a6cf7;
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
  background: #fafbfc;
  border-radius: 10px;
  transition: all 0.15s;
  cursor: pointer;
}

.pc-arg-card:hover {
  background: #f5f7ff;
}

.pc-arg-card.best {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a;
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
  color: #4a6cf7;
  background: #eff2ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.pc-arg-card .best-badge {
  font-size: 9px;
  font-weight: 700;
  color: #f59e0b;
  background: #fffbeb;
  padding: 2px 5px;
  border-radius: 3px;
  border: 1px solid #fde68a;
}

.pc-arg-card .arg-text {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
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
  color: #9ca3af;
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
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  color: #4a6cf7;
}

.pc-arg-card .like-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 10px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  font-size: 11px;
  color: #9ca3af;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.pc-arg-card .like-btn:hover {
  border-color: #f43f5e;
  color: #f43f5e;
  background: #fff5f5;
}

.pc-arg-card .like-btn.liked {
  border-color: #f43f5e;
  color: #f43f5e;
  background: #fff5f5;
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
  background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(147, 51, 234, 0.25);
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
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover:not(:disabled) {
  background: #e5e7eb;
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
  color: #6b7280;
  font-size: 14px;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #9333ea;
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
  color: #374151;
  margin: 0 0 6px;
}

.empty-comments span {
  font-size: 14px;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .pc-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 0 12px 32px;
  }

  .pc-divider {
    margin: 24px 16px;
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

  .filter-banner {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .filter-banner-content {
    width: 100%;
  }

  .filter-item-img {
    width: 36px;
    height: 36px;
  }

  .filter-name {
    font-size: 14px;
  }

  .clear-filter-btn {
    width: 100%;
    justify-content: center;
    padding: 10px 16px;
    font-size: 13px;
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
    gap: 8px;
    padding: 0 10px 28px;
  }

  .pc-divider {
    margin: 20px 12px;
  }

  .pc-arguments-section {
    padding: 0 12px 120px;
  }

  .soft-modern-v1 {
    padding-bottom: 120px;
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
  background: #000;
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
  .youtube-modal-close {
    top: -44px;
    width: 36px;
    height: 36px;
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
</style>
