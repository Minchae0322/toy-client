<template>
  <div class="pc-card-arguments" @click="$emit('open-comments')">
    <!-- 코멘트가 있을 때 -->
    <template v-if="commentSummary">
      <div class="arg-header">
        <span class="label">
          <svg class="chat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#4a6cf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          PICK 한마디
        </span>
        <span class="cnt">{{ commentCount }}개</span>
      </div>

      <div class="best-arg">
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

      <div v-if="remainingCount > 0" class="view-all">
        <button>PICK 한마디 {{ remainingCount }}개 더보기</button>
      </div>
    </template>

    <!-- 코멘트가 없을 때 -->
    <template v-else>
      <div class="empty-state">
        <svg class="empty-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="empty-text">첫 PICK 한마디를 남겨보세요!</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  commentSummary: { type: Object, default: null },
  itemId: { type: [Number, String], required: true },
  itemName: { type: String, default: '' }
})

defineEmits(['open-comments'])

const imageLoadFailed = ref(false)

const commentCount = computed(() => props.commentSummary?.commentCount || 0)
const remainingCount = computed(() => Math.max(0, (props.commentSummary?.commentCount || 0) - 1))
const avatarInitial = computed(() => {
  return (props.commentSummary?.creatorNickname || '?').charAt(0).toUpperCase()
})
</script>

<style scoped>
.pc-card-arguments {
  border-top: 1px solid #f3f4f6;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.pc-card-arguments:hover {
  background: #fafbff;
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
}

.arg-header .chat-icon {
  flex-shrink: 0;
}

.arg-header .cnt {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 600;
}

/* BEST 변론 카드 */
.best-arg {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  background: linear-gradient(135deg, #fffbeb, #fef9e7);
  border-radius: 10px;
  border: 1px solid #fde68a;
}

.ba-avatar {
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
  object-fit: cover;
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
.empty-state {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
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

.pc-card-arguments:hover .empty-icon,
.pc-card-arguments:hover .empty-text {
  color: #4a6cf7;
}

/* 모바일 최적화 */
@media (max-width: 480px) {
  .pc-card-arguments {
    padding: 10px 12px;
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

  .best-arg {
    padding: 6px 8px;
    gap: 6px;
    border-radius: 8px;
  }

  .ba-avatar {
    width: 20px;
    height: 20px;
    font-size: 9px;
  }

  .ba-nick {
    font-size: 10px;
  }

  .best-badge {
    font-size: 8px;
    padding: 1px 4px;
  }

  .ba-text {
    font-size: 11px;
    line-height: 1.35;
  }

  .ba-likes {
    font-size: 9px;
  }

  .ba-likes svg {
    width: 9px;
    height: 9px;
  }

  .view-all {
    margin-top: 6px;
  }

  .view-all button {
    font-size: 10px;
    padding: 3px 8px;
  }

  .empty-icon {
    width: 14px;
    height: 14px;
  }

  .empty-text {
    font-size: 11px;
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
