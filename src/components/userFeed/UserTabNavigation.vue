<template>
  <nav class="tabs">
    <div class="tabs-inner">
      <button
          v-for="menu in menuItems"
          :key="menu.value"
          :class="['tab', { active: modelValue === menu.value }]"
          @click="handleTabClick(menu.value)"
      >
        <component :is="getIcon(menu.value)" class="tab-icon" />
        <span class="tab-label">{{ menu.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { h } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  menuItems: {
    type: Array,
    default: () => [
      { label: '게시물', value: 'feeds' },
      { label: '좋아요', value: 'liked' },
      { label: '저장됨', value: 'saved' }
    ]
  }
});

const emit = defineEmits(['update:modelValue']);

const handleTabClick = (value) => {
  emit('update:modelValue', value);
};

const GridIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '1.8'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    d: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'
  })
]);

const HeartIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '1.8'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    d: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.765 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z'
  })
]);

const BookmarkIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '1.8'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    d: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z'
  })
]);

const getIcon = (value) => {
  const icons = {
    feeds: GridIcon,
    liked: HeartIcon,
    saved: BookmarkIcon
  };
  return icons[value] || GridIcon;
};
</script>

<style scoped>
/* 인스타 프로필 탭 스타일
   - 상단 1px 헤어라인
   - 활성 탭은 상단 잉크 인디케이터 바
   - 중앙 정렬, 아이콘 + 한글 라벨, 절제된 트래킹 */
.tabs {
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
  border-top: 1px solid #DBDBDB;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

.tabs-inner {
  display: flex;
  width: 100%;
  justify-content: center;
  gap: 60px;
}

@media (max-width: 767px) {
  .tabs-inner {
    justify-content: space-around;
    gap: 0;
  }
}

.tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 4px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: #8E8E8E;
  transition: color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

@media (max-width: 767px) {
  .tab {
    flex: 1;
    padding: 13px 0 11px;
  }
}

.tab-icon {
  width: 13px;
  height: 13px;
  color: currentColor;
  flex-shrink: 0;
}

.tab-label {
  font-size: 12px;
  font-weight: 700;
  color: currentColor;
  letter-spacing: 0.6px;
  line-height: 1;
}

/* Active — 상단 1px 잉크 인디케이터 (인스타 시그니처) */
.tab.active {
  color: #0A0E1A;
}

.tab.active::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: #0A0E1A;
}

/* Hover (비활성) */
.tab:hover:not(.active) {
  color: #475569;
}

/* 모바일: 라벨 유지하되 살짝 축소 */
@media (max-width: 400px) {
  .tab { gap: 5px; }
  .tab-icon { width: 12px; height: 12px; }
  .tab-label { font-size: 11px; letter-spacing: 0.4px; }
}

@media (hover: none) {
  .tab { min-height: 44px; }
}
</style>
