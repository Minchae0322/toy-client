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
      <!-- Header -->
      <BattleDetailHeader
          :title="battle.title"
          @back="goBack"
          @share="shareBattle"
      />

      <main class="content-wrapper">
        <!-- Battle Info -->
        <BattleInfoCard
            :battle="battle"
            :is-weighted-vote="isWeightedVote"
            :can-user-add-item="canUserAddItem"
            :has-voted="hasVoted"
            @add-product="showAddModal = true"
        />

        <!-- Vote Selection Bar -->
        <VoteSelectionBar
            v-if="canVote && hasSelectedItems"
            :selected-ranks="selectedRanks"
            :is-weighted-vote="isWeightedVote"
            :sorted-items="sortedItems"
            :submitting="submitting"
            :get-item-name="getItemName"
            @submit="submitVote"
        />

        <!-- Product Grid -->
        <div class="modern-grid">
          <ProductCard
              v-for="(item, index) in sortedItems"
              :key="item.id"
              :item="item"
              :display-rank="index + 1"
              :product-rank="getProductRank(item.id)"
              :is-weighted-vote="isWeightedVote"
              :can-vote="canVote"
              :submitting="submitting"
              :percentage="getPercentage(item)"
              @vote="handleVote"
          />
        </div>
      </main>

      <!-- Add Product Modal -->
      <AddProductModal
          v-if="showAddModal"
          :image-preview="newProduct.imagePreview"
          :name="newProduct.name"
          :brand="newProduct.brand"
          :submitting="submitting"
          @close="closeAddModal"
          @update:image="handleImageUpload"
          @clear-image="clearImage"
          @update:name="newProduct.name = $event"
          @update:brand="newProduct.brand = $event"
          @submit="submitNewProduct"
      />

      <!-- Share Modal -->
      <ShareModal
          :visible="showShareModal"
          :title="battle?.title || ''"
          :description="battle?.description || ''"
          :image="getBattleImage()"
          @close="closeShareModal"
      />
    </template>
  </div>
</template>

<script>
import { battleService } from '@/services/BattleService.js'
import { fileService } from '@/services/FileService.js'
import ShareModal from '@/components/common/ShareModal.vue'
import BattleDetailHeader from '@/components/battle/detail/BattleDetailHeader.vue'
import BattleInfoCard from '@/components/battle/detail/BattleInfoCard.vue'
import VoteSelectionBar from '@/components/battle/detail/VoteSelectionBar.vue'
import ProductCard from '@/components/battle/detail/ProductCard.vue'
import AddProductModal from '@/components/battle/detail/AddProductModal.vue'

export default {
  name: 'BattleDetail',
  components: {
    ShareModal,
    BattleDetailHeader,
    BattleInfoCard,
    VoteSelectionBar,
    ProductCard,
    AddProductModal
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
        imagePreview: null
      },
      showShareModal: false
    }
  },
  computed: {
    isWeightedVote() {
      const voteType = this.battle?.voteType?.title || this.battle?.voteType
      return voteType === 'MULTIPLE'
    },
    canVote() {
      if (!this.battle) return false
      if (this.hasVoted) return false

      const status = this.battle.status?.title || this.battle.status
      // ACTIVE 또는 NORMAL 상태일 때 투표 가능
      return status === 'ACTIVE' || status === 'NORMAL'
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
          this.checkUserVote()
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

    async submitVote() {
      if (this.submitting) return

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

        const response = await battleService.voteBattleItem(this.battleId, { votes })

        if (response.success) {
          alert('투표가 완료되었습니다!')
          this.hasVoted = true
          this.selectedRanks = { 1: null, 2: null, 3: null }
          await this.loadBattle()
        } else {
          throw new Error(response.message || '투표에 실패했습니다.')
        }
      } catch (err) {
        console.error('투표 실패:', err)
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
        const imageResponse = await fileService.uploadFiles(this.newProduct.imageFile, 'BATTLE_ITEM')

        if (!imageResponse.success) {
          throw new Error('이미지 업로드에 실패했습니다.')
        }

        const itemData = {
          items: [{
            customName: this.newProduct.name,
            customBrand: this.newProduct.brand,
            customImageUrl: imageResponse.data.fileUrl
          }]
        }

        const response = await battleService.addBattleItems(this.battleId, itemData)

        if (response.success) {
          alert('제품이 등록되었습니다!')
          this.closeAddModal()
          await this.loadBattle()
        } else {
          throw new Error(response.message || '제품 등록에 실패했습니다.')
        }
      } catch (err) {
        console.error('제품 등록 실패:', err)
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
      if (item.votePercentage !== undefined && item.votePercentage !== null) {
        return (item.votePercentage * 100).toFixed(1)
      }

      if (!this.totalScore || this.totalScore === 0) return 0
      const score = this.calculateItemScore(item)
      return ((score / this.totalScore) * 100).toFixed(1)
    },

    getItemName(item) {
      return item.battleItemProduct?.name || item.customName || '제품명 없음'
    },

    handleImageUpload(e) {
      const file = e.target.files?.[0]
      if (file) {
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

    goBack() {
      this.$router.back()
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

/* Modern Grid */
.modern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
  padding: 0 20px 40px;
}

@media (max-width: 768px) {
  .modern-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 0 16px 40px;
  }
}

@media (max-width: 480px) {
  .modern-grid {
    grid-template-columns: 1fr;
  }

  .soft-modern-v1 {
    padding-bottom: 120px;
  }
}
</style>
