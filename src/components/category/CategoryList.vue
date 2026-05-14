<script setup>
import { ref } from 'vue'
import CategoryItem from '@/components/category/CategoryItem.vue'
import CategoryEmpty from '@/components/category/CategoryEmpty.vue'
import CategoryLoading from '@/components/category/CategoryLoading.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

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
  },
  depth: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'add-category',
  'add-sub-category',
  'update-category',
  'delete-category',
  'reorder-categories',
  'toggle-status',
  'status-updated'
])

const { open } = useConfirmDialog()

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

  if (draggedItem.value.parentId !== targetItem.parentId) {
    await open({ type: 'alert', title: '알림', message: '같은 레벨의 카테고리끼리만 순서를 변경할 수 있습니다.' })
    draggedItem.value = null
    dragOverIndex.value = -1
    return
  }

  const draggedCategoryId = draggedItem.value.categoryId
  const targetSortOrder = targetItem.sortOrder

  try {
    emit('reorder-categories', draggedCategoryId, targetSortOrder)
  } catch (error) {
    console.error('순서 변경 실패:', error)
  }

  draggedItem.value = null
  dragOverIndex.value = -1
}

const handleUpdateCategory = async (id, field, value) => {
  const updateData = {
    categoryName: field === 'categoryName' ? value : undefined,
    description: field === 'description' ? value : undefined,
    keywords: field === 'keywords' ? value : undefined
  }

  try {
    emit('update-category', id, updateData)
  } catch (error) {
    console.error('카테고리 수정 실패:', error)
    throw error
  }
}

const handleDeleteCategory = (id) => {
  emit('delete-category', id)
}

const handleAddCategory = () => {
  emit('add-category')
}

const handleAddSubCategory = (parentId) => {
  emit('add-sub-category', parentId)
}

const handleToggleStatus = (categoryId) => {
  emit('toggle-status', categoryId)
}

const handleStatusUpdated = (eventData) => {
  emit('status-updated', eventData)
}
</script>

<template>
  <div class="list-section" :class="{ 'nested': depth > 0 }">
    <div v-if="depth === 0" class="list-header">
      <div class="header-row">
        <h2 class="list-title">카테고리 목록</h2>
        <div class="list-count">{{ categories.length }}</div>
      </div>
      <p v-if="!isEmpty && !loading" class="list-hint">같은 레벨 내에서 드래그하여 순서를 변경할 수 있습니다</p>
    </div>

    <!-- 로딩 상태 -->
    <CategoryLoading v-if="loading && depth === 0" />

    <!-- 빈 목록 상태 -->
    <CategoryEmpty v-else-if="isEmpty && depth === 0" @add-category="handleAddCategory" />

    <!-- 카테고리 목록 (재귀 구조) -->
    <div v-else class="category-list">
      <template v-for="(category, index) in categories" :key="category.categoryId">
        <CategoryItem
            :category="category"
            :index="index"
            :depth="depth"
            :is-dragging="draggedItem?.categoryId === category.categoryId"
            :is-drag-over="dragOverIndex === index && draggedItem?.categoryId !== category.categoryId"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
            @drag-enter="handleDragEnter"
            @drag-leave="handleDragLeave"
            @drop="handleDrop"
            @update="handleUpdateCategory"
            @delete="handleDeleteCategory"
            @toggle-status="handleToggleStatus"
            @add-sub-category="handleAddSubCategory"
            @status-updated="handleStatusUpdated"
        />

        <!-- 자식 카테고리 재귀 렌더링 -->
        <CategoryList
            v-if="category.children && category.children.length > 0"
            :categories="category.children"
            :depth="depth + 1"
            @add-sub-category="handleAddSubCategory"
            @update-category="handleUpdateCategory"
            @delete-category="handleDeleteCategory"
            @reorder-categories="(draggedId, targetOrder) => $emit('reorder-categories', draggedId, targetOrder)"
            @toggle-status="handleToggleStatus"
            @status-updated="handleStatusUpdated"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.list-section {
  background: var(--bg-elevated);
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.list-section.nested {
  background: var(--bg-subtle);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  margin-left: 40px;
  margin-top: 12px;
  box-shadow: none;
}

.list-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--bg-subtle);
  background: var(--bg-subtle);
}

.header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.list-count {
  padding: 4px 10px;
  background: var(--c-info);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.list-hint {
  font-size: 13px;
  color: var(--c-text-500);
  margin: 0;
}

.category-list {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

@media (max-width: 640px) {
  .list-section.nested {
    margin-left: 20px;
  }

  .list-header {
    padding: 16px;
  }

  .list-title {
    font-size: 15px;
  }

  .list-hint {
    font-size: 12px;
  }

  .category-list {
    padding: 12px;
  }
}

@media (min-width: 768px) {
  .list-header {
    padding: 20px 24px;
  }

  .list-title {
    font-size: 16px;
  }

  .list-hint {
    font-size: 13px;
  }
}

@media (min-width: 1024px) {
  .list-header {
    padding: 24px 28px;
  }

  .category-list {
    padding: 20px;
  }
}
</style>