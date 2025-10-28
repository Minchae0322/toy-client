<template>
  <div class="form-section">
    <div class="form-group">
      <label class="form-label">투표 방식</label>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">
        <label style="padding: 16px; border: 2px solid #E5E7EB; border-radius: 8px; cursor: pointer;">
          <input
              :checked="battleForm.voteType === 'single'"
              @change="$emit('update:battleForm', { ...battleForm, voteType: 'single' })"
              type="radio"
              style="margin-right: 12px;"
          >
          <strong>1인 1표</strong>
          <div style="font-size: 13px; color: #6B7280; margin-top: 4px; margin-left: 24px;">
            각 유저가 하나의 제품에만 투표할 수 있습니다
          </div>
        </label>
        <label style="padding: 16px; border: 2px solid #E5E7EB; border-radius: 8px; cursor: pointer;">
          <input
              :checked="battleForm.voteType === 'multiple'"
              @change="$emit('update:battleForm', { ...battleForm, voteType: 'multiple' })"
              type="radio"
              style="margin-right: 12px;"
          >
          <strong>1인 3표</strong>
          <div style="font-size: 13px; color: #6B7280; margin-top: 4px; margin-left: 24px;">
            1위, 2위, 3위를 각각 선택 (1위 3점, 2위 2점, 3위 1점)
          </div>
        </label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">결과 공개 시점</label>
      <div style="display: flex; gap: 20px; margin-top: 12px;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input
              :checked="battleForm.resultPublic === 'realtime'"
              @change="$emit('update:battleForm', { ...battleForm, resultPublic: 'realtime' })"
              type="radio"
          >
          <span style="font-size: 14px;">실시간 공개</span>
        </label>
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input
              :checked="battleForm.resultPublic === 'afterEnd'"
              @change="$emit('update:battleForm', { ...battleForm, resultPublic: 'afterEnd' })"
              type="radio"
          >
          <span style="font-size: 14px;">종료 후 공개</span>
        </label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">추가 리워드 설정 (선택)</label>
      <div style="padding: 16px; background: #F8F9FA; border-radius: 8px;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input
              :checked="battleForm.hasAdditionalReward"
              @change="$emit('update:battleForm', { ...battleForm, hasAdditionalReward: $event.target.checked })"
              type="checkbox"
          >
          <span style="font-size: 14px;">추가 리워드 제공하기</span>
        </label>
        <input
            v-if="battleForm.hasAdditionalReward"
            :value="battleForm.additionalReward"
            @input="$emit('update:battleForm', { ...battleForm, additionalReward: $event.target.value })"
            type="text"
            class="form-input"
            placeholder="예: 1위에게 스타벅스 기프티콘 제공"
            style="margin-top: 12px;"
        >
        <div v-if="battleForm.hasAdditionalReward" class="form-hint" style="margin-top: 4px;">
          추가 리워드 설정 시 1,000 포인트가 차감됩니다
        </div>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">배틀 규칙 (선택)</label>
      <textarea
          :value="battleForm.rules"
          @input="$emit('update:battleForm', { ...battleForm, rules: $event.target.value })"
          class="form-input textarea"
          placeholder="특별한 규칙이나 주의사항을 입력하세요"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
defineProps({
  battleForm: {
    type: Object,
    required: true
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

.form-group {
  margin-bottom: 32px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.form-hint {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1A1A1A;
}

.textarea {
  min-height: 100px;
  resize: vertical;
}
</style>