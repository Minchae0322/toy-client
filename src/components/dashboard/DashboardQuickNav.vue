<template>
  <nav class="quick-nav" aria-label="주요 메뉴">
    <p class="quick-nav-label">다른 코너 둘러보기</p>
    <div class="quick-nav-grid">
      <router-link
        v-for="item in items"
        :key="item.key"
        :to="item.to"
        class="quick-tile"
      >
        <span class="tile-icon" :style="{ background: item.bg, color: item.fg }">
          <component :is="item.icon" :size="20" :stroke-width="2.2" />
        </span>
        <span class="tile-text">
          <span class="tile-title">{{ item.title }}</span>
          <span class="tile-desc">{{ item.desc }}</span>
        </span>
        <svg class="tile-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { Flame, BarChart3, Award, Sparkles } from 'lucide-vue-next'

const items = [
  {
    key: 'feed',
    title: '핫 피드',
    desc: '솔직한 리뷰 기록',
    to: { name: 'FeedHome' },
    icon: Flame,
    bg: '#FFF1E6',
    fg: '#F97316',
  },
  {
    key: 'ranking',
    title: '제품 랭킹',
    desc: '카테고리별 실시간 TOP',
    to: { name: 'ProductRanking' },
    icon: BarChart3,
    bg: '#EEF2FF',
    fg: '#4F46E5',
  },
  {
    key: 'collection',
    title: '내 컬렉션',
    desc: '레벨·뱃지·리워드',
    to: { name: 'Collection' },
    icon: Award,
    bg: '#FAF5FF',
    fg: '#9333EA',
  },
  {
    key: 'carrier',
    title: '캐리어 꾸미기',
    desc: '나만의 스티커 보드',
    to: { name: 'Carrier' },
    icon: Sparkles,
    bg: '#ECFEFF',
    fg: '#06B6D4',
  },
]
</script>

<style scoped>
.quick-nav {
  margin: 0 0 1.25rem;
}

@media (min-width: 768px) {
  .quick-nav {
    margin: 0 0 1.5rem;
  }
}

.quick-nav-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--c-text-400);
  letter-spacing: 0.02em;
  margin: 0 0 0.625rem;
  padding-left: 2px;
  text-transform: none;
}

.quick-nav-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .quick-nav-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
  }
}

.quick-tile {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 0.875rem;
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  -webkit-tap-highlight-color: transparent;
  min-width: 0;
}

.quick-tile:hover {
  border-color: var(--border-strong);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.quick-tile:active {
  transform: scale(0.98);
}

.tile-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tile-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.tile-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tile-desc {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--c-text-400);
  letter-spacing: -0.01em;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tile-arrow {
  color: var(--c-text-300);
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .quick-tile {
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }
  .tile-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }
  .tile-title {
    font-size: 0.875rem;
  }
  .tile-desc {
    font-size: 0.75rem;
  }
}

@media (max-width: 767px) {
  .quick-tile {
    -webkit-user-select: none;
    user-select: none;
  }
}

@media (hover: none) {
  .quick-tile:hover {
    transform: none;
    box-shadow: none;
    border-color: var(--border-default);
  }
}

@media (prefers-reduced-motion: reduce) {
  .quick-tile,
  .quick-tile:hover,
  .quick-tile:active {
    transform: none;
  }
}
</style>
