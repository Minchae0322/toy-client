<template>
  <div class="review-section-inner">
    <!-- 평점 요약 (리뷰 1개 이상일 때) -->
    <div v-if="reviews.length > 0" class="overview">
      <div class="overview-left">
        <span class="overview-num">{{ avgRating.toFixed(1) }}</span>
        <span class="overview-max">/ 5</span>
      </div>
      <div class="overview-right">
        <div class="overview-stars">
          <svg
            v-for="n in 5" :key="n"
            width="14" height="14" viewBox="0 0 24 24"
            :fill="n <= Math.round(avgRating) ? '#EAB308' : '#F1F3F6'"
            :stroke="n <= Math.round(avgRating) ? '#EAB308' : '#F1F3F6'"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <span class="overview-count">리뷰 {{ reviews.length }}개</span>
      </div>
    </div>

    <!-- 별점 입력 -->
    <div v-if="isLoggedIn" class="composer">
      <p class="composer-label">별점 남기기</p>
      <div class="stars">
        <button
          v-for="n in 5" :key="n"
          type="button"
          class="star-btn"
          @click="draftRating = n"
          @mouseenter="hoverRating = n"
          @mouseleave="hoverRating = 0"
          :aria-label="`${n}점`"
        >
          <svg
            width="34" height="34" viewBox="0 0 24 24"
            :fill="n <= (hoverRating || draftRating) ? '#EAB308' : '#F1F3F6'"
            :stroke="n <= (hoverRating || draftRating) ? '#EAB308' : '#F1F3F6'"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      </div>
      <p class="rating-feedback" :class="{ active: !!(hoverRating || draftRating) }">
        {{ ratingLabel || '탭해서 별점을 선택해주세요' }}
      </p>
      <button
        class="btn-submit"
        :disabled="!canSubmit || submitting"
        @click="submitReview"
      >
        {{ submitting ? '등록 중' : '별점 등록' }}
      </button>
    </div>

    <!-- 비로그인 안내 -->
    <button v-else class="login-prompt" @click="$emit('login-required')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      <span>로그인하고 별점을 남겨보세요</span>
    </button>

    <!-- 목록 -->
    <div v-if="loading && reviews.length === 0" class="state-box">
      <div class="spinner"></div>
    </div>

    <ul v-else-if="reviews.length > 0" class="review-list">
      <li v-for="rv in reviews" :key="rv.id" class="review-item">
        <div class="rv-avatar" :style="{ background: avatarColor(rv.creatorName) }">
          {{ initial(rv.creatorName) }}
        </div>
        <div class="rv-body">
          <div class="rv-row1">
            <span class="rv-name">{{ rv.creatorName || '익명' }}</span>
            <div class="rv-stars">
              <svg
                v-for="n in 5" :key="n"
                width="12" height="12" viewBox="0 0 24 24"
                :fill="n <= rv.rating ? '#EAB308' : '#F1F3F6'"
                :stroke="n <= rv.rating ? '#EAB308' : '#F1F3F6'"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
          </div>
          <span class="rv-time">{{ formatTime(rv.createdAt) }}</span>
          <p v-if="rv.comment" class="rv-comment">{{ rv.comment }}</p>
        </div>
        <button
          v-if="rv.creatorId === currentUserId"
          class="rv-delete"
          :disabled="deletingId === rv.id"
          @click="$emit('delete', rv.id)"
          aria-label="삭제"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </li>
    </ul>

    <div v-else class="empty-box">
      <p class="empty-title">아직 등록된 별점이 없어요</p>
      <p class="empty-desc">첫 번째로 별점을 남겨보세요</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  reviews: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  deletingId: { type: [Number, String, null], default: null },
  isLoggedIn: { type: Boolean, default: false },
  currentUserId: { type: [Number, String, null], default: null },
})

const emit = defineEmits(['submit', 'delete', 'login-required'])

const draftRating = ref(0)
const hoverRating = ref(0)

const canSubmit = computed(() => draftRating.value >= 1 && draftRating.value <= 5)

const ratingLabel = computed(() => {
  const n = hoverRating.value || draftRating.value
  return ['', '별로예요', '아쉬워요', '괜찮아요', '좋아요', '최고예요'][n] || ''
})

const avgRating = computed(() => {
  if (!props.reviews.length) return 0
  const sum = props.reviews.reduce((acc, r) => acc + (r.rating || 0), 0)
  return sum / props.reviews.length
})

function submitReview() {
  if (!canSubmit.value || props.submitting) return
  emit('submit', {
    rating: draftRating.value,
    comment: '',
    onSuccess: () => {
      draftRating.value = 0
      hoverRating.value = 0
    },
  })
}

function initial(name) {
  if (!name) return '?'
  return String(name).trim().charAt(0).toUpperCase()
}

const AVATAR_COLORS = ['#94A3B8', '#3B82F6', '#A855F7', '#F97316', '#06B6D4']
function avatarColor(name) {
  if (!name) return '#94A3B8'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금 전'
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}일 전`
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.review-section-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 16px;
}

/* ===== 평점 요약 ===== */
.overview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: var(--bg-subtle);
  border-radius: 14px;
}
.overview-left { display: inline-flex; align-items: baseline; gap: 4px; }
.overview-num {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.6px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.overview-max { font-size: 14px; color: var(--c-text-400); font-weight: 600; }
.overview-right { display: flex; flex-direction: column; gap: 4px; }
.overview-stars { display: flex; gap: 2px; }
.overview-count { font-size: 12px; color: var(--c-text-500); font-weight: 500; }

/* ===== 별점 입력 ===== */
.composer {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 22px 18px 18px;
  text-align: center;
}
.composer-label {
  margin: 0 0 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text-600);
  letter-spacing: -0.2px;
}
.stars { display: flex; justify-content: center; gap: 6px; margin-bottom: 10px; }
.star-btn {
  background: transparent;
  border: none;
  padding: 2px;
  cursor: pointer;
  line-height: 0;
  transition: transform 0.12s ease;
}
.star-btn:hover { transform: scale(1.08); }
.star-btn:active { transform: scale(0.95); }

.rating-feedback {
  margin: 0 0 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-400);
  letter-spacing: -0.2px;
  min-height: 18px;
  transition: color 0.15s;
}
.rating-feedback.active { color: var(--c-brand); }

.btn-submit {
  width: 100%;
  padding: 13px 16px;
  background: var(--c-ink-900);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  letter-spacing: -0.2px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.btn-submit:hover:not(:disabled) { background: var(--c-ink-700); }
.btn-submit:active:not(:disabled) { transform: scale(0.99); }
.btn-submit:disabled {
  background: var(--border-default);
  color: var(--c-text-300);
  cursor: not-allowed;
}

/* ===== 비로그인 ===== */
.login-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 16px;
  background: var(--bg-elevated);
  border: 1px dashed var(--border-default);
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-500);
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.login-prompt:hover {
  border-color: var(--c-brand);
  color: var(--c-brand);
  background: var(--c-brand-soft);
}

/* ===== 목록 ===== */
.review-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}
.review-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 4px;
  border-bottom: 1px solid var(--border-default);
}
.review-item:last-child { border-bottom: none; }

.rv-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
}
.rv-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.rv-row1 { display: flex; align-items: center; gap: 8px; }
.rv-name { font-size: 13px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.2px; }
.rv-stars { display: flex; gap: 1px; }
.rv-time { font-size: 11px; color: var(--c-text-400); font-weight: 500; }
.rv-comment {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--c-text-600);
  line-height: 1.55;
  white-space: pre-wrap;
}
.rv-delete {
  background: transparent;
  border: none;
  color: var(--c-text-300);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}
.rv-delete:hover:not(:disabled) { color: var(--c-danger); background: var(--c-danger-soft); }
.rv-delete:disabled { opacity: 0.4; cursor: not-allowed; }

/* ===== 상태 ===== */
.state-box, .empty-box { text-align: center; padding: 28px 16px; }
.empty-title { font-size: 14px; font-weight: 700; color: var(--c-text-600); margin: 0 0 4px; letter-spacing: -0.2px; }
.empty-desc { font-size: 12px; color: var(--c-text-400); margin: 0; font-weight: 500; }
.spinner {
  width: 24px; height: 24px; margin: 0 auto;
  border: 2px solid var(--border-default); border-top-color: var(--c-brand); border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
