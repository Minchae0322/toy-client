<template>
  <section class="quick-nav-section" aria-label="주요 메뉴">
    <div class="quick-nav-grid">
      <router-link
        v-for="item in items"
        :key="item.key"
        :to="item.to || '#'"
        class="quick-tile"
        @click="handleClick(item, $event)"
      >
        <span class="tile-icon" :style="{ background: item.bg, color: item.fg }">
          <component :is="item.icon" :size="24" :stroke-width="2.2" />
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

.quick-nav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px 4px;
}

@media (min-width: 480px) {
  .quick-nav-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 12px 4px;
  }
}

@media (min-width: 1024px) {
  .quick-nav-grid {
    gap: 16px 8px;
  }
}

.quick-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  background: transparent;
  border: none;
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s ease, background 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  min-width: 0;
}

.quick-tile:hover {
  background: var(--bg-subtle, #F7F8FA);
}

.quick-tile:active {
  transform: scale(0.96);
}

.tile-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .tile-icon {
    width: 60px;
    height: 60px;
    border-radius: 18px;
  }
}

@media (min-width: 1280px) {
  .tile-icon {
    width: 64px;
    height: 64px;
  }
}

.tile-title {
  font-size: 12.5px;
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
    font-size: 14px;
  }
}

@media (max-width: 380px) {
  .tile-icon {
    width: 50px;
    height: 50px;
    border-radius: 14px;
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
