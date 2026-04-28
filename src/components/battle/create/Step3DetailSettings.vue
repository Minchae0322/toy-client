<template>
  <div class="step-container">
    <!-- 상단 안내 -->
    <div class="step-intro">
      <div class="intro-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </div>
      <div class="intro-content">
        <h2 class="intro-title">상세 설정</h2>
        <p class="intro-desc">투표 방식과 요거픽에 대한 설명을 설정하세요.</p>
      </div>
    </div>

    <!-- 투표 방식 선택 -->
    <div class="form-card">
      <div class="card-header">
        <div class="card-number">1</div>
        <div class="card-title-group">
          <label class="card-title">투표 방식</label>
          <span class="card-subtitle">참여자들이 어떻게 투표할지 선택하세요</span>
        </div>
      </div>
      <div class="card-body">
        <div class="vote-options">
          <button
            v-for="type in voteTypes"
            :key="type.value"
            type="button"
            class="vote-option"
            :class="{ selected: battleForm.voteType === type.value, [type.iconType]: true }"
            @click="$emit('update:battleForm', { ...battleForm, voteType: type.value })"
          >
            <div class="option-radio">
              <div class="radio-dot"></div>
            </div>
            <div class="option-visual" :class="type.iconType">
              <div class="visual-icon">
                <!-- 1인 1표: 체크 아이콘 -->
                <svg v-if="type.iconType === 'vote-single'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="9 12 11.5 14.5 16 9.5"></polyline>
                </svg>
                <!-- 순위 투표: 시상대 아이콘 -->
                <svg v-else-if="type.iconType === 'vote-multiple'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <!-- 1등 (가운데, 높음) -->
                  <rect x="8" y="6" width="8" height="14" rx="1"></rect>
                  <text x="12" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-size="8" font-weight="700">1</text>
                  <!-- 2등 (왼쪽, 중간) -->
                  <rect x="1" y="10" width="6" height="10" rx="1"></rect>
                  <text x="4" y="16" text-anchor="middle" fill="currentColor" stroke="none" font-size="6" font-weight="700">2</text>
                  <!-- 3등 (오른쪽, 낮음) -->
                  <rect x="17" y="13" width="6" height="7" rx="1"></rect>
                  <text x="20" y="18" text-anchor="middle" fill="currentColor" stroke="none" font-size="6" font-weight="700">3</text>
                </svg>
              </div>
              <div class="visual-badge">
                {{ type.iconType === 'vote-single' ? '1표' : '1~3위' }}
              </div>
            </div>
            <div class="option-content">
              <span class="option-title">{{ type.title }}</span>
              <span class="option-desc">{{ type.desc }}</span>
            </div>
          </button>
        </div>

        <!-- 점수 계산 설명 -->
        <div class="score-info" :class="battleForm.voteType === 'MULTIPLE' ? 'multiple' : 'single'">
          <div class="score-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>점수 계산 방식</span>
          </div>
          <div class="score-content">
            <template v-if="battleForm.voteType === 'SINGLE'">
              <div class="score-item">
                <span class="score-badge">1표</span>
                <span class="score-text">= 1점</span>
              </div>
            </template>
            <template v-else>
              <div class="score-item">
                <span class="score-badge first">1위</span>
                <span class="score-text">= 3점</span>
              </div>
              <div class="score-item">
                <span class="score-badge second">2위</span>
                <span class="score-text">= 2점</span>
              </div>
              <div class="score-item">
                <span class="score-badge third">3위</span>
                <span class="score-text">= 1점</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 요거픽 설명 -->
    <div class="form-card optional">
      <div class="card-header">
        <div class="card-number optional">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="17" y1="10" x2="3" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="17" y1="18" x2="3" y2="18"></line>
          </svg>
        </div>
        <div class="card-title-group">
          <label class="card-title">
            요거픽 설명
            <span class="optional-badge">선택</span>
          </label>
          <span class="card-subtitle">요거픽에 대한 설명이나 투표 기준을 알려주세요</span>
        </div>
      </div>
      <div class="card-body">
        <div class="textarea-wrapper" :class="{ focused: isTextareaFocused, filled: localDescription.length > 0 }">
          <textarea
            :value="localDescription"
            @input="onDescriptionInput"
            @compositionend="onDescriptionInput"
            @focus="isTextareaFocused = true"
            @blur="handleDescriptionBlur"
            class="description-textarea"
            placeholder="예: 이 요거픽은 2024년에 출시된 무선 이어폰 중 가성비가 좋은 제품을 선정하기 위한 투표입니다. 가격 대비 음질, 착용감, 배터리 등을 종합적으로 고려해주세요."
            maxlength="200"
          ></textarea>
          <div class="textarea-footer">
            <div class="char-status" :class="charStatusClass">
              <svg v-if="descriptionCharCount === 0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <svg v-else-if="descriptionCharCount >= 120" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ charStatusText }}</span>
            </div>
            <div class="char-count">{{ descriptionCharCount }} / 200</div>
          </div>
        </div>
        <p class="field-hint">
          설명을 작성하면 참여자들이 투표 기준을 더 쉽게 이해할 수 있습니다
        </p>
      </div>
    </div>

    <!-- 완료 안내 -->
    <div class="completion-hint" v-if="battleForm.voteType">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>투표 방식이 선택되었습니다. 다음 단계로 진행하세요.</span>
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

const isTextareaFocused = ref(false);
const localDescription = ref(props.battleForm.description || '');

watch(() => props.battleForm.description, (newVal) => {
  if (newVal !== localDescription.value) {
    localDescription.value = newVal || '';
  }
});

const DESCRIPTION_MAX = 200;
const onDescriptionInput = (e) => {
  const raw = e.target.value;
  const chars = Array.from(raw);
  let next = raw;
  if (chars.length > DESCRIPTION_MAX) {
    next = chars.slice(0, DESCRIPTION_MAX).join('');
    e.target.value = next;
  }
  localDescription.value = next;
};

const handleDescriptionBlur = () => {
  isTextareaFocused.value = false;
  emit('update:battleForm', { ...props.battleForm, description: localDescription.value });
};

const descriptionCharCount = computed(() => {
  return localDescription.value?.length || 0;
});

const charStatusClass = computed(() => {
  if (descriptionCharCount.value === 0) return 'empty';
  if (descriptionCharCount.value < 120) return 'warning';
  return 'valid';
});

const charStatusText = computed(() => {
  if (descriptionCharCount.value === 0) return '작성 시 최소 120자 이상';
  if (descriptionCharCount.value < 120) return `${120 - descriptionCharCount.value}자 더 필요`;
  return '조건 충족';
});
</script>

<style scoped>
.step-container {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 상단 안내 */
.step-intro {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
}

.intro-icon {
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
}

.intro-content {
  flex: 1;
}

.intro-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px 0;
}

.intro-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* 폼 카드 */
.form-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.2s;
}

.form-card:hover {
  border-color: #d1d5db;
}

.form-card.optional {
  border-style: dashed;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 24px 0;
}

.card-number {
  width: 28px;
  height: 28px;
  background: #374151;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.card-number.optional {
  background: #e5e7eb;
  color: #6b7280;
}

.card-title-group {
  flex: 1;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.card-subtitle {
  font-size: 13px;
  color: #9ca3af;
}

.optional-badge {
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-body {
  padding: 16px 24px 24px;
}

/* 투표 방식 옵션 */
.vote-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vote-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.vote-option:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.vote-option.selected.vote-single {
  border-color: #a5b4fc;
  background: #f5f7ff;
}

.vote-option.selected.vote-multiple {
  border-color: #fcd34d;
  background: #fffef5;
}

.option-radio {
  width: 22px;
  height: 22px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.vote-option.selected.vote-single .option-radio {
  border-color: #818cf8;
}

.vote-option.selected.vote-multiple .option-radio {
  border-color: #fbbf24;
}

.radio-dot {
  width: 10px;
  height: 10px;
  background: transparent;
  border-radius: 50%;
  transition: all 0.2s;
}

.vote-option.selected.vote-single .radio-dot {
  background: #818cf8;
}

.vote-option.selected.vote-multiple .radio-dot {
  background: #fbbf24;
}

.option-visual {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0;
  transition: all 0.2s;
}

.option-visual.vote-single {
  background: #f5f7ff;
  color: #818cf8;
}

.option-visual.vote-multiple {
  background: #fefce8;
  color: #eab308;
}

.vote-option.selected .option-visual.vote-single {
  background: #e0e7ff;
  color: #6366f1;
}

.vote-option.selected .option-visual.vote-multiple {
  background: #fef3c7;
  color: #d97706;
}

.visual-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.visual-badge {
  font-size: 10px;
  font-weight: 700;
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

.option-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

/* 점수 계산 안내 */
.score-info {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 10px;
  transition: all 0.3s;
}

.score-info.single {
  background: #fafafe;
  border: 1px solid #e5e7eb;
}

.score-info.multiple {
  background: #fefefa;
  border: 1px solid #e5e7eb;
}

.score-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
}

.score-info.single .score-header {
  color: #6b7280;
}

.score-info.multiple .score-header {
  color: #6b7280;
}

.score-content {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.score-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.score-info.single .score-badge {
  background: #e0e7ff;
  color: #6366f1;
}

.score-badge.first {
  background: #fef3c7;
  color: #b45309;
}

.score-badge.second {
  background: #f3f4f6;
  color: #6b7280;
}

.score-badge.third {
  background: #ffedd5;
  color: #c2410c;
}

.score-text {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

/* 텍스트 에어리어 */
.textarea-wrapper {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  background: white;
}

.textarea-wrapper.focused {
  border-color: #9ca3af;
  box-shadow: 0 0 0 3px rgba(156, 163, 175, 0.1);
}

.textarea-wrapper.filled:not(.focused) {
  border-color: #d1fae5;
  background: #f9fdfb;
}

.description-textarea {
  width: 100%;
  min-height: 140px;
  padding: 16px;
  border: none;
  font-size: 15px;
  line-height: 1.6;
  resize: vertical;
  background: transparent;
}

.description-textarea:focus {
  outline: none;
}

.description-textarea::placeholder {
  color: #9ca3af;
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
}

.char-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.char-status.empty {
  color: #9ca3af;
}

.char-status.warning {
  color: #ca8a04;
}

.char-status.valid {
  color: #16a34a;
}

.char-count {
  font-size: 12px;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 13px;
  color: #9ca3af;
}

/* 완료 안내 */
.completion-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: #f0fdf4;
  border: 1px solid #d1fae5;
  border-radius: 12px;
  color: #16a34a;
  font-size: 14px;
  font-weight: 500;
}

/* 반응형 */
@media (max-width: 640px) {
  .step-container {
    gap: 16px;
  }

  .step-intro {
    padding: 16px 20px;
    gap: 14px;
  }

  .intro-icon {
    width: 44px;
    height: 44px;
  }

  .intro-title {
    font-size: 16px;
  }

  .intro-desc {
    font-size: 13px;
  }

  .card-header {
    padding: 16px 20px 0;
    gap: 12px;
  }

  .card-number {
    width: 26px;
    height: 26px;
    font-size: 12px;
  }

  .card-title {
    font-size: 14px;
  }

  .card-subtitle {
    font-size: 12px;
  }

  .card-body {
    padding: 14px 20px 20px;
  }

  .vote-option {
    padding: 16px;
    gap: 12px;
  }

  .option-visual {
    width: 52px;
    height: 52px;
  }

  .option-visual svg {
    width: 24px;
    height: 24px;
  }

  .option-title {
    font-size: 14px;
  }

  .option-desc {
    font-size: 12px;
  }

  .score-content {
    gap: 12px;
  }

  .description-textarea {
    min-height: 120px;
    font-size: 16px; /* iOS 줌 방지 */
    padding: 14px;
  }

  .textarea-footer {
    padding: 8px 14px;
  }

  .completion-hint {
    padding: 14px 16px;
    font-size: 13px;
  }
}
</style>
