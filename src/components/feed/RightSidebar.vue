<template>
  <aside class="sidebar-right">
    <!-- Trending -->
    <section class="sidebar-section">
      <div class="section-header">
        <h3 class="sidebar-title">🔥 실시간 트렌딩</h3>
        <button
            v-if="hotHashtags.length > 5 && !isExpanded"
            @click="toggleExpand"
            class="btn-expand"
        >
          +{{ Math.min(hotHashtags.length, 10) - 5 }}
        </button>
        <button
            v-if="isExpanded && hotHashtags.length > 5"
            @click="toggleExpand"
            class="btn-expand"
        >
          접기
        </button>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="trending-loading">
        <div class="loading-spinner"></div>
        <p>트렌딩 해시태그 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="trending-error">
        <p>❌ {{ error }}</p>
        <button @click="loadHotHashtags" class="btn-retry">다시 시도</button>
      </div>

      <!-- 해시태그 목록 -->
      <div v-else class="trending-list">
        <transition-group name="fade-slide" tag="div" class="trending-items">
          <div
              v-for="(hashtag, idx) in displayedHashtags"
              :key="hashtag.id"
              class="trending-item"
              @click="onHashtagClick(hashtag.name)"
              :style="{ transitionDelay: `${idx * 30}ms` }"
          >
            <span class="trend-rank" :class="getRankClass(idx)">
              {{ idx + 1 }}
            </span>
            <div class="trend-info">
              <p class="trend-tag">{{ formatHashtag(hashtag.name) }}</p>
              <p class="trend-count">{{ formatUsageCount(hashtag.usageCount) }}</p>
            </div>
            <span v-if="idx < 3" class="trend-badge">HOT</span>
          </div>
        </transition-group>

        <!-- 데이터가 없을 때 -->
        <div v-if="hotHashtags.length === 0" class="trending-empty">
          <p>아직 트렌딩 해시태그가 없습니다</p>
        </div>
      </div>
    </section>

    <!-- Recommended -->
    <section class="sidebar-section">
      <h3 class="sidebar-title">👥 추천 크리에이터</h3>
      <div class="recommended-list">
        <div v-for="user in recommendedUsers" :key="user.name" class="recommended-item">
          <img :src="user.image" :alt="user.name" class="recommended-avatar" />
          <div class="recommended-info">
            <p class="recommended-name">{{ user.name }}</p>
            <p class="recommended-desc">{{ user.category }} · {{ formatNumber(user.followers) }} 팔로워</p>
          </div>
          <button class="btn-follow">팔로우</button>
        </div>
      </div>
    </section>

    <!-- Ad Space -->
    <section class="sidebar-section ad-section">
      <div class="ad-content">
        <p class="ad-title">프리미엄 멤버십</p>
        <p class="ad-desc">광고 없이 더 많은 혜택을 누려보세요</p>
        <button class="btn-ad">자세히 보기</button>
      </div>
    </section>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="footer-links">
        <a href="#">서비스 소개</a>
        <a href="#">이용약관</a>
        <a href="#">개인정보처리방침</a>
        <a href="#">고객센터</a>
      </div>
      <p class="copyright">© 2025 HYPE BATTLE Inc.</p>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFeed, feedUtils } from '@/services/FeedService'

const router = useRouter()
const { getHotHashtags } = useFeed()

// 상태 관리
const hotHashtags = ref([])
const loading = ref(false)
const error = ref(null)
const isExpanded = ref(false)

// 표시할 해시태그 계산 (최대 10위까지)
const displayedHashtags = computed(() => {
  const maxCount = Math.min(hotHashtags.value.length, 10)
  return isExpanded.value ? hotHashtags.value.slice(0, maxCount) : hotHashtags.value.slice(0, 5)
})

// 추천 크리에이터
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

/**
 * 인기 해시태그 조회
 */
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
      throw new Error(response.message || '해시태그를 불러오는데 실패했습니다.')
    }
  } catch (err) {
    console.error('❌ 해시태그 로드 실패:', err)
    error.value = err.message || '해시태그를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

/**
 * 확장/축소 토글
 */
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

/**
 * 해시태그 클릭 핸들러
 */
const onHashtagClick = (hashtag) => {
  console.log('해시태그 클릭:', hashtag)
  router.push({
    name: 'FeedSearch',
    query: { hashtag: hashtag }
  })
}

/**
 * 해시태그 포맷팅
 */
const formatHashtag = (tag) => {
  return feedUtils.formatHashtag(tag)
}

/**
 * 사용 횟수 포맷팅
 */
const formatUsageCount = (count) => {
  return feedUtils.formatUsageCount(count)
}

/**
 * 숫자 포맷팅
 */
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * 순위별 스타일 클래스
 */
const getRankClass = (index) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return ''
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadHotHashtags()
})
</script>

<style scoped>
.sidebar-right {
  position: fixed;
  right: 0;
  top: 0;
  width: 380px;
  height: 100vh;
  background: var(--card);
  border-left: 1px solid var(--border);
  padding: 24px;
  overflow-y: auto;
  display: none;
}

@media (min-width: 1280px) {
  .sidebar-right {
    display: block;
  }
}

.sidebar-section {
  margin-bottom: 32px;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
}

.btn-expand {
  padding: 6px 12px;
  background: var(--hover);
  color: var(--accent);
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-expand:hover {
  background: var(--accent);
  color: white;
  transform: scale(1.05);
}

/* Loading State */
.trending-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.trending-loading p {
  font-size: 13px;
  color: var(--secondary);
}

/* Error State */
.trending-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  gap: 12px;
}

.trending-error p {
  font-size: 14px;
  color: #EF4444;
  text-align: center;
}

.btn-retry {
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-retry:hover {
  background: #1E293B;
}

/* Empty State */
.trending-empty {
  padding: 32px;
  text-align: center;
}

.trending-empty p {
  font-size: 14px;
  color: var(--secondary);
}

/* Trending List */
.trending-list {
  display: flex;
  flex-direction: column;
}

.trending-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trending-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.trending-item:hover {
  background: var(--hover);
  transform: translateX(4px);
}

.trend-rank {
  font-size: 16px;
  font-weight: 700;
  color: var(--secondary);
  width: 32px;
  text-align: center;
  flex-shrink: 0;
}

.trend-rank.rank-gold {
  color: #F59E0B;
  font-size: 18px;
}

.trend-rank.rank-silver {
  color: #9CA3AF;
  font-size: 17px;
}

.trend-rank.rank-bronze {
  color: #CD7F32;
  font-size: 17px;
}

.trend-info {
  flex: 1;
  min-width: 0;
}

.trend-tag {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trend-count {
  font-size: 13px;
  color: var(--secondary);
}

.trend-badge {
  padding: 4px 8px;
  background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 6px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

/* Transition Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

.recommended-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid var(--border);
}

.recommended-info {
  flex: 1;
  min-width: 0;
}

.recommended-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommended-desc {
  font-size: 12px;
  color: var(--secondary);
}

.btn-follow {
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  flex-shrink: 0;
}

.btn-follow:hover {
  background: #1E293B;
  transform: translateY(-1px);
}

/* Ad Section */
.ad-section {
  padding: 20px;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
  border-radius: 16px;
  border: 1px solid #FED7AA;
}

.ad-content {
  text-align: center;
}

.ad-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 8px;
}

.ad-desc {
  font-size: 13px;
  color: var(--secondary);
  margin-bottom: 16px;
}

.btn-ad {
  padding: 10px 20px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-ad:hover {
  background: #EA580C;
  transform: translateY(-1px);
}

/* Sidebar Footer */
.sidebar-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.footer-links a {
  font-size: 12px;
  color: var(--secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--primary);
  text-decoration: underline;
}

.copyright {
  font-size: 12px;
  color: var(--secondary);
}

/* 스크롤바 스타일링 */
.sidebar-right::-webkit-scrollbar {
  width: 6px;
}

.sidebar-right::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-right::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.sidebar-right::-webkit-scrollbar-thumb:hover {
  background: var(--secondary);
}
</style>