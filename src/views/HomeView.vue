<!-- HomeView.vue -->
<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <MBTIRecommendationBanner />
      <NavigationTabs :active-tab="activeTab" @update-tab="setActiveTab" />

      <div class="content-wrapper">
        <AIMemeGeneratorPromo />
        <TrendingMemesSection :memes="trendingMemes" :liked-items="likedItems" @like="handleLike" />
        <TrendingFoodsSection :foods="trendingFoods" />
        <QuickActions />
      </div>
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup>
import {ref} from 'vue';
import AppSidebar from '@/components/feed/AppSidebar.vue';
import MBTIRecommendationBanner from '@/components/MZLifestyle/MBTIRecommendationBanner.vue';
import NavigationTabs from '@/components/MZLifestyle/NavigationTabs.vue';
import AIMemeGeneratorPromo from '@/components/MZLifestyle/AIMemeGeneratorPromo.vue';
import TrendingMemesSection from '@/components/MZLifestyle/TrendingMemesSection.vue';
import TrendingFoodsSection from '@/components/MZLifestyle/TrendingFoodsSection.vue';
import QuickActions from '@/components/MZLifestyle/QuickActions.vue';
import BottomNavigation from '@/components/common/BottomNavigation.vue';

const activeTab = ref('home');
const likedItems = ref({});

const setActiveTab = (tab) => {
  activeTab.value = tab;
};

const handleLike = (id) => {
  likedItems.value = {
    ...likedItems.value,
    [id]: !likedItems.value[id]
  };
};

const trendingMemes = ref([
  {
    id: 1,
    image: "https://placehold.co/300x200/FF6B6B/FFFFFF?text=월요일+기분",
    title: "월요일 아침 기분.jpg",
    likes: 1247,
    comments: 89,
    tags: ["#월요병", "#직장인", "#공감"]
  },
  {
    id: 2,
    image: "https://placehold.co/300x200/4ECDC4/FFFFFF?text=카페+대기",
    title: "카페 대기줄 현실",
    likes: 892,
    comments: 156,
    tags: ["#카페", "#대기", "#일상"]
  },
  {
    id: 3,
    image: "https://placehold.co/300x200/45B7D1/FFFFFF?text=배달+고민",
    title: "배달음식 고민하는 나",
    likes: 2156,
    comments: 234,
    tags: ["#배달", "#선택장애", "#혼밥"]
  }
]);

const trendingFoods = ref([
  {
    id: 1,
    name: "딸기 크림 라떼",
    brand: "스타벅스",
    rating: 4.2,
    reviews: 1890,
    image: "https://placehold.co/150x150/FF69B4/FFFFFF?text=딸기라떼",
    price: "5,900원",
    isHot: true
  },
  {
    id: 2,
    name: "허니버터 아몬드 케이크",
    brand: "파리바게뜨",
    rating: 4.5,
    reviews: 756,
    image: "https://placehold.co/150x150/FFD700/FFFFFF?text=케이크",
    price: "3,200원",
    isNew: true
  },
  {
    id: 3,
    name: "매운 불닭볶음면 컵라면",
    brand: "삼양",
    rating: 4.1,
    reviews: 2341,
    image: "https://placehold.co/150x150/FF4500/FFFFFF?text=불닭",
    price: "1,800원",
    isHot: true
  }
]);
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  background: #ffffff;
  min-height: 100vh;
  color: #1a1a1a;
  font-family: 'SUIT-Regular', 'Noto Sans KR', sans-serif;
  display: flex;
  max-width: 100vw;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .app-container {
    padding: 0 2rem;
  }
}

@media (min-width: 1280px) {
  .app-container {
    padding: 0 3rem;
    max-width: 1920px;
    margin-left: auto;
    margin-right: auto;
  }
}

@media (min-width: 1920px) {
  .app-container {
    padding: 0 4rem;
  }
}

.main-content {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  padding-bottom: 5rem;
  padding-left: 1.5rem;
}

@media (max-width: 767px) {
  .main-content {
    padding-left: 0;
  }
}

@media (min-width: 768px) {
  .main-content {
    padding-bottom: 2.5rem;
  }
}

.content-wrapper {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .content-wrapper {
    padding: 1.5rem;
  }
}
</style>