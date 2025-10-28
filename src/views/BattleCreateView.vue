<template>
  <div class="app-container">
    <!-- 사이드바 -->
    <BattleCreateSidebar />

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <!-- 헤더 -->
      <BattleCreateHeader
          @back="handleBack"
          @save-draft="saveDraft"
      />

      <!-- 스텝 인디케이터 -->
      <BattleCreateStepIndicator
          :steps="steps"
          :current-step="currentStep"
      />

      <!-- 컨텐츠 영역 -->
      <div class="content-area">
        <div class="create-container">
          <!-- Step 1: 기본 정보 -->
          <Step1BasicInfo
              v-show="currentStep === 1"
              :battle-form="battleForm"
              :battle-types="battleTypes"
              :categories="categories"
              @update:battle-form="battleForm = $event"
          />

          <!-- Step 2: 아이템 설정 -->
          <Step2ItemSetup
              v-show="currentStep === 2"
              :battle-form="battleForm"
              :selected-items="selectedItems"
              @update:battle-form="battleForm = $event"
              @update:selected-items="selectedItems = $event"
          />

          <!-- Step 3: 상세 설정 -->
          <Step3DetailSettings
              v-show="currentStep === 3"
              :battle-form="battleForm"
              @update:battle-form="battleForm = $event"
          />

          <!-- Step 4: 최종 확인 -->
          <Step4FinalConfirmation
              v-show="currentStep === 4"
              :battle-form="battleForm"
              :preview-type-name="previewTypeName"
              :preview-category-name="previewCategoryName"
              :date-diff="dateDiff"
              @update:battle-form="battleForm = $event"
          />

          <!-- 우측 미리보기 -->
          <BattleCreatePreview
              :battle-form="battleForm"
              :selected-items="selectedItems"
              :preview-emoji="previewEmoji"
              :preview-type-name="previewTypeName"
              :preview-category-name="previewCategoryName"
              :date-diff-text="dateDiffText"
          />
        </div>
      </div>

      <!-- 하단 액션 버튼 -->
      <BattleCreateFooter
          :steps="steps"
          :current-step="currentStep"
          :can-proceed="canProceed"
          @previous="handlePrevious"
          @next="handleNext"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BattleCreateSidebar from '@/components/battle/create/BattleCreateSidebar.vue';
import BattleCreateHeader from '@/components/battle/create/BattleCreateHeader.vue';
import BattleCreateStepIndicator from '@/components/battle/create/BattleCreateStepIndicator.vue';
import BattleCreatePreview from '@/components/battle/create/BattleCreatePreview.vue';
import Step1BasicInfo from '@/components/battle/create/Step1BasicInfo.vue';
import Step2ItemSetup from '@/components/battle/create/Step2ItemSetup.vue';
import Step3DetailSettings from '@/components/battle/create/Step3DetailSettings.vue';
import Step4FinalConfirmation from '@/components/battle/create/Step4FinalConfirmation.vue';
import BattleCreateFooter from '@/components/battle/create/BattleCreateFooter.vue';

// 스텝 정의
const steps = ['기본 정보', '아이템 설정', '상세 설정', '최종 확인'];
const currentStep = ref(1);

// 배틀 타입 옵션
const battleTypes = [
  {
    value: 'open',
    icon: '🌐',
    title: '오픈 배틀',
    desc: '누구나 자유롭게 제품을 등록할 수 있어요'
  },
  {
    value: 'curation',
    icon: '✨',
    title: '큐레이션 배틀',
    desc: '내가 직접 선정한 제품들만 투표 대상이 돼요'
  }
];

// 카테고리 옵션
const categories = [
  { value: 'sneakers', emoji: '👟', name: '스니커즈' },
  { value: 'tech', emoji: '💻', name: '테크' },
  { value: 'beauty', emoji: '💄', name: '뷰티' },
  { value: 'fnb', emoji: '☕', name: 'F&B' },
  { value: 'fashion', emoji: '👕', name: '패션' },
  { value: 'living', emoji: '🛋️', name: '리빙' },
  { value: 'game', emoji: '🎮', name: '게임' },
  { value: 'etc', emoji: '📚', name: '기타' }
];

// 배틀 폼 데이터
const battleForm = ref({
  title: '',
  type: 'open',
  category: 'sneakers',
  startDate: '2025-02-01',
  endDate: '2025-02-28',
  description: '',
  minLevel: '',
  maxProducts: '',
  allowDuplicate: false,
  voteType: 'single',
  resultPublic: 'realtime',
  hasAdditionalReward: false,
  additionalReward: '',
  rules: '',
  agreeTerms: false
});

// 선택된 아이템
const selectedItems = ref([
  { id: 1, name: '나이키 덩크 로우', brand: 'Nike', emoji: '👟', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 2, name: '조던 4 레트로', brand: 'Jordan', emoji: '👟', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 3, name: '아디다스 예지', brand: 'Adidas', emoji: '👟', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
]);

// Computed
const previewTypeName = computed(() => {
  const type = battleTypes.find(t => t.value === battleForm.value.type);
  return type ? type.title : '';
});

const previewCategoryName = computed(() => {
  const category = categories.find(c => c.value === battleForm.value.category);
  return category ? category.name : '';
});

const previewEmoji = computed(() => {
  const category = categories.find(c => c.value === battleForm.value.category);
  return category ? category.emoji : '📦';
});

const dateDiff = computed(() => {
  if (!battleForm.value.startDate || !battleForm.value.endDate) return 0;
  const start = new Date(battleForm.value.startDate);
  const end = new Date(battleForm.value.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

const dateDiffText = computed(() => {
  return `${dateDiff.value}일간 진행`;
});

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return battleForm.value.title.length > 0 &&
          battleForm.value.category &&
          battleForm.value.startDate &&
          battleForm.value.endDate;
    case 2:
      if (battleForm.value.type === 'curation') {
        return selectedItems.value.length >= 2;
      }
      return true;
    case 3:
      return true;
    case 4:
      return battleForm.value.agreeTerms;
    default:
      return false;
  }
});

// Methods
const handleNext = () => {
  if (currentStep.value < 4) {
    currentStep.value++;
  } else {
    createBattle();
  }
};

const handlePrevious = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  } else {
    if (confirm('배틀 생성을 취소하시겠습니까?')) {
      handleBack();
    }
  }
};

const handleBack = () => {
  // 라우터 연동 시 사용
  console.log('뒤로 가기');
};

const saveDraft = () => {
  console.log('임시저장', battleForm.value);
  alert('임시저장되었습니다');
};

const createBattle = () => {
  console.log('배틀 생성', battleForm.value);
  alert('배틀이 생성되었습니다!');
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: #FAFBFC;
  color: #1A1A1A;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  background: #FAFBFC;
}

.content-area {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
}

.create-container {
  display: flex;
  gap: 32px;
}
</style>