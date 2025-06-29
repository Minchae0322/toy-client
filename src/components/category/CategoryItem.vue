<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { contentService } from '@/api/axios.js'

const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  isDragging: {
    type: Boolean,
    default: false
  },
  isDragOver: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'drag-start',
  'drag-end',
  'drag-enter',
  'drag-leave',
  'drop',
  'update',
  'delete',
  'status-updated'
])

const editingId = ref(null)
const newKeyword = ref('')
const editKeywords = ref([])

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatKeywords = (keywords) => {
  if (Array.isArray(keywords)) {
    return keywords.join(', ')
  }
  return keywords || ''
}

// 로컬 상태로 isActive 관리 - 초기값을 명확히 설정
const localIsActive = ref(Boolean(props.category?.isActive))

// props 변경 감지 및 동기화 - deep watch 제거하고 단순화
watch(() => props.category?.isActive, (newValue) => {
  console.log('👀 props.category.isActive 변경:', newValue)
  if (newValue !== undefined) {
    const boolValue = Boolean(newValue)
    if (boolValue !== localIsActive.value) {
      localIsActive.value = boolValue
      console.log('👀 localIsActive 동기화:', localIsActive.value)
    }
  }
})

// 직접 API 호출하는 함수 - 최적화
const toggleActive = async () => {
  console.log('🔍 === toggleActive 시작 ===')
  console.log('🔍 현재 localIsActive:', localIsActive.value)
  console.log('🔍 props.category.isActive:', props.category?.isActive)

  const categoryId = props.category?.categoryId
  if (!categoryId) {
    console.error('❌ categoryId가 없습니다:', props.category)
    alert('카테고리 ID를 찾을 수 없습니다.')
    return
  }

  // 낙관적 업데이트 - 즉시 UI 변경
  const previousValue = localIsActive.value
  localIsActive.value = !localIsActive.value
  console.log('🔄 낙관적 업데이트:', localIsActive.value)

  try {
    console.log('🚀 API 호출 시작 - toggleCategoryStatus:', categoryId)
    const response = await contentService.toggleCategoryStatus(categoryId)
    console.log('🚀 API 응답:', response)

    if (response && response.data) {
      const updatedCategory = response.data

      // API 응답에서 실제 상태값 추출
      let actualStatus = updatedCategory.isActive
      if (actualStatus === undefined) {
        actualStatus = updatedCategory.active || updatedCategory.status || updatedCategory.enabled
      }

      if (actualStatus !== undefined) {
        const finalStatus = Boolean(actualStatus)

        // API 응답과 낙관적 업데이트가 다른 경우 수정
        if (finalStatus !== localIsActive.value) {
          console.log('⚠️ API 응답과 낙관적 업데이트 불일치, 수정:', finalStatus)
          localIsActive.value = finalStatus
        }

        // DOM 업데이트 보장
        await nextTick()

        // 부모 컴포넌트에 상태 전달
        const correctedData = {
          ...updatedCategory,
          isActive: finalStatus
        }

        emit('status-updated', {
          categoryId: categoryId,
          updatedData: correctedData
        })

        const statusText = finalStatus ? '활성화' : '비활성화'
        console.log(`✅ 카테고리가 ${statusText}되었습니다.`)

      } else {
        console.log('⚠️ API 응답에서 상태값을 찾을 수 없음')
        // 낙관적 업데이트 유지
      }
    }

  } catch (error) {
    // 실패 시 원래 상태로 복구
    console.error('🚀 상태 변경 실패:', error)
    localIsActive.value = previousValue
    alert('상태 변경에 실패했습니다.')
  }

  console.log('🔍 === toggleActive 완료, 최종 상태:', localIsActive.value, '===')
}

const handleDragStart = (e) => {
  emit('drag-start', props.category)
  e.target.style.opacity = '0.5'
}

const handleDragEnd = (e) => {
  e.target.style.opacity = '1'
  emit('drag-end')
}

const handleDragOver = (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

const handleDragEnter = (e) => {
  e.preventDefault()
  emit('drag-enter', props.index)
}

const handleDragLeave = (e) => {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    emit('drag-leave')
  }
}

const handleDrop = (e) => {
  e.preventDefault()
  emit('drop', props.category, props.index)
}

const startEdit = () => {
  editingId.value = props.category.categoryId

  // 원본 데이터 백업
  props.category.originalName = props.category.categoryName
  props.category.originalDescription = props.category.description

  // 키워드 편집을 위한 복사
  const keywords = props.category.keywords
  if (Array.isArray(keywords)) {
    editKeywords.value = [...keywords]
  } else if (typeof keywords === 'string') {
    editKeywords.value = keywords.split(',').map(k => k.trim()).filter(k => k)
  } else {
    editKeywords.value = []
  }
  newKeyword.value = ''
}

const saveEdit = () => {
  // 키워드 변경사항 저장
  if (editKeywords.value.length > 0 || props.category.keywords) {
    handleUpdate('keywords', editKeywords.value)
  }
  editingId.value = null
  editKeywords.value = []
  newKeyword.value = ''
}

const cancelEdit = () => {
  editingId.value = null
  editKeywords.value = []
  newKeyword.value = ''
  // 원래 값으로 복원
  const category = props.category
  if (category.originalName) {
    category.categoryName = category.originalName
    delete category.originalName
  }
  if (category.originalDescription !== undefined) {
    category.description = category.originalDescription
    delete category.originalDescription
  }
}

const addKeyword = () => {
  const keyword = newKeyword.value.trim()
  if (keyword && !editKeywords.value.includes(keyword) && editKeywords.value.length < 10) {
    editKeywords.value.push(keyword)
    newKeyword.value = ''
  }
}

const removeKeyword = (index) => {
  editKeywords.value.splice(index, 1)
}

const handleUpdate = (field, value) => {
  emit('update', props.category.categoryId, field, value)
}

const handleDelete = () => {
  if (confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
    emit('delete', props.category.categoryId)
  }
}

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  console.log('🔵 CategoryItem 마운트됨')
  console.log('🔵 전체 category 객체:', props.category)
  console.log('🔵 categoryId:', props.category?.categoryId)
  console.log('🔵 초기 isActive:', props.category?.isActive)

  // 초기 상태 설정
  localIsActive.value = Boolean(props.category?.isActive)
  console.log('🔵 초기 localIsActive 설정:', localIsActive.value)
})
</script>

<template>
  <div
      class="category-item"
      :class="{
      'dragging': isDragging,
      'drag-over': isDragOver
    }"
      draggable="true"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
  >
    <div class="category-content">
      <!-- 드래그 핸들 (데스크톱에서만 표시) -->
      <div class="drag-handle desktop-only">
        <span class="drag-dots">⋮⋮</span>
      </div>

      <!-- 순서 -->
      <div class="category-order">{{ category.sortOrder || index + 1 }}</div>

      <!-- 카테고리 정보 -->
      <div class="category-info">
        <div class="category-main">
          <input
              v-if="editingId === category.categoryId"
              v-model="category.categoryName"
              @blur="handleUpdate('categoryName', category.categoryName)"
              @keyup.enter="saveEdit"
              class="edit-input"
              maxlength="100"
          />
          <h3 v-else class="category-name">{{ category.categoryName }}</h3>
        </div>

        <div class="category-meta">
          <!-- 설명 편집 -->
          <div v-if="editingId === category.categoryId" class="edit-description">
            <textarea
                v-model="category.description"
                @blur="handleUpdate('description', category.description)"
                placeholder="카테고리 설명"
                class="edit-textarea"
                maxlength="500"
                rows="2"
            ></textarea>
          </div>
          <span v-else-if="category.description" class="meta-item">{{ category.description }}</span>

          <!-- 키워드 편집 -->
          <div v-if="editingId === category.categoryId" class="edit-keywords">
            <div class="keywords-input-wrapper">
              <input
                  v-model="newKeyword"
                  @keyup.enter="addKeyword"
                  placeholder="키워드 추가"
                  class="keyword-input"
                  maxlength="20"
              />
              <button @click="addKeyword" class="add-keyword-btn" type="button">추가</button>
            </div>
            <div v-if="editKeywords.length > 0" class="keywords-list">
              <span
                  v-for="(keyword, index) in editKeywords"
                  :key="index"
                  class="keyword-tag"
              >
                {{ keyword }}
                <button @click="removeKeyword(index)" class="remove-keyword" type="button">×</button>
              </span>
            </div>
          </div>
          <span v-else-if="category.keywords" class="meta-item">키워드: {{ formatKeywords(category.keywords) }}</span>

          <div class="meta-dates">
            <span class="meta-item">생성: {{ formatDate(category.createdAt) }}</span>
            <span v-if="category.updatedAt" class="meta-item">수정: {{ formatDate(category.updatedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 상태 및 액션 -->
      <div class="category-actions-wrapper">
        <!-- 상태 -->
        <div class="category-status">
          <button
              @click="toggleActive"
              class="status-button"
              :class="{ 'active': localIsActive, 'inactive': !localIsActive }"
              :key="`status-${localIsActive}`"
          >
            <span class="status-icon">{{ localIsActive ? '👁️' : '🚫' }}</span>
            <span class="status-text">{{ localIsActive ? '활성' : '비활성' }}</span>
          </button>
        </div>

        <!-- 액션 버튼 -->
        <div class="category-actions">
          <template v-if="editingId === category.categoryId">
            <button
                @click="saveEdit"
                class="action-button save"
                title="저장"
            >
              <span class="button-icon">✓</span>
              <span class="button-text">저장</span>
            </button>
            <button
                @click="cancelEdit"
                class="action-button cancel"
                title="취소"
            >
              <span class="button-icon">✕</span>
              <span class="button-text">취소</span>
            </button>
          </template>
          <template v-else>
            <button
                @click="startEdit"
                class="action-button edit"
                title="수정"
            >
              <span class="button-icon">✎</span>
              <span class="button-text">수정</span>
            </button>
            <button
                @click="handleDelete"
                class="action-button delete"
                title="삭제"
            >
              <span class="button-icon">🗑</span>
              <span class="button-text">삭제</span>
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-item {
  border-bottom: 1px solid #e5e7eb;
  padding: 12px;
  transition: all 0.2s ease;
  cursor: move;
  position: relative;
}

.category-item:hover {
  background: #f9fafb;
}

.category-item.dragging {
  opacity: 0.6;
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  background: white;
}

.category-item.drag-over {
  border-top: 3px solid #10b981;
  background: #f0fdf4;
}

.category-item:last-child {
  border-bottom: none;
}

.category-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: move;
  user-select: none;
  border-radius: 4px;
  transition: background-color 0.2s;
  margin-top: 2px;
}

.drag-handle:hover {
  background: #f3f4f6;
}

.drag-dots {
  color: #9ca3af;
  font-size: 14px;
  line-height: 1;
}

.drag-handle:hover .drag-dots {
  color: #6b7280;
}

.category-order {
  width: 24px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 4px;
  padding: 2px 4px;
  margin-top: 2px;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-main {
  margin-bottom: 6px;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.edit-input {
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  background: white;
  width: 100%;
}

.edit-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.category-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-dates {
  display: flex;
  gap: 8px;
}

.meta-item {
  font-size: 11px;
  color: #6b7280;
}

.category-actions-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.category-status {
  display: flex;
  align-items: center;
}

.status-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-width: 80px;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.status-button.active {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-button.active:hover {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
}

.status-button.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-button.inactive:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.category-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  cursor: pointer;
  padding: 8px 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.action-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button.save {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border-color: rgba(34, 197, 94, 0.2);
}

.action-button.save:hover {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.2);
}

.action-button.cancel {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border-color: rgba(107, 114, 128, 0.2);
}

.action-button.cancel:hover {
  background: rgba(107, 114, 128, 0.15);
  border-color: rgba(107, 114, 128, 0.3);
  box-shadow: 0 4px 16px rgba(107, 114, 128, 0.2);
}

.action-button.edit {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.2);
}

.action-button.edit:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
}

.action-button.delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

.action-button.delete:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
}

.button-icon {
  font-size: 14px;
  font-weight: bold;
}

.button-text {
  font-size: 12px;
  letter-spacing: 0.025em;
}

/* 편집 모드 스타일 */
.edit-textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  background: white;
  resize: vertical;
  min-height: 40px;
}

.edit-textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.edit-keywords {
  margin-top: 4px;
}

.keywords-input-wrapper {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
}

.keyword-input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 3px 6px;
  font-size: 11px;
}

.keyword-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.add-keyword-btn {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.add-keyword-btn:hover {
  background: #059669;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.keyword-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
}

.remove-keyword {
  background: none;
  border: none;
  color: #1e40af;
  cursor: pointer;
  font-size: 10px;
  padding: 0;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.remove-keyword:hover {
  background: rgba(30, 64, 175, 0.1);
}

.edit-description {
  margin-bottom: 4px;
}

/* 모바일 최적화 */
@media (max-width: 640px) {
  .category-item {
    padding: 12px;
    cursor: default;
    border-radius: 12px;
    margin-bottom: 8px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .desktop-only {
    display: none;
  }

  .category-content {
    gap: 10px;
  }

  .category-order {
    width: 24px;
    font-size: 11px;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  }

  .category-name {
    font-size: 14px;
  }

  .category-actions-wrapper {
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .category-actions {
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }

  .action-button {
    width: 100%;
    min-width: auto;
    padding: 10px;
    justify-content: center;
  }

  .status-text {
    display: inline;
  }

  .meta-dates {
    flex-direction: column;
    gap: 2px;
  }

  .meta-item {
    font-size: 10px;
  }

  .keywords-input-wrapper {
    flex-direction: column;
    gap: 6px;
  }

  .add-keyword-btn {
    width: 100%;
  }
}

/* 태블릿 */
@media (min-width: 768px) and (max-width: 1023px) {
  .category-item {
    padding: 14px;
  }

  .category-content {
    gap: 10px;
  }

  .category-order {
    width: 28px;
  }

  .category-name {
    font-size: 15px;
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .category-item {
    padding: 20px 24px;
    border-radius: 0;
    margin-bottom: 0;
  }

  .category-content {
    gap: 20px;
  }

  .category-order {
    width: 36px;
    font-size: 14px;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  }

  .category-name {
    font-size: 16px;
  }

  .meta-item {
    font-size: 13px;
  }

  .status-button {
    font-size: 12px;
    padding: 8px 14px;
    min-width: 80px;
  }

  .action-button {
    min-width: 75px;
    padding: 10px 14px;
    font-size: 13px;
  }

  .button-icon {
    font-size: 16px;
  }

  .button-text {
    font-size: 12px;
  }
}
</style>