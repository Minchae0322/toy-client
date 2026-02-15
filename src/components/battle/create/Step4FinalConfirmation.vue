<template>
  <div class="form-section">
    <div class="confirmation-header">
      <div class="header-icon">🎉</div>
      <h2 class="header-title">배틀 생성 준비 완료!</h2>
      <p class="header-desc">아래 내용을 최종 확인해주세요</p>
    </div>

    <!-- 기본 정보 요약 -->
    <div class="summary-section">
      <h3 class="summary-title">📋 기본 정보</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">배틀 제목</span>
          <span class="summary-value">{{ battleForm.title }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">아이템 추가 권한</span>
          <span class="summary-value">{{ previewPermissionTypeName }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">카테고리</span>
          <span class="summary-value">{{ previewCategoryName }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">투표 방식</span>
          <span class="summary-value">{{ previewVoteTypeName }}</span>
        </div>
      </div>
    </div>

    <!-- 기간 정보 -->
    <div class="summary-section">
      <h3 class="summary-title">📅 기간 정보</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">배틀 기간</span>
          <span class="summary-value">
            {{ formatDate(battleForm.startDate) }} ~ {{ formatDate(battleForm.endDate) }}
            <span class="summary-badge">{{ dateDiff }}일간</span>
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">참여 시작일</span>
          <span class="summary-value">{{ formatDate(battleForm.participationStartDate) }}</span>
        </div>
      </div>
    </div>

    <!-- 아이템 정보 -->
    <div class="summary-section">
      <h3 class="summary-title">🎯 아이템 정보</h3>
      <div class="summary-item">
        <span class="summary-label">등록된 아이템 수</span>
        <span class="summary-value">
          {{ selectedItemsCount }}개
          <span v-if="selectedItemsCount >= 1" class="summary-badge success">✓ 충족</span>
          <span v-else class="summary-badge error">✗ 부족 (최소 1개)</span>
        </span>
      </div>
    </div>

    <!-- 설명 정보 -->
    <div v-if="battleForm.description" class="summary-section">
      <h3 class="summary-title">📝 배틀 설명</h3>
      <div class="description-box">
        {{ battleForm.description }}
      </div>
    </div>

    <!-- 경고 박스 -->
    <div class="warning-box">
      <div class="warning-icon">⚠️</div>
      <div class="warning-content">
        <div class="warning-title">생성 후 수정 제한</div>
        <div class="warning-desc">
          배틀이 시작되면 <strong>제목, 카테고리, 기간, 투표 방식</strong>은 수정할 수 없습니다.<br>
          배틀 설명과 아이템은 배틀 진행 중에도 수정 가능합니다.
        </div>
      </div>
    </div>

    <!-- 체크리스트 -->
    <div class="checklist-box">
      <div class="checklist-title">✅ 최종 확인 체크리스트</div>
      <div class="checklist-items">
        <div class="checklist-item" :class="{ checked: battleForm.title.length > 0 }">
          <span class="checklist-icon">{{ battleForm.title.length > 0 ? '✓' : '○' }}</span>
          <span>배틀 제목을 입력했습니다</span>
        </div>
        <div class="checklist-item" :class="{ checked: battleForm.subCategoryId }">
          <span class="checklist-icon">{{ battleForm.subCategoryId ? '✓' : '○' }}</span>
          <span>카테고리를 선택했습니다</span>
        </div>
        <div class="checklist-item" :class="{ checked: selectedItemsCount >= 1 }">
          <span class="checklist-icon">{{ selectedItemsCount >= 1 ? '✓' : '○' }}</span>
          <span>아이템을 1개 이상 등록했습니다</span>
        </div>
        <div class="checklist-item" :class="{ checked: battleForm.thumbnailFile }">
          <span class="checklist-icon">{{ battleForm.thumbnailFile ? '✓' : '○' }}</span>
          <span>대표 이미지를 업로드했습니다 (선택)</span>
        </div>
        <div class="checklist-item" :class="{ checked: dateDiff >= 7 && dateDiff <= 31 }">
          <span class="checklist-icon">{{ dateDiff >= 7 && dateDiff <= 31 ? '✓' : '○' }}</span>
          <span>배틀 기간이 7~31일 사이입니다</span>
        </div>
      </div>
    </div>

    <!-- 약관 동의 -->
    <div class="agreement-box">
      <label class="agreement-label">
        <input
            :checked="battleForm.agreeTerms"
            @change="$emit('update:battleForm', { ...battleForm, agreeTerms: $event.target.checked })"
            type="checkbox"
            class="agreement-checkbox"
        >
        <span class="agreement-text">
          배틀 생성 규칙과 가이드라인을 모두 확인했으며, 이에 동의합니다
        </span>
      </label>
      <div class="agreement-hint">
        배틀 생성 후 발생하는 모든 책임은 생성자에게 있습니다
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  battleForm: {
    type: Object,
    required: true
  },
  selectedItemsCount: {  // ⭐ 새로 추가
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

defineEmits(['update:battleForm']);

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
.form-section {
  flex: 1;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #F0F0F3;
  box-sizing: border-box;
}

/* 헤더 */
.confirmation-header {
  text-align: center;
  padding: 20px 0 32px;
  border-bottom: 1px solid #F0F0F3;
  margin-bottom: 32px;
}

.header-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.header-desc {
  font-size: 14px;
  color: #6B7280;
}

/* 요약 섹션 */
.summary-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #F8F9FA;
  border-radius: 12px;
}

.summary-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16px;
}

.summary-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #E5E7EB;
}

.summary-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.summary-label {
  font-size: 13px;
  color: #6B7280;
  font-weight: 500;
}

.summary-value {
  font-size: 14px;
  color: #1A1A1A;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-badge {
  padding: 2px 8px;
  background: #E5E7EB;
  color: #6B7280;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.summary-badge.success {
  background: #D1FAE5;
  color: #059669;
}

.summary-badge.error {
  background: #FEE2E2;
  color: #DC2626;
}

/* 설명 박스 */
.description-box {
  padding: 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  color: #1A1A1A;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 경고 박스 */
.warning-box {
  padding: 20px;
  background: #FEF3C7;
  border: 2px solid #FCD34D;
  border-radius: 12px;
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.warning-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-size: 15px;
  font-weight: 600;
  color: #92400E;
  margin-bottom: 6px;
}

.warning-desc {
  font-size: 13px;
  color: #92400E;
  line-height: 1.6;
}

.warning-desc strong {
  font-weight: 700;
}

/* 체크리스트 */
.checklist-box {
  padding: 20px;
  background: #F8F9FA;
  border-radius: 12px;
  margin-bottom: 24px;
}

.checklist-title {
  font-size: 15px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16px;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #6B7280;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.checklist-item.checked {
  color: #059669;
  background: #D1FAE5;
}

.checklist-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

/* 약관 동의 */
.agreement-box {
  padding: 20px;
  background: #F8F9FA;
  border-radius: 12px;
}

.agreement-label {
  display: flex;
  align-items: start;
  gap: 10px;
  cursor: pointer;
}

.agreement-checkbox {
  margin-top: 2px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.agreement-text {
  font-size: 14px;
  color: #1A1A1A;
  font-weight: 500;
  line-height: 1.5;
}

.agreement-hint {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 8px;
  margin-left: 28px;
}

@media (max-width: 768px) {
  .form-section {
    padding: 24px 20px;
  }

  .confirmation-header {
    padding: 16px 0 24px;
    margin-bottom: 24px;
  }

  .header-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .header-title {
    font-size: 20px;
  }

  .header-desc {
    font-size: 13px;
  }

  .summary-section {
    padding: 16px;
    margin-bottom: 20px;
  }

  .summary-title {
    font-size: 15px;
    margin-bottom: 12px;
  }

  .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 10px 0;
  }

  .summary-label {
    font-size: 12px;
  }

  .summary-value {
    font-size: 13px;
    flex-wrap: wrap;
  }

  .warning-box {
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .warning-icon {
    font-size: 20px;
  }

  .warning-title {
    font-size: 14px;
  }

  .warning-desc {
    font-size: 12px;
  }

  .checklist-box {
    padding: 16px;
    margin-bottom: 20px;
  }

  .checklist-title {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .checklist-item {
    font-size: 13px;
    padding: 10px 8px;
  }

  .agreement-box {
    padding: 16px;
  }

  .agreement-checkbox {
    width: 20px;
    height: 20px;
    margin-top: 0;
  }

  .agreement-text {
    font-size: 13px;
  }

  .agreement-hint {
    font-size: 11px;
    margin-left: 30px;
  }
}

@media (max-width: 480px) {
  .form-section {
    padding: 20px 16px;
  }

  .header-icon {
    font-size: 40px;
  }

  .header-title {
    font-size: 18px;
  }

  .summary-section {
    padding: 14px;
  }

  .summary-title {
    font-size: 14px;
  }

  .summary-value {
    font-size: 12px;
  }

  .summary-badge {
    font-size: 10px;
    padding: 2px 6px;
  }

  .checklist-item {
    font-size: 12px;
    padding: 8px 6px;
  }

  .checklist-icon {
    width: 18px;
    height: 18px;
    font-size: 12px;
  }
}
</style>