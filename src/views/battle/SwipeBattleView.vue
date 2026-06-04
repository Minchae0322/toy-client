<template>
  <div class="swipe-page">
    <!-- 헤더 — 브랜드 그라데이션 색감 + 또렷한 제목/정보 -->
    <header class="swipe-header">
      <!-- 1행: 뒤로가기 + 모드 -->
      <div class="head-controls">
        <button class="icon-btn" aria-label="뒤로" @click="goBack">
          <ChevronLeft :size="20" :stroke-width="2.4" />
        </button>
        <span class="head-mode-chip">
          <Layers :size="11" :stroke-width="2.6" />
          스와이프 배틀
        </span>
        <span class="head-spacer" />
      </div>

      <!-- 2행: 카테고리 + 제목 (메인 영역, 큰 글씨) -->
      <div class="head-main">
        <span v-if="categoryName" class="cat-chip">
          <Tag :size="10" :stroke-width="2.6" />
          {{ categoryName }}
        </span>
        <h1 class="head-title">{{ battle?.title || '배틀을 불러오는 중…' }}</h1>
      </div>

      <!-- 3행: 메타 정보 (D-day, 아이템 수, 참여자) -->
      <div v-if="ddayLabel || totalCount > 0 || participantsLabel" class="head-meta">
        <span v-if="ddayLabel" class="meta-pill" :class="{ urgent: ddayUrgent }">
          <Clock :size="11" :stroke-width="2.6" />
          {{ ddayLabel }}
        </span>
        <span v-if="totalCount > 0" class="meta-pill">
          <Layers :size="11" :stroke-width="2.6" />
          아이템 {{ totalCount }}개
        </span>
        <span v-if="participantsLabel" class="meta-pill">
          <Users :size="11" :stroke-width="2.6" />
          {{ participantsLabel }}
        </span>
      </div>

      <!-- 4행: 진행률 바 + 안내 -->
      <div class="head-progress">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
        </div>
        <span class="progress-text">
          <span class="now">{{ completedCount }}</span><span class="of"> / {{ totalCount || '–' }}</span>
        </span>
      </div>

      <!-- 5행: 순위 보기 + 내 아이템 추가 -->
      <div class="head-actions">
        <button class="result-btn" @click="goResult">
          <Trophy :size="13" :stroke-width="2.6" />
          순위 보기
        </button>
        <button class="add-item-btn" @click="showAddModal = true">
          <Plus :size="14" :stroke-width="2.6" />
          나도 아이템 추가하기
        </button>
      </div>
    </header>

    <!-- 로딩 -->
    <div v-if="initialLoading" class="state-block">
      <div class="spinner"></div>
      <span>카드를 준비 중이에요…</span>
    </div>

    <!-- 완료 -->
    <div v-else-if="allDone" class="done-state">
      <div class="done-badge" aria-hidden="true">
        <PartyPopper :size="40" :stroke-width="2" />
      </div>
      <h2>모두 골랐어요!</h2>
      <p>{{ totalCount }}개의 아이템을 평가했어요</p>
      <div class="done-actions">
        <button class="primary-btn" @click="goResult">
          <Trophy :size="16" :stroke-width="2.4" />
          결과 순위 보기
        </button>
        <button class="ghost-btn" @click="restartSwipe">
          <RotateCcw :size="15" :stroke-width="2.4" />
          다시 스와이프
        </button>
      </div>
    </div>

    <!-- 메인 -->
    <main v-else class="swipe-main">
      <!-- 카드 데크 -->
      <div class="deck-wrap">
        <div class="deck">
          <div
            v-for="(card, idx) in deckCards"
            :key="card.id"
            class="card"
            :class="[
              { 'is-top': idx === 0 },
              { 'is-leaving': leavingId === card.id },
              leavingId === card.id ? `leaving-${leavingVerdict?.toLowerCase()}` : ''
            ]"
            :style="cardStyle(idx, card)"
            @pointerdown="idx === 0 ? onPointerDown($event) : null"
            @pointermove="idx === 0 ? onPointerMove($event) : null"
            @pointerup="idx === 0 ? onPointerUp($event) : null"
            @pointercancel="idx === 0 ? onPointerCancel($event) : null"
          >
            <!-- 미디어 (풀블리드 썸네일) -->
            <div class="card-media" :class="{ 'is-youtube': isYouTubeItem(card) }">
              <img
                :src="cardThumbnail(card)"
                :alt="card.displayName || '아이템'"
                draggable="false"
                @error="onImgError"
              />
              <!-- YouTube 오버레이 — ProductCard(.youtube-play-overlay) 와 동일 디자인 -->
              <div v-if="isYouTubeItem(card)" class="youtube-play-overlay">
                <div class="youtube-play-btn">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <span class="youtube-label">YouTube</span>
              </div>
            </div>

            <!-- 그라데이션 오버레이 + 아이템 정보 -->
            <div class="card-overlay">
              <div class="overlay-meta">
                <span v-if="isYouTubeItem(card)" class="badge-yt">
                  <Play :size="10" :stroke-width="3" fill="currentColor" />
                  YouTube
                </span>
              </div>
              <h2 class="overlay-name">{{ card.displayName || '제품명 없음' }}</h2>
            </div>

          </div>
        </div>

        <!-- 스와이프 스탬프 — deck-wrap 위에 고정 (카드 이동과 무관하게 항상 보임) -->
        <div class="stamp-layer" aria-hidden="true">
          <div class="stamp stamp-strong" :style="{ opacity: stampOpacity('STRONG_PICK'), transform: stampTransform('STRONG_PICK') }">
            <Flame :size="26" :stroke-width="2.8" />
            <span>PICK ×3</span>
          </div>
          <!-- 왼쪽으로 스와이프 = PICK (좌측에 표시) -->
          <div class="stamp stamp-pick" :style="{ opacity: stampOpacity('PICK'), transform: stampTransform('PICK') }">
            <Heart :size="26" :stroke-width="2.8" />
            <span>PICK</span>
          </div>
          <!-- 오른쪽으로 스와이프 = PASS (우측에 표시) -->
          <div class="stamp stamp-pass" :style="{ opacity: stampOpacity('PASS'), transform: stampTransform('PASS') }">
            <X :size="26" :stroke-width="2.8" />
            <span>PASS</span>
          </div>
        </div>

        <!-- 백그라운드 페치 안내 -->
        <div v-if="fetchingMore" class="fetch-pill">
          <span class="dot"></span>
          불러오는 중
        </div>
      </div>

      <!-- YouTube 재생 모달 (Teleport) -->
      <Teleport to="body">
        <Transition name="yt-fade">
          <div v-if="youtubePlayingUrl" class="yt-modal-overlay" @click.self="closeYoutubePlayer">
            <button type="button" class="yt-modal-close" aria-label="닫기" @click="closeYoutubePlayer">
              <X :size="22" :stroke-width="2.4" />
            </button>
            <div class="yt-modal-frame">
              <iframe
                :src="youtubePlayingUrl"
                title="YouTube 영상"
                frameborder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- 아이템 추가 모달 -->
      <AddProductModal
        v-if="showAddModal"
        ref="addModalRef"
        :battle-id="battleId"
        @close="showAddModal = false"
        @submit-image="onAddImageItem"
        @select-product="onAddProductItem"
        @submit-youtube="onAddYoutubeItem"
      />

      <!-- 액션 — PASS 좌, PICK ×3 중앙, PICK 우 (Tinder 표준과 일치) -->
      <div class="actions">
        <button
          class="act-btn act-pass"
          :disabled="busy"
          @click="actNow('PASS')"
        >
          <span class="act-circle">
            <X :size="20" :stroke-width="2.8" />
          </span>
          <span class="act-label">PASS</span>
          <span class="act-hint">← 왼쪽</span>
        </button>
        <button
          class="act-btn act-strong"
          :disabled="busy"
          @click="actNow('STRONG_PICK')"
        >
          <span class="act-circle">
            <Flame :size="22" :stroke-width="2.6" />
          </span>
          <span class="act-label">PICK ×3</span>
          <span class="act-hint">↑ 위로</span>
        </button>
        <button
          class="act-btn act-pick"
          :disabled="busy"
          @click="actNow('PICK')"
        >
          <span class="act-circle">
            <Heart :size="20" :stroke-width="2.6" />
          </span>
          <span class="act-label">PICK</span>
          <span class="act-hint">오른쪽 →</span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, Flame, Heart, X, PartyPopper, Trophy, Tag, Clock, Users, Layers, Plus, RotateCcw } from 'lucide-vue-next'
import { battleService } from '@/services/BattleService.js'
import { swipeBattleService } from '@/services/SwipeBattleService.js'
import { normalizeYoutubeEmbedUrl } from '@/utils/youtubeEmbed.js'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import AddProductModal from '@/components/battle/detail/AddProductModal.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const route = useRoute()
const router = useRouter()
const battleId = computed(() => route.params.id)

const PLACEHOLDER = 'https://placehold.co/600x800?text=No+Image'

const battle = ref(null)
const queue = ref([])
const completedCount = ref(0)
const totalCount = ref(0)
const initialLoading = ref(true)
const fetchingMore = ref(false)
const busy = ref(false)
// 다시 스와이프 세션 — true 면 백엔드 completedCount(누적값)을 화면 진행도로 덮어쓰지 않고 로컬 카운트만 사용
const restartMode = ref(false)
const leavingId = ref(null)
const leavingVerdict = ref(null)

// 톱 카드 + 다음 한 장 peek — 넘길 때 다음 아이템이 살짝 비쳐 보이도록
const deckCards = computed(() => queue.value.slice(0, 2))
const allDone = computed(() => {
  if (initialLoading.value) return false
  if (queue.value.length > 0) return false
  if (totalCount.value === 0) return false
  return completedCount.value >= totalCount.value
})
const progressPct = computed(() => {
  if (!totalCount.value) return 0
  return Math.min(100, Math.round((completedCount.value / totalCount.value) * 100))
})

// 배틀 메타 — BattleInfoCard 참조해서 핵심만 압축
const categoryName = computed(() =>
  battle.value?.subCategoryDetail?.subCategoryName ||
  battle.value?.categoryDetail?.categoryName ||
  null
)
const ddayLabel = computed(() => {
  const end = battle.value?.endDate
  if (!end) return null
  const diff = new Date(end) - new Date()
  if (diff <= 0) return '마감'
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '오늘 마감'
  return `D-${days}`
})
const ddayUrgent = computed(() => {
  const end = battle.value?.endDate
  if (!end) return false
  const diff = new Date(end) - new Date()
  if (diff <= 0) return false
  return diff <= 3 * 24 * 60 * 60 * 1000
})
const participantsLabel = computed(() => {
  const n = battle.value?.totalParticipants
  if (!n || n <= 0) return null
  if (n >= 10000) return `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}만 참여`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K 참여`
  return `${n.toLocaleString()} 참여`
})


async function haptic(strong = false) {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: strong ? ImpactStyle.Heavy : ImpactStyle.Light })
  } catch {}
}

function normalizeYt(url) { return normalizeYoutubeEmbedUrl(url) }
function onImgError(e) { e.target.src = PLACEHOLDER }

// ───────── YouTube 카드 헬퍼 ─────────
function isYouTubeItem(card) {
  if (!card) return false
  const t = card.itemType
  if (t === 'YOUTUBE') return true
  // 안전망: itemType 누락이어도 id 가 풀리면 YouTube
  return !!resolveYoutubeId(card)
}

// YouTube ID 추출 — watch/embed/shorts/short URL 외에 i.ytimg / img.youtube 썸네일 URL 도 대응
function extractYoutubeId(url) {
  if (!url || typeof url !== 'string') return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
    /(?:img\.youtube\.com|i\.ytimg\.com)\/vi(?:_webp)?\/([A-Za-z0-9_-]{6,})\//,
    /youtube\.com\/watch.*?[?&]v=([A-Za-z0-9_-]{6,})/
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m && m[1]) return m[1]
  }
  return null
}

// 카드에서 가능한 모든 필드 다 훑어서 youtube id 찾기
function resolveYoutubeId(card) {
  if (!card) return null
  // 1) 직접 ID 필드
  if (card.youtubeVideoId) return card.youtubeVideoId
  // 2) 흔한 URL 필드들
  const candidates = [
    card.embedUrl, card.contentUrl, card.url, card.videoUrl, card.youtubeUrl, card.imageUrl, card.thumbnailUrl
  ]
  for (const url of candidates) {
    const id = extractYoutubeId(url)
    if (id) return id
  }
  return null
}

// 카드 썸네일 — YouTube 면 hq 썸네일, 그 외 imageUrl
function cardThumbnail(card) {
  if (isYouTubeItem(card)) {
    const id = resolveYoutubeId(card)
    if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  }
  return card.imageUrl || PLACEHOLDER
}

// 재생 — 네이티브는 SFSafariViewController (Browser.open) 로 안정 재생, 웹은 iframe 모달 폴백
const youtubePlayingUrl = ref(null)
async function openYoutubePlayer(card) {
  const id = resolveYoutubeId(card)
  const contentUrl = card?.contentUrl || card?.url || card?.youtubeUrl || null
  const watchUrl = contentUrl || (id ? `https://www.youtube.com/watch?v=${id}` : null)
  if (!watchUrl) return

  if (Capacitor.isNativePlatform()) {
    try {
      await Browser.open({ url: watchUrl, presentationStyle: 'popover' })
      return
    } catch (e) {
      console.warn('[Swipe/YT] Browser.open 실패, iframe fallback:', e)
    }
  }

  // 웹 폴백: 기존 iframe 모달
  const embedSrc = card?.embedUrl
    ? normalizeYoutubeEmbedUrl(card.embedUrl)
    : (id ? `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1` : null)
  if (!embedSrc) return
  youtubePlayingUrl.value = embedSrc
}
function closeYoutubePlayer() {
  youtubePlayingUrl.value = null
}

async function loadInitial() {
  initialLoading.value = true
  try {
    const [bRes, nRes] = await Promise.all([
      battleService.getBattle(battleId.value),
      swipeBattleService.getNext(battleId.value, 10)
    ])
    battle.value = bRes?.data || null
    const voteType = battle.value?.voteType?.title || battle.value?.voteType
    if (voteType && voteType !== 'SWIPE') {
      router.replace({ name: 'BattleDetail', params: { id: battleId.value } })
      return
    }
    if (nRes?.success && nRes.data) {
      queue.value = Array.isArray(nRes.data.items) ? nRes.data.items.slice() : []
      completedCount.value = nRes.data.completedCount || 0
      totalCount.value = nRes.data.totalCount || 0
    }
  } catch (e) {
    console.error('[Swipe] 초기 로드 실패:', e)
  } finally {
    initialLoading.value = false
  }
}

async function fetchMoreIfNeeded() {
  if (fetchingMore.value) return
  if (queue.value.length > 3) return
  // restartMode 일 땐 백엔드 completedCount === totalCount 라도 카드 폴백을 받으므로 가드 X
  if (!restartMode.value && totalCount.value && completedCount.value >= totalCount.value) return
  fetchingMore.value = true
  try {
    const res = await swipeBattleService.getNext(battleId.value, 10)
    if (res?.success && res.data) {
      const items = Array.isArray(res.data.items) ? res.data.items : []
      const known = new Set(queue.value.map(c => c.id))
      const fresh = items.filter(c => !known.has(c.id))
      queue.value.push(...fresh)
      // restartMode 에서는 누적 completedCount 가 totalCount 와 같으므로 덮어쓰면 진행도 망가짐
      if (!restartMode.value) {
        completedCount.value = res.data.completedCount || completedCount.value
      }
      totalCount.value = res.data.totalCount || totalCount.value
    }
  } catch (e) {
    console.warn('[Swipe] 추가 페치 실패:', e)
  } finally {
    fetchingMore.value = false
  }
}

async function commitVerdict(item, verdict) {
  if (busy.value) return
  busy.value = true
  leavingId.value = item.id
  leavingVerdict.value = verdict
  haptic(verdict === 'STRONG_PICK')

  await new Promise(r => setTimeout(r, 320))
  queue.value = queue.value.filter(c => c.id !== item.id)
  leavingId.value = null
  leavingVerdict.value = null

  swipeBattleService.submit(battleId.value, item.id, verdict)
    .then((res) => {
      if (res?.data) {
        // restartMode 에서는 백엔드 누적 카운트로 덮어쓰지 않음 — 로컬 세션 진행도 유지
        if (!restartMode.value) {
          completedCount.value = res.data.completedCount ?? completedCount.value
        }
        totalCount.value = res.data.totalCount ?? totalCount.value
      }
    })
    .catch((err) => {
      const code = err?.response?.data?.code || err?.code
      if (code !== 'SWIPE_ALREADY_DONE') console.warn('[Swipe] submit 실패:', err)
    })
    .finally(() => {
      if (!completedCount.value || completedCount.value < (totalCount.value || Infinity)) {
        completedCount.value += 1
      }
      fetchMoreIfNeeded()
    })

  busy.value = false
}

function actNow(verdict) {
  const top = queue.value[0]
  if (!top) return
  commitVerdict(top, verdict)
}

const drag = ref({ active: false, startX: 0, startY: 0, dx: 0, dy: 0, pointerId: null })
const TOP_THRESHOLD_Y = -120
const SIDE_THRESHOLD_X = 120

function onPointerDown(e) {
  if (busy.value) return
  if (e.target?.closest && e.target.closest('iframe')) return
  drag.value.active = true
  drag.value.startX = e.clientX
  drag.value.startY = e.clientY
  drag.value.dx = 0
  drag.value.dy = 0
  drag.value.pointerId = e.pointerId
  e.currentTarget?.setPointerCapture?.(e.pointerId)
}
function onPointerMove(e) {
  if (!drag.value.active) return
  if (drag.value.pointerId != null && e.pointerId !== drag.value.pointerId) return
  drag.value.dx = e.clientX - drag.value.startX
  drag.value.dy = e.clientY - drag.value.startY
}
function onPointerUp(e) {
  if (!drag.value.active) return
  const { dx, dy } = drag.value
  drag.value.active = false
  drag.value.pointerId = null

  // 탭 감지 — 의미있는 이동 없으면 YouTube 카드는 재생, 일반 카드는 무동작
  const isTap = Math.abs(dx) < 10 && Math.abs(dy) < 10
  if (isTap) {
    const top = queue.value[0]
    if (top && isYouTubeItem(top)) openYoutubePlayer(top)
    drag.value.dx = 0
    drag.value.dy = 0
    return
  }

  if (dy <= TOP_THRESHOLD_Y && Math.abs(dy) > Math.abs(dx)) {
    actNow('STRONG_PICK')
  } else if (dx >= SIDE_THRESHOLD_X) {
    // 오른쪽으로 스와이프 = PICK (Tinder 표준)
    actNow('PICK')
  } else if (dx <= -SIDE_THRESHOLD_X) {
    // 왼쪽으로 스와이프 = PASS (Tinder 표준)
    actNow('PASS')
  }
  drag.value.dx = 0
  drag.value.dy = 0
}
function onPointerCancel() {
  drag.value.active = false
  drag.value.pointerId = null
  drag.value.dx = 0
  drag.value.dy = 0
}

function cardStyle(idx, card) {
  // 톱 카드(idx=0)가 항상 위로 — z-index 역순 부여 (뒤 카드일수록 낮게)
  const zIndex = 10 - idx
  if (idx === 0) {
    if (leavingId.value === card.id) return { zIndex }
    const { dx, dy } = drag.value
    const rot = (dx / 16).toFixed(2)
    return {
      zIndex,
      transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
      transition: drag.value.active ? 'none' : 'transform 0.24s cubic-bezier(0.2, 0.9, 0.2, 1)'
    }
  }
  const scale = 1 - idx * 0.04
  const offsetY = idx * 10
  return {
    zIndex,
    transform: `translateY(${offsetY}px) scale(${scale})`,
    opacity: idx === 2 ? 0.55 : 0.85
  }
}

// 드래그 진행도(0~1)에 따라 스탬프가 옅게 → 진하게 + 약간 확대
function stampOpacity(verdict) {
  if (!drag.value.active && !leavingId.value) return 0
  // 떠나가는 중에는 해당 verdict 스탬프 유지
  if (leavingId.value && leavingVerdict.value === verdict) return 1

  const { dx, dy } = drag.value
  if (verdict === 'STRONG_PICK') {
    if (dy >= 0) return 0
    if (Math.abs(dy) <= Math.abs(dx)) return 0
    return Math.min(1, Math.abs(dy) / 120)
  }
  if (verdict === 'PICK') {
    // 오른쪽으로 스와이프 = PICK (Tinder 표준, dx 양수)
    if (dx <= 0) return 0
    if (Math.abs(dy) > Math.abs(dx) && dy < 0) return 0
    return Math.min(1, dx / 120)
  }
  if (verdict === 'PASS') {
    // 왼쪽으로 스와이프 = PASS (Tinder 표준, dx 음수)
    if (dx >= 0) return 0
    if (Math.abs(dy) > Math.abs(dx) && dy < 0) return 0
    return Math.min(1, Math.abs(dx) / 120)
  }
  return 0
}

// 스탬프 살짝 확대(드래그 진행도에 따라) + 기본 회전 유지
function stampTransform(verdict) {
  const o = stampOpacity(verdict)
  const scale = 0.8 + 0.4 * o // 0.8 ~ 1.2
  if (verdict === 'STRONG_PICK') return `translateX(-50%) rotate(-4deg) scale(${scale})`
  // PICK = 우측 스와이프 → 우측 표시, 우향 기울기
  if (verdict === 'PICK') return `rotate(10deg) scale(${scale})`
  // PASS = 좌측 스와이프 → 좌측 표시, 좌향 기울기
  if (verdict === 'PASS') return `rotate(-10deg) scale(${scale})`
  return ''
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'BattleList' })
}
// 결과(순위) = BattleDetail 페이지. 미진행 카드가 남아 있어도 결과 화면이 보이도록 from=swipe 플래그
function goResult() {
  router.push({ name: 'BattleDetail', params: { id: battleId.value }, query: { from: 'swipe' } })
}

// 다시 스와이프 — 백엔드 데이터는 그대로(upsert 되니까 verdict 만 갱신됨), 화면 진행도만 로컬에서 0으로 리셋
async function restartSwipe() {
  restartMode.value = true
  completedCount.value = 0
  queue.value = []
  await fetchMoreIfNeeded()
}

// ───────── 내 아이템 추가 ─────────
const { open: openDialog } = useConfirmDialog()
const showAddModal = ref(false)
const addModalRef = ref(null)

async function postNewItem(item) {
  try {
    const res = await battleService.addBattleItems(battleId.value, { items: [item] })
    if (!res?.success) throw new Error(res?.message || '아이템 추가에 실패했어요')
    return true
  } catch (e) {
    await openDialog({ type: 'alert', title: '오류', message: e?.message || '아이템 추가에 실패했어요' })
    return false
  }
}

async function refreshQueueAfterAdd() {
  try {
    const res = await swipeBattleService.getNext(battleId.value, 10)
    if (res?.success && res.data) {
      const fresh = Array.isArray(res.data.items) ? res.data.items : []
      const known = new Set(queue.value.map(c => c.id))
      const newOnes = fresh.filter(c => !known.has(c.id))
      queue.value.push(...newOnes)
      completedCount.value = res.data.completedCount ?? completedCount.value
      totalCount.value = res.data.totalCount ?? totalCount.value
    }
  } catch {}
}

async function onAddImageItem(data) {
  const item = {
    itemType: 'CUSTOM',
    customName: data.customName,
    customBrand: data.customBrand || null,
    customImageUrl: data.customImageUrl
  }
  const ok = await postNewItem(item)
  if (ok) {
    addModalRef.value?.markItemSuccess?.(data.id)
    refreshQueueAfterAdd()
  } else {
    addModalRef.value?.markItemFailure?.(data.id)
  }
}

async function onAddProductItem(product) {
  const item = { itemType: 'PRODUCT', productId: product.id || product.productId }
  const ok = await postNewItem(item)
  if (ok) {
    addModalRef.value?.markProductDone?.(true)
    showAddModal.value = false
    refreshQueueAfterAdd()
  } else {
    addModalRef.value?.markProductDone?.(false)
  }
}

async function onAddYoutubeItem(data) {
  const item = {
    itemType: 'YOUTUBE',
    customName: data.customName,
    customBrand: data.customBrand || null,
    customImageUrl: data.customImageUrl,
    contentUrl: data.contentUrl
  }
  const ok = await postNewItem(item)
  if (ok) {
    addModalRef.value?.markYoutubeDone?.(true)
    showAddModal.value = false
    refreshQueueAfterAdd()
  } else {
    addModalRef.value?.markYoutubeDone?.(false)
  }
}

onMounted(loadInitial)
onBeforeUnmount(() => {})
</script>

<style scoped>
.swipe-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  color: var(--text-primary);
  overflow: hidden;
}

/* ─────────── Header — 깔끔한 흰 배경 ─────────── */
.swipe-header {
  position: relative;
  padding: env(safe-area-inset-top, 0px) 0 0;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-default);
}

/* 1행 — 상단 컨트롤 */
.head-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px 4px;
}
.icon-btn {
  flex-shrink: 0;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  box-shadow: 0 1px 3px rgba(10, 14, 26, 0.04);
}
.icon-btn:hover { background: var(--bg-mute); }
.icon-btn:active { transform: scale(0.94); }

.head-mode-chip {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px 10px;
  background: var(--c-brand);
  color: white;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  align-self: center;
  max-width: 150px;
}
.head-spacer { width: 36px; flex-shrink: 0; }

.result-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 9px 16px;
  background: #FBBF24;
  color: #78350F;
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 900;
  letter-spacing: -0.01em;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(251, 191, 36, 0.5);
  transition: transform 0.12s ease, box-shadow 0.15s ease, background 0.15s;
}
.result-btn:hover:not(:disabled) {
  background: #F59E0B;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(245, 158, 11, 0.55);
}
.result-btn:active:not(:disabled) {
  transform: scale(0.96);
}
.result-btn:disabled {
  background: var(--bg-mute);
  color: var(--c-text-400);
  cursor: not-allowed;
  box-shadow: none;
}

/* 2행 — 카테고리 + 제목 (메인) */
.head-main {
  padding: 6px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cat-chip {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.head-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.25;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 3행 — 메타 */
.head-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 16px 10px;
}
.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  color: var(--c-text-600);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}
.meta-pill.urgent {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #DC2626;
}

/* 4행 — 진행률 */
.head-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px 12px;
}
.progress-track {
  flex: 1;
  height: 8px;
  background: var(--bg-mute);
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(10, 14, 26, 0.06);
}
.progress-fill {
  height: 100%;
  background: var(--c-brand);
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.progress-text {
  font-size: 13px;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}
.progress-text .now { color: var(--c-brand); }
.progress-text .of { color: var(--c-text-400); font-weight: 700; }

/* 5행 — 순위 보기 + 내 아이템 추가 (좌측 정렬) */
.head-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 0 16px 12px;
}
.add-item-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  background: var(--c-brand-soft);
  color: var(--c-brand);
  border: 1px dashed var(--c-brand);
  border-radius: 999px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.add-item-btn:hover {
  background: var(--c-brand);
  color: white;
}
.add-item-btn:active { transform: scale(0.97); }
.exit-hint {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--c-text-400);
  letter-spacing: -0.01em;
}

/* ─────────── States ─────────── */
.state-block {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px;
  font-size: 14px;
  color: var(--c-text-500);
}
.spinner {
  width: 36px; height: 36px;
  border: 3px solid var(--bg-mute);
  border-top-color: var(--c-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.done-state {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center;
  padding: 40px 24px calc(40px + env(safe-area-inset-bottom));
}
.done-badge {
  width: 84px; height: 84px;
  display: flex; align-items: center; justify-content: center;
  background: var(--c-brand);
  color: white;
  border-radius: 50%;
  margin-bottom: 18px;
  box-shadow: 0 12px 32px rgba(147, 51, 234, 0.28);
  animation: bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes bounceIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.done-state h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.03em;
}
.done-state p {
  margin: 6px 0 22px;
  color: var(--c-text-500);
  font-size: 14.5px;
}
.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 26px;
  background: var(--c-brand);
  color: white;
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.01em;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(147, 51, 234, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s;
}
.primary-btn:hover { transform: translateY(-1px); background: var(--c-brand-hover); box-shadow: 0 12px 28px rgba(147, 51, 234, 0.35); }
.primary-btn:active { transform: scale(0.98); }

/* 다시 스와이프 — 보조 액션, 약하게 */
.done-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: transparent;
  color: var(--c-text-600);
  border: 1px solid var(--border-default);
  border-radius: 999px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s;
}
.ghost-btn:hover {
  background: var(--bg-subtle);
  border-color: var(--border-strong);
  color: var(--text-primary);
}
.ghost-btn:active { transform: scale(0.97); }

/* ─────────── Main ─────────── */
.swipe-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 8px 12px 0;
}

/* Card Deck — 풀블리드 */
.deck-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 8px 0;
}
.deck {
  position: relative;
  width: 100%;
  max-width: 440px;
  height: 100%;
  max-height: 660px;
}

.card {
  position: absolute;
  inset: 0;
  background: #000;
  border-radius: 18px;
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(10, 14, 26, 0.08),
    0 14px 36px rgba(10, 14, 26, 0.14),
    0 28px 64px -16px rgba(10, 14, 26, 0.18);
  user-select: none;
  touch-action: pan-y;
  will-change: transform;
  display: flex;
  flex-direction: column;
}
.card.is-top {
  cursor: grab;
  touch-action: none;
}
.card.is-top:active { cursor: grabbing; }

.card-media {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

/* YouTube 재생 오버레이 — ProductCard 와 동일 (.youtube-play-overlay) */
.youtube-play-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  /* 카드 탭으로 재생되므로 자체 포인터 이벤트는 무시 */
  pointer-events: none;
}
.youtube-play-btn {
  width: 64px;
  height: 64px;
  background: rgba(255, 0, 0, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
}
.youtube-label {
  font-size: 12px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}
@media (max-width: 480px) {
  .youtube-play-btn { width: 56px; height: 56px; }
  .youtube-play-btn svg { width: 38px; height: 38px; }
}

/* YouTube 재생 풀스크린 모달 */
.yt-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: env(safe-area-inset-top, 0) 16px env(safe-area-inset-bottom, 0);
}
.yt-modal-close {
  position: absolute;
  top: calc(16px + env(safe-area-inset-top, 0));
  right: 16px;
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.yt-modal-close:hover { background: rgba(255, 255, 255, 0.25); }
.yt-modal-frame {
  width: 100%;
  max-width: 960px;
  aspect-ratio: 16 / 9;
  background: black;
  border-radius: 8px;
  overflow: hidden;
}
.yt-modal-frame iframe {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
}
.yt-fade-enter-active, .yt-fade-leave-active {
  transition: opacity 0.18s ease;
}
.yt-fade-enter-from, .yt-fade-leave-to { opacity: 0; }

/* 그라데이션 오버레이 + 아이템 정보 */
.card-overlay {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  z-index: 2;
  padding: 100px 20px 22px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.65) 30%,
    rgba(0, 0, 0, 0.35) 65%,
    rgba(0, 0, 0, 0) 100%
  );
  color: white;
  pointer-events: none;
}
.overlay-name {
  margin: 0;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.overlay-meta {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}
.badge-yt {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.95);
  color: #FF0000;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

/* ─────────── Stamps — deck-wrap 위 고정 (카드 이동과 무관) ─────────── */
.stamp-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* 카드 inline z-index(10) 보다 높게 — 사진 위에 노출 보장 */
  z-index: 50;
}
/* 모던 솔리드 pill — 흰 텍스트 + 컬러 글로우, 사진 위에서 즉시 인지 */
.stamp {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border: none;
  border-radius: 999px;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 0.06em;
  color: #ffffff;
  pointer-events: none;
  transition: opacity 0.1s linear, transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1);
  white-space: nowrap;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}
.stamp svg { flex-shrink: 0; }

.stamp-strong {
  top: 44px;
  left: 50%;
  background: #F59E0B;
  box-shadow:
    0 0 0 4px rgba(245, 158, 11, 0.22),
    0 14px 32px rgba(245, 158, 11, 0.5),
    0 2px 6px rgba(180, 83, 9, 0.4);
}
/* 오른쪽으로 스와이프 = PICK → 우측에 표시 (Tinder 표준) */
.stamp-pick {
  top: 50%;
  right: 22px;
  margin-top: -26px;
  background: #10B981;
  box-shadow:
    0 0 0 4px rgba(16, 185, 129, 0.22),
    0 14px 32px rgba(16, 185, 129, 0.5),
    0 2px 6px rgba(4, 120, 87, 0.4);
}
/* 왼쪽으로 스와이프 = PASS → 좌측에 표시 (Tinder 표준) */
.stamp-pass {
  top: 50%;
  left: 22px;
  margin-top: -26px;
  background: #EF4444;
  box-shadow:
    0 0 0 4px rgba(239, 68, 68, 0.22),
    0 14px 32px rgba(239, 68, 68, 0.5),
    0 2px 6px rgba(153, 27, 27, 0.4);
}

/* ─────────── Leaving Animations ─────────── */
.card.is-leaving { pointer-events: none; z-index: 5; }
.card.leaving-pass { animation: leavePass 0.32s cubic-bezier(0.4, 0, 0.6, 1) forwards; }
.card.leaving-pick { animation: leavePick 0.32s cubic-bezier(0.4, 0, 0.6, 1) forwards; }
.card.leaving-strong_pick { animation: leaveStrong 0.36s cubic-bezier(0.4, 0, 0.6, 1) forwards; }
@keyframes leavePass {
  /* PASS = 좌측 스와이프 → 왼쪽으로 사라짐 (Tinder 표준) */
  to { transform: translateX(-180%) rotate(-28deg); opacity: 0; }
}
@keyframes leavePick {
  /* PICK = 우측 스와이프 → 오른쪽으로 사라짐 (Tinder 표준) */
  to { transform: translateX(180%) rotate(28deg); opacity: 0; }
}
@keyframes leaveStrong {
  to { transform: translateY(-180%) rotate(0) scale(0.7); opacity: 0; }
}

/* ─────────── Fetch Pill ─────────── */
.fetch-pill {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  z-index: 10;
}
.fetch-pill .dot {
  width: 5px; height: 5px;
  background: white;
  border-radius: 50%;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

/* ─────────── Actions — 3개 동일 크기, 라벨 + 힌트 ─────────── */
.actions {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 14px;
  padding: 14px 16px calc(18px + env(safe-area-inset-bottom));
  flex-shrink: 0;
}
.act-btn {
  flex: 1;
  max-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  border-radius: 14px;
  transition: transform 0.12s ease, background 0.15s ease;
}
.act-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.act-btn:hover:not(:disabled) { background: var(--bg-subtle); }
.act-btn:active:not(:disabled) { transform: scale(0.96); }

.act-circle {
  width: 46px;
  height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--bg-elevated);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}
.act-btn:hover:not(:disabled) .act-circle { transform: translateY(-2px); }

.act-label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin-top: 1px;
}
.act-hint {
  font-size: 9.5px;
  font-weight: 700;
  color: var(--c-text-400);
  letter-spacing: -0.01em;
}

/* PICK — 초록 */
.act-pick .act-circle {
  color: #10B981;
  box-shadow:
    inset 0 0 0 2px rgba(16, 185, 129, 0.18),
    0 2px 8px rgba(16, 185, 129, 0.15);
}
.act-pick:hover:not(:disabled) .act-circle {
  box-shadow:
    inset 0 0 0 2px rgba(16, 185, 129, 0.3),
    0 6px 14px rgba(16, 185, 129, 0.3);
}
.act-pick .act-label { color: #10B981; }

/* STRONG — 골드 */
.act-strong .act-circle {
  color: white;
  background: #F59E0B;
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.35);
}
.act-strong:hover:not(:disabled) .act-circle {
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.55);
}
.act-strong .act-label { color: #F59E0B; }

/* PASS — 빨강 */
.act-pass .act-circle {
  color: #EF4444;
  box-shadow:
    inset 0 0 0 2px rgba(239, 68, 68, 0.18),
    0 2px 8px rgba(239, 68, 68, 0.15);
}
.act-pass:hover:not(:disabled) .act-circle {
  box-shadow:
    inset 0 0 0 2px rgba(239, 68, 68, 0.3),
    0 6px 14px rgba(239, 68, 68, 0.3);
}
.act-pass .act-label { color: #EF4444; }

/* ─────────── 데스크탑 ─────────── */
@media (min-width: 768px) {
  .head-controls { padding: 14px 24px 6px; }
  .head-main { padding: 6px 24px 10px; }
  .head-meta { padding: 0 24px 12px; }
  .head-progress { padding: 0 24px 16px; }
  .head-title { font-size: 24px; }
  .head-mode-chip { max-width: 180px; font-size: 11px; padding: 6px 12px; }
  .meta-pill { font-size: 12px; padding: 5px 11px; }
  .deck { max-width: 480px; max-height: 720px; }
  .overlay-name { font-size: 32px; }
  .act-circle { width: 54px; height: 54px; }
  .act-strong .act-circle { width: 60px; height: 60px; }
  .act-label { font-size: 13px; }
  .act-hint { font-size: 10.5px; }
  .actions { gap: 22px; padding: 18px 28px calc(28px + env(safe-area-inset-bottom)); }
}

/* 다크모드 — 카드 그림자 약간 강하게 */
:root[data-theme="dark"] .card {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 14px 36px rgba(0, 0, 0, 0.5),
    0 28px 64px -16px rgba(0, 0, 0, 0.4);
}
</style>
