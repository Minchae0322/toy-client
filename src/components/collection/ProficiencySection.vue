<template>
  <div class="prof-layout">
    <!-- 내 숙련도 -->
    <div class="section-card">
      <header class="card-header">
        <div>
          <h3 class="section-title">내 숙련도</h3>
          <p class="section-sub">카테고리별 활동에 따라 등급이 올라가요</p>
        </div>
      </header>

      <div v-if="loading" class="empty">불러오는 중...</div>
      <div v-else-if="myProficiency.length === 0" class="empty">
        아직 활동한 카테고리가 없습니다.
      </div>

      <ul v-else class="proficiency-list">
        <li
          v-for="p in myProficiency"
          :key="p.categoryId"
          class="proficiency-row"
          :class="{ active: selectedCategoryId === p.categoryId }"
          @click="selectCategory(p.categoryId)"
        >
          <div class="prof-identity">
            <div class="category-chip">{{ p.category.name }}</div>
          </div>

          <div class="prof-progress-wrap">
            <div class="prof-meta-top">
              <span class="tier-badge" :style="{ color: p.tier.color, background: p.tier.bgColor }">
                <component :is="getProficiencyIcon(p.tier.tier)" :size="12" :stroke-width="2.2" />
                {{ p.tier.name }}
              </span>
              <span class="activity-count">{{ p.activity.toLocaleString() }}회</span>
            </div>
            <div class="prof-bar">
              <div
                class="prof-bar-fill"
                :style="{ width: progressPercent(p) + '%', background: p.tier.color }"
              ></div>
            </div>
            <div class="prof-hint">
              <template v-if="p.next">
                다음 등급 <strong>{{ p.next.name }}</strong>까지 {{ (p.next.minActivity - p.activity).toLocaleString() }}회
              </template>
              <template v-else>
                <span class="max">최고 등급 달성</span>
              </template>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- 카테고리 TOP 랭커 -->
    <div class="section-card">
      <header class="card-header">
        <div>
          <h3 class="section-title">TOP 랭커</h3>
          <p class="section-sub">카테고리별 상위 활동자</p>
        </div>
        <select v-model="selectedCategoryId" class="category-select">
          <option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">
            {{ c.name }}
          </option>
        </select>
      </header>

      <div v-if="rankersLoading" class="empty">불러오는 중...</div>
      <div v-else-if="rankers.length === 0" class="empty">랭킹 데이터가 없습니다.</div>

      <ol v-else class="ranker-list">
        <li
          v-for="r in rankers"
          :key="r.userId"
          class="ranker-row"
          :class="{ 'is-me': r.userId === userId }"
        >
          <div class="rank-index">
            <span class="rank-num" :class="`rank-${r.rank}`">{{ r.rank }}</span>
          </div>
          <span class="rank-nick">{{ r.nickname }}</span>
          <span v-if="r.userId === userId" class="me-chip">나</span>
          <span class="rank-activity">{{ r.activity.toLocaleString() }}회</span>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getProficiencyIcon } from '@/utils/collectionIcons.js'
import {
  fetchMyProficiency,
  fetchCategoryTopRankers,
  fetchCategories,
} from '@/api/rewardsApi.js'

const props = defineProps({
  userId: { type: String, required: true },
})

const categories = ref(fetchCategories())
const myProficiency = ref([])
const rankers = ref([])
const selectedCategoryId = ref(categories.value[0]?.categoryId || '')
const loading = ref(false)
const rankersLoading = ref(false)

function progressPercent(p) {
  if (!p.next) return 100
  return Math.min(
    Math.round(((p.activity - p.tier.minActivity) / (p.next.minActivity - p.tier.minActivity)) * 100),
    100
  )
}

async function loadProficiency() {
  loading.value = true
  try {
    const list = await fetchMyProficiency(props.userId)
    myProficiency.value = list
    if (list[0]) selectedCategoryId.value = list[0].categoryId
  } finally {
    loading.value = false
  }
}

async function loadRankers(categoryId) {
  rankersLoading.value = true
  try {
    rankers.value = await fetchCategoryTopRankers(categoryId, 10)
  } finally {
    rankersLoading.value = false
  }
}

function selectCategory(id) {
  selectedCategoryId.value = id
}

onMounted(loadProficiency)
watch(() => props.userId, loadProficiency)
watch(selectedCategoryId, (id) => { if (id) loadRankers(id) }, { immediate: true })
</script>

<style scoped>
.prof-layout { display: flex; flex-direction: column; gap: 28px; }

@media (min-width: 768px) { .prof-layout { gap: 36px; } }

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
  gap: 12px;
  flex-wrap: wrap;
}

.card-header > div { min-width: 0; flex: 1; }

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  line-height: 1.2;
}

@media (min-width: 768px) { .section-title { font-size: 18px; } }

.section-sub { font-size: 13px; color: var(--c-text-500); margin-top: 4px; font-weight: 500; }

.empty { padding: 40px 0; text-align: center; font-size: 13px; color: var(--c-text-400); }

/* ===== 숙련도 리스트 ===== */
.proficiency-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; }

.proficiency-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 18px 0;
  border-top: 1px solid var(--border-default);
  cursor: pointer;
  transition: background 0.15s;
}

@media (min-width: 768px) {
  .proficiency-row {
    grid-template-columns: 140px 1fr;
    gap: 24px;
    padding: 20px 12px;
    border-radius: 10px;
    align-items: center;
  }
}

.proficiency-row:first-child { border-top: none; padding-top: 4px; }
.proficiency-row:hover { background: var(--bg-subtle); }
.proficiency-row.active { background: var(--c-brand-soft); }

.prof-identity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-chip {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.prof-progress-wrap { min-width: 0; }

.prof-meta-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tier-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.activity-count {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text-600);
  letter-spacing: -0.2px;
  font-variant-numeric: tabular-nums;
}

.prof-bar {
  height: 4px;
  background: var(--border-default);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 7px;
}

.prof-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.prof-hint {
  font-size: 11.5px;
  color: var(--c-text-400);
  font-weight: 500;
}

.prof-hint strong { color: var(--text-primary); font-weight: 700; }
.prof-hint .max { color: var(--c-heat); font-weight: 700; }

/* ===== 랭커 ===== */
.category-select {
  padding: 8px 12px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: var(--bg-elevated);
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 600;
}

.category-select:hover { border-color: var(--c-brand); }
.category-select:focus { outline: none; border-color: var(--c-brand); box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.12); }

.ranker-list { list-style: none; padding: 0; margin: 0; }

.ranker-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  margin: 0 -14px;
  transition: background 0.15s ease;
}

.ranker-row + .ranker-row { margin-top: 2px; }

.ranker-row:nth-child(1) { background: var(--c-warning-soft); }
.ranker-row:nth-child(2) { background: var(--bg-subtle); }
.ranker-row:nth-child(3) { background: var(--c-heat-soft); }

.ranker-row.is-me { background: var(--c-brand-soft) !important; }

.rank-index {
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rank-num {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: var(--c-text-400);
  font-variant-numeric: tabular-nums;
  background: var(--border-default);
  border-radius: 6px;
}

.rank-num.rank-1 { background: var(--c-warning-soft); color: var(--c-warning); }
.rank-num.rank-2 { background: var(--border-strong); color: var(--c-text-600); }
.rank-num.rank-3 { background: var(--c-heat-soft); color: var(--c-heat); }

.rank-nick {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.2px;
}

.me-chip {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 7px;
  border-radius: 5px;
  background: var(--c-brand);
  color: white;
  letter-spacing: 0.3px;
}

.rank-activity {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text-600);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.2px;
}
</style>
