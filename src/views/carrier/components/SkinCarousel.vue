<template>
  <div class="shop-card">
    <div class="shop-card-header">
      <span class="shop-card-title">스킨</span>
      <div class="shop-card-actions">
        <div class="current-skin-badge">
          <span>{{ currentSkinName }}</span>
        </div>
      </div>
    </div>
    <div class="skin-carousel">
      <button class="carousel-btn" :disabled="skinScroll <= 0" @click="scrollSkins(-1)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="skin-viewport">
        <div class="skin-track" :style="{ transform: `translateX(-${skinScroll}px)` }">
          <div
            v-for="item in allSkinItems"
            :key="item.id"
            class="skin-item-wrap"
          >
            <div
              class="skin-preview"
              :class="{ active: activeSkin === item.id }"
              @click="$emit('update:activeSkin', item.id)"
            >
              <div v-if="item.special" class="skin-badge sp">SP</div>
              <div class="skin-svg-wrap">
                <svg width="60" height="80" viewBox="0 0 300 400" fill="none">
                  <defs>
                    <linearGradient :id="`pg-${item.id}`" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" :stop-color="item.body.grad1"/>
                      <stop offset="100%" :stop-color="item.body.grad2"/>
                    </linearGradient>
                  </defs>
                  <rect x="30" y="50" width="240" height="320" rx="20" :fill="`url(#pg-${item.id})`" :stroke="item.body.stroke" stroke-width="5"/>
                  <rect x="116" y="6" width="68" height="18" rx="9" :fill="item.handle.grip" :stroke="item.handle.stroke" stroke-width="3.5"/>
                  <rect x="98" y="80" width="22" height="250" rx="11" :fill="item.groove.fill" :stroke="item.groove.stroke" stroke-width="3"/>
                  <rect x="139" y="80" width="22" height="250" rx="11" :fill="item.groove.fill" :stroke="item.groove.stroke" stroke-width="3"/>
                  <rect x="180" y="80" width="22" height="250" rx="11" :fill="item.groove.fill" :stroke="item.groove.stroke" stroke-width="3"/>
                  <circle cx="70" cy="382" r="10" :fill="item.wheel.fill" :stroke="item.wheel.stroke" stroke-width="3"/>
                  <circle cx="230" cy="382" r="10" :fill="item.wheel.fill" :stroke="item.wheel.stroke" stroke-width="3"/>
                </svg>
              </div>
              <div class="skin-info">
                <div class="skin-name">{{ item.name }}</div>
                <div class="skin-desc">{{ item.desc }}</div>
              </div>
              <div v-if="activeSkin === item.id" class="skin-active-bar"></div>
            </div>
          </div>
        </div>
      </div>
      <button class="carousel-btn" :disabled="skinScroll >= skinMaxScroll" @click="scrollSkins(1)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
    <!-- 캐꾸 저장 -->
    <Transition name="deco-bar">
      <div v-if="hasUnsavedChanges" class="deco-save-bar">
        <div class="deco-save-left">
          <svg class="deco-save-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span class="deco-save-label">변경사항 있음</span>
        </div>
        <button
          class="deco-save-btn"
          :class="{ disabled: saving }"
          :disabled="saving"
          @click="$emit('save')"
        >{{ saving ? '저장 중...' : '저장' }}</button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { IW, G } from '../constants.js'

const props = defineProps({
  activeSkin: { type: String, required: true },
  allSkinItems: { type: Array, required: true },
  currentSkinName: { type: String, default: '' },
  skinScroll: { type: Number, default: 0 },
  skinMaxScroll: { type: Number, default: 0 },
  hasUnsavedChanges: { type: Boolean, default: false },
  saving: { type: Boolean, default: false }
})

const emit = defineEmits(['update:activeSkin', 'update:skinScroll', 'save'])

function scrollSkins(dir) {
  const newScroll = Math.max(0, Math.min(props.skinMaxScroll, props.skinScroll + dir * (IW + G)))
  emit('update:skinScroll', newScroll)
}
</script>
