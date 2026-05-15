<template>
  <div class="section-card">
    <!-- 획득한 뱃지 -->
    <div v-if="sortedEarned.length > 0" class="badge-group">
      <div class="group-head">
        <span class="group-label">이미 받은 뱃지</span>
        <span class="group-count">{{ earned.length }}개</span>
      </div>
      <div class="badge-grid">
        <div
          v-for="badge in sortedEarned"
          :key="badge.id"
          class="badge-card earned"
          :class="{ pinned: pinnedIds.includes(badge.id) }"
          :style="{
            background: badge.color + '0D',
            borderColor: pinnedIds.includes(badge.id) ? badge.color + '55' : 'transparent',
          }"
          @click="$emit('select', badge)"
          @pointerdown="onPointerDown(badge)"
          @pointerup="onPointerUp"
          @pointerleave="onPointerUp"
          @contextmenu.prevent
        >
          <Pin v-if="pinnedIds.includes(badge.id)" class="pin-mark" :size="11" :stroke-width="2.8" :style="{ color: badge.color }" />
          <div class="badge-icon-wrap" :style="{ background: 'white', boxShadow: `0 3px 8px ${badge.color}26` }">
            <span class="badge-emoji">{{ badge.emoji }}</span>
            <span v-if="badge.count > 1" class="badge-stack">×{{ badge.count }}</span>
          </div>
          <div class="badge-meta">
            <div class="badge-name">{{ badge.name }}</div>
            <div class="badge-date">{{ formatDate(badge.earnedAt) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 곧 획득할 뱃지 (near complete ≥70%) -->
    <div v-if="nearComplete.length > 0" class="badge-group">
      <div class="group-head">
        <span class="group-label">곧 받을 수 있어요</span>
        <span class="group-count hot">{{ nearComplete.length }}개</span>
      </div>
      <div class="badge-grid">
        <div
          v-for="badge in nearComplete"
          :key="badge.id"
          class="badge-card near"
          :style="{ borderColor: badge.color + '55' }"
          @click="$emit('select', badge)"
        >
          <div class="badge-icon-wrap" :style="{ background: 'white', boxShadow: `0 3px 8px ${badge.color}33` }">
            <span class="badge-emoji">{{ badge.emoji }}</span>
          </div>
          <div class="badge-meta">
            <div class="badge-name">{{ badge.name }}</div>
            <div class="badge-progress">
              <div class="badge-progress-bar">
                <div
                  class="badge-progress-fill"
                  :style="{ width: (badge.progress.current / badge.progress.target * 100) + '%', background: badge.color }"
                ></div>
              </div>
              <span class="badge-progress-text">{{ badge.progress.current }}/{{ badge.progress.target }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 도전 중 뱃지 -->
    <div v-if="farFromEarning.length > 0" class="badge-group">
      <div class="group-head">
        <span class="group-label">도전해 보세요</span>
        <span class="group-count">{{ farFromEarning.length }}개</span>
      </div>
      <div class="badge-grid">
        <div
          v-for="badge in farFromEarning"
          :key="badge.id"
          class="badge-card locked"
          @click="$emit('select', badge)"
        >
          <div class="badge-icon-wrap locked-bg">
            <span class="badge-emoji locked-emoji">{{ badge.emoji }}</span>
          </div>
          <div class="badge-meta">
            <div class="badge-name">{{ badge.name }}</div>
            <div v-if="badge.progress" class="badge-progress">
              <div class="badge-progress-bar">
                <div
                  class="badge-progress-fill"
                  :style="{ width: (badge.progress.current / badge.progress.target * 100) + '%' }"
                ></div>
              </div>
              <span class="badge-progress-text">{{ badge.progress.current }}/{{ badge.progress.target }}</span>
            </div>
            <div v-else class="badge-date muted">도전 전</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Pin } from '@/utils/collectionIcons.js'

const props = defineProps({
  earned: { type: Array, required: true },
  unearned: { type: Array, required: true },
  totalCount: { type: Number, required: true },
  pinnedIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['select', 'toggle-pin'])

const sortedEarned = computed(() => {
  const pinned = new Set(props.pinnedIds)
  return [...props.earned].sort((a, b) => {
    const ap = pinned.has(a.id) ? 1 : 0
    const bp = pinned.has(b.id) ? 1 : 0
    return bp - ap
  })
})

const nearComplete = computed(() =>
  props.unearned.filter((b) => b.progress && (b.progress.current / b.progress.target) >= 0.7)
)

const farFromEarning = computed(() => {
  const nearIds = new Set(nearComplete.value.map((b) => b.id))
  return props.unearned.filter((b) => !nearIds.has(b.id))
})

let pressTimer = null

function onPointerDown(badge) {
  pressTimer = setTimeout(() => {
    emit('toggle-pin', badge)
  }, 500)
}

function onPointerUp() {
  if (pressTimer) clearTimeout(pressTimer)
  pressTimer = null
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.section-card {
  padding: 20px;
  background: var(--bg-elevated);
  border-radius: 16px;
}

@media (min-width: 768px) { .section-card { padding: 24px; } }

.badge-group + .badge-group { margin-top: 28px; }

.group-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-default);
}

.group-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--c-text-500);
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.group-count {
  font-size: 13px;
  font-weight: 800;
  color: var(--c-brand);
  letter-spacing: -0.2px;
}

.group-count.hot {
  color: var(--c-heat);
}

.badge-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

@media (min-width: 420px) { .badge-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 640px) { .badge-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; } }
@media (min-width: 960px) { .badge-grid { grid-template-columns: repeat(4, 1fr); gap: 12px; } }
@media (min-width: 1280px) { .badge-grid { grid-template-columns: repeat(5, 1fr); } }

.badge-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  border: 1.5px solid transparent;
}

.badge-card.earned:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08); }
.badge-card.locked { background: var(--bg-subtle) !important; opacity: 0.8; }
.badge-card.locked:hover { opacity: 1; background: var(--bg-mute) !important; }

.badge-card.near {
  background: var(--bg-elevated) !important;
  border-width: 1.5px !important;
  border-style: solid !important;
}

.badge-card.near:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(15, 23, 42, 0.1); }

.badge-card.pinned {
  border-width: 1.5px;
}

.pin-mark {
  position: absolute;
  top: 8px;
  right: 8px;
}

.badge-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.08);
}

.badge-icon-wrap.locked-bg { background: var(--border-default) !important; box-shadow: none !important; }
.badge-emoji { font-size: 22px; line-height: 1; }
.badge-emoji.locked-emoji { filter: grayscale(1); opacity: 0.4; }

.badge-stack {
  position: absolute;
  top: -4px;
  right: -6px;
  background: var(--c-ink-900);
  color: white;
  font-size: 9.5px;
  font-weight: 800;
  padding: 2px 5px;
  border-radius: 6px;
  min-width: 20px;
  text-align: center;
  border: 1.5px solid white;
  letter-spacing: -0.2px;
}

.badge-meta { min-width: 0; flex: 1; }

.badge-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.2px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-card.locked .badge-name { color: var(--c-text-500); }

.badge-date {
  font-size: 11px;
  color: var(--c-text-400);
  margin-top: 4px;
  font-weight: 500;
}

.badge-date.muted { color: var(--c-text-300); }

.badge-progress { margin-top: 6px; }

.badge-progress-bar {
  height: 3px;
  background: var(--border-strong);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 3px;
}

.badge-progress-fill {
  height: 100%;
  background: var(--c-brand);
  border-radius: 2px;
  transition: width 0.4s ease;
}

.badge-progress-text {
  font-size: 10.5px;
  color: var(--c-text-500);
  font-weight: 600;
  letter-spacing: -0.1px;
}
</style>
