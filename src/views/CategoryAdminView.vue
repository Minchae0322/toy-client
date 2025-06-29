<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { contentService } from '@/api/axios.js'
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

// 계산된 속성 - 자동으로 반응성 가짐
const activeCategories = computed(() =>
    categories.value.filter(c => c.isActive).length
)

const inactiveCategories = computed(() =>
    categories.value.filter(c => !c.isActive).length
)

const isEmpty = computed(() => categories.value.length === 0)

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
  try {
    const response = await contentService.getCategories()
    categories.value = response.data?.data || response.data || []
    categories.value.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  } catch (error) {
    console.error('카테고리 목록 조회 실패:', error)
    showNotification('카테고리 목록을 불러오는데 실패했습니다.', 'error')
    categories.value = []
  } finally {
    loading.value = false
  }
}

const handleAddCategory = async (categoryData) => {
  try {
    const data = {
      ...categoryData,
      sortOrder: categories.value.length + 1
    }
    await contentService.createCategory(data)
    await loadCategories()
    showAddForm.value = false
    showNotification('카테고리가 추가되었습니다.')
  } catch (error) {
    console.error('카테고리 추가 실패:', error)
    showNotification('카테고리 추가에 실패했습니다.', 'error')
  }
}

const handleUpdateCategory = async (id, updateData) => {
  try {
    await contentService.updateCategory(id, updateData)
    showNotification('카테고리가 수정되었습니다.')
  } catch (error) {
    console.error('카테고리 수정 실패:', error)
    showNotification('카테고리 수정에 실패했습니다.', 'error')
    throw error // 컴포넌트에서 원복 처리를 위해
  }
}

const handleDeleteCategory = async (id) => {
  try {
    await contentService.deleteCategory(id)
    await loadCategories()
    showNotification('카테고리가 삭제되었습니다.')
  } catch (error) {
    console.error('카테고리 삭제 실패:', error)
    showNotification('카테고리 삭제에 실패했습니다.', 'error')
  }
}

const handleReorderCategories = async (draggedId, targetOrder) => {
  try {
    await contentService.reorderCategory(draggedId, targetOrder)
    showNotification('카테고리 순서가 변경되었습니다.')
  } catch (error) {
    console.error('순서 변경 실패:', error)
    showNotification('순서 변경에 실패했습니다.', 'error')
    throw error // 컴포넌트에서 원복 처리를 위해
  }
}

// 🔥 새로 추가: 상태 업데이트 핸들러
const handleStatusUpdated = ({ categoryId, updatedData, immediate, correction, reverted }) => {
  console.log('📊 상태 업데이트 이벤트 수신:', { categoryId, updatedData, immediate, correction, reverted })

  // 해당 카테고리 찾기
  const categoryIndex = categories.value.findIndex(cat => cat.categoryId === categoryId)

  if (categoryIndex !== -1) {
    // 🔥 Vue의 반응성을 보장하기 위해 배열 전체를 새로 할당
    const newCategories = [...categories.value]
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      ...updatedData
    }
    categories.value = newCategories

    console.log('📊 카테고리 상태 업데이트 완료:', categories.value[categoryIndex])

    // nextTick을 사용해서 DOM 업데이트 후 통계 확인
    nextTick(() => {
      console.log('📊 업데이트된 통계:', {
        total: categories.value.length,
        active: activeCategories.value,
        inactive: inactiveCategories.value
      })
    })

    // 상태 메시지 출력
    if (immediate) {
      console.log('⚡ 즉시 업데이트 완료')
    } else if (correction) {
      console.log('🔧 API 응답에 따른 수정 완료')
    } else if (reverted) {
      console.log('↩️ 실패로 인한 원복 완료')
    }
  }
}

// 이벤트 핸들러
const openAddForm = () => {
  showAddForm.value = true
}

const closeAddForm = () => {
  showAddForm.value = false
}

// 라이프사이클
onMounted(() => {
  loadCategories()
})
</script>

<template>
  <div class="category-management">
    <!-- 헤더 -->
    <CategoryHeader @add-category="openAddForm" />

    <!-- 통계 - 자동 계산 방식으로 변경 -->
    <CategoryStats
        :data-source="categories"
        :auto-calculate="true"
        @stats-updated="(newStats) => console.log('📊 통계 업데이트:', newStats)"
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
        @add-category="openAddForm"
        @update-category="handleUpdateCategory"
        @delete-category="handleDeleteCategory"
        @reorder-categories="handleReorderCategories"
        @update-categories="categories = $event"
        @status-updated="handleStatusUpdated"
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