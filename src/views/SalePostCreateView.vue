<template>
  <div class="page">
    <CreateHeader
        :saving="saving"
        :is-valid="isFormValid"
        @back="handleBack"
        @draft="saveDraft"
        @submit="handleSubmit"
    />

    <main class="main">
      <form @submit.prevent="handleSubmit" class="form">
        <!-- 1️⃣ 판매 유형 선택 (최상단) -->
        <SaleTypeSelector v-model="formData.saleType" />

        <!-- 2️⃣ 상품 선택 -->
        <ProductSelector v-model="formData.productId" />

        <!-- 3️⃣ 이미지 업로드 -->
        <ImageUploadSection
            :images="previewImages"
            :uploading="uploading"
            @upload="handleImageSelect"
            @remove="removeImage"
        />

        <!-- 4️⃣ 기본 정보 -->
        <BasicInfoSection
            v-model:title="formData.title"
            v-model:description="formData.description"
            v-model:location="formData.tradeLocation"
        />

        <!-- 5️⃣ 판매 유형별 옵션 (조건부 렌더링) -->
        <BiteSizeOption
            v-if="formData.saleType === 'ONEMOUTH'"
            v-model="biteSizeOption"
        />

        <NormalSaleOption
            v-if="formData.saleType === 'NORMAL'"
            v-model="normalSaleOptions"
        />

        <GroupBuyOption
            v-if="formData.saleType === 'GROUP_BUY'"
            v-model="groupBuyOption"
        />

        <ProxyBuyOption
            v-if="formData.saleType === 'PROXY'"
            v-model="proxyBuyOption"
        />
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { oneMouthService } from '@/services/SalePostService.js';
import { fileService } from '@/services/FileService.js';

import CreateHeader from '@/components/oneMouth/create/CreateHeader.vue';
import ImageUploadSection from '@/components/oneMouth/create/ImageUploadSection.vue';
import SaleTypeSelector from '@/components/oneMouth/create/SaleTypeSelector.vue';
import BasicInfoSection from '@/components/oneMouth/create/BasicInfoSection.vue';
import BiteSizeOption from '@/components/oneMouth/create/BiteSizeOption.vue';
import NormalSaleOption from '@/components/oneMouth/create/NormalSaleOption.vue';
import GroupBuyOption from '@/components/oneMouth/create/GroupBuyOption.vue';
import ProxyBuyOption from '@/components/oneMouth/create/ProxyBuyOption.vue';
import ProductSelector from '@/components/oneMouth/create/ProductSelector.vue';


const router = useRouter();

const saving = ref(false);
const uploading = ref(false);

// 실제 File 객체들을 저장 (업로드용)
const selectedFiles = ref([]);

// 미리보기용 이미지 URL
const previewImages = ref([]);

const formData = ref({
  title: '',
  description: '',
  saleType: '',
  tradeLocation: '',
  productId: null
});

const biteSizeOption = ref({
  unitQuantity: null,
  unitPrice: null,
  totalBiteCount: null,
  originalPrice: null,
  optionName: ''
});

const normalSaleOptions = ref([{
  optionName: '',
  price: null,
  totalStock: null,
  originalPrice: null
}]);

const groupBuyOption = ref({
  groupBuyType: 'OPEN',
  targetCount: null,
  discountedPrice: null,
  normalPrice: null,
  discountRate: null,
  deadline: '',
  optionName: ''
});

const proxyBuyOption = ref({
  estimatedProductPrice: null,
  serviceFee: null,
  purchaseLocation: '',
  expectedPurchaseDate: '',
  maxQuantity: null,
  optionName: ''
});

const isFormValid = computed(() => {
  if (!formData.value.title || !formData.value.saleType || selectedFiles.value.length === 0) {
    return false;
  }

  switch (formData.value.saleType) {
    case 'ONEMOUTH':
      return biteSizeOption.value.unitQuantity &&
          biteSizeOption.value.unitPrice &&
          biteSizeOption.value.totalBiteCount;
    case 'NORMAL':
      return normalSaleOptions.value.every(opt =>
          opt.optionName && opt.price !== null && opt.totalStock !== null
      );
    case 'GROUP_BUY':
      return groupBuyOption.value.targetCount &&
          groupBuyOption.value.discountedPrice &&
          groupBuyOption.value.deadline;
    case 'PROXY':
      return proxyBuyOption.value.estimatedProductPrice &&
          proxyBuyOption.value.serviceFee &&
          proxyBuyOption.value.purchaseLocation &&
          proxyBuyOption.value.maxQuantity;
    default:
      return false;
  }
});

// ✅ 이미지 선택만 하고 업로드하지 않음 (미리보기만 생성)
const handleImageSelect = async (files) => {
  const remainingSlots = 5 - selectedFiles.value.length;

  if (files.length > remainingSlots) {
    alert(`이미지는 최대 5장까지만 등록 가능합니다.`);
    return;
  }

  try {
    // 이미지 파일만 필터링
    const imageFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        console.warn('이미지 파일이 아님:', file.name, file.type);
      }
      return isImage;
    });

    if (imageFiles.length === 0) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(`파일 크기는 5MB 이하여야 합니다.\n초과 파일: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // File 객체 저장
    selectedFiles.value = [...selectedFiles.value, ...imageFiles];

    // 미리보기 URL 생성
    const newPreviews = imageFiles.map(file => {
      const blobUrl = URL.createObjectURL(file);
      console.log('📸 미리보기 생성:', {
        name: file.name,
        type: file.type,
        size: file.size,
        blobUrl: blobUrl
      });

      return {
        fileUrl: blobUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
    });

    previewImages.value = [...previewImages.value, ...newPreviews];

    console.log('✅ 이미지 선택 완료:', imageFiles.length, '개');
    console.log('현재 미리보기 목록:', previewImages.value);
  } catch (error) {
    console.error('❌ 이미지 선택 실패:', error);
    alert('이미지 선택에 실패했습니다.');
  }
};

const removeImage = (index) => {
  // 미리보기 URL 메모리 해제
  if (previewImages.value[index]?.fileUrl) {
    URL.revokeObjectURL(previewImages.value[index].fileUrl);
  }

  selectedFiles.value.splice(index, 1);
  previewImages.value.splice(index, 1);
};

// ✅ 게시글 등록 시 이미지를 함께 업로드
const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('필수 항목을 모두 입력해주세요.');
    return;
  }

  saving.value = true;

  try {
    // 1️⃣ 먼저 이미지 업로드
    console.log('📤 이미지 업로드 시작:', selectedFiles.value.length, '개');

    const uploadResponse = await fileService.uploadImages(
        selectedFiles.value,
        'SALE_POST'
    );

    if (!uploadResponse.success || !uploadResponse.data || uploadResponse.data.length === 0) {
      throw new Error('이미지 업로드에 실패했습니다.');
    }

    console.log('✅ 이미지 업로드 완료:', uploadResponse.data);

    // 2️⃣ 업로드된 이미지 정보로 Request 데이터 생성
    const uploadedImages = uploadResponse.data;

    const thumbnailAttachmentInfo = {
      fileId: uploadedImages[0].fileId,
      fileUrl: uploadedImages[0].fileUrl,
      fileSize: uploadedImages[0].fileSize,
      fileType: uploadedImages[0].fileType || 'image/jpeg'
    };

    const attachmentFileInfos = uploadedImages.slice(1).map(image => ({
      fileId: image.fileId,
      fileUrl: image.fileUrl,
      fileSize: image.fileSize,
      fileType: image.fileType || 'image/jpeg'
    }));

    // 3️⃣ 게시글 데이터 생성
    const requestData = buildRequestData(thumbnailAttachmentInfo, attachmentFileInfos);

    console.log('📤 게시글 등록 요청:', requestData);

    // 4️⃣ 게시글 등록
    const response = await oneMouthService.createOneMouth(requestData);

    if (response.data?.salePostId || response.data) {
      alert('상품이 등록되었습니다.');

      // 미리보기 URL 메모리 해제
      previewImages.value.forEach(preview => {
        if (preview.fileUrl) URL.revokeObjectURL(preview.fileUrl);
      });

      router.push('/one-mouth');
    }

  } catch (error) {
    console.error('❌ 상품 등록 실패:', error);
    alert(error.message || '상품 등록에 실패했습니다.');
  } finally {
    saving.value = false;
  }
};

// ✅ Request 데이터 생성 (이미지 정보 포함)
const buildRequestData = (thumbnailAttachmentInfo, attachmentFileInfos) => {
  const baseData = {
    title: formData.value.title,
    description: formData.value.description,
    saleType: formData.value.saleType,
    tradeLocation: formData.value.tradeLocation,
    productId: formData.value.productId,
    thumbnailAttachmentInfo,
    attachmentFileInfos
  };

  switch (formData.value.saleType) {
    case 'ONEMOUTH':
      return {...baseData, biteSizeOption: biteSizeOption.value};
    case 'NORMAL':
      return {...baseData, normalSaleOptions: normalSaleOptions.value};
    case 'GROUP_BUY':
      return {...baseData, groupBuyOption: groupBuyOption.value};
    case 'PROXY':
      return {...baseData, proxyBuyOption: proxyBuyOption.value};
    default:
      return baseData;
  }
};

// ✅ 임시저장 (이미지도 함께 업로드)
const saveDraft = async () => {
  if (!formData.value.title) {
    alert('제목을 입력해주세요.');
    return;
  }

  saving.value = true;

  try {
    let thumbnailAttachmentInfo = null;
    let attachmentFileInfos = [];

    // 선택된 이미지가 있으면 업로드
    if (selectedFiles.value.length > 0) {
      const uploadResponse = await fileService.uploadImages(
          selectedFiles.value,
          'SALE_POST'
      );

      if (uploadResponse.success && uploadResponse.data) {
        const uploadedImages = uploadResponse.data;

        thumbnailAttachmentInfo = {
          fileId: uploadedImages[0].fileId,
          fileUrl: uploadedImages[0].fileUrl,
          fileSize: uploadedImages[0].fileSize,
          fileType: uploadedImages[0].fileType || 'image/jpeg'
        };

        attachmentFileInfos = uploadedImages.slice(1).map(image => ({
          fileId: image.fileId,
          fileUrl: image.fileUrl,
          fileSize: image.fileSize,
          fileType: image.fileType || 'image/jpeg'
        }));
      }
    }

    const requestData = buildRequestData(thumbnailAttachmentInfo, attachmentFileInfos);

    await oneMouthService.createOneMouthDraft(requestData);

    alert('임시저장되었습니다.');

    // 미리보기 URL 메모리 해제
    previewImages.value.forEach(preview => {
      if (preview.fileUrl) URL.revokeObjectURL(preview.fileUrl);
    });

    router.push('/one-mouth');

  } catch (error) {
    console.error('❌ 임시저장 실패:', error);
    alert('임시저장에 실패했습니다.');
  } finally {
    saving.value = false;
  }
};

const handleBack = () => {
  if (confirm('작성 중인 내용이 있습니다. 정말 나가시겠습니까?')) {
    // 미리보기 URL 메모리 해제
    previewImages.value.forEach(preview => {
      if (preview.fileUrl) URL.revokeObjectURL(preview.fileUrl);
    });

    router.back();
  }
};

// 컴포넌트 언마운트 시 메모리 해제
onMounted(() => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('로그인이 필요합니다.');
    router.push('/login');
  }

  // 페이지를 벗어날 때 미리보기 URL 정리
  window.addEventListener('beforeunload', () => {
    previewImages.value.forEach(preview => {
      if (preview.fileUrl) URL.revokeObjectURL(preview.fileUrl);
    });
  });
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f9fafb;
}

.main {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .main {
    padding: 1.5rem 1rem;
  }

  .form {
    gap: 1rem;
  }
}
</style>