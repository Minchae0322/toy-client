<template>
  <div class="app-container">
    <main class="main-content">
      <!-- 통합 헤더 (헤더 + 스텝) -->
      <BattleCreateHeader
          :steps="steps"
          :current-step="currentStep"
          @back="handleBack"
          @save-draft="saveDraft"
      />

      <!-- 컨텐츠 영역 -->
      <div class="content-area">
        <div class="create-container">
          <!-- Step 1: 기본 정보 -->
          <Step1BasicInfo
              v-show="currentStep === 1"
              :battle-form="battleForm"
              :item-add-permission-types="itemAddPermissionTypes"
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
              :vote-types="voteTypes"
              @update:battle-form="battleForm = $event"
          />

          <!-- Step 4: 최종 확인 -->
          <Step4FinalConfirmation
              v-show="currentStep === 4"
              :battle-form="battleForm"
              :preview-permission-type-name="previewPermissionTypeName"
              :preview-category-name="previewCategoryName"
              :preview-vote-type-name="previewVoteTypeName"
              :date-diff="dateDiff"
              @update:battle-form="battleForm = $event"
          />

          <!-- 우측 미리보기 -->
          <BattleCreatePreview
              :battle-form="battleForm"
              :selected-items="selectedItems"
              :preview-emoji="previewEmoji"
              :preview-permission-type-name="previewPermissionTypeName"
              :preview-category-name="previewCategoryName"
              :preview-vote-type-name="previewVoteTypeName"
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBattle } from '@/services/BattleService';
import { useCategory } from '@/services/CategoryService';
import BattleCreateHeader from '@/components/battle/create/BattleCreateHeader.vue';
import BattleCreatePreview from '@/components/battle/create/BattleCreatePreview.vue';
import Step1BasicInfo from '@/components/battle/create/Step1BasicInfo.vue';
import Step2ItemSetup from '@/components/battle/create/Step2ItemSetup.vue';
import Step3DetailSettings from '@/components/battle/create/Step3DetailSettings.vue';
import Step4FinalConfirmation from '@/components/battle/create/Step4FinalConfirmation.vue';
import BattleCreateFooter from '@/components/battle/create/BattleCreateFooter.vue';

const router = useRouter();
const battleService = useBattle();
const categoryService = useCategory();

// ==================== 스텝 설정 ====================
const steps = ['기본 정보', '아이템 설정', '상세 설정', '최종 확인'];
const currentStep = ref(1);

// ==================== 아이템 추가 권한 타입 (백엔드 Enum) ====================
const itemAddPermissionTypes = [
  {
    value: 'CREATOR_ONLY',
    icon: '🔒',
    title: '생성자만 추가 가능',
    desc: '배틀 생성자만 아이템을 추가할 수 있어요'
  },
  {
    value: 'PUBLIC_FREE',
    icon: '🌐',
    title: '누구나 추가 가능',
    desc: '모든 사용자가 자유롭게 아이템을 추가할 수 있어요'
  },
  {
    value: 'PUBLIC_APPROVAL',
    icon: '✅',
    title: '승인 후 추가 가능',
    desc: '아이템 등록 후 생성자의 승인을 받아야 해요'
  }
];

// ==================== 투표 타입 (백엔드 Enum) ====================
const voteTypes = [
  {
    value: 'SINGLE',
    icon: '1️⃣',
    title: '1인 1표',
    desc: '한 명당 하나의 아이템에만 투표할 수 있어요'
  },
  {
    value: 'MULTIPLE',
    icon: '3️⃣',
    title: '1인 3표 (순위)',
    desc: '1위부터 3위까지 순위를 매겨 투표할 수 있어요'
  }
];

// ==================== 카테고리 (백엔드에서 로드) ====================
const categories = ref([]);
const loading = ref(false);

// ==================== 배틀 폼 데이터 ====================
const battleForm = ref({
  title: '',
  categoryId: null,
  subCategoryId: null,
  itemAddPermissionType: 'CREATOR_ONLY',
  startDate: '',
  endDate: '',
  participationStartDate: '',
  thumbnailFile: null,
  description: '',
  voteType: 'SINGLE',
  items: [],
  agreeTerms: false
});

// ==================== 선택된 아이템 (UI용) ====================
const selectedItems = ref([]);

// ==================== Computed ====================
const previewPermissionTypeName = computed(() => {
  const type = itemAddPermissionTypes.find(t => t.value === battleForm.value.itemAddPermissionType);
  return type ? type.title : '';
});

const previewCategoryName = computed(() => {
  if (!battleForm.value.categoryId || !battleForm.value.subCategoryId) return '';

  const parentCategory = categories.value.find(c => c.categoryId === battleForm.value.categoryId);
  if (!parentCategory) return '';

  const subCategory = parentCategory.children?.find(s => s.categoryId === battleForm.value.subCategoryId);
  if (!subCategory) return '';

  return `${parentCategory.categoryName} > ${subCategory.categoryName}`;
});

const previewEmoji = computed(() => {
  if (!battleForm.value.subCategoryId) return '📦';

  const parentCategory = categories.value.find(c =>
      c.children?.some(s => s.categoryId === battleForm.value.subCategoryId)
  );

  if (!parentCategory) return '📦';

  const subCategory = parentCategory.children?.find(s => s.categoryId === battleForm.value.subCategoryId);
  return subCategory?.emoji || parentCategory.emoji || '📦';
});

const previewVoteTypeName = computed(() => {
  const type = voteTypes.find(t => t.value === battleForm.value.voteType);
  return type ? type.title : '';
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
      return battleForm.value.title.trim().length >= 5 &&
          battleForm.value.title.trim().length <= 50 &&
          battleForm.value.subCategoryId !== null &&
          battleForm.value.startDate &&
          battleForm.value.endDate &&
          battleForm.value.participationStartDate;

    case 2:
      return battleForm.value.items.length >= 2 &&
          battleForm.value.items.length <= 20;

    case 3:
      return (!battleForm.value.description ||
          (battleForm.value.description.length >= 1 &&
              battleForm.value.description.length <= 500));

    case 4:
      return battleForm.value.agreeTerms;

    default:
      return false;
  }
});

// ==================== 메서드 ====================

/**
 * ⭐ 카테고리 트리 로드 (수정)
 */
const loadCategories = async () => {
  try {
    loading.value = true;
    console.log('📂 카테고리 트리 로드 시작...');

    const response = await categoryService.getCategories();

    console.log('📦 카테고리 트리 응답:', response);

    if (response.success && response.data) {
      categories.value = response.data;
      console.log('✅ 카테고리 트리 로드 완료:', categories.value);
    } else {
      console.warn('⚠️ 카테고리 응답이 없음');
      categories.value = [];
    }
  } catch (error) {
    console.error('❌ 카테고리 로드 실패:', error);
    categories.value = [];
    alert('카테고리를 불러오는데 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

const handleNext = async () => {
  if (currentStep.value < 4) {
    currentStep.value++;
  } else {
    await createBattle();
  }
};

const handlePrevious = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  } else {
    if (confirm('배틀 생성을 취소하시겠습니까?\n작성 중인 내용이 저장되지 않습니다.')) {
      handleBack();
    }
  }
};

const handleBack = () => {
  router.push({ name: 'BattleList' });
};

const saveDraft = () => {
  const draftData = {
    ...battleForm.value,
    selectedItems: selectedItems.value,
    savedAt: new Date().toISOString()
  };

  localStorage.setItem('battleDraft', JSON.stringify(draftData));
  console.log('💾 임시저장:', draftData);
  alert('임시저장되었습니다');
};

const loadDraft = () => {
  try {
    const draft = localStorage.getItem('battleDraft');
    if (draft) {
      const draftData = JSON.parse(draft);
      if (confirm('임시저장된 데이터가 있습니다. 불러오시겠습니까?')) {
        battleForm.value = { ...battleForm.value, ...draftData };
        selectedItems.value = draftData.selectedItems || [];
        console.log('✅ 임시저장 데이터 복원:', draftData);
      }
    }
  } catch (error) {
    console.error('❌ 임시저장 데이터 로드 실패:', error);
  }
};

/**
 * 배틀 생성
 */
const createBattle = async () => {
  try {
    loading.value = true;
    console.log('🚀 배틀 생성 시작...');

    const formatToDateTime = (dateString) => {
      if (!dateString) return null;
      return dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
    };

    const battleData = {
      title: battleForm.value.title.trim(),
      description: battleForm.value.description?.trim() || null,
      subCategoryId: battleForm.value.subCategoryId,
      itemAddPermissionType: battleForm.value.itemAddPermissionType,
      startDate: formatToDateTime(battleForm.value.startDate),
      endDate: formatToDateTime(battleForm.value.endDate),
      participationStartDate: formatToDateTime(battleForm.value.participationStartDate),
      voteType: battleForm.value.voteType,
      items: battleForm.value.items
    };

    console.log('📤 전송 데이터:', battleData);

    const response = await battleService.createBattleWithFiles(
        battleData,
        battleForm.value.thumbnailFile
    );

    if (response.success) {
      console.log('✅ 배틀 생성 성공:', response.data);
      localStorage.removeItem('battleDraft');
      alert('배틀이 성공적으로 생성되었습니다! 🎉');
      router.push({
        name: 'BattleDetail',
        params: { id: response.data.id }
      });
    } else {
      throw new Error(response.message || '배틀 생성에 실패했습니다.');
    }
  } catch (error) {
    console.error('❌ 배틀 생성 실패:', error);
    alert(error.message || '배틀 생성 중 오류가 발생했습니다.');
  } finally {
    loading.value = false;
  }
};

const checkCreationPermission = async () => {
  try {
    const response = await battleService.validateCreation();

    if (!response.success) {
      alert('배틀을 생성할 권한이 없습니다.');
      router.push({ name: 'BattleList' });
    }
  } catch (error) {
    console.error('❌ 권한 체크 실패:', error);
  }
};

// ==================== Lifecycle ====================
onMounted(async () => {
  console.log('✅ BattleCreateView 마운트');

  await checkCreationPermission();
  await loadCategories();
  loadDraft();

  // 기본 날짜 설정
  if (!battleForm.value.startDate) {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    battleForm.value.startDate = today.toISOString().split('T')[0];
    battleForm.value.endDate = nextMonth.toISOString().split('T')[0];
    battleForm.value.participationStartDate = today.toISOString().split('T')[0];
  }
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: #FAFBFC;
  color: #1A1A1A;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.main-content {
  width: 100%;
  background: #FAFBFC;
}

.content-area {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 60px 80px;
}

.create-container {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

@media (max-width: 1024px) {
  .create-container {
    flex-direction: column;
  }

  .content-area {
    padding: 24px 24px 80px;
  }
}

@media (max-width: 640px) {
  .content-area {
    padding: 20px 16px 80px;
  }
}
</style>