<template>
  <div class="pc-card-arguments">
    <!-- 코멘트가 있을 때 -->
    <template v-if="commentSummary">
      <div class="arg-header">
        <button type="button" class="label" @click="$emit('open-comments')">
          <svg class="chat-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          PICK 한마디
          <span class="cnt">{{ commentCount }}</span>
        </button>
        <button type="button" class="write-pill" aria-label="쓰기" @click.stop="toggleInput">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
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

      <!-- 더보기 영역은 댓글 1개일 때도 공간 reserve (visibility hidden) — 카드 간 높이 통일 -->
      <div
        class="view-all"
        :class="{ 'is-placeholder': remainingCount <= 0 }"
        @click="remainingCount > 0 && $emit('open-comments')"
      >
        <button :tabindex="remainingCount > 0 ? 0 : -1" :aria-hidden="remainingCount <= 0 ? 'true' : null">
          {{ remainingCount > 0 ? `${remainingCount}개 더보기` : '더보기' }}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M6 9l6 6 6-6"/>
            <path d="M6 4l6 6 6-6"/>
          </svg>
        </button>
      </div>
    </template>

    <!-- 코멘트가 없을 때 -->
    <template v-else>
      <button type="button" class="empty-cta" @click.stop="toggleInput">
        <span class="empty-cta-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </span>
        <span class="empty-cta-text">
          <span class="empty-cta-title"><span class="title-prefix">첫 </span>PICK 한마디<span class="title-suffix"> 남기기</span></span>
          <span class="empty-cta-sub">이 아이템이 왜 최고인지 알려주세요</span>
        </span>
        <span class="empty-cta-plus" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </span>
      </button>

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
              <h3>PICK 한마디</h3>
              <button class="bs-close" @click="closeBottomSheet" aria-label="닫기">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- 아이템 -->
            <div class="bottomsheet-item-card">
              <img v-if="itemImage" :src="itemImage" :alt="itemName" class="item-thumb" />
              <div class="item-info">
                <span class="item-badge">한마디 남길 아이템</span>
                <span class="item-name">{{ itemName }}</span>
              </div>
            </div>

            <!-- 입력 영역 -->
            <div class="bottomsheet-body">
              <textarea
                ref="bottomSheetInputRef"
                v-model="inputText"
                class="bottomsheet-input"
                placeholder="자유롭게 한마디 남겨주세요 (최대 100자)"
                maxlength="100"
                rows="4"
              ></textarea>
              <div class="input-footer">
                <span class="char-count" :class="{ 'near-limit': inputText.length > 80 }">{{ inputText.length }}/100</span>
              </div>
            </div>

            <!-- 버튼 영역 -->
            <div class="bottomsheet-footer">
              <button
                class="bottomsheet-submit"
                :disabled="!inputText.trim() || submitting"
                @click="handleSubmit"
              >
                <template v-if="submitting">
                  <span class="spinner"></span>
                  등록 중...
                </template>
                <template v-else>
                  한마디 남기기
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

// 모바일 키보드 핸들링: 바텀시트가 열려있는 동안 visualViewport 로 키보드 높이를 추적해
// --chat-kb-h CSS 변수에 반영. 오버레이의 padding-bottom 으로 받아 입력창을 키보드 위로 끌어올림.
// iOS Capacitor 는 네이티브(AppViewController.swift)가 --chat-kb-h 를 권위있게 셋팅하므로 JS 가 덮어쓰지 않는다.
const isCapacitorIOS = (() => {
  if (typeof window === 'undefined') return false
  const cap = window.Capacitor
  if (!cap) return false
  const platform = typeof cap.getPlatform === 'function' ? cap.getPlatform() : cap.platform
  return platform === 'ios'
})()

const updateKeyboardHeight = () => {
  const vv = window.visualViewport
  if (!vv) return
  const keyboardHeight = Math.max(0, window.innerHeight - vv.height)
  document.documentElement.style.setProperty('--chat-kb-h', `${keyboardHeight}px`)
}

const attachKeyboardListener = () => {
  if (isCapacitorIOS) return // 네이티브가 처리
  const vv = window.visualViewport
  if (!vv) return
  vv.addEventListener('resize', updateKeyboardHeight)
  vv.addEventListener('scroll', updateKeyboardHeight)
  updateKeyboardHeight()
}

const detachKeyboardListener = () => {
  if (isCapacitorIOS) return
  const vv = window.visualViewport
  if (!vv) return
  vv.removeEventListener('resize', updateKeyboardHeight)
  vv.removeEventListener('scroll', updateKeyboardHeight)
  document.documentElement.style.setProperty('--chat-kb-h', '0px')
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  detachKeyboardListener()
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
    attachKeyboardListener()
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
  detachKeyboardListener()
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
  if (showBottomSheet.value) {
    showBottomSheet.value = false
    detachKeyboardListener()
  }
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
  border-top: 1px solid var(--border-default);
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
  margin-bottom: 10px;
}

.arg-header .label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  border: none;
  background: none;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
  transition: color 0.15s;
}

.arg-header .label:hover {
  color: var(--c-brand);
}

.arg-header .chat-icon {
  flex-shrink: 0;
  color: var(--c-brand);
}

.arg-header .cnt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 700;
  color: var(--c-brand);
  background: var(--c-brand-soft);
  border-radius: 8px;
  margin-left: 2px;
}

/* 컴팩트 작성 pill — 솔리드 브랜드 chip (눈에 잘 띄게) */
.write-pill {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border: none;
  background: var(--c-brand);
  color: #ffffff;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: background 0.15s, transform 0.1s;
}

.write-pill:hover {
  background: var(--c-brand-hover);
}

.write-pill:active {
  transform: scale(0.95);
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
  border: 1.5px solid var(--border-strong);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.inline-input:focus {
  border-color: var(--c-brand);
}

.inline-input::placeholder {
  color: var(--c-text-400);
}

.submit-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: var(--c-brand);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}

.submit-btn:hover:not(:disabled) {
  background: var(--c-info-hover);
}

.submit-btn:disabled {
  background: var(--c-text-300);
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

/* BEST 변론 카드 — 노란 톤 (요거뜨 시그니처) */
.best-arg {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  background: var(--c-warning-soft);
  border-radius: 12px;
  border: 1px solid var(--c-warning);
  cursor: pointer;
  transition: filter 0.15s;
}

.best-arg:hover {
  filter: brightness(0.98);
}

img.ba-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
}

div.ba-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--c-warning);
  flex-shrink: 0;
}

.ba-body {
  flex: 1;
  min-width: 0;
}

.ba-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}

.ba-nick {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.best-badge {
  font-size: 9px;
  font-weight: 800;
  color: var(--c-warning);
  background: var(--bg-elevated);
  padding: 2px 6px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  border: 1px solid var(--c-warning);
}

.ba-text {
  font-size: 12.5px;
  color: var(--c-text-600);
  line-height: 1.45;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.01em;
}

.ba-likes {
  margin-left: auto;
  font-size: 10px;
  color: var(--c-danger);
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

/* 댓글 1개일 때 — 공간만 reserve, 시각/클릭 모두 비활성 */
.view-all.is-placeholder {
  visibility: hidden;
  pointer-events: none;
}

.view-all button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 11px;
  font-weight: 700;
  color: var(--c-brand);
  cursor: pointer;
  font-family: inherit;
  padding: 5px 12px;
  border-radius: 999px;
  letter-spacing: -0.01em;
  transition: background 0.15s;
}

.view-all button:hover {
  background: var(--c-brand-soft);
}

/* 빈 상태 — 부드러운 브랜드 톤 CTA (따뜻한 인상) */
.empty-cta {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  background: var(--c-brand-soft);
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: filter 0.15s, transform 0.1s;
}

.empty-cta:hover {
  filter: brightness(0.97);
}

.empty-cta:active {
  transform: scale(0.99);
}

.empty-cta-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  color: var(--c-brand);
}

.empty-cta-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.empty-cta-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  word-break: keep-all;
  line-height: 1.35;
}

.empty-cta-sub {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--c-text-500);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* write-pill 과 동일한 원형 + 아이콘으로 통일 */
.empty-cta-plus {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--c-brand);
  color: #ffffff;
}

/* 모바일 최적화 */
@media (max-width: 480px) {
  .pc-card-arguments {
    padding: 10px 12px;
    min-height: 76px;
  }

  .arg-header {
    margin-bottom: 8px;
  }

  .arg-header .label {
    font-size: 11px;
  }

  .arg-header .chat-icon {
    width: 12px;
    height: 12px;
  }

  .arg-header .cnt {
    font-size: 9.5px;
    min-width: 14px;
    height: 14px;
    padding: 0 4px;
  }

  .write-pill {
    width: 22px;
    height: 22px;
  }
  .write-pill svg { width: 12px; height: 12px; }

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
    padding: 8px 10px;
    gap: 8px;
    border-radius: 10px;
  }

  img.ba-avatar,
  div.ba-avatar {
    width: 22px;
    height: 22px;
  }

  div.ba-avatar {
    font-size: 9px;
  }

  .ba-nick {
    font-size: 10.5px;
  }

  .best-badge {
    font-size: 8.5px;
    padding: 1.5px 5px;
  }

  .ba-text {
    font-size: 11.5px;
    line-height: 1.35;
    -webkit-line-clamp: 2;
  }

  .ba-likes {
    font-size: 9.5px;
  }

  .ba-likes svg {
    width: 9px;
    height: 9px;
  }

  .view-all {
    margin-top: 6px;
  }

  .view-all button {
    font-size: 10.5px;
    padding: 4px 10px;
  }

  /* 빈 상태 CTA — 모바일에서는 title 한 줄만 노출되므로 한 줄 높이에 맞게 컴팩트 */
  .empty-cta {
    padding: 11px 12px;
    gap: 9px;
    align-items: center;
  }
  .empty-cta-icon { width: 26px; height: 26px; }
  .empty-cta-text {
    justify-content: center;
  }
  .empty-cta-title {
    font-size: 12px;
    line-height: 1.3;
    word-break: keep-all;
  }
  /* 모바일은 "PICK 한마디" 만 노출 — 좌우 단어 모두 숨김 */
  .empty-cta-title .title-prefix,
  .empty-cta-title .title-suffix { display: none; }
  .empty-cta-sub { display: none; }
  .empty-cta-plus {
    width: 22px;
    height: 22px;
  }
  .empty-cta-plus svg { width: 12px; height: 12px; }
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
  /* 모바일 키보드가 올라오면 그 높이만큼 바텀시트를 위로 끌어올린다 */
  padding-bottom: var(--chat-kb-h, 0px);
  transition: padding-bottom 0.2s ease;
}

.bottomsheet {
  background: var(--bg-elevated);
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
  width: 36px;
  height: 4px;
  background: var(--border-strong);
  border-radius: 999px;
  margin: 10px auto 0;
}

/* 헤더 */
.bottomsheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
}

.bottomsheet-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.bs-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: var(--bg-subtle);
  color: var(--c-text-500);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.bs-close:hover {
  background: var(--border-default);
  color: var(--text-primary);
}

/* 아이템 — 가벼운 중립 카드 + 작은 썸네일 */
.bottomsheet-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 20px 14px;
  padding: 10px 12px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: 12px;
}

.bottomsheet-item-card .item-thumb {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  object-fit: cover;
  background: var(--bg-elevated);
  flex-shrink: 0;
}

.bottomsheet-item-card .item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bottomsheet-item-card .item-badge {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--c-text-500);
  letter-spacing: -0.01em;
}

.bottomsheet-item-card .item-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

/* 입력 영역 — 한 줄 깔끔한 textarea, 글자수만 우측 정렬 */
.bottomsheet-body {
  padding: 0 20px 12px;
}

.bottomsheet-input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid var(--border-strong);
  border-radius: 14px;
  font-size: 15px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
  background: var(--bg-elevated);
  color: var(--text-primary);
  line-height: 1.5;
  letter-spacing: -0.01em;
}

.bottomsheet-input:focus {
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.12);
}

.bottomsheet-input::placeholder {
  color: var(--c-text-400);
  font-weight: 500;
}

.input-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 4px 0;
}

.char-count {
  font-size: 12px;
  color: var(--c-text-400);
  font-weight: 600;
  transition: color 0.2s;
  font-variant-numeric: tabular-nums;
}

.char-count.near-limit {
  color: var(--c-warning);
}

/* 버튼 영역 — full-width 솔리드 CTA, 그림자 절제 */
.bottomsheet-footer {
  padding: 8px 20px 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

.bottomsheet-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 20px;
  background: var(--c-brand);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
  transition: background 0.15s, transform 0.1s;
}

.bottomsheet-submit:hover:not(:disabled) {
  background: var(--c-brand-hover);
}

.bottomsheet-submit:active:not(:disabled) {
  transform: scale(0.99);
}

.bottomsheet-submit:disabled {
  background: var(--border-strong);
  color: var(--c-text-400);
  cursor: not-allowed;
}

.bottomsheet-submit .spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
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
