<template>
  <div class="section-card">
    <h3 class="section-title">EXP 획득 이력</h3>

    <!-- 첫 로딩: 스켈레톤 -->
    <div v-if="initialLoading" class="exp-history">
      <div v-for="n in 5" :key="`sk-${n}`" class="exp-history-item skeleton">
        <div class="sk-left">
          <div class="sk-bar sk-bar-w"></div>
          <div class="sk-bar sk-bar-n"></div>
        </div>
        <div class="sk-bar sk-bar-r"></div>
      </div>
    </div>

    <!-- 첫 로딩 에러 -->
    <div v-else-if="error && items.length === 0" class="state-block">
      <AlertCircle :size="20" :stroke-width="2.2" class="state-icon" />
      <p class="state-text">이력을 불러오지 못했어요</p>
      <button type="button" class="retry-btn" @click="reload">다시 시도</button>
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="items.length === 0" class="state-block empty">
      <Sparkles :size="20" :stroke-width="2.2" class="state-icon" />
      <p class="state-text">아직 EXP 획득 이력이 없습니다</p>
    </div>

    <!-- 리스트 -->
    <div v-else class="exp-history">
      <div
        v-for="entry in items"
        :key="entry.id"
        class="exp-history-item"
        :data-source-id="entry.sourceId ?? null"
        @click="onEntryClick(entry)"
      >
        <div class="exp-history-left">
          <span class="exp-history-action">{{ sourceLabel(entry.source) }}</span>
          <span class="exp-history-date">{{ formatDate(entry.createdAt) }}</span>
        </div>
        <div class="exp-history-right">
          <span
            class="exp-history-value"
            :class="entry.amount < 0 ? 'is-negative' : 'is-positive'"
          >{{ entry.amount >= 0 ? '+' : '' }}{{ entry.amount }} EXP</span>
          <span v-if="entry.resultTotalExp != null" class="exp-history-total">
            누적 {{ formatNumber(entry.resultTotalExp) }}
          </span>
        </div>
      </div>

      <!-- 더 보기 / 추가 로딩 -->
      <div v-if="!last" class="more-row">
        <div v-if="loadingMore" class="spinner-wrap">
          <span class="spinner"></span>
        </div>
        <button v-else type="button" class="more-btn" @click="loadMore">
          더 보기
        </button>
      </div>

      <!-- 추가 로딩 에러 -->
      <div v-if="error && items.length > 0" class="more-error">
        <span>불러오기 실패</span>
        <button type="button" class="retry-inline" @click="loadMore">재시도</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { AlertCircle, Sparkles } from 'lucide-vue-next'
import { rewardsService } from '@/services/RewardsService.js'

const PAGE_SIZE = 20

const SOURCE_LABELS = {
  FEED_CREATE: '피드 작성',
  COMMENT_CREATE: '댓글 작성',
  BATTLE_VOTE: '배틀 투표',
  BATTLE_CREATE: '배틀 생성',
  BATTLE_ITEM_ADD: '배틀 아이템 추가',
  BATTLE_PREDICTION_HIT: '배틀 예측 적중',
  MISSION_CLAIM: '일일 미션 보상 수령',
  STREAK_BONUS: '연속 출석 보너스',
  ADMIN_GRANT: '관리자 지급',
  FEED_REACTION: '피드 리액션 수신',
  BATTLE_WEIGHTED_VOTE: '가중 투표',
  PICK_COMMENT: 'PICK 한마디',
  HOT_DISCOVER: 'HOT 발굴자',
  WEEKLY_RANKING: '주간 랭킹',
  BATTLE_RESULT: '배틀 결과',
  ATTENDANCE: '출석',
}

const items = ref([])
const page = ref(0)
const last = ref(false)
const totalElements = ref(0)
const initialLoading = ref(true)
const loadingMore = ref(false)
const error = ref(null)

function sourceLabel(code) {
  return SOURCE_LABELS[code] || code || '-'
}

function formatNumber(n) {
  return Number(n).toLocaleString('ko-KR')
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

async function fetchPage(targetPage) {
  const res = await rewardsService.getMyExpHistory({ page: targetPage, size: PAGE_SIZE })
  const pageData = res?.data ?? {}
  return {
    content: Array.isArray(pageData.content) ? pageData.content : [],
    last: pageData.last === true,
    totalElements: pageData.totalElements ?? 0,
    number: pageData.number ?? targetPage,
  }
}

async function reload() {
  initialLoading.value = true
  error.value = null
  items.value = []
  page.value = 0
  last.value = false
  try {
    const res = await fetchPage(0)
    items.value = res.content
    last.value = res.last
    totalElements.value = res.totalElements
    page.value = res.number
  } catch (e) {
    console.error('[ExpHistory] 첫 페이지 로딩 실패:', e)
    error.value = e
  } finally {
    initialLoading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || last.value) return
  loadingMore.value = true
  error.value = null
  try {
    const next = page.value + 1
    const res = await fetchPage(next)
    items.value = items.value.concat(res.content)
    last.value = res.last
    totalElements.value = res.totalElements
    page.value = res.number
  } catch (e) {
    console.error('[ExpHistory] 추가 페이지 로딩 실패:', e)
    error.value = e
  } finally {
    loadingMore.value = false
  }
}

function onEntryClick(_entry) {
  // 추후 sourceId 기반 딥링크 후크 (피드/배틀 상세로 이동) — 현재 단계에서는 미구현
}

onMounted(reload)
</script>

<style scoped>
.section-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 16px;
  height: 100%;
}

@media (min-width: 768px) { .section-card { padding: 22px; } }

.section-title {
  font-size: 15px;
  font-weight: 800;
  color: #0A0E1A;
  margin-bottom: 16px;
  letter-spacing: -0.2px;
}

@media (min-width: 768px) { .section-title { font-size: 16px; } }

.exp-history { display: flex; flex-direction: column; }

.exp-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #F1F5F9;
}

.exp-history-item:first-child { border-top: none; padding-top: 4px; }

.exp-history-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.exp-history-action {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.2px;
}

.exp-history-date {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.exp-history-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  white-space: nowrap;
}

.exp-history-value {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.2px;
}

.exp-history-value.is-positive { color: #16A34A; }
.exp-history-value.is-negative { color: #EF4444; }

.exp-history-total {
  font-size: 11px;
  color: #94A3B8;
  font-weight: 600;
  letter-spacing: -0.1px;
}

/* ===== 빈 / 에러 상태 ===== */
.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 36px 16px;
  text-align: center;
}

.state-icon { color: #94A3B8; }
.state-block.empty .state-icon { color: #CBD5E1; }

.state-text {
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
  margin: 0;
  letter-spacing: -0.2px;
}

.retry-btn {
  margin-top: 4px;
  padding: 8px 14px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #0A0E1A;
  cursor: pointer;
  letter-spacing: -0.1px;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.retry-btn:hover { background: #FAF5FF; border-color: #9333EA; color: #9333EA; }

/* ===== 더 보기 / 페이지네이션 ===== */
.more-row {
  display: flex;
  justify-content: center;
  padding: 14px 0 4px;
  border-top: 1px solid #F1F5F9;
  margin-top: 4px;
}

.more-btn {
  padding: 9px 18px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  border-radius: 999px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  letter-spacing: -0.1px;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.more-btn:hover { background: #FAF5FF; border-color: #9333EA; color: #9333EA; }

.spinner-wrap { padding: 6px 0; }

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #E5E7EB;
  border-top-color: #9333EA;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.more-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 8px 0 4px;
  font-size: 12px;
  font-weight: 600;
  color: #EF4444;
}

.retry-inline {
  background: none;
  border: none;
  color: #9333EA;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ===== 스켈레톤 ===== */
.exp-history-item.skeleton { cursor: default; }

.sk-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.sk-bar {
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%);
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
}

.sk-bar-w { width: 40%; }
.sk-bar-n { width: 25%; height: 10px; }
.sk-bar-r { width: 60px; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
