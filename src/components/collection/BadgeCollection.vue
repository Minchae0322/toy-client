<template>
  <div class="section-card">
    <div class="badge-section-header">
      <h3 class="section-title">뱃지 컬렉션</h3>
      <span class="badge-count">{{ earned.length }} / {{ totalCount }}</span>
    </div>

    <!-- 획득한 뱃지 -->
    <div v-if="earned.length > 0" class="badge-group">
      <h4 class="badge-group-title">획득한 뱃지</h4>
      <div class="badge-grid">
        <div
          v-for="badge in earned"
          :key="badge.id"
          class="badge-card earned"
          :style="{ borderColor: badge.color + '40' }"
          @click="$emit('select', badge)"
        >
          <div class="badge-emoji-wrap" :style="{ background: badge.color + '15' }">
            <span class="badge-emoji">{{ badge.emoji }}</span>
            <span v-if="badge.count > 1" class="badge-stack">x{{ badge.count }}</span>
          </div>
          <span class="badge-name">{{ badge.name }}</span>
          <span class="badge-date">{{ formatDate(badge.earnedAt) }}</span>
        </div>
      </div>
    </div>

    <!-- 미획득 뱃지 -->
    <div v-if="unearned.length > 0" class="badge-group">
      <h4 class="badge-group-title">도전 중인 뱃지</h4>
      <div class="badge-grid">
        <div
          v-for="badge in unearned"
          :key="badge.id"
          class="badge-card locked"
          @click="$emit('select', badge)"
        >
          <div class="badge-emoji-wrap locked-bg">
            <span class="badge-emoji grayscale">{{ badge.emoji }}</span>
          </div>
          <span class="badge-name">{{ badge.name }}</span>
          <div v-if="badge.progress" class="badge-progress">
            <div class="badge-progress-bar">
              <div
                class="badge-progress-fill"
                :style="{ width: (badge.progress.current / badge.progress.target * 100) + '%' }"
              ></div>
            </div>
            <span class="badge-progress-text">{{ badge.progress.current }}/{{ badge.progress.target }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  earned: { type: Array, required: true },
  unearned: { type: Array, required: true },
  totalCount: { type: Number, required: true },
})

defineEmits(['select'])

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.section-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-title { font-size: 16px; font-weight: 700; color: #222; margin-bottom: 16px; }

.badge-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge-count { font-size: 14px; font-weight: 700; color: #9333ea; }

.badge-group { margin-top: 16px; }

.badge-group-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748B;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

@media (min-width: 500px) { .badge-grid { grid-template-columns: repeat(4, 1fr); } }

.badge-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 8px 10px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
}

.badge-card.earned { background: white; }
.badge-card.earned:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.badge-card.locked { background: #f9fafb; border-color: #e5e7eb; }
.badge-card.locked:hover { background: #f3f4f6; }

.badge-emoji-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  position: relative;
}

.badge-emoji-wrap.locked-bg { background: #f3f4f6; }
.badge-emoji { font-size: 22px; line-height: 1; }
.badge-emoji.grayscale { filter: grayscale(1); opacity: 0.4; }

.badge-stack {
  position: absolute;
  top: -4px;
  right: -6px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 8px;
  min-width: 20px;
  text-align: center;
}

.badge-name { font-size: 11px; font-weight: 600; color: #222; text-align: center; }
.badge-card.locked .badge-name { color: #9ca3af; }
.badge-date { font-size: 10px; color: #64748B; margin-top: 2px; }

.badge-progress { width: 100%; margin-top: 6px; }

.badge-progress-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.badge-progress-fill {
  height: 100%;
  background: #9333ea;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.badge-progress-text {
  display: block;
  text-align: center;
  font-size: 10px;
  color: #64748B;
  margin-top: 2px;
}
</style>
