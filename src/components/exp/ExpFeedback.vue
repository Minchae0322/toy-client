<template>
  <Teleport to="body">
    <div class="exp-burst-layer" aria-hidden="true">
      <TransitionGroup name="exp-burst" tag="div" class="exp-burst-stack">
        <div v-for="b in bursts" :key="b.id" class="exp-burst">
          <Sparkles :size="16" stroke-width="2.4" class="exp-burst-icon" />
          <span class="exp-burst-amount">+{{ b.amount }}</span>
          <span class="exp-burst-label">EXP</span>
        </div>
      </TransitionGroup>
    </div>

    <div class="exp-pill-layer" role="status" aria-live="polite">
      <TransitionGroup name="exp-pill" tag="div" class="exp-pill-stack">
        <div
          v-for="p in pills"
          :key="p.id"
          class="exp-pill"
          :class="`exp-pill-${p.variant}`"
        >
          <component :is="iconFor(p)" :size="16" stroke-width="2.4" class="exp-pill-icon" />
          <span class="exp-pill-text">{{ textFor(p) }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { Sparkles, AlertCircle } from 'lucide-vue-next'
import { useExpToast } from '@/composables/useExpToast'

const { bursts, pills } = useExpToast()

function iconFor(p) {
  return p.variant === 'cap-only' ? AlertCircle : Sparkles
}

function textFor(p) {
  if (p.variant === 'cap-only') return '오늘 EXP 한도에 도달했어요'
  if (p.variant === 'capped-hit') return `+${p.amount} EXP · 오늘 한도 도달`
  return `+${p.amount} EXP 획득!`
}
</script>

<style scoped>
.exp-burst-layer {
  position: fixed;
  left: 50%;
  bottom: 32%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 9999;
}

.exp-burst-stack {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.exp-burst {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--bg-elevated);
  border: 1.5px solid var(--c-brand);
  border-radius: 100px;
  box-shadow: var(--shadow-lg);
  color: var(--text-primary);
  font-weight: 800;
  letter-spacing: -0.3px;
  font-variant-numeric: tabular-nums;
}

.exp-burst-icon {
  color: var(--c-brand);
}

.exp-burst-amount {
  font-size: 17px;
  color: var(--c-brand);
}

.exp-burst-label {
  font-size: 12px;
  color: var(--c-text-500);
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* 위로 떠오르며 페이드. elastic 느낌은 toast 쪽이 담당, burst는 감량된 부드러운 rise */
.exp-burst-enter-active {
  transition:
    transform 0.9s cubic-bezier(0.22, 0.61, 0.36, 1),
    opacity 0.35s ease-out;
}
.exp-burst-leave-active {
  transition:
    transform 0.5s cubic-bezier(0.4, 0, 1, 1),
    opacity 0.5s ease-in;
}
.exp-burst-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.92);
}
.exp-burst-enter-to {
  opacity: 1;
  transform: translateY(-28px) scale(1);
}
.exp-burst-leave-from {
  opacity: 1;
  transform: translateY(-28px) scale(1);
}
.exp-burst-leave-to {
  opacity: 0;
  transform: translateY(-52px) scale(0.95);
}

/* ===== Pill 토스트 (design system 4.5) ===== */
.exp-pill-layer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(160px + env(safe-area-inset-bottom));
  z-index: 9998;
  pointer-events: none;
  display: flex;
  justify-content: center;
}

@media (min-width: 768px) {
  .exp-pill-layer {
    bottom: 40px;
  }
}

.exp-pill-stack {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 10px;
  width: fit-content;
  max-width: calc(100vw - 32px);
}

.exp-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 100px;
  background: rgba(25, 31, 40, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #FFFFFF;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.2px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.22);
  pointer-events: auto;
}

/* 다크 모드 — 페이지가 어두우니 토스트는 살짝 밝은 톤으로 떠 보이게 + 보더로 분리감 */
:root[data-theme="dark"] .exp-pill {
  background: rgba(70, 78, 95, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
}

.exp-pill-icon {
  flex-shrink: 0;
}

.exp-pill-gain .exp-pill-icon {
  color: #FACC15;
}

.exp-pill-capped-hit {
  background: rgba(234, 179, 8, 0.96);
  color: #0A0E1A;
}
.exp-pill-capped-hit .exp-pill-icon {
  color: #0A0E1A;
}

.exp-pill-cap-only {
  background: rgba(234, 179, 8, 0.96);
  color: #0A0E1A;
}
.exp-pill-cap-only .exp-pill-icon {
  color: #0A0E1A;
}

/* 다크 모드에서 cap toast — 노란 배경 유지하되 그림자 강화 */
:root[data-theme="dark"] .exp-pill-capped-hit,
:root[data-theme="dark"] .exp-pill-cap-only {
  background: rgba(250, 204, 21, 0.96);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
}

.exp-pill-enter-active {
  transition:
    transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    opacity 0.3s ease-out;
}
.exp-pill-leave-active {
  transition:
    transform 0.3s ease-in,
    opacity 0.3s ease-in;
}
.exp-pill-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}
.exp-pill-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.exp-pill-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.exp-pill-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (prefers-reduced-motion: reduce) {
  .exp-burst-enter-active,
  .exp-burst-leave-active,
  .exp-pill-enter-active,
  .exp-pill-leave-active {
    transition: opacity 0.2s ease;
  }
  .exp-burst-enter-from,
  .exp-burst-enter-to,
  .exp-burst-leave-to,
  .exp-pill-enter-from,
  .exp-pill-leave-to {
    transform: none;
  }
}
</style>
