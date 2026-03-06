<template>
  <div v-if="badge" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <div
          class="modal-badge-emoji"
          :style="{ background: (badge.color || '#9ca3af') + '15' }"
        >
          <span :class="{ grayscale: !badge.earnedAt }">{{ badge.emoji }}</span>
          <span v-if="badge.count > 1" class="modal-badge-stack">x{{ badge.count }}</span>
        </div>
        <button class="modal-close" @click="$emit('close')">&times;</button>
      </div>

      <h3 class="modal-badge-name">{{ badge.name }}</h3>
      <span class="modal-badge-type" :class="badge.type">
        {{ badge.type === 'basic' ? '기본 뱃지' : '특별 뱃지' }}
      </span>
      <p class="modal-description">{{ badge.description }}</p>

      <div class="modal-info-row">
        <span class="modal-info-label">획득 조건</span>
        <span class="modal-info-value">{{ badge.condition }}</span>
      </div>
      <div class="modal-info-row">
        <span class="modal-info-label">효과</span>
        <span class="modal-info-value">{{ badge.effect }}</span>
      </div>

      <div v-if="badge.earnedAt" class="modal-earned">
        {{ formatDate(badge.earnedAt) }} 획득
      </div>
      <div v-else-if="badge.progress" class="modal-progress-detail">
        <div class="modal-progress-header">
          <span>진행도</span>
          <span>{{ badge.progress.current }} / {{ badge.progress.target }}</span>
        </div>
        <div class="progress-bar large">
          <div
            class="progress-fill"
            :style="{ width: (badge.progress.current / badge.progress.target * 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  badge: { type: Object, default: null },
})

defineEmits(['close'])

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 360px;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.modal-badge-emoji {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  position: relative;
}

.modal-badge-stack {
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

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #64748B;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-badge-name { font-size: 18px; font-weight: 700; color: #222; margin-bottom: 4px; }

.modal-badge-type {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.modal-badge-type.basic { background: #eff6ff; color: #3b82f6; }
.modal-badge-type.special { background: #faf5ff; color: #9333ea; }

.modal-description { font-size: 13px; color: #64748B; line-height: 1.6; margin-bottom: 16px; }

.modal-info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
  border-top: 1px solid #f3f4f6;
  gap: 8px;
}

.modal-info-label { font-size: 12px; font-weight: 600; color: #64748B; white-space: nowrap; flex-shrink: 0; }
.modal-info-value { font-size: 13px; color: #222; text-align: right; }

.modal-earned {
  text-align: center;
  padding: 12px;
  margin-top: 12px;
  background: #f0fdf4;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #16a34a;
}

.modal-progress-detail {
  margin-top: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
}

.modal-progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: #64748B;
  margin-bottom: 8px;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #9333ea;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.grayscale { filter: grayscale(1); opacity: 0.4; }
</style>
