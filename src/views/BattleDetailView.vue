<template>
  <div class="battle-detail">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <button class="btn btn-back">
          <span class="icon">←</span>
          목록
        </button>

        <div class="header-actions">
          <button class="btn btn-icon">
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
              <span class="tag">{{ mockBattle.category }}</span>
              <span v-if="isWeighted" class="tag tag-primary">
                순위 투표 (1위 3점, 2위 2점, 3위 1점)
              </span>
            </div>
            <h1 class="title">{{ mockBattle.title }}</h1>
            <p class="description">{{ mockBattle.description }}</p>
          </div>

          <div class="battle-stats">
            <div class="stat">
              <div class="stat-value">{{ mockBattle.daysLeft }}</div>
              <div class="stat-label">일 남음</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ (mockBattle.totalParticipants / 1000).toFixed(1) }}K</div>
              <div class="stat-label">참여</div>
            </div>
          </div>
        </div>

        <!-- Add Product Button -->
        <button
            v-if="mockBattle.allowUserSubmit && !hasVoted"
            @click="showAddModal = true"
            class="btn-add-product"
        >
          <span class="icon">+</span>
          내가 아는 좋은 제품 추가하기
        </button>
      </div>

      <!-- Vote Selection Sticky Bar -->
      <div v-if="!hasVoted && hasSelectedItems" class="vote-bar">
        <div class="vote-bar-content">
          <div class="vote-selected">
            <span class="vote-label">선택:</span>
            <div v-if="isWeighted" class="vote-ranks">
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

          <button @click="submitVote" class="btn-submit">
            투표 완료하기
          </button>
        </div>
      </div>

      <!-- Product Grid -->
      <div class="product-grid">
        <div
            v-for="(product, index) in sortedItems"
            :key="product.id"
            :class="['product-card', { 'selected': getProductRank(product.id) !== null }]"
        >
          <!-- Rank Badge -->
          <div class="product-image-wrapper">
            <div :class="['product-rank-badge', `rank-${index + 1}`]">
              {{ index + 1 }}
            </div>

            <!-- Product Image -->
            <div class="product-image">
              <img :src="product.imageUrl" :alt="product.name" />
            </div>
          </div>

          <!-- Product Info -->
          <div class="product-content">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-brand">{{ product.brand }}</p>

            <!-- Score -->
            <div class="product-score">
              <div class="score-number">
                <span class="score-value">{{ product.totalWeightedScore.toLocaleString() }}</span>
                <span class="score-unit">점</span>
              </div>
              <div class="score-bar-wrapper">
                <div class="score-bar">
                  <div class="score-fill" :style="{ width: `${getPercentage(product)}%` }"></div>
                </div>
                <span class="score-percent">{{ getPercentage(product) }}%</span>
              </div>
            </div>

            <!-- Vote Buttons -->
            <div v-if="!hasVoted" class="vote-buttons">
              <div v-if="isWeighted" class="vote-buttons-weighted">
                <button
                    v-for="r in [1, 2, 3]"
                    :key="r"
                    @click="handleVote(product.id, r)"
                    :class="['btn-vote-rank', { 'active': getProductRank(product.id) === r }, `rank-${r}`]"
                >
                  {{ r }}위 선택
                </button>
              </div>
              <button
                  v-else
                  @click="handleVote(product.id, 1)"
                  :class="['btn-vote-simple', { 'active': getProductRank(product.id) !== null }]"
              >
                {{ getProductRank(product.id) !== null ? '✓ 선택됨' : '투표하기' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <!-- Modal Header -->
        <div class="modal-header">
          <h2 class="modal-title">제품 추가하기</h2>
          <button @click="showAddModal = false" class="btn-close">
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
                class="form-input"
            />
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button @click="showAddModal = false" class="btn-cancel">
            취소
          </button>
          <button @click="submitNewProduct" class="btn-confirm">
            제품 등록
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BattleDetail',
  data() {
    return {
      mockBattle: {
        id: 1,
        title: "2025 최고의 무선 이어폰",
        description: "음질, 배터리, 디자인까지 고려한 베스트 제품을 선택해주세요.",
        category: "테크·가전",
        votingType: "WEIGHTED",
        allowUserSubmit: true,
        status: "ACTIVE",
        daysLeft: 39,
        totalParticipants: 2847,
        items: []
      },
      selectedRanks: { 1: null, 2: null, 3: null },
      hasVoted: false,
      showAddModal: false,
      newProduct: {
        name: '',
        brand: '',
        imageFile: null,
        imagePreview: null
      }
    };
  },
  computed: {
    isWeighted() {
      return this.mockBattle.votingType === 'WEIGHTED';
    },
    sortedItems() {
      return [...this.mockBattle.items].sort((a, b) => b.totalWeightedScore - a.totalWeightedScore);
    },
    totalScore() {
      return this.sortedItems.reduce((sum, item) => sum + item.totalWeightedScore, 0);
    },
    hasSelectedItems() {
      return Object.values(this.selectedRanks).some(v => v !== null);
    }
  },
  created() {
    // Initialize mock data
    this.mockBattle.items = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: `AirPods Pro ${i + 1}`,
      brand: ['Apple', 'Samsung', 'Sony', 'Bose', 'Sennheiser'][i % 5],
      firstPlaceVotes: Math.floor(Math.random() * 2000) + 500,
      secondPlaceVotes: Math.floor(Math.random() * 1500) + 400,
      thirdPlaceVotes: Math.floor(Math.random() * 1000) + 300,
      imageUrl: `https://images.unsplash.com/photo-160684183723${i}?w=400`,
      submitter: `user${i + 1}`
    }));

    // Calculate weighted scores
    this.mockBattle.items.forEach(item => {
      item.totalWeightedScore = (item.firstPlaceVotes * 3) + (item.secondPlaceVotes * 2) + (item.thirdPlaceVotes * 1);
    });
  },
  methods: {
    handleVote(productId, rank) {
      if (this.hasVoted) return;

      const newRanks = { ...this.selectedRanks };

      if (this.isWeighted) {
        Object.keys(newRanks).forEach(key => {
          if (newRanks[key] === productId) newRanks[key] = null;
        });

        if (this.selectedRanks[rank] === productId) {
          newRanks[rank] = null;
        } else {
          newRanks[rank] = productId;
        }
      } else {
        newRanks[1] = this.selectedRanks[1] === productId ? null : productId;
      }

      this.selectedRanks = newRanks;
    },
    submitVote() {
      if (this.isWeighted) {
        if (!this.selectedRanks[1] || !this.selectedRanks[2] || !this.selectedRanks[3]) {
          alert('1위, 2위, 3위를 모두 선택해주세요');
          return;
        }
      } else {
        if (!this.selectedRanks[1]) {
          alert('제품을 선택해주세요');
          return;
        }
      }
      this.hasVoted = true;
      this.selectedRanks = { 1: null, 2: null, 3: null };
      alert('투표가 완료되었습니다!');
    },
    getProductRank(productId) {
      const entry = Object.entries(this.selectedRanks).find(([_, id]) => id === productId);
      return entry ? parseInt(entry[0]) : null;
    },
    getPercentage(product) {
      return ((product.totalWeightedScore / this.totalScore) * 100).toFixed(1);
    },
    getSelectedProductName(rank) {
      const productId = this.selectedRanks[rank];
      const product = this.sortedItems.find(p => p.id === productId);
      return product ? product.name : '미선택';
    },
    handleImageUpload(e) {
      const file = e.target.files?.[0];
      if (file) {
        this.newProduct.imageFile = file;
        this.newProduct.imagePreview = URL.createObjectURL(file);
      }
    },
    clearImage() {
      if (this.newProduct.imagePreview) {
        URL.revokeObjectURL(this.newProduct.imagePreview);
      }
      this.newProduct.imageFile = null;
      this.newProduct.imagePreview = null;
    },
    submitNewProduct() {
      if (!this.newProduct.name || !this.newProduct.brand || !this.newProduct.imageFile) {
        alert('모든 필드를 입력해주세요');
        return;
      }

      alert('제품이 등록되었습니다!');
      this.showAddModal = false;
      this.newProduct = { name: '', brand: '', imageFile: null, imagePreview: null };
    }
  }
};
</script>

<style scoped>
.battle-detail {
  min-height: 100vh;
  background-color: #f9fafb;
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

.btn:hover {
  background-color: #f3f4f6;
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

.title {
  font-size: 24px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 8px;
}

.description {
  font-size: 14px;
  color: #6b7280;
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
  font-size: 20px;
  font-weight: bold;
  color: #111827;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
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
}

.vote-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.vote-ranks {
  display: flex;
  gap: 8px;
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
}

.btn-submit:hover {
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

.btn-vote-rank:hover {
  background-color: #e5e7eb;
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

.btn-vote-simple:hover {
  background-color: #eff6ff;
  color: #2563eb;
}

.btn-vote-simple.active {
  background-color: #3b82f6;
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
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

.btn-confirm:hover {
  background-color: #2563eb;
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
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }

  .container {
    padding: 16px;
  }
}
</style>