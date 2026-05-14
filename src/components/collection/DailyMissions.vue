<template>
  <div class="section-card">
    <div v-if="missions.length === 0" class="empty">오늘의 미션이 없습니다.</div>

    <ul v-else class="mission-list">
      <li
        v-for="m in missions"
        :key="m.missionId"
        class="mission-row"
        :class="{
          claimed: m.status === 'CLAIMED',
          completed: m.status === 'COMPLETED',
        }"
      >
        <span class="diff-dot" :class="`diff-${m.difficulty.toLowerCase()}`"></span>

        <div class="row-main">
          <div class="row-head">
            <span class="mission-title">{{ m.title }}</span>
            <span class="mission-exp">+{{ m.exp }} EXP</span>
          </div>

          <div class="row-progress">
            <div class="progress-track">
              <div
                class="progress-fill"
                :class="`diff-${m.difficulty.toLowerCase()}-bg`"
                :style="{ width: progressPercent(m) + '%' }"
              ></div>
            </div>
            <span class="progress-count">{{ m.currentCount }}/{{ m.targetCount }}</span>
          </div>

          <div v-if="hintText(m)" class="row-hint">{{ hintText(m) }}</div>
        </div>

        <div class="row-action">
          <template v-if="m.status === 'COMPLETED'">
            <button
              class="claim-btn"
              :disabled="claimingId === m.missionId"
              @click="handleClaim(m)"
            >
              {{ claimingId === m.missionId ? '처리 중' : '보상 받기' }}
            </button>
          </template>
          <template v-else-if="m.status === 'CLAIMED'">
            <span class="status-tag done">
              <CheckCircle2 :size="13" :stroke-width="2.5" />
              완료
            </span>
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CheckCircle2 } from '@/utils/collectionIcons.js'

const props = defineProps({
  missions: { type: Array, required: true },
})

const emit = defineEmits(['claim'])

const claimingId = ref(null)

function progressPercent(m) {
  if (!m.targetCount) return 0
  return Math.min(Math.round((m.currentCount / m.targetCount) * 100), 100)
}

function hintText(m) {
  if (m.status !== 'IN_PROGRESS') return null
  const remaining = m.targetCount - m.currentCount
  const pct = progressPercent(m)
  if (pct >= 80) return `${remaining}개만 더 하면 완료!`
  if (pct >= 50) return '절반 넘게 왔어요'
  return null
}

async function handleClaim(m) {
  claimingId.value = m.missionId
  setTimeout(() => {
    emit('claim', m)
    claimingId.value = null
  }, 400)
}
</script>

<style scoped>
.section-card {
  padding: 4px 20px;
  background: var(--bg-elevated);
  border-radius: 4px;
}

@media (min-width: 768px) { .section-card { padding: 8px 24px; } }

.empty { padding: 40px 0; text-align: center; font-size: 14px; color: var(--c-text-400); }

.mission-list { list-style: none; padding: 0; margin: 0; }

.mission-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 0;
  border-top: 1px solid var(--border-default);
  transition: opacity 0.2s;
}

@media (min-width: 768px) { .mission-row { gap: 16px; padding: 18px 0; } }

.mission-row:first-child { border-top: none; }
.mission-row.claimed { opacity: 0.5; }

.mission-row.completed {
  background: #B4FF39;
  padding: 16px 14px;
  margin: 4px -14px;
  border-radius: 4px;
  border-top-color: transparent;
}

.mission-row.completed + .mission-row { border-top-color: transparent; }

.diff-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 8px;
}

.diff-dot.diff-easy { background: var(--c-success); }
.diff-dot.diff-normal { background: var(--c-warning); }
.diff-dot.diff-hard { background: var(--c-danger); }

.row-main { flex: 1; min-width: 0; }

.row-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}

.mission-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.2px;
  line-height: 1.35;
}

.mission-exp {
  font-size: 13px;
  font-weight: 800;
  color: var(--c-brand);
  flex-shrink: 0;
  letter-spacing: -0.2px;
}

.row-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-track {
  flex: 1;
  height: 5px;
  background: var(--border-default);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.diff-easy-bg { background: var(--c-success); }
.diff-normal-bg { background: var(--c-warning); }
.diff-hard-bg { background: var(--c-danger); }

.progress-count {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--c-text-500);
  min-width: 40px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.row-hint {
  font-size: 11.5px;
  color: var(--c-brand);
  font-weight: 700;
  margin-top: 8px;
  letter-spacing: -0.1px;
}

.row-action {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-width: 80px;
  justify-content: flex-end;
}

.status-tag {
  font-size: 11.5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 5px 10px;
  border-radius: 7px;
  background: var(--c-success-soft);
  color: var(--c-success);
}

.claim-btn {
  padding: 8px 14px;
  border: 2px solid var(--c-ink-900);
  border-radius: 4px;
  background: var(--c-ink-900);
  color: #B4FF39;
  font-size: 12px;
  font-weight: 900;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  box-shadow: 2px 2px 0 var(--bg-elevated);
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}

.claim-btn:hover:not(:disabled) { transform: translate(-1px, -1px); box-shadow: 3px 3px 0 var(--bg-elevated); }
.claim-btn:active:not(:disabled) { transform: translate(1px, 1px); box-shadow: 0 0 0 var(--bg-elevated); }

.claim-btn:disabled { background: var(--c-text-300); border-color: var(--c-text-300); color: white; cursor: not-allowed; box-shadow: none; }
</style>
