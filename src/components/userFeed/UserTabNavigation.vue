<template>
  <nav class="tabs-container">
    <div class="tabs-wrapper">
      <button
          v-for="menu in menuItems"
          :key="menu.value"
          :class="['tab-item', { active: modelValue === menu.value }]"
          @click="handleTabClick(menu.value)"
      >
        <component :is="getIcon(menu.value)" class="tab-icon" />
        <span class="tab-label">{{ menu.label }}</span>
      </button>

      <!-- 슬라이딩 인디케이터 -->
      <div
          class="tab-indicator"
          :style="indicatorStyle"
      ></div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch, h } from 'vue';

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

const activeIndex = ref(0);

const indicatorStyle = computed(() => {
  const width = 100 / props.menuItems.length;
  return {
    width: `${width}%`,
    transform: `translateX(${activeIndex.value * 100}%)`
  };
});

const handleTabClick = (value) => {
  emit('update:modelValue', value);
};

// 아이콘 컴포넌트
const GridIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '1.5'
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
  'stroke-width': '1.5'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    d: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z'
  })
]);

const BookmarkIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '1.5'
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

// 활성 인덱스 업데이트
watch(() => props.modelValue, (newVal) => {
  activeIndex.value = props.menuItems.findIndex(item => item.value === newVal);
}, { immediate: true });
</script>

<style scoped>
.tabs-container {
  background: #fff;
  border-top: 1px solid #efefef;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tabs-wrapper {
  position: relative;
  display: flex;
  width: 100%;
}

/* 모바일에서만 중앙 정렬 */
@media (max-width: 767px) {
  .tabs-wrapper {
    max-width: 400px;
    margin: 0 auto;
  }
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 0;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.tab-icon {
  width: 22px;
  height: 22px;
  color: #8e8e8e;
  transition: color 0.2s ease;
}

.tab-label {
  font-size: 12px;
  font-weight: 600;
  color: #8e8e8e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.2s ease;
}

/* 활성 상태 */
.tab-item.active .tab-icon {
  color: #111;
}

.tab-item.active .tab-label {
  color: #111;
}

/* 호버 상태 */
.tab-item:hover:not(.active) .tab-icon,
.tab-item:hover:not(.active) .tab-label {
  color: #555;
}

/* 슬라이딩 인디케이터 */
.tab-indicator {
  position: absolute;
  top: 0;
  left: 0;
  height: 1px;
  background: #111;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 모바일: 아이콘만 표시 */
@media (max-width: 480px) {
  .tab-label {
    display: none;
  }

  .tab-icon {
    width: 24px;
    height: 24px;
  }
}

/* 터치 디바이스 */
@media (hover: none) {
  .tab-item {
    min-height: 48px;
  }

  .tab-item:active {
    background: #f5f5f5;
  }
}
</style>