<template>
  <aside class="sidebar-right">
    <!-- Trending -->
    <section class="sidebar-section">
      <div class="section-header">
        <h3 class="sidebar-title">Trending</h3>
        <button
            v-if="hotHashtags.length > 5"
            @click="toggleExpand"
            class="btn-expand"
        >
          {{ isExpanded ? '−' : `+${Math.min(hotHashtags.length, 10) - 5}` }}
        </button>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="state-wrapper">
        <div class="loading-spinner"></div>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="state-wrapper">
        <p class="error-text">{{ error }}</p>
        <button @click="loadHotHashtags" class="btn-retry">다시 시도</button>
      </div>

      <!-- 해시태그 목록 -->
      <div v-else class="trending-list">
        <transition-group name="list" tag="div">
          <div
              v-for="(hashtag, idx) in displayedHashtags"
              :key="hashtag.id"
              class="trending-item"
              @click="onHashtagClick(hashtag.name)"
          >
            <span class="rank">{{ idx + 1 }}</span>
            <div class="content">
              <p class="tag">{{ formatHashtag(hashtag.name) }}</p>
              <p class="count">{{ formatUsageCount(hashtag.usageCount) }}</p>
            </div>
          </div>
        </transition-group>

        <div v-if="hotHashtags.length === 0" class="state-wrapper">
          <p class="empty-text">트렌딩 데이터 없음</p>
        </div>
      </div>
    </section>

    <!-- Recommended -->
    <section class="sidebar-section">
      <h3 class="sidebar-title">Recommended</h3>
      <div class="recommended-list">
        <div
            v-for="user in recommendedUsers"
            :key="user.name"
            class="recommended-item"
        >
          <img :src="user.image" :alt="user.name" class="avatar" />
          <div class="content">
            <p class="name">{{ user.name }}</p>
            <p class="desc">{{ formatNumber(user.followers) }}</p>
          </div>
          <button class="btn-follow">팔로우</button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="footer-links">
        <a href="#">About</a>
        <a href="#">Terms</a>
        <a href="#">Privacy</a>
        <a href="#">Help</a>
      </div>
      <p class="copyright">© 2025 HYPE BATTLE</p>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFeed, feedUtils } from '@/services/FeedService'

const router = useRouter()
const { getHotHashtags } = useFeed()

const hotHashtags = ref([])
const loading = ref(false)
const error = ref(null)
const isExpanded = ref(false)

const displayedHashtags = computed(() => {
  const maxCount = Math.min(hotHashtags.value.length, 10)
  return isExpanded.value ? hotHashtags.value.slice(0, maxCount) : hotHashtags.value.slice(0, 5)
})

const recommendedUsers = [
  {
    name: 'sneaker_master',
    category: '스니커즈 컬렉터',
    followers: 12340,
    image: 'https://i.pravatar.cc/150?img=33'
  },
  {
    name: 'tech_reviewer',
    category: '테크 리뷰어',
    followers: 8900,
    image: 'https://i.pravatar.cc/150?img=68'
  },
  {
    name: 'beauty_expert',
    category: '뷰티 인플루언서',
    followers: 5670,
    image: 'https://i.pravatar.cc/150?img=45'
  }
]

const loadHotHashtags = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await getHotHashtags(
        {},
        {
          page: 0,
          size: 10,
          sort: 'usageCount,DESC'
        }
    )

    if (response.success) {
      hotHashtags.value = response.data.content || response.data
      console.log('✅ 인기 해시태그 로드 완료:', hotHashtags.value)
    } else {
      throw new Error(response.message || '데이터 로드 실패')
    }
  } catch (err) {
    console.error('❌ 해시태그 로드 실패:', err)
    error.value = err.message || '데이터 로드 실패'
  } finally {
    loading.value = false
  }
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const onHashtagClick = (hashtag) => {
  console.log('해시태그 클릭:', hashtag)
  router.push({
    name: 'FeedSearch',
    query: { hashtag: hashtag }
  })
}

const formatHashtag = (tag) => {
  return feedUtils.formatHashtag(tag)
}

const formatUsageCount = (count) => {
  return feedUtils.formatUsageCount(count)
}

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

onMounted(() => {
  loadHotHashtags()
})
</script>

<style scoped>
.sidebar-right {
  position: fixed;
  right: 0;
  top: 0;
  width: 320px;
  height: 100vh;
  background: #ffffff;
  border-left: 1px solid #f0f0f0;
  overflow-y: auto;
  display: none;
}

@media (min-width: 1280px) {
  .sidebar-right {
    display: block;
  }
}

.sidebar-section {
  padding: 24px 20px;
  border-bottom: 1px solid #f0f0f0;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.sidebar-title {
  font-size: 13px;
  font-weight: 600;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.btn-expand {
  width: 24px;
  height: 24px;
  background: transparent;
  color: #999;
  border: none;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-family: inherit;
}

.btn-expand:hover {
  color: #9333ea;
}

/* State Wrapper */
.state-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f0f0f0;
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-text {
  font-size: 13px;
  color: #999;
}

.empty-text {
  font-size: 13px;
  color: #999;
}

.btn-retry {
  padding: 8px 16px;
  background: #9333ea;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  font-family: inherit;
}

.btn-retry:hover {
  opacity: 0.8;
}

/* Trending List */
.trending-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trending-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  cursor: pointer;
  transition: background 0.15s;
  border-radius: 4px;
}

.trending-item:hover {
  background: #fafafa;
}

.rank {
  font-size: 14px;
  font-weight: 600;
  color: #999;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.trending-item:nth-child(1) .rank {
  color: #9333ea;
  font-weight: 700;
}

.trending-item:nth-child(2) .rank,
.trending-item:nth-child(3) .rank {
  color: #666;
}

.content {
  flex: 1;
  min-width: 0;
}

.tag {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count {
  font-size: 12px;
  color: #999;
  font-variant-numeric: tabular-nums;
}

/* Transition Animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.list-move {
  transition: transform 0.3s ease;
}

/* Recommended */
.recommended-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommended-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desc {
  font-size: 12px;
  color: #999;
  font-variant-numeric: tabular-nums;
}

.btn-follow {
  padding: 6px 16px;
  background: #9333ea;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
  font-family: inherit;
}

.btn-follow:hover {
  opacity: 0.8;
}

/* Footer */
.sidebar-footer {
  padding: 24px 20px;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.footer-links a {
  font-size: 11px;
  color: #999;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #9333ea;
}

.copyright {
  font-size: 11px;
  color: #ccc;
}

/* Scrollbar */
.sidebar-right::-webkit-scrollbar {
  width: 4px;
}

.sidebar-right::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-right::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 2px;
}

.sidebar-right::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>