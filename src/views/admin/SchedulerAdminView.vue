<template>
  <div class="admin-container">
    <main class="main-content">
      <header class="page-header">
        <div class="header-left">
          <h2>핫 스코어 관리</h2>
          <p class="header-desc">시간 상수를 바꾸고 전체 재계산을 돌립니다. 평상시 점수는 참여가 생길 때 행 단위로 자동 갱신됩니다</p>
        </div>
        <div class="header-right">
          <span class="admin-badge">관리자</span>
        </div>
      </header>

      <div class="notice">
        <Info :size="16" class="notice-icon" />
        <div>
          <p>점수 = log10(참여도) + 기준시각 ÷ <strong>시간 상수</strong>. 상수는 "참여도 10배 = 이 시간"이라는 뜻입니다. 14일이면 하루 전 글이 오늘 글을 이기려면 참여도가 약 1.2배, 14일 전 글은 10배 필요합니다.</p>
          <p>상수를 바꾸면 저장된 점수의 기준이 달라지므로 <strong>저장과 동시에 그 도메인 전체를 다시 계산</strong>합니다. 동기 실행이라 끝날 때까지 실행 중으로 표시되고 다른 버튼은 잠깁니다.</p>
        </div>
      </div>

      <section class="block">
        <h3>시간 상수</h3>
        <div v-if="configLoading" class="loading-state"><div class="spinner"></div><p>불러오는 중...</p></div>
        <div v-else-if="configError" class="empty-state">
          <p>{{ configError }}</p>
          <button class="secondary-btn" @click="loadConfig">다시 시도</button>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th class="col-name">도메인</th>
              <th>현재</th>
              <th>새 값 (일)</th>
              <th class="col-result">마지막 변경</th>
              <th class="col-actions">적용</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in config" :key="c.domain" :class="{ running: runningKey === 'config:' + c.domain }">
              <td class="col-name">
                <div class="name-cell">
                  <strong>{{ DOMAIN_META[c.domain]?.label || c.domain }}</strong>
                  <span class="desc">{{ DOMAIN_META[c.domain]?.hint || '' }}</span>
                </div>
              </td>
              <td>
                <span class="num">{{ formatDays(c.days) }}</span>
                <span class="sub">{{ c.timeDivisorSeconds.toLocaleString() }}초</span>
                <span v-if="c.overridden" class="tag">변경됨 (기본 {{ formatDays(c.defaultSeconds / 86400) }})</span>
              </td>
              <td>
                <input
                  v-model.number="draftDays[c.domain]"
                  type="number"
                  min="0.05"
                  step="0.5"
                  class="days-input"
                  :disabled="runningKey !== null"
                  @keyup.enter="applyDivisor(c)"
                />
              </td>
              <td class="col-result">
                <template v-if="runningKey === 'config:' + c.domain">
                  <span class="result running-text"><Loader2 :size="14" class="spin" /> 저장 후 재계산 중 · {{ runningSeconds }}초</span>
                </template>
                <template v-else-if="lastResult['config:' + c.domain]">
                  <span class="result" :class="lastResult['config:' + c.domain].ok ? 'ok' : 'fail'">
                    <CheckCircle2 v-if="lastResult['config:' + c.domain].ok" :size="14" />
                    <XCircle v-else :size="14" />
                    <span class="num">{{ formatMs(lastResult['config:' + c.domain].elapsedMs) }}</span>
                    <span v-if="lastResult['config:' + c.domain].recalculated != null" class="at">{{ lastResult['config:' + c.domain].recalculated.toLocaleString() }}건</span>
                    <span class="at">{{ lastResult['config:' + c.domain].at }}</span>
                  </span>
                  <span v-if="!lastResult['config:' + c.domain].ok" class="err">{{ lastResult['config:' + c.domain].error }}</span>
                </template>
                <span v-else class="muted">-</span>
              </td>
              <td class="col-actions">
                <button
                  class="primary-btn run-btn"
                  :disabled="runningKey !== null || !isChanged(c)"
                  @click="applyDivisor(c)"
                >
                  <Loader2 v-if="runningKey === 'config:' + c.domain" :size="14" class="spin" />
                  <Save v-else :size="14" />
                  {{ runningKey === 'config:' + c.domain ? '실행 중' : '저장 후 재계산' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="block">
        <h3>전체 재계산만</h3>
        <p class="block-desc">상수는 그대로 두고 저장된 점수만 지금 상수로 다시 씁니다. 배포 직후 한 번, 그 외엔 쓸 일이 없습니다.</p>

      <table v-if="config.length" class="data-table">
        <thead>
          <tr>
            <th class="col-name">도메인</th>
            <th>하는 일</th>
            <th class="col-result">마지막 실행</th>
            <th class="col-actions">실행</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in config" :key="c.domain" :class="{ running: runningKey === 'recalc:' + c.domain }">
            <td class="col-name">
              <div class="name-cell">
                <strong>{{ DOMAIN_META[c.domain]?.label || c.domain }}</strong>
                <span class="desc">현재 상수 {{ formatDays(c.days) }}</span>
              </div>
            </td>
            <td class="what">{{ DOMAIN_META[c.domain]?.what || '-' }}</td>
            <td class="col-result">
              <template v-if="runningKey === 'recalc:' + c.domain">
                <span class="result running-text"><Loader2 :size="14" class="spin" /> 실행 중 · {{ runningSeconds }}초</span>
              </template>
              <template v-else-if="lastResult['recalc:' + c.domain]">
                <span class="result" :class="lastResult['recalc:' + c.domain].ok ? 'ok' : 'fail'">
                  <CheckCircle2 v-if="lastResult['recalc:' + c.domain].ok" :size="14" />
                  <XCircle v-else :size="14" />
                  <span class="num">{{ formatMs(lastResult['recalc:' + c.domain].elapsedMs) }}</span>
                  <span v-if="lastResult['recalc:' + c.domain].recalculated != null" class="at">{{ lastResult['recalc:' + c.domain].recalculated.toLocaleString() }}건</span>
                  <span class="at">{{ lastResult['recalc:' + c.domain].at }}</span>
                </span>
                <span v-if="!lastResult['recalc:' + c.domain].ok" class="err">{{ lastResult['recalc:' + c.domain].error }}</span>
              </template>
              <span v-else class="muted">-</span>
            </td>
            <td class="col-actions">
              <button class="primary-btn run-btn" :disabled="runningKey !== null" @click="runRecalculate(c)">
                <Loader2 v-if="runningKey === 'recalc:' + c.domain" :size="14" class="spin" />
                <Play v-else :size="14" />
                {{ runningKey === 'recalc:' + c.domain ? '실행 중' : '실행' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </section>

      <section v-if="history.length" class="history">
        <h3>실행 기록 <span class="count">{{ history.length }}</span></h3>
        <ul>
          <li v-for="h in history" :key="h.id" :class="h.ok ? 'ok' : 'fail'">
            <span class="at">{{ h.at }}</span>
            <span class="key">{{ h.label }}</span>
            <span class="num">{{ h.ok ? formatMs(h.elapsedMs) : '실패' }}</span>
            <span v-if="!h.ok" class="err">{{ h.error }}</span>
          </li>
        </ul>
      </section>

      <Transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Play, Loader2, CheckCircle2, XCircle, Info, Save } from 'lucide-vue-next'
import { schedulerAdminService } from '@/services/SchedulerAdminService.js'

// 서버의 작업 키에 붙이는 표시용 메타. 서버에만 있는 키는 키 그대로 노출한다.
const DOMAIN_META = {
  feed: { label: '피드', hint: '작성 시각 기준', what: '저장된 hot_score를 지금 상수로 다시 씀. 배포 직후 옛 점수를 새 척도로 바꿀 때' },
  battle: { label: '배틀', hint: '시작일 기준', what: '진행 중 배틀의 hot_score를 지금 상수로 다시 씀' },
  product: { label: '제품', hint: '마지막 참여 시각 기준', what: '승인 제품의 popularity_score를 지금 상수로 다시 씀' }
}

const config = ref([])
const configLoading = ref(false)
const configError = ref('')
const draftDays = ref({})

const runningKey = ref(null)
const runningSeconds = ref(0)
let tickTimer = null

const lastResult = ref({})
const history = ref([])
let seq = 0

const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null
function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value.show = false }, 3000)
}

function nowLabel() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function formatMs(ms) {
  if (ms == null) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatDays(days) {
  if (days == null) return '-'
  const d = Number(days)
  return Number.isInteger(d) ? `${d}일` : `${d.toFixed(2)}일`
}

function isChanged(c) {
  const v = Number(draftDays.value[c.domain])
  return Number.isFinite(v) && v > 0 && Math.abs(v * 86400 - c.timeDivisorSeconds) >= 1
}

async function loadConfig() {
  configLoading.value = true
  configError.value = ''
  try {
    config.value = await schedulerAdminService.getHotScoreConfig()
    const draft = {}
    for (const c of config.value) draft[c.domain] = Math.round(c.days * 100) / 100
    draftDays.value = draft
  } catch (e) {
    configError.value = e.message || '시간 상수를 불러오지 못했습니다'
  } finally {
    configLoading.value = false
  }
}

async function applyDivisor(c) {
  if (runningKey.value || !isChanged(c)) return
  const days = Number(draftDays.value[c.domain])
  const seconds = Math.round(days * 86400)
  const key = 'config:' + c.domain
  const label = `${DOMAIN_META[c.domain]?.label || c.domain} 상수 ${formatDays(days)}`
  runningKey.value = key
  runningSeconds.value = 0
  tickTimer = setInterval(() => { runningSeconds.value += 1 }, 1000)

  const at = nowLabel()
  try {
    const result = await schedulerAdminService.updateHotScoreDivisor(c.domain, seconds)
    const entry = { ok: true, elapsedMs: result?.elapsedMs ?? null, recalculated: result?.recalculated ?? null, at }
    lastResult.value = { ...lastResult.value, [key]: entry }
    history.value.unshift({ id: ++seq, label, ...entry })
    showToast(`${label} 적용 · ${entry.recalculated?.toLocaleString?.() ?? '-'}건 재계산 · ${formatMs(entry.elapsedMs)}`)
    await loadConfig()
  } catch (e) {
    const entry = { ok: false, error: e.message || '적용 실패', at }
    lastResult.value = { ...lastResult.value, [key]: entry }
    history.value.unshift({ id: ++seq, label, ...entry })
    showToast(`${label} 실패: ${entry.error}`, 'error')
  } finally {
    clearInterval(tickTimer)
    tickTimer = null
    runningKey.value = null
  }
}

async function runRecalculate(c) {
  if (runningKey.value) return
  const key = 'recalc:' + c.domain
  const label = `${DOMAIN_META[c.domain]?.label || c.domain} 전체 재계산`
  runningKey.value = key
  runningSeconds.value = 0
  tickTimer = setInterval(() => { runningSeconds.value += 1 }, 1000)

  const at = nowLabel()
  try {
    const result = await schedulerAdminService.recalculate(c.domain)
    const entry = { ok: true, elapsedMs: result?.elapsedMs ?? null, recalculated: result?.recalculated ?? null, at }
    lastResult.value = { ...lastResult.value, [key]: entry }
    history.value.unshift({ id: ++seq, label, ...entry })
    showToast(`${label} 완료 · ${entry.recalculated?.toLocaleString?.() ?? '-'}건 · ${formatMs(entry.elapsedMs)}`)
  } catch (e) {
    const entry = { ok: false, error: e.message || '실행 실패', at }
    lastResult.value = { ...lastResult.value, [key]: entry }
    history.value.unshift({ id: ++seq, label, ...entry })
    showToast(`${label} 실패: ${entry.error}`, 'error')
  } finally {
    clearInterval(tickTimer)
    tickTimer = null
    runningKey.value = null
  }
}

onMounted(loadConfig)
onBeforeUnmount(() => {
  if (tickTimer) clearInterval(tickTimer)
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<style scoped>
.admin-container { min-height: 100vh; background: var(--bg-base); }
.main-content { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }
@media (min-width: 768px) { .main-content { padding: 32px 24px; } }
@media (min-width: 1024px) { .main-content { padding: 40px 32px; } }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.page-header h2 { font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
.header-desc { font-size: 13px; color: var(--c-text-500); margin-top: 4px; }
.admin-badge { font-size: 11px; font-weight: 700; color: var(--c-brand-hover); background: var(--c-brand-soft); padding: 4px 10px; border-radius: 6px; border: 1px solid var(--c-brand-soft); }

.notice { display: flex; gap: 10px; align-items: flex-start; background: var(--bg-subtle); border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; font-size: 12.5px; color: var(--c-text-500); line-height: 1.5; }
.notice-icon { flex-shrink: 0; margin-top: 2px; color: var(--c-brand-hover); }
.notice p + p { margin-top: 4px; }
.notice strong { color: var(--c-text-600); }

.data-table { width: 100%; border-collapse: collapse; background: var(--bg-elevated); border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.data-table th { text-align: left; padding: 12px 14px; font-size: 11px; font-weight: 700; color: var(--c-text-500); text-transform: uppercase; letter-spacing: 0.5px; background: var(--bg-subtle); border-bottom: 1px solid var(--bg-subtle); }
.data-table td { padding: 14px; font-size: 13px; color: var(--c-text-600); border-bottom: 1px solid var(--bg-subtle); vertical-align: middle; }
.data-table tbody tr:hover { background: var(--bg-subtle); }
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr.running { background: var(--c-brand-soft); }

.col-name { min-width: 200px; }
.col-result { min-width: 170px; }
.col-actions { width: 110px; text-align: right; }
.cron { white-space: nowrap; font-weight: 600; }
.what { color: var(--c-text-500); font-size: 12.5px; }

.name-cell { display: flex; flex-direction: column; gap: 3px; }
.name-cell strong { font-size: 13px; font-weight: 700; color: var(--text-primary); }
.name-cell .desc { font-size: 11.5px; color: var(--c-text-400); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }

.result { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; }
.result.ok { color: var(--c-success, #16a34a); }
.result.fail { color: var(--c-danger, #ef4444); }
.result .at { font-weight: 500; color: var(--c-text-400); font-size: 11.5px; }
.running-text { color: var(--c-brand-hover); }
.num { font-variant-numeric: tabular-nums; }
.muted { color: var(--c-text-300); }
.err { display: block; margin-top: 4px; font-size: 11.5px; color: var(--c-danger, #ef4444); }

.primary-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border: none; border-radius: 8px; background: var(--c-brand-hover); color: white; font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; transition: background 0.15s; }
.primary-btn:disabled { background: var(--c-text-300); cursor: not-allowed; }
.run-btn { min-width: 84px; justify-content: center; }
.secondary-btn { margin-top: 12px; padding: 8px 16px; border: 1px solid var(--border-strong); border-radius: 8px; background: var(--bg-elevated); color: var(--c-text-600); font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: var(--c-text-400); font-size: 14px; background: var(--bg-elevated); border-radius: 12px; }
.spinner { width: 28px; height: 28px; border: 3px solid var(--border-strong); border-top-color: var(--c-brand-hover); border-radius: 50%; animation: spin 0.6s linear infinite; margin-bottom: 12px; }

  .block { margin-bottom: 28px; }
.block h3 { font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; }
.block-desc { font-size: 12.5px; color: var(--c-text-500); margin: -4px 0 10px; }
.sub { display: block; font-size: 11.5px; color: var(--c-text-400); font-variant-numeric: tabular-nums; }
.tag { display: inline-block; margin-top: 4px; font-size: 11px; font-weight: 700; color: var(--c-brand-hover); background: var(--c-brand-soft); padding: 2px 8px; border-radius: 999px; }
.days-input { width: 110px; padding: 8px 10px; border: 1px solid var(--border-strong); border-radius: 8px; font-size: 13px; font-weight: 700; font-family: inherit; color: var(--text-primary); background: var(--bg-elevated); font-variant-numeric: tabular-nums; }
.days-input:focus { outline: none; border-color: var(--c-brand-hover); }
.days-input:disabled { color: var(--c-text-300); }

.history { margin-top: 28px; }
.history h3 { font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.history .count { font-size: 11px; font-weight: 700; color: var(--c-text-500); background: var(--bg-subtle); padding: 2px 8px; border-radius: 999px; }
.history ul { list-style: none; padding: 0; margin: 0; background: var(--bg-elevated); border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.history li { display: flex; align-items: center; gap: 14px; padding: 10px 14px; font-size: 12.5px; border-bottom: 1px solid var(--bg-subtle); }
.history li:last-child { border-bottom: none; }
.history .at { color: var(--c-text-400); font-variant-numeric: tabular-nums; white-space: nowrap; }
.history .key { flex: 1; font-weight: 600; color: var(--c-text-600); }
.history li.ok .num { color: var(--c-success, #16a34a); font-weight: 700; }
.history li.fail .num { color: var(--c-danger, #ef4444); font-weight: 700; }
.history .err { margin: 0; }

.toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 700; z-index: 2000; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.toast.success { background: var(--c-ink-900); color: white; }
.toast.error { background: var(--c-danger); color: white; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 12px); }

@media (max-width: 768px) {
  .data-table { display: block; overflow-x: auto; }
  .what { display: none; }
}
</style>
