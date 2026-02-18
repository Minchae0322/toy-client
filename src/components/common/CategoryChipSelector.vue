<template>
  <div class="category-chip-selector">
    <!-- 선택된 카테고리 표시 -->
    <div v-if="selectedCategoryInfo" class="selected-category-display">
      <span class="selected-category-label">{{ selectedCategoryInfo.label }}</span>
      <button type="button" class="selected-category-clear" @click="clearCategory">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- 1뎁스 카테고리 칩 -->
    <div class="category-chips-section">
      <p class="category-chips-title">인기 카테고리</p>
      <div class="category-chips-list">
        <button
          v-for="cat in popularCategories"
          :key="cat.categoryId"
          type="button"
          :class="['category-chip', { active: selectedParentCategory?.categoryId === cat.categoryId }]"
          @click="handleParentCategoryClick(cat)"
        >
          {{ cat.categoryName }}
        </button>
        <button type="button" class="category-chip more-btn" @click="openCategoryModal">
          더보기
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 2뎁스 하위 카테고리 -->
    <div v-if="selectedParentCategory && subCategories.length > 0" class="sub-category-section">
      <div class="sub-category-list">
        <button
          v-for="subCat in subCategories"
          :key="subCat.categoryId"
          type="button"
          :class="['sub-category-chip', { active: modelValue === subCat.categoryId }]"
          @click="selectSubCategory(subCat)"
        >
          {{ subCat.categoryName }}
        </button>
      </div>
    </div>

    <!-- 카테고리 선택 모달 -->
    <CategorySelectModal
      v-if="showCategoryModal"
      :content-type="contentType"
      :initial-category-id="modelValue"
      @select="handleCategorySelect"
      @close="closeCategoryModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCategoryCache } from '@/composables/useCategoryCache.js'
import CategorySelectModal from '@/components/common/CategorySelectModal.vue'

const props = defineProps({
  contentType: {
    type: String,
    required: true,
    validator: (value) => ['FEED', 'BATTLE', 'PRODUCT'].includes(value)
  },
  modelValue: {
    type: [Number, String, null],
    default: null
  },
  maxPopular: {
    type: Number,
    default: 8
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const { loadPopularCategories, loadAllCategories } = useCategoryCache()

const popularCategories = ref([])
const selectedParentCategory = ref(null)
const selectedCategoryInfo = ref(null)
const showCategoryModal = ref(false)

// 선택된 1뎁스 카테고리의 하위 카테고리 목록
const subCategories = computed(() => {
  if (!selectedParentCategory.value) return []
  return selectedParentCategory.value.children || []
})

// 인기 카테고리 로드
const loadCategories = async () => {
  try {
    await loadAllCategories()
    const popular = await loadPopularCategories(props.contentType, props.maxPopular)
    popularCategories.value = popular
  } catch (error) {
    console.error('카테고리 로드 실패:', error)
  }
}

// 1뎁스 카테고리 클릭
const handleParentCategoryClick = (cat) => {
  if (selectedParentCategory.value?.categoryId === cat.categoryId) {
    selectedParentCategory.value = null
    return
  }
  selectedParentCategory.value = cat
}

// 2뎁스 카테고리 선택
const selectSubCategory = (subCat) => {
  emit('update:modelValue', subCat.categoryId)

  selectedCategoryInfo.value = {
    label: `${selectedParentCategory.value.categoryName} > ${subCat.categoryName}`,
    category: subCat,
    parent: selectedParentCategory.value
  }

  emit('select', {
    categoryId: selectedParentCategory.value.categoryId,
    subCategoryId: subCat.categoryId,
    category: subCat,
    parent: selectedParentCategory.value,
    categoryName: selectedParentCategory.value.categoryName,
    subCategoryName: subCat.categoryName,
    categoryEmoji: subCat.emoji || selectedParentCategory.value?.emoji || null
  })
}

// 카테고리 선택 해제
const clearCategory = () => {
  emit('update:modelValue', null)
  selectedCategoryInfo.value = null
  selectedParentCategory.value = null

  emit('select', {
    categoryId: null,
    subCategoryId: null,
    category: null,
    parent: null,
    categoryName: null,
    subCategoryName: null,
    categoryEmoji: null
  })
}

// 모달 열기/닫기
const openCategoryModal = () => {
  showCategoryModal.value = true
}

const closeCategoryModal = () => {
  showCategoryModal.value = false
}

// 모달에서 카테고리 선택
const handleCategorySelect = ({ categoryId, category, parent }) => {
  emit('update:modelValue', categoryId)

  if (parent) {
    selectedCategoryInfo.value = {
      label: `${parent.categoryName} > ${category.categoryName}`,
      category,
      parent
    }
    selectedParentCategory.value = parent
  } else {
    selectedCategoryInfo.value = {
      label: category.categoryName,
      category,
      parent: null
    }
    selectedParentCategory.value = null
  }

  emit('select', {
    categoryId: parent ? parent.categoryId : categoryId,
    subCategoryId: categoryId,
    category,
    parent,
    categoryName: parent ? parent.categoryName : category.categoryName,
    subCategoryName: parent ? category.categoryName : null,
    categoryEmoji: category.emoji || (parent && parent.emoji) || null
  })

  showCategoryModal.value = false
}

// 외부에서 modelValue가 변경되면 내부 상태 초기화
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    selectedCategoryInfo.value = null
    selectedParentCategory.value = null
  }
})

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category-chip-selector {
  width: 100%;
}

/* 선택된 카테고리 표시 */
.selected-category-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 10px;
  margin-bottom: 12px;
}

.selected-category-label {
  font-size: 14px;
  font-weight: 600;
  color: #7c3aed;
}

.selected-category-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.15s;
}

.selected-category-clear:hover {
  background: #f3e8ff;
  color: #7c3aed;
}

/* 1뎁스 카테고리 칩 */
.category-chips-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-chips-title {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin: 0;
}

.category-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-chip {
  padding: 8px 14px;
  background: #f9fafb;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.category-chip:hover {
  border-color: #d8b4fe;
  background: #faf5ff;
  color: #7c3aed;
}

.category-chip.active {
  background: #7c3aed;
  color: white;
  border-color: #7c3aed;
}

.category-chip.more-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #7c3aed;
  border-color: #e9d5ff;
  background: #faf5ff;
  font-weight: 600;
}

.category-chip.more-btn:hover {
  background: #f3e8ff;
  border-color: #d8b4fe;
}

/* 2뎁스 하위 카테고리 */
.sub-category-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.sub-category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sub-category-chip {
  padding: 6px 12px;
  background: white;
  color: #888;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.sub-category-chip:hover {
  background: #faf5ff;
  border-color: #d8b4fe;
  color: #7c3aed;
}

.sub-category-chip.active {
  background: #f3e8ff;
  border-color: #7c3aed;
  color: #7c3aed;
}
</style>
