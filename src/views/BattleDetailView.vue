<template>
  <div class="app-container">
    <AppSidebar />

    <main class="main-content">
      <BattleDetailHeader
          @back="goBack"
          @share="handleShare"
          @more="handleMore"
      />

      <BattleInfoSection
          v-if="battle"
          :battle="battle"
          :remaining-time="remainingTime"
          @follow="handleFollow"
      />

      <BattleActionBar
          :battle="battle"
          :active-tab="activeTab"
          :tabs="tabs"
          @update:active-tab="activeTab = $event"
          @participate="handleParticipate"
          @vote="handleVote"
      />

      <section class="products-section">
        <BattleTop3Section
            v-if="activeTab === 'products' && topProducts.length > 0"
            :products="topProducts"
            @product-click="openProductDetail"
        />

        <BattleProductList
            v-if="activeTab === 'products'"
            :products="filteredProducts"
            :sort-by="sortBy"
            :filter-status="filterStatus"
            :remaining-count="remainingProductCount"
            :has-more="hasMoreItems"
            @update:sort-by="sortBy = $event"
            @update:filter-status="filterStatus = $event"
            @product-click="openProductDetail"
            @toggle-like="toggleLike"
            @open-comments="openComments"
            @load-more="loadMoreProducts"
        />

        <div v-if="activeTab === 'myVotes'" class="my-votes-section">
          <div v-if="myVotedItems.length === 0" class="empty-state">
            <p>아직 투표한 제품이 없습니다.</p>
          </div>
        </div>

        <div v-if="activeTab === 'discussions'" class="discussions-section">
          <p style="text-align: center; color: #9CA3AF; padding: 40px;">
            토론 기능은 준비 중입니다.
          </p>
        </div>
      </section>
    </main>

    <BottomNavigation @navigate="handleNavigate" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { battleUtils, useBattle } from '@/services/BattleService'
import AppSidebar from '@/components/feed/AppSidebar.vue'
import BattleDetailHeader from '@/components/battle/detail/BattleDetailHeader.vue'
import BattleInfoSection from '@/components/battle/detail/BattleInfoSection.vue'
import BattleActionBar from '@/components/battle/detail/BattleActionBar.vue'
import BattleTop3Section from '@/components/battle/detail/BattleTop3Section.vue'
import BattleProductList from '@/components/battle/detail/BattleProductList.vue'
import BottomNavigation from '@/components/common/BottomNavigation.vue'

const router = useRouter()
const route = useRoute()
const { getBattle, voteBattleItem } = useBattle()

// State
const battle = ref(null)
const items = ref([])
const myVotedItems = ref([])
const hasMoreItems = ref(true)
const loading = ref(false)

const activeTab = ref('products')
const sortBy = ref('voteCount')
const filterStatus = ref('all')

const tabs = ref([
  { id: 'products', label: '전체 제품' },
  { id: 'myVotes', label: '내가 투표한 제품' },
  { id: 'discussions', label: '토론' }
])

// Computed
const topProducts = computed(() => {
  if (!items.value?.length) return []

  const sorted = [...items.value].sort((a, b) =>
      (b.voteCount || 0) - (a.voteCount || 0)
  )

  return sorted.slice(0, 3).map((item, index) => ({
    id: item.id,
    rank: index + 1,
    name: item.battleItemProduct?.name || item.customName || '제품명 없음',
    brand: item.battleItemProduct?.brand || item.customBrand || '',
    imageUrl: item.battleItemProduct?.thumbnailDto?.storedPath || item.customImageUrl,
    voteCount: item.voteCount || 0,
    votePercentage: battleUtils.calculateVotePercentage(
        item.voteCount || 0,
        battle.value?.totalVotes || 0
    ),
    submitterName: item.submitterUserInfo?.nickname || '알 수 없음',
    submitterUsername: item.submitterUserInfo?.email?.split('@')[0] || 'unknown'
  }))
})

const filteredProducts = computed(() => {
  if (!items.value?.length) return []

  let filtered = items.value.slice(3)

  if (filterStatus.value === 'available') {
    filtered = filtered.filter(item => item.itemStatus === 'ACTIVE')
  } else if (filterStatus.value === 'soldout') {
    filtered = filtered.filter(item => item.itemStatus !== 'ACTIVE')
  }

  if (sortBy.value === 'voteCount') {
    filtered.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
  } else if (sortBy.value === 'latest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return filtered.map((item, index) => ({
    id: item.id,
    rank: index + 4,
    name: item.battleItemProduct?.name || item.customName || '제품명 없음',
    brand: item.battleItemProduct?.brand || item.customBrand || '',
    imageUrl: item.battleItemProduct?.thumbnailDto?.storedPath || item.customImageUrl,
    voteCount: item.voteCount || 0,
    votePercentage: battleUtils.calculateVotePercentage(
        item.voteCount || 0,
        battle.value?.totalVotes || 0
    ),
    isLiked: item.userBattleVote?.hasLike || false,
    submitterName: item.submitterUserInfo?.nickname || '알 수 없음',
    submitterUsername: item.submitterUserInfo?.email?.split('@')[0] || 'unknown',
    itemStatus: item.itemStatus
  }))
})

const remainingProductCount = computed(() =>
    Math.max(0, (battle.value?.totalItems || 0) - items.value.length)
)

const remainingTime = computed(() => {
  if (!battle.value || battle.value.status !== 'ACTIVE') {
    return battleUtils.getBattleStatusLabel(battle.value?.status)
  }
  return battleUtils.formatDaysLeft(battle.value.endDate)
})

// Methods
const loadBattleDetail = async () => {
  try {
    loading.value = true
    const response = await getBattle(route.params.id)

    if (response.success && response.data) {
      battle.value = response.data
      if (response.data.items) {
        items.value = response.data.items
      }
    } else {
      throw new Error(response.error || '배틀 정보를 불러올 수 없습니다.')
    }
  } catch (err) {
    console.error('배틀 상세 로드 실패:', err)
    alert(err.message)
    router.push('/battle')
  } finally {
    loading.value = false
  }
}

const loadMoreProducts = async () => {
  if (loading.value || !hasMoreItems.value) return
  hasMoreItems.value = false
}

// Event Handlers
const goBack = () => router.push('/battle')

const handleShare = async () => {
  const url = window.location.href
  if (navigator.share) {
    try {
      await navigator.share({
        title: battle.value?.title,
        text: battle.value?.description,
        url
      })
    } catch (err) {
      console.log('공유 취소됨')
    }
  } else {
    await navigator.clipboard.writeText(url)
    alert('링크가 클립보드에 복사되었습니다.')
  }
}

const handleMore = () => console.log('더보기 메뉴')

const handleFollow = () => alert('팔로우 기능은 준비 중입니다.')

const handleParticipate = () => {
  if (!battle.value || battle.value.status !== 'ACTIVE') {
    alert('종료된 배틀입니다.')
    return
  }
  router.push(`/battle/${route.params.id}/submit`)
}

const handleVote = () => {
  if (!battle.value || battle.value.status !== 'ACTIVE') {
    alert('종료된 배틀입니다.')
    return
  }
  router.push(`/battle/${route.params.id}/vote`)
}

const openProductDetail = (productId) => {
  router.push(`/battle/${route.params.id}/products/${productId}`)
}

const toggleLike = async (productId) => {
  const item = items.value.find(i => i.id === productId)
  if (item) {
    if (!item.userBattleVote) item.userBattleVote = {}
    item.userBattleVote.hasLike = !item.userBattleVote.hasLike
  }
}

const openComments = (productId) => {
  router.push(`/battle/${route.params.id}/products/${productId}#comments`)
}

const handleNavigate = (path) => router.push(path)

// Lifecycle
onMounted(async () => {
  await loadBattleDetail()
})

let timerInterval = null
onMounted(() => {
  timerInterval = setInterval(() => {
    if (battle.value?.status === 'ACTIVE') {
      battle.value = { ...battle.value }
    }
  }, 60000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
.app-container {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Pretendard', system-ui, sans-serif;
  background: #FAFAFA;
  color: #0A0A0A;
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  background: #FAFAFA;
  min-height: 100vh;
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    padding-bottom: 68px;
  }
}

.products-section {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 32px;
}

@media (max-width: 768px) {
  .products-section {
    padding: 32px 16px;
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #A3A3A3;
}
</style>