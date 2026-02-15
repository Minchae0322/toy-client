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

      <!-- 인라인 입력창 -->
      <transition name="slide">
        <div v-if="showInput" class="inline-input-wrap" @click.stop>
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
          </div>
          <p class="ba-text">{{ commentSummary.content }}</p>
          <div class="ba-likes">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {{ commentSummary.likeCount }}
          </div>
        </div>
      </div>

      <div v-if="remainingCount > 0" class="view-all" @click="$emit('open-comments')">
        <button>PICK 한마디 {{ remainingCount }}개 더보기</button>
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

      <!-- 인라인 입력창 (빈 상태) -->
      <transition name="slide">
        <div v-if="showInput" class="inline-input-wrap" @click.stop>
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
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  commentSummary: { type: Object, default: null },
  itemId: { type: [Number, String], required: true },
  itemName: { type: String, default: '' },
  submitting: { type: Boolean, default: false }
})

const emit = defineEmits(['open-comments', 'submit-comment'])

const imageLoadFailed = ref(false)
const showInput = ref(false)
const inputText = ref('')
const inputRef = ref(null)

const commentCount = computed(() => props.commentSummary?.commentCount || 0)
const remainingCount = computed(() => Math.max(0, (props.commentSummary?.commentCount || 0) - 1))
const avatarInitial = computed(() => {
  return (props.commentSummary?.creatorNickname || '?').charAt(0).toUpperCase()
})

const toggleInput = () => {
  showInput.value = !showInput.value
  if (showInput.value) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

const handleSubmit = () => {
  if (!inputText.value.trim() || props.submitting) return

  emit('submit-comment', inputText.value.trim())
  inputText.value = ''
  showInput.value = false
}

// 외부에서 입력창 닫기
const closeInput = () => {
  showInput.value = false
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
  gap: 8px;
  margin-bottom: 10px;
}

.inline-input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.inline-input:focus {
  border-color: #4a6cf7;
}

.inline-input::placeholder {
  color: #9ca3af;
}

.submit-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #4a6cf7;
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
  background: linear-gradient(135deg, #fffbeb, #fef9e7);
  border-radius: 10px;
  border: 1px solid #fde68a;
  cursor: pointer;
  transition: all 0.15s;
}

.best-arg:hover {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
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
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
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
  margin-top: 3px;
  display: flex;
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

  .inline-input-wrap {
    margin-bottom: 8px;
    gap: 6px;
  }

  .inline-input {
    padding: 8px 12px;
    font-size: 12px;
    border-radius: 10px;
  }

  .submit-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
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
</style>
