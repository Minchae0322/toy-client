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

      <div class="content-area">
        <!-- HOT 배틀 섹션 -->
        <HotBattleSection
            v-if="activeTab === 'ongoing'"
            :battles="hotBattles"
            :loading="hotLoading"
            @battle-click="openBattle"
        />

        <!-- 전체 배틀 리스트 -->
        <section>
          <div class="section-header">
            <h2 class="section-title">전체 배틀</h2>
          </div>

          <BattleList
              ref="battleListRef"
              :battles="battles"
              :loading="loading"
              :has-next="hasNext"
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
import {ref, onMounted, onUnmounted, watch} from 'vue';
import {useRouter} from 'vue-router';

import AppSidebar from '@/components/feed/AppSidebar.vue';
import AppHeader from '@/components/battle/AppHeader.vue';
import RightSidebar from '@/components/battle/RightSidebar.vue';
import BattleTabs from '@/components/battle/BattleTabs.vue';
import HotBattleSection from '@/components/battle/HotBattleSection.vue';
import BattleList from '@/components/battle/BattleList.vue';
import TrendingBattles from '@/components/battle/TrendingBattles.vue';
import DeadlineBattles from '@/components/battle/DeadlineBattles.vue';

const router = useRouter();

// ==================== 통일된 Mock 데이터 생성 함수 ====================
const generateMockBattle = (id, isHot = false) => ({
  battleId: id,
  title: `${isHot ? '🔥 ' : ''}2024년 최고의 무선이어폰은?`,
  description: '여러분이 생각하는 올해 최고의 무선이어폰을 투표해주세요!',
  status: Math.random() > 0.3 ? 'ACTIVE' : 'ENDED',
  startDate: '2024-10-01T00:00:00',
  endDate: '2024-10-31T23:59:59',
  totalVotes: Math.floor(Math.random() * 5000) + 100,
  participantCount: Math.floor(Math.random() * 1000) + 50,
  viewCount: Math.floor(Math.random() * 10000) + 500,

  // ✅ 통일된 필드명 사용
  categoryName: ['전자기기', '패션', '뷰티', '식품', '생활'][Math.floor(Math.random() * 5)],
  battleType: Math.random() > 0.5 ? 'CURATION' : 'OPEN',

  // ✅ createdBy 객체 구조 통일
  createdBy: {
    userId: Math.floor(Math.random() * 1000),
    nickname: ['테크리뷰어', '가젯매니아', '얼리어답터', '디지털노마드'][Math.floor(Math.random() * 4)],
    profileImage: null
  },

  // ✅ options 배열 항상 포함
  options: [
    {
      optionId: id * 10 + 1,
      title: 'AirPods Pro 2세대',
      voteCount: Math.floor(Math.random() * 2000),
      votePercentage: Math.floor(Math.random() * 40) + 20,
      imageUrl: 'https://via.placeholder.com/400x300?text=Option+1'
    },
    {
      optionId: id * 10 + 2,
      title: 'Sony WF-1000XM5',
      voteCount: Math.floor(Math.random() * 2000),
      votePercentage: Math.floor(Math.random() * 40) + 20,
      imageUrl: 'https://via.placeholder.com/400x300?text=Option+2'
    }
  ],

  hotScore: isHot ? Math.random() * 100 + 50 : Math.random() * 50,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
});

// State
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

// Methods
const loadHotBattles = async () => {
  try {
    hotLoading.value = true;
    await new Promise(resolve => setTimeout(resolve, 500));

    hotBattles.value = [
      generateMockBattle(1, true),
      generateMockBattle(2, true)
    ];

    console.log('✅ HOT 배틀 로드 성공:', hotBattles.value);
  } catch (error) {
    console.error('❌ HOT 배틀 로드 실패:', error);
  } finally {
    hotLoading.value = false;
  }
};

const loadBattles = async () => {
  if (loading.value || !hasNext.value) {
    return;
  }

  try {
    loading.value = true;
    await new Promise(resolve => setTimeout(resolve, 800));

    const currentLength = battles.value.length;
    const newBattles = Array.from({length: 20}, (_, i) =>
        generateMockBattle(currentLength + i + 100)
    );

    // 필터링 (activeTab 기반)
    const filteredBattles = newBattles.filter(battle => {
      if (activeTab.value === 'ongoing') return battle.status === 'ACTIVE';
      if (activeTab.value === 'ended') return battle.status === 'ENDED';
      return true;
    });

    battles.value = [...battles.value, ...filteredBattles];

    if (battles.value.length >= 100) {
      hasNext.value = false;
    }

    console.log('✅ 배틀 로드 성공:', {
      총배틀수: battles.value.length,
      다음페이지: hasNext.value
    });
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
  // router.push({ name: 'BattleDetail', params: { id: battleId } });
};

const handleCreateBattle = () => {
  console.log('✍️ 배틀 생성 페이지로 이동');
  router.push({name: 'BattleCreate'});
};

const handleVote = (battleId) => {
  console.log('🗳️ 투표:', battleId);
  alert(`투표 기능 (ID: ${battleId})은 준비중입니다.`);
};

// 탭 변경 시 배틀 리로드
watch(activeTab, () => {
  console.log('📌 탭 변경:', activeTab.value);
  resetAndLoadBattles();
});

// Lifecycle
let observer = null;

onMounted(() => {
  console.log('✅ BattleListView 마운트 (통일된 데이터 구조)');

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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: #FAFBFC;
  color: #1A1A1A;
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
  background: #FAFBFC;
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
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  letter-spacing: -0.01em;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-top: 1px solid #F0F0F3;
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
  color: #737380;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

.bottom-nav-item.active {
  color: #1A1A1A;
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
  background: #1A1A1A;
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