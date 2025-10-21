<template>
  <div class="app-container">
    <!-- Left Sidebar - Desktop Only -->
    <aside class="sidebar-left">
      <div class="sidebar-header">
        <h1 class="logo">HYPE BATTLE</h1>
        <span class="logo-beta">BETA</span>
      </div>

      <nav class="nav-menu">
        <button class="nav-item active">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          <span>홈</span>
        </button>
        <button class="nav-item">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.5 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-5-2a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
          </svg>
          <span>배틀</span>
          <span class="badge">12</span>
        </button>
        <button class="nav-item">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
          </svg>
          <span>메시지</span>
          <span class="badge badge-red">3</span>
        </button>
        <button class="nav-item">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/>
          </svg>
          <span>컬렉션</span>
        </button>
        <button class="nav-item">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
          </svg>
          <span>프로필</span>
        </button>
      </nav>

      <button class="btn-create">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <span>인증 올리기</span>
      </button>

      <div class="level-card">
        <div class="level-info">
          <div class="level-badge">
            <span class="level-emoji">🔥</span>
            <span class="level-text">마니아 Lv.8</span>
          </div>
          <p class="level-desc">다음 레벨까지</p>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 73%"></div>
        </div>
        <p class="progress-text">73% <span>·</span> 270 / 370 포인트</p>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Header -->
      <header class="header">
        <div class="header-container">
          <div class="header-left">
            <h1 class="mobile-logo">HYPE BATTLE</h1>
            <div class="search-box">
              <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" placeholder="브랜드, 제품, 사람 검색..." v-model="searchQuery" />
            </div>
          </div>

          <div class="header-right">
            <button class="icon-btn">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span class="notification-dot"></span>
            </button>
            <div class="user-avatar">
              <img src="https://i.pravatar.cc/150?img=12" alt="User" />
            </div>
          </div>
        </div>
      </header>

      <!-- Category & View Controls -->
      <div class="controls-section">
        <div class="category-tabs">
          <button
              v-for="tab in Object.keys(categories)"
              :key="tab"
              @click="handleTabClick(tab)"
              :class="['category-tab', { active: activeTab === tab }]"
          >
            {{ tab }}
            <svg v-if="categories[tab].length > 0" class="chevron" :class="{ rotated: showCategoryDropdown === tab }" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.293 5.293a1 1 0 011.414 0L8 7.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>

        <!-- View Toggle - Desktop Only -->
        <div class="view-toggle">
          <button
              @click="viewMode = 'feed'"
              :class="['view-btn', { active: viewMode === 'feed' }]"
              title="피드 뷰"
          >
            <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            <span>피드</span>
          </button>
          <button
              @click="viewMode = 'list'"
              :class="['view-btn', { active: viewMode === 'list' }]"
              title="리스트 뷰"
          >
            <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
            </svg>
            <span>리스트</span>
          </button>
        </div>
      </div>

      <!-- Sub-category -->
      <div v-if="showCategoryDropdown && categories[showCategoryDropdown]?.length > 0" class="sub-category-section">
        <button
            @click="activeSubCategory = null"
            :class="['sub-tab', { active: activeSubCategory === null }]"
        >
          전체
        </button>
        <button
            v-for="sub in categories[showCategoryDropdown]"
            :key="sub"
            @click="activeSubCategory = sub"
            :class="['sub-tab', { active: activeSubCategory === sub }]"
        >
          {{ sub }}
        </button>
      </div>

      <!-- HOT Section -->
      <section class="hot-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">🔥</span>
            지금 가장 핫한 인증
          </h2>
          <button class="see-all">
            전체보기
            <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
            </svg>
          </button>
        </div>
        <div class="hot-grid">
          <div v-for="post in mockPosts.slice(0, 5)" :key="post.id" class="hot-card" @click="openPost(post.id)">
            <div class="hot-image">
              <img :src="post.images[0]" :alt="post.product" />
              <div class="hot-overlay">
                <div class="hot-stats">
                  <span class="stat-item">
                    <span class="fire">🔥</span>
                    {{ post.reactions.fire }}
                  </span>
                  <span class="stat-item">
                    <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    {{ formatNumber(post.reactions.views) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="hot-info">
              <p class="hot-product">{{ post.product }}</p>
              <p class="hot-author">{{ post.author.name }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Feed Section -->
      <section class="feed-section">
        <div class="section-header">
          <h2 class="section-title">최신 인증</h2>
          <select class="sort-select" v-model="sortOption">
            <option value="latest">최신순</option>
            <option value="popular">인기순</option>
            <option value="discussed">댓글 많은순</option>
          </select>
        </div>

        <!-- Feed View -->
        <div v-if="viewMode === 'feed'" class="feed-grid">
          <article v-for="post in mockPosts" :key="post.id" class="post-card">
            <div class="post-header">
              <div class="post-author-info">
                <div class="author-avatar-small">{{ post.author.avatar }}</div>
                <div class="author-details">
                  <div class="author-name-row">
                    <span class="author-name">{{ post.author.name }}</span>
                    <span class="author-level">{{ post.author.level }}</span>
                  </div>
                  <div class="post-meta">
                    <span>{{ post.time }}</span>
                    <span class="meta-dot">·</span>
                    <span class="post-category-badge">{{ post.subCategory }}</span>
                  </div>
                </div>
              </div>
              <button class="btn-more">
                <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
              </button>
            </div>

            <div class="post-image-container" @dblclick="handleLike(post.id)">
              <img :src="post.images[0]" :alt="post.product" class="post-image" />
              <div v-if="likedPosts.has(post.id)" class="like-animation">
                <svg class="heart-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                </svg>
              </div>
            </div>

            <div class="post-content">
              <div class="post-actions">
                <div class="action-left">
                  <button @click="handleLike(post.id)" :class="['action-btn', { liked: likedPosts.has(post.id) }]">
                    <span class="fire">🔥</span>
                    <span>{{ post.reactions.fire + (likedPosts.has(post.id) ? 1 : 0) }}</span>
                  </button>
                  <button class="action-btn">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    <span>{{ post.reactions.like }}</span>
                  </button>
                  <button @click="handleComment(post.id)" class="action-btn">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    <span>{{ post.reactions.comments }}</span>
                  </button>
                </div>
                <button @click="handleSave(post.id)" :class="['action-btn save', { saved: savedPosts.has(post.id) }]">
                  <svg class="icon" :fill="savedPosts.has(post.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                </button>
              </div>

              <div class="post-info">
                <h3 class="post-title">{{ post.product }}</h3>
                <div class="post-details">
                  <span class="store">{{ post.store }}</span>
                  <span class="price">{{ post.price }}</span>
                  <span :class="['status', post.status === '품절' ? 'soldout' : 'available']">
                    {{ post.status }}
                  </span>
                </div>
                <p class="post-review">{{ post.review }}</p>
                <div class="post-hashtags">
                  <span v-for="tag in post.hashtags" :key="tag" class="hashtag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- List View -->
        <div v-else class="list-view">
          <article v-for="post in mockPosts" :key="post.id" class="list-item">
            <div class="list-image" @click="openPost(post.id)">
              <img :src="post.images[0]" :alt="post.product" />
            </div>
            <div class="list-content">
              <div class="list-header">
                <div class="list-author-info">
                  <div class="author-avatar-small">{{ post.author.avatar }}</div>
                  <div>
                    <div class="author-name-row">
                      <span class="author-name">{{ post.author.name }}</span>
                      <span class="author-level">{{ post.author.level }}</span>
                      <span class="list-category">{{ post.subCategory }}</span>
                    </div>
                    <span class="list-time">{{ post.time }}</span>
                  </div>
                </div>
                <button class="btn-more">
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                  </svg>
                </button>
              </div>
              <div class="list-main" @click="openPost(post.id)">
                <h3 class="list-title">{{ post.product }}</h3>
                <p class="list-review">{{ post.review }}</p>
                <div class="list-details">
                  <span class="store">{{ post.store }}</span>
                  <span class="price">{{ post.price }}</span>
                  <span :class="['status', post.status === '품절' ? 'soldout' : 'available']">
                    {{ post.status }}
                  </span>
                </div>
                <div class="list-hashtags">
                  <span v-for="tag in post.hashtags.slice(0, 3)" :key="tag" class="hashtag">{{ tag }}</span>
                </div>
              </div>
              <div class="list-actions">
                <button @click="handleLike(post.id)" :class="['action-btn', { liked: likedPosts.has(post.id) }]">
                  <span class="fire">🔥</span>
                  <span>{{ post.reactions.fire + (likedPosts.has(post.id) ? 1 : 0) }}</span>
                </button>
                <button class="action-btn">
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  <span>{{ post.reactions.like }}</span>
                </button>
                <button @click="handleComment(post.id)" class="action-btn">
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <span>{{ post.reactions.comments }}</span>
                </button>
                <button @click="handleSave(post.id)" :class="['action-btn save', { saved: savedPosts.has(post.id) }]">
                  <svg class="icon" :fill="savedPosts.has(post.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- Right Sidebar - Desktop Only -->
    <aside class="sidebar-right">
      <!-- Trending -->
      <section class="sidebar-section">
        <h3 class="sidebar-title">🔥 실시간 트렌딩</h3>
        <div class="trending-list">
          <div v-for="(tag, idx) in trendingTags" :key="tag" class="trending-item">
            <span class="trend-rank">#{{ idx + 1 }}</span>
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

    <!-- Comments Modal -->
    <Teleport to="body">
      <div v-if="showComments" class="modal-overlay" @click="showComments = null">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">댓글 {{ currentPost?.reactions.comments || 0 }}개</h3>
            <button @click="showComments = null" class="modal-close">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div v-for="i in 8" :key="i" class="comment">
              <img :src="`https://i.pravatar.cc/150?img=${i}`" alt="User" class="comment-avatar" />
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-user">user_{{ i }}</span>
                  <span class="comment-level">{{ ['🔥', '🎨', '💪'][i % 3] }}</span>
                  <span class="comment-time">{{ i * 5 }}분 전</span>
                </div>
                <p class="comment-text">정말 멋진 제품이네요! 저도 구매하고 싶어요. 어디서 구매하셨나요?</p>
                <div class="comment-actions">
                  <button class="comment-action-btn">답글</button>
                  <button class="comment-action-btn">
                    <span>🔥</span>
                    <span>{{ Math.floor(Math.random() * 20) }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <img src="https://i.pravatar.cc/150?img=12" alt="User" class="comment-input-avatar" />
            <input type="text" placeholder="댓글을 입력하세요..." class="comment-input" v-model="commentText" @keyup.enter="submitComment" />
            <button class="btn-submit" @click="submitComment">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Bottom Navigation - Mobile Only -->
    <nav class="bottom-nav">
      <button class="bottom-nav-item active">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
        <span>홈</span>
      </button>
      <button class="bottom-nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/>
        </svg>
        <span>배틀</span>
      </button>
      <button class="bottom-nav-fab">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
        </svg>
      </button>
      <button class="bottom-nav-item">
        <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
        </svg>
        <span>메시지</span>
        <span class="nav-badge">3</span>
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
import { ref, computed } from 'vue';

// State
const activeTab = ref('추천');
const activeSubCategory = ref(null);
const likedPosts = ref(new Set());
const savedPosts = ref(new Set());
const showComments = ref(null);
const showCategoryDropdown = ref(false);
const commentText = ref('');
const searchQuery = ref('');
const sortOption = ref('latest');
const viewMode = ref('feed'); // 'feed' or 'list'

// Data
const categories = {
  '팔로잉': [],
  '추천': [],
  '스니커즈': ['러닝화', '농구화', '라이프스타일', '하이탑', '로우탑'],
  '테크': ['스마트폰', '태블릿', '이어폰/헤드폰', '노트북', '웨어러블'],
  '뷰티': ['스킨케어', '메이크업', '향수', '헤어케어', '네일'],
  'F&B': ['커피', '베이커리', '레스토랑', '주류', '디저트'],
  '패션': ['아우터', '상의', '하의', '신발', '액세서리'],
  '라이프': ['홈데코', '가전', '반려동물', '피트니스', '여행'],
  '전체': []
};

const mockPosts = [
  {
    id: 1,
    author: { name: 'sneaker_king', avatar: '👟', level: '🔥', levelName: '마니아' },
    category: '스니커즈',
    subCategory: '농구화',
    time: '3분 전',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    product: '조던 4 레트로 브레드',
    store: '무신사',
    price: '₩230,000',
    status: '품절',
    review: '드디어 손에 넣었습니다! 실물이 사진보다 훨씬 예뻐요. 퀄리티가 정말 좋고 발에 딱 맞아요.',
    hashtags: ['#조던4', '#스니커즈', '#레트로'],
    reactions: { fire: 234, like: 89, comments: 23, views: 1200 }
  },
  {
    id: 2,
    author: { name: 'tech_guru', avatar: '💻', level: '🎨', levelName: '컬렉터' },
    category: '테크',
    subCategory: '이어폰/헤드폰',
    time: '1시간 전',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
    product: '에어팟 맥스',
    store: '애플 공식',
    price: '₩760,000',
    status: '구매 가능',
    review: '노캔 성능이 정말 대단합니다. 음질도 훌륭하고 착용감도 좋아요.',
    hashtags: ['#에어팟맥스', '#애플'],
    reactions: { fire: 189, like: 67, comments: 15, views: 890 }
  },
  {
    id: 3,
    author: { name: 'beauty_queen', avatar: '💄', level: '💪', levelName: '레귤러' },
    category: '뷰티',
    subCategory: '메이크업',
    time: '어제',
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800'],
    product: '디올 립글로우',
    store: '올리브영',
    price: '₩48,000',
    status: '세일중',
    review: '자연스러운 발색이 너무 예쁘고 촉촉해요!',
    hashtags: ['#디올', '#립글로우', '#뷰티'],
    reactions: { fire: 156, like: 45, comments: 19, views: 670 }
  },
  {
    id: 4,
    author: { name: 'fashion_icon', avatar: '👔', level: '🎨', levelName: '컬렉터' },
    category: '패션',
    subCategory: '아우터',
    time: '3시간 전',
    images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800'],
    product: '아미 로고 후드티',
    store: 'SSENSE',
    price: '₩320,000',
    status: '구매 가능',
    review: '심플하면서도 세련된 디자인! 핏이 정말 예쁩니다.',
    hashtags: ['#아미', '#후드티'],
    reactions: { fire: 142, like: 58, comments: 11, views: 520 }
  },
  {
    id: 5,
    author: { name: 'coffee_lover', avatar: '☕', level: '💪', levelName: '레귤러' },
    category: 'F&B',
    subCategory: '커피',
    time: '5시간 전',
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800'],
    product: '블루보틀 커피 원두',
    store: '블루보틀',
    price: '₩18,000',
    status: '구매 가능',
    review: '산미가 적당하고 부드러운 맛! 아침에 마시기 좋아요.',
    hashtags: ['#블루보틀', '#커피'],
    reactions: { fire: 98, like: 34, comments: 8, views: 450 }
  },
  {
    id: 6,
    author: { name: 'runner_pro', avatar: '🏃', level: '🔥', levelName: '마니아' },
    category: '스니커즈',
    subCategory: '러닝화',
    time: '6시간 전',
    images: ['https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=800'],
    product: '나이키 알파플라이 3',
    store: '나이키 공식',
    price: '₩359,000',
    status: '구매 가능',
    review: '카본 플레이트의 반발력이 정말 좋습니다!',
    hashtags: ['#나이키', '#러닝화'],
    reactions: { fire: 178, like: 52, comments: 14, views: 720 }
  }
];

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

// Computed
const currentPost = computed(() => {
  return mockPosts.find(post => post.id === showComments.value);
});

// Methods
const handleTabClick = (tab) => {
  activeTab.value = tab;
  activeSubCategory.value = null;
  if (categories[tab].length > 0) {
    showCategoryDropdown.value = tab;
  } else {
    showCategoryDropdown.value = null;
  }
};

const handleLike = (postId) => {
  const newSet = new Set(likedPosts.value);
  if (newSet.has(postId)) {
    newSet.delete(postId);
  } else {
    newSet.add(postId);
  }
  likedPosts.value = newSet;
};

const handleSave = (postId) => {
  const newSet = new Set(savedPosts.value);
  if (newSet.has(postId)) {
    newSet.delete(postId);
  } else {
    newSet.add(postId);
  }
  savedPosts.value = newSet;
};

const handleComment = (postId) => {
  showComments.value = postId;
};

const openPost = (postId) => {
  console.log('Open post:', postId);
  // Navigate to detail page
};

const submitComment = () => {
  if (commentText.value.trim()) {
    console.log('Submit comment:', commentText.value);
    commentText.value = '';
  }
};

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --primary: #0F172A;
  --secondary: #64748B;
  --accent: #F97316;
  --border: #E2E8F0;
  --bg: #F8FAFC;
  --card: #FFFFFF;
  --hover: #F1F5F9;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  background: var(--bg);
  min-height: 100vh;
  color: var(--primary);
}

/* Sidebar Left */
.sidebar-left {
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: var(--card);
  border-right: 1px solid var(--border);
  padding: 24px;
  display: none;
  flex-direction: column;
  overflow-y: auto;
}

@media (min-width: 1024px) {
  .sidebar-left {
    display: flex;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 40px;
}

.logo {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--primary);
}

.logo-beta {
  padding: 2px 6px;
  background: var(--accent);
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 24px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  position: relative;
}

.nav-item:hover {
  background: var(--hover);
  color: var(--primary);
}

.nav-item.active {
  background: var(--primary);
  color: white;
  font-weight: 600;
}

.nav-item .icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.nav-item .badge {
  margin-left: auto;
  padding: 2px 8px;
  background: var(--hover);
  color: var(--secondary);
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
}

.nav-item.active .badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.badge-red {
  background: #FEE2E2 !important;
  color: #DC2626 !important;
}

.nav-item.active .badge-red {
  background: #DC2626 !important;
  color: white !important;
}

.btn-create {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  margin-bottom: 24px;
}

.btn-create:hover {
  background: #EA580C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.btn-create .icon {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

.level-card {
  margin-top: auto;
  padding: 20px;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
  border-radius: 16px;
  border: 1px solid #FED7AA;
}

.level-info {
  margin-bottom: 12px;
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.level-emoji {
  font-size: 20px;
}

.level-text {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary);
}

.level-desc {
  font-size: 13px;
  color: var(--secondary);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--secondary);
}

.progress-text span {
  margin: 0 4px;
}

/* Main Content */
.main-content {
  margin-left: 0;
  margin-right: 0;
  min-height: 100vh;
  padding-bottom: 80px;
}

@media (min-width: 1024px) {
  .main-content {
    margin-left: 280px;
    padding-bottom: 40px;
  }
}

@media (min-width: 1280px) {
  .main-content {
    margin-right: 380px;
  }
}

/* Header */
.header {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  max-width: 100%;
}

@media (min-width: 1024px) {
  .header-container {
    padding: 20px 32px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.mobile-logo {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--primary);
}

@media (min-width: 1024px) {
  .mobile-logo {
    display: none;
  }
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 480px;
  display: none;
}

@media (min-width: 768px) {
  .search-box {
    display: block;
  }
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--secondary);
  stroke-width: 2;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--primary);
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary);
  background: white;
}

.search-box input::placeholder {
  color: var(--secondary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  position: relative;
  padding: 10px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: var(--hover);
}

.icon-btn .icon {
  width: 22px;
  height: 22px;
  color: var(--secondary);
  stroke-width: 2;
}

.notification-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #DC2626;
  border: 2px solid white;
  border-radius: 999px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid var(--border);
  transition: all 0.2s;
}

.user-avatar:hover {
  border-color: var(--primary);
  transform: scale(1.05);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
    padding: 24px 32px 0;
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
    padding: 16px 32px 20px;
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

/* HOT Section */
.hot-section {
  padding: 32px 20px;
  background: var(--card);
}

@media (min-width: 1024px) {
  .hot-section {
    padding: 40px 32px;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (min-width: 1024px) {
  .section-title {
    font-size: 24px;
  }
}

.title-icon {
  font-size: 24px;
}

@media (min-width: 1024px) {
  .title-icon {
    font-size: 28px;
  }
}

.see-all {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
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

.see-all:hover {
  background: var(--hover);
  color: var(--primary);
}

.see-all .icon {
  width: 16px;
  height: 16px;
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .hot-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .hot-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
  }
}

.hot-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.hot-card:hover {
  transform: translateY(-4px);
}

.hot-image {
  position: relative;
  width: 100%;
  padding-bottom: 120%;
  background: var(--hover);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
}

.hot-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.hot-card:hover .hot-image img {
  transform: scale(1.05);
}

.hot-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.hot-card:hover .hot-overlay {
  opacity: 1;
}

.hot-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 13px;
  font-weight: 600;
}

.stat-item .fire {
  font-size: 16px;
}

.stat-item .icon {
  width: 16px;
  height: 16px;
}

.hot-info {
  padding: 0 4px;
}

.hot-product {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-author {
  font-size: 13px;
  color: var(--secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Feed Section */
.feed-section {
  padding: 32px 20px;
}

@media (min-width: 1024px) {
  .feed-section {
    padding: 40px 32px;
  }
}

.sort-select {
  padding: 8px 32px 8px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 5L6 8L9 5' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  font-family: inherit;
  transition: all 0.2s;
}

.sort-select:hover {
  border-color: var(--primary);
}

.sort-select:focus {
  outline: none;
  border-color: var(--primary);
}

/* Feed Grid */
.feed-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .feed-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (min-width: 1280px) {
  .feed-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.post-card {
  background: var(--card);
  border-radius: 20px;
  border: 1px solid var(--border);
  overflow: hidden;
  transition: all 0.3s;
}

.post-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.post-author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}

.author-level {
  font-size: 14px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--secondary);
}

.meta-dot {
  color: var(--border);
}

.post-category-badge {
  padding: 2px 8px;
  background: #EFF6FF;
  color: #1D4ED8;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.btn-more {
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-more:hover {
  background: var(--hover);
}

.btn-more .icon {
  width: 18px;
  height: 18px;
  color: var(--secondary);
}

.post-image-container {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.post-image {
  width: 100%;
  height: 320px;
  object-fit: cover;
  display: block;
}

@media (min-width: 1024px) {
  .post-image {
    height: 280px;
  }
}

.like-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: likeZoom 0.6s ease-out;
  pointer-events: none;
}

.heart-icon {
  width: 80px;
  height: 80px;
  color: white;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

@keyframes likeZoom {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

.post-content {
  padding: 16px;
}

.post-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.action-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
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

.action-btn:hover {
  background: var(--hover);
  color: var(--primary);
}

.action-btn.liked {
  color: var(--accent);
}

.action-btn .fire {
  font-size: 18px;
}

.action-btn .icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.action-btn.save {
  margin-left: auto;
}

.action-btn.saved {
  color: #1D4ED8;
}

.post-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.post-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.4;
}

.post-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
}

.store {
  color: var(--secondary);
}

.price {
  font-weight: 700;
  color: var(--primary);
}

.status {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.status.soldout {
  background: #FEE2E2;
  color: #DC2626;
}

.status.available {
  background: #D1FAE5;
  color: #059669;
}

.post-review {
  font-size: 14px;
  color: var(--secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.hashtag {
  font-size: 13px;
  color: #1D4ED8;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.hashtag:hover {
  color: #1E40AF;
  text-decoration: underline;
}

/* List View */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-item {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  gap: 20px;
  transition: all 0.3s;
}

.list-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.list-image {
  width: 180px;
  height: 180px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  background: var(--hover);
}

.list-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.list-item:hover .list-image img {
  transform: scale(1.05);
}

.list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.list-category {
  padding: 2px 8px;
  background: #EFF6FF;
  color: #1D4ED8;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.list-time {
  font-size: 12px;
  color: var(--secondary);
}

.list-main {
  flex: 1;
  cursor: pointer;
}

.list-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.list-review {
  font-size: 14px;
  color: var(--secondary);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.list-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
  margin-bottom: 8px;
}

.list-hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.list-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

/* Sidebar Right */
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: var(--card);
  border-radius: 24px;
  width: 100%;
  max-width: 640px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
}

.modal-close {
  padding: 8px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-close:hover {
  background: var(--hover);
}

.modal-close .icon {
  width: 24px;
  height: 24px;
  color: var(--secondary);
  stroke-width: 2;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.comment {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.comment:last-child {
  margin-bottom: 0;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.comment-user {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}

.comment-level {
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: var(--secondary);
}

.comment-text {
  font-size: 14px;
  color: var(--primary);
  line-height: 1.6;
  margin-bottom: 8px;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.comment-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.comment-action-btn:hover {
  background: var(--hover);
  color: var(--primary);
}

.modal-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border);
}

.comment-input-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-input {
  flex: 1;
  padding: 12px 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--primary);
  transition: all 0.2s;
}

.comment-input:focus {
  outline: none;
  border-color: var(--primary);
  background: white;
}

.comment-input::placeholder {
  color: var(--secondary);
}

.btn-submit {
  padding: 12px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-submit:hover {
  background: #EA580C;
  transform: scale(1.05);
}

.btn-submit .icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
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
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
}

@media (min-width: 1024px) {
  .bottom-nav {
    display: none;
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

.bottom-nav-item span {
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
  background: #DC2626;
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
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.4);
  margin-top: -28px;
  transition: all 0.2s;
}

.bottom-nav-fab:active {
  transform: scale(0.95);
}

.bottom-nav-fab .icon {
  width: 28px;
  height: 28px;
  stroke-width: 2.5;
}

/* Mobile Responsive */
@media (max-width: 767px) {
  .hot-grid {
    gap: 12px;
  }

  .hot-image {
    padding-bottom: 130%;
  }

  .feed-section {
    padding: 24px 16px;
  }

  .post-card {
    border-radius: 16px;
  }

  .list-view {
    gap: 16px;
  }

  .list-item {
    flex-direction: column;
    padding: 16px;
  }

  .list-image {
    width: 100%;
    height: 200px;
  }
}