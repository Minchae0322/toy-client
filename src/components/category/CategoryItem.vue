<!-- CategoryItem.vue -->
<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { categoryService } from '@/services/CategoryService.js'

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
const showConfirmModal = ref(false)

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatKeywords = (keywords) => {
  if (Array.isArray(keywords)) {
    return keywords.join(', ')
  }
  return keywords || ''
}

const localIsActive = ref(Boolean(props.category?.isActive))

watch(() => props.category?.isActive, (newValue) => {
  if (newValue !== undefined) {
    const boolValue = Boolean(newValue)
    if (boolValue !== localIsActive.value) {
      localIsActive.value = boolValue
    }
  }
})

const requestToggleActive = () => {
  showConfirmModal.value = true
}

const confirmToggleActive = () => {
  showConfirmModal.value = false
  executeToggleActive()
}

const cancelToggleActive = () => {
  showConfirmModal.value = false
}

const executeToggleActive = async () => {
  const categoryId = props.category?.categoryId
  if (!categoryId) {
    alert('카테고리 ID를 찾을 수 없습니다.')
    return
  }

  const previousValue = localIsActive.value
  localIsActive.value = !localIsActive.value

  const updatedCategoryData = {
    ...props.category,
    isActive: localIsActive.value
  }

  emit('status-updated', {
    categoryId: categoryId,
    updatedData: updatedCategoryData,
    immediate: true
  })

  try {
    const response = await categoryService.toggleCategoryStatus(categoryId)

    if (response && response.data) {
      const updatedCategory = response.data
      let actualStatus = updatedCategory.isActive

      if (actualStatus === undefined) {
        actualStatus = updatedCategory.active || updatedCategory.status || updatedCategory.enabled
      }

      if (actualStatus !== undefined) {
        const finalStatus = Boolean(actualStatus)

        if (finalStatus !== localIsActive.value) {
          localIsActive.value = finalStatus

          const correctedData = {
            ...updatedCategory,
            isActive: finalStatus
          }

          emit('status-updated', {
            categoryId: categoryId,
            updatedData: correctedData,
            correction: true
          })
        }

        await nextTick()
      }
    }
  } catch (error) {
    console.error('상태 변경 실패:', error)
    localIsActive.value = previousValue

    const revertedData = {
      ...props.category,
      isActive: previousValue
    }

    emit('status-updated', {
      categoryId: categoryId,
      updatedData: revertedData,
      reverted: true
    })

    alert('상태 변경에 실패했습니다.')
  }
}

const handleDragStart = (e) => {
  emit('drag-start', props.category)
  e.currentTarget.classList.add('dragging')
}

const handleDragEnd = (e) => {
  e.currentTarget.classList.remove('dragging')
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
  props.category.originalName = props.category.categoryName
  props.category.originalDescription = props.category.description

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

onMounted(() => {
  localIsActive.value = Boolean(props.category?.isActive)
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
    <div class="item-card">
      <!-- 드래그 핸들 -->
      <div class="drag-handle">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="6" cy="4" r="1" fill="currentColor"/>
          <circle cx="10" cy="4" r="1" fill="currentColor"/>
          <circle cx="6" cy="8" r="1" fill="currentColor"/>
          <circle cx="10" cy="8" r="1" fill="currentColor"/>
          <circle cx="6" cy="12" r="1" fill="currentColor"/>
          <circle cx="10" cy="12" r="1" fill="currentColor"/>
        </svg>
      </div>

      <!-- 순서 -->
      <div class="order-number">{{ category.sortOrder || index + 1 }}</div>

      <!-- 컨텐츠 -->
      <div class="item-content">
        <div class="content-header">
          <input
              v-if="editingId === category.categoryId"
              v-model="category.categoryName"
              @blur="handleUpdate('categoryName', category.categoryName)"
              @keyup.enter="saveEdit"
              class="edit-input"
              maxlength="100"
          />
          <h3 v-else class="category-name">{{ category.categoryName }}</h3>

          <!-- 상태 토글 -->
          <button
              @click="requestToggleActive"
              class="status-badge"
              :class="{ active: localIsActive }"
          >
            <span class="status-dot"></span>
            {{ localIsActive ? '활성' : '비활성' }}
          </button>
        </div>

        <!-- 설명 -->
        <div v-if="editingId === category.categoryId" class="edit-section">
          <textarea
              v-model="category.description"
              @blur="handleUpdate('description', category.description)"
              placeholder="설명"
              class="edit-textarea"
              maxlength="500"
              rows="2"
          ></textarea>
        </div>
        <p v-else-if="category.description" class="category-desc">
          {{ category.description }}
        </p>

        <!-- 키워드 -->
        <div v-if="editingId === category.categoryId" class="keywords-edit">
          <div class="keyword-input-row">
            <input
                v-model="newKeyword"
                @keyup.enter="addKeyword"
                placeholder="키워드"
                class="keyword-input"
                maxlength="20"
            />
            <button @click="addKeyword" class="keyword-add">+</button>
          </div>
          <div v-if="editKeywords.length > 0" class="keyword-list">
            <span v-for="(keyword, idx) in editKeywords" :key="idx" class="keyword-tag">
              {{ keyword }}
              <button @click="removeKeyword(idx)" class="tag-remove">×</button>
            </span>
          </div>
        </div>
        <div v-else-if="category.keywords" class="keywords">
          <span v-for="(keyword, idx) in (Array.isArray(category.keywords) ? category.keywords : category.keywords.split(','))"
                :key="idx"
                class="keyword-chip">
            {{ keyword.trim() }}
          </span>
        </div>

        <!-- 날짜 -->
        <div class="meta-row">
          <span class="meta-item">생성: {{ formatDate(category.createdAt) }}</span>
          <span v-if="category.updatedAt" class="meta-item">수정: {{ formatDate(category.updatedAt) }}</span>
        </div>
      </div>

      <!-- 액션 -->
      <div class="item-actions">
        <template v-if="editingId === category.categoryId">
          <button @click="saveEdit" class="action-btn save" title="저장">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <button @click="cancelEdit" class="action-btn cancel" title="취소">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </template>
        <template v-else>
          <button @click="startEdit" class="action-btn edit" title="수정">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.333 2A1.886 1.886 0 0 1 14 4.667l-9 9-3.667.666.667-3.666 9-9z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <button @click="handleDelete" class="action-btn delete" title="삭제">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </template>
      </div>
    </div>

    <!-- 모달 -->
    <div v-if="showConfirmModal" class="modal-backdrop" @click="cancelToggleActive">
      <div class="modal-box" @click.stop>
        <div class="modal-icon">
          {{ localIsActive ? '⚠️' : '✨' }}
        </div>
        <h3 class="modal-title">
          {{ localIsActive ? '비활성화' : '활성화' }} 확인
        </h3>
        <p class="modal-text">
          <strong>{{ category.categoryName }}</strong> 카테고리를
          {{ localIsActive ? '비활성화' : '활성화' }}하시겠습니까?
        </p>
        <div class="modal-buttons">
          <button @click="cancelToggleActive" class="modal-btn secondary">취소</button>
          <button @click="confirmToggleActive" class="modal-btn primary" :class="{ danger: localIsActive }">
            {{ localIsActive ? '비활성화' : '활성화' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-item {
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.category-item.dragging .item-card {
  opacity: 0.5;
  transform: scale(0.98);
}

.category-item.drag-over .item-card {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.item-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.item-card:hover {
  border-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.drag-handle {
  color: #cbd5e0;
  cursor: grab;
  padding: 4px;
  transition: color 0.2s;
}

.drag-handle:hover {
  color: #64748b;
}

.drag-handle:active {
  cursor: grabbing;
}

.order-number {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.category-name {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.edit-input {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  padding: 6px 10px;
}

.edit-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: #fef2f2;
  color: #ef4444;
}

.status-badge.active {
  background: #f0fdf4;
  color: #22c55e;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.category-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.edit-section {
  margin-bottom: 8px;
}

.edit-textarea {
  width: 100%;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  resize: vertical;
}

.edit-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.keywords-edit {
  margin-bottom: 8px;
}

.keyword-input-row {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.keyword-input {
  flex: 1;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
}

.keyword-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.keyword-add {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.keyword-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}

.tag-remove {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
}

.tag-remove:hover {
  color: #64748b;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.keyword-chip {
  padding: 4px 10px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.meta-row {
  display: flex;
  gap: 12px;
}

.meta-item {
  font-size: 11px;
  color: #94a3b8;
}

.item-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn.edit {
  background: #eff6ff;
  color: #3b82f6;
}

.action-btn.edit:hover {
  background: #dbeafe;
}

.action-btn.delete {
  background: #fef2f2;
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #fee2e2;
}

.action-btn.save {
  background: #f0fdf4;
  color: #22c55e;
}

.action-btn.save:hover {
  background: #dcfce7;
}

.action-btn.cancel {
  background: #f8fafc;
  color: #64748b;
}

.action-btn.cancel:hover {
  background: #f1f5f9;
}

/* 모달 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-box {
  background: white;
  border-radius: 16px;
  padding: 28px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.modal-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.modal-text {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.modal-text strong {
  color: #0f172a;
  font-weight: 600;
}

.modal-buttons {
  display: flex;
  gap: 10px;
}

.modal-btn {
  flex: 1;
  padding: 11px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.secondary {
  background: #f8fafc;
  color: #475569;
}

.modal-btn.secondary:hover {
  background: #f1f5f9;
}

.modal-btn.primary {
  background: #22c55e;
  color: white;
}

.modal-btn.primary.danger {
  background: #ef4444;
}

.modal-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .item-card {
    flex-wrap: wrap;
    padding: 14px;
  }

  .drag-handle {
    display: none;
  }

  .content-header {
    flex-wrap: wrap;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>