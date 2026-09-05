<template>
  <div class="admin-container">
    <main class="main-content">
      <header class="page-header">
        <div class="header-left">
          <h2>스케줄러 수동 실행</h2>
          <p class="header-desc">cron을 기다리지 않고 같은 작업을 지금 돌리고, 소요 시간을 확인합니다</p>
        </div>
        <div class="header-right">
          <span class="admin-badge">관리자</span>
        </div>
      </header>

      <div class="notice">
        <Info :size="16" class="notice-icon" />
        <div>
          <p>동기 실행입니다. 버튼을 누르면 작업이 끝날 때까지 <strong>실행 중</strong>으로 표시되고, 다른 작업은 잠깁니다.</p>
          <p>정각 작업 직후 15분(전체 재계산은 1시간) 안에는 ShedLock에 걸려 본문이 건너뛰어집니다. 그 경우 소요 시간이 수 ms로 나옵니다.</p>
        </div>
      </div>

      <div v-if="listLoading" class="loading-state"><div class="spinner"></div><p>작업 목록 불러오는 중...</p></div>

      <div v-else-if="listError" class="empty-state">
        <p>{{ listError }}</p>
        <button class="secondary-btn" @click="loadJobs">다시 시도</button>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th class="col-name">작업</th>
            <th>주기</th>
            <th>하는 일</th>
            <th class="col-result">마지막 실행</th>
            <th class="col-actions">실행</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="job in jobs" :key="job.key" :class="{ running: runningKey === job.key }">
            <td class="col-name">
              <div class="name-cell">
                <strong>{{ job.label }}</strong>
                <span class="desc">{{ job.key }}</span>
              </div>
            </td>
            <td class="cron">{{ job.cron }}</td>
            <td class="what">{{ job.what }}</td>
            <td class="col-result">
              <template v-if="runningKey === job.key">
                <span class="result running-text">
                  <Loader2 :size="14" class="spin" /> 실행 중 · {{ runningSeconds }}초
                </span>
              </template>
              <template v-else-if="lastResult[job.key]">
                <span class="result" :class="lastResult[job.key].ok ? 'ok' : 'fail'">
                  <CheckCircle2 v-if="lastResult[job.key].ok" :size="14" />
                  <XCircle v-else :size="14" />
                  <span class="num">{{ formatMs(lastResult[job.key].elapsedMs) }}</span>
                  <span class="at">{{ lastResult[job.key].at }}</span>
                </span>
                <span v-if="!lastResult[job.key].ok" class="err">{{ lastResult[job.key].error }}</span>
              </template>
              <span v-else class="muted">-</span>
            </td>
            <td class="col-actions">
              <button
                class="primary-btn run-btn"
                :disabled="runningKey !== null"
                @click="runJob(job)"
              >
                <Loader2 v-if="runningKey === job.key" :size="14" class="spin" />
                <Play v-else :size="14" />
                {{ runningKey === job.key ? '실행 중' : '실행' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

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
import { Play, Loader2, CheckCircle2, XCircle, Info } from 'lucide-vue-next'
import { schedulerAdminService } from '@/services/SchedulerAdminService.js'

// 서버의 작업 키에 붙이는 표시용 메타. 서버에만 있는 키는 키 그대로 노출한다.
const JOB_META = {
  'feed-hot-score.time-weight': { label: '피드 핫스코어 · 시간 가중치', cron: '매 정각', what: '최근 1시간 활동(updated_at)이 있는 피드의 hot_score 재계산' },
  'feed-hot-score.full': { label: '피드 핫스코어 · 전체 재계산', cron: '매일 03:00', what: '최근 30일 작성 피드 전부 hot_score 재계산 + decay 지수 갱신' },
  'battle-hot-score.time-weight': { label: '배틀 핫스코어 · 시간 가중치', cron: '매 정각', what: '최근 활동 배틀의 hot_score 재계산' },
  'battle-hot-score.full': { label: '배틀 핫스코어 · 전체 재계산', cron: '매일 02:00', what: '배틀 전체 hot_score 재계산' },
  'product-popularity.time-weight': { label: '제품 인기도 · 시간 가중치', cron: '매시 30분', what: '최근 활동 제품의 인기도 재계산' },
  'product-popularity.full': { label: '제품 인기도 · 전체 재계산', cron: '매일 01:00', what: '제품 전체 인기도 재계산' },
  'feed-trending': { label: '피드 트렌딩 스냅샷', cron: '매일 00:15', what: '전체 피드 view_count 스냅샷 + is_trending 마킹/해제' },
  'battle-deadline.d7': { label: '배틀 마감 D-7 알림', cron: '매 정각', what: '7일 뒤 마감 배틀 참여자에게 알림' },
  'battle-deadline.end': { label: '배틀 종료 알림', cron: '매 분', what: '방금 마감된 배틀 참여자에게 알림' }
}

const jobs = ref([])
const listLoading = ref(false)
const listError = ref('')

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

async function loadJobs() {
  listLoading.value = true
  listError.value = ''
  try {
    const keys = await schedulerAdminService.listJobs()
    jobs.value = keys.map((key) => ({ key, ...(JOB_META[key] || { label: key, cron: '-', what: '-' }) }))
  } catch (e) {
    listError.value = e.message || '작업 목록을 불러오지 못했습니다'
  } finally {
    listLoading.value = false
  }
}

async function runJob(job) {
  if (runningKey.value) return
  runningKey.value = job.key
  runningSeconds.value = 0
  tickTimer = setInterval(() => { runningSeconds.value += 1 }, 1000)

  const at = nowLabel()
  try {
    const result = await schedulerAdminService.run(job.key)
    const entry = { ok: true, elapsedMs: result?.elapsedMs ?? null, at }
    lastResult.value = { ...lastResult.value, [job.key]: entry }
    history.value.unshift({ id: ++seq, label: job.label, ...entry })
    showToast(`${job.label} 완료 · ${formatMs(entry.elapsedMs)}`)
  } catch (e) {
    const entry = { ok: false, error: e.message || '실행 실패', at }
    lastResult.value = { ...lastResult.value, [job.key]: entry }
    history.value.unshift({ id: ++seq, label: job.label, ...entry })
    showToast(`${job.label} 실패: ${entry.error}`, 'error')
  } finally {
    clearInterval(tickTimer)
    tickTimer = null
    runningKey.value = null
  }
}

onMounted(loadJobs)
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
