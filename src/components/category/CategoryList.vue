<script setup>
import { ref } from 'vue'
import CategoryItem from '@/components/category/CategoryItem.vue'
import CategoryEmpty from '@/components/category/CategoryEmpty.vue'
import CategoryLoading from '@/components/category/CategoryLoading.vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  isEmpty: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'add-category',
  'update-category',
  'delete-category',
  'reorder-categories',
  'update-categories',
  'status-updated' // 🔥 status-updated 이벤트 추가
])

const draggedItem = ref(null)
const dragOverIndex = ref(-1)

const handleDragStart = (item) => {
  draggedItem.value = item
}

const handleDragEnd = () => {
  draggedItem.value = null
  dragOverIndex.value = -1
}

const handleDragEnter = (index) => {
  if (draggedItem.value) {
    dragOverIndex.value = index
  }
}

const handleDragLeave = () => {
  dragOverIndex.value = -1
}

const handleDrop = async (targetItem, targetIndex) => {
  if (!draggedItem.value || draggedItem.value.categoryId === targetItem.categoryId) {
    return
  }

  const draggedCategoryId = draggedItem.value.categoryId
  const targetSortOrder = targetItem.sortOrder

  // 원래 상태 백업
  const originalCategories = [...props.categories]

  try {
    // UI 즉시 업데이트 (낙관적 업데이트)
    const draggedIndex = props.categories.findIndex(c => c.categoryId === draggedCategoryId)
    const newCategories = [...props.categories]
    const [removed] = newCategories.splice(draggedIndex, 1)
    newCategories.splice(targetIndex, 0, removed)

    // sortOrder 재정렬
    newCategories.forEach((cat, index) => {
      cat.sortOrder = index + 1
    })

    emit('update-categories', newCategories)

    // API 호출
    await emit('reorder-categories', draggedCategoryId, targetSortOrder)

  } catch (error) {
    // 실패 시 원래 상태로 되돌리기
    emit('update-categories', originalCategories)
  }

  draggedItem.value = null
  dragOverIndex.value = -1
}

const handleUpdateCategory = async (id, field, value) => {
  const category = props.categories.find(cat => cat.categoryId === id)
  if (category) {
    const originalValue = category[field]
    category[field] = value

    try {
      // 모든 필드를 한 번에 전송
      const updateData = {
        categoryName: category.categoryName,
        description: category.description || '',
        keywords: Array.isArray(category.keywords) ? category.keywords :
            (typeof category.keywords === 'string' ?
                category.keywords.split(',').map(k => k.trim()).filter(k => k) : [])
      }

      await emit('update-category', id, updateData)
    } catch (error) {
      // 실패 시 원래 값으로 복구
      category[field] = originalValue
      throw error
    }
  }
}

const handleDeleteCategory = (id) => {
  emit('delete-category', id)
}

const handleAddCategory = () => {
  emit('add-category')
}

// 🔥 새로 추가: 상태 업데이트 이벤트 전달
const handleStatusUpdated = (eventData) => {
  console.log('📋 CategoryList에서 status-updated 이벤트 전달:', eventData)
  emit('status-updated', eventData)
}
</script>

<template>
  <div class="list-section">
    <div class="list-header">
      <h2>카테고리 목록</h2>
      <p v-if="!isEmpty && !loading">드래그해서 순서를 변경할 수 있습니다</p>
    </div>

    <!-- 로딩 상태 -->
    <CategoryLoading v-if="loading" />

    <!-- 빈 목록 상태 -->
    <CategoryEmpty v-else-if="isEmpty" @add-category="handleAddCategory" />

    <!-- 카테고리 목록 -->
    <div v-else class="category-list">
      <CategoryItem
          v-for="(category, index) in categories"
          :key="category.categoryId"
          :category="category"
          :index="index"
          :is-dragging="draggedItem?.categoryId === category.categoryId"
          :is-drag-over="dragOverIndex === index && draggedItem?.categoryId !== category.categoryId"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
          @drag-enter="handleDragEnter"
          @drag-leave="handleDragLeave"
          @drop="handleDrop"
          @update="handleUpdateCategory"
          @delete="handleDeleteCategory"
          @status-updated="handleStatusUpdated"
      />
    </div>
  </div>
</template>

<style scoped>
.list-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.list-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.list-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.list-header p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.category-list {
  display: flex;
  flex-direction: column;
}

/* 모바일 최적화 */
@media (max-width: 640px) {
  .list-header {
    padding: 12px;
  }

  .list-header h2 {
    font-size: 14px;
  }

  .list-header p {
    font-size: 11px;
  }
}

/* 태블릿 */
@media (min-width: 768px) {
  .list-header {
    padding: 20px;
  }

  .list-header h2 {
    font-size: 18px;
  }

  .list-header p {
    font-size: 14px;
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .list-header {
    padding: 24px 24px 16px 24px;
  }
}
</style>