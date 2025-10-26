<template>
  <aside class="sidebar-right">
    <!-- Trending -->
    <section class="sidebar-section">
      <h3 class="sidebar-title">🔥 실시간 트렌딩</h3>
      <div class="trending-list">
        <div v-for="(tag, idx) in trendingTags" :key="tag" class="trending-item">
          <span class="trend-rank">{{ idx + 1 }}</span>
          <div class="trend-info">
            <p class="trend-tag">{{ tag }}</p>
            <p class="trend-count">{{ Math.floor(Math.random() * 500) + 100 }}개 인증</p>
          </div>
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
const trendingTags = ['#조던4', '#에어팟맥스', '#디올립글로우', '#아미', '#스니커즈'];

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
];

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
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

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 16px;
}

/* Trending */
.trending-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trending-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.trending-item:hover {
  background: var(--hover);
}

.trend-rank {
  font-size: 16px;
  font-weight: 700;
  color: var(--secondary);
  width: 32px;
  text-align: center;
}

.trend-info {
  flex: 1;
}

.trend-tag {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 2px;
}

.trend-count {
  font-size: 13px;
  color: var(--secondary);
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
}

.recommended-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 2px;
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
</style>