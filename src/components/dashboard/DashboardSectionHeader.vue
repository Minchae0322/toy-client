<template>
  <header class="ds-header">
    <div class="ds-header-main">
      <component
        :is="to ? 'router-link' : 'div'"
        :to="to"
        class="ds-title-row"
      >
        <h2 class="ds-title">
          <span v-if="prefix" class="ds-prefix">{{ prefix }}</span>
          <span v-if="accent" class="ds-accent">{{ accent }}</span>
          <span v-if="suffix" class="ds-suffix">{{ suffix }}</span>
        </h2>
      </component>
      <p v-if="sub" class="ds-sub">{{ sub }}</p>
    </div>
    <router-link v-if="to" :to="to" class="ds-arrow" :aria-label="'더보기'">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </router-link>
  </header>
</template>

<script setup>
defineProps({
  prefix: { type: String, default: '' },
  accent: { type: String, default: '' },
  suffix: { type: String, default: '' },
  sub: { type: String, default: '' },
  to: { type: [String, Object], default: null }
})
</script>

<style scoped>
.ds-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding: 0;
  min-height: 34px;
}

.ds-header-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ds-title-row {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  -webkit-tap-highlight-color: transparent;
  min-width: 0;
}

/* 모든 섹션 헤더가 동일 크기·동일 무게·한 줄 — 화면 폭 따라 단계별 스케일 */
.ds-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  max-width: 100%;
}

.ds-title > span {
  display: inline;
}

.ds-prefix,
.ds-suffix {
  color: inherit;
}

.ds-prefix + .ds-accent,
.ds-accent + .ds-suffix {
  margin-left: 5px;
}

.ds-accent {
  color: var(--c-brand);
}

.ds-sub {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-400);
  margin: 0;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.ds-arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-subtle);
  color: var(--c-text-500);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.ds-arrow:hover {
  background: var(--border-strong, #E5E7EB);
  color: var(--text-primary);
}

.ds-arrow:active {
  transform: scale(0.95);
}

@media (min-width: 768px) {
  .ds-header { margin-bottom: 16px; }
  .ds-title { font-size: 19px; }
  .ds-sub { font-size: 13.5px; }
}

@media (min-width: 1280px) {
  .ds-title { font-size: 20px; }
  .ds-arrow { width: 38px; height: 38px; }
}

@media (max-width: 480px) {
  .ds-header { margin-bottom: 11px; }
  .ds-title { font-size: 16px; }
  .ds-sub { font-size: 12.5px; }
  .ds-arrow { width: 32px; height: 32px; }
  .ds-arrow svg { width: 14px; height: 14px; }
}
</style>
