<script setup>
import {ref, computed, onMounted} from 'vue'
import {categoryService} from '@/services/CategoryService.js'
import CategoryHeader from '@/components/category/CategoryHeader.vue'
import CategoryStats from '@/components/category/CategoryStats.vue'
import CategoryForm from '@/components/category/CategoryForm.vue'
import CategoryList from '@/components/category/CategoryList.vue'
import NotificationToast from '@/components/category/NotificationToast.vue'

// 반응형 데이터
const categories = ref([])  // 트리 구조
const flatCategories = ref([])  // 평면 구조 (통계용)
const loading = ref(false)
const showAddForm = ref(false)
const selectedParentId = ref(null)  // 추가 시 선택된 부모 카테고리
const notification = ref({show: false, message: '', type: 'success'})
const error = ref(null)

// 계산된 속성
const activeCategories = computed(() =>
    flatCategories.value.filter(c => c.isActive).length
)

const inactiveCategories = computed(() =>
    flatCategories.value.filter(c => !c.isActive).length
)

const isEmpty = computed(() => categories.value.length === 0)

const totalProducts = computed(() =>
    flatCategories.value.reduce((sum, c) => sum + (c.productCount || 0), 0)
)

// 알림 표시
const showNotification = (message, type = 'success') => {
  notification.value = {show: true, message, type}
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// 카테고리 로드
const loadCategories = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await categoryService.getCategories()
    console.log('📂 카테고리 응답:', response)

    if (response.success && response.data) {
      const data = Array.isArray(response.data) ? response.data : []
      console.log('📂 원본 데이터:', data)

      // 백엔드 응답이 평면 구조인 경우 (parentId 확인)
      const hasParentId = data.some(cat => cat.parentId !== null && cat.parentId !== undefined)

      if (hasParentId) {
        // 계층형 구조가 있는 경우 트리로 변환
        categories.value = categoryService.buildCategoryTree(data)
        flatCategories.value = categoryService.flattenCategoryTree(categories.value)
      } else {
        // 모두 최상위 카테고리인 경우 그대로 사용
        categories.value = data
        flatCategories.value = data
      }

      console.log('📂 트리 구조:', categories.value)
      console.log('📂 평면 구조:', flatCategories.value)

    } else {
      throw new Error(response.message || '카테고리 목록 조회 실패')
    }
  } catch (apiError) {
    console.error('❌ 카테고리 로딩 에러:', apiError)
    error.value = apiError.message
    categories.value = []
    flatCategories.value = []
    showNotification('카테고리 목록을 불러오는데 실패했습니다.', 'error')
  } finally {
    loading.value = false
  }
}

// 카테고리 추가
const handleAddCategory = async (categoryData) => {
  try {
    // categoryData에 이미 parentId가 포함되어 있으므로 그대로 사용
    console.log('➕ 카테고리 추가 요청:', categoryData)
    console.log('➕ selectedParentId.value:', selectedParentId.value)

    const response = await categoryService.createCategory(categoryData)

    if (response.success) {
      await loadCategories()

      const wasSubCategory = categoryData.parentId !== null
      const parentText = wasSubCategory ? '하위 카테고리가' : '카테고리가'
      showNotification(`${parentText} 추가되었습니다.`)

      // 성공 후에 폼 닫기
      showAddForm.value = false
      selectedParentId.value = null
    } else {
      throw new Error(response.message || '카테고리 추가 실패')
    }
  } catch (error) {
    console.error('❌ 카테고리 추가 실패:', error)
    showNotification(error.message || '카테고리 추가에 실패했습니다.', 'error')
  }
}

// 카테고리 수정
const handleUpdateCategory = async (categoryId, updateData) => {
  try {
    console.log('✏️ 카테고리 수정 요청:', categoryId, updateData)
    const response = await categoryService.updateCategory(categoryId, updateData)

    if (response.success) {
      await loadCategories()
      showNotification('카테고리가 수정되었습니다.')
    } else {
      throw new Error(response.message || '카테고리 수정 실패')
    }
  } catch (error) {
    console.error('❌ 카테고리 수정 실패:', error)
    showNotification(error.message || '카테고리 수정에 실패했습니다.', 'error')
    throw error
  }
}

// 카테고리 삭제
const handleDeleteCategory = async (categoryId) => {
  try {
    // 하위 카테고리 확인
    const category = flatCategories.value.find(c => c.categoryId === categoryId)
    if (!category) return

    const descendants = flatCategories.value.filter(c => c.parentId === categoryId)

    if (descendants.length > 0) {
      const confirmed = confirm(
          `이 카테고리에는 ${descendants.length}개의 하위 카테고리가 있습니다.\n` +
          '하위 카테고리도 함께 삭제됩니다. 계속하시겠습니까?'
      )
      if (!confirmed) return
    }

    console.log('🗑️ 카테고리 삭제 요청:', categoryId)
    const response = await categoryService.deleteCategory(categoryId)

    if (response.success) {
      await loadCategories()
      showNotification('카테고리가 삭제되었습니다.')
    } else {
      throw new Error(response.message || '카테고리 삭제 실패')
    }
  } catch (error) {
    console.error('❌ 카테고리 삭제 실패:', error)
    showNotification(error.message || '카테고리 삭제에 실패했습니다.', 'error')
  }
}

// 순서 변경 (같은 레벨 내에서만)
const handleReorderCategories = async (draggedId, targetOrder) => {
  try {
    console.log('🔄 순서 변경 요청:', draggedId, '→', targetOrder)
    const response = await categoryService.updateCategoryOrder(draggedId, targetOrder)

    if (response.success) {
      await loadCategories()
      showNotification('카테고리 순서가 변경되었습니다.')
    } else {
      throw new Error(response.message || '순서 변경 실패')
    }
  } catch (error) {
    console.error('❌ 순서 변경 실패:', error)
    showNotification(error.message || '순서 변경에 실패했습니다.', 'error')
    await loadCategories()  // 실패 시 원래 상태로 복구
    throw error
  }
}

// 상태 토글
const handleToggleStatus = async (categoryId) => {
  try {
    console.log('🔄 상태 토글 요청:', categoryId)
    const response = await categoryService.toggleCategoryStatus(categoryId)

    if (response.success) {
      await loadCategories()
      showNotification('카테고리 상태가 변경되었습니다.')
    } else {
      throw new Error(response.message || '상태 변경 실패')
    }
  } catch (error) {
    console.error('❌ 상태 변경 실패:', error)
    showNotification(error.message || '상태 변경에 실패했습니다.', 'error')
    throw error
  }
}

// 하위 카테고리 추가 열기
const openAddSubCategory = (parentId) => {
  selectedParentId.value = parentId
  showAddForm.value = true
}

// 최상위 카테고리 추가 열기
const openAddForm = () => {
  selectedParentId.value = null
  showAddForm.value = true
}

const closeAddForm = () => {
  showAddForm.value = false
  selectedParentId.value = null
}

// 라이프사이클
onMounted(async () => {
  await loadCategories()
})

defineExpose({
  loadCategories
})
</script>

<template>
  <div class="category-management">
    <CategoryHeader @add-category="openAddForm"/>

    <CategoryStats
        :data-source="flatCategories"
        :auto-calculate="true"
        :loading="loading"
        :error="error"
    />

    <CategoryForm
        v-if="showAddForm"
        :parent-id="selectedParentId"
        :categories="flatCategories"
        @submit="handleAddCategory"
        @cancel="closeAddForm"
    />

    <CategoryList
        :categories="categories"
        :loading="loading"
        :is-empty="isEmpty"
        :error="error"
        @add-category="openAddForm"
        @add-sub-category="openAddSubCategory"
        @update-category="handleUpdateCategory"
        @delete-category="handleDeleteCategory"
        @toggle-status="handleToggleStatus"
        @reorder-categories="handleReorderCategories"
        @refresh="loadCategories"
    />

    <NotificationToast
        :show="notification.show"
        :message="notification.message"
        :type="notification.type"
    />
  </div>
</template>

<style scoped>
.category-management {
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 16px;
}

@media (min-width: 768px) {
  .category-management {
    padding: 32px 16px;
  }
}
</style>