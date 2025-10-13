<!-- CategoryManagement.vue -->
<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { categoryService } from '@/services/CategoryService.js'
import CategoryHeader from '@/components/category/CategoryHeader.vue'
import CategoryStats from '@/components/category/CategoryStats.vue'
import CategoryForm from '@/components/category/CategoryForm.vue'
import CategoryList from '@/components/category/CategoryList.vue'
import NotificationToast from '@/components/category/NotificationToast.vue'

// 반응형 데이터
const categories = ref([])
const loading = ref(false)
const showAddForm = ref(false)
const notification = ref({ show: false, message: '', type: 'success' })
const error = ref(null)

// 계산된 속성
const activeCategories = computed(() =>
    categories.value.filter(c => c.isActive).length
)

const inactiveCategories = computed(() =>
    categories.value.filter(c => !c.isActive).length
)

const isEmpty = computed(() => categories.value.length === 0)

const totalProducts = computed(() =>
    categories.value.reduce((sum, c) => sum + (c.productCount || 0), 0)
)

// 알림 표시 함수
const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// API 함수들
const loadCategories = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await categoryService.getCategories()

    if (response.success && response.data) {
      categories.value = Array.isArray(response.data) ? response.data : []
      categories.value = categoryService.sortCategories(categories.value, 'sortOrder')
    } else {
      throw new Error(response.message || '카테고리 목록 조회 실패')
    }
  } catch (apiError) {
    error.value = apiError.message
    categories.value = []
    showNotification('카테고리 목록을 불러오는데 실패했습니다.', 'error')
  } finally {
    loading.value = false
  }
}

const handleAddCategory = async (categoryData) => {
  try {
    const data = {
      ...categoryData,
      sortOrder: categories.value.length + 1,
      colorCode: categoryData.colorCode,
      categoryCode: categoryData.categoryCode
    }

    const response = await categoryService.createCategory(data)

    if (response.success) {
      await loadCategories()
      showAddForm.value = false
      showNotification('카테고리가 추가되었습니다.')
    } else {
      throw new Error(response.message || '카테고리 추가 실패')
    }
  } catch (error) {
    showNotification(error.message || '카테고리 추가에 실패했습니다.', 'error')
  }
}

const handleUpdateCategory = async (categoryId, updateData) => {
  try {
    const response = await categoryService.updateCategory(categoryId, updateData)

    if (response.success) {
      const categoryIndex = categories.value.findIndex(cat => cat.categoryId === categoryId)
      if (categoryIndex !== -1) {
        categories.value[categoryIndex] = {
          ...categories.value[categoryIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      }

      showNotification('카테고리가 수정되었습니다.')
    } else {
      throw new Error(response.message || '카테고리 수정 실패')
    }
  } catch (error) {
    showNotification(error.message || '카테고리 수정에 실패했습니다.', 'error')
    throw error
  }
}

const handleDeleteCategory = async (categoryId) => {
  try {
    const response = await categoryService.deleteCategory(categoryId)

    if (response.success) {
      await loadCategories()
      showNotification('카테고리가 삭제되었습니다.')
    } else {
      throw new Error(response.message || '카테고리 삭제 실패')
    }
  } catch (error) {
    showNotification(error.message || '카테고리 삭제에 실패했습니다.', 'error')
  }
}

const handleReorderCategories = async (draggedId, targetOrder) => {
  try {
    const response = await categoryService.updateCategoryOrder(draggedId, targetOrder)

    if (response.success) {
      const draggedCategory = categories.value.find(cat => cat.categoryId === draggedId)
      if (draggedCategory) {
        draggedCategory.sortOrder = targetOrder
        categories.value = categoryService.sortCategories(categories.value, 'sortOrder')
      }

      showNotification('카테고리 순서가 변경되었습니다.')
    } else {
      throw new Error(response.message || '순서 변경 실패')
    }
  } catch (error) {
    showNotification(error.message || '순서 변경에 실패했습니다.', 'error')
    throw error
  }
}

const handleToggleStatus = async (categoryId, isActive) => {
  try {
    const response = await categoryService.toggleCategoryStatus(categoryId, isActive)

    if (response.success) {
      const categoryIndex = categories.value.findIndex(cat => cat.categoryId === categoryId)
      if (categoryIndex !== -1) {
        categories.value[categoryIndex] = {
          ...categories.value[categoryIndex],
          isActive: isActive,
          updatedAt: new Date().toISOString()
        }
      }

      const statusText = isActive ? '활성화' : '비활성화'
      showNotification(`카테고리가 ${statusText}되었습니다.`)
    } else {
      throw new Error(response.message || '상태 변경 실패')
    }
  } catch (error) {
    showNotification(error.message || '상태 변경에 실패했습니다.', 'error')
    throw error
  }
}

const handleStatusUpdated = ({ categoryId, updatedData }) => {
  const categoryIndex = categories.value.findIndex(cat => cat.categoryId === categoryId)

  if (categoryIndex !== -1) {
    const newCategories = [...categories.value]
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      ...updatedData
    }
    categories.value = newCategories
  }
}

const loadStats = async () => {
  try {
    const response = await categoryService.getAllCategoriesStats()
    if (response.success) {
      return response.data
    }
  } catch (error) {
    console.error('통계 조회 실패:', error)
  }
  return null
}

const openAddForm = () => {
  showAddForm.value = true
}

const closeAddForm = () => {
  showAddForm.value = false
}

const searchCategories = (keyword) => {
  if (!keyword) {
    return categories.value
  }
  return categoryService.filterCategories(categories.value, { keyword })
}

// 라이프사이클
onMounted(async () => {
  await loadCategories()
})

// 컴포넌트 외부로 노출
defineExpose({
  loadCategories,
  searchCategories
})
</script>

<template>
  <div class="category-management">
    <!-- 헤더 -->
    <CategoryHeader @add-category="openAddForm" />

    <!-- 통계 -->
    <CategoryStats
        :data-source="categories"
        :auto-calculate="true"
        :loading="loading"
        :error="error"
        @refresh-stats="loadStats"
    />

    <!-- 추가 폼 -->
    <CategoryForm
        v-if="showAddForm"
        @submit="handleAddCategory"
        @cancel="closeAddForm"
    />

    <!-- 카테고리 목록 -->
    <CategoryList
        :categories="categories"
        :loading="loading"
        :is-empty="isEmpty"
        :error="error"
        @add-category="openAddForm"
        @update-category="handleUpdateCategory"
        @delete-category="handleDeleteCategory"
        @toggle-status="handleToggleStatus"
        @reorder-categories="handleReorderCategories"
        @update-categories="categories = $event"
        @status-updated="handleStatusUpdated"
        @refresh="loadCategories"
    />

    <!-- 알림 -->
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