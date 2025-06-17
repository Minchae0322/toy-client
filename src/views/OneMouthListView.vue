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

<script setup>
import { ref, computed, onMounted } from 'vue';
import { contentService } from '@/api/axios.js'; // 서비스 함수 import
import HeaderSection from '@/components/oneMouth/HeaderSection.vue';
import SidebarSection from '@/components/oneMouth/SidebarSection.vue';
import ContentArea from '@/components/oneMouth/ContentArea.vue';
import FloatingButton from '@/components/oneMouth/FloatingButton.vue';

// Reactive state
const searchQuery = ref('');
const activeFilter = ref('all');
const sortBy = ref('latest');
const filteredFoods = ref([]);

// Static data
const filterOptions = [
  {key: 'all', label: '전체', icon: '🍽️'},
  {key: 'trending', label: '트렌딩', icon: '🌟'},
  {key: 'selling', label: '판매중', icon: '💰'},
  {key: 'drinks', label: '음료', icon: '🧋'},
  {key: 'desserts', label: '디저트', icon: '🍰'},
  {key: 'snacks', label: '간식', icon: '🥟'}
];

const foods = ref([]);

// API 호출 함수
const fetchFoods = async () => {
  try {
    const res = await contentService.getOneMouths(); // 서비스 함수 사용
    const contents = res.data.content;

    foods.value = contents.map(item => ({
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

    filteredFoods.value = foods.value;
  } catch (error) {
    console.error('🍽 음식 데이터 로딩 실패:', error);
  }
};

// Computed properties
const totalFoods = computed(() => foods.value.length);

const activeSellings = computed(() =>
    foods.value.filter(food => food.selling).length
);

const totalUsers = computed(() => 1247);

// Methods
const setActiveFilter = (filter) => {
  activeFilter.value = filter;
  filterFoods();
};

const setSortBy = (newSortBy) => {
  sortBy.value = newSortBy;
};

const updateSearchQuery = (query) => {
  searchQuery.value = query;
  filterFoods();
};

const filterFoods = () => {
  let filtered = foods.value;

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(query) ||
        food.description.toLowerCase().includes(query)
    );
  }

  if (activeFilter.value !== 'all') {
    if (activeFilter.value === 'trending') {
      filtered = filtered.filter(food => food.trending);
    } else if (activeFilter.value === 'selling') {
      filtered = filtered.filter(food => food.selling);
    } else {
      filtered = filtered.filter(food => food.category === activeFilter.value);
    }
  }

  filteredFoods.value = filtered;
};

const viewDetail = (food) => {
  alert(`${food.name} 상세페이지로 이동합니다!`);
};

const requestShare = (food) => {
  alert(`${food.name} 한입 나눔을 요청했습니다!`);
};

const startChat = (food) => {
  alert(`${food.name} 판매자와 채팅을 시작합니다!`);
};

const addNewFood = () => {
  alert('새로운 음식을 등록합니다!');
};

// Lifecycle
onMounted(() => {
  fetchFoods();
});
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