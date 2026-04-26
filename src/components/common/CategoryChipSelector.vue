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

const { loadPopularCategories, loadAllCategories, findCategoryById, allCategories } = useCategoryCache()

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

    // 초기 modelValue가 있으면 선택 상태 복원
    if (props.modelValue) {
      restoreSelectionFromModelValue(props.modelValue)
    }
  } catch (error) {
    console.error('카테고리 로드 실패:', error)
  }
}

// modelValue로부터 선택 상태 복원
const restoreSelectionFromModelValue = (categoryId) => {
  const found = findCategoryById(categoryId)
  if (found) {
    if (found.parent) {
      selectedParentCategory.value = found.parent
      selectedCategoryInfo.value = {
        label: `${found.parent.categoryName} > ${found.category.categoryName}`,
        category: found.category,
        parent: found.parent
      }
    } else {
      selectedParentCategory.value = null
      selectedCategoryInfo.value = {
        label: found.category.categoryName,
        category: found.category,
        parent: null
      }
    }
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

// 외부에서 modelValue가 변경되면 내부 상태 동기화
// (수정 화면에서 비동기로 로드된 categoryId가 뒤늦게 들어오는 케이스 포함)
watch(() => props.modelValue, async (newValue) => {
  if (!newValue) {
    selectedCategoryInfo.value = null
    selectedParentCategory.value = null
    return
  }
  if (selectedCategoryInfo.value?.category?.categoryId === newValue) return
  if (allCategories.value.length === 0) await loadAllCategories()
  restoreSelectionFromModelValue(newValue)
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f2f2f7;
  border: none;
  border-radius: 6px;
  margin-bottom: 12px;
}

.selected-category-label {
  font-size: 13px;
  font-weight: 600;
  color: #3a3a3c;
}

.selected-category-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #8e8e93;
  cursor: pointer;
  transition: all 0.15s;
  margin-left: 4px;
}

.selected-category-clear:hover {
  color: #3a3a3c;
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
  color: #8e8e93;
  margin: 0;
}

.category-chips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.category-chip {
  padding: 8px 14px;
  background: #f2f2f7;
  color: #3a3a3c;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.category-chip:hover {
  background: #e5e5ea;
}

.category-chip.active {
  background: #9933EA;
  color: #ffffff;
}

.category-chip.more-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  background: transparent;
  color: #8e8e93;
  font-weight: 600;
}

.category-chip.more-btn:hover {
  background: #f2f2f7;
  color: #3a3a3c;
}

/* 2뎁스 하위 카테고리 */
.sub-category-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f2f2f7;
}

.sub-category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sub-category-chip {
  padding: 6px 12px;
  background: transparent;
  color: #8e8e93;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.sub-category-chip:hover {
  background: #f2f2f7;
  color: #3a3a3c;
}

.sub-category-chip.active {
  background: #3a3a3c;
  color: #ffffff;
}
</style>
