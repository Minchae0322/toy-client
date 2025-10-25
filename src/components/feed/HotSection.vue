<template>
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
      <div v-for="post in hotPosts" :key="post.id" class="hot-card" @click="$emit('post-click', post.id)">
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
</template>

<script setup>
defineProps({
  hotPosts: {
    type: Array,
    default: () => []
  }
});

defineEmits(['post-click']);

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
</script>

<style scoped>
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

@media (max-width: 767px) {
  .hot-grid {
    gap: 12px;
  }

  .hot-image {
    padding-bottom: 130%;
  }
}
</style>