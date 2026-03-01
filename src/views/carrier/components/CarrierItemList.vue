<template>
  <div class="right-panel" :class="{ 'mobile-active': mobileTab === 'items' }">
    <div class="shop-card">
      <div class="shop-card-header">
        <span class="shop-card-title">담은 아이템</span>
        <div class="item-count-badge">
          <span>{{ items.length }}</span>
        </div>
      </div>
      <div v-if="items.length === 0" class="empty-items">아직 담긴 아이템이 없어요</div>
      <div v-else class="item-list">
        <div
          v-for="(item, i) in displayItems"
          :key="item.id"
          class="item-row"
          :class="{
            selected: selected === item.id,
            faded: !itemsExpanded && i === visibleCount && sortedItems.length > visibleCount
          }"
          @click="$emit('toggle-select', item.id)"
        >
          <div class="item-icon" :class="{ selected: selected === item.id }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <div v-if="i < 3" class="item-rank" :style="{ background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32', color: i === 0 ? '#7a5a00' : i === 1 ? '#444' : '#5a2d00' }">{{ i + 1 }}</div>
          </div>
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <div class="item-meta">
              <span class="item-brand">{{ item.brand }}</span>
              <template v-if="item.rating">
                <span class="meta-dot">·</span>
                <span class="item-rating">★ {{ item.rating }}</span>
              </template>
            </div>
          </div>
          <button class="item-remove" @click.stop="$emit('remove-item', item.id)">✕</button>
        </div>
      </div>
      <button
        v-if="sortedItems.length > visibleCount"
        class="expand-btn"
        @click="$emit('update:itemsExpanded', !itemsExpanded)"
      >
        {{ itemsExpanded ? '접기' : `더보기 (${sortedItems.length - visibleCount}개)` }}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" :style="{ transform: itemsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- 더 담으러 가기 -->
    <button class="add-more-btn" @click="$router.push('/products')">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="#fff" stroke-width="1.5"/>
        <path d="M8 5.5V10.5M5.5 8H10.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      더 담으러 가기
    </button>

    <!-- 선택된 아이템 상세 -->
    <div v-if="selectedItem" class="item-detail-card">
      <div class="detail-header">
        <div class="detail-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </div>
        <div>
          <div class="detail-name">{{ selectedItem.name }}</div>
          <div class="detail-brand">{{ selectedItem.brand }}</div>
        </div>
        <div class="detail-rank" :style="selectedRankStyle">
          #{{ selectedRank }}
        </div>
      </div>
      <div class="detail-stats">
        <div class="stat-box">
          <div class="stat-label">상품</div>
          <div class="stat-value" style="font-size:12px">{{ selectedItem.name }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">브랜드</div>
          <div class="stat-value" style="font-size:12px">{{ selectedItem.brand || '-' }}</div>
        </div>
        <div v-if="selectedItem.imageUrl" class="stat-box full">
          <img :src="selectedItem.imageUrl" alt="" style="width:100%;border-radius:8px;max-height:120px;object-fit:cover" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getRankStyle } from '../constants.js'

const visibleCount = 2

const props = defineProps({
  items: { type: Array, required: true },
  sortedItems: { type: Array, required: true },
  selected: { type: [String, Number, null], default: null },
  itemsExpanded: { type: Boolean, default: false },
  mobileTab: { type: String, default: 'carrier' }
})

defineEmits(['toggle-select', 'remove-item', 'update:itemsExpanded'])

const displayItems = computed(() => {
  if (props.itemsExpanded) return props.sortedItems
  return props.sortedItems.slice(0, visibleCount + 1)
})

const selectedItem = computed(() => props.items.find(i => i.id === props.selected))
const selectedRank = computed(() => {
  const idx = props.sortedItems.findIndex(s => s.id === props.selected)
  return idx + 1
})
const selectedRankStyle = computed(() => {
  const rk = selectedRank.value
  const rs = getRankStyle(rk, props.sortedItems.length)
  return {
    background: rk <= 3 ? rs.bg : '#f5f3ff',
    color: rk <= 3 ? rs.tc : '#7c3aed'
  }
})
</script>
