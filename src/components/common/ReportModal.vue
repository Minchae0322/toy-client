<template>
  <Teleport to="body">
    <Transition name="report-fade">
      <div v-if="visible" class="report-overlay" @click.self="handleClose">
        <div class="report-modal" role="dialog" aria-modal="true" :aria-labelledby="titleId">
          <div class="report-header">
            <h2 :id="titleId" class="report-title">신고하기</h2>
            <button type="button" class="close-btn" :disabled="submitting" aria-label="닫기" @click="handleClose">✕</button>
          </div>

          <p class="report-sub">{{ subText }}</p>

          <fieldset class="reason-group" :disabled="submitting">
            <legend class="reason-legend">신고 사유</legend>
            <label
              v-for="opt in REASON_OPTIONS"
              :key="opt.code"
              class="reason-item"
              :class="{ selected: selectedReason === opt.code }"
            >
              <input
                v-model="selectedReason"
                type="radio"
                name="report-reason"
                :value="opt.code"
              />
              <span class="reason-label">{{ opt.label }}</span>
            </label>
          </fieldset>

          <div class="detail-field">
            <label class="detail-label" :for="detailId">
              상세 내용
              <span class="detail-hint">{{ isEtc ? '(필요 시 자세히 알려주세요)' : '(선택)' }}</span>
            </label>
            <textarea
              :id="detailId"
              v-model="detail"
              class="detail-input"
              :placeholder="isEtc ? '신고 사유를 자세히 입력해주세요.' : '필요 시 추가 설명을 입력하세요.'"
              maxlength="500"
              rows="4"
              :disabled="submitting"
            ></textarea>
            <div class="detail-counter">{{ detail.length }} / 500</div>
          </div>

          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

          <div class="actions">
            <button type="button" class="btn-cancel" :disabled="submitting" @click="handleClose">취소</button>
            <button type="button" class="btn-submit" :disabled="!canSubmit || submitting" @click="handleSubmit">
              {{ submitting ? '신고 중...' : '신고 접수' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { feedService } from '@/services/FeedService.js'
import { battleService } from '@/services/BattleService.js'

const props = defineProps({
  visible: { type: Boolean, required: true },
  target: { type: String, required: true, validator: v => ['feed', 'battle'].includes(v) },
  targetId: { type: [Number, String], required: true }
})
const emit = defineEmits(['update:visible', 'submitted'])

const REASON_OPTIONS = [
  { code: 'SPAM',           label: '광고/스팸' },
  { code: 'OFFENSIVE',      label: '욕설/비방' },
  { code: 'SEXUAL',         label: '음란/선정성' },
  { code: 'VIOLENCE',       label: '폭력/혐오' },
  { code: 'MISINFORMATION', label: '거짓 정보' },
  { code: 'COPYRIGHT',      label: '저작권 침해' },
  { code: 'ETC',            label: '기타' }
]

const selectedReason = ref('')
const detail = ref('')
const submitting = ref(false)
const errorMessage = ref('')

const titleId = `report-title-${Math.random().toString(36).slice(2, 8)}`
const detailId = `report-detail-${Math.random().toString(36).slice(2, 8)}`

const isEtc = computed(() => selectedReason.value === 'ETC')
const canSubmit = computed(() => !!selectedReason.value)
const subText = computed(() => props.target === 'battle'
  ? '부적절한 배틀을 신고합니다. 신고 내용은 운영팀이 검토합니다.'
  : '부적절한 피드를 신고합니다. 신고 내용은 운영팀이 검토합니다.')

watch(() => props.visible, v => {
  if (v) {
    selectedReason.value = ''
    detail.value = ''
    errorMessage.value = ''
    submitting.value = false
  }
})

function handleClose() {
  if (submitting.value) return
  emit('update:visible', false)
}

async function handleSubmit() {
  if (!canSubmit.value || submitting.value) return
  errorMessage.value = ''
  submitting.value = true
  try {
    const body = { reason: selectedReason.value, detail: detail.value }
    const res = props.target === 'battle'
      ? await battleService.reportBattle(props.targetId, body)
      : await feedService.reportFeed(props.targetId, body)

    if (res?.success) {
      emit('submitted', { reportId: res.data, target: props.target, targetId: props.targetId })
      emit('update:visible', false)
      return
    }
    errorMessage.value = mapErrorCode(res?.errorCode, res?.message)
  } catch (err) {
    const code = err?.response?.data?.errorCode || err?.errorCode
    const msg = err?.response?.data?.message || err?.message
    errorMessage.value = mapErrorCode(code, msg)
  } finally {
    submitting.value = false
  }
}

function mapErrorCode(code, fallback) {
  switch (code) {
    case 'FEED_REPORT_DUPLICATED':
    case 'BATTLE_REPORT_DUPLICATED':
      return '이미 신고하신 콘텐츠예요.'
    case 'FEED_REPORT_SELF':
    case 'BATTLE_REPORT_SELF':
      return '본인 콘텐츠는 신고할 수 없어요.'
    case 'FEED_NOT_FOUND':
      return '피드를 찾을 수 없어요.'
    case 'BATTLE_NOT_FOUND':
      return '배틀을 찾을 수 없어요.'
    case 'VALIDATION_ERROR':
      return '입력값을 확인해주세요.'
    default:
      return fallback || '신고 접수에 실패했어요. 잠시 후 다시 시도해주세요.'
  }
}
</script>

<style scoped>
.report-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}
.report-modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 20px 22px 18px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
}
.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.report-title {
  font-size: 17px;
  font-weight: 800;
  color: #18181b;
  margin: 0;
  letter-spacing: -0.02em;
}
.close-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 16px;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.15s;
}
.close-btn:hover:not(:disabled) { background: #f4f4f5; color: #52525b; }
.close-btn:disabled { cursor: not-allowed; opacity: 0.5; }

.report-sub {
  font-size: 13px;
  color: #71717a;
  line-height: 1.5;
  margin: 0 0 16px;
}

.reason-group {
  border: none;
  padding: 0;
  margin: 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.reason-legend {
  font-size: 13px;
  font-weight: 700;
  color: #3f3f46;
  margin-bottom: 6px;
  padding: 0;
}
.reason-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  font-size: 14px;
  color: #27272a;
  font-weight: 500;
}
.reason-item:hover { border-color: #d4d4d8; }
.reason-item.selected {
  border-color: #9333EA;
  background: #faf5ff;
  color: #6b21a8;
  font-weight: 700;
}
.reason-item input[type="radio"] {
  accent-color: #9333EA;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.reason-label { flex: 1; }

.detail-field { margin-bottom: 12px; }
.detail-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #3f3f46;
  margin-bottom: 6px;
}
.detail-hint { font-weight: 500; color: #a1a1aa; margin-left: 4px; }
.detail-input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #27272a;
  resize: vertical;
  min-height: 86px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
  background: #fff;
}
.detail-input:focus {
  border-color: #9333EA;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.12);
}
.detail-input:disabled { background: #f9fafb; cursor: not-allowed; }
.detail-counter {
  margin-top: 4px;
  font-size: 11px;
  color: #a1a1aa;
  text-align: right;
}

.error-msg {
  margin: 0 0 12px;
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #b91c1c;
  font-size: 13px;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 8px;
}
.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: background 0.15s, opacity 0.15s;
}
.btn-cancel {
  background: #f4f4f5;
  color: #52525b;
}
.btn-cancel:hover:not(:disabled) { background: #e4e4e7; }
.btn-submit {
  background: #9333EA;
  color: #fff;
}
.btn-submit:hover:not(:disabled) { background: #7e22ce; }
.btn-submit:disabled { background: #d8b4fe; cursor: not-allowed; }
.btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

.report-fade-enter-active,
.report-fade-leave-active { transition: opacity 0.18s ease; }
.report-fade-enter-from,
.report-fade-leave-to { opacity: 0; }
.report-fade-enter-active .report-modal,
.report-fade-leave-active .report-modal {
  transition: transform 0.18s ease;
}
.report-fade-enter-from .report-modal { transform: translateY(8px); }

@media (max-width: 480px) {
  .report-modal { padding: 18px 16px 14px; max-width: 100%; border-radius: 14px; }
  .report-title { font-size: 16px; }
  .reason-item { padding: 9px 11px; font-size: 13.5px; }
}
</style>
