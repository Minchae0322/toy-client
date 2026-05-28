<template>
  <section class="quick-nav-section" aria-label="주요 메뉴">
    <div class="quick-nav-row">
      <router-link
        v-for="item in items"
        :key="item.key"
        :to="item.to || '#'"
        class="quick-tile"
        @click="handleClick(item, $event)"
      >
        <span class="tile-icon" :style="{ background: item.bg, color: item.fg }">
          <component :is="item.icon" :size="22" :stroke-width="2.2" />
        </span>
        <span class="tile-title">{{ item.title }}</span>
      </router-link>
    </div>
    <FeedbackModal :visible="showFeedback" @close="showFeedback = false" />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { Flame, BarChart3, Award, Sparkles, Swords, MessageSquare } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useLoginPrompt } from '@/composables/useLoginPrompt'
import FeedbackModal from '@/components/common/FeedbackModal.vue'

const { isLoggedIn } = useAuth()
const { openLoginPrompt } = useLoginPrompt()
const showFeedback = ref(false)

const items = [
  {
    key: 'battle',
    title: '요거픽',
    to: { name: 'BattleList' },
    icon: Swords,
    bg: '#FAF5FF',
    fg: '#9333EA',
  },
  {
    key: 'feed',
    title: '핫 피드',
    to: { name: 'FeedHome' },
    icon: Flame,
    bg: '#FFF1E6',
    fg: '#F97316',
  },
  {
    key: 'ranking',
    title: '핫 아이템',
    to: { name: 'ProductRanking' },
    icon: BarChart3,
    bg: '#EEF2FF',
    fg: '#4F46E5',
  },
  {
    key: 'carrier',
    title: '캐꾸',
    to: { name: 'Carrier' },
    icon: Sparkles,
    bg: '#ECFEFF',
    fg: '#06B6D4',
  },
  {
    key: 'collection',
    title: '내 컬렉션',
    to: { name: 'Collection' },
    icon: Award,
    bg: '#FEF3C7',
    fg: '#D97706',
    requiresAuth: true,
  },
  {
    key: 'feedback',
    title: '의견 보내기',
    icon: MessageSquare,
    bg: '#FCE7F3',
    fg: '#DB2777',
    action: 'feedback',
  },
]

function handleClick(item, e) {
  if (item.action === 'feedback') {
    e.preventDefault()
    showFeedback.value = true
    return
  }
  if (item.requiresAuth && !isLoggedIn.value) {
    e.preventDefault()
    openLoginPrompt('이 기능은 로그인 후 이용할 수 있어요')
  }
}
</script>

<style scoped>
.quick-nav-section {
  width: 100%;
}

/* 가로 스크롤 한 줄 — 촘촘하게 배치 (PC에서는 6칸이 한 줄에 자연스럽게 맞음) */
.quick-nav-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  /* 모바일 스크롤 시 가장자리에서 끊기지 않도록 */
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
}

.quick-nav-row::-webkit-scrollbar {
  display: none;
}

@media (min-width: 768px) {
  .quick-nav-row {
    gap: 8px;
    /* 데스크톱: 6칸 균등 분배, 스크롤 불필요 */
    overflow-x: visible;
  }
}

.quick-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 4px 2px;
  background: transparent;
  border: none;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s ease, background 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  /* 한 줄에 촘촘하게 — 고정 폭으로 같은 크기 유지 */
  flex: 0 0 auto;
  width: 62px;
  scroll-snap-align: start;
}

@media (min-width: 768px) {
  .quick-tile {
    flex: 1 1 0;
    width: auto;
    min-width: 0;
  }
}

.quick-tile:hover {
  background: var(--bg-subtle, #F7F8FA);
}

.quick-tile:active {
  transform: scale(0.96);
}

.tile-icon {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tile-icon svg {
  width: 22px;
  height: 22px;
}

@media (min-width: 768px) {
  .tile-icon {
    width: 52px;
    height: 52px;
    border-radius: 15px;
  }
  .tile-icon svg {
    width: 23px;
    height: 23px;
  }
}

@media (min-width: 1280px) {
  .tile-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
  }
  .tile-icon svg {
    width: 24px;
    height: 24px;
  }
}

.tile-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

@media (min-width: 768px) {
  .tile-title {
    font-size: 13px;
  }
}

@media (min-width: 1280px) {
  .tile-title {
    font-size: 13.5px;
  }
}

@media (max-width: 380px) {
  .quick-tile {
    width: 58px;
  }
  .tile-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }
  .tile-icon svg {
    width: 21px;
    height: 21px;
  }
  .tile-title {
    font-size: 11.5px;
  }
}

@media (hover: none) {
  .quick-tile:hover {
    background: transparent;
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
