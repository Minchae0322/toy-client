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

// 환경 변수 (템플릿에서 사용하기 위해 변수로 추출)
const isDev = import.meta.env.DEV

// 계산된 속성 - 자동으로 반응성 가짐
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
    console.log('📂 카테고리 목록 로딩 시작...')

    const response = await categoryService.getCategories()

    if (response.success && response.data) {
      categories.value = Array.isArray(response.data) ? response.data : []
      // 정렬 순서대로 정렬
      categories.value = categoryService.sortCategories(categories.value, 'sortOrder')
      console.log('✅ 카테고리 목록 로딩 완료:', categories.value.length, '개')
    } else {
      throw new Error(response.message || '카테고리 목록 조회 실패')
    }
  } catch (apiError) {
    console.error('❌ 카테고리 API 호출 실패:', apiError)
    error.value = apiError.message

    // 개발 환경에서 샘플 데이터 사용
    if (isDev) {
      console.log('🔄 개발 환경: 샘플 데이터 사용')
      const sampleData = categoryService.getSampleCategories()
      categories.value = sampleData.data || []
      showNotification('샘플 데이터로 로딩되었습니다', 'warning')
    } else {
      categories.value = []
      showNotification('카테고리 목록을 불러오는데 실패했습니다.', 'error')
    }
  } finally {
    loading.value = false
  }
}

const handleAddCategory = async (categoryData) => {
  try {
    console.log('📝 카테고리 추가 시작:', categoryData)

    // 정렬 순서 자동 설정
    const data = {
      ...categoryData,
      sortOrder: categories.value.length + 1,
      colorCode: categoryData.colorCode,
      categoryCode: categoryData.categoryCode
    }

    const response = await categoryService.createCategory(data)

    if (response.success) {
      await loadCategories() // 목록 새로고침
      showAddForm.value = false
      showNotification('카테고리가 추가되었습니다.')
      console.log('✅ 카테고리 추가 완료')
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
    console.log('📝 카테고리 수정 시작:', { categoryId, updateData })

    const response = await categoryService.updateCategory(categoryId, updateData)

    if (response.success) {
      // 로컬 데이터 업데이트
      const categoryIndex = categories.value.findIndex(cat => cat.categoryId === categoryId)
      if (categoryIndex !== -1) {
        categories.value[categoryIndex] = {
          ...categories.value[categoryIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      }

      showNotification('카테고리가 수정되었습니다.')
      console.log('✅ 카테고리 수정 완료')
    } else {
      throw new Error(response.message || '카테고리 수정 실패')
    }
  } catch (error) {
    console.error('❌ 카테고리 수정 실패:', error)
    showNotification(error.message || '카테고리 수정에 실패했습니다.', 'error')
    throw error // 컴포넌트에서 원복 처리를 위해
  }
}

const handleDeleteCategory = async (categoryId) => {
  try {
    console.log('🗑️ 카테고리 삭제 시작:', categoryId)

    const response = await categoryService.deleteCategory(categoryId)

    if (response.success) {
      await loadCategories() // 목록 새로고침
      showNotification('카테고리가 삭제되었습니다.')
      console.log('✅ 카테고리 삭제 완료')
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
    console.log('🔄 카테고리 순서 변경 시작:', { draggedId, targetOrder })

    const response = await categoryService.updateCategoryOrder(draggedId, targetOrder)

    if (response.success) {
      // 로컬에서 순서 업데이트
      const draggedCategory = categories.value.find(cat => cat.categoryId === draggedId)
      if (draggedCategory) {
        draggedCategory.sortOrder = targetOrder
        categories.value = categoryService.sortCategories(categories.value, 'sortOrder')
      }

      showNotification('카테고리 순서가 변경되었습니다.')
      console.log('✅ 순서 변경 완료')
    } else {
      throw new Error(response.message || '순서 변경 실패')
    }
  } catch (error) {
    console.error('❌ 순서 변경 실패:', error)
    showNotification(error.message || '순서 변경에 실패했습니다.', 'error')
    throw error // 컴포넌트에서 원복 처리를 위해
  }
}

const handleToggleStatus = async (categoryId, isActive) => {
  try {
    console.log('🔄 카테고리 상태 변경 시작:', { categoryId, isActive })

    const response = await categoryService.toggleCategoryStatus(categoryId, isActive)

    if (response.success) {
      // 로컬 데이터 업데이트
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
      console.log('✅ 카테고리 상태 변경 완료')
    } else {
      throw new Error(response.message || '상태 변경 실패')
    }
  } catch (error) {
    console.error('❌ 카테고리 상태 변경 실패:', error)
    showNotification(error.message || '상태 변경에 실패했습니다.', 'error')
    throw error
  }
}

// 상태 업데이트 핸들러 (기존 로직 유지)
const handleStatusUpdated = ({ categoryId, updatedData, immediate, correction, reverted }) => {
  console.log('📊 상태 업데이트 이벤트 수신:', { categoryId, updatedData, immediate, correction, reverted })

  // 해당 카테고리 찾기
  const categoryIndex = categories.value.findIndex(cat => cat.categoryId === categoryId)

  if (categoryIndex !== -1) {
    // Vue의 반응성을 보장하기 위해 배열 전체를 새로 할당
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
        inactive: inactiveCategories.value,
        totalProducts: totalProducts.value
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

// 통계 데이터 조회
const loadStats = async () => {
  try {
    const response = await categoryService.getAllCategoriesStats()
    if (response.success) {
      console.log('📊 카테고리 통계:', response.data)
      return response.data
    }
  } catch (error) {
    console.error('❌ 통계 조회 실패:', error)
  }
  return null
}

// 이벤트 핸들러
const openAddForm = () => {
  showAddForm.value = true
}

const closeAddForm = () => {
  showAddForm.value = false
}

// 카테고리 검색 및 필터링
const searchCategories = (keyword) => {
  if (!keyword) {
    return categories.value
  }
  return categoryService.filterCategories(categories.value, { keyword })
}

// 연결 테스트
const testConnection = async () => {
  try {
    const isConnected = await categoryService.testConnection()
    if (isConnected) {
      showNotification('카테고리 서비스 연결 성공', 'success')
    } else {
      showNotification('카테고리 서비스 연결 실패', 'error')
    }
  } catch (error) {
    showNotification('연결 테스트 중 오류 발생', 'error')
  }
}

// 디버깅 정보 출력
const debugCategoryService = () => {
  categoryService.debugCategoryStatus()
}

// 라이프사이클
onMounted(async () => {
  console.log('🚀 카테고리 관리 컴포넌트 마운트됨')
  await loadCategories()

  // 개발 환경에서 디버깅 정보 출력
  if (isDev) {
    debugCategoryService()
  }
})

// 컴포넌트 외부로 노출할 메서드들 (템플릿 참조용)
defineExpose({
  loadCategories,
  testConnection,
  debugCategoryService,
  searchCategories
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
        :loading="loading"
        :error="error"
        @stats-updated="(newStats) => console.log('📊 통계 업데이트:', newStats)"
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

    <!-- 개발 환경 디버그 패널 -->
    <div v-if="isDev" class="debug-panel">
      <h3>🔧 개발자 도구</h3>
      <div class="debug-buttons">
        <button @click="testConnection" class="debug-btn">연결 테스트</button>
        <button @click="debugCategoryService" class="debug-btn">서비스 상태</button>
        <button @click="loadCategories" class="debug-btn">데이터 새로고침</button>
      </div>
      <div class="debug-info">
        <p>총 카테고리: {{ categories.length }}</p>
        <p>활성 카테고리: {{ activeCategories }}</p>
        <p>비활성 카테고리: {{ inactiveCategories }}</p>
        <p>총 상품 수: {{ totalProducts }}</p>
      </div>
    </div>

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

/* 개발 환경 디버그 패널 */
.debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 300px;
}

.debug-panel h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #334155;
}

.debug-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.debug-btn {
  padding: 4px 8px;
  background: #e2e8f0;
  border: 1px solid #cbd5e0;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.debug-btn:hover {
  background: #cbd5e0;
}

.debug-info {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.debug-info p {
  margin: 2px 0;
}

/* 에러 상태 스타일 */
.error-state {
  padding: 20px;
  text-align: center;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin: 20px 0;
}

/* 로딩 상태 스타일 */
.loading-state {
  padding: 20px;
  text-align: center;
  color: #6b7280;
}

/* 빈 상태 스타일 */
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #6b7280;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-state p {
  margin: 0 0 16px 0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .debug-panel {
    bottom: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .debug-buttons {
    justify-content: center;
  }
}

/* 다크 모드 지원 (선택사항) */
@media (prefers-color-scheme: dark) {
  .category-management {
    background-color: #111827;
    color: #f9fafb;
  }

  .debug-panel {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .debug-btn {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .debug-btn:hover {
    background: #4b5563;
  }
}
</style>