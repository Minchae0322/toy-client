<template>
  <main class="content-area">
    <div class="content-header">
      <div>
        <h2 class="content-title">{{ getCurrentTitle }}</h2>
        <p class="results-count">{{ filteredFoods.length }}개의 음식을 찾았습니다</p>
      </div>
      <div class="sort-options">
        <button
            class="sort-btn"
            :class="{ active: sortBy === 'latest' }"
            @click="$emit('set-sort', 'latest')"
        >
          최신순
        </button>
        <button
            class="sort-btn"
            :class="{ active: sortBy === 'rating' }"
            @click="$emit('set-sort', 'rating')"
        >
          평점순
        </button>
        <button
            class="sort-btn"
            :class="{ active: sortBy === 'price' }"
            @click="$emit('set-sort', 'price')"
        >
          가격순
        </button>
      </div>
    </div>

    <div class="food-grid" v-if="filteredFoods.length > 0">
      <div
          class="food-card"
          v-for="food in filteredFoods"
          :key="food.id"
          @click="$emit('view-detail', food)"
      >
        <div class="food-image">
          {{ food.emoji }}
          <div class="trending-badge" v-if="food.trending">🌟 HOT</div>
          <div class="selling-badge" v-if="food.selling">💰 판매중</div>
        </div>
        <div class="food-info">
          <h3 class="food-title">{{ food.name }}</h3>
          <p class="food-description">{{ food.description }}</p>
          <div class="food-stats">
            <div class="location">📍 {{ food.location }}</div>
          </div>
          <div class="price-section" v-if="food.selling">
            <div class="price">{{ food.price.toLocaleString() }}원</div>
            <div class="stock-info">{{ food.stock }}개 남음</div>
          </div>
          <div class="action-buttons" v-if="food.selling">
            <button class="btn btn-secondary" @click.stop="$emit('start-chat', food)">💬 채팅하기</button>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-state-icon">🔍</div>
      <h3>검색 결과가 없어요</h3>
      <p>다른 키워드나 카테고리를 선택해보세요!</p>
    </div>
  </main>
</template>

<script>
import contentApi from '@/api/axios.js'; // 공통 axios 인스턴스 불러오기

export default {
  name: 'OneMouthListView',
  data() {
    return {
      searchQuery: '',
      activeFilter: 'all',
      sortBy: 'latest',
      filterOptions: [
        { key: 'all', label: '전체', icon: '🍽️' },
        { key: 'trending', label: '트렌딩', icon: '🌟' },
        { key: 'selling', label: '판매중', icon: '💰' },
        { key: 'drinks', label: '음료', icon: '🧋' },
        { key: 'desserts', label: '디저트', icon: '🍰' },
        { key: 'snacks', label: '간식', icon: '🥟' }
      ],
      foods: [],
      filteredFoods: []
    };
  },
  computed: {
    totalFoods() {
      return this.foods.length;
    },
    activeSellings() {
      return this.foods.filter(food => food.selling).length;
    },
    totalUsers() {
      return 1247;
    }
  },
  mounted() {
    this.fetchFoods();
  },
  methods: {
    async fetchFoods() {
      try {
        const res = await contentApi.get('/one-mouths'); // baseURL은 이미 내부에 설정됨
        const contents = res.data.content;

        this.foods = contents.map(item => ({
          id: item.oneMouthId,
          name: item.title,
          description: item.description,
          emoji: '🍱', // 기본값, 서버에서 지원할 경우 바꿔도 됨
          rating: 4.5, // 임시 값, 나중에 서버에서 제공되면 반영
          reviewCount: item.hits,
          location: item.location,
          trending: item.hits > 50,
          selling: item.productStatus === 'FOR_SALE',
          price: item.price,
          stock: 1, // 서버에 수량 정보 있다면 반영
          category: item.category?.categoryName || '기타'
        }));

        this.filteredFoods = this.foods;
      } catch (error) {
        console.error('🍽 음식 데이터 로딩 실패:', error);
      }
    },
    setActiveFilter(filter) {
      this.activeFilter = filter;
      this.filterFoods();
    },
    setSortBy(sortBy) {
      this.sortBy = sortBy;
    },
    updateSearchQuery(query) {
      this.searchQuery = query;
      this.filterFoods();
    },
    filterFoods() {
      let filtered = this.foods;
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(food =>
            food.name.toLowerCase().includes(query) ||
            food.description.toLowerCase().includes(query)
        );
      }
      if (this.activeFilter !== 'all') {
        if (this.activeFilter === 'trending') {
          filtered = filtered.filter(food => food.trending);
        } else if (this.activeFilter === 'selling') {
          filtered = filtered.filter(food => food.selling);
        } else {
          filtered = filtered.filter(food => food.category === this.activeFilter);
        }
      }
      this.filteredFoods = filtered;
    },
    viewDetail(food) {
      alert(`${food.name} 상세페이지로 이동합니다!`);
    },
    requestShare(food) {
      alert(`${food.name} 한입 나눔을 요청했습니다!`);
    },
    startChat(food) {
      alert(`${food.name} 판매자와 채팅을 시작합니다!`);
    },
    addNewFood() {
      alert('새로운 음식을 등록합니다!');
    }
  }
};
</script>

<style scoped>
.content-area {
  flex: 1;
  min-width: 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.content-title {
  font-size: 28px;
  font-weight: 700;
  color: #222;
}

.sort-options {
  display: flex;
  gap: 12px;
}

.sort-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.sort-btn.active {
  background: #169976;
  color: white;
  border-color: #169976;
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.food-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.food-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.food-image {
  width: 100%;
  height: 160px;
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  position: relative;
}

.trending-badge,
.selling-badge {
  position: absolute;
  top: 12px;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 600;
  color: white;
}

.trending-badge {
  left: 12px;
  background: #ff4757;
}

.selling-badge {
  right: 12px;
  background: #1DCD9F;
}

.food-info {
  padding: 12px;
}

.food-title {
  font-size: 17px;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
  line-height: 1.3;
}

.food-description {
  font-size: 11px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.food-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #ffa500;
  font-weight: 500;
}

.location {
  font-size: 12px;
  color: #888;
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.price {
  font-size: 17px;
  font-weight: 700;
  color: #169976;
}

.stock-info {
  font-size: 12px;
  color: #ffa500;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  flex: 1;
  text-align: center;
}

.btn-primary {
  background: #169976;
  color: white;
}

.btn-primary:hover {
  background: #128a64;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f8f9fa;
  color: #169976;
  border: 1px solid #169976;
}

.btn-secondary:hover {
  background: #169976;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  grid-column: 1 / -1;
}

.empty-state-icon {
  font-size: 72px;
  margin-bottom: 20px;
  opacity: 0.5;
}

@media (max-width: 1200px) {
  .food-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 768px) {
  .food-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .food-grid {
    grid-template-columns: 1fr;
  }
}


</style>