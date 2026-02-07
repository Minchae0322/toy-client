<template>
  <div class="form-section">
    <!-- ⭐ 투표 타입 (백엔드 Enum: SINGLE, MULTIPLE) -->
    <div class="form-group">
      <label class="form-label">
        투표 방식 <span class="required">*</span>
      </label>
      <div class="vote-type-selector">
        <label
            v-for="type in voteTypes"
            :key="type.value"
            class="vote-type-option"
            :class="{ selected: battleForm.voteType === type.value }"
        >
          <input
              :checked="battleForm.voteType === type.value"
              @change="$emit('update:battleForm', { ...battleForm, voteType: type.value })"
              type="radio"
              :value="type.value"
              name="voteType"
              class="vote-radio"
          >
          <div class="vote-type-content">
            <div class="vote-type-icon" :class="type.iconType">
              <!-- Single Vote Icon -->
              <svg v-if="type.iconType === 'vote-single'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <text x="12" y="16" text-anchor="middle" fill="currentColor" stroke="none" font-size="12" font-weight="600">1</text>
              </svg>
              <!-- Multiple Vote Icon -->
              <svg v-else-if="type.iconType === 'vote-multiple'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <text x="12" y="16" text-anchor="middle" fill="currentColor" stroke="none" font-size="12" font-weight="600">3</text>
              </svg>
            </div>
            <div class="vote-type-info">
              <div class="vote-type-title">{{ type.title }}</div>
              <div class="vote-type-desc">{{ type.desc }}</div>
            </div>
          </div>
        </label>
      </div>
    </div>

    <!-- ⭐ 배틀 설명 (120~500자) -->
    <div class="form-group">
      <label class="form-label">배틀 설명 (선택)</label>
      <textarea
          v-model="localDescription"
          @blur="handleDescriptionBlur"
          class="form-input textarea"
          placeholder="배틀에 대한 설명이나 투표 기준을 알려주세요 (120~500자)"
          maxlength="500"
      ></textarea>
      <div class="char-counter" :class="{ 'text-warning': descriptionCharCount < 120 && descriptionCharCount > 0 }">
        {{ descriptionCharCount }} / 500
        <span v-if="descriptionCharCount > 0 && descriptionCharCount < 120" class="char-hint">
          (최소 120자)
        </span>
      </div>
      <div class="form-hint">배틀 설명은 선택사항이지만, 작성하려면 최소 120자 이상이어야 합니다</div>
    </div>

    <!-- 안내 박스 -->
    <div class="info-box">
      <div class="info-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <div class="info-content">
        <div class="info-title">투표 방식에 따른 점수 계산</div>
        <div class="info-desc">
          <strong>1인 1표:</strong> 각 투표는 1점으로 계산됩니다<br>
          <strong>1인 3표 (순위):</strong> 1위 3점, 2위 2점, 3위 1점으로 가중치가 적용됩니다
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  battleForm: {
    type: Object,
    required: true
  },
  voteTypes: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:battleForm']);

// 설명은 로컬 상태로 관리 (미리보기 깜빡임 방지)
const localDescription = ref(props.battleForm.description || '');

// battleForm.description이 외부에서 변경되면 로컬 상태도 업데이트
watch(() => props.battleForm.description, (newVal) => {
  if (newVal !== localDescription.value) {
    localDescription.value = newVal || '';
  }
});

// blur 시에만 부모에게 업데이트
const handleDescriptionBlur = () => {
  emit('update:battleForm', { ...props.battleForm, description: localDescription.value });
};

// 설명 글자 수 (로컬 상태 기준)
const descriptionCharCount = computed(() => {
  return localDescription.value?.length || 0;
});
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

.required {
  color: #DC2626;
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
  min-height: 150px;
  resize: vertical;
  line-height: 1.6;
}

.char-counter {
  text-align: right;
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.char-counter.text-warning {
  color: #F59E0B;
}

.char-hint {
  font-weight: 600;
}

/* 투표 타입 선택 */
.vote-type-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.vote-type-option {
  position: relative;
  padding: 20px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: block;
}

.vote-type-option:hover {
  border-color: #9CA3AF;
  background: #FAFBFC;
}

.vote-type-option.selected {
  background: #FAFBFC;
}

/* 선택 상태 테두리 - 각 타입별 색상 */
.vote-type-option.selected:has(.vote-type-icon.vote-single) {
  border-color: #4F46E5;
}

.vote-type-option.selected:has(.vote-type-icon.vote-multiple) {
  border-color: #D97706;
}

.vote-radio {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.vote-type-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.vote-type-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

/* 투표 아이콘별 색상 */
.vote-type-icon.vote-single {
  background: #EEF2FF;
  color: #6366F1;
}

.vote-type-icon.vote-multiple {
  background: #FEF3C7;
  color: #F59E0B;
}

/* 선택 상태 - 각 아이콘별 진한 색상 */
.vote-type-option.selected .vote-type-icon.vote-single {
  background: #4F46E5;
  transform: scale(1.05);
  color: #fff;
}

.vote-type-option.selected .vote-type-icon.vote-multiple {
  background: #D97706;
  transform: scale(1.05);
  color: #fff;
}

.vote-type-info {
  flex: 1;
}

.vote-type-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4px;
}

.vote-type-desc {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.4;
}

/* 안내 박스 */
.info-box {
  padding: 20px;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 12px;
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.info-icon {
  flex-shrink: 0;
  color: #1E40AF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-content {
  flex: 1;
}

.info-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E40AF;
  margin-bottom: 6px;
}

.info-desc {
  font-size: 13px;
  color: #1E3A8A;
  line-height: 1.6;
}

.info-desc strong {
  font-weight: 600;
  color: #1E40AF;
}

@media (max-width: 768px) {
  .form-section {
    padding: 24px 20px;
  }

  .form-group {
    margin-bottom: 24px;
  }

  .vote-type-option {
    padding: 16px;
  }

  .vote-type-content {
    gap: 12px;
  }

  .vote-type-icon {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }

  .vote-type-title {
    font-size: 15px;
  }

  .vote-type-desc {
    font-size: 12px;
  }

  .textarea {
    min-height: 120px;
    font-size: 16px; /* iOS 줌 방지 */
  }

  .info-box {
    flex-direction: column;
    gap: 8px;
    padding: 16px;
  }

  .info-icon svg {
    width: 20px;
    height: 20px;
  }

  .info-title {
    font-size: 13px;
  }

  .info-desc {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .form-section {
    padding: 20px 16px;
  }

  .vote-type-option {
    padding: 14px;
  }

  .vote-type-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .vote-type-title {
    font-size: 14px;
  }

  .vote-type-desc {
    font-size: 11px;
  }
}
</style>