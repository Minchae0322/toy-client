<template>
  <div class="comment-dock">
    <!-- 코멘트가 있을 때: BEST 한 블록 안에 모든 메타·액션 통합 -->
    <template v-if="commentSummary">
      <div class="best-block" @click="$emit('open-comments')">
        <img
          v-if="commentSummary.creatorProfileImageUrl && !imageLoadFailed"
          class="bb-avatar"
          :src="commentSummary.creatorProfileImageUrl"
          :alt="commentSummary.creatorNickname"
          @error="imageLoadFailed = true"
        />
        <div v-else class="bb-avatar bb-avatar-fallback">{{ avatarInitial }}</div>

        <div class="bb-body">
          <div class="bb-meta">
            <span class="bb-nick">{{ commentSummary.creatorNickname }}</span>
            <span class="bb-best-pill">BEST</span>
            <span class="bb-likes" aria-label="공감 수">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {{ commentSummary.likeCount }}
            </span>
          </div>
          <p class="bb-text">{{ commentSummary.content }}</p>
          <div class="bb-foot">
            <span v-if="remainingCount > 0" class="bb-more">
              +{{ remainingCount }}개 더보기
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </span>
            <button type="button" class="bb-write" aria-label="한마디 남기기" @click.stop="toggleInput">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <span>한마디</span>
            </button>
          </div>
        </div>
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
    </template>

    <!-- 코멘트가 없을 때: 단 한 줄 슬림 CTA -->
    <template v-else>
      <button type="button" class="empty-row" @click.stop="toggleInput">
        <span class="empty-row-icon" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </span>
        <span class="empty-row-text">첫 PICK 한마디 남기기</span>
        <span class="empty-row-arrow" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
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
/* ============================== */
/* 컴팩트 통합 도크 — Toss/오늘의집 톤 */
/* populated/empty 모두 단일 블록, 강제 stretch 제거 */
/* ============================== */
.comment-dock {
  border-top: 1px solid var(--border-default);
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 8px;
}

/* ── BEST 한마디 블록 — 1개 카드 안에 메타·본문·액션 통합 ── */
.best-block {
  position: relative;
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: var(--c-warning-soft);
  border: 1px solid var(--c-warning);
  border-radius: 12px;
  cursor: pointer;
  transition: filter 0.15s;
}

.best-block:hover {
  filter: brightness(0.985);
}

img.bb-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

div.bb-avatar.bb-avatar-fallback {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: var(--c-warning);
}

.bb-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bb-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.bb-nick {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}

.bb-best-pill {
  font-size: 9px;
  font-weight: 800;
  color: var(--c-warning);
  background: var(--bg-elevated);
  padding: 2px 6px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  border: 1px solid var(--c-warning);
  flex-shrink: 0;
}

.bb-likes {
  margin-left: auto;
  font-size: 10.5px;
  color: var(--c-danger);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 600;
  flex-shrink: 0;
}

.bb-text {
  font-size: 12.5px;
  color: var(--c-text-600);
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.01em;
  word-break: break-word;
}

.bb-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 2px;
  min-height: 22px;
}

.bb-more {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--c-warning);
  letter-spacing: -0.01em;
}

.bb-write {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  border-radius: 999px;
  background: var(--c-brand);
  color: #ffffff;
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.bb-write:hover {
  background: var(--c-brand-hover);
}

.bb-write:active {
  transform: scale(0.96);
}

/* ── 빈 상태 — 단 한줄 슬림 CTA ── */
.empty-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: var(--c-brand-soft);
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: filter 0.15s, transform 0.1s;
}

.empty-row:hover {
  filter: brightness(0.97);
}

.empty-row:active {
  transform: scale(0.99);
}

.empty-row-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  color: var(--c-brand);
}

.empty-row-text {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-row-arrow {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--c-brand);
  opacity: 0.85;
}

/* 인라인 입력창 */
.inline-input-wrap {
  display: flex;
  gap: 12px;
  margin-top: 4px;
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

/* ── 모바일 최적화 ── */
@media (max-width: 480px) {
  .comment-dock {
    padding: 8px 10px 10px;
    gap: 6px;
  }

  /* 인라인 입력창 — 한 줄에 입력+버튼 */
  .inline-input-wrap {
    flex-direction: row;
    gap: 4px;
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

  /* BEST 블록 모바일 — 더 타이트하게 */
  .best-block {
    grid-template-columns: 22px 1fr;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 10px;
  }

  img.bb-avatar,
  div.bb-avatar.bb-avatar-fallback {
    width: 22px;
    height: 22px;
  }

  div.bb-avatar.bb-avatar-fallback {
    font-size: 10px;
  }

  .bb-nick {
    font-size: 10.5px;
    max-width: 64px;
  }

  .bb-best-pill {
    font-size: 8.5px;
    padding: 1.5px 5px;
  }

  .bb-text {
    font-size: 11.5px;
    line-height: 1.35;
  }

  .bb-likes {
    font-size: 9.5px;
  }

  .bb-likes svg {
    width: 9px;
    height: 9px;
  }

  .bb-foot {
    min-height: 20px;
  }

  .bb-more {
    font-size: 9.5px;
  }

  .bb-write {
    padding: 3px 8px;
    font-size: 9.5px;
    gap: 3px;
  }

  .bb-write svg {
    width: 11px;
    height: 11px;
  }

  /* 빈 상태 단 한줄 — 모바일은 더 슬림 */
  .empty-row {
    padding: 9px 11px;
    gap: 8px;
    border-radius: 9px;
  }

  .empty-row-icon {
    width: 20px;
    height: 20px;
  }

  .empty-row-text {
    font-size: 11.5px;
  }
}

/* ── PC 최적화 ── */
@media (min-width: 768px) {
  .comment-dock {
    padding: 12px 16px 14px;
  }

  .best-block {
    padding: 11px 13px;
  }

  .bb-text {
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
