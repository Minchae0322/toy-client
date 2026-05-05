<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="visible" class="edit-modal-overlay" @click.self="onClose">
        <Transition name="dialog" appear>
          <div v-if="visible" class="edit-modal" role="dialog" aria-modal="true" aria-label="배틀 수정">
            <!-- Header -->
            <header class="modal-header">
              <div class="header-left">
                <div class="header-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </div>
                <div>
                  <div class="header-title">배틀 상세 수정</div>
                  <div class="header-sub">변경한 항목만 저장돼요</div>
                </div>
              </div>
              <button class="icon-btn" @click="onClose" aria-label="닫기">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </header>

            <!-- Lock notice -->
            <div v-if="hasParticipants" class="lock-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>이미 참여자가 있어 카테고리·기간·권한·투표 방식은 수정할 수 없어요.</span>
            </div>

            <!-- Body -->
            <div class="modal-body">
              <!-- 제목 -->
              <section class="field">
                <label class="field-label">
                  <span>제목</span>
                  <span class="char-count" :class="{ over: form.title.length > 50 }">
                    {{ form.title.length }}/50
                  </span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  class="text-input"
                  maxlength="60"
                  placeholder="배틀 제목"
                />
              </section>

              <!-- 설명 -->
              <section class="field">
                <label class="field-label">
                  <span>설명</span>
                  <span class="char-count" :class="{ over: form.description.length > 500 }">
                    {{ form.description.length }}/500
                  </span>
                </label>
                <textarea
                  v-model="form.description"
                  class="textarea-input"
                  rows="4"
                  maxlength="600"
                  placeholder="배틀에 대한 설명을 적어주세요"
                />
              </section>

              <!-- 카테고리 -->
              <section class="field">
                <label class="field-label">
                  <span>카테고리</span>
                  <span v-if="hasParticipants" class="lock-pill">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    잠김
                  </span>
                </label>
                <div :class="['locked-wrap', { locked: hasParticipants }]">
                  <CategoryChipSelector
                    v-model="form.subCategoryId"
                    content-type="BATTLE"
                  />
                </div>
              </section>

              <!-- 아이템 추가 권한 -->
              <section class="field">
                <label class="field-label">
                  <span>아이템 추가 권한</span>
                  <span v-if="hasParticipants" class="lock-pill">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    잠김
                  </span>
                </label>
                <div class="permission-list">
                  <button
                    v-for="opt in permissionOptions"
                    :key="opt.value"
                    type="button"
                    class="permission-row"
                    :class="{ selected: form.itemAddPermissionType === opt.value, disabled: hasParticipants }"
                    :disabled="hasParticipants"
                    @click="form.itemAddPermissionType = opt.value"
                  >
                    <div class="radio">
                      <div class="radio-dot"></div>
                    </div>
                    <div class="permission-text">
                      <div class="permission-title">{{ opt.title }}</div>
                      <div class="permission-desc">{{ opt.desc }}</div>
                    </div>
                  </button>
                </div>
              </section>

              <!-- 투표 방식 -->
              <section class="field">
                <label class="field-label">
                  <span>투표 방식</span>
                  <span v-if="hasParticipants" class="lock-pill">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    잠김
                  </span>
                </label>
                <div class="vote-type-grid">
                  <button
                    v-for="opt in voteTypeOptions"
                    :key="opt.value"
                    type="button"
                    class="vote-type-card"
                    :class="{ selected: form.voteType === opt.value, disabled: hasParticipants }"
                    :disabled="hasParticipants"
                    @click="form.voteType = opt.value"
                  >
                    <div class="vote-type-title">{{ opt.title }}</div>
                    <div class="vote-type-desc">{{ opt.desc }}</div>
                  </button>
                </div>
              </section>

              <!-- 기간 -->
              <section class="field">
                <label class="field-label">
                  <span>진행 기간</span>
                  <span v-if="hasParticipants" class="lock-pill">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    잠김
                  </span>
                </label>
                <div class="date-grid">
                  <div class="date-cell">
                    <label class="date-label">시작일</label>
                    <input
                      v-model="form.startDate"
                      type="date"
                      class="date-input"
                      :disabled="hasParticipants"
                    />
                  </div>
                  <div class="date-cell">
                    <label class="date-label">종료일</label>
                    <input
                      v-model="form.endDate"
                      type="date"
                      class="date-input"
                      :disabled="hasParticipants"
                    />
                  </div>
                  <div class="date-cell full">
                    <label class="date-label">투표 시작일</label>
                    <input
                      v-model="form.participationStartDate"
                      type="date"
                      class="date-input"
                      :disabled="hasParticipants"
                    />
                  </div>
                </div>
              </section>
            </div>

            <!-- Footer -->
            <footer class="modal-footer">
              <button class="btn-ghost" type="button" @click="onClose" :disabled="submitting">
                취소
              </button>
              <button class="btn-primary" type="button" @click="onSubmit" :disabled="!canSubmit || submitting">
                <span v-if="submitting" class="btn-spinner" />
                <span v-else>저장</span>
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import CategoryChipSelector from '@/components/common/CategoryChipSelector.vue'
import { battleService } from '@/services/BattleService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const props = defineProps({
  visible: { type: Boolean, default: false },
  battle: { type: Object, default: null },
  battleId: { type: [String, Number], default: null },
})
const emit = defineEmits(['close', 'updated'])

const { open } = useConfirmDialog()

const submitting = ref(false)

const permissionOptions = [
  { value: 'CREATOR_ONLY', title: '생성자만', desc: '배틀 생성자만 아이템을 추가할 수 있어요' },
  { value: 'PUBLIC_FREE', title: '누구나', desc: '모든 사용자가 자유롭게 아이템을 추가할 수 있어요' },
  { value: 'PUBLIC_APPROVAL', title: '승인 후', desc: '아이템 등록 후 생성자의 승인이 필요해요' },
]

const voteTypeOptions = [
  { value: 'SINGLE', title: '1인 1표', desc: '한 명당 하나의 아이템에만 투표' },
  { value: 'MULTIPLE', title: '순위 투표', desc: '1~3개 아이템에 순위를 매겨 투표' },
]

const form = reactive({
  title: '',
  description: '',
  subCategoryId: null,
  itemAddPermissionType: 'CREATOR_ONLY',
  startDate: '',
  endDate: '',
  participationStartDate: '',
  voteType: 'SINGLE',
})

const original = ref({})

const hasParticipants = computed(() => {
  const n = props.battle?.totalParticipants
  return typeof n === 'number' ? n > 0 : false
})

const resolvedBattleId = computed(() => props.battleId ?? props.battle?.id ?? props.battle?.battleId)

function toDateInput(iso) {
  if (!iso) return ''
  if (typeof iso === 'string') {
    if (iso.length >= 10) return iso.substring(0, 10)
  }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function pickPermissionValue(p) {
  if (!p) return 'CREATOR_ONLY'
  if (typeof p === 'string') return p
  return p.code || p.value || 'CREATOR_ONLY'
}

function pickVoteTypeValue(v) {
  if (!v) return 'SINGLE'
  if (typeof v === 'string') return v
  return v.title || v.code || v.value || 'SINGLE'
}

function hydrateForm() {
  const b = props.battle || {}
  form.title = b.title || ''
  form.description = b.description || ''
  form.subCategoryId = b.subCategoryDetail?.subCategoryId ?? null
  form.itemAddPermissionType = pickPermissionValue(b.itemAddPermissionType)
  form.startDate = toDateInput(b.startDate)
  form.endDate = toDateInput(b.endDate)
  form.participationStartDate = toDateInput(b.participationStartDate)
  form.voteType = pickVoteTypeValue(b.voteType)

  original.value = {
    title: form.title,
    description: form.description,
    subCategoryId: form.subCategoryId,
    itemAddPermissionType: form.itemAddPermissionType,
    startDate: form.startDate,
    endDate: form.endDate,
    participationStartDate: form.participationStartDate,
    voteType: form.voteType,
  }
}

watch(() => props.visible, (v) => {
  if (v) hydrateForm()
})

const changedPayload = computed(() => {
  const o = original.value
  const out = {}

  // 항상 수정 가능
  if (form.title.trim() !== (o.title || '').trim()) out.title = form.title.trim()
  if ((form.description || '').trim() !== (o.description || '').trim()) {
    out.description = form.description.trim()
  }

  // 참여자가 있으면 잠긴 필드는 보내지 않음
  if (!hasParticipants.value) {
    if (form.subCategoryId && form.subCategoryId !== o.subCategoryId) {
      out.subCategoryId = form.subCategoryId
    }
    if (form.itemAddPermissionType && form.itemAddPermissionType !== o.itemAddPermissionType) {
      out.itemAddPermissionType = form.itemAddPermissionType
    }
    if (form.voteType && form.voteType !== o.voteType) {
      out.voteType = form.voteType
    }
    if (form.startDate && form.startDate !== o.startDate) {
      out.startDate = `${form.startDate}T00:00:00`
    }
    if (form.endDate && form.endDate !== o.endDate) {
      out.endDate = `${form.endDate}T23:59:59`
    }
    if (form.participationStartDate && form.participationStartDate !== o.participationStartDate) {
      out.participationStartDate = `${form.participationStartDate}T00:00:00`
    }
  }

  return out
})

const canSubmit = computed(() => {
  if (!form.title.trim()) return false
  if (form.title.length > 50) return false
  if (form.description.length > 500) return false
  return Object.keys(changedPayload.value).length > 0
})

async function onSubmit() {
  if (submitting.value || !canSubmit.value) return

  // 클라이언트 사이드 날짜 유효성
  if (!hasParticipants.value && form.startDate && form.endDate) {
    if (new Date(form.startDate) > new Date(form.endDate)) {
      await open({ type: 'alert', title: '입력 오류', message: '종료일은 시작일 이후여야 해요.' })
      return
    }
  }

  submitting.value = true
  try {
    const res = await battleService.updateBattle(resolvedBattleId.value, changedPayload.value)
    if (!res?.success) throw new Error(res?.message || '수정에 실패했어요.')
    emit('updated')
    emit('close')
  } catch (e) {
    await open({ type: 'alert', title: '오류', message: e?.message || '배틀 수정에 실패했어요.' })
  } finally {
    submitting.value = false
  }
}

function onClose() {
  if (submitting.value) return
  emit('close')
}
</script>

<style scoped>
.edit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 26, 0.42);
  backdrop-filter: blur(2px);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}

.edit-modal {
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - 48px);
  background: #ffffff;
  border-radius: 24px;
  box-shadow:
    0 32px 64px rgba(10, 14, 26, 0.24),
    0 8px 20px rgba(10, 14, 26, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Transitions */
.overlay-enter-active,
.overlay-leave-active { transition: opacity 0.2s ease; }
.overlay-enter-from,
.overlay-leave-to { opacity: 0; }

.dialog-enter-active,
.dialog-leave-active {
  transition: transform 0.26s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}

/* Header */
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 22px 16px;
  border-bottom: 1px solid #F1F3F6;
}
.header-left { display: flex; gap: 12px; align-items: center; }
.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #0A0E1A;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.header-title {
  font-size: 17px;
  font-weight: 900;
  color: #0A0E1A;
  letter-spacing: -0.5px;
}
.header-sub {
  font-size: 12px;
  font-weight: 600;
  color: #8B95A1;
  margin-top: 2px;
  letter-spacing: -0.2px;
}
.icon-btn {
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  border-radius: 10px;
  color: #8B95A1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s ease, color 0.12s ease;
  flex-shrink: 0;
}
.icon-btn:hover { background: #F7F8FA; color: #4E5968; }

/* Lock notice */
.lock-notice {
  margin: 12px 22px 0;
  padding: 12px 14px;
  background: #FFF7ED;
  border: 1px solid #FED7AA;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: #9A3412;
  letter-spacing: -0.2px;
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 22px 8px;
  scrollbar-width: thin;
  scrollbar-color: #E5E8EC transparent;
}
.modal-body::-webkit-scrollbar { width: 6px; }
.modal-body::-webkit-scrollbar-thumb { background: #E5E8EC; border-radius: 3px; }
.modal-body::-webkit-scrollbar-track { background: transparent; }

.field + .field { margin-top: 18px; }

.field-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 800;
  color: #0A0E1A;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
}
.char-count {
  font-size: 11.5px;
  font-weight: 700;
  color: #8B95A1;
  font-variant-numeric: tabular-nums;
}
.char-count.over { color: #DC2626; }

.lock-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: #FFF7ED;
  color: #C2410C;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: -0.2px;
}

/* Inputs */
.text-input,
.textarea-input,
.date-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #EAEDF1;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #0A0E1A;
  background: #ffffff;
  transition: border-color 0.14s ease, box-shadow 0.14s ease;
  font-family: inherit;
}
.text-input::placeholder,
.textarea-input::placeholder { color: #C4C9D0; font-weight: 500; }

.text-input:focus,
.textarea-input:focus,
.date-input:focus {
  outline: none;
  border-color: #0A0E1A;
  box-shadow: 0 0 0 3px rgba(10, 14, 26, 0.08);
}
.textarea-input {
  resize: vertical;
  min-height: 90px;
  line-height: 1.5;
}

/* Locked wrap (for category) */
.locked-wrap.locked {
  opacity: 0.55;
  pointer-events: none;
  user-select: none;
}

/* Permissions */
.permission-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.permission-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #ffffff;
  border: 1.5px solid #EAEDF1;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color 0.14s ease, background 0.14s ease;
}
.permission-row:hover:not(.disabled) {
  border-color: #C4C9D0;
}
.permission-row.selected {
  border-color: #0A0E1A;
  background: #FAFBFC;
}
.permission-row.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.radio {
  width: 18px;
  height: 18px;
  border: 2px solid #D1D5DB;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.14s ease;
}
.permission-row.selected .radio { border-color: #0A0E1A; }
.radio-dot {
  width: 8px;
  height: 8px;
  background: transparent;
  border-radius: 50%;
  transition: background 0.14s ease;
}
.permission-row.selected .radio-dot { background: #0A0E1A; }
.permission-text { flex: 1; min-width: 0; }
.permission-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #0A0E1A;
  letter-spacing: -0.3px;
}
.permission-desc {
  font-size: 11.5px;
  font-weight: 600;
  color: #8B95A1;
  letter-spacing: -0.2px;
  margin-top: 2px;
}

/* Vote type */
.vote-type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.vote-type-card {
  padding: 14px;
  background: #ffffff;
  border: 1.5px solid #EAEDF1;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color 0.14s ease, background 0.14s ease;
}
.vote-type-card:hover:not(.disabled) { border-color: #C4C9D0; }
.vote-type-card.selected {
  border-color: #0A0E1A;
  background: #FAFBFC;
}
.vote-type-card.disabled { opacity: 0.55; cursor: not-allowed; }
.vote-type-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #0A0E1A;
  letter-spacing: -0.3px;
}
.vote-type-desc {
  font-size: 11.5px;
  font-weight: 600;
  color: #8B95A1;
  letter-spacing: -0.2px;
  margin-top: 4px;
  line-height: 1.45;
}

/* Dates */
.date-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.date-cell.full { grid-column: 1 / -1; }
.date-label {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  color: #8B95A1;
  letter-spacing: -0.2px;
  margin-bottom: 6px;
}
.date-input:disabled {
  background: #F7F8FA;
  color: #8B95A1;
  cursor: not-allowed;
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px 22px 22px;
  border-top: 1px solid #F1F3F6;
  background: #ffffff;
}
.btn-ghost,
.btn-primary {
  flex: 1;
  height: 46px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.3px;
  cursor: pointer;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  transition: background 0.14s ease, color 0.14s ease, transform 0.14s ease;
}
.btn-ghost {
  background: #ffffff;
  color: #4E5968;
  border-color: #EAEDF1;
}
.btn-ghost:hover:not(:disabled) {
  background: #FAFBFC;
  color: #0A0E1A;
}
.btn-primary {
  background: #0A0E1A;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(10, 14, 26, 0.16);
}
.btn-primary:hover:not(:disabled) {
  background: #17192a;
  transform: translateY(-1px);
}
.btn-primary:disabled,
.btn-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.32);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Mobile */
@media (max-width: 640px) {
  .edit-modal-overlay {
    padding: 0;
    align-items: stretch;
  }
  .edit-modal {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
  .modal-header {
    padding: 18px 18px 14px;
  }
  .modal-body {
    padding: 16px 18px 4px;
  }
  .modal-footer {
    padding: 14px 18px calc(18px + env(safe-area-inset-bottom));
  }
  .vote-type-grid {
    grid-template-columns: 1fr;
  }
  .date-grid {
    grid-template-columns: 1fr;
  }
  .date-cell.full { grid-column: auto; }
}
</style>
