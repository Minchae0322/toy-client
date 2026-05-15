<template>
  <section class="trending-memes-section">
    <div class="section-header">
      <h2 class="section-title">
        <TrendingUp class="section-title-icon" />
        지금 핫한 밈/짤
      </h2>
      <button class="view-more-button">더보기</button>
    </div>

    <div class="memes-grid">
      <div
          v-for="meme in memes"
          :key="meme.id"
          class="meme-card"
      >
        <img
            :src="meme.image"
            :alt="meme.title"
            class="meme-image"
        />
        <div class="meme-info">
          <h3 class="meme-title">{{ meme.title }}</h3>
          <div class="meme-tags-wrapper">
            <span
                v-for="tag in meme.tags"
                :key="tag"
                class="meme-tag"
            >
              {{ tag }}
            </span>
          </div>
          <div class="meme-actions">
            <div class="meme-stats">
              <button
                  @click="$emit('like', meme.id)"
                  class="stat-button"
                  :class="{ 'stat-button-liked': likedItems[meme.id] }"
              >
                <Heart
                    class="stat-icon"
                    :class="{ 'stat-icon-filled-red': likedItems[meme.id] }"
                />
                <span class="stat-text">{{ meme.likes }}</span>
              </button>
              <div class="stat-item">
                <MessageCircle class="stat-icon" />
                <span class="stat-text">{{ meme.comments }}</span>
              </div>
            </div>
            <button class="share-button">
              <Share2 class="stat-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {Heart, MessageCircle, Share2, TrendingUp} from 'lucide-vue-next';

defineProps({
  memes: Array,
  likedItems: Object
});

defineEmits(['like']);
</script>

<style scoped>
.trending-memes-section {
  /* 섹션 전체에 특별한 Tailwind 클래스 없음, 컨테이너 역할 */
  padding: 1rem; /* 필요시 섹션에 패딩 추가 */
}

.section-header {
  /* flex items-center justify-between mb-4 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem; /* mb-4 */
}

.section-title {
  /* text-xl font-bold flex items-center */
  font-size: 1.25rem; /* text-xl */
  font-weight: bold;
  display: flex;
  align-items: center;
  /* 기본 텍스트 색상 */
}

.section-title-icon {
  /* w-5 h-5 mr-2 text-red-500 */
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  margin-right: 0.5rem; /* mr-2 */
  color: #ef4444; /* text-red-500 */
  flex-shrink: 0; /* 아이콘이 찌그러지지 않도록 */
}

.view-more-button {
  /* text-purple-600 text-sm font-medium */
  color: #9333ea; /* text-purple-600 */
  font-size: 0.875rem; /* text-sm */
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0; /* 기본 버튼 패딩 제거 */
}

.memes-grid {
  /* grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 */
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr)); /* grid-cols-1 */
  gap: 1rem; /* gap-4 */
}

/* 반응형 디자인: md (768px 이상) */
@media (min-width: 768px) {
  .memes-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)); /* md:grid-cols-2 */
  }
}

/* 반응형 디자인: lg (1024px 이상) */
@media (min-width: 1024px) {
  .memes-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)); /* lg:grid-cols-3 */
  }
}

.meme-card {
  /* bg-white rounded-xl shadow-sm overflow-hidden */
  background-color: var(--bg-elevated);
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
  overflow: hidden;
}

.meme-image {
  /* w-full h-48 object-cover */
  width: 100%;
  height: 12rem; /* h-48 (48 * 0.25rem = 12rem) */
  object-fit: cover;
}

.meme-info {
  /* p-4 */
  padding: 1rem; /* p-4 */
}

.meme-title {
  /* font-medium mb-2 */
  font-weight: 500;
  margin-bottom: 0.5rem; /* mb-2 */
  /* 기본 텍스트 색상 */
}

.meme-tags-wrapper {
  /* flex flex-wrap gap-1 mb-3 */
  display: flex;
  flex-wrap: wrap; /* flex-wrap */
  gap: 0.25rem; /* gap-1 */
  margin-bottom: 0.75rem; /* mb-3 */
}

.meme-tag {
  /* text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded */
  font-size: 0.75rem; /* text-xs */
  background-color: #f3f4f6; /* bg-gray-100 */
  color: #4b5563; /* text-gray-600 */
  padding: 0.25rem 0.5rem; /* px-2 py-1 */
  border-radius: 0.25rem; /* rounded */
  white-space: nowrap; /* 텍스트가 줄 바꿈되지 않도록 */
}

.meme-actions {
  /* flex items-center justify-between */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meme-stats {
  /* flex items-center space-x-4 */
  display: flex;
  align-items: center;
  gap: 1rem; /* space-x-4 */
}

.stat-button,
.stat-item {
  /* flex items-center space-x-1 */
  display: flex;
  align-items: center;
  gap: 0.25rem; /* space-x-1 */
}

.stat-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: inherit; /* 기본 텍스트 색상 상속 */
  transition: color 150ms ease-in-out; /* transition-colors */
}

.stat-button:hover {
  color: #ef4444; /* hover:text-red-500 */
}

.stat-button-liked {
  color: #ef4444; /* likedItems[meme.id]일 때 text-red-500 */
}

.stat-icon {
  /* w-4 h-4 */
  width: 1rem; /* w-4 */
  height: 1rem; /* h-4 */
  /* 아이콘 기본 색상 (tailwind의 기본 회색이나 검정) */
}

.stat-icon-filled-red {
  /* fill-red-500 text-red-500 */
  fill: #ef4444; /* fill-red-500 */
  color: #ef4444; /* text-red-500 (아이콘 stroke 색상) */
}

.stat-text {
  /* text-sm */
  font-size: 0.875rem; /* text-sm */
}

.share-button {
  /* hover:text-purple-500 transition-colors */
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: inherit; /* 기본 텍스트 색상 상속 */
  transition: color 150ms ease-in-out; /* transition-colors */
}

.share-button:hover {
  color: var(--c-brand); /* hover:text-purple-500 */
}
</style>