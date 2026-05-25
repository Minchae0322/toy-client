<template>
  <div class="dash-summary">
    <div class="dash-summary-left">
      <h1 class="dash-greeting">트렌드 <span class="dash-greeting-accent">한눈에</span></h1>
      <p class="dash-greeting-sub">{{ topTrendName }} 외 실시간 인기 데이터</p>
    </div>
    <router-link :to="{ name: 'FeedHome' }" class="dash-trend-banner" aria-label="실시간 트렌드 보러가기">
      <div class="dash-trend-content">
        <div class="dash-trend-text">
          <span class="dash-trend-tag">
            <span class="dash-trend-tag-dot"></span>
            REAL-TIME
          </span>
          <p class="dash-trend-head">
            매일 갱신되는<br />
            <span class="dash-trend-head-accent">진짜 트렌드 큐레이션</span>
          </p>
          <p class="dash-trend-sub">광고·협찬 없이, 산 사람의 투표로</p>
        </div>

        <div class="dash-trend-art" aria-hidden="true">
          <svg viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <!-- 차트 카드 배경 -->
            <rect x="8" y="14" width="224" height="112" rx="16" fill="#FAF5FF"/>

            <!-- 베이스라인 grid -->
            <line x1="24" y1="98" x2="216" y2="98" stroke="#E9D5FF" stroke-width="1" stroke-dasharray="3 4"/>

            <!-- 트렌드 라인 (상승) -->
            <path
              d="M 28 92 L 60 80 L 92 86 L 124 62 L 156 54 L 188 38 L 212 30"
              fill="none"
              stroke="#9333EA"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- 라인 위 도트 -->
            <circle cx="60" cy="80" r="3.5" fill="#FFFFFF" stroke="#9333EA" stroke-width="2"/>
            <circle cx="124" cy="62" r="3.5" fill="#FFFFFF" stroke="#9333EA" stroke-width="2"/>
            <circle cx="188" cy="38" r="4.5" fill="#9333EA" stroke="#FFFFFF" stroke-width="2"/>

            <!-- 끝 도트 강조 ring -->
            <circle cx="188" cy="38" r="9" fill="none" stroke="#9333EA" stroke-width="1.5" opacity="0.25"/>

            <!-- 막대 (트렌드 카테고리) -->
            <g transform="translate(28, 104)">
              <rect x="0" y="0" width="18" height="14" rx="3" fill="#E9D5FF"/>
              <rect x="26" y="-4" width="18" height="18" rx="3" fill="#C4B5FD"/>
              <rect x="52" y="-10" width="18" height="24" rx="3" fill="#9333EA"/>
            </g>

            <!-- 상승 화살표 칩 -->
            <g transform="translate(176, 22)">
              <rect x="-28" y="-12" width="56" height="22" rx="11" fill="#FFFFFF" stroke="#E9D5FF" stroke-width="1.2"/>
              <path d="M-14 4 L-8 -2 L-3 1 L4 -6" stroke="#9333EA" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M0 -6 L4 -6 L4 -2" stroke="#9333EA" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <text x="12" y="3" font-size="9" font-weight="800" fill="#9333EA" font-family="SUIT, sans-serif">HOT</text>
            </g>
          </svg>
        </div>
      </div>
      <span class="dash-trend-cta">
        둘러보기
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </span>
    </router-link>
  </div>
</template>

<script setup>
defineProps({
  topTrendName: { type: String, default: '트렌드' }
})
</script>

<style scoped>
.dash-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.75rem 0 1.25rem;
  gap: 1.25rem;
}

.dash-summary-left {
  min-width: 0;
}

.dash-greeting {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.25;
}

.dash-greeting-accent {
  color: var(--c-brand);
}

.dash-greeting-sub {
  font-size: 0.8125rem;
  color: var(--c-text-400);
  margin: 0.375rem 0 0;
  font-weight: 400;
  letter-spacing: -0.01em;
}

.dash-trend-banner {
  display: block;
  background: #FFFFFF;
  border: 1px solid var(--border-default);
  border-radius: 16px;
  flex: 1;
  text-decoration: none;
  overflow: hidden;
  position: relative;
  min-height: 132px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
}

.dash-trend-banner:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(147, 51, 234, 0.08);
  border-color: #E9D5FF;
}

.dash-trend-banner:active {
  transform: scale(0.995);
}

.dash-trend-content {
  display: flex;
  align-items: stretch;
  gap: 1rem;
  padding: 1.125rem 1.25rem;
  height: 100%;
}

.dash-trend-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.4375rem;
  min-width: 0;
  flex: 1;
}

.dash-trend-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  padding: 4px 9px 4px 7px;
  border-radius: 100px;
  background: var(--c-brand-soft);
  font-size: 10px;
  font-weight: 800;
  color: var(--c-brand);
  letter-spacing: 0.06em;
}

.dash-trend-tag-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--c-brand);
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
  animation: dot-pulse 1.6s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.85); opacity: 0.7; }
}

.dash-trend-head {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.25;
  margin: 0;
  color: var(--text-primary);
}

.dash-trend-head-accent {
  color: var(--c-brand);
}

.dash-trend-sub {
  font-size: 0.75rem;
  color: var(--c-text-400);
  font-weight: 500;
  margin: 0;
  letter-spacing: -0.005em;
}

.dash-trend-art {
  flex-shrink: 0;
  width: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dash-trend-art svg {
  width: 100%;
  height: auto;
  display: block;
}

.dash-trend-cta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 700;
  color: var(--c-brand);
  white-space: nowrap;
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 1;
  background: var(--c-brand-soft);
  border: none;
  border-radius: 100px;
  padding: 0.375rem 0.75rem;
}

@media (max-width: 1024px) {
  .dash-trend-art {
    width: 180px;
  }
}

@media (max-width: 767px) {
  .dash-summary {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem 0 0.75rem;
    gap: 0.75rem;
  }
  .dash-greeting {
    font-size: 1.25rem;
  }
  .dash-summary-left {
    align-self: flex-start;
  }
  .dash-trend-banner {
    width: 100%;
    min-height: 124px;
    -webkit-user-select: none;
    user-select: none;
  }
  .dash-trend-content {
    padding: 1rem;
    gap: 0.625rem;
  }
  .dash-trend-head {
    font-size: 1rem;
  }
  .dash-trend-art {
    width: 120px;
  }
}

@media (max-width: 420px) {
  .dash-trend-art {
    display: none;
  }
}

@media (min-width: 768px) {
  .dash-greeting { font-size: 1.75rem; }
}

@media (hover: none) {
  .dash-trend-banner:hover {
    transform: none;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
    border-color: var(--border-default);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dash-trend-tag-dot { animation: none; }
}
</style>
