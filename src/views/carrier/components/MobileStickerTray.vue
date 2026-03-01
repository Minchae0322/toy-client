<template>
  <Teleport to="body">
    <Transition name="sticker-tray">
      <div v-if="visible" class="sticker-tray-backdrop" @click.self="$emit('update:visible', false)">
        <div class="sticker-tray">
          <!-- 헤더 -->
          <div class="sticker-tray-header">
            <div class="handle-bar"></div>
            <div class="stray-header-row">
              <span class="stray-title">스티커 붙이기</span>
              <button class="stray-close" @click="$emit('update:visible', false)">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 6L14 14M14 6L6 14" stroke="#9ca3af" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 카테고리 탭 -->
          <div class="sticker-tray-tabs">
            <button
              v-for="[key, label] in PACK_LABELS"
              :key="key"
              class="stray-tab"
              :class="{ active: stickerPack === key }"
              @click="$emit('update:stickerPack', key)"
            >{{ label }}</button>
            <button
              class="stray-tab special"
              :class="{ active: stickerPack === SPECIAL_PACK[0] }"
              @click="$emit('update:stickerPack', SPECIAL_PACK[0])"
            >{{ SPECIAL_PACK[1] }}</button>
          </div>

          <div class="stray-divider"></div>

          <!-- 스티커 그리드 -->
          <div class="sticker-tray-grid">
            <button
              v-for="d in curStickers"
              :key="d.id"
              class="stray-item"
              :class="{ 'stray-special': d.type === 'phototag', 'stray-active': d.type === 'phototag' && hasPhototag }"
              @click="onPlace(d)"
            >
              <template v-if="d.type === 'phototag'">
                <span class="stray-special-icon">📷</span>
                <span class="stray-special-label">{{ d.label }}</span>
              </template>
              <span v-else class="stray-emoji">{{ d.emoji }}</span>
            </button>
          </div>

          <!-- 토스트 -->
          <Transition name="stray-toast">
            <div v-if="toastMsg" class="stray-toast">
              <span class="stray-toast-emoji">{{ toastEmoji }}</span>
              {{ toastMsg }}
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { PACK_LABELS, SPECIAL_PACK } from '../constants.js'

defineProps({
  visible: { type: Boolean, required: true },
  stickerPack: { type: String, required: true },
  curStickers: { type: Array, required: true },
  hasPhototag: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'update:stickerPack', 'place-deco'])

const toastMsg = ref('')
const toastEmoji = ref('')
let toastTimer = null

function onPlace(d) {
  emit('place-deco', d)
  if (d.type === 'phototag') return
  toastEmoji.value = d.emoji
  toastMsg.value = '추가했어요!'
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 1400)
}
</script>

<style>
/* ===== 바텀 트레이 (Teleport → scoped 불가) ===== */
.sticker-tray-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
}
.sticker-tray {
  position: relative;
  width: 100%;
  max-height: 52vh;
  background: #fff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* — 헤더 — */
.sticker-tray-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 16px 0;
}
.sticker-tray-header .handle-bar {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #e5e7eb;
  margin-bottom: 8px;
}
.stray-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 6px;
}
.stray-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.2px;
}
.stray-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.stray-close:active {
  background: #e5e7eb;
}

/* — 카테고리 탭 — */
.sticker-tray-tabs {
  display: flex;
  gap: 6px;
  padding: 6px 16px 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.sticker-tray-tabs::-webkit-scrollbar { display: none; }

.stray-tab {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.stray-tab.active {
  background: #f3f4f6;
  color: #111827;
  font-weight: 600;
}
.stray-tab.special {
  color: #d97706;
}
.stray-tab.special.active {
  background: #fffbeb;
  color: #b45309;
  font-weight: 600;
}

/* — 구분선 — */
.stray-divider {
  height: 1px;
  margin: 0 16px;
  background: #f3f4f6;
}

/* — 스티커 그리드 — */
.sticker-tray-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 12px 16px 28px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.sticker-tray-grid::-webkit-scrollbar { display: none; }

.stray-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #f9fafb;
  border: 1.5px solid #f0f0f3;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.15s, box-shadow 0.15s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.stray-item:active {
  transform: scale(0.88);
  background: #ede9fe;
  box-shadow: 0 0 0 rgba(0,0,0,0);
}

.stray-emoji {
  font-size: 28px;
  line-height: 1;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.stray-item:active .stray-emoji {
  transform: scale(1.15);
}

/* — 포토택 특수 아이템 — */
.stray-special {
  flex-direction: column;
  gap: 2px;
  border: 1.5px dashed #d1d5db;
  background: #fefefe;
  box-shadow: none;
}
.stray-special.stray-active {
  border-color: #8b5cf6;
  background: #faf5ff;
  border-style: solid;
}
.stray-special-icon { font-size: 20px; }
.stray-special-label { font-size: 9px; color: #9ca3af; font-weight: 600; letter-spacing: -0.2px; }

/* — 토스트 — */
.stray-toast {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  background: #1f2937;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 24px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.stray-toast-emoji {
  font-size: 16px;
  line-height: 1;
}
.stray-toast-enter-active { transition: opacity 0.2s, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.stray-toast-leave-active { transition: opacity 0.15s, transform 0.15s ease-in; }
.stray-toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.9); }
.stray-toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-6px) scale(0.95); }

/* — 트레이 진입/퇴장 애니메이션 — */
.sticker-tray-enter-active { transition: opacity 0.25s ease; }
.sticker-tray-enter-active .sticker-tray { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.sticker-tray-leave-active { transition: opacity 0.2s ease; }
.sticker-tray-leave-active .sticker-tray { transition: transform 0.2s ease-in; }
.sticker-tray-enter-from { opacity: 0; }
.sticker-tray-enter-from .sticker-tray { transform: translateY(100%); }
.sticker-tray-leave-to { opacity: 0; }
.sticker-tray-leave-to .sticker-tray { transform: translateY(100%); }
</style>
