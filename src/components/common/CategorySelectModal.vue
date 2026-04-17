<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal-container" @click.stop>
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">카테고리 선택</h2>
          <button class="btn-close" @click="$emit('close')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="search-section">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="카테고리 검색..."
              @input="handleSearch"
            />
            <button v-if="searchQuery" class="btn-clear-search" @click="clearSearch">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="modal-content">
          <!-- 검색 결과 -->
          <div v-if="searchQuery && searchResults.length > 0" class="category-section">
            <h3 class="section-title">검색 결과</h3>
            <div class="category-list">
              <button
                v-for="category in searchResults"
                :key="category.categoryId"
                class="category-item"
                :class="{ active: selectedId === category.categoryId }"
                @click="selectCategory(category)"
              >
                <span class="category-path">{{ category.fullPath }}</span>
                <svg v-if="selectedId === category.categoryId" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 검색 결과 없음 -->
          <div v-else-if="searchQuery && searchResults.length === 0" class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <p>검색 결과가 없습니다</p>
          </div>

          <!-- 기본 화면 (검색 안 할 때) -->
          <template v-else>
            <!-- 최근 사용 카테고리 -->
            <div v-if="recentCategories.length > 0" class="category-section">
              <h3 class="section-title">
                <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                최근 사용
              </h3>
              <div class="category-chips">
                <button
                  v-for="category in recentCategories"
                  :key="category.categoryId"
                  class="category-chip"
                  :class="{ active: selectedId === category.categoryId, expanded: expandedParentId === category.categoryId }"
                  @click="handleRecentCategoryClick(category)"
                >
                  {{ category.categoryName }}
                  <svg v-if="getFullCategory(category)?.children?.length" class="chip-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- 인기 카테고리 -->
            <div v-if="popularCategories.length > 0" class="category-section">
              <h3 class="section-title">
                <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                인기 카테고리
              </h3>
              <div class="category-chips">
                <button
                  v-for="category in popularCategories"
                  :key="category.categoryId"
                  class="category-chip"
                  :class="{ active: selectedId === category.categoryId, expanded: expandedParentId === category.categoryId }"
                  @click="handleCategoryChipClick(category)"
                >
                  {{ category.categoryName }}
                  <svg v-if="hasChildren(category)" class="chip-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
              </div>
              <!-- 선택된 1뎁스의 하위 카테고리 표시 -->
              <div v-if="expandedPopularCategory" class="sub-category-inline">
                <button
                  class="sub-chip parent-chip"
                  :class="{ active: selectedId === expandedPopularCategory.categoryId }"
                  @click="selectCategory(expandedPopularCategory)"
                >
                  {{ expandedPopularCategory.categoryName }} 전체
                </button>
                <button
                  v-for="sub in expandedPopularCategory.children"
                  :key="sub.categoryId"
                  class="sub-chip"
                  :class="{ active: selectedId === sub.categoryId }"
                  @click="selectCategory(sub, expandedPopularCategory)"
                >
                  {{ sub.categoryName }}
                </button>
              </div>
            </div>

            <!-- 전체 카테고리 -->
            <div class="category-section">
              <h3 class="section-title">
                <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                전체 카테고리
              </h3>

              <div class="accordion-list">
                <div
                  v-for="parent in allCategories"
                  :key="parent.categoryId"
                  class="accordion-item"
                >
                  <button
                    class="accordion-header"
                    :class="{ expanded: expandedParentId === parent.categoryId }"
                    @click="toggleParent(parent.categoryId)"
                  >
                    <span class="parent-name">{{ parent.categoryName }}</span>
                    <span class="sub-count" v-if="parent.children?.length">{{ parent.children.length }}</span>
                    <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  <Transition name="accordion">
                    <div v-if="expandedParentId === parent.categoryId" class="accordion-content">
                      <!-- 부모 카테고리 자체 선택 -->
                      <button
                        class="sub-category-item parent-select"
                        :class="{ active: selectedId === parent.categoryId }"
                        @click="selectCategory(parent)"
                      >
                        <span>{{ parent.categoryName }} 전체</span>
                        <svg v-if="selectedId === parent.categoryId" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </button>

                      <!-- 하위 카테고리 -->
                      <button
                        v-for="sub in parent.children"
                        :key="sub.categoryId"
                        class="sub-category-item"
                        :class="{ active: selectedId === sub.categoryId }"
                        @click="selectCategory(sub, parent)"
                      >
                        <span>{{ sub.categoryName }}</span>
                        <svg v-if="selectedId === sub.categoryId" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </button>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-cancel" @click="$emit('close')">취소</button>
          <button class="btn-confirm" :disabled="!selectedId" @click="confirmSelection">
            선택 완료
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useCategoryCache } from '@/composables/useCategoryCache.js'

const {
  allCategories: cachedCategories,
  loadAllCategories,
  loadPopularCategories: loadPopularFromCache
} = useCategoryCache()

const props = defineProps({
  contentType: {
    type: String,
    default: 'FEED'
  },
  initialCategoryId: {
    type: [Number, String, null],
    default: null
  }
})

const emit = defineEmits(['select', 'close'])

const searchInputRef = ref(null)
const searchQuery = ref('')
const selectedId = ref(props.initialCategoryId)
const selectedCategory = ref(null)
const selectedParent = ref(null)
const expandedParentId = ref(null)

const allCategories = ref([])
const popularCategories = ref([])
const recentCategories = ref([])
const loading = ref(false)

// 로컬 스토리지 키
const RECENT_CATEGORIES_KEY = 'recent_categories'

// 검색 결과
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []

  const query = searchQuery.value.toLowerCase().trim()
  const results = []

  for (const parent of allCategories.value) {
    // 부모 카테고리 검색
    if (parent.categoryName.toLowerCase().includes(query)) {
      results.push({
        ...parent,
        fullPath: parent.categoryName
      })
    }

    // 하위 카테고리 검색
    if (parent.children) {
      for (const sub of parent.children) {
        if (sub.categoryName.toLowerCase().includes(query)) {
          results.push({
            ...sub,
            fullPath: `${parent.categoryName} > ${sub.categoryName}`,
            parent: parent
          })
        }
      }
    }
  }

  return results.slice(0, 20) // 최대 20개
})

// 전체 카테고리 로드 (캐시 사용)
const fetchAllCategories = async () => {
  try {
    await loadAllCategories()
    allCategories.value = cachedCategories.value
  } catch (error) {
    console.error('[CategorySelectModal] 카테고리 로드 실패:', error)
  }
}

// 인기 카테고리 로드 (캐시 사용)
const fetchPopularCategories = async () => {
  try {
    const data = await loadPopularFromCache(props.contentType, 8)
    popularCategories.value = data
  } catch (error) {
    console.warn('[CategorySelectModal] 인기 카테고리 로드 실패:', error)
  }
}

// 최근 사용 카테고리 로드
const loadRecentCategories = () => {
  try {
    const stored = localStorage.getItem(RECENT_CATEGORIES_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // contentType에 맞는 것만 필터링하고 최근 5개
      recentCategories.value = (parsed[props.contentType] || []).slice(0, 5)
    }
  } catch (error) {
    console.warn('[CategorySelectModal] 최근 카테고리 로드 실패:', error)
  }
}

// 최근 사용 카테고리 저장
const saveRecentCategory = (category) => {
  try {
    const stored = localStorage.getItem(RECENT_CATEGORIES_KEY)
    const data = stored ? JSON.parse(stored) : {}

    const list = data[props.contentType] || []

    // 중복 제거
    const filtered = list.filter(c => c.categoryId !== category.categoryId)

    // 맨 앞에 추가
    filtered.unshift({
      categoryId: category.categoryId,
      categoryName: category.categoryName
    })

    // 최대 10개 유지
    data[props.contentType] = filtered.slice(0, 10)

    localStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('[CategorySelectModal] 최근 카테고리 저장 실패:', error)
  }
}

const toggleParent = (parentId) => {
  expandedParentId.value = expandedParentId.value === parentId ? null : parentId
}

// 카테고리에 자식이 있는지 확인
const hasChildren = (category) => {
  return category.children && category.children.length > 0
}

// 인기/최근 카테고리의 펼쳐진 항목
const expandedPopularCategory = computed(() => {
  if (!expandedParentId.value) return null
  // 인기 카테고리에서 찾기
  const found = popularCategories.value.find(c => c.categoryId === expandedParentId.value)
  if (found && hasChildren(found)) return found
  // 최근 카테고리에서 찾기 (allCategories에서 children 정보 가져오기)
  const recent = recentCategories.value.find(c => c.categoryId === expandedParentId.value)
  if (recent) {
    const fullCategory = allCategories.value.find(c => c.categoryId === recent.categoryId)
    if (fullCategory && hasChildren(fullCategory)) return fullCategory
  }
  return null
})

// 인기/최근 카테고리 칩 클릭 핸들러
const handleCategoryChipClick = (category) => {
  // 자식이 있는 1뎁스 카테고리인 경우
  if (hasChildren(category)) {
    // 같은 카테고리 클릭 시 토글
    if (expandedParentId.value === category.categoryId) {
      expandedParentId.value = null
    } else {
      expandedParentId.value = category.categoryId
    }
  } else {
    // 자식이 없으면 바로 선택
    selectCategory(category)
  }
}

// 전체 카테고리에서 해당 카테고리 정보 가져오기 (children 포함)
const getFullCategory = (category) => {
  return allCategories.value.find(c => c.categoryId === category.categoryId)
}

// 최근 사용 카테고리 클릭 핸들러
const handleRecentCategoryClick = (category) => {
  const fullCategory = getFullCategory(category)
  if (fullCategory && hasChildren(fullCategory)) {
    // 같은 카테고리 클릭 시 토글
    if (expandedParentId.value === category.categoryId) {
      expandedParentId.value = null
    } else {
      expandedParentId.value = category.categoryId
    }
  } else {
    // 자식이 없으면 바로 선택
    selectCategory(category)
  }
}

const selectCategory = (category, parent = null) => {
  selectedId.value = category.categoryId
  selectedCategory.value = category
  selectedParent.value = parent
}

const confirmSelection = () => {
  if (!selectedCategory.value) return

  // 최근 사용에 저장
  saveRecentCategory(selectedCategory.value)

  emit('select', {
    categoryId: selectedCategory.value.categoryId,
    categoryDepth: selectedCategory.value.depth || (selectedParent.value ? 2 : 1),
    category: selectedCategory.value,
    parent: selectedParent.value
  })
}

const handleSearch = () => {
  // 검색시 아코디언 닫기
  expandedParentId.value = null
}

const clearSearch = () => {
  searchQuery.value = ''
  searchInputRef.value?.focus()
}

onMounted(async () => {
  loading.value = true

  await Promise.all([
    fetchAllCategories(),
    fetchPopularCategories()
  ])

  loadRecentCategories()

  // 초기값이 있으면 선택 상태로
  if (props.initialCategoryId) {
    for (const parent of allCategories.value) {
      if (parent.categoryId === props.initialCategoryId) {
        selectedCategory.value = parent
        break
      }
      if (parent.children) {
        const sub = parent.children.find(c => c.categoryId === props.initialCategoryId)
        if (sub) {
          selectedCategory.value = sub
          selectedParent.value = parent
          expandedParentId.value = parent.categoryId
          break
        }
      }
    }
  }

  loading.value = false

  // 검색창 포커스
  await nextTick()
  searchInputRef.value?.focus()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-container {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f2f2f7;
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: #111;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f2f7;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-close svg {
  width: 18px;
  height: 18px;
  color: #8e8e93;
}

.btn-close:hover {
  background: #e5e5ea;
  color: #3a3a3c;
}

/* Search */
.search-section {
  padding: 16px 24px;
  border-bottom: 1px solid #f2f2f7;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: #8e8e93;
}

.search-input {
  width: 100%;
  padding: 12px 44px;
  background: #f2f2f7;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: #111;
  outline: none;
  transition: all 0.15s;
}

.search-input:focus {
  background: #ffffff;
  box-shadow: 0 0 0 2px #9933EA;
}

.search-input::placeholder {
  color: #8e8e93;
}

.btn-clear-search {
  position: absolute;
  right: 10px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d1d1d6;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.btn-clear-search svg {
  width: 12px;
  height: 12px;
  color: #ffffff;
}

/* Content */
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.category-section {
  margin-bottom: 24px;
}

.category-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #8e8e93;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.title-icon {
  width: 14px;
  height: 14px;
}

/* Category Chips */
.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  background: #f2f2f7;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #3a3a3c;
  cursor: pointer;
  transition: all 0.15s;
}

.category-chip:hover {
  background: #e5e5ea;
}

.category-chip.active {
  background: #9933EA;
  color: #ffffff;
}

.category-chip.expanded {
  background: #3a3a3c;
  color: #ffffff;
}

.chip-arrow {
  width: 12px;
  height: 12px;
  margin-left: 4px;
  transition: transform 0.2s;
}

.category-chip.expanded .chip-arrow {
  transform: rotate(180deg);
}

/* 하위 카테고리 인라인 표시 */
.sub-category-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  padding: 12px;
  background: #f2f2f7;
  border-radius: 8px;
}

.sub-chip {
  padding: 6px 12px;
  background: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #3a3a3c;
  cursor: pointer;
  transition: all 0.15s;
}

.sub-chip:hover {
  background: #e5e5ea;
}

.sub-chip.active {
  background: #9933EA;
  color: #ffffff;
}

.sub-chip.parent-chip {
  background: transparent;
  color: #8e8e93;
  font-weight: 600;
}

.sub-chip.parent-chip:hover {
  background: #ffffff;
  color: #3a3a3c;
}

/* Category List (검색 결과) */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #f2f2f7;
  border: none;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}

.category-item:hover {
  background: #e5e5ea;
}

.category-item.active {
  background: #9933EA;
}

.category-path {
  font-size: 13px;
  font-weight: 600;
  color: #3a3a3c;
}

.category-item.active .category-path {
  color: #ffffff;
}

.check-icon {
  width: 18px;
  height: 18px;
  color: #ffffff;
}

/* Accordion */
.accordion-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.accordion-item {
  background: #f2f2f7;
  border-radius: 8px;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}

.accordion-header:hover {
  background: #e5e5ea;
}

.accordion-header.expanded {
  background: #e5e5ea;
}

.parent-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #3a3a3c;
}

.sub-count {
  font-size: 11px;
  font-weight: 600;
  color: #8e8e93;
  background: #ffffff;
  padding: 2px 8px;
  border-radius: 10px;
}

.accordion-icon {
  width: 16px;
  height: 16px;
  color: #8e8e93;
  transition: transform 0.2s;
}

.accordion-header.expanded .accordion-icon {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 6px;
  border-top: 1px solid #e5e5ea;
}

.sub-category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 13px;
  font-weight: 500;
  color: #3a3a3c;
}

.sub-category-item:hover {
  background: #ffffff;
}

.sub-category-item.active {
  background: #9933EA;
  color: #ffffff;
  font-weight: 600;
}

.sub-category-item.active .check-icon {
  color: #ffffff;
}

.sub-category-item.parent-select {
  font-weight: 600;
  color: #8e8e93;
  border-bottom: 1px solid #e5e5ea;
  border-radius: 6px 6px 0 0;
  margin-bottom: 4px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  width: 40px;
  height: 40px;
  color: #d1d1d6;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 14px;
  font-weight: 500;
  color: #8e8e93;
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #f2f2f7;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel {
  background: #f2f2f7;
  color: #3a3a3c;
}

.btn-cancel:hover {
  background: #e5e5ea;
}

.btn-confirm {
  background: #9933EA;
  color: #ffffff;
}

.btn-confirm:hover:not(:disabled) {
  background: #7c22ce;
}

.btn-confirm:disabled {
  background: #e5e5ea;
  color: #8e8e93;
  cursor: not-allowed;
}

/* Accordion Transition */
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
  max-height: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Mobile */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .modal-container {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 20px 20px 0 0;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .search-section {
    padding: 12px 20px;
  }

  .modal-content {
    padding: 12px 20px;
  }

  .modal-footer {
    padding: 12px 20px 24px;
  }
}
</style>
