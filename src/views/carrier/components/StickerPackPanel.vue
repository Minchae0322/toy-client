<template>
  <div class="shop-card">
    <div class="shop-card-header">
      <span class="shop-card-title">스티커팩</span>
      <div class="deco-page-nav">
        <span class="page-info">{{ decoPage + 1 }}/{{ decoPages.length }}</span>
        <button class="page-btn" :disabled="decoPage <= 0" @click="$emit('update:decoPage', decoPage - 1)">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="page-btn" :disabled="decoPage >= decoPages.length - 1" @click="$emit('update:decoPage', decoPage + 1)">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
    <div class="sticker-pack-tabs">
      <div class="pack-tabs-left">
        <button
          v-for="[key, label] in PACK_LABELS"
          :key="key"
          class="pack-tab"
          :class="{ active: stickerPack === key }"
          @click="$emit('update:stickerPack', key); $emit('update:decoPage', 0)"
        >{{ label }}</button>
      </div>
      <button
        class="pack-tab pack-tab-special"
        :class="{ active: stickerPack === SPECIAL_PACK[0] }"
        @click="$emit('update:stickerPack', SPECIAL_PACK[0]); $emit('update:decoPage', 0)"
      >{{ SPECIAL_PACK[1] }}</button>
    </div>
    <div class="deco-grid-viewport">
      <div class="deco-track" :style="{ transform: `translateX(-${decoPage * (100 / decoPages.length)}%)`, width: decoPages.length * 100 + '%' }">
        <div v-for="(pg, pi) in decoPages" :key="pi" class="deco-page" :style="{ width: (100 / decoPages.length) + '%' }">
          <div v-for="d in pg" :key="d.id"
            class="deco-item"
            :class="{ 'deco-empty': d.empty, 'deco-special': d.type === 'phototag', 'deco-active': d.type === 'phototag' && hasPhototag }"
            @click="!d.empty && $emit('place-deco', d)">
            <template v-if="d.type === 'phototag'">
              <span class="special-icon">📷</span>
              <span class="special-label">{{ d.label }}</span>
            </template>
            <template v-else>{{ d.emoji }}</template>
          </div>
        </div>
      </div>
    </div>
    <div v-if="decoCount > 0" class="save-deco-wrap">
      <button
        class="clear-all-deco-btn"
        @click="$emit('bulk-delete')"
      >전체 삭제 ({{ decoCount }})</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { STICKER_PACKS, PACK_LABELS, SPECIAL_PACK } from '../constants.js'

const props = defineProps({
  stickerPack: { type: String, required: true },
  decoPage: { type: Number, required: true },
  hasPhototag: { type: Boolean, default: false },
  decoCount: { type: Number, default: 0 }
})

defineEmits(['update:stickerPack', 'update:decoPage', 'place-deco', 'bulk-delete'])

const curStickers = computed(() => STICKER_PACKS[props.stickerPack] || [])

const decoPages = computed(() => {
  const PP = 8
  const pages = []
  for (let i = 0; i < curStickers.value.length; i += PP) {
    const page = curStickers.value.slice(i, i + PP)
    while (page.length < PP) page.push({ id: `_empty_${i + page.length}`, emoji: '', empty: true })
    pages.push(page)
  }
  return pages
})
</script>
