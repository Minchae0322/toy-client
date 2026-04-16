<template>
  <div class="admin-container">
    <main class="main-content">
      <!-- 헤더 -->
      <header class="page-header">
        <div class="header-left">
          <h2>보상 시스템 관리</h2>
          <p class="header-desc">뱃지와 미션을 관리합니다</p>
        </div>
        <div class="header-right">
          <span class="admin-badge">관리자</span>
        </div>
      </header>

      <!-- 탭 -->
      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span v-if="tab.count != null" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- ====== 뱃지 탭 ====== -->
      <div v-if="activeTab === 'badges'" class="tab-panel">
        <div class="panel-toolbar">
          <div class="filter-group">
            <select v-model="badgeCategoryFilter" class="filter-select" @change="loadBadges">
              <option value="">전체 카테고리</option>
              <option value="BRAG">자랑</option>
              <option value="ACTIVITY">활동</option>
              <option value="EVENT">이벤트</option>
              <option value="SPECIAL">특별</option>
            </select>
          </div>
          <button class="primary-btn" @click="openBadgeForm()">+ 뱃지 추가</button>
        </div>

        <div v-if="badgeLoading" class="loading-state"><div class="spinner"></div><p>불러오는 중...</p></div>

        <div v-else-if="!badges.length" class="empty-state">
          <p>등록된 뱃지가 없습니다</p>
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th class="col-icon">아이콘</th>
              <th class="col-name">뱃지명</th>
              <th>코드</th>
              <th>카테고리</th>
              <th>시즌</th>
              <th class="col-actions">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="badge in badges" :key="badge.id">
              <td class="col-icon">
                <span class="badge-emoji">{{ badge.iconEmoji || '🏷️' }}</span>
              </td>
              <td class="col-name">
                <div class="name-cell">
                  <strong>{{ badge.name }}</strong>
                  <span class="desc">{{ badge.description }}</span>
                </div>
              </td>
              <td><code class="code-tag">{{ badge.code }}</code></td>
              <td><span class="category-tag">{{ badge.category }}</span></td>
              <td>{{ badge.isSeasonal ? badge.seasonCode : '상시' }}</td>
              <td class="col-actions">
                <button class="icon-btn edit" title="수정" @click="openBadgeForm(badge)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                </button>
                <button class="icon-btn delete" title="비활성화" @click="handleDeleteBadge(badge)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ====== 미션 탭 ====== -->
      <div v-if="activeTab === 'missions'" class="tab-panel">
        <div class="panel-toolbar">
          <button class="secondary-btn" @click="loadFixedCandidates">고정 후보 보기</button>
          <button class="primary-btn" @click="openMissionForm()">+ 미션 추가</button>
        </div>

        <div v-if="missionLoading" class="loading-state"><div class="spinner"></div><p>불러오는 중...</p></div>

        <div v-else-if="!missions.length" class="empty-state">
          <p>등록된 미션이 없습니다</p>
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th class="col-name">미션명</th>
              <th>코드</th>
              <th>난이도</th>
              <th>목표</th>
              <th>보상</th>
              <th>고정후보</th>
              <th class="col-actions">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in missions" :key="m.id">
              <td class="col-name">
                <div class="name-cell">
                  <strong>{{ m.title }}</strong>
                  <span class="desc">{{ m.description }}</span>
                </div>
              </td>
              <td><code class="code-tag">{{ m.code }}</code></td>
              <td>
                <span class="diff-tag" :class="m.difficulty?.toLowerCase()">
                  {{ difficultyLabel(m.difficulty) }}
                </span>
              </td>
              <td class="num">{{ m.targetCount }}</td>
              <td class="num">{{ m.rewardExp }} EXP</td>
              <td>{{ m.isFixedCandidate ? '✓' : '' }}</td>
              <td class="col-actions">
                <button class="icon-btn edit" title="수정" @click="openMissionForm(m)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                </button>
                <button class="icon-btn delete" title="비활성화" @click="handleDeleteMission(m)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ====== 뱃지 폼 모달 ====== -->
      <Teleport to="body">
        <div v-if="showBadgeModal" class="modal-overlay" @click.self="showBadgeModal = false">
          <div class="modal">
            <h3>{{ editingBadge ? '뱃지 수정' : '뱃지 추가' }}</h3>
            <form class="form" @submit.prevent="submitBadge">
              <label>
                코드 <span class="req">*</span>
                <input v-model="badgeForm.code" type="text" required :disabled="!!editingBadge" placeholder="BUY_PLACE_SHARER" />
              </label>
              <label>
                이름 <span class="req">*</span>
                <input v-model="badgeForm.name" type="text" required placeholder="구매처 쉐어러" />
              </label>
              <label>
                설명
                <input v-model="badgeForm.description" type="text" placeholder="구매처를 3회 이상 공유" />
              </label>
              <div class="row-2">
                <label>
                  이모지
                  <input v-model="badgeForm.iconEmoji" type="text" placeholder="🏪" />
                </label>
                <label>
                  카테고리 <span class="req">*</span>
                  <select v-model="badgeForm.category" required>
                    <option value="BRAG">자랑</option>
                    <option value="ACTIVITY">활동</option>
                    <option value="EVENT">이벤트</option>
                    <option value="SPECIAL">특별</option>
                  </select>
                </label>
              </div>
              <label>
                아이콘 이미지 URL
                <input v-model="badgeForm.iconImageUrl" type="text" placeholder="https://..." />
              </label>
              <div class="row-2">
                <label class="check-label">
                  <input v-model="badgeForm.isSeasonal" type="checkbox" />
                  시즌 뱃지
                </label>
                <label v-if="badgeForm.isSeasonal">
                  시즌 코드
                  <input v-model="badgeForm.seasonCode" type="text" placeholder="2026-Q2" />
                </label>
              </div>
              <div class="form-actions">
                <button type="button" class="secondary-btn" @click="showBadgeModal = false">취소</button>
                <button type="submit" class="primary-btn" :disabled="badgeSubmitting">
                  {{ badgeSubmitting ? '처리 중...' : (editingBadge ? '수정' : '추가') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- ====== 미션 폼 모달 ====== -->
      <Teleport to="body">
        <div v-if="showMissionModal" class="modal-overlay" @click.self="showMissionModal = false">
          <div class="modal">
            <h3>{{ editingMission ? '미션 수정' : '미션 추가' }}</h3>
            <form class="form" @submit.prevent="submitMission">
              <label>
                코드 <span class="req">*</span>
                <input v-model="missionForm.code" type="text" required :disabled="!!editingMission" placeholder="PRESS_FIRE_5" />
              </label>
              <label>
                제목 <span class="req">*</span>
                <input v-model="missionForm.title" type="text" required placeholder="불꽃 5개 누르기" />
              </label>
              <label>
                설명
                <input v-model="missionForm.description" type="text" placeholder="피드에 불꽃 이모지를 5번 누르세요" />
              </label>
              <div class="row-3">
                <label>
                  난이도 <span class="req">*</span>
                  <select v-model="missionForm.difficulty" required>
                    <option value="EASY">쉬움 (20)</option>
                    <option value="NORMAL">보통 (50)</option>
                    <option value="HARD">어려움 (100)</option>
                  </select>
                </label>
                <label>
                  목표 횟수 <span class="req">*</span>
                  <input v-model.number="missionForm.targetCount" type="number" min="1" required />
                </label>
                <label>
                  보상 EXP <span class="req">*</span>
                  <input v-model.number="missionForm.rewardExp" type="number" min="1" required />
                </label>
              </div>
              <div class="row-2">
                <label class="check-label">
                  <input v-model="missionForm.grantsGachaTicket" type="checkbox" />
                  가챠 티켓 지급
                </label>
                <label class="check-label">
                  <input v-model="missionForm.isFixedCandidate" type="checkbox" />
                  고정 후보 미션
                </label>
              </div>
              <div class="form-actions">
                <button type="button" class="secondary-btn" @click="showMissionModal = false">취소</button>
                <button type="submit" class="primary-btn" :disabled="missionSubmitting">
                  {{ missionSubmitting ? '처리 중...' : (editingMission ? '수정' : '추가') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>

      <!-- 토스트 -->
      <Transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { rewardsService } from '@/services/RewardsService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const { open } = useConfirmDialog()

const activeTab = ref('badges')
const tabs = ref([
  { id: 'badges', label: '뱃지 관리', count: null },
  { id: 'missions', label: '미션 관리', count: null },
])

// ── 토스트 ──
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null
function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value.show = false }, 3000)
}

// ==================== 뱃지 ====================
const badges = ref([])
const badgeLoading = ref(false)
const badgeCategoryFilter = ref('')
const showBadgeModal = ref(false)
const editingBadge = ref(null)
const badgeSubmitting = ref(false)
const badgeForm = ref(emptyBadgeForm())

function emptyBadgeForm() {
  return { code: '', name: '', description: '', iconEmoji: '', iconImageUrl: '', category: 'BRAG', isSeasonal: false, seasonCode: '' }
}

async function loadBadges() {
  badgeLoading.value = true
  try {
    const res = badgeCategoryFilter.value
      ? await rewardsService.getAdminBadgesByCategory(badgeCategoryFilter.value)
      : await rewardsService.getAdminBadges()
    badges.value = Array.isArray(res.data) ? res.data : []
    tabs.value[0].count = badges.value.length
  } catch (e) {
    showToast(e.message || '뱃지 목록 로드 실패', 'error')
  } finally {
    badgeLoading.value = false
  }
}

function openBadgeForm(badge = null) {
  editingBadge.value = badge
  badgeForm.value = badge
    ? { code: badge.code, name: badge.name, description: badge.description || '', iconEmoji: badge.iconEmoji || '', iconImageUrl: badge.iconImageUrl || '', category: badge.category, isSeasonal: badge.isSeasonal || false, seasonCode: badge.seasonCode || '' }
    : emptyBadgeForm()
  showBadgeModal.value = true
}

async function submitBadge() {
  badgeSubmitting.value = true
  try {
    if (editingBadge.value) {
      const { code, ...updateData } = badgeForm.value
      await rewardsService.updateBadge(editingBadge.value.id, updateData)
      showToast('뱃지가 수정되었습니다')
    } else {
      await rewardsService.createBadge(badgeForm.value)
      showToast('뱃지가 추가되었습니다')
    }
    showBadgeModal.value = false
    await loadBadges()
  } catch (e) {
    showToast(e.message || '뱃지 저장 실패', 'error')
  } finally {
    badgeSubmitting.value = false
  }
}

async function handleDeleteBadge(badge) {
  const confirmed = await open({
    type: 'danger',
    title: '뱃지 비활성화',
    message: `"${badge.name}" 뱃지를 비활성화합니다. 계속하시겠습니까?`
  })
  if (!confirmed) return
  try {
    await rewardsService.deleteBadge(badge.id)
    showToast('뱃지가 비활성화되었습니다')
    await loadBadges()
  } catch (e) {
    showToast(e.message || '뱃지 비활성화 실패', 'error')
  }
}

// ==================== 미션 ====================
const missions = ref([])
const missionLoading = ref(false)
const showMissionModal = ref(false)
const editingMission = ref(null)
const missionSubmitting = ref(false)
const missionForm = ref(emptyMissionForm())

function emptyMissionForm() {
  return { code: '', title: '', description: '', difficulty: 'EASY', targetCount: 1, rewardExp: 20, grantsGachaTicket: false, isFixedCandidate: false }
}

const difficultyLabel = (d) => ({ EASY: '쉬움', NORMAL: '보통', HARD: '어려움' }[d] || d)

async function loadMissions() {
  missionLoading.value = true
  try {
    const res = await rewardsService.getAdminMissions()
    missions.value = Array.isArray(res.data) ? res.data : []
    tabs.value[1].count = missions.value.length
  } catch (e) {
    showToast(e.message || '미션 목록 로드 실패', 'error')
  } finally {
    missionLoading.value = false
  }
}

async function loadFixedCandidates() {
  missionLoading.value = true
  try {
    const res = await rewardsService.getFixedCandidateMissions()
    missions.value = Array.isArray(res.data) ? res.data : []
    showToast(`고정 후보 ${missions.value.length}개`)
  } catch (e) {
    showToast(e.message || '고정 후보 로드 실패', 'error')
  } finally {
    missionLoading.value = false
  }
}

function openMissionForm(mission = null) {
  editingMission.value = mission
  missionForm.value = mission
    ? { code: mission.code, title: mission.title, description: mission.description || '', difficulty: mission.difficulty, targetCount: mission.targetCount, rewardExp: mission.rewardExp, grantsGachaTicket: mission.grantsGachaTicket || false, isFixedCandidate: mission.isFixedCandidate || false }
    : emptyMissionForm()
  showMissionModal.value = true
}

async function submitMission() {
  missionSubmitting.value = true
  try {
    if (editingMission.value) {
      const { code, ...updateData } = missionForm.value
      await rewardsService.updateMission(editingMission.value.id, updateData)
      showToast('미션이 수정되었습니다')
    } else {
      await rewardsService.createMission(missionForm.value)
      showToast('미션이 추가되었습니다')
    }
    showMissionModal.value = false
    await loadMissions()
  } catch (e) {
    showToast(e.message || '미션 저장 실패', 'error')
  } finally {
    missionSubmitting.value = false
  }
}

async function handleDeleteMission(mission) {
  const confirmed = await open({
    type: 'danger',
    title: '미션 비활성화',
    message: `"${mission.title}" 미션을 비활성화합니다. 계속하시겠습니까?`
  })
  if (!confirmed) return
  try {
    await rewardsService.deleteMission(mission.id)
    showToast('미션이 비활성화되었습니다')
    await loadMissions()
  } catch (e) {
    showToast(e.message || '미션 비활성화 실패', 'error')
  }
}

// ── 초기 로드 ──
onMounted(async () => {
  await Promise.all([loadBadges(), loadMissions()])
})
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: #f8f9fa;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

@media (min-width: 768px) { .main-content { padding: 32px 24px; } }
@media (min-width: 1024px) { .main-content { padding: 40px 32px; } }

/* 헤더 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.header-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.admin-badge {
  font-size: 11px;
  font-weight: 700;
  color: #7c3aed;
  background: #f5f3ff;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #e9d5ff;
}

/* 탭 */
.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 10px;
}

.tab-btn {
  flex: 1;
  padding: 9px 16px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  border-radius: 7px;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s;
}

.tab-btn:hover { color: #0f172a; }
.tab-btn.active { background: white; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

.tab-count {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 4px;
}

.tab-btn.active .tab-count { background: #f5f3ff; color: #7c3aed; }

/* 툴바 */
.panel-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-group { display: flex; gap: 8px; align-items: center; }

.filter-select {
  padding: 7px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  color: #334155;
  background: white;
  cursor: pointer;
}

.primary-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #7c3aed;
  color: white;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}
.primary-btn:hover { background: #6d28d9; }
.primary-btn:disabled { background: #cbd5e1; cursor: not-allowed; }

.secondary-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s;
}
.secondary-btn:hover { border-color: #7c3aed; color: #7c3aed; }

/* 테이블 */
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.data-table th {
  text-align: left;
  padding: 12px 14px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.data-table td {
  padding: 14px;
  font-size: 13px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tbody tr:hover { background: #fafbfc; }
.data-table tbody tr:last-child td { border-bottom: none; }

.col-icon { width: 50px; text-align: center; }
.col-name { min-width: 180px; }
.col-actions { width: 90px; text-align: right; }
.num { font-variant-numeric: tabular-nums; font-weight: 700; }

.badge-emoji { font-size: 22px; }

.name-cell { display: flex; flex-direction: column; gap: 3px; }
.name-cell strong { font-size: 13px; font-weight: 700; color: #0f172a; }
.name-cell .desc { font-size: 11.5px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px; }

.code-tag {
  font-size: 11px;
  font-family: 'SFMono-Regular', monospace;
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 4px;
  color: #475569;
}

.category-tag {
  font-size: 11px;
  font-weight: 600;
  background: #f5f3ff;
  color: #7c3aed;
  padding: 3px 8px;
  border-radius: 5px;
}

.diff-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 5px;
}
.diff-tag.easy { background: #dcfce7; color: #16a34a; }
.diff-tag.normal { background: #fef9c3; color: #ca8a04; }
.diff-tag.hard { background: #fee2e2; color: #ef4444; }

.icon-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.icon-btn.edit { color: #64748b; }
.icon-btn.edit:hover { background: #f1f5f9; color: #0f172a; }
.icon-btn.delete { color: #94a3b8; }
.icon-btn.delete:hover { background: #fef2f2; color: #ef4444; }

/* 상태 */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
  font-size: 14px;
  background: white;
  border-radius: 12px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e2e8f0;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: white;
  border-radius: 14px;
  padding: 28px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.modal h3 {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 20px;
}

.form { display: flex; flex-direction: column; gap: 14px; }

.form label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.form input[type="text"],
.form input[type="number"],
.form select {
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  color: #0f172a;
  transition: border-color 0.15s;
}

.form input:focus, .form select:focus { outline: none; border-color: #7c3aed; }
.form input:disabled { background: #f8fafc; color: #94a3b8; }

.req { color: #ef4444; }

.check-label {
  flex-direction: row !important;
  align-items: center !important;
  gap: 8px !important;
  font-size: 13px !important;
  cursor: pointer;
}

.check-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: #7c3aed; }

.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

@media (max-width: 480px) {
  .row-2, .row-3 { grid-template-columns: 1fr; }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

/* 토스트 */
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  z-index: 2000;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.toast.success { background: #0f172a; color: white; }
.toast.error { background: #ef4444; color: white; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 12px); }

/* 반응형 테이블 스크롤 */
@media (max-width: 768px) {
  .data-table { display: block; overflow-x: auto; }
}
</style>
