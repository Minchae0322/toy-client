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
              :selected-items-count="selectedItems.length"
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

      <BattleCreateFooter
          :steps="steps"
          :current-step="currentStep"
          :can-proceed="canProceed"
          :loading="loading"
          @previous="handlePrevious"
          @next="handleNext"
      />
    </main>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBattle } from '@/services/BattleService.js';
import { useCategory } from '@/services/CategoryService.js';
import { useFile } from '@/services/FileService.js'; // ⭐ 수정
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
const fileService = useFile(); // ⭐ 추가

// ==================== 스텝 설정 ====================
const steps = ['기본 정보', '아이템 설정', '상세 설정', '최종 확인'];
const currentStep = ref(1);

// ==================== 아이템 추가 권한 타입 (백엔드 Enum) ====================
const itemAddPermissionTypes = [
  {
    value: 'CREATOR_ONLY',
    iconType: 'lock',
    title: '생성자만 추가 가능',
    desc: '배틀 생성자만 아이템을 추가할 수 있어요'
  },
  {
    value: 'PUBLIC_FREE',
    iconType: 'globe',
    title: '누구나 추가 가능',
    desc: '모든 사용자가 자유롭게 아이템을 추가할 수 있어요'
  },
  {
    value: 'PUBLIC_APPROVAL',
    iconType: 'check-circle',
    title: '승인 후 추가 가능',
    desc: '아이템 등록 후 생성자의 승인을 받아야 해요'
  }
];

// ==================== 투표 타입 (백엔드 Enum) ====================
const voteTypes = [
  {
    value: 'SINGLE',
    iconType: 'vote-single',
    title: '1인 1표',
    desc: '한 명당 하나의 아이템에만 투표할 수 있어요'
  },
  {
    value: 'MULTIPLE',
    iconType: 'vote-multiple',
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
  if (!battleForm.value.subCategoryId) return null;

  const parentCategory = categories.value.find(c =>
      c.children?.some(s => s.categoryId === battleForm.value.subCategoryId)
  );

  if (!parentCategory) return null;

  const subCategory = parentCategory.children?.find(s => s.categoryId === battleForm.value.subCategoryId);
  return subCategory?.emoji || parentCategory.emoji || null;
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
      return battleForm.value.title.trim().length > 0 && // ⭐ 1자 이상만 체크
          battleForm.value.subCategoryId !== null &&
          battleForm.value.startDate &&
          battleForm.value.endDate &&
          battleForm.value.participationStartDate;

    case 2:
      return selectedItems.value.length >= 2 &&
          selectedItems.value.length <= 20;

    case 3:
      return true; // ⭐ 설명은 선택 사항이므로 항상 true

    case 4:
      return battleForm.value.agreeTerms;

    default:
      return false;
  }
});

// ==================== 메서드 ====================

const loadCategories = async () => {
  try {
    loading.value = true;

    const response = await categoryService.getCategories();

    if (response.success && response.data) {
      categories.value = response.data;
    } else {
      categories.value = [];
    }
  } catch (error) {
    console.error('카테고리 로드 실패:', error);
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
      }
    }
  } catch (error) {
    console.error('임시저장 데이터 로드 실패:', error);
  }
};

/**
 * 배틀 생성 - 배치 업로드 후 customImageUrl에 매핑
 */
const createBattle = async () => {
  try {
    loading.value = true;

    const formatToDateTime = (dateString) => {
      if (!dateString) return null;
      return dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
    };

    // ⭐ 1. 대표 이미지 - 이미 업로드된 attachmentInfo 사용
    let thumbnailAttachmentInfo = null;
    if (battleForm.value.thumbnailAttachmentInfo) {
      // Step1에서 이미 업로드 완료
      thumbnailAttachmentInfo = battleForm.value.thumbnailAttachmentInfo;
      console.log(`✅ [BATTLE] 대표 이미지 이미 업로드됨:`, thumbnailAttachmentInfo);
    } else if (battleForm.value.thumbnailFile) {
      // 업로드 실패 후 재시도하는 경우
      console.log(`📤 [BATTLE] 대표 이미지 업로드 시작`);
      const thumbnailResponse = await fileService.upload(
          battleForm.value.thumbnailFile,
          { fileCode: 'BATTLE' }
      );

      if (!thumbnailResponse.success) {
        throw new Error('대표 이미지 업로드에 실패했습니다.');
      }

      const uploadedFile = thumbnailResponse.data;
      if (uploadedFile) {
        thumbnailAttachmentInfo = {
          fileId: uploadedFile.id,
          storedPath: uploadedFile.fileUrl,
          originName: uploadedFile.orgFileNm,
          fileSize: uploadedFile.fileSize,
          contentType: uploadedFile.contentType || null
        };
      }
      console.log(`✅ [BATTLE] 대표 이미지 업로드 완료`);
    }

    // ⭐ 2. 아이템 이미지 - 파일이 있는 것만 수집
    const itemFiles = [];
    const fileIndexMap = new Map();

    // Step2의 커스텀 아이템 이미지 중 파일만 수집
    selectedItems.value.forEach((item, index) => {
      if (item.customImageFile && !item.customImageAttachmentInfo) {
        // 아직 업로드되지 않은 파일만
        fileIndexMap.set(itemFiles.length, index);
        itemFiles.push(item.customImageFile);
      }
    });

    // ⭐ 3. 아이템 이미지 배치 업로드 (아직 업로드되지 않은 것만)
    let itemImageUrlMap = new Map();
    if (itemFiles.length > 0) {
      console.log(`📤 [BATTLE] ${itemFiles.length}개 아이템 이미지 배치 업로드 시작`);

      const itemUploadResponse = await fileService.uploadMultiple(
          itemFiles,
          { fileCode: 'BATTLE_ITEM' }
      );

      if (!itemUploadResponse.success) {
        throw new Error('아이템 이미지 업로드에 실패했습니다.');
      }

      const uploadedData = Array.isArray(itemUploadResponse.data)
          ? itemUploadResponse.data
          : [itemUploadResponse.data];

      // 업로드된 파일의 fileUrl을 매핑
      fileIndexMap.forEach((itemIndex, fileIndex) => {
        const uploadedFile = uploadedData[fileIndex];
        if (uploadedFile && uploadedFile.fileUrl) {
          itemImageUrlMap.set(itemIndex, uploadedFile.fileUrl);
        }
      });

      console.log(`✅ [BATTLE] ${itemImageUrlMap.size}개 아이템 이미지 업로드 완료`);
    }

    // ⭐ 4. 아이템 데이터 처리
    const processedItems = selectedItems.value.map((item, index) => {
      if (item.customName) {
        // 커스텀 아이템
        let customImageUrl = null;

        // 우선순위: 이미 업로드된 URL > 새로 업로드한 URL > URL 직접 입력
        if (item.customImageAttachmentInfo?.storedPath) {
          // Step2에서 이미 업로드된 경우
          customImageUrl = item.customImageAttachmentInfo.storedPath;
        } else if (itemImageUrlMap.has(index)) {
          // 제출 시 업로드한 경우
          customImageUrl = itemImageUrlMap.get(index);
        } else if (item.customImageUrl && item.customImageUrl.trim()) {
          // URL 직접 입력한 경우
          customImageUrl = item.customImageUrl.trim();
        }

        return {
          productId: null,
          customName: item.customName,
          customBrand: item.customBrand,
          customImageUrl: customImageUrl
        };
      } else {
        // 기존 제품
        return {
          productId: item.productId,
          customName: null,
          customBrand: null,
          customImageUrl: null
        };
      }
    });

    // ⭐ 5. 배틀 생성 DTO
    const battleData = {
      title: battleForm.value.title.trim(),
      description: battleForm.value.description?.trim() || null,
      subCategoryId: battleForm.value.subCategoryId,
      itemAddPermissionType: battleForm.value.itemAddPermissionType,
      startDate: formatToDateTime(battleForm.value.startDate),
      endDate: formatToDateTime(battleForm.value.endDate),
      participationStartDate: formatToDateTime(battleForm.value.participationStartDate),
      voteType: battleForm.value.voteType,
      thumbnailAttachmentInfo: thumbnailAttachmentInfo,
      items: processedItems
    };

    console.log('📤 [BATTLE] 배틀 생성 요청:', JSON.stringify(battleData, null, 2));

    // ⭐ 6. 배틀 생성 API 호출
    const response = await battleService.createBattle(battleData);

    if (response.success) {
      localStorage.removeItem('battleDraft');
      alert('배틀이 성공적으로 생성되었습니다!');
      router.push({
        name: 'BattleDetail',
        params: { id: response.data.id }
      });
    } else {
      throw new Error(response.message || '배틀 생성에 실패했습니다.');
    }
  } catch (error) {
    console.error('배틀 생성 실패:', error);
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
    console.error('권한 체크 실패:', error);
  }
};

// ==================== Lifecycle ====================
onMounted(async () => {
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
  font-family: 'SUIT-Regular', 'Noto Sans KR', sans-serif;
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
    align-items: center;
  }

  .create-container > * {
    width: 100%;
    max-width: 600px;
  }

  .content-area {
    padding: 24px 24px 80px;
  }
}

@media (max-width: 640px) {
  .content-area {
    padding: 20px 16px 80px;
  }

  .create-container > * {
    max-width: 100%;
  }
}
</style>