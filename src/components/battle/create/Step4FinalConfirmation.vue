<template>
  <div class="form-section">
    <div style="text-align: center; padding: 40px 0;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
      <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">배틀 생성 준비 완료!</h2>
      <p style="color: #6B7280;">아래 내용을 최종 확인해주세요</p>
    </div>

    <div style="background: #F8F9FA; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">기본 정보</h3>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6B7280;">배틀 제목</span>
          <span style="font-weight: 500;">{{ battleForm.title }}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6B7280;">배틀 타입</span>
          <span style="font-weight: 500;">{{ previewTypeName }}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6B7280;">카테고리</span>
          <span style="font-weight: 500;">{{ previewCategoryName }}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6B7280;">기간</span>
          <span style="font-weight: 500;">
            {{ battleForm.startDate }} ~ {{ battleForm.endDate }} ({{ dateDiff }}일)
          </span>
        </div>
      </div>
    </div>

    <div style="background: #FEF3C7; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">⚠️</span>
        <div>
          <strong style="font-size: 14px;">생성 후 수정 제한</strong>
          <div style="font-size: 13px; color: #92400E; margin-top: 4px;">
            배틀이 시작되면 기본 정보는 수정할 수 없습니다
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top: 32px;">
      <label style="display: flex; align-items: start; gap: 8px; cursor: pointer;">
        <input
            :checked="battleForm.agreeTerms"
            @change="$emit('update:battleForm', { ...battleForm, agreeTerms: $event.target.checked })"
            type="checkbox"
            style="margin-top: 2px;"
        >
        <span style="font-size: 14px; color: #6B7280;">
          배틀 생성 규칙과 가이드라인을 모두 확인했으며, 이에 동의합니다
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
defineProps({
  battleForm: {
    type: Object,
    required: true
  },
  previewTypeName: {
    type: String,
    default: ''
  },
  previewCategoryName: {
    type: String,
    default: ''
  },
  dateDiff: {
    type: Number,
    default: 0
  }
});

defineEmits(['update:battleForm']);
</script>

<style scoped>
.form-section {
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #F0F0F3;
}
</style>