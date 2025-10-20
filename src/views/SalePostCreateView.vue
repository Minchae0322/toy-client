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
        <ImageUploadSection
            :images="images"
            :uploading="uploading"
            @upload="handleImageUpload"
            @remove="removeImage"
        />

        <SaleTypeSelector v-model="formData.saleType" />

        <BasicInfoSection
            v-model:title="formData.title"
            v-model:description="formData.description"
            v-model:location="formData.tradeLocation"
        />

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
// 이전과 동일한 script 내용
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { oneMouthService } from '@/services/OneMouthService.js';

import CreateHeader from '@/components/oneMouth/create/CreateHeader.vue';
import ImageUploadSection from '@/components/oneMouth/create/ImageUploadSection.vue';
import SaleTypeSelector from '@/components/oneMouth/create/SaleTypeSelector.vue';
import BasicInfoSection from '@/components/oneMouth/create/BasicInfoSection.vue';
import BiteSizeOption from '@/components/oneMouth/create/BiteSizeOption.vue';
import NormalSaleOption from '@/components/oneMouth/create/NormalSaleOption.vue';
import GroupBuyOption from '@/components/oneMouth/create/GroupBuyOption.vue';
import ProxyBuyOption from '@/components/oneMouth/create/ProxyBuyOption.vue';

const router = useRouter();

const saving = ref(false);
const uploading = ref(false);
const images = ref([]);

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
  if (!formData.value.title || !formData.value.saleType || images.value.length === 0) {
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

const handleImageUpload = async (files) => {
  const remainingSlots = 5 - images.value.length;

  if (files.length > remainingSlots) {
    alert(`이미지는 최대 5장까지만 등록 가능합니다.`);
    return;
  }

  uploading.value = true;

  try {
    const response = await oneMouthService.uploadImages(files);

    if (response.data?.data) {
      const uploadedImages = response.data.data.map(url => ({
        fileUrl: url,
        fileSize: 0,
        fileType: 'image/jpeg'
      }));
      images.value = [...images.value, ...uploadedImages];
    }
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    alert('이미지 업로드에 실패했습니다.');
  } finally {
    uploading.value = false;
  }
};

const removeImage = (index) => {
  images.value.splice(index, 1);
};

const buildRequestData = () => {
  const thumbnailAttachmentInfo = images.value.length > 0 ? images.value[0] : null;
  const attachmentFileInfos = images.value.slice(1);

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
      return { ...baseData, biteSizeOption: biteSizeOption.value };
    case 'NORMAL':
      return { ...baseData, normalSaleOptions: normalSaleOptions.value };
    case 'GROUP_BUY':
      return { ...baseData, groupBuyOption: groupBuyOption.value };
    case 'PROXY':
      return { ...baseData, proxyBuyOption: proxyBuyOption.value };
    default:
      return baseData;
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('필수 항목을 모두 입력해주세요.');
    return;
  }

  saving.value = true;

  try {
    const requestData = buildRequestData();
    const response = await oneMouthService.createOneMouth(requestData);

    if (response.data?.salePostId || response.data) {
      alert('상품이 등록되었습니다.');
      router.push('/one-mouth');
    }
  } catch (error) {
    console.error('상품 등록 실패:', error);
    alert(error.message || '상품 등록에 실패했습니다.');
  } finally {
    saving.value = false;
  }
};

const saveDraft = async () => {
  if (!formData.value.title) {
    alert('제목을 입력해주세요.');
    return;
  }

  saving.value = true;

  try {
    const requestData = buildRequestData();
    await oneMouthService.createOneMouthDraft(requestData);
    alert('임시저장되었습니다.');
    router.push('/one-mouth');
  } catch (error) {
    console.error('임시저장 실패:', error);
    alert('임시저장에 실패했습니다.');
  } finally {
    saving.value = false;
  }
};

const handleBack = () => {
  if (confirm('작성 중인 내용이 있습니다. 정말 나가시겠습니까?')) {
    router.back();
  }
};

onMounted(() => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('로그인이 필요합니다.');
    router.push('/login');
  }
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