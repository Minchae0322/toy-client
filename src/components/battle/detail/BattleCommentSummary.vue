<template>
  <div class="pc-card-arguments">
    <!-- 코멘트가 있을 때 -->
    <template v-if="commentSummary">
      <div class="arg-header">
        <span class="label" @click="$emit('open-comments')">
          <svg class="chat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          PICK 한마디
          <span class="cnt">{{ commentCount }}개</span>
        </span>
        <button class="write-btn" @click.stop="toggleInput">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- PC 인라인 입력창 -->
      <transition name="slide">
        <div v-if="showInput && !isMobile" class="inline-input-wrap" @click.stop>
          <input
            ref="inputRef"
            v-model="inputText"
            type="text"
            class="inline-input"
            placeholder="PICK 한마디를 남겨보세요!"
            maxlength="100"
            @keyup.enter="handleSubmit"
          />
          <button class="submit-btn" :disabled="!inputText.trim() || submitting" @click="handleSubmit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </transition>

      <div class="best-arg" @click="$emit('open-comments')">
        <img
          v-if="commentSummary.creatorProfileImageUrl && !imageLoadFailed"
          class="ba-avatar"
          :src="commentSummary.creatorProfileImageUrl"
          :alt="commentSummary.creatorNickname"
          @error="imageLoadFailed = true"
        />
        <div v-else class="ba-avatar">{{ avatarInitial }}</div>
        <div class="ba-body">
          <div class="ba-top">
            <span class="ba-nick">{{ commentSummary.creatorNickname }}</span>
            <span class="best-badge">BEST</span>
            <span class="ba-likes">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {{ commentSummary.likeCount }}
            </span>
          </div>
          <p class="ba-text">{{ commentSummary.content }}</p>
        </div>
      </div>

      <div v-if="remainingCount > 0" class="view-all" @click="$emit('open-comments')">
        <button>
          {{ remainingCount }}개 더보기
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M6 9l6 6 6-6"/>
            <path d="M6 4l6 6 6-6"/>
          </svg>
        </button>
      </div>
    </template>

    <!-- 코멘트가 없을 때 -->
    <template v-else>
      <div class="empty-header">
        <div class="empty-state" @click.stop="toggleInput">
          <svg class="empty-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="empty-text">첫 PICK 한마디를 남겨보세요!</span>
        </div>
        <button class="write-btn" @click.stop="toggleInput">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- PC 인라인 입력창 (빈 상태) -->
      <transition name="slide">
        <div v-if="showInput && !isMobile" class="inline-input-wrap" @click.stop>
          <input
            ref="inputRef"
            v-model="inputText"
            type="text"
            class="inline-input"
            placeholder="PICK 한마디를 남겨보세요!"
            maxlength="100"
            @keyup.enter="handleSubmit"
          />
          <button class="submit-btn" :disabled="!inputText.trim() || submitting" @click="handleSubmit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </transition>
    </template>

    <!-- 모바일 바텀시트 -->
    <Teleport to="body">
      <transition name="bottomsheet">
        <div v-if="showBottomSheet" class="bottomsheet-overlay" @click="closeBottomSheet">
          <div class="bottomsheet" @click.stop>
            <div class="bottomsheet-handle"></div>

            <!-- 헤더 -->
            <div class="bottomsheet-header">
              <h3>픽 한마디 남기기</h3>
            </div>

            <!-- 아이템 카드 -->
            <div class="bottomsheet-item-card">
              <img v-if="itemImage" :src="itemImage" :alt="itemName" class="item-thumb" />
              <div class="item-info">
                <span class="item-badge">선택한 아이템</span>
                <span class="item-name">{{ itemName }}</span>
              </div>
            </div>

            <!-- 입력 영역 -->
            <div class="bottomsheet-body">
              <div class="input-wrapper">
                <textarea
                  ref="bottomSheetInputRef"
                  v-model="inputText"
                  class="bottomsheet-input"
                  placeholder="이 아이템이 최고인 이유를 알려주세요!"
                  maxlength="100"
                  rows="3"
                ></textarea>
                <div class="input-footer">
                  <span class="hint-text">다른 사용자들에게 도움이 돼요</span>
                  <span class="char-count" :class="{ 'near-limit': inputText.length > 80 }">{{ inputText.length }}/100</span>
                </div>
              </div>
            </div>

            <!-- 버튼 영역 -->
            <div class="bottomsheet-footer">
              <button class="cancel-btn" @click="closeBottomSheet">
                다음에 할게요
              </button>
              <button
                class="bottomsheet-submit"
                :disabled="!inputText.trim() || submitting"
                @click="handleSubmit"
              >
                <template v-if="submitting">
                  <span class="spinner"></span>
                </template>
                <template v-else>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                  등록하기
                </template>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUserId } from '@/utils/auth.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const props = defineProps({
  commentSummary: { type: Object, default: null },
  itemId: { type: [Number, String], required: true },
  itemName: { type: String, default: '' },
  itemImage: { type: String, default: '' },
  submitting: { type: Boolean, default: false }
})

const emit = defineEmits(['open-comments', 'submit-comment'])

const { openLoginRequired } = useConfirmDialog()
const router = useRouter()
const route = useRoute()

const imageLoadFailed = ref(false)
const showInput = ref(false)
const showBottomSheet = ref(false)
const inputText = ref('')
const inputRef = ref(null)
const bottomSheetInputRef = ref(null)
const isMobile = ref(false)

// 모바일 감지 (768px 이하)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const commentCount = computed(() => props.commentSummary?.commentCount || 0)
const remainingCount = computed(() => Math.max(0, (props.commentSummary?.commentCount || 0) - 1))
const avatarInitial = computed(() => {
  return (props.commentSummary?.creatorNickname || '?').charAt(0).toUpperCase()
})

const toggleInput = async () => {
  // 로그인 체크
  if (!getUserId()) {
    const confirmed = await openLoginRequired('PICK 한마디를 남기려면 로그인이 필요합니다.')
    if (confirmed) {
      router.push({ name: 'Login', query: { redirect: route.fullPath } })
    }
    return
  }

  if (isMobile.value) {
    // 모바일: 바텀시트 열기
    showBottomSheet.value = true
    nextTick(() => {
      bottomSheetInputRef.value?.focus()
    })
  } else {
    // PC: 인라인 입력창 토글
    showInput.value = !showInput.value
    if (showInput.value) {
      nextTick(() => {
        inputRef.value?.focus()
      })
    }
  }
}

const closeBottomSheet = () => {
  showBottomSheet.value = false
}

const handleSubmit = async () => {
  if (!inputText.value.trim() || props.submitting) return

  // 로그인 체크
  if (!getUserId()) {
    const confirmed = await openLoginRequired('PICK 한마디를 남기려면 로그인이 필요합니다.')
    if (confirmed) {
      router.push({ name: 'Login', query: { redirect: route.fullPath } })
    }
    return
  }

  emit('submit-comment', inputText.value.trim())
  inputText.value = ''
  showInput.value = false
  showBottomSheet.value = false
}

// 외부에서 입력창 닫기
const closeInput = () => {
  showInput.value = false
  showBottomSheet.value = false
  inputText.value = ''
}

defineExpose({ closeInput })
</script>

<style scoped>
.pc-card-arguments {
  border-top: 1px solid #f3f4f6;
  padding: 12px 16px;
  transition: background 0.2s ease;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  overflow: hidden;
  box-sizing: border-box;
}

/* 헤더 */
.arg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.arg-header .label {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.15s;
}

.arg-header .label:hover {
  color: #4a6cf7;
}

.arg-header .chat-icon {
  flex-shrink: 0;
}

.arg-header .cnt {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 600;
  margin-left: 4px;
}

/* 작성 버튼 */
.write-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;
}

.write-btn:hover {
  background: #4a6cf7;
  color: #fff;
}

/* 인라인 입력창 */
.inline-input-wrap {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 12px;
  width: 100%;
  box-sizing: border-box;
}

.inline-input {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.inline-input:focus {
  border-color: #9333ea;
}

.inline-input::placeholder {
  color: #9ca3af;
}

.submit-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: #9333ea;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}

.submit-btn:hover:not(:disabled) {
  background: #3a5ce7;
}

.submit-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* 슬라이드 트랜지션 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* BEST 변론 카드 */
.best-arg {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  background: #fffbeb;
  border-radius: 10px;
  border: 1px solid #fde68a;
  cursor: pointer;
  transition: all 0.15s;
}

.best-arg:hover {
  background: #fef3c7;
}

img.ba-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}

div.ba-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #4a6cf7;
  flex-shrink: 0;
}

.ba-body {
  flex: 1;
  min-width: 0;
}

.ba-top {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 2px;
}

.ba-nick {
  font-size: 11px;
  font-weight: 700;
  color: #374151;
}

.best-badge {
  font-size: 10px;
  font-weight: 700;
  color: #f59e0b;
  background: #fffbeb;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #fde68a;
}

.ba-text {
  font-size: 12px;
  color: #4b5563;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ba-likes {
  font-size: 10px;
  color: #f43f5e;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 600;
}

/* 더보기 버튼 */
.view-all {
  text-align: center;
  margin-top: 8px;
}

.view-all button {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  font-size: 11px;
  font-weight: 600;
  color: #4a6cf7;
  cursor: pointer;
  font-family: inherit;
  padding: 4px 10px;
  border-radius: 6px;
  transition: background 0.15s;
}

.view-all button:hover {
  background: #eff6ff;
}

/* 빈 상태 */
.empty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  cursor: pointer;
}

.empty-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.empty-text {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
}

.empty-state:hover .empty-icon,
.empty-state:hover .empty-text {
  color: #4a6cf7;
}

/* 모바일 최적화 */
@media (max-width: 480px) {
  .pc-card-arguments {
    padding: 8px 10px;
    min-height: 70px;
  }

  .arg-header {
    margin-bottom: 6px;
  }

  .arg-header .label {
    font-size: 11px;
  }

  .arg-header .chat-icon {
    width: 12px;
    height: 12px;
  }

  .arg-header .cnt {
    font-size: 10px;
  }

  .write-btn {
    width: 26px;
    height: 26px;
  }

  .write-btn svg {
    width: 12px;
    height: 12px;
  }

  /* 모바일 인라인 입력창 - 한 줄에 입력+버튼, 넘치면 스크롤 없이 맞춤 */
  .inline-input-wrap {
    display: flex;
    flex-direction: row;
    margin-bottom: 8px;
    gap: 4px;
    width: 100%;
    max-width: 100%;
  }

  .inline-input {
    flex: 1;
    min-width: 0;
    padding: 8px 10px;
    font-size: 12px;
    border-radius: 8px;
  }

  .submit-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    flex-shrink: 0;
    border-radius: 8px;
    padding: 0;
  }

  .submit-btn svg {
    width: 14px;
    height: 14px;
  }

  .best-arg {
    padding: 5px 6px;
    gap: 5px;
    border-radius: 6px;
  }

  img.ba-avatar,
  div.ba-avatar {
    width: 18px;
    height: 18px;
  }

  div.ba-avatar {
    font-size: 8px;
  }

  .ba-nick {
    font-size: 9px;
  }

  .best-badge {
    font-size: 7px;
    padding: 1px 3px;
  }

  .ba-text {
    font-size: 10px;
    line-height: 1.3;
    -webkit-line-clamp: 1;
  }

  .ba-likes {
    font-size: 8px;
    margin-top: 2px;
  }

  .ba-likes svg {
    width: 8px;
    height: 8px;
  }

  .view-all {
    margin-top: 4px;
  }

  .view-all button {
    font-size: 9px;
    padding: 2px 6px;
  }

  .empty-icon {
    width: 12px;
    height: 12px;
  }

  .empty-text {
    font-size: 10px;
  }
}

/* PC 최적화 */
@media (min-width: 768px) {
  .pc-card-arguments {
    padding: 14px 16px;
  }

  .best-arg {
    padding: 10px 12px;
  }

  .ba-text {
    font-size: 13px;
  }
}

/* ==================== 바텀시트 ==================== */
.bottomsheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bottomsheet {
  background: #fff;
  border-radius: 28px 28px 0 0;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.bottomsheet-handle {
  width: 40px;
  height: 5px;
  background: #e5e7eb;
  border-radius: 3px;
  margin: 12px auto 0;
}

/* 헤더 */
.bottomsheet-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 20px 12px;
}

.bottomsheet-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #111;
}

/* 아이템 카드 */
.bottomsheet-item-card {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 20px 16px;
  padding: 14px 16px;
  background: #faf5ff;
  border: 1.5px solid #e9d5ff;
  border-radius: 16px;
}

.bottomsheet-item-card .item-thumb {
  width: 72px;
  height: 72px;
  border-radius: 14px;
  object-fit: cover;
  background: #fff;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.15);
}

.bottomsheet-item-card .item-info {
  flex: 1;
  min-width: 0;
}

.bottomsheet-item-card .item-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: #9333ea;
  margin-bottom: 4px;
}

.bottomsheet-item-card .item-name {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #581c87;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 입력 영역 */
.bottomsheet-body {
  padding: 0 20px 16px;
}

.input-wrapper {
  background: #f9fafb;
  border-radius: 16px;
  padding: 4px;
}

.bottomsheet-input {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  background: #fff;
  line-height: 1.5;
  border: 2px solid transparent;
}

.bottomsheet-input:focus {
  border-color: #9333ea;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.bottomsheet-input::placeholder {
  color: #9ca3af;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px 6px;
}

.hint-text {
  font-size: 12px;
  color: #9ca3af;
}

.char-count {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 600;
  transition: color 0.2s;
}

.char-count.near-limit {
  color: #f59e0b;
}

/* 버튼 영역 */
.bottomsheet-footer {
  display: flex;
  gap: 10px;
  padding: 8px 20px 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

.cancel-btn {
  flex: 1;
  padding: 16px 12px;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.cancel-btn:active {
  transform: scale(0.98);
}

.bottomsheet-submit {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  background: #9333ea;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(147, 51, 234, 0.3);
}

.bottomsheet-submit:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);
  transform: translateY(-1px);
}

.bottomsheet-submit:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow: 0 2px 10px rgba(147, 51, 234, 0.3);
}

.bottomsheet-submit:disabled {
  background: #d1d5db;
  box-shadow: none;
  cursor: not-allowed;
}

.bottomsheet-submit .spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 바텀시트 트랜지션 */
.bottomsheet-enter-active,
.bottomsheet-leave-active {
  transition: opacity 0.3s ease;
}

.bottomsheet-enter-active .bottomsheet,
.bottomsheet-leave-active .bottomsheet {
  transition: transform 0.3s ease;
}

.bottomsheet-enter-from,
.bottomsheet-leave-to {
  opacity: 0;
}

.bottomsheet-enter-from .bottomsheet,
.bottomsheet-leave-to .bottomsheet {
  transform: translateY(100%);
}
</style>
