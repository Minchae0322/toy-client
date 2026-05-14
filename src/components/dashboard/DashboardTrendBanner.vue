<template>
  <div class="dash-summary">
    <div class="dash-summary-left">
      <h1 class="dash-greeting">트렌드 <span class="dash-greeting-accent">한눈에</span></h1>
      <p class="dash-greeting-sub">{{ topTrendName }} 외 실시간 인기 데이터</p>
    </div>
    <router-link :to="{ name: 'FeedHome' }" class="dash-trend-banner">
      <svg class="dash-trend-img" viewBox="0 0 720 160" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <rect width="720" height="160" fill="#FFFFFF"/>
        <rect x="448" y="0" width="272" height="160" fill="#0A0E1A"/>

        <g transform="translate(40, 22)">
          <rect x="0" y="0" width="118" height="26" rx="4" fill="#0A0E1A"/>
          <text x="59" y="17.5" font-size="12" font-weight="900" fill="#B4FF39" text-anchor="middle" letter-spacing="1.4" font-family="SUIT, sans-serif">GRAND OPEN</text>
        </g>

        <text x="40" y="92" font-size="32" font-weight="900" fill="#0A0E1A" letter-spacing="-1.5" font-family="SUIT, sans-serif">매일 갱신되는</text>
        <text x="40" y="124" font-size="32" font-weight="900" fill="#7C3AED" letter-spacing="-1.5" font-family="SUIT, sans-serif">진짜 트렌드 큐레이션</text>

        <text x="40" y="146" font-size="11" font-weight="700" fill="#71717A" letter-spacing="-0.1" font-family="SUIT, sans-serif">광고·협찬 없이, 산 사람의 투표로</text>

        <g transform="translate(490, 0)">
          <text x="0" y="50" font-size="10" font-weight="800" fill="#B4FF39" letter-spacing="2.6" font-family="SUIT, sans-serif">YOGURT REVIEW</text>

          <text x="0" y="100" font-size="44" font-weight="900" fill="#FFFFFF" letter-spacing="-2.2" font-family="SUIT, sans-serif">요거뜨</text>
          <circle cx="138" cy="96" r="5" fill="#B4FF39"/>

          <rect x="0" y="116" width="32" height="3" rx="1" fill="#B4FF39"/>
          <text x="0" y="138" font-size="10" font-weight="600" fill="#A1A1AA" letter-spacing="0.4" font-family="SUIT, sans-serif">since 2026 · GRAND OPEN</text>
        </g>
      </svg>
      <span class="dash-trend-cta">둘러보기 →</span>
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
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  flex: 1;
  text-decoration: none;
  overflow: hidden;
  position: relative;
  min-height: 100px;
}

.dash-trend-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.dash-trend-cta {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 1;
  background: rgba(255, 255, 255, 0.85);
  border: none;
  border-radius: 20px;
  padding: 0.375rem 0.875rem;
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
    min-height: 120px;
  }
  .dash-trend-banner {
    -webkit-user-select: none;
    user-select: none;
  }
}

@media (min-width: 768px) {
  .dash-greeting { font-size: 1.75rem; }
}
</style>
