<template>
  <div class="result-page">
    <header class="result-header">
      <button class="back-btn" aria-label="뒤로 가기" @click="goBack">
        <ChevronLeft :size="22" />
      </button>
      <h1 class="head-title">{{ battle?.title || '결과' }}</h1>
      <span class="head-spacer" />
    </header>

    <main class="result-main">
      <div v-if="loading" class="state-block">
        <div class="spinner"></div>
        <span>결과 집계 중…</span>
      </div>

      <div v-else-if="!ranking.length" class="empty-state">
        <p>아직 집계된 결과가 없어요</p>
      </div>

      <div v-else>
        <!-- 상위 3등 — 시각 강조 -->
        <section class="podium">
          <div
            v-for="item in topThree"
            :key="item.id"
            class="podium-card"
            :class="`pos-${item.rank}`"
          >
            <div class="medal" aria-hidden="true">
              <component :is="medalIcon(item.rank)" :size="16" :stroke-width="2.6" />
              <span>{{ item.rank }}위</span>
            </div>
            <div class="podium-img">
              <img :src="item.imageUrl || PLACEHOLDER" :alt="item.displayName" @error="onImgError" />
            </div>
            <h3 class="podium-name">{{ item.displayName }}</h3>
            <div class="podium-stats">
              <span class="stat-flame"><Flame :size="11" :stroke-width="2.6" />{{ item.strongPickCount }}</span>
              <span class="stat-heart"><Heart :size="11" :stroke-width="2.6" />{{ item.pickCount }}</span>
              <span class="stat-pass"><X :size="11" :stroke-width="2.6" />{{ item.passCount }}</span>
            </div>
            <div class="podium-score">{{ item.score }}점</div>
          </div>
        </section>

        <!-- 4위 이하 — 리스트 -->
        <section v-if="restRanking.length" class="rest-list">
          <h2 class="list-title">전체 순위</h2>
          <ul>
            <li v-for="item in restRanking" :key="item.id" class="rest-row">
              <span class="rest-rank">{{ item.rank }}</span>
              <img class="rest-thumb" :src="item.imageUrl || PLACEHOLDER" :alt="item.displayName" @error="onImgError" />
              <div class="rest-body">
                <span class="rest-name">{{ item.displayName }}</span>
                <div class="rest-stats">
                  <span><Flame :size="10" :stroke-width="2.4" />{{ item.strongPickCount }}</span>
                  <span><Heart :size="10" :stroke-width="2.4" />{{ item.pickCount }}</span>
                  <span><X :size="10" :stroke-width="2.4" />{{ item.passCount }}</span>
                </div>
              </div>
              <span class="rest-score">{{ item.score }}</span>
            </li>
          </ul>
        </section>

        <button class="back-to-swipe" @click="goBackToSwipe">
          더 스와이프하기
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, Flame, Heart, X, Crown, Medal, Award } from 'lucide-vue-next'
import { battleService } from '@/services/BattleService.js'
import { swipeBattleService } from '@/services/SwipeBattleService.js'

const route = useRoute()
const router = useRouter()
const battleId = computed(() => route.params.id)

const PLACEHOLDER = 'https://placehold.co/200x200?text=No+Image'

const battle = ref(null)
const ranking = ref([])
const loading = ref(true)

const topThree = computed(() => ranking.value.slice(0, 3))
const restRanking = computed(() => ranking.value.slice(3))

function medalIcon(rank) {
  if (rank === 1) return Crown
  if (rank === 2) return Medal
  return Award
}

function onImgError(e) { e.target.src = PLACEHOLDER }

async function load() {
  loading.value = true
  try {
    const [bRes, rRes] = await Promise.all([
      battleService.getBattle(battleId.value),
      swipeBattleService.getResult(battleId.value)
    ])
    battle.value = bRes?.data || null
    ranking.value = Array.isArray(rRes?.data?.items) ? rRes.data.items : []
  } catch (e) {
    console.error('[SwipeResult] 로드 실패:', e)
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'BattleList' })
}
function goBackToSwipe() {
  router.replace({ name: 'SwipeBattle', params: { id: battleId.value } })
}

onMounted(load)
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}
.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border-default);
  position: sticky;
  top: 0;
  z-index: 10;
}
.back-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border-strong);
  background: var(--bg-elevated);
  color: var(--c-text-600);
  border-radius: 10px;
  cursor: pointer;
}
.head-title {
  flex: 1;
  margin: 0;
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.head-spacer { width: 36px; }

.result-main {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 16px 60px;
}

.state-block, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--c-text-500);
}
.spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--bg-mute);
  border-top-color: var(--c-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== Podium (상위 3) ===== */
.podium {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 10px;
  align-items: flex-end;
  margin-bottom: 32px;
}
.podium-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  padding: 14px 10px 12px;
  transition: transform 0.2s;
}
.podium-card.pos-1 {
  order: 2; /* 가운데 */
  padding-top: 18px;
  border-color: #FFC93C;
  box-shadow: 0 8px 24px rgba(255, 201, 60, 0.18);
  transform: scale(1.04);
}
.podium-card.pos-2 { order: 1; }  /* 좌측 */
.podium-card.pos-3 { order: 3; }  /* 우측 */

.medal {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
}
.pos-1 .medal { background: #FEF3C7; color: #B45309; }
.pos-2 .medal { background: #E2E8F0; color: #475569; }
.pos-3 .medal { background: #FED7AA; color: #9A3412; }

.podium-img {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-mute);
  border: 3px solid var(--bg-elevated);
  margin-bottom: 8px;
}
.pos-1 .podium-img { width: 92px; height: 92px; border-color: #FFC93C; }

.podium-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.podium-name {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pos-1 .podium-name { font-size: 13.5px; }

.podium-stats {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  color: var(--c-text-500);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin-bottom: 6px;
}
.podium-stats span {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.stat-flame { color: #F59E0B; }
.stat-heart { color: var(--c-brand); }
.stat-pass { color: #94A3B8; }

.podium-score {
  font-size: 14px;
  font-weight: 900;
  color: var(--c-brand);
  letter-spacing: -0.02em;
}
.pos-1 .podium-score { font-size: 16px; color: #B45309; }

/* ===== 전체 순위 리스트 ===== */
.list-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}
.rest-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rest-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 10px;
}
.rest-rank {
  width: 24px;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
  color: var(--c-text-500);
  font-variant-numeric: tabular-nums;
}
.rest-thumb {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--bg-mute);
}
.rest-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.rest-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rest-stats {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  color: var(--c-text-500);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.rest-stats span {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.rest-stats span:nth-child(1) { color: #F59E0B; }
.rest-stats span:nth-child(2) { color: var(--c-brand); }
.rest-stats span:nth-child(3) { color: #94A3B8; }

.rest-score {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.back-to-swipe {
  display: block;
  width: 100%;
  margin-top: 28px;
  padding: 13px;
  background: var(--c-brand);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.01em;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
}
.back-to-swipe:hover { background: var(--c-brand-hover); }

@media (max-width: 480px) {
  .podium { gap: 6px; }
  .podium-card { padding: 12px 6px 10px; }
  .podium-img { width: 64px; height: 64px; }
  .pos-1 .podium-img { width: 80px; height: 80px; }
}
</style>
