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
        <!-- 슬라이드별 실제 이미지 아트 -->
        <div class="slide-art" aria-hidden="true">
          <!-- 요거픽: 두 배틀 썸네일 VS 구도 -->
          <template v-if="slide.key === 'yogurpick'">
            <div class="vs-stack">
              <div class="vs-card vs-card-left">
                <img v-if="battleImages[0]" :src="battleImages[0]" alt="" @error="onImgError" />
                <div v-else class="img-fallback fallback-lime"></div>
              </div>
              <div class="vs-card vs-card-right">
                <img v-if="battleImages[1]" :src="battleImages[1]" alt="" @error="onImgError" />
                <div v-else class="img-fallback fallback-dark"></div>
              </div>
              <span class="vs-badge">VS</span>
            </div>
          </template>

          <!-- 핫피드: 피드 사진 3장 콜라주 -->
          <template v-else-if="slide.key === 'hotfeed'">
            <div class="collage-stack">
              <div class="collage-tile tile-back">
                <img v-if="feedImages[2]" :src="feedImages[2]" alt="" @error="onImgError" />
                <div v-else class="img-fallback fallback-rose"></div>
              </div>
              <div class="collage-tile tile-mid">
                <img v-if="feedImages[1]" :src="feedImages[1]" alt="" @error="onImgError" />
                <div v-else class="img-fallback fallback-rose"></div>
              </div>
              <div class="collage-tile tile-front">
                <img v-if="feedImages[0]" :src="feedImages[0]" alt="" @error="onImgError" />
                <div v-else class="img-fallback fallback-rose"></div>
              </div>
            </div>
          </template>

          <!-- 캐꾸: 실제 캐리어 스킨(핑크리본) + 스티커 -->
          <template v-else-if="slide.key === 'carrier'">
            <div class="carrier-stack">
              <svg class="carrier-svg" viewBox="0 0 300 400" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <defs>
                  <linearGradient id="hero-carrier-body" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="#fff8f9"/>
                  </linearGradient>
                </defs>
                <!-- 본체 -->
                <rect x="30" y="50" width="240" height="320" rx="20" fill="url(#hero-carrier-body)" stroke="#dc2626" stroke-width="3"/>
                <!-- 중앙 라이트 라인 -->
                <line x1="52" y1="122" x2="52" y2="289" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".3"/>
                <!-- 손잡이 -->
                <rect x="122" y="18" width="8" height="35" rx="3" fill="#fca5a5" stroke="#dc2626" stroke-width="1.5"/>
                <rect x="170" y="18" width="8" height="35" rx="3" fill="#fca5a5" stroke="#dc2626" stroke-width="1.5"/>
                <rect x="116" y="6" width="68" height="18" rx="9" fill="#fee2e2" stroke="#dc2626" stroke-width="2.5"/>
                <!-- 홈 그루브 -->
                <rect x="98" y="80" width="22" height="250" rx="11" fill="#fee2e2" stroke="#fca5a5" stroke-width="2"/>
                <rect x="139" y="80" width="22" height="250" rx="11" fill="#fee2e2" stroke="#fca5a5" stroke-width="2"/>
                <rect x="180" y="80" width="22" height="250" rx="11" fill="#fee2e2" stroke="#fca5a5" stroke-width="2"/>
                <!-- 큰 리본 -->
                <g transform="translate(220, 90)">
                  <path d="M-20 0C-20-15-4-15 0 0C4-15 20-15 20 0C20 15 4 15 0 0C-4 15-20 15-20 0Z" fill="#dc2626" stroke="#222" stroke-width="1.5"/>
                  <circle r="5" fill="#dc2626" stroke="#222" stroke-width="1.2"/>
                </g>
                <!-- 작은 하트 5개 -->
                <g transform="translate(75, 120)"><path d="M0 7C-2 5-9 1-9-4C-9-8-5-10 0-6C5-10 9-8 9-4C9 1 2 5 0 7Z" fill="#fca5a5" stroke="#f87171" stroke-width="1"/></g>
                <g transform="translate(180, 160)"><path d="M0 7C-2 5-9 1-9-4C-9-8-5-10 0-6C5-10 9-8 9-4C9 1 2 5 0 7Z" fill="#fca5a5" stroke="#f87171" stroke-width="1"/></g>
                <g transform="translate(95, 210)"><path d="M0 7C-2 5-9 1-9-4C-9-8-5-10 0-6C5-10 9-8 9-4C9 1 2 5 0 7Z" fill="#fca5a5" stroke="#f87171" stroke-width="1"/></g>
                <g transform="translate(220, 230)"><path d="M0 7C-2 5-9 1-9-4C-9-8-5-10 0-6C5-10 9-8 9-4C9 1 2 5 0 7Z" fill="#fca5a5" stroke="#f87171" stroke-width="1"/></g>
                <g transform="translate(140, 270)"><path d="M0 7C-2 5-9 1-9-4C-9-8-5-10 0-6C5-10 9-8 9-4C9 1 2 5 0 7Z" fill="#fca5a5" stroke="#f87171" stroke-width="1"/></g>
                <!-- 추가 이모지 스티커 (유저가 직접 붙인 느낌) -->
                <g transform="translate(120, 200)">
                  <circle r="18" fill="#FFFFFF" stroke="#FCD34D" stroke-width="2"/>
                  <text y="6" font-size="20" text-anchor="middle" font-family="sans-serif">🎀</text>
                </g>
                <g transform="translate(195, 295)">
                  <circle r="16" fill="#FFFFFF" stroke="#A78BFA" stroke-width="2"/>
                  <text y="5" font-size="18" text-anchor="middle" font-family="sans-serif">✨</text>
                </g>
                <!-- 바퀴 -->
                <rect x="62" y="365" width="16" height="8" rx="3" fill="#fca5a5" stroke="#dc2626" stroke-width="1.5"/>
                <circle cx="70" cy="382" r="10" fill="#fca5a5" stroke="#dc2626" stroke-width="2"/>
                <circle cx="70" cy="382" r="2" fill="#dc2626"/>
                <rect x="222" y="365" width="16" height="8" rx="3" fill="#fca5a5" stroke="#dc2626" stroke-width="1.5"/>
                <circle cx="230" cy="382" r="10" fill="#fca5a5" stroke="#dc2626" stroke-width="2"/>
                <circle cx="230" cy="382" r="2" fill="#dc2626"/>
              </svg>
            </div>
          </template>

          <!-- 핫아템: 1위 큰 카드 + 뒤에 2·3위 -->
          <template v-else-if="slide.key === 'hotitem'">
            <div class="rank-stack">
              <div class="rank-card rank-3">
                <img v-if="productImages[2]" :src="productImages[2]" alt="" @error="onImgError" />
                <div v-else class="img-fallback fallback-orange"></div>
                <span class="rank-num">3</span>
              </div>
              <div class="rank-card rank-2">
                <img v-if="productImages[1]" :src="productImages[1]" alt="" @error="onImgError" />
                <div v-else class="img-fallback fallback-orange"></div>
                <span class="rank-num">2</span>
              </div>
              <div class="rank-card rank-1">
                <img v-if="productImages[0]" :src="productImages[0]" alt="" @error="onImgError" />
                <div v-else class="img-fallback fallback-orange"></div>
                <span class="rank-num gold">1</span>
              </div>
            </div>
          </template>
        </div>

        <!-- 글로 가리는 그라데이션 + 텍스트 -->
        <div class="slide-veil"></div>
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
import { battleService } from '@/services/BattleService'
import { feedService } from '@/services/FeedService'
import { productService } from '@/services/ProductService'

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
const AUTO_MS = 3200
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
const stop = () => { if (timer) { clearInterval(timer); timer = null } }
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

// ===== 실제 이미지 로드 =====
const battleImages = ref([])
const feedImages = ref([])
const productImages = ref([])

const onImgError = (e) => {
  e.target.style.display = 'none'
}

const pickUrl = (...candidates) => {
  for (const c of candidates) {
    if (typeof c === 'string' && c.startsWith('http')) return c
  }
  return null
}

const loadAll = async () => {
  // 배틀 썸네일 (요거픽)
  try {
    const res = await battleService.getHotBattleList({ size: 4 })
    const list = res?.data?.content || res?.data || []
    const urls = []
    for (const b of list) {
      const u = pickUrl(b?.thumbnailDto?.fileUrl, b?.thumbnailUrl)
      if (u) urls.push(u)
      if (urls.length >= 2) break
    }
    // 1개만 있으면 다른 자리에 피드 사진 채워서 VS 구도 유지
    battleImages.value = urls
  } catch (e) { /* noop */ }

  // 핫피드 이미지
  try {
    const res = await feedService.getHotFeeds({ size: 6, sort: 'hotScore,desc' })
    const list = res?.data?.content || res?.data || []
    const urls = []
    for (const f of list) {
      const u = pickUrl(f?.hotFeedThumbnailDto?.fileUrl, f?.thumbnailDto?.fileUrl, f?.thumbnailUrl, f?.imageUrl)
      if (u) urls.push(u)
      if (urls.length >= 4) break
    }
    feedImages.value = urls
    // 배틀 이미지가 부족하면 피드 사진으로 보충
    if (battleImages.value.length < 2 && urls.length >= 2) {
      const fill = [...battleImages.value]
      for (const u of urls) {
        if (fill.length >= 2) break
        if (!fill.includes(u)) fill.push(u)
      }
      battleImages.value = fill
    }
  } catch (e) { /* noop */ }

  // 핫아템: 제품 랭킹 (인기 점수)
  try {
    const res = await productService.getProducts(
      { status: 'APPROVED' },
      { size: 3, sort: 'popularityScore,DESC' }
    )
    const list = res?.data?.content || res?.data || []
    const urls = []
    for (const p of list) {
      const u = pickUrl(p?.thumbnailUrl, p?.thumbnailDto?.fileUrl, p?.imageUrl)
      if (u) urls.push(u)
      if (urls.length >= 3) break
    }
    productImages.value = urls
  } catch (e) { /* noop */ }
}

onMounted(() => {
  start()
  loadAll()
})
onBeforeUnmount(() => { stop() })
</script>

<style scoped>
.hero-carousel {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  margin: 1rem 0 1.125rem;
  min-height: 200px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.10);
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
  position: relative;
  min-height: 200px;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
}

/* 슬라이드별 배경 */
.theme-yogurpick { background: #0A0E1A; }
.theme-hotfeed   { background: #BE123C; }
.theme-carrier   { background: #5B4FE0; }
.theme-hotitem   { background: #DC2626; }

/* 텍스트 */
.slide-text {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  min-width: 0;
  padding: 1.625rem 1.625rem 1.5rem;
  max-width: 60%;
  min-height: 200px;
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
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.theme-yogurpick .slide-tag {
  background: rgba(180, 255, 57, 0.22);
  color: #B4FF39;
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
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.slide-title :deep(.t-accent) {
  color: var(--slide-accent, #B4FF39);
}

.theme-hotfeed   { --slide-accent: #FFE066; }
.theme-carrier   { --slide-accent: #FFE066; }
.theme-hotitem   { --slide-accent: #FFD60A; }

.slide-sub {
  font-size: 0.8125rem;
  opacity: 0.92;
  line-height: 1.5;
  font-weight: 500;
  margin: 0;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
}

.slide-cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  margin-top: 6px;
  padding: 7px 13px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.92);
  color: #0A0E1A;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.005em;
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
}

.hero-slide:hover .slide-cta {
  background: #fff;
  transform: translateY(-1px);
}

/* 이미지 어둡게 가리는 그라데이션 (텍스트 가독성) */
.slide-veil {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(90deg,
    rgba(0,0,0,0.55) 0%,
    rgba(0,0,0,0.35) 38%,
    rgba(0,0,0,0.05) 60%,
    rgba(0,0,0,0) 78%);
  pointer-events: none;
}

/* 슬라이드 아트 (우측 이미지 영역) */
.slide-art {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
}

.img-fallback {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}
.fallback-lime   { background: #1F2937; }
.fallback-dark   { background: #111827; }
.fallback-rose   { background: #9F1239; }
.fallback-violet { background: #4338CA; }
.fallback-orange { background: #B91C1C; }

/* === 요거픽: VS 두 카드 === */
.vs-stack {
  position: absolute;
  right: -4%;
  top: 50%;
  transform: translateY(-50%);
  width: 56%;
  height: 86%;
}
.vs-card {
  position: absolute;
  width: 52%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: #1F2937;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.35);
}
.vs-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.vs-card-left {
  left: 0;
  transform: rotate(-5deg);
  top: 4%;
}
.vs-card-right {
  right: 0;
  transform: rotate(5deg);
  top: 0;
}
.vs-badge {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #B4FF39;
  color: #0A0E1A;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
  box-shadow: 0 8px 18px rgba(180, 255, 57, 0.35);
  z-index: 2;
}

/* === 핫피드: 3장 콜라주 === */
.collage-stack {
  position: absolute;
  right: 4%;
  top: 50%;
  transform: translateY(-50%);
  width: 52%;
  height: 88%;
}
.collage-tile {
  position: absolute;
  border-radius: 14px;
  overflow: hidden;
  background: #FFFFFF;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.3);
}
.collage-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.tile-back {
  width: 60%;
  height: 78%;
  right: 0;
  top: 0;
  transform: rotate(7deg);
  opacity: 0.92;
}
.tile-mid {
  width: 56%;
  height: 76%;
  right: 14%;
  top: 12%;
  transform: rotate(-3deg);
}
.tile-front {
  width: 58%;
  height: 78%;
  right: 28%;
  top: 6%;
  transform: rotate(-9deg);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.38);
}

/* === 캐꾸: 캐리어 SVG === */
.carrier-stack {
  position: absolute;
  right: -2%;
  top: 50%;
  transform: translateY(-50%) rotate(-6deg);
  width: 46%;
  height: 124%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.carrier-svg {
  width: 100%;
  height: 100%;
  display: block;
  filter: drop-shadow(0 18px 28px rgba(0, 0, 0, 0.35));
}

/* === 핫아템: 1·2·3위 카드 === */
.rank-stack {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 56%;
  height: 88%;
}
.rank-card {
  position: absolute;
  border-radius: 14px;
  overflow: hidden;
  background: #1F2937;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
}
.rank-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.rank-num {
  position: absolute;
  left: 8px;
  top: 6px;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  padding: 2px 8px;
  border-radius: 100px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.rank-num.gold {
  background: #FFD60A;
  color: #1F1300;
  font-size: 16px;
  padding: 3px 10px;
  box-shadow: 0 4px 10px rgba(255, 214, 10, 0.4);
}
.rank-1 {
  right: 14%;
  top: 4%;
  width: 50%;
  height: 92%;
  transform: rotate(-4deg);
  z-index: 3;
}
.rank-2 {
  right: 50%;
  top: 18%;
  width: 38%;
  height: 64%;
  transform: rotate(-9deg);
  z-index: 2;
  opacity: 0.95;
}
.rank-3 {
  right: -2%;
  top: 22%;
  width: 36%;
  height: 60%;
  transform: rotate(7deg);
  z-index: 1;
  opacity: 0.92;
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
  z-index: 5;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}
.hero-carousel:hover .nav-arrow { opacity: 1; }
.nav-arrow:hover { background: #fff; }
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
  z-index: 5;
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
  background: rgba(255, 255, 255, 0.32);
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
  animation: fill 3.2s linear forwards;
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
    min-height: 168px;
    -webkit-user-select: none;
    user-select: none;
  }
  .hero-slide { min-height: 168px; }
  .slide-text {
    padding: 1.125rem 1.125rem 1.75rem;
    max-width: 64%;
    min-height: 168px;
    gap: 0.4375rem;
  }
  .slide-title { font-size: 1.1875rem; line-height: 1.25; }
  .slide-sub { font-size: 0.75rem; }
  .slide-cta { font-size: 11px; padding: 6px 11px; }
  .hero-indicators { bottom: 10px; }
  .indicator-bar { width: 20px; }
  .indicator.active .indicator-bar { width: 30px; }

  .slide-veil {
    background: linear-gradient(180deg,
      rgba(0,0,0,0) 30%,
      rgba(0,0,0,0.35) 75%,
      rgba(0,0,0,0.6) 100%),
      linear-gradient(90deg,
      rgba(0,0,0,0.55) 0%,
      rgba(0,0,0,0.2) 50%,
      rgba(0,0,0,0) 70%);
  }
  .vs-stack { width: 50%; right: -6%; }
  .collage-stack { width: 50%; right: 0; }
  .carrier-stack { width: 42%; right: -2%; height: 130%; }
  .rank-stack { width: 52%; right: -4%; }
}

@media (min-width: 1280px) {
  .hero-carousel { min-height: 240px; }
  .hero-slide { min-height: 240px; }
  .slide-text {
    padding: 2rem 2rem 1.75rem;
    min-height: 240px;
  }
  .slide-title { font-size: 1.875rem; }
  .slide-sub { font-size: 0.9375rem; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-track { transition: none; }
  .tag-dot,
  .indicator-fill.animate { animation: none; }
}
</style>
