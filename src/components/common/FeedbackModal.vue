<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="overlay" @click.self="handleClose">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
        <div class="modal-header">
          <h2 id="feedback-title" class="modal-title">의견 보내기</h2>
          <button type="button" class="close-btn" @click="handleClose" aria-label="닫기">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <p class="modal-sub">익명으로 전달돼요. 의견·버그 제보를 자유롭게 남겨주세요.</p>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="field">
            <div class="field-label-row">
              <label for="fb-title" class="field-label">제목</label>
              <span class="char-count" :class="{ over: title.length > MAX_TITLE }">
                {{ title.length }} / {{ MAX_TITLE }}
              </span>
            </div>
            <input
                id="fb-title"
                v-model="title"
                type="text"
                :maxlength="MAX_TITLE"
                placeholder="간단한 제목을 입력해 주세요"
                :disabled="loading"
                class="text-input"
                autocomplete="off"
            />
          </div>

          <div class="field">
            <div class="field-label-row">
              <label for="fb-content" class="field-label">내용</label>
              <span class="char-count" :class="{ over: content.length > MAX_CONTENT }">
                {{ content.length }} / {{ MAX_CONTENT }}
              </span>
            </div>
            <textarea
                id="fb-content"
                v-model="content"
                :maxlength="MAX_CONTENT"
                placeholder="무엇이 불편했는지, 어떤 점을 개선하면 좋겠는지 알려주세요"
                :disabled="loading"
                class="textarea-input"
                rows="6"
            ></textarea>
          </div>

          <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>

          <div class="actions">
            <button type="button" class="btn-cancel" @click="handleClose" :disabled="loading">
              취소
            </button>
            <button type="submit" class="btn-submit" :disabled="!canSubmit || loading">
              <span v-if="loading" class="spinner"></span>
              <span>{{ loading ? '전송 중' : '보내기' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { feedbackService } from '@/services/FeedbackService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'submitted'])

const MAX_TITLE = 100
const MAX_CONTENT = 2000

const title = ref('')
const content = ref('')
const loading = ref(false)
const errorMessage = ref('')

const { open } = useConfirmDialog()

const canSubmit = computed(() =>
    title.value.trim().length > 0 &&
    content.value.trim().length > 0 &&
    title.value.length <= MAX_TITLE &&
    content.value.length <= MAX_CONTENT
)

const reset = () => {
  title.value = ''
  content.value = ''
  errorMessage.value = ''
  loading.value = false
}

const handleClose = () => {
  if (loading.value) return
  emit('close')
}

// 모달이 닫힐 때 폼 리셋 (다음 열림 시 빈 상태)
watch(() => props.visible, (v) => {
  if (!v) reset()
})

const handleSubmit = async () => {
  if (!canSubmit.value || loading.value) return
  errorMessage.value = ''
  loading.value = true
  try {
    const response = await feedbackService.createFeedback({
      title: title.value.trim(),
      content: content.value.trim()
    })
    if (response.success) {
      emit('submitted')
      emit('close')
      await open({
        type: 'alert',
        title: '의견이 등록되었습니다',
        message: '소중한 의견 감사합니다. 모두 확인하고 있어요.'
      })
    } else {
      errorMessage.value = response.message || '의견 등록에 실패했습니다.'
    }
  } catch (err) {
    errorMessage.value = err?.message || '의견 등록에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 26, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  /* iOS safe-area */
  padding-top: calc(20px + env(safe-area-inset-top));
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

.modal {
  width: 100%;
  max-width: 480px;
  background: var(--bg-elevated);
  border-radius: 18px;
  padding: 24px;
  box-shadow:
      0 0 0 1px rgba(15, 23, 42, 0.04),
      0 12px 32px rgba(15, 23, 42, 0.12);
  font-family: 'SUIT', 'Noto Sans KR', sans-serif;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 6px;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

.close-btn {
  background: transparent;
  border: none;
  padding: 4px;
  margin: -4px;
  border-radius: 8px;
  color: var(--c-text-400);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover { background: var(--bg-mute); color: var(--text-primary); }

.modal-sub {
  margin: 0 0 18px;
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-400);
  letter-spacing: -0.1px;
  line-height: 1.5;
}

.modal-form { display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; }

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.1px;
}

.char-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-text-300);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.1px;
}
.char-count.over { color: var(--c-danger); }

.text-input,
.textarea-input {
  width: 100%;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 500;
  border: 1.5px solid var(--border-default);
  border-radius: 10px;
  outline: none;
  transition: all 0.15s ease;
  color: var(--text-primary);
  background: var(--bg-subtle);
  font-family: inherit;
  box-sizing: border-box;
}
.text-input::placeholder,
.textarea-input::placeholder { color: var(--c-text-300); font-weight: 400; }
.text-input:focus,
.textarea-input:focus {
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08);
  background: var(--bg-elevated);
}
.text-input:disabled,
.textarea-input:disabled { background: var(--bg-mute); color: var(--c-text-300); cursor: not-allowed; }

.textarea-input {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.error-msg {
  margin: -4px 0 0;
  padding: 10px 12px;
  background: var(--c-danger-soft);
  border: 1px solid var(--c-danger-soft);
  border-radius: 10px;
  color: var(--c-danger);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.1px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.2px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-cancel {
  background: var(--bg-mute);
  color: var(--c-text-600);
  border: none;
}
.btn-cancel:hover:not(:disabled) { background: var(--border-default); color: var(--text-primary); }
.btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-submit {
  background: var(--c-ink-900);
  color: #fff;
  border: none;
}
.btn-submit:hover:not(:disabled) { background: var(--c-ink-700); }
.btn-submit:disabled { background: var(--bg-mute); color: var(--c-text-300); cursor: not-allowed; }

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 트랜지션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-active .modal,
.modal-fade-leave-active .modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal,
.modal-fade-leave-to .modal {
  opacity: 0;
  transform: translateY(8px);
}

/* 모바일 */
@media (max-width: 480px) {
  .overlay { padding: 0; align-items: flex-end; }
  .modal {
    max-width: 100%;
    border-radius: 18px 18px 0 0;
    max-height: 90vh;
  }
}
</style>
