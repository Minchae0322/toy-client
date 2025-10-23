<script setup>
import {ref, computed, onMounted} from 'vue'
import {categoryService} from '@/services/CategoryService.js'
import CategoryHeader from '@/components/category/CategoryHeader.vue'
import CategoryStats from '@/components/category/CategoryStats.vue'
import CategoryForm from '@/components/category/CategoryForm.vue'
import CategoryList from '@/components/category/CategoryList.vue'
import NotificationToast from '@/components/category/NotificationToast.vue'

const categories = ref([])
const flatCategories = ref([])
const loading = ref(false)
const showAddForm = ref(false)
const selectedParentId = ref(null)
const notification = ref({show: false, message: '', type: 'success'})
const error = ref(null)

const activeCategories = computed(() =>
    flatCategories.value.filter(c => c.isActive).length
)

const inactiveCategories = computed(() =>
    flatCategories.value.filter(c => !c.isActive).length
)

const isEmpty = computed(() => categories.value.length === 0)

const showNotification = (message, type = 'success') => {
  notification.value = {show: true, message, type}
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

const loadCategories = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await categoryService.getCategories()

    if (response.success && response.data) {
      const data = Array.isArray(response.data) ? response.data : []
      const hasParentId = data.some(cat => cat.parentId !== null && cat.parentId !== undefined)

      if (hasParentId) {
        categories.value = categoryService.buildCategoryTree(data)
        flatCategories.value = categoryService.flattenCategoryTree(categories.value)
      } else {
        categories.value = data
        flatCategories.value = data
      }
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

const handleAddCategory = async (categoryData) => {
  try {
    const response = await categoryService.createCategory(categoryData)

    if (response.success) {
      await loadCategories()
      const wasSubCategory = categoryData.parentId !== null
      const parentText = wasSubCategory ? '하위 카테고리가' : '카테고리가'
      showNotification(`${parentText} 추가되었습니다.`)
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

const handleUpdateCategory = async (categoryId, updateData) => {
  try {
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

const handleDeleteCategory = async (categoryId) => {
  try {
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

const handleReorderCategories = async (draggedId, targetOrder) => {
  try {
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
    await loadCategories()
    throw error
  }
}

const handleToggleStatus = async (categoryId) => {
  try {
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

const openAddSubCategory = (parentId) => {
  selectedParentId.value = parentId
  showAddForm.value = true
}

const openAddForm = () => {
  selectedParentId.value = null
  showAddForm.value = true
}

const closeAddForm = () => {
  showAddForm.value = false
  selectedParentId.value = null
}

onMounted(async () => {
  await loadCategories()
})

defineExpose({
  loadCategories
})
</script>

<template>
  <div class="category-admin">
    <div class="admin-container">
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
  </div>
</template>

<style scoped>
.category-admin {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 0;
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 16px;
}

@media (min-width: 768px) {
  .admin-container {
    padding: 32px 24px;
  }
}

@media (min-width: 1024px) {
  .admin-container {
    padding: 40px 32px;
  }
}
</style>