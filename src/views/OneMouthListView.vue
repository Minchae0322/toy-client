<template>
  <div class="app-container">
    <HeaderSection :total-foods="totalFoods" :active-sellings="activeSellings" :total-users="totalUsers" />

    <div class="main-content">
      <SidebarSection
          :search-query="searchQuery"
          :filter-options="filterOptions"
          :active-filter="activeFilter"
          @update-query="updateSearchQuery"
          @set-filter="setActiveFilter"
      />

      <ContentArea
          :filtered-foods="filteredFoods"
          :sort-by="sortBy"
          :active-filter="activeFilter"
          @set-sort="setSortBy"
          @view-detail="viewDetail"
          @request-share="requestShare"
          @start-chat="startChat"
      />
    </div>

    <FloatingButton @click="addNewFood" />
  </div>
</template>

<script>
import HeaderSection from '@/components/oneMouth/HeaderSection.vue';
import SidebarSection from '@/components/oneMouth/SidebarSection.vue';
import ContentArea from '@/components/oneMouth/ContentArea.vue';
import FloatingButton from '@/components/oneMouth/FloatingButton.vue';

export default {
  name: 'OneMouthListView',
  components: {
    HeaderSection,
    SidebarSection,
    ContentArea,
    FloatingButton
  },
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
      foods: [
        {
          id: 1,
          name: 'CU 신상 초코바',
          description: '진짜 맛있다는 소문의 그 초코바!',
          emoji: '🍫',
          rating: 4.8,
          reviewCount: 127,
          location: '강남구 역삼동',
          trending: true,
          selling: true,
          price: 1500,
          stock: 3,
          category: 'snacks'
        },
        {
          id: 2,
          name: 'CU 신상 초코바',
          description: '진짜 맛있다는 소문의 그 초코바!',
          emoji: '🍫',
          rating: 4.8,
          reviewCount: 127,
          location: '강남구 역삼동',
          trending: true,
          selling: true,
          price: 1500,
          stock: 3,
          category: 'snacks'
        },
        {
          id: 3,
          name: 'CU 신상 초코바',
          description: '진짜 맛있다는 소문의 그 초코바!',
          emoji: '🍫',
          rating: 4.8,
          reviewCount: 127,
          location: '강남구 역삼동',
          trending: true,
          selling: true,
          price: 1500,
          stock: 3,
          category: 'snacks'
        },
        // 추가 데이터 계속...
      ],

      filteredFoods: []
    }
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
    this.filteredFoods = this.foods;
  },
  methods: {
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
.app-container {
  max-width: 1400px;
  margin: 0 auto;
  background: transparent;
  min-height: 100vh;
}

.main-content {
  display: flex;
  max-width: 1800px;
  margin: 0 auto;
  gap: 40px;
  padding: 40px 60px;
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
    padding: 20px;
    gap: 20px;
  }
}
</style>
