<template>
  <div v-if="threadReviews?.length > 0" class="thread-section">
    <!-- Header -->
    <div class="thread-header">
      <div class="header-left">
        <div class="header-bar" :class="evalGradientClass"></div>
        <div>
          <h3 class="header-title">후속 리뷰</h3>
          <p class="header-subtitle">사용 기간별 생생한 후기</p>
        </div>
      </div>
      <span class="thread-count">{{ threadReviews.length }}</span>
    </div>

    <!-- Timeline -->
    <div class="thread-content">
      <div class="timeline-container">
        <!-- Timeline Line -->
        <div class="timeline-line"></div>

        <!-- Review Items -->
        <div class="timeline-items">
          <div
              v-for="(review, idx) in visibleThreads"
              :key="review.id"
              class="timeline-item"
              :class="{ 'is-selected': selectedThread === review.id }"
              @click="toggleThread(review.id)"
          >
            <!-- Timeline Dot -->
            <div class="timeline-dot" :class="getEvalDotClass(review.evaluation)"></div>

            <!-- Review Card -->
            <div class="review-card" :class="{ 'selected': selectedThread === review.id }">
              <div class="review-header">
                <span class="eval-badge" :class="getEvalBadgeClass(review.evaluation)">
                  {{ getEvalLabel(review.evaluation) }}
                </span>
                <span class="review-date">{{ review.daysAgo }}일 전</span>
                <div class="flex-spacer"></div>
                <span class="review-likes">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  {{ review.likeCount }}
                </span>
              </div>

              <p class="review-content" :class="{ 'expanded': selectedThread === review.id }">
                {{ review.content }}
              </p>

              <!-- Images -->
              <div v-if="review.images?.length > 0" class="review-images">
                <div v-for="(img, i) in review.images" :key="i" class="review-image">
                  <img :src="img" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Expand Button -->
        <button
            v-if="threadReviews.length > 2"
            class="expand-btn"
            @click.stop="expanded = !expanded"
        >
          <span>{{ expanded ? '접기' : `${threadReviews.length - 2}개 더 보기` }}</span>
          <svg :class="{ 'rotated': expanded }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Add Review Button -->
    <div class="thread-footer" v-if="isOwner">
      <button class="add-review-btn" @click="$emit('add-review')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        후속 리뷰 작성하기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  threadReviews: {
    type: Array,
    default: () => []
  },
  feedEvaluation: {
    type: String,
    default: 'GOOD'
  },
  isOwner: {
    type: Boolean,
    default: false
  }
})

defineEmits(['add-review', 'select-review'])

const expanded = ref(false)
const selectedThread = ref(null)

const visibleThreads = computed(() =>
    expanded.value ? props.threadReviews : props.threadReviews.slice(0, 2)
)

const evalGradientClass = computed(() => {
  const map = {
    BEST: 'gradient-amber',
    GOOD: 'gradient-emerald',
    OKAY: 'gradient-sky',
    BAD: 'gradient-rose'
  }
  return map[props.feedEvaluation] || 'gradient-slate'
})

const toggleThread = (id) => {
  selectedThread.value = selectedThread.value === id ? null : id
}

const getEvalLabel = (evaluation) => {
  const labels = { BEST: '최고예요', GOOD: '좋아요', OKAY: '괜찮아요', BAD: '별로예요' }
  return labels[evaluation] || ''
}

const getEvalDotClass = (evaluation) => {
  const map = { BEST: 'dot-amber', GOOD: 'dot-emerald', OKAY: 'dot-sky', BAD: 'dot-rose' }
  return map[evaluation] || 'dot-slate'
}

const getEvalBadgeClass = (evaluation) => {
  const map = { BEST: 'badge-amber', GOOD: 'badge-emerald', OKAY: 'badge-sky', BAD: 'badge-rose' }
  return map[evaluation] || 'badge-slate'
}
</script>

<style scoped>
.thread-section {
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* Header */
.thread-header {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-bar {
  width: 4px;
  height: 32px;
  border-radius: 4px;
}

.gradient-amber { background: linear-gradient(to bottom, #fbbf24, #f97316); }
.gradient-emerald { background: linear-gradient(to bottom, #34d399, #14b8a6); }
.gradient-sky { background: linear-gradient(to bottom, #38bdf8, #3b82f6); }
.gradient-rose { background: linear-gradient(to bottom, #fb7185, #ec4899); }
.gradient-slate { background: linear-gradient(to bottom, #94a3b8, #64748b); }

.header-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.header-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.thread-count {
  padding: 4px 10px;
  background: #f5f3ff;
  color: #7c3aed;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

/* Timeline */
.thread-content {
  padding: 16px;
}

.timeline-container {
  position: relative;
}

.timeline-line {
  position: absolute;
  left: 11px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #c4b5fd, #a78bfa, #e2e8f0);
  border-radius: 2px;
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  position: relative;
  padding-left: 32px;
  cursor: pointer;
}

.timeline-dot {
  position: absolute;
  left: 5px;
  top: 16px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 0 4px white;
  transition: transform 0.2s ease;
}

.timeline-item:hover .timeline-dot {
  transform: scale(1.15);
}

.dot-amber { background: #fbbf24; }
.dot-emerald { background: #34d399; }
.dot-sky { background: #38bdf8; }
.dot-rose { background: #fb7185; }
.dot-slate { background: #94a3b8; }

/* Review Card */
.review-card {
  padding: 16px;
  background: linear-gradient(to bottom right, rgba(248, 250, 252, 0.8), white);
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.review-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.review-card.selected {
  border-color: #c4b5fd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.review-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.eval-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
}

.badge-amber { background: #fffbeb; color: #d97706; }
.badge-emerald { background: #ecfdf5; color: #059669; }
.badge-sky { background: #f0f9ff; color: #0284c7; }
.badge-rose { background: #fff1f2; color: #e11d48; }
.badge-slate { background: #f8fafc; color: #64748b; }

.review-date {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.flex-spacer {
  flex: 1;
}

.review-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
}

.review-likes svg {
  width: 14px;
  height: 14px;
}

.review-content {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.review-content.expanded {
  display: block;
  -webkit-line-clamp: unset;
}

/* Review Images */
.review-images {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.review-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f1f5f9;
}

.review-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Expand Button */
.expand-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 32px;
  margin-top: 16px;
  padding: 0;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #7c3aed;
  cursor: pointer;
  transition: color 0.2s ease;
}

.expand-btn:hover {
  color: #6d28d9;
}

.expand-btn svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.expand-btn svg.rotated {
  transform: rotate(180deg);
}

/* Footer */
.thread-footer {
  padding: 0 16px 16px;
}

.add-review-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(to right, #8b5cf6, #a855f7);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}

.add-review-btn:hover {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
  transform: translateY(-1px);
}

.add-review-btn svg {
  width: 16px;
  height: 16px;
}
</style>