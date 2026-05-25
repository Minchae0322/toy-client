<template>
  <div
    class="hero-carousel"
    @mouseenter="pause"
    @mouseleave="resume"
    @touchstart.passive="onTouchStart"
    @touchmove.passive="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="hero-track" :style="trackStyle">
      <router-link
        v-for="(slide, idx) in slides"
        :key="slide.key"
        :to="slide.to"
        class="hero-slide"
        :class="['theme-' + slide.key]"
        :aria-hidden="idx !== activeIndex"
        :tabindex="idx === activeIndex ? 0 : -1"
        :aria-label="slide.aria"
      >
        <div class="slide-content">
          <div class="slide-text">
            <span class="slide-tag">
              <span class="tag-dot"></span>
              {{ slide.tag }}
            </span>
            <h2 class="slide-title" v-html="slide.title"></h2>
            <p class="slide-sub">{{ slide.sub }}</p>
            <span class="slide-cta">
              {{ slide.cta }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </span>
          </div>
          <div class="slide-art" aria-hidden="true">
            <!-- 요거픽: 두 카드 VS 구도 -->
            <svg v-if="slide.key === 'yogurpick'" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
              <g transform="translate(28, 36)">
                <rect width="76" height="108" rx="14" fill="#FFFFFF" opacity="0.95"/>
                <circle cx="38" cy="36" r="20" fill="#B4FF39" opacity="0.35"/>
                <rect x="14" y="68" width="48" height="6" rx="3" fill="#0A0E1A" opacity="0.55"/>
                <rect x="14" y="80" width="32" height="5" rx="2.5" fill="#0A0E1A" opacity="0.25"/>
                <rect x="14" y="92" width="48" height="5" rx="2.5" fill="#0A0E1A" opacity="0.1"/>
                <rect x="14" y="92" width="36" height="5" rx="2.5" fill="#B4FF39"/>
              </g>
              <g transform="translate(132, 30) rotate(6)">
                <rect width="76" height="108" rx="14" fill="#FFFFFF" opacity="0.85"/>
                <circle cx="38" cy="36" r="20" fill="#FFFFFF" opacity="0.3"/>
                <rect x="14" y="68" width="48" height="6" rx="3" fill="#0A0E1A" opacity="0.45"/>
                <rect x="14" y="80" width="32" height="5" rx="2.5" fill="#0A0E1A" opacity="0.2"/>
                <rect x="14" y="92" width="48" height="5" rx="2.5" fill="#0A0E1A" opacity="0.1"/>
                <rect x="14" y="92" width="18" height="5" rx="2.5" fill="#FFFFFF" opacity="0.6"/>
              </g>
              <g transform="translate(124, 88)">
                <circle r="22" fill="#B4FF39"/>
                <text y="6" font-size="15" font-weight="800" fill="#0A0E1A" text-anchor="middle" font-family="SUIT, sans-serif" letter-spacing="0.5">VS</text>
              </g>
            </svg>

            <!-- 핫피드: 말풍선 + 좋아요 -->
            <svg v-else-if="slide.key === 'hotfeed'" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
              <g transform="translate(20, 26)">
                <rect width="120" height="68" rx="18" fill="#FFFFFF"/>
                <circle cx="20" cy="22" r="10" fill="#FFB4A2"/>
                <rect x="36" y="14" width="60" height="5" rx="2.5" fill="#0F172A" opacity="0.7"/>
                <rect x="36" y="24" width="38" height="4" rx="2" fill="#0F172A" opacity="0.35"/>
                <rect x="14" y="42" width="92" height="4" rx="2" fill="#0F172A" opacity="0.18"/>
                <rect x="14" y="52" width="74" height="4" rx="2" fill="#0F172A" opacity="0.18"/>
                <path d="M14 68 L20 78 L26 68 Z" fill="#FFFFFF"/>
              </g>
              <g transform="translate(108, 86)">
                <rect width="110" height="62" rx="18" fill="#FFFFFF" opacity="0.92"/>
                <circle cx="20" cy="22" r="10" fill="#A78BFA"/>
                <rect x="36" y="14" width="50" height="5" rx="2.5" fill="#0F172A" opacity="0.7"/>
                <rect x="36" y="24" width="32" height="4" rx="2" fill="#0F172A" opacity="0.35"/>
                <rect x="14" y="42" width="82" height="4" rx="2" fill="#0F172A" opacity="0.18"/>
                <path d="M96 62 L96 72 L86 62 Z" fill="#FFFFFF" opacity="0.92"/>
              </g>
              <g transform="translate(178, 30)">
                <circle r="18" fill="#FFFFFF"/>
                <path d="M-7 -2 C-7 -7 -2 -8 0 -3 C2 -8 7 -7 7 -2 C7 4 0 8 0 8 C0 8 -7 4 -7 -2 Z" fill="#FF4D6D"/>
              </g>
            </svg>

            <!-- 캐꾸: 캐리어 + 스티커 -->
            <svg v-else-if="slide.key === 'carrier'" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
              <g transform="translate(64, 26)">
                <!-- 캐리어 손잡이 -->
                <rect x="40" y="0" width="30" height="14" rx="6" fill="#0F172A" opacity="0.35"/>
                <rect x="46" y="6" width="18" height="14" rx="3" fill="#0F172A" opacity="0.55"/>
                <!-- 캐리어 본체 -->
                <rect x="0" y="14" width="110" height="130" rx="16" fill="#FFFFFF"/>
                <rect x="0" y="14" width="110" height="130" rx="16" fill="none" stroke="#0F172A" stroke-width="2" opacity="0.18"/>
                <!-- 가운데 분리선 -->
                <line x1="55" y1="22" x2="55" y2="138" stroke="#0F172A" stroke-width="1.5" opacity="0.15" stroke-dasharray="3 4"/>
                <!-- 바퀴 -->
                <circle cx="14" cy="148" r="6" fill="#0F172A" opacity="0.45"/>
                <circle cx="96" cy="148" r="6" fill="#0F172A" opacity="0.45"/>
              </g>
              <!-- 스티커들 -->
              <g transform="translate(58, 56) rotate(-14)">
                <circle r="16" fill="#FFE066"/>
                <text y="5" font-size="14" font-weight="800" fill="#0F172A" text-anchor="middle" font-family="SUIT, sans-serif">★</text>
              </g>
              <g transform="translate(168, 84) rotate(10)">
                <rect x="-18" y="-12" width="36" height="24" rx="6" fill="#FF8FAB"/>
                <text y="4" font-size="9" font-weight="800" fill="#FFFFFF" text-anchor="middle" font-family="SUIT, sans-serif" letter-spacing="0.5">HEY</text>
              </g>
              <g transform="translate(110, 124) rotate(-6)">
                <circle r="14" fill="#74C0FC"/>
                <path d="M-5 -1 C-5 -5 -1 -6 0 -2 C1 -6 5 -5 5 -1 C5 3 0 6 0 6 C0 6 -5 3 -5 -1 Z" fill="#FFFFFF"/>
              </g>
            </svg>

            <!-- 핫아템: 불꽃 + 랭킹 차트 -->
            <svg v-else-if="slide.key === 'hotitem'" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
              <!-- 랭킹 막대 -->
              <g transform="translate(24, 56)">
                <rect x="0" y="44" width="32" height="56" rx="6" fill="#FFFFFF" opacity="0.45"/>
                <rect x="40" y="24" width="32" height="76" rx="6" fill="#FFFFFF" opacity="0.7"/>
                <rect x="80" y="0" width="32" height="100" rx="6" fill="#FFFFFF"/>
                <text x="16" y="92" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle" font-family="SUIT, sans-serif" opacity="0.8">3</text>
                <text x="56" y="92" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle" font-family="SUIT, sans-serif" opacity="0.9">2</text>
                <text x="96" y="92" font-size="16" font-weight="800" fill="#FF6B35" text-anchor="middle" font-family="SUIT, sans-serif">1</text>
              </g>
              <!-- 불꽃 (1위 위) -->
              <g transform="translate(120, 32)">
                <path d="M0 -18 C8 -10 12 -2 12 6 C12 14 6 20 0 20 C-6 20 -12 14 -12 6 C-12 0 -8 -4 -4 -6 C-2 -2 0 -4 -2 -8 C-1 -12 0 -16 0 -18 Z" fill="#FFD60A"/>
                <path d="M0 -10 C4 -4 6 0 6 6 C6 12 3 16 0 16 C-3 16 -6 12 -6 6 C-6 2 -4 0 -2 -2 C0 0 2 -2 0 -6 C0 -8 0 -10 0 -10 Z" fill="#FF6B35"/>
              </g>
              <!-- 상승 화살표 -->
              <g transform="translate(184, 82)">
                <rect x="-22" y="-13" width="44" height="26" rx="13" fill="#FFFFFF"/>
                <path d="M-12 4 L-6 -2 L-1 1 L8 -8" stroke="#FF4D00" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 -8 L8 -8 L8 -3" stroke="#FF4D00" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </g>
            </svg>
          </div>
        </div>
      </router-link>
    </div>

    <!-- 좌우 화살표 (데스크톱) -->
    <button class="nav-arrow nav-prev" type="button" @click.prevent="goPrev" aria-label="이전 배너">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <button class="nav-arrow nav-next" type="button" @click.prevent="goNext" aria-label="다음 배너">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>

    <!-- 인디케이터 -->
    <div class="hero-indicators" role="tablist" aria-label="배너 선택">
      <button
        v-for="(slide, idx) in slides"
        :key="slide.key"
        type="button"
        class="indicator"
        :class="{ active: idx === activeIndex }"
        :aria-selected="idx === activeIndex"
        :aria-label="slide.aria"
        @click.prevent="goTo(idx)"
      >
        <span class="indicator-bar">
          <span class="indicator-fill" :class="{ animate: idx === activeIndex && !paused }"></span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const slides = [
  {
    key: 'yogurpick',
    to: { name: 'BattleList' },
    tag: 'LIVE PICK',
    title: '오늘 뭐 먹지?<br /><span class="t-accent">픽</span>으로 같이 정해요',
    sub: '유저들이 직접 한 표 던지는 라이브 픽',
    cta: '요거픽 보러가기',
    aria: '요거픽 — 라이브 픽 둘러보기'
  },
  {
    key: 'hotfeed',
    to: { name: 'FeedHome' },
    tag: 'HOT FEED',
    title: '오늘 가장 뜨거운<br /><span class="t-accent">유저 리뷰</span>',
    sub: '진짜 먹어본 사람들의 생생한 후기',
    cta: '핫피드 보러가기',
    aria: '핫피드 — 인기 리뷰 둘러보기'
  },
  {
    key: 'carrier',
    to: { name: 'Carrier' },
    tag: 'MY STYLE',
    title: '내 캐리어,<br /><span class="t-accent">내 스타일</span>로 꾸미기',
    sub: '스티커·스킨으로 나만의 캐리어 완성',
    cta: '캐꾸 시작하기',
    aria: '캐꾸 — 캐리어 꾸미기'
  },
  {
    key: 'hotitem',
    to: { name: 'ProductRanking' },
    tag: 'TRENDING',
    title: '지금 가장 많이<br /><span class="t-accent">픽 된 아이템</span>',
    sub: '실시간 인기 랭킹 TOP 100',
    cta: '핫아템 보러가기',
    aria: '핫아템 — 실시간 랭킹 둘러보기'
  }
]

const activeIndex = ref(0)
const paused = ref(false)
const AUTO_MS = 5000
let timer = null

const trackStyle = computed(() => ({
  transform: `translateX(-${activeIndex.value * 100}%)`
}))

const goTo = (idx) => {
  activeIndex.value = (idx + slides.length) % slides.length
  restart()
}
const goNext = () => goTo(activeIndex.value + 1)
const goPrev = () => goTo(activeIndex.value - 1)

const start = () => {
  stop()
  timer = setInterval(() => {
    if (!paused.value) {
      activeIndex.value = (activeIndex.value + 1) % slides.length
    }
  }, AUTO_MS)
}
const stop = () => {
  if (timer) { clearInterval(timer); timer = null }
}
const restart = () => { start() }

const pause = () => { paused.value = true }
const resume = () => { paused.value = false }

// 터치 스와이프
const touchStartX = ref(0)
const touchDeltaX = ref(0)
const onTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
  touchDeltaX.value = 0
  pause()
}
const onTouchMove = (e) => {
  touchDeltaX.value = e.touches[0].clientX - touchStartX.value
}
const onTouchEnd = () => {
  const d = touchDeltaX.value
  if (Math.abs(d) > 40) {
    if (d < 0) goNext()
    else goPrev()
  }
  touchDeltaX.value = 0
  resume()
}

onMounted(() => { start() })
onBeforeUnmount(() => { stop() })
</script>

<style scoped>
.hero-carousel {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  margin: 1rem 0 1.125rem;
  min-height: 168px;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
}

.hero-track {
  display: flex;
  width: 100%;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.hero-slide {
  flex: 0 0 100%;
  min-width: 0;
  text-decoration: none;
  color: #fff;
  display: block;
  -webkit-tap-highlight-color: transparent;
}

.slide-content {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 1.625rem;
  min-height: 168px;
}

.slide-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.slide-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 4px 11px 4px 9px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
  animation: dot-pulse 1.6s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.85); opacity: 0.7; }
}

.slide-title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.22;
  margin: 0;
  color: #fff;
}

.slide-title :deep(.t-accent) {
  color: var(--slide-accent, #B4FF39);
}

.slide-sub {
  font-size: 0.8125rem;
  opacity: 0.85;
  line-height: 1.5;
  font-weight: 500;
  margin: 0;
}

.slide-cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  margin-top: 6px;
  padding: 7px 13px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.005em;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: background 0.2s;
}

.hero-slide:hover .slide-cta {
  background: rgba(255, 255, 255, 0.28);
}

.slide-art {
  flex-shrink: 0;
  width: 240px;
  max-width: 42%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-art svg {
  width: 100%;
  height: auto;
  display: block;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.18));
}

/* 슬라이드별 테마 */
.theme-yogurpick {
  background: #0A0E1A;
  --slide-accent: #B4FF39;
}
.theme-yogurpick .slide-tag {
  background: rgba(180, 255, 57, 0.18);
  color: #B4FF39;
}

.theme-hotfeed {
  background: #E11D48;
  --slide-accent: #FFE066;
}
.theme-hotfeed .slide-tag {
  background: rgba(255, 255, 255, 0.22);
}

.theme-carrier {
  background: #6C5CE7;
  --slide-accent: #FFE066;
}
.theme-carrier .slide-tag {
  background: rgba(255, 255, 255, 0.22);
}

.theme-hotitem {
  background: #FF6B35;
  --slide-accent: #FFD60A;
}
.theme-hotitem .slide-tag {
  background: rgba(255, 255, 255, 0.22);
}

/* 화살표 */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  border: none;
  color: #0A0E1A;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 4;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.hero-carousel:hover .nav-arrow {
  opacity: 1;
}

.nav-arrow:hover {
  background: #fff;
}

.nav-prev { left: 12px; }
.nav-next { right: 12px; }

@media (max-width: 767px) {
  .nav-arrow { display: none; }
}

/* 인디케이터 */
.hero-indicators {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 4;
}

.indicator {
  background: transparent;
  border: none;
  padding: 6px 0;
  cursor: pointer;
}

.indicator-bar {
  display: block;
  width: 26px;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  transition: width 0.3s, background 0.2s;
}

.indicator.active .indicator-bar {
  width: 38px;
  background: rgba(255, 255, 255, 0.4);
}

.indicator-fill {
  position: absolute;
  inset: 0;
  background: #fff;
  transform: translateX(-100%);
  transform-origin: left center;
}

.indicator-fill.animate {
  animation: fill 5s linear forwards;
}

@keyframes fill {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* 모바일 */
@media (max-width: 767px) {
  .hero-carousel {
    margin: 0.75rem 0 0.875rem;
    border-radius: 16px;
    min-height: 144px;
    -webkit-user-select: none;
    user-select: none;
  }
  .slide-content {
    padding: 1.125rem 1.125rem 1.75rem;
    min-height: 144px;
    gap: 0.625rem;
  }
  .slide-title {
    font-size: 1.1875rem;
    line-height: 1.25;
  }
  .slide-sub {
    font-size: 0.75rem;
  }
  .slide-cta {
    font-size: 11px;
    padding: 6px 11px;
  }
  .slide-art {
    width: 130px;
    max-width: 40%;
  }
  .hero-indicators {
    bottom: 10px;
  }
  .indicator-bar { width: 20px; }
  .indicator.active .indicator-bar { width: 30px; }
}

@media (min-width: 1280px) {
  .hero-carousel {
    min-height: 196px;
  }
  .slide-content {
    padding: 1.75rem 2rem;
    min-height: 196px;
  }
  .slide-title {
    font-size: 1.875rem;
  }
  .slide-sub {
    font-size: 0.9375rem;
  }
  .slide-art {
    width: 280px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-track {
    transition: none;
  }
  .tag-dot,
  .indicator-fill.animate {
    animation: none;
  }
}
</style>
