<template>
  <div class="battle-detail">
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
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <button @click="goBack" class="btn btn-back">
            <span class="icon">←</span>
            목록
          </button>

          <div class="header-actions">
            <button @click="shareBattle" class="btn btn-icon">
              <span class="icon">↗</span>
            </button>
          </div>
        </div>
      </header>

      <div class="container">
        <!-- Battle Info -->
        <div class="battle-info">
          <div class="battle-info-main">
            <div class="battle-info-left">
              <div class="tags">
                <span class="tag">{{ battle.subCategoryDetail?.subCategoryName || '카테고리' }}</span>
                <span v-if="isWeightedVote" class="tag tag-primary">
                  순위 투표 (1위 3점, 2위 2점, 3위 1점)
                </span>
                <span :class="['tag', 'tag-status', getStatusClass(battle.status?.title || battle.status)]">
                  {{ getBattleStatusLabel(battle.status) }}
                </span>
              </div>
              <h1 class="title">{{ battle.title }}</h1>
              <p v-if="battle.description" class="description">{{ battle.description }}</p>
            </div>

            <div class="battle-stats">
              <div class="stat">
                <div class="stat-value">{{ battleUtils.formatDaysLeft(battle.endDate) }}</div>
                <div class="stat-label">남은 기간</div>
              </div>
              <div class="stat">
                <div class="stat-value">{{ battleUtils.formatCount(battle.totalParticipants) }}</div>
                <div class="stat-label">참여</div>
              </div>
              <div class="stat">
                <div class="stat-value">{{ battleUtils.formatCount(battle.totalVotes) }}</div>
                <div class="stat-label">투표</div>
              </div>
            </div>
          </div>

          <!-- Add Product Button -->
          <button
              v-if="canUserAddItem && !hasVoted"
              @click="showAddModal = true"
              class="btn-add-product"
          >
            <span class="icon">+</span>
            내가 아는 좋은 제품 추가하기
          </button>
        </div>

        <!-- Vote Selection Sticky Bar -->
        <div v-if="canVote && hasSelectedItems" class="vote-bar">
          <div class="vote-bar-content">
            <div class="vote-selected">
              <span class="vote-label">선택:</span>
              <div v-if="isWeightedVote" class="vote-ranks">
                <div v-for="rank in [1, 2, 3]" :key="rank" class="vote-rank-item">
                  <span :class="['rank-badge', `rank-${rank}`]">
                    {{ rank }}위
                  </span>
                  <span class="vote-product-name">
                    {{ getSelectedProductName(rank) }}
                  </span>
                </div>
              </div>
              <span v-else class="vote-product-name">
                {{ getSelectedProductName(1) }}
              </span>
            </div>

            <button @click="submitVote" :disabled="submitting" class="btn-submit">
              {{ submitting ? '투표 중...' : '투표 완료하기' }}
            </button>
          </div>
        </div>

        <!-- Product Grid -->
        <div class="product-grid">
          <div
              v-for="(item, index) in sortedItems"
              :key="item.id"
              :class="['product-card', { 'selected': getProductRank(item.id) !== null }]"
          >
            <!-- Rank Badge -->
            <div class="product-image-wrapper">
              <div :class="['product-rank-badge', `rank-${index + 1}`]">
                {{ index + 1 }}
              </div>

              <!-- Product Image -->
              <div class="product-image">
                <img
                    :src="getItemImage(item)"
                    :alt="getItemName(item)"
                    @error="handleImageError"
                />
              </div>
            </div>

            <!-- Product Info -->
            <div class="product-content">
              <h3 class="product-name">{{ getItemName(item) }}</h3>
              <p class="product-brand">{{ getItemBrand(item) }}</p>

              <!-- Score -->
              <div class="product-score">
                <div class="score-number">
                  <span class="score-value">{{ item.totalScore || 0 }}</span>
                  <span class="score-unit">{{ isWeightedVote ? '점' : '표' }}</span>
                </div>
                <div class="score-bar-wrapper">
                  <div class="score-bar">
                    <div class="score-fill" :style="{ width: `${getPercentage(item)}%` }"></div>
                  </div>
                  <span class="score-percent">{{ getPercentage(item) }}%</span>
                </div>
              </div>

              <!-- Vote Buttons -->
              <div v-if="canVote" class="vote-buttons">
                <div v-if="isWeightedVote" class="vote-buttons-weighted">
                  <button
                      v-for="r in [1, 2, 3]"
                      :key="r"
                      @click="handleVote(item.id, r)"
                      :disabled="submitting"
                      :class="['btn-vote-rank', { 'active': getProductRank(item.id) === r }, `rank-${r}`]"
                  >
                    {{ r }}위 선택
                  </button>
                </div>
                <button
                    v-else
                    @click="handleVote(item.id, 1)"
                    :disabled="submitting"
                    :class="['btn-vote-simple', { 'active': getProductRank(item.id) !== null }]"
                >
                  {{ getProductRank(item.id) !== null ? '✓ 선택됨' : '투표하기' }}
                </button>
              </div>

              <!-- My Vote Badge - 내가 투표한 아이템에만 표시 -->
              <div v-else-if="item.userBattleVote?.length > 0" class="voted-badge my-vote">
                <span class="vote-icon">✓</span>
                <span v-if="isWeightedVote && item.userBattleVote[0]?.rank">
                  {{ item.userBattleVote[0].rank }}위 투표
                </span>
                <span v-else>내 투표</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Product Modal -->
      <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
        <div class="modal">
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 class="modal-title">제품 추가하기</h2>
            <button @click="closeAddModal" class="btn-close">
              <span class="icon">×</span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Image Upload -->
            <div class="form-group">
              <label class="form-label">제품 사진 *</label>
              <div class="image-upload">
                <div v-if="newProduct.imagePreview" class="image-preview">
                  <img :src="newProduct.imagePreview" alt="Preview" />
                  <button @click="clearImage" class="btn-remove-image">
                    <span class="icon">×</span>
                  </button>
                </div>
                <label v-else class="image-upload-label">
                  <span class="icon upload-icon">⬆</span>
                  <span class="upload-text">사진 업로드</span>
                  <span class="upload-hint">클릭하여 선택</span>
                  <input
                      type="file"
                      accept="image/*"
                      @change="handleImageUpload"
                      style="display: none"
                  />
                </label>
              </div>
            </div>

            <!-- Product Name -->
            <div class="form-group">
              <label class="form-label">제품명 *</label>
              <input
                  v-model="newProduct.name"
                  type="text"
                  placeholder="예: AirPods Pro 2"
                  maxlength="30"
                  class="form-input"
              />
            </div>

            <!-- Brand -->
            <div class="form-group">
              <label class="form-label">브랜드 *</label>
              <input
                  v-model="newProduct.brand"
                  type="text"
                  placeholder="예: Apple"
                  maxlength="20"
                  class="form-input"
              />
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button @click="closeAddModal" class="btn-cancel">
              취소
            </button>
            <button @click="submitNewProduct" :disabled="submitting" class="btn-confirm">
              {{ submitting ? '등록 중...' : '제품 등록' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { battleService, battleUtils } from '@/services/BattleService.js'
import { fileService } from '@/services/FileService.js'

export default {
  name: 'BattleDetail',
  data() {
    return {
      battleUtils,
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
        imagePreview: null
      }
    }
  },
  computed: {
    isWeightedVote() {
      const voteType = this.battle?.voteType?.title || this.battle?.voteType
      return voteType === 'MULTIPLE'
    },
    canVote() {
      if (!this.battle || this.hasVoted) return false

      const status = this.battle.status?.title || this.battle.status
      if (status !== 'ACTIVE') return false

      const now = new Date()
      const startDate = new Date(this.battle.participationStartDate)
      const endDate = new Date(this.battle.endDate)

      return now >= startDate && now <= endDate
    },
    canUserAddItem() {
      if (!this.battle) return false
      const userId = this.$store?.state?.auth?.user?.userId
      const status = this.battle.status?.title || this.battle.status
      const permissionType = this.battle.itemAddPermissionType?.code || this.battle.itemAddPermissionType

      if (status !== 'ACTIVE') return false
      if (permissionType === 'CREATOR_ONLY') {
        return this.battle.creatorUserInfo?.userId === userId
      }
      return true
    },
    sortedItems() {
      if (!this.battle?.items) return []

      return [...this.battle.items]
      .filter(item => {
        // ⭐ 핵심 수정: status 객체의 title 속성 확인
        const statusTitle = item.status?.title || item.status
        return statusTitle === 'ACTIVE'
      })
      .sort((a, b) => {
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
          console.log('✅ 배틀 정보 로드 완료:', this.battle)
          console.log('📦 아이템 목록:', this.battle.items)

          // 디버깅: 각 아이템의 status 확인
          this.battle.items?.forEach(item => {
            console.log(`Item ${item.id} status:`, item.status, 'Title:', item.status?.title)
          })

          // 이미 투표한 경우 체크
          this.checkUserVote()
        } else {
          throw new Error(response.message || '배틀 정보를 불러올 수 없습니다.')
        }
      } catch (err) {
        console.error('❌ 배틀 정보 로드 실패:', err)
        this.error = err.message || '배틀 정보를 불러오는데 실패했습니다.'
      } finally {
        this.loading = false
      }
    },

    checkUserVote() {
      // 사용자가 이미 투표한 경우 체크
      if (this.battle?.items) {
        const hasUserVote = this.battle.items.some(item => item.userBattleVote?.length > 0)
        this.hasVoted = hasUserVote
        console.log('🗳️ 투표 여부:', this.hasVoted)
      }
    },

    calculateItemScore(item) {
      // 백엔드에서 voteCount로 통합 관리
      return item.voteCount || 0
    },

    handleVote(itemId, rank) {
      if (this.hasVoted || this.submitting) return

      const newRanks = { ...this.selectedRanks }

      if (this.isWeightedVote) {
        // 가중치 투표: 같은 아이템이 다른 순위에 있으면 제거
        Object.keys(newRanks).forEach(key => {
          if (newRanks[key] === itemId) newRanks[key] = null
        })

        // 선택/해제 토글
        if (this.selectedRanks[rank] === itemId) {
          newRanks[rank] = null
        } else {
          newRanks[rank] = itemId
        }
      } else {
        // 단순 투표: 토글
        newRanks[1] = this.selectedRanks[1] === itemId ? null : itemId
      }

      this.selectedRanks = newRanks
      console.log('📌 선택된 순위:', this.selectedRanks)
    },

    async submitVote() {
      if (this.submitting) return

      // 검증
      if (this.isWeightedVote) {
        if (!this.selectedRanks[1] || !this.selectedRanks[2] || !this.selectedRanks[3]) {
          alert('1위, 2위, 3위를 모두 선택해주세요')
          return
        }
      } else {
        if (!this.selectedRanks[1]) {
          alert('제품을 선택해주세요')
          return
        }
      }

      this.submitting = true

      try {
        const votes = []

        if (this.isWeightedVote) {
          votes.push(
              { itemId: this.selectedRanks[1], rank: 1 },
              { itemId: this.selectedRanks[2], rank: 2 },
              { itemId: this.selectedRanks[3], rank: 3 }
          )
        } else {
          votes.push({ itemId: this.selectedRanks[1], rank: 1 })
        }

        console.log('🗳️ 투표 데이터:', votes)
        const response = await battleService.voteBattleItem(this.battleId, { votes })

        if (response.success) {
          alert('투표가 완료되었습니다!')
          this.hasVoted = true
          this.selectedRanks = { 1: null, 2: null, 3: null }

          // 배틀 정보 다시 로드
          await this.loadBattle()
        } else {
          throw new Error(response.message || '투표에 실패했습니다.')
        }
      } catch (err) {
        console.error('❌ 투표 실패:', err)
        alert(err.message || '투표에 실패했습니다.')
      } finally {
        this.submitting = false
      }
    },

    async submitNewProduct() {
      if (this.submitting) return

      if (!this.newProduct.name || !this.newProduct.brand || !this.newProduct.imageFile) {
        alert('모든 필드를 입력해주세요')
        return
      }

      this.submitting = true

      try {
        // 1. 이미지 업로드
        console.log('🖼️ 이미지 업로드 시작:', this.newProduct.imageFile.name)
        const imageResponse = await fileService.uploadFiles(this.newProduct.imageFile, 'BATTLE_ITEM')

        if (!imageResponse.success) {
          throw new Error('이미지 업로드에 실패했습니다.')
        }

        console.log('✅ 이미지 업로드 완료:', imageResponse.data)

        // 2. 아이템 추가
        const itemData = {
          items: [{
            customName: this.newProduct.name,
            customBrand: this.newProduct.brand,
            customImageUrl: imageResponse.data.fileUrl
          }]
        }

        console.log('📦 아이템 추가 데이터:', itemData)
        const response = await battleService.addBattleItems(this.battleId, itemData)

        if (response.success) {
          alert('제품이 등록되었습니다!')
          this.closeAddModal()

          // 배틀 정보 다시 로드
          await this.loadBattle()
        } else {
          throw new Error(response.message || '제품 등록에 실패했습니다.')
        }
      } catch (err) {
        console.error('❌ 제품 등록 실패:', err)
        alert(err.message || '제품 등록에 실패했습니다.')
      } finally {
        this.submitting = false
      }
    },

    getProductRank(itemId) {
      const entry = Object.entries(this.selectedRanks).find(([_, id]) => id === itemId)
      return entry ? parseInt(entry[0]) : null
    },

    getPercentage(item) {
      // 백엔드에서 계산된 votePercentage 사용 (0.0~1.0)
      if (item.votePercentage !== undefined && item.votePercentage !== null) {
        return (item.votePercentage * 100).toFixed(1)
      }

      // fallback: 직접 계산
      if (!this.totalScore || this.totalScore === 0) return 0
      const score = this.calculateItemScore(item)
      return ((score / this.totalScore) * 100).toFixed(1)
    },

    getSelectedProductName(rank) {
      const itemId = this.selectedRanks[rank]
      const item = this.sortedItems.find(i => i.id === itemId)
      return item ? this.getItemName(item) : '미선택'
    },

    getItemName(item) {
      return item.battleItemProduct?.name || item.customName || '제품명 없음'
    },

    getItemBrand(item) {
      return item.battleItemProduct?.brand || item.customBrand || ''
    },

    getItemImage(item) {
      return item.battleItemProduct?.thumbnailDto?.storedPath ||
          item.customImageUrl ||
          'https://via.placeholder.com/400?text=No+Image'
    },

    getStatusClass(status) {
      const statusTitle = status?.title || status
      const classes = {
        'DRAFT': 'status-draft',
        'ACTIVE': 'status-active',
        'CLOSED': 'status-closed',
        'EARLY_CLOSED': 'status-early-closed'
      }
      return classes[statusTitle] || ''
    },

    getBattleStatusLabel(status) {
      const statusTitle = status?.title || status
      const labels = {
        'DRAFT': '임시저장',
        'ACTIVE': '진행중',
        'CLOSED': '종료',
        'EARLY_CLOSED': '조기종료'
      }
      return labels[statusTitle] || ''
    },

    handleImageUpload(e) {
      const file = e.target.files?.[0]
      if (file) {
        // 파일 크기 체크 (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('파일 크기는 5MB 이하여야 합니다.')
          return
        }

        this.newProduct.imageFile = file
        this.newProduct.imagePreview = URL.createObjectURL(file)
      }
    },

    clearImage() {
      if (this.newProduct.imagePreview) {
        URL.revokeObjectURL(this.newProduct.imagePreview)
      }
      this.newProduct.imageFile = null
      this.newProduct.imagePreview = null
    },

    closeAddModal() {
      this.showAddModal = false
      this.newProduct = { name: '', brand: '', imageFile: null, imagePreview: null }
    },

    handleImageError(e) {
      e.target.src = 'https://via.placeholder.com/400?text=No+Image'
    },

    goBack() {
      this.$router.back()
    },

    shareBattle() {
      if (navigator.share) {
        navigator.share({
          title: this.battle.title,
          text: this.battle.description,
          url: window.location.href
        }).catch(console.error)
      } else {
        // 복사 기능
        navigator.clipboard.writeText(window.location.href)
        alert('링크가 복사되었습니다!')
      }
    }
  },
  beforeUnmount() {
    if (this.newProduct.imagePreview) {
      URL.revokeObjectURL(this.newProduct.imagePreview)
    }
  }
}
</script>

<style scoped>
.battle-detail {
  min-height: 100vh;
  background-color: #f9fafb;
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
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  font-size: 16px;
  color: #ef4444;
}

.btn-retry {
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  z-index: 50;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  font-family: inherit;
}

.btn:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-back {
  color: #374151;
  margin-left: -8px;
}

.btn-icon {
  padding: 8px;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon {
  font-size: 16px;
  line-height: 1;
}

/* Container */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* Battle Info */
.battle-info {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  margin-bottom: 24px;
}

.battle-info-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.battle-info-left {
  flex: 1;
}

.tags {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f3f4f6;
  color: #6b7280;
}

.tag-primary {
  background-color: #eff6ff;
  color: #2563eb;
}

.tag-status {
  font-weight: 600;
}

.status-draft {
  background-color: #f3f4f6;
  color: #6b7280;
}

.status-active {
  background-color: #d1fae5;
  color: #059669;
}

.status-closed {
  background-color: #fef3c7;
  color: #d97706;
}

.status-early-closed {
  background-color: #f1f5f9;
  color: #475569;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 8px;
}

.description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.battle-stats {
  display: flex;
  gap: 24px;
  margin-left: 24px;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #111827;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.btn-add-product {
  width: 100%;
  padding: 12px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-add-product:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background-color: #eff6ff;
}

/* Vote Bar */
.vote-bar {
  position: sticky;
  top: 56px;
  background: white;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 40;
}

.vote-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vote-selected {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.vote-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.vote-ranks {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.vote-rank-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rank-badge {
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
}

.rank-badge.rank-1 {
  background-color: #fef3c7;
  color: #92400e;
}

.rank-badge.rank-2 {
  background-color: #f3f4f6;
  color: #374151;
}

.rank-badge.rank-3 {
  background-color: #fed7aa;
  color: #9a3412;
}

.vote-product-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.btn-submit {
  padding: 10px 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}

.btn-submit:hover:not(:disabled) {
  background-color: #2563eb;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.2s;
}

.product-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.product-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.product-image-wrapper {
  position: relative;
}

.product-rank-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.product-rank-badge.rank-1 {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.product-rank-badge.rank-2 {
  background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
  color: white;
}

.product-rank-badge.rank-3 {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
  color: white;
}

.product-rank-badge:not(.rank-1):not(.rank-2):not(.rank-3) {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.product-image {
  aspect-ratio: 1;
  background-color: #f3f4f6;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-content {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.product-brand {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.product-score {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.score-number {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 4px;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
  color: #111827;
}

.score-unit {
  font-size: 14px;
  color: #6b7280;
}

.score-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-bar {
  flex: 1;
  height: 6px;
  background-color: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 999px;
  transition: width 0.3s;
}

.score-percent {
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
}

.vote-buttons {
  margin-top: 8px;
}

.vote-buttons-weighted {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.btn-vote-rank {
  padding: 8px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f3f4f6;
  color: #6b7280;
}

.btn-vote-rank:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-vote-rank:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-vote-rank.active.rank-1 {
  background-color: #fbbf24;
  color: white;
  box-shadow: 0 2px 4px rgba(251, 191, 36, 0.3);
}

.btn-vote-rank.active.rank-2 {
  background-color: #9ca3af;
  color: white;
  box-shadow: 0 2px 4px rgba(156, 163, 175, 0.3);
}

.btn-vote-rank.active.rank-3 {
  background-color: #fb923c;
  color: white;
  box-shadow: 0 2px 4px rgba(251, 146, 60, 0.3);
}

.btn-vote-simple {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f3f4f6;
  color: #374151;
}

.btn-vote-simple:hover:not(:disabled) {
  background-color: #eff6ff;
  color: #2563eb;
}

.btn-vote-simple:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-vote-simple.active {
  background-color: #3b82f6;
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.voted-badge {
  margin-top: 8px;
  padding: 10px;
  background-color: #f3f4f6;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.voted-badge.my-vote {
  background-color: #dbeafe;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.voted-badge .vote-icon {
  font-size: 16px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
}

.modal {
  background: white;
  border-radius: 16px;
  max-width: 512px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  color: #111827;
}

.btn-close {
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background-color: #f3f4f6;
}

.btn-close .icon {
  font-size: 20px;
  color: #6b7280;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.image-upload {
  position: relative;
}

.image-preview {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 8px;
  background: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-remove-image:hover {
  background-color: #f3f4f6;
}

.btn-remove-image .icon {
  font-size: 16px;
  color: #6b7280;
}

.image-upload-label {
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.image-upload-label:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.upload-icon {
  font-size: 32px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel:hover {
  background-color: #f3f4f6;
}

.btn-confirm {
  padding: 10px 20px;
  background-color: #3b82f6;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .battle-info-main {
    flex-direction: column;
    gap: 16px;
  }

  .battle-stats {
    margin-left: 0;
  }

  .vote-bar-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .vote-selected {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }

  .container {
    padding: 16px;
  }

  .battle-info {
    padding: 16px;
  }

  .title {
    font-size: 20px;
  }
}
</style>