<template>
  <div class="preview-section" :class="{ collapsed: isCollapsed }">
    <!-- 모바일 토글 버튼 -->
    <button class="preview-toggle" @click="isCollapsed = !isCollapsed">
      <span class="toggle-icon">
        <!-- Eye Icon -->
        <svg v-if="isCollapsed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <!-- Close Icon -->
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </span>
      <span class="toggle-text">{{ isCollapsed ? '미리보기' : '닫기' }}</span>
    </button>

    <div class="preview-label">미리보기</div>
    <div class="preview-card">
      <!-- ⭐ 대표 이미지가 있으면 표시 -->
      <div
          v-if="previewImageUrl"
          class="preview-visual preview-image"
          :style="{ backgroundImage: `url(${previewImageUrl})` }"
      >
        <div class="preview-type-badge">{{ previewVoteTypeName }}</div>
      </div>

      <!-- 큐레이션 타입 시각화 -->
      <div
          v-else-if="battleForm.type === 'curation' && selectedItems.length > 0"
          class="preview-visual"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative; overflow: hidden;"
      >
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; padding: 20px; height: 100%;">
          <div style="grid-column: span 1; grid-row: span 2; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
            <div style="text-align: center;">
              <div style="font-size: 36px; margin-bottom: 4px;">{{ selectedItems[0].emoji }}</div>
              <div style="font-size: 11px; color: white; font-weight: 600;">{{ selectedItems[0].name }}</div>
            </div>
          </div>
          <div
              v-for="i in 2"
              :key="i"
              style="background: rgba(255,255,255,0.15); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 20px; backdrop-filter: blur(10px);"
          >
            <span v-if="selectedItems[i]?.emoji">{{ selectedItems[i].emoji }}</span>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(255,255,255,0.7);">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
        </div>
        <div class="preview-type-badge">큐레이션</div>
      </div>

      <!-- 기본 플레이스홀더 -->
      <div v-else class="preview-visual">
        <div class="preview-visual-placeholder">
          <span v-if="previewEmoji">{{ previewEmoji }}</span>
          <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <div class="preview-type-badge">{{ previewVoteTypeName }}</div>
      </div>

      <div class="preview-content">
        <div class="preview-category">{{ previewCategoryName }}</div>
        <div class="preview-title">{{ battleForm.title || '배틀 제목을 입력해주세요' }}</div>
        <div class="preview-stats">
          <div class="preview-stat">
            <div class="preview-stat-value">0</div>
            <div class="preview-stat-label">참여자</div>
          </div>
          <div class="preview-stat">
            <div class="preview-stat-value">0</div>
            <div class="preview-stat-label">투표</div>
          </div>
          <div class="preview-stat">
            <div class="preview-stat-value">{{ selectedItems.length }}</div>
            <div class="preview-stat-label">제품</div>
          </div>
        </div>
        <div class="preview-footer">
          <div class="preview-creator">@your_username</div>
          <div class="preview-date">{{ dateDiffText }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const isCollapsed = ref(true); // 모바일에서 기본적으로 접힌 상태

const props = defineProps({
  battleForm: {
    type: Object,
    required: true
  },
  selectedItems: {
    type: Array,
    default: () => []
  },
  previewEmoji: {
    type: String,
    default: null
  },
  previewPermissionTypeName: {
    type: String,
    default: ''
  },
  previewCategoryName: {
    type: String,
    default: ''
  },
  previewVoteTypeName: {
    type: String,
    default: ''
  },
  dateDiffText: {
    type: String,
    default: ''
  }
});

// ⭐ 대표 이미지 URL 생성
const previewImageUrl = computed(() => {
  if (!props.battleForm.thumbnailFile) return null;
  return URL.createObjectURL(props.battleForm.thumbnailFile);
});
</script>

<style scoped>
.preview-section {
  width: 400px;
  position: sticky;
  top: 100px;
  height: fit-content;
  flex-shrink: 0;
}

.preview-label {
  font-size: 14px;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 16px;
}

.preview-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.preview-visual {
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* ⭐ 업로드된 이미지 스타일 */
.preview-image {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #f3f4f6;
}

.preview-visual-placeholder {
  font-size: 48px;
  opacity: 0.5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-type-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  color: white;
  font-size: 11px;
  font-weight: 600;
}

.preview-content {
  padding: 24px;
}

.preview-category {
  font-size: 12px;
  color: #9CA3AF;
  margin-bottom: 8px;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16px;
  min-height: 50px;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid #F3F4F6;
  border-bottom: 1px solid #F3F4F6;
}

.preview-stat {
  text-align: center;
}

.preview-stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1A1A1A;
}

.preview-stat-label {
  font-size: 11px;
  color: #9CA3AF;
}

.preview-footer {
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-creator {
  font-size: 13px;
  color: #6B7280;
}

.preview-date {
  font-size: 12px;
  color: #9CA3AF;
}

/* 모바일 토글 버튼 - 사용 안함 */
.preview-toggle {
  display: none;
}

/* ===== 모바일 반응형 - 미리보기 숨김 ===== */
@media (max-width: 1024px) {
  .preview-section {
    display: none;
  }
}
</style>