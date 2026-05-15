<template>
  <div class="prediction-layout">
    <!-- 예측 전적 요약 -->
    <div class="section-card">
      <header class="card-header">
        <div>
          <h3 class="section-title">배틀 예측 전적</h3>
          <p class="section-sub">배틀에서 승자를 맞히면 EXP를 얻어요</p>
        </div>
      </header>

      <div class="summary-grid">
        <div class="stat-cell">
          <div class="stat-label">총 예측</div>
          <div class="stat-value">{{ summary.totalPredictions }}</div>
        </div>
        <div class="stat-cell">
          <div class="stat-label">적중</div>
          <div class="stat-value hit">{{ summary.hitCount }}</div>
        </div>
        <div class="stat-cell">
          <div class="stat-label">빗나감</div>
          <div class="stat-value miss">{{ summary.totalPredictions - summary.hitCount }}</div>
        </div>
        <div class="stat-cell rate">
          <div class="stat-label">적중률</div>
          <div class="stat-value rate-value">{{ hitRate }}<em>%</em></div>
        </div>
      </div>

      <div class="rate-bar">
        <div class="rate-bar-fill" :style="{ width: hitRate + '%' }"></div>
      </div>
    </div>

    <!-- 히스토리 리스트 -->
    <div class="section-card">
      <header class="card-header">
        <div>
          <h3 class="section-title">히스토리</h3>
          <p class="section-sub">최근 예측한 배틀 기록</p>
        </div>
        <div class="filter-chips">
          <button
            class="filter-chip"
            :class="{ active: filter === 'all' }"
            @click="filter = 'all'"
          >전체</button>
          <button
            class="filter-chip"
            :class="{ active: filter === 'hit' }"
            @click="filter = 'hit'"
          >적중</button>
          <button
            class="filter-chip"
            :class="{ active: filter === 'miss' }"
            @click="filter = 'miss'"
          >빗나감</button>
        </div>
      </header>

      <div v-if="filteredItems.length === 0 && !loading" class="empty">
        기록이 없습니다.
      </div>

      <ul v-else class="history-list">
        <li
          v-for="item in filteredItems"
          :key="item.id"
          class="history-row"
        >
          <span class="result-tag" :class="{ hit: item.hit }">
            <component :is="item.hit ? CheckCircle2 : XCircle" :size="12" :stroke-width="2.4" />
            {{ item.hit ? '적중' : '실패' }}
          </span>
          <div class="history-body">
            <div class="battle-title">{{ item.battleTitle }}</div>
            <div class="prediction-line">
              내 예측 <strong>{{ item.predictedItem }}</strong>
              <template v-if="!item.hit">
                <span class="sep">·</span>
                실제 <strong>{{ item.winnerItem }}</strong>
              </template>
            </div>
          </div>
          <div class="history-date">{{ formatDate(item.date) }}</div>
        </li>
      </ul>

      <div v-if="loading" class="state-note">불러오는 중...</div>

      <div v-if="hasNext && !loading" ref="sentinel" class="load-sentinel">
        <button class="load-more-btn" @click="loadMore">더 보기</button>
      </div>

      <div v-else-if="!hasNext && items.length > 0" class="state-note">
        모든 기록을 불러왔습니다.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { CheckCircle2, XCircle } from 'lucide-vue-next'
import { fetchPredictionSummary, fetchPredictionHistory } from '@/api/rewardsApi.js'

const props = defineProps({
  userId: { type: String, required: true },
})

const PAGE_SIZE = 10
const summary = ref({ hitCount: 0, totalPredictions: 0 })
const items = ref([])
const page = ref(1)
const hasNext = ref(false)
const loading = ref(false)
const filter = ref('all')
const sentinel = ref(null)
let observer = null

const hitRate = computed(() => {
  if (!summary.value.totalPredictions) return 0
  return Math.round((summary.value.hitCount / summary.value.totalPredictions) * 100)
})

const filteredItems = computed(() => {
  if (filter.value === 'all') return items.value
  if (filter.value === 'hit') return items.value.filter((i) => i.hit)
  return items.value.filter((i) => !i.hit)
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

async function loadInitial() {
  page.value = 1
  items.value = []
  loading.value = true
  try {
    const [s, res] = await Promise.all([
      fetchPredictionSummary(props.userId),
      fetchPredictionHistory(props.userId, { page: 1, size: PAGE_SIZE }),
    ])
    summary.value = s
    items.value = res.items
    hasNext.value = res.hasNext
  } finally {
    loading.value = false
  }
  nextTick(setupObserver)
}

async function loadMore() {
  if (!hasNext.value || loading.value) return
  loading.value = true
  try {
    const next = page.value + 1
    const res = await fetchPredictionHistory(props.userId, { page: next, size: PAGE_SIZE })
    items.value.push(...res.items)
    page.value = next
    hasNext.value = res.hasNext
  } finally {
    loading.value = false
  }
  nextTick(setupObserver)
}

function setupObserver() {
  if (observer) observer.disconnect()
  if (!sentinel.value) return
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasNext.value && !loading.value) loadMore()
  }, { threshold: 0.1 })
  observer.observe(sentinel.value)
}

onMounted(loadInitial)
onBeforeUnmount(() => { if (observer) observer.disconnect() })
watch(() => props.userId, loadInitial)
</script>

<style scoped>
.prediction-layout { display: flex; flex-direction: column; gap: 24px; }

@media (min-width: 768px) { .prediction-layout { gap: 28px; } }

.section-card {
  background: var(--bg-elevated);
  border-radius: 16px;
  padding: 20px;
}

@media (min-width: 768px) { .section-card { padding: 24px; } }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  gap: 14px;
  flex-wrap: wrap;
}

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  line-height: 1.2;
}

@media (min-width: 768px) { .section-title { font-size: 18px; } }

.section-sub { font-size: 13px; color: var(--c-text-500); margin-top: 4px; font-weight: 500; }

/* ===== 통계 그리드 ===== */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  margin-bottom: 20px;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  overflow: hidden;
}

@media (min-width: 640px) { .summary-grid { grid-template-columns: repeat(4, 1fr); } }

.stat-cell {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid var(--border-default);
  border-bottom: 1px solid var(--border-default);
}

@media (min-width: 640px) {
  .stat-cell { border-bottom: none; }
  .stat-cell:last-child { border-right: none; }
}

@media (max-width: 639px) {
  .stat-cell:nth-child(2n) { border-right: none; }
  .stat-cell:nth-last-child(-n+2) { border-bottom: none; }
}

.stat-cell.rate { background: var(--c-brand); }
.stat-cell.rate .stat-label { color: rgba(255, 255, 255, 0.75); }
.stat-cell.rate .stat-value.rate-value { color: white; }
.stat-cell.rate .stat-value em { color: rgba(255, 255, 255, 0.7); }

.stat-label {
  font-size: 11px;
  color: var(--c-text-500);
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.stat-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

@media (min-width: 768px) { .stat-value { font-size: 24px; } }

.stat-value.hit { color: var(--c-success); }
.stat-value.miss { color: var(--c-danger); }
.stat-value.rate-value { color: var(--c-brand); }
.stat-value em { font-size: 16px; color: var(--c-brand); font-style: normal; font-weight: 700; margin-left: 2px; }

.rate-bar {
  height: 6px;
  background: var(--border-default);
  border-radius: 3px;
  overflow: hidden;
}

.rate-bar-fill {
  height: 100%;
  background: var(--c-brand);
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* ===== 필터 칩 ===== */
.filter-chips { display: flex; gap: 4px; flex-wrap: wrap; padding: 3px; background: var(--bg-subtle); border-radius: 8px; }

.filter-chip {
  padding: 6px 12px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  color: var(--c-text-500);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-chip:hover { color: var(--text-primary); }

.filter-chip.active {
  background: var(--c-brand);
  color: white;
  box-shadow: 0 3px 8px rgba(147, 51, 234, 0.25);
}

/* ===== 히스토리 ===== */
.empty { padding: 40px 0; text-align: center; font-size: 13px; color: var(--c-text-400); }

.history-list { list-style: none; padding: 0; margin: 0; }

.history-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid var(--border-default);
}

@media (min-width: 768px) { .history-row { gap: 16px; } }

.history-row:first-child { border-top: none; padding-top: 4px; }

.result-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 800;
  padding: 6px 11px;
  border-radius: 7px;
  background: var(--c-danger);
  color: white;
  flex-shrink: 0;
  letter-spacing: 0.2px;
  min-width: 62px;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(239, 68, 68, 0.2);
}

.result-tag.hit {
  background: var(--c-success);
  box-shadow: 0 3px 8px rgba(22, 163, 74, 0.22);
}

.history-body { flex: 1; min-width: 0; }

.battle-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.2px;
}

.prediction-line { font-size: 12px; color: var(--c-text-500); font-weight: 500; }
.prediction-line strong { color: var(--text-primary); font-weight: 700; margin: 0 2px; }
.prediction-line .sep { margin: 0 6px; color: var(--c-text-300); }

.history-date {
  font-size: 12px;
  color: var(--c-text-400);
  font-weight: 600;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.state-note {
  text-align: center;
  padding: 18px 0 0;
  font-size: 12px;
  color: var(--c-text-400);
  font-weight: 500;
}

.load-sentinel {
  display: flex;
  justify-content: center;
  padding: 20px 0 0;
}

.load-more-btn {
  padding: 9px 20px;
  border: 1px solid var(--border-strong);
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.load-more-btn:hover { border-color: var(--c-brand); color: var(--c-brand); background: var(--c-brand-soft); }
</style>
