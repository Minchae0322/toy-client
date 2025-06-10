<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <AppHeader />

    <!-- MBTI 추천 배너 -->
    <MbtiRecommendation />

    <!-- Navigation Tabs -->
    <NavigationTabs
        :active-tab="activeTab"
        @tab-change="setActiveTab"
    />

    <!-- Main Content -->
    <div class="p-4 space-y-6">
      <!-- AI 밈 생성기 프로모션 -->
      <MemeGeneratorPromo />

      <!-- 트렌딩 밈/짤 섹션 -->
      <TrendingMemes
          :memes="trendingMemes"
          :liked-items="likedItems"
          @like="handleLike"
      />

      <!-- 유행 먹거리 섹션 -->
      <TrendingFoods :foods="trendingFoods" />

      <!-- 빠른 액션 -->
      <QuickActions />
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import MbtiRecommendation from '@/components/MbtiRecommendation.vue'
import NavigationTabs from '@/components/NavigationTabs.vue'
import MemeGeneratorPromo from '@/components/MemeGeneratorPromo.vue'
import TrendingMemes from '@/components/TrendingMemes.vue'
import TrendingFoods from '@/components/TrendingFoods.vue'
import QuickActions from '@/components/QuickActions.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

export default {
  name: 'MZLifestyleHome',
  components: {
    AppHeader,
    MbtiRecommendation,
    NavigationTabs,
    MemeGeneratorPromo,
    TrendingMemes,
    TrendingFoods,
    QuickActions,
    BottomNavigation
  },
  setup() {
    const activeTab = ref('home')
    const likedItems = reactive({})

    const trendingMemes = [
      {
        id: 1,
        image: "https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=월요일+기분",
        title: "월요일 아침 기분.jpg",
        likes: 1247,
        comments: 89,
        tags: ["#월요병", "#직장인", "#공감"]
      },
      {
        id: 2,
        image: "https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=카페+대기",
        title: "카페 대기줄 현실",
        likes: 892,
        comments: 156,
        tags: ["#카페", "#대기", "#일상"]
      },
      {
        id: 3,
        image: "https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=배달+고민",
        title: "배달음식 고민하는 나",
        likes: 2156,
        comments: 234,
        tags: ["#배달", "#선택장애", "#혼밥"]
      }
    ]

    const trendingFoods = [
      {
        id: 1,
        name: "딸기 크림 라떼",
        brand: "스타벅스",
        rating: 4.2,
        reviews: 1890,
        image: "https://via.placeholder.com/150x150/FF69B4/FFFFFF?text=딸기라떼",
        price: "5,900원",
        isHot: true
      },
      {
        id: 2,
        name: "허니버터 아몬드 케이크",
        brand: "파리바게뜨",
        rating: 4.5,
        reviews: 756,
        image: "https://via.placeholder.com/150x150/FFD700/FFFFFF?text=케이크",
        price: "3,200원",
        isNew: true
      },
      {
        id: 3,
        name: "매운 불닭볶음면 컵라면",
        brand: "삼양",
        rating: 4.1,
        reviews: 2341,
        image: "https://via.placeholder.com/150x150/FF4500/FFFFFF?text=불닭",
        price: "1,800원",
        isHot: true
      }
    ]

    const handleLike = (id) => {
      likedItems[id] = !likedItems[id]
    }

    const setActiveTab = (tab) => {
      activeTab.value = tab
    }

    return {
      activeTab,
      likedItems,
      trendingMemes,
      trendingFoods,
      handleLike,
      setActiveTab
    }
  }
}
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.p-4 {
  padding: 1rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}
</style>