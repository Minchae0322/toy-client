<script setup>
import {ref, computed, onMounted} from 'vue'
import {categoryService} from '@/services/CategoryService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import CategoryHeader from '@/components/category/CategoryHeader.vue'
import CategoryStats from '@/components/category/CategoryStats.vue'
import CategoryForm from '@/components/category/CategoryForm.vue'
import CategoryList from '@/components/category/CategoryList.vue'
import NotificationToast from '@/components/category/NotificationToast.vue'

const { open } = useConfirmDialog()

const categories = ref([])
const flatCategories = ref([])
const loading = ref(false)
const showAddForm = ref(false)
const selectedParentId = ref(null)
const notification = ref({show: false, message: '', type: 'success'})
const error = ref(null)

// 카테고리 타입 탭 (PRODUCT | FEED)
const CATEGORY_TYPES = [
  { code: 'PRODUCT', label: '제품', emoji: '🛍️' },
  { code: 'FEED', label: '피드', emoji: '📷' },
]
const selectedType = ref('PRODUCT')

// type별 트리 캐시 (탭별 카운트 표시 위해 양쪽 동시 보관)
const categoriesByType = ref({ PRODUCT: [], FEED: [] })
const flatCategoriesByType = ref({ PRODUCT: [], FEED: [] })

// 백엔드는 categoryType을 객체 { title, description } 또는 문자열로 응답할 수 있음 → 코드만 추출
// (구버전 호환을 위해 type 필드도 fallback)
const getTypeCode = (cat) => {
  const t = cat?.categoryType ?? cat?.type
  if (!t) return 'PRODUCT'
  return typeof t === 'string' ? t : (t.title || t.code || 'PRODUCT')
}

// 카테고리 트리를 sortOrder ASC로 재귀 정렬 (children도 함께)
const sortRecursive = (cats) => {
  if (!Array.isArray(cats)) return []
  return [...cats]
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(c => ({ ...c, children: sortRecursive(c.children) }))
}

// 트리를 평탄화하여 단일 배열로 (depth 정보 포함)
const flattenTree = (cats, depth = 0) => {
  if (!Array.isArray(cats)) return []
  const out = []
  for (const c of cats) {
    out.push({ ...c, depth })
    if (Array.isArray(c.children) && c.children.length > 0) {
      out.push(...flattenTree(c.children, depth + 1))
    }
  }
  return out
}

// 화면 표시용 — 현재 선택된 탭의 type
const filteredCategories = computed(() => categoriesByType.value[selectedType.value] || [])
const filteredFlatCategories = computed(() => flatCategoriesByType.value[selectedType.value] || [])

const activeCategories = computed(() =>
    filteredFlatCategories.value.filter(c => c.isActive).length
)

const inactiveCategories = computed(() =>
    filteredFlatCategories.value.filter(c => !c.isActive).length
)

const isEmpty = computed(() => filteredCategories.value.length === 0)

const showNotification = (message, type = 'success') => {
  notification.value = {show: true, message, type}
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// 단일 type의 카테고리를 서버에서 받아 트리 + 정렬 + flat 형태로 변환
const fetchCategoriesByType = async (type) => {
  const response = await categoryService.getCategories({ categoryType: type })
  if (!(response.success && response.data)) {
    throw new Error(response.message || `카테고리 목록 조회 실패 (categoryType=${type})`)
  }
  const data = Array.isArray(response.data) ? response.data : []
  const hasParentId = data.some(cat => cat.parentId !== null && cat.parentId !== undefined)
  // 서버가 이미 children을 채워 보낸 경우 그대로 쓰고, flat 응답이면 트리로 빌드
  const tree = hasParentId ? categoryService.buildCategoryTree(data) : data
  const sorted = sortRecursive(tree)
  const flat = flattenTree(sorted)
  return { tree: sorted, flat }
}

const loadCategories = async () => {
  loading.value = true
  error.value = null

  try {
    // 양쪽 type을 병렬로 받아와 탭별 카운트 표시까지 한 번에 처리
    const [productResult, feedResult] = await Promise.all([
      fetchCategoriesByType('PRODUCT'),
      fetchCategoriesByType('FEED'),
    ])

    categoriesByType.value = {
      PRODUCT: productResult.tree,
      FEED: feedResult.tree,
    }
    flatCategoriesByType.value = {
      PRODUCT: productResult.flat,
      FEED: feedResult.flat,
    }

    // 레거시 ref 동기화 (다른 곳에서 직접 참조할 경우 대비)
    categories.value = filteredCategories.value
    flatCategories.value = filteredFlatCategories.value
  } catch (apiError) {
    console.error('❌ 카테고리 로딩 에러:', apiError)
    error.value = apiError.message
    categoriesByType.value = { PRODUCT: [], FEED: [] }
    flatCategoriesByType.value = { PRODUCT: [], FEED: [] }
    categories.value = []
    flatCategories.value = []
    showNotification('카테고리 목록을 불러오는데 실패했습니다.', 'error')
  } finally {
    loading.value = false
  }
}

const handleAddCategory = async (categoryData) => {
  try {
    // 하위 카테고리는 부모의 categoryType 상속, 최상위는 폼에서 받은 type 사용
    // (서버 응답의 categoryType은 객체일 수 있어 getTypeCode로 코드만 추출하여 전송)
    let categoryType = categoryData.categoryType || categoryData.type || selectedType.value
    if (categoryData.parentId) {
      const parent = flatCategories.value.find(c => c.categoryId === categoryData.parentId)
      if (parent) categoryType = getTypeCode(parent)
    }
    // type 키는 사용 안 함 — categoryType 으로만 전송
    const { type: _legacyType, ...rest } = categoryData
    const payload = { ...rest, categoryType }
    const response = await categoryService.createCategory(payload)

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
      const confirmed = await open({
        type: 'danger',
        title: '카테고리 삭제',
        message: `이 카테고리에는 ${descendants.length}개의 하위 카테고리가 있습니다.\n하위 카테고리도 함께 삭제됩니다. 계속하시겠습니까?`
      })
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

      <!-- 카테고리 타입 탭 -->
      <div class="type-tabs" role="tablist">
        <button
            v-for="t in CATEGORY_TYPES"
            :key="t.code"
            class="type-tab"
            :class="{ active: selectedType === t.code }"
            role="tab"
            :aria-selected="selectedType === t.code"
            @click="selectedType = t.code"
        >
          <span class="type-emoji">{{ t.emoji }}</span>
          <span class="type-label">{{ t.label }}</span>
          <span class="type-count">{{ flatCategoriesByType[t.code]?.length || 0 }}</span>
        </button>
      </div>

      <CategoryStats
          :data-source="filteredFlatCategories"
          :auto-calculate="true"
          :loading="loading"
          :error="error"
      />

      <CategoryForm
          v-if="showAddForm"
          :parent-id="selectedParentId"
          :categories="filteredFlatCategories"
          :default-type="selectedType"
          @submit="handleAddCategory"
          @cancel="closeAddForm"
      />

      <CategoryList
          :categories="filteredCategories"
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
  background: var(--bg-base);
  padding: 0;
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* 타입 탭 */
.type-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding: 6px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  width: fit-content;
}
.type-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text-500);
  cursor: pointer;
  transition: all 0.15s ease;
}
.type-tab:hover {
  background: var(--border-default);
  color: var(--text-primary);
}
.type-tab.active {
  background: var(--c-brand);
  color: #fff;
}
.type-tab.active:hover {
  background: var(--c-brand);
}
.type-emoji {
  font-size: 16px;
  line-height: 1;
}
.type-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: rgba(0, 0, 0, 0.08);
  color: inherit;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.type-tab.active .type-count {
  background: rgba(255, 255, 255, 0.25);
}

@media (max-width: 640px) {
  .type-tabs {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .type-tabs::-webkit-scrollbar { display: none; }
  .type-tab { flex-shrink: 0; padding: 7px 12px; font-size: 13px; }
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