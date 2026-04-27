<template>
  <div class="step-container">
    <!-- 상단 상태 헤더 -->
    <div class="status-header" :class="{ ready: isAllCompleted, incomplete: !isAllCompleted }">
      <div class="status-icon">
        <svg v-if="isAllCompleted" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="status-content">
        <h2 class="status-title">{{ isAllCompleted ? '요거픽 생성 준비 완료' : '필수 항목을 완료해주세요' }}</h2>
        <p class="status-desc">{{ isAllCompleted ? '모든 필수 항목이 완료되었습니다. 최종 확인 후 요거픽을 생성하세요.' : `아직 ${incompleteCount}개의 필수 항목이 남아있습니다.` }}</p>
      </div>
    </div>

    <!-- 필수 항목 체크리스트 -->
    <div class="checklist-card">
      <div class="card-header">
        <div class="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <div class="card-title-group">
          <h3 class="card-title">필수 항목 확인</h3>
          <span class="card-subtitle">{{ completedCount }}/{{ totalRequired }} 완료</span>
        </div>
        <div class="progress-ring">
          <svg viewBox="0 0 36 36">
            <path class="progress-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            <path class="progress-fill" :stroke-dasharray="`${progressPercent}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          </svg>
          <span class="progress-text">{{ progressPercent }}%</span>
        </div>
      </div>
      <div class="checklist-items">
        <div
          v-for="item in checklistItems"
          :key="item.key"
          class="checklist-item"
          :class="{ completed: item.completed, required: item.required }"
          @click="item.action && item.action()"
        >
          <div class="item-check">
            <svg v-if="item.completed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span v-else class="item-number">{{ item.step }}</span>
          </div>
          <div class="item-content">
            <span class="item-label">{{ item.label }}</span>
            <span class="item-value" :class="{ empty: !item.value }">
              {{ item.value || item.placeholder }}
            </span>
          </div>
          <div v-if="!item.completed && item.action" class="item-action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
          <span v-if="!item.required" class="optional-tag">선택</span>
        </div>
      </div>
    </div>

    <!-- 요약 정보 카드 -->
    <div class="summary-card">
      <div class="card-header">
        <div class="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </div>
        <h3 class="card-title">요거픽 요약</h3>
      </div>
      <div class="summary-grid">
        <div class="summary-row">
          <span class="summary-label">요거픽 제목</span>
          <span class="summary-value" :class="{ empty: !battleForm.title }">
            {{ battleForm.title || '미입력' }}
          </span>
        </div>
        <div class="summary-row">
          <span class="summary-label">카테고리</span>
          <span class="summary-value" :class="{ empty: !previewCategoryName }">
            {{ previewCategoryName || '미선택' }}
          </span>
        </div>
        <div class="summary-row">
          <span class="summary-label">요거픽 기간</span>
          <span class="summary-value" :class="{ empty: !battleForm.startDate }">
            <template v-if="battleForm.startDate && battleForm.endDate">
              {{ formatDate(battleForm.startDate) }} ~ {{ formatDate(battleForm.endDate) }}
              <span class="duration-tag">{{ dateDiff }}일</span>
            </template>
            <template v-else>미설정</template>
          </span>
        </div>
        <div class="summary-row">
          <span class="summary-label">등록 아이템</span>
          <span class="summary-value" :class="{ empty: selectedItemsCount === 0 }">
            {{ selectedItemsCount }}개
          </span>
        </div>
        <div class="summary-row">
          <span class="summary-label">투표 방식</span>
          <span class="summary-value">{{ previewVoteTypeName }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">아이템 추가 권한</span>
          <span class="summary-value">{{ previewPermissionTypeName }}</span>
        </div>
      </div>
    </div>

    <!-- 주의사항 -->
    <div class="notice-card">
      <div class="notice-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <div class="notice-content">
        <div class="notice-title">요거픽 생성 후 주의사항</div>
        <ul class="notice-list">
          <li>첫 투표가 등록된 이후에는 <strong>카테고리, 기간, 투표 방식</strong>을 수정할 수 없습니다.</li>
          <li>제목, 설명, 아이템은 투표가 시작된 후에도 수정할 수 있습니다.</li>
        </ul>
      </div>
    </div>

    <!-- 약관 동의 -->
    <div class="agreement-card" :class="{ checked: battleForm.agreeTerms }">
      <label class="agreement-label">
        <div class="checkbox-wrapper">
          <input
              :checked="battleForm.agreeTerms"
              @change="$emit('update:battleForm', { ...battleForm, agreeTerms: $event.target.checked })"
              type="checkbox"
              class="agreement-checkbox"
          >
          <div class="checkbox-custom">
            <svg v-if="battleForm.agreeTerms" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        <div class="agreement-content">
          <span class="agreement-text">요거픽 생성 규칙과 가이드라인을 확인했으며, 이에 동의합니다</span>
          <span class="agreement-hint">요거픽 생성 후 발생하는 모든 책임은 생성자에게 있습니다</span>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  battleForm: {
    type: Object,
    required: true
  },
  selectedItemsCount: {
    type: Number,
    default: 0
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
  dateDiff: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update:battleForm', 'go-to-step']);

// 체크리스트 아이템
const checklistItems = computed(() => [
  {
    key: 'title',
    step: 1,
    label: '요거픽 제목',
    value: props.battleForm.title,
    placeholder: '제목을 입력해주세요',
    completed: props.battleForm.title?.trim().length > 0,
    required: true,
    action: () => emit('go-to-step', 1)
  },
  {
    key: 'category',
    step: 1,
    label: '카테고리',
    value: props.previewCategoryName,
    placeholder: '카테고리를 선택해주세요',
    completed: !!props.battleForm.subCategoryId,
    required: true,
    action: () => emit('go-to-step', 1)
  },
  {
    key: 'period',
    step: 1,
    label: '요거픽 기간',
    value: props.battleForm.startDate && props.battleForm.endDate ? `${props.dateDiff}일간` : '',
    placeholder: '기간을 설정해주세요',
    completed: !!props.battleForm.startDate && !!props.battleForm.endDate,
    required: true,
    action: () => emit('go-to-step', 1)
  },
  {
    key: 'items',
    step: 2,
    label: '아이템 등록',
    value: props.selectedItemsCount > 0 ? `${props.selectedItemsCount}개 등록됨` : '',
    placeholder: '최소 1개 이상 등록해주세요',
    completed: props.selectedItemsCount >= 1,
    required: true,
    action: () => emit('go-to-step', 2)
  },
  {
    key: 'thumbnail',
    step: 1,
    label: '대표 이미지',
    value: props.battleForm.thumbnailFile ? '이미지 업로드됨' : '',
    placeholder: '이미지를 업로드해주세요',
    completed: !!props.battleForm.thumbnailFile || !!props.battleForm.thumbnailPreviewUrl,
    required: false,
    action: () => emit('go-to-step', 1)
  }
]);

// 필수 항목만 필터
const requiredItems = computed(() => checklistItems.value.filter(item => item.required));
const totalRequired = computed(() => requiredItems.value.length);
const completedCount = computed(() => requiredItems.value.filter(item => item.completed).length);
const incompleteCount = computed(() => totalRequired.value - completedCount.value);
const isAllCompleted = computed(() => completedCount.value === totalRequired.value);
const progressPercent = computed(() => Math.round((completedCount.value / totalRequired.value) * 100));

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  });
};
</script>

<style scoped>
.step-container {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 상태 헤더 */
.status-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-radius: 16px;
  transition: all 0.3s;
}

.status-header.ready {
  background: #f8fdfb;
  border: 1px solid #d1fae5;
}

.status-header.incomplete {
  background: #fffef8;
  border: 1px solid #fef3c7;
}

.status-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-header.ready .status-icon {
  background: #ecfdf5;
  color: #059669;
}

.status-header.incomplete .status-icon {
  background: #fefce8;
  color: #ca8a04;
}

.status-content {
  flex: 1;
}

.status-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.status-header.ready .status-title {
  color: #166534;
}

.status-header.incomplete .status-title {
  color: #a16207;
}

.status-desc {
  font-size: 14px;
  margin: 0;
}

.status-header.ready .status-desc {
  color: #15803d;
}

.status-header.incomplete .status-desc {
  color: #b45309;
}

/* 체크리스트 카드 */
.checklist-card,
.summary-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
}

.card-title-group {
  flex: 1;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.card-subtitle {
  font-size: 13px;
  color: #9ca3af;
}

/* 프로그레스 링 */
.progress-ring {
  width: 48px;
  height: 48px;
  position: relative;
}

.progress-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 3;
}

.progress-fill {
  fill: none;
  stroke: #16a34a;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s;
}

.progress-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #1a1a1a;
}

/* 체크리스트 아이템 */
.checklist-items {
  padding: 8px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.checklist-item:hover {
  background: #f9fafb;
}

.checklist-item.completed {
  background: #f8fdfb;
}

.checklist-item.completed:hover {
  background: #f0fdf8;
}

.item-check {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
}

.checklist-item:not(.completed) .item-check {
  background: #e5e7eb;
  color: #6b7280;
}

.checklist-item.completed .item-check {
  background: #dcfce7;
  color: #16a34a;
}

.item-number {
  font-variant-numeric: tabular-nums;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.item-value {
  display: block;
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-value.empty {
  color: #ca8a04;
}

.checklist-item.completed .item-value {
  color: #16a34a;
}

.item-action {
  color: #9ca3af;
  flex-shrink: 0;
}

.optional-tag {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 10px;
  font-weight: 500;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 요약 카드 */
.summary-card .card-header {
  padding: 16px 24px;
}

.summary-grid {
  padding: 8px 24px 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: 13px;
  color: #6b7280;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-value.empty {
  color: #d1d5db;
}

.duration-tag {
  font-size: 11px;
  font-weight: 600;
  color: #15803d;
  background: #f0fdf4;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 주의사항 */
.notice-card {
  display: flex;
  gap: 14px;
  padding: 20px;
  background: #fffefa;
  border: 1px solid #fef3c7;
  border-radius: 12px;
}

.notice-icon {
  width: 36px;
  height: 36px;
  background: #fefce8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ca8a04;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 14px;
  font-weight: 700;
  color: #d97706;
  margin-bottom: 8px;
}

.notice-list {
  margin: 0;
  padding-left: 18px;
}

.notice-list li {
  font-size: 13px;
  color: #b45309;
  line-height: 1.6;
  margin-bottom: 4px;
}

.notice-list li:last-child {
  margin-bottom: 0;
}

.notice-list strong {
  font-weight: 700;
}

/* 약관 동의 */
.agreement-card {
  padding: 20px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
}

.agreement-card.checked {
  background: #f0fdf4;
  border-color: #d1fae5;
}

.agreement-label {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  cursor: pointer;
}

.checkbox-wrapper {
  position: relative;
  flex-shrink: 0;
}

.agreement-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 24px;
  height: 24px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: white;
}

.agreement-card.checked .checkbox-custom {
  background: #d1fae5;
  border-color: #a7f3d0;
  color: #059669;
}

.agreement-content {
  flex: 1;
}

.agreement-text {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.5;
}

.agreement-hint {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

/* 반응형 */
@media (max-width: 640px) {
  .step-container {
    gap: 16px;
  }

  .status-header {
    padding: 20px;
    gap: 14px;
  }

  .status-icon {
    width: 48px;
    height: 48px;
  }

  .status-icon svg {
    width: 28px;
    height: 28px;
  }

  .status-title {
    font-size: 16px;
  }

  .status-desc {
    font-size: 13px;
  }

  .card-header {
    padding: 16px 20px;
  }

  .card-icon {
    width: 36px;
    height: 36px;
  }

  .card-title {
    font-size: 14px;
  }

  .progress-ring {
    width: 44px;
    height: 44px;
  }

  .checklist-items {
    padding: 6px;
  }

  .checklist-item {
    padding: 12px 14px;
    gap: 12px;
  }

  .item-check {
    width: 26px;
    height: 26px;
  }

  .item-label {
    font-size: 13px;
  }

  .item-value {
    font-size: 12px;
  }

  .summary-grid {
    padding: 8px 20px 16px;
  }

  .summary-row {
    padding: 10px 0;
    flex-wrap: wrap;
    gap: 4px;
  }

  .summary-label {
    font-size: 12px;
  }

  .summary-value {
    font-size: 13px;
  }

  .notice-card {
    padding: 16px;
    gap: 12px;
  }

  .notice-icon {
    width: 32px;
    height: 32px;
  }

  .notice-title {
    font-size: 13px;
  }

  .notice-list li {
    font-size: 12px;
  }

  .agreement-card {
    padding: 16px;
  }

  .checkbox-custom {
    width: 22px;
    height: 22px;
  }

  .agreement-text {
    font-size: 13px;
  }

  .agreement-hint {
    font-size: 11px;
  }
}
</style>
