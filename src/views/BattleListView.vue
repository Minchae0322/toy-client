<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <AppHeader
          title="월간 배틀"
          :show-create-button="true"
          create-button-text="배틀 만들기"
          @create="handleCreateBattle"
      />

      <BattleTabs
          :tabs="tabs"
          v-model:active-tab="activeTab"
      />

      <CommonCategoryFilter
          :categories="categories"
          :show-all-button="true"
          @category-change="handleCategoryChange"
      />

      <div class="content-area">
        <!-- HOT 배틀 섹션 -->
        <HotBattleSection
            v-if="activeTab === 'ongoing' && !selectedCategory"
            :battles="hotBattles"
            :loading="hotLoading"
            @battle-click="openBattle"
        />

        <!-- 전체 배틀 리스트 -->
        <section>
          <div class="section-header">
            <h2 class="section-title">
              {{ currentCategoryTitle }}
            </h2>
            <div class="section-info">
              <span class="battle-count">{{ filteredBattles.length }}개</span>
            </div>
          </div>

          <BattleList
              ref="battleListRef"
              :battles="filteredBattles"
              :loading="loading"
              :has-next="hasNext"
              :view-mode="viewMode"
              @battle-click="openBattle"
          />
        </section>
      </div>
    </main>

    <RightSidebar>
      <template #trending>
        <TrendingBattles
            :battles="trendingBattles"
            @battle-click="openBattle"
        />
      </template>

      <template #deadline>
        <DeadlineBattles
            :battles="deadlineBattles"
            @vote="handleVote"
        />
      </template>
    </RightSidebar>

    <!-- Bottom Navigation - Mobile Only -->
    <nav class="bottom-nav">
      <button class="bottom-nav-item" @click="$router.push('/feed')">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
        <span>홈</span>
      </button>
      <button class="bottom-nav-item active">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/>
        </svg>
        <span>배틀</span>
        <span class="nav-badge">3</span>
      </button>
      <button class="bottom-nav-fab" @click="handleCreateBattle">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
      </button>
      <button class="bottom-nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
        </svg>
        <span>메시지</span>
      </button>
      <button class="bottom-nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
        </svg>
        <span>MY</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted, watch} from 'vue';
import {useRouter} from 'vue-router';

// Components
import CommonCategoryFilter from '@/components/category/CommonCategoryFilter.vue';
import AppSidebar from '@/components/feed/AppSidebar.vue';
import AppHeader from '@/components/battle/AppHeader.vue';
import RightSidebar from '@/components/battle/RightSidebar.vue';
import BattleTabs from '@/components/battle/BattleTabs.vue';
import HotBattleSection from '@/components/battle/HotBattleSection.vue';
import BattleList from '@/components/battle/BattleList.vue';
import TrendingBattles from '@/components/battle/TrendingBattles.vue';
import DeadlineBattles from '@/components/battle/DeadlineBattles.vue';

const router = useRouter();

// ==================== Mock 데이터 생성 ====================
const generateMockBattle = (id, isHot = false, categoryId = null) => {
  const randomCategoryId = categoryId || [
    'tech', 'tech-mobile', 'tech-pc', 'tech-audio',
    'fashion', 'fashion-men', 'fashion-women',
    'beauty', 'beauty-skincare', 'beauty-makeup',
    'food', 'food-fresh', 'food-beverage',
    'living', 'living-furniture', 'living-kitchen'
  ][Math.floor(Math.random() * 15)];

  return {
    battleId: id,
    title: `${isHot ? '🔥 ' : ''}2024년 최고의 ${getCategoryProduct(randomCategoryId)}는?`,
    description: '여러분이 생각하는 올해 최고의 제품을 투표해주세요!',
    status: Math.random() > 0.3 ? 'ACTIVE' : 'ENDED',
    startDate: '2024-10-01T00:00:00',
    endDate: '2024-10-31T23:59:59',
    totalVotes: Math.floor(Math.random() * 5000) + 100,
    participantCount: Math.floor(Math.random() * 1000) + 50,
    viewCount: Math.floor(Math.random() * 10000) + 500,

    categoryId: randomCategoryId,
    parentCategoryId: randomCategoryId.includes('-') ? randomCategoryId.split('-')[0] : randomCategoryId,

    battleType: Math.random() > 0.5 ? 'CURATION' : 'OPEN',

    createdBy: {
      userId: Math.floor(Math.random() * 1000),
      nickname: ['테크리뷰어', '가젯매니아', '얼리어답터', '디지털노마드'][Math.floor(Math.random() * 4)],
      profileImage: null
    },

    options: [
      {
        optionId: id * 10 + 1,
        title: getOptionTitle(randomCategoryId, 1),
        voteCount: Math.floor(Math.random() * 2000),
        votePercentage: Math.floor(Math.random() * 40) + 20,
        imageUrl: 'https://via.placeholder.com/400x300?text=Option+1'
      },
      {
        optionId: id * 10 + 2,
        title: getOptionTitle(randomCategoryId, 2),
        voteCount: Math.floor(Math.random() * 2000),
        votePercentage: Math.floor(Math.random() * 40) + 20,
        imageUrl: 'https://via.placeholder.com/400x300?text=Option+2'
      }
    ],

    hotScore: isHot ? Math.random() * 100 + 50 : Math.random() * 50,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  };
};

// Helper functions
const getCategoryProduct = (categoryId) => {
  const products = {
    'tech': '전자제품',
    'tech-mobile': '스마트폰',
    'tech-pc': '노트북',
    'tech-audio': '무선이어폰',
    'fashion': '패션 아이템',
    'fashion-men': '남성 재킷',
    'fashion-women': '여성 가방',
    'beauty': '뷰티 제품',
    'beauty-skincare': '스킨케어',
    'beauty-makeup': '파운데이션',
    'food': '식품',
    'food-fresh': '과일',
    'food-beverage': '커피',
    'living': '생활용품',
    'living-furniture': '의자',
    'living-kitchen': '프라이팬'
  };
  return products[categoryId] || '제품';
};

const getOptionTitle = (categoryId, index) => {
  const options = {
    'tech-mobile': ['아이폰 15 Pro', '갤럭시 S24 Ultra'],
    'tech-audio': ['에어팟 프로 2', '소니 WF-1000XM5'],
    'tech-pc': ['맥북 프로 M3', 'LG 그램 17'],
    'fashion-men': ['노스페이스 눕시', '파타고니아 레트로X'],
    'beauty-skincare': ['SK-II 에센스', '설화수 윤조에센스'],
    'food-beverage': ['스타벅스 아메리카노', '블루보틀 라떼']
  };

  const defaultOptions = ['옵션 A', '옵션 B'];
  return (options[categoryId] || defaultOptions)[index - 1];
};

// ==================== State ====================
const tabs = [
  {id: 'ongoing', label: '진행중', count: 47},
  {id: 'ended', label: '종료됨', count: 128},
  {id: 'my', label: '내 배틀', count: 12}
];

const activeTab = ref('ongoing');
const battles = ref([]);
const hotBattles = ref([]);
const trendingBattles = ref([]);
const deadlineBattles = ref([]);
const cursor = ref(null);
const hasNext = ref(true);
const loading = ref(false);
const hotLoading = ref(false);
const battleListRef = ref(null);
const viewMode = ref('feed');

// 카테고리 상태
const selectedCategory = ref(null);
const selectedSubCategory = ref(null);
const showSubCategories = ref(false);

// 카테고리 데이터
const categories = ref([
  {
    categoryId: 'tech',
    categoryName: '테크/가전',
    children: [
      { categoryId: 'tech-mobile', categoryName: '모바일/태블릿' },
      { categoryId: 'tech-pc', categoryName: 'PC/노트북' },
      { categoryId: 'tech-audio', categoryName: '음향기기' },
      { categoryId: 'tech-camera', categoryName: '카메라' },
      { categoryId: 'tech-wearable', categoryName: '웨어러블' }
    ]
  },
  {
    categoryId: 'fashion',
    categoryName: '패션',
    children: [
      { categoryId: 'fashion-men', categoryName: '남성패션' },
      { categoryId: 'fashion-women', categoryName: '여성패션' },
      { categoryId: 'fashion-shoes', categoryName: '신발' }
    ]
  },
  {
    categoryId: 'beauty',
    categoryName: '뷰티',
    children: [
      { categoryId: 'beauty-skincare', categoryName: '스킨케어' },
      { categoryId: 'beauty-makeup', categoryName: '메이크업' },
      { categoryId: 'beauty-perfume', categoryName: '향수' }
    ]
  },
  {
    categoryId: 'food',
    categoryName: '식품',
    children: [
      { categoryId: 'food-fresh', categoryName: '신선식품' },
      { categoryId: 'food-processed', categoryName: '가공식품' },
      { categoryId: 'food-beverage', categoryName: '음료' },
      { categoryId: 'food-health', categoryName: '건강식품' }
    ]
  },
  {
    categoryId: 'living',
    categoryName: '리빙/생활',
    children: [
      { categoryId: 'living-furniture', categoryName: '가구' },
      { categoryId: 'living-kitchen', categoryName: '주방용품' },
      { categoryId: 'living-interior', categoryName: '인테리어' }
    ]
  },
  {
    categoryId: 'sports',
    categoryName: '스포츠/레저',
    children: []
  },
  {
    categoryId: 'culture',
    categoryName: '문화/예술',
    children: []
  }
]);

// ==================== Computed ====================
const currentCategoryTitle = computed(() => {
  if (!selectedCategory.value) return '전체 배틀';

  let title = selectedCategory.value.categoryName;
  if (selectedSubCategory.value) {
    title += ` > ${selectedSubCategory.value.categoryName}`;
  }
  return title;
});

const filteredBattles = computed(() => {
  let result = battles.value;

  // 카테고리 필터링
  if (selectedCategory.value) {
    if (selectedSubCategory.value) {
      // 서브 카테고리 선택됨
      result = result.filter(b => b.categoryId === selectedSubCategory.value.categoryId);
    } else {
      // 부모 카테고리만 선택됨
      result = result.filter(b => b.parentCategoryId === selectedCategory.value.categoryId);
    }
  }

  return result;
});

// ==================== Methods ====================
const handleCategoryClick = (category) => {
  selectedCategory.value = category;
  selectedSubCategory.value = null;

  if (category && category.children && category.children.length > 0) {
    showSubCategories.value = true;
  } else {
    showSubCategories.value = false;
  }

  // 카테고리 변경 시 배틀 목록 리로드
  resetAndLoadBattles();
};

const handleSubCategoryClick = (subCategory) => {
  selectedSubCategory.value = subCategory;
  resetAndLoadBattles();
};

const loadHotBattles = async () => {
  try {
    hotLoading.value = true;
    await new Promise(resolve => setTimeout(resolve, 500));

    hotBattles.value = [
      generateMockBattle(1, true),
      generateMockBattle(2, true)
    ];

    console.log('✅ HOT 배틀 로드 성공');
  } catch (error) {
    console.error('❌ HOT 배틀 로드 실패:', error);
  } finally {
    hotLoading.value = false;
  }
};

const loadBattles = async () => {
  if (loading.value || !hasNext.value) return;

  try {
    loading.value = true;
    await new Promise(resolve => setTimeout(resolve, 800));

    const currentLength = battles.value.length;
    const targetCategoryId = selectedSubCategory.value?.categoryId ||
        selectedCategory.value?.categoryId ||
        null;

    const newBattles = Array.from({length: 20}, (_, i) =>
        generateMockBattle(currentLength + i + 100, false, targetCategoryId)
    );

    // 탭 필터링
    const filteredBattles = newBattles.filter(battle => {
      if (activeTab.value === 'ongoing') return battle.status === 'ACTIVE';
      if (activeTab.value === 'ended') return battle.status === 'ENDED';
      return true;
    });

    battles.value = [...battles.value, ...filteredBattles];

    if (battles.value.length >= 100) {
      hasNext.value = false;
    }

    console.log('✅ 배틀 로드 성공:', battles.value.length);
  } catch (error) {
    console.error('❌ 배틀 로드 실패:', error);
  } finally {
    loading.value = false;
  }
};

const loadTrendingBattles = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));

    trendingBattles.value = Array.from({length: 5}, (_, i) =>
        generateMockBattle(200 + i, false)
    );

    console.log('✅ 트렌딩 배틀 로드 성공');
  } catch (error) {
    console.error('❌ 트렌딩 배틀 로드 실패:', error);
  }
};

const loadDeadlineBattles = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));

    deadlineBattles.value = Array.from({length: 2}, (_, i) => ({
      ...generateMockBattle(300 + i, false),
      endDate: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }));

    console.log('✅ 마감 임박 배틀 로드 성공');
  } catch (error) {
    console.error('❌ 마감 임박 배틀 로드 실패:', error);
  }
};

const resetAndLoadBattles = () => {
  console.log('🔄 배틀 초기화');
  battles.value = [];
  cursor.value = null;
  hasNext.value = true;
  loadBattles();
};

const openBattle = (battleId) => {
  console.log('📖 배틀 상세 페이지로 이동:', battleId);
  alert(`배틀 상세 페이지 (ID: ${battleId})는 준비중입니다.`);
};

const handleCreateBattle = () => {
  console.log('✍️ 배틀 생성 페이지로 이동');
  router.push({name: 'BattleCreate'});
};

const handleVote = (battleId) => {
  console.log('🗳️ 투표:', battleId);
  alert(`투표 기능 (ID: ${battleId})은 준비중입니다.`);
};

// ==================== Watchers ====================
watch(activeTab, () => {
  console.log('📌 탭 변경:', activeTab.value);
  resetAndLoadBattles();
});

// ==================== Lifecycle ====================
let observer = null;

onMounted(() => {
  console.log('✅ BattleListView 마운트');

  loadHotBattles();
  loadBattles();
  loadTrendingBattles();
  loadDeadlineBattles();

  observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext.value && !loading.value) {
          console.log('👁️ 스크롤 감지 - 다음 페이지 로드');
          loadBattles();
        }
      },
      {
        threshold: 0.5,
        rootMargin: '100px'
      }
  );

  setTimeout(() => {
    if (battleListRef.value?.observerTarget) {
      observer.observe(battleListRef.value.observerTarget);
      console.log('✅ Intersection Observer 연결');
    }
  }, 100);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    console.log('🔌 Intersection Observer 해제');
  }
});
</script>

<style scoped>
/* CSS Variables */
:root {
  --primary: #1A1A1A;
  --secondary: #737380;
  --accent: #FF6B35;
  --bg: #FAFBFC;
  --card: #FFFFFF;
  --border: #F0F0F3;
  --hover: #F5F5F7;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  margin-right: 360px;
  background: var(--bg);
  min-height: 100vh;
  padding-bottom: 40px;
}

@media (max-width: 1280px) {
  .main-content {
    margin-right: 0;
  }
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding-bottom: 80px;
  }
}

/* Controls Section */
.controls-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 20px 0;
  background: var(--card);
  border-bottom: 1px solid var(--border);
}

@media (min-width: 1024px) {
  .controls-section {
    padding: 24px 40px 0;
  }
}

.category-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 16px;
  scrollbar-width: none;
  flex: 1;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  padding: 10px 18px;
  border-radius: 12px;
  background: transparent;
  color: var(--secondary);
  border: none;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}

.category-tab:hover {
  background: var(--hover);
  color: var(--primary);
}

.category-tab.active {
  background: var(--primary);
  color: white;
}

.category-tab .chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.category-tab .chevron.rotated {
  transform: rotate(180deg);
}

/* View Toggle */
.view-toggle {
  display: none;
  background: var(--bg);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

@media (min-width: 1024px) {
  .view-toggle {
    display: flex;
  }
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.view-btn:hover {
  color: var(--primary);
}

.view-btn.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.view-btn .icon {
  width: 18px;
  height: 18px;
}

/* Sub Category */
.sub-category-section {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
}

.sub-category-section::-webkit-scrollbar {
  display: none;
}

@media (min-width: 1024px) {
  .sub-category-section {
    padding: 16px 40px 20px;
  }
}

.sub-tab {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--bg);
  color: var(--secondary);
  border: none;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.sub-tab:hover {
  background: var(--hover);
  color: var(--primary);
}

.sub-tab.active {
  background: #FFF7ED;
  color: var(--accent);
  border: 1px solid var(--accent);
}

/* Content Area */
.content-area {
  padding: 40px;
}

@media (max-width: 768px) {
  .content-area {
    padding: 24px 16px;
  }
}

.section-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
  letter-spacing: -0.01em;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.battle-count {
  font-size: 14px;
  color: var(--secondary);
  padding: 4px 12px;
  background: var(--hover);
  border-radius: 12px;
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card);
  border-top: 1px solid var(--border);
  z-index: 50;
  display: none;
  align-items: center;
  justify-content: space-around;
  padding: 8px 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

@media (max-width: 1024px) {
  .bottom-nav {
    display: flex;
  }
}

.bottom-nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.bottom-nav-item.active {
  color: var(--primary);
}

.bottom-nav-item .icon {
  width: 24px;
  height: 24px;
}

.bottom-nav-item span:not(.nav-badge) {
  font-size: 11px;
  font-weight: 600;
}

.nav-badge {
  position: absolute;
  top: 4px;
  right: 8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #FF5850;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-nav-fab {
  width: 56px;
  height: 56px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(26, 26, 26, 0.3);
  margin-top: -28px;
  transition: all 0.2s;
}

.bottom-nav-fab:hover {
  background: #000000;
  transform: translateY(-1px);
}

.bottom-nav-fab:active {
  transform: scale(0.95);
}

.bottom-nav-fab .icon {
  width: 28px;
  height: 28px;
  stroke-width: 2.5;
}
</style>