<template>
  <Teleport to="body">
    <Transition name="sticker-tray">
      <div v-if="visible" class="sticker-tray-backdrop" @click.self="$emit('update:visible', false)">
        <div class="sticker-tray">
          <div class="sticker-tray-handle" @click="$emit('update:visible', false)"><div class="handle-bar"></div></div>
          <div class="sticker-tray-tabs">
            <button
              v-for="[key, label] in PACK_LABELS"
              :key="key"
              class="stray-tab"
              :class="{ active: stickerPack === key }"
              @click="$emit('update:stickerPack', key)"
            >{{ label }}</button>
            <button
              class="stray-tab stray-tab-special"
              :class="{ active: stickerPack === SPECIAL_PACK[0] }"
              @click="$emit('update:stickerPack', SPECIAL_PACK[0])"
            >{{ SPECIAL_PACK[1] }}</button>
          </div>
          <div class="sticker-tray-grid">
            <div
              v-for="d in curStickers"
              :key="d.id"
              class="stray-item"
              :class="{ 'stray-special': d.type === 'phototag', 'stray-active': d.type === 'phototag' && hasPhototag }"
              @click="$emit('place-deco', d)"
            >
              <template v-if="d.type === 'phototag'">
                <span class="stray-special-icon">📷</span>
                <span class="stray-special-label">{{ d.label }}</span>
              </template>
              <template v-else>{{ d.emoji }}</template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { PACK_LABELS, SPECIAL_PACK } from '../constants.js'

defineProps({
  visible: { type: Boolean, required: true },
  stickerPack: { type: String, required: true },
  curStickers: { type: Array, required: true },
  hasPhototag: { type: Boolean, default: false }
})

defineEmits(['update:visible', 'update:stickerPack', 'place-deco'])
</script>

<style>
/* 바텀 트레이 (Teleport to body이므로 scoped 불가) */
.sticker-tray-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
}
.sticker-tray {
  width: 100%;
  max-height: 45vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sticker-tray-handle {
  display: flex;
  justify-content: center;
  padding: 10px 0 6px;
  cursor: pointer;
}
.sticker-tray-handle .handle-bar {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #d1d5db;
}
.sticker-tray-tabs {
  display: flex;
  gap: 6px;
  padding: 4px 16px 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.stray-tab {
  flex-shrink: 0;
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}
.stray-tab.active {
  background: #7c3aed;
  color: #fff;
  border-color: #7c3aed;
}
.stray-tab-special {
  border-color: #fbbf24;
  color: #b45309;
  background: #fffbeb;
}
.stray-tab-special.active {
  background: #f59e0b;
  color: #fff;
  border-color: #f59e0b;
}
.sticker-tray-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  padding: 0 16px 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.stray-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border-radius: 12px;
  background: #f9fafb;
  cursor: pointer;
  transition: background 0.12s;
  user-select: none;
}
.stray-item:active { background: #ede9fe; }
.stray-special {
  flex-direction: column;
  gap: 2px;
  border: 1.5px dashed #d1d5db;
  background: #fefce8;
}
.stray-special.stray-active {
  border-color: #7c3aed;
  background: #f5f3ff;
}
.stray-special-icon { font-size: 20px; }
.stray-special-label { font-size: 9px; color: #6b7280; font-weight: 600; }
/* 트레이 애니메이션 */
.sticker-tray-enter-active { transition: opacity 0.25s ease; }
.sticker-tray-enter-active .sticker-tray { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.sticker-tray-leave-active { transition: opacity 0.2s ease; }
.sticker-tray-leave-active .sticker-tray { transition: transform 0.2s ease-in; }
.sticker-tray-enter-from { opacity: 0; }
.sticker-tray-enter-from .sticker-tray { transform: translateY(100%); }
.sticker-tray-leave-to { opacity: 0; }
.sticker-tray-leave-to .sticker-tray { transform: translateY(100%); }
</style>
