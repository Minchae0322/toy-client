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
      <main class="content-wrapper">
        <!-- Battle Info -->
        <BattleInfoCard
            :battle="battle"
            :is-weighted-vote="isWeightedVote"
            :can-user-add-item="canUserAddItem"
            @add-product="showAddModal = true"
            @back="goBack"
            @share="shareBattle"
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
              :display-rank="item.rank || (index + 1)"
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
import { getUserId } from '@/utils/auth.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import ShareModal from '@/components/common/ShareModal.vue'
import BattleInfoCard from '@/components/battle/detail/BattleInfoCard.vue'
import VoteSelectionBar from '@/components/battle/detail/VoteSelectionBar.vue'
import ProductCard from '@/components/battle/detail/ProductCard.vue'
import AddProductModal from '@/components/battle/detail/AddProductModal.vue'

export default {
  name: 'BattleDetail',
  components: {
    ShareModal,
    BattleInfoCard,
    VoteSelectionBar,
    ProductCard,
    AddProductModal
  },
  setup() {
    const { open } = useConfirmDialog()
    return { open }
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

      // MULTIPLE/SINGLE 모두 최소 1개 이상 선택 필요
      if (!this.hasSelectedItems) {
        await this.open({ type: 'alert', title: '투표 선택 필요', message: '제품을 선택해주세요' })
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

        const response = await battleService.voteBattleItem(this.battleId, { votes })

        if (response.success) {
          await this.open({ type: 'alert', title: '투표 완료', message: '투표가 완료되었습니다!' })
          this.hasVoted = true
          this.selectedRanks = { 1: null, 2: null, 3: null }
          await this.loadBattle()
        } else {
          throw new Error(response.message || '투표에 실패했습니다.')
        }
      } catch (err) {
        console.error('투표 실패:', err)
        await this.open({ type: 'alert', title: '오류', message: err.message || '투표에 실패했습니다.' })
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
        await this.open({ type: 'alert', title: '입력 필요', message: '제품명을 입력해주세요' })
        return
      }

      this.submitting = true

      try {
        // 이미 업로드된 URL 사용
        const itemData = {
          items: [{
            customName: this.newProduct.name,
            customBrand: this.newProduct.brand || null,
            customImageUrl: this.newProduct.uploadedImageUrl
          }]
        }

        const response = await battleService.addBattleItems(this.battleId, itemData)

        if (response.success) {
          await this.open({ type: 'alert', title: '등록 완료', message: '제품이 등록되었습니다!' })
          this.closeAddModal()
          await this.loadBattle()
        } else {
          throw new Error(response.message || '제품 등록에 실패했습니다.')
        }
      } catch (err) {
        console.error('제품 등록 실패:', err)
        await this.open({ type: 'alert', title: '오류', message: err.message || '제품 등록에 실패했습니다.' })
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
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 0 12px 40px;
  }

  .soft-modern-v1 {
    padding-bottom: 120px;
  }
}
</style>
