<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">새 채팅방 만들기</h2>
        <button class="close-button" @click="$emit('close')">
          <X :size="24" />
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- 채팅방 타입 선택 -->
          <div class="form-group">
            <label class="form-label">채팅방 타입</label>
            <div class="radio-group">
              <label class="radio-item">
                <input
                    type="radio"
                    v-model="formData.roomType"
                    value="GROUP"
                    name="roomType"
                />
                <span class="radio-icon">👥</span>
                <div class="radio-content">
                  <div class="radio-title">그룹 채팅</div>
                  <div class="radio-desc">여러 명이 함께 대화할 수 있습니다</div>
                </div>
              </label>
              <label class="radio-item">
                <input
                    type="radio"
                    v-model="formData.roomType"
                    value="ONE_TO_ONE"
                    name="roomType"
                />
                <span class="radio-icon">💬</span>
                <div class="radio-content">
                  <div class="radio-title">1:1 채팅</div>
                  <div class="radio-desc">한 명과 개인 대화를 할 수 있습니다</div>
                </div>
              </label>
            </div>
          </div>

          <!-- 채팅방 제목 -->
          <div class="form-group">
            <label class="form-label" for="title">
              채팅방 제목 *
            </label>
            <input
                id="title"
                type="text"
                v-model="formData.title"
                :placeholder="titlePlaceholder"
                class="form-input"
                :class="{ 'error': validationErrors.title }"
                maxlength="50"
                required
            />
            <div v-if="validationErrors.title" class="error-message">
              {{ validationErrors.title }}
            </div>
            <div class="input-helper">
              {{ formData.title.length }}/50
            </div>
          </div>

          <!-- 채팅방 설명 -->
          <div class="form-group">
            <label class="form-label" for="description">
              채팅방 설명
            </label>
            <textarea
                id="description"
                v-model="formData.description"
                placeholder="채팅방에 대한 간단한 설명을 입력하세요 (선택사항)"
                class="form-textarea"
                maxlength="200"
                rows="3"
            ></textarea>
            <div class="input-helper">
              {{ (formData.description || '').length }}/200
            </div>
          </div>

          <!-- 참여자 선택 -->
          <div class="form-group">
            <label class="form-label">
              참여자 선택
              <span v-if="formData.roomType === 'ONE_TO_ONE'" class="required">*</span>
            </label>

            <!-- 사용자 검색 -->
            <div class="user-search">
              <div class="search-input-container">
                <Search :size="16" class="search-icon" />
                <input
                    type="text"
                    v-model="userSearchQuery"
                    placeholder="사용자 이름 또는 이메일로 검색"
                    class="search-input"
                    @input="handleUserSearch"
                />
              </div>
            </div>

            <!-- 선택된 참여자 -->
            <div v-if="selectedUsers.length > 0" class="selected-users">
              <div class="selected-users-header">
                선택된 참여자 ({{ selectedUsers.length }}명)
              </div>
              <div class="selected-users-list">
                <div
                    v-for="user in selectedUsers"
                    :key="user.id"
                    class="selected-user-item"
                >
                  <div class="user-avatar">
                    <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
                    <span v-else class="avatar-placeholder">
                      {{ user.name.charAt(0) }}
                    </span>
                  </div>
                  <span class="user-name">{{ user.name }}</span>
                  <button
                      type="button"
                      @click="removeUser(user.id)"
                      class="remove-user-btn"
                  >
                    <X :size="14" />
                  </button>
                </div>
              </div>
            </div>

            <!-- 사용자 검색 결과 -->
            <div v-if="showUserSearchResults" class="user-search-results">
              <div v-if="searchingUsers" class="search-loading">
                <div class="spinner-small"></div>
                <span>사용자 검색 중...</span>
              </div>
              <div v-else-if="searchResults.length === 0" class="no-results">
                검색 결과가 없습니다
              </div>
              <div v-else class="search-results-list">
                <div
                    v-for="user in filteredSearchResults"
                    :key="user.id"
                    class="search-result-item"
                    @click="selectUser(user)"
                >
                  <div class="user-avatar">
                    <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
                    <span v-else class="avatar-placeholder">
                      {{ user.name.charAt(0) }}
                    </span>
                  </div>
                  <div class="user-info">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                  <div v-if="isUserSelected(user.id)" class="selected-indicator">
                    <Check :size="16" />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="validationErrors.participants" class="error-message">
              {{ validationErrors.participants }}
            </div>
          </div>

          <!-- 고급 설정 -->
          <div class="form-group">
            <button
                type="button"
                @click="showAdvancedSettings = !showAdvancedSettings"
                class="toggle-button"
            >
              <ChevronDown
                  :size="16"
                  :class="{ 'rotated': showAdvancedSettings }"
              />
              고급 설정
            </button>

            <div v-if="showAdvancedSettings" class="advanced-settings">
              <!-- 비공개 채팅방 -->
              <div class="setting-item">
                <label class="checkbox-label">
                  <input
                      type="checkbox"
                      v-model="formData.isPrivate"
                  />
                  <span class="checkbox-custom"></span>
                  비공개 채팅방
                </label>
                <div class="setting-desc">
                  초대받은 사용자만 참여할 수 있습니다
                </div>
              </div>

              <!-- 최대 참여자 수 (그룹 채팅만) -->
              <div v-if="formData.roomType === 'GROUP'" class="setting-item">
                <label class="form-label" for="maxParticipants">
                  최대 참여자 수
                </label>
                <input
                    id="maxParticipants"
                    type="number"
                    v-model.number="formData.maxParticipants"
                    placeholder="제한 없음"
                    class="form-input"
                    min="2"
                    max="1000"
                />
                <div class="setting-desc">
                  비워두면 참여자 수 제한이 없습니다
                </div>
              </div>
            </div>
          </div>

          <!-- 에러 메시지 -->
          <div v-if="submitError" class="submit-error">
            {{ submitError }}
          </div>

          <!-- 버튼 -->
          <div class="form-actions">
            <button
                type="button"
                @click="$emit('close')"
                class="btn btn-secondary"
                :disabled="submitting"
            >
              취소
            </button>
            <button
                type="submit"
                class="btn btn-primary"
                :disabled="!isFormValid || submitting"
            >
              <div v-if="submitting" class="spinner-small"></div>
              <span>{{ submitting ? '생성 중...' : '채팅방 만들기' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { X, Search, Check, ChevronDown } from 'lucide-vue-next'
import { chatService } from '@/services/ChatService.js'

const emit = defineEmits(['close', 'created'])

// 폼 데이터
const formData = ref({
  title: '',
  description: '',
  roomType: 'GROUP',
  participantUserIds: [],
  isPrivate: false,
  maxParticipants: null
})

// UI 상태
const submitting = ref(false)
const submitError = ref('')
const showAdvancedSettings = ref(false)
const validationErrors = ref({})

// 사용자 검색 관련
const userSearchQuery = ref('')
const searchResults = ref([])
const selectedUsers = ref([])
const searchingUsers = ref(false)
const showUserSearchResults = ref(false)

// 검색 디바운스 타이머
let searchTimer = null

// 계산된 속성
const titlePlaceholder = computed(() => {
  return formData.value.roomType === 'NORMAL'
      ? '상대방과의 대화방'
      : '채팅방 제목을 입력하세요'
})

const filteredSearchResults = computed(() => {
  return searchResults.value.filter(user => !isUserSelected(user.id))
})

const isFormValid = computed(() => {
  const hasTitle = formData.value.title.trim().length > 0
  const hasValidParticipants = formData.value.roomType === 'GROUP' ||
      (formData.value.roomType === 'NORMAL' && selectedUsers.value.length === 1)

  return hasTitle && hasValidParticipants && Object.keys(validationErrors.value).length === 0
})

// 메서드
const handleOverlayClick = () => {
  emit('close')
}

const validateForm = () => {
  const errors = {}

  // 제목 검증
  if (!formData.value.title.trim()) {
    errors.title = '채팅방 제목은 필수입니다'
  } else if (formData.value.title.length > 50) {
    errors.title = '채팅방 제목은 50자 이하여야 합니다'
  }

  // 참여자 검증
  if (formData.value.roomType === 'NORMAL') {
    if (selectedUsers.value.length !== 1) {
      errors.participants = '1:1 채팅방은 상대방 1명을 선택해야 합니다'
    }
  }

  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleUserSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(async () => {
    if (userSearchQuery.value.trim().length < 2) {
      showUserSearchResults.value = false
      return
    }

    try {
      searchingUsers.value = true
      showUserSearchResults.value = true

      // 실제 API 호출 대신 샘플 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 500)) // 검색 지연 시뮬레이션

      searchResults.value = getSampleUsers().filter(user =>
          user.name.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearchQuery.value.toLowerCase())
      )
    } catch (error) {
      console.error('사용자 검색 실패:', error)
      searchResults.value = []
    } finally {
      searchingUsers.value = false
    }
  }, 300)
}

const getSampleUsers = () => {
  return [
    { id: '1', name: '김철수', email: 'kim@example.com', avatar: null },
    { id: '2', name: '이영희', email: 'lee@example.com', avatar: 'https://placehold.co/32x32/FF6B6B/FFFFFF?text=이' },
    { id: '3', name: '박민준', email: 'park@example.com', avatar: null },
    { id: '4', name: '최지원', email: 'choi@example.com', avatar: 'https://placehold.co/32x32/4ECDC4/FFFFFF?text=최' },
    { id: '5', name: '정서연', email: 'jung@example.com', avatar: null },
    { id: '6', name: '강동현', email: 'kang@example.com', avatar: 'https://placehold.co/32x32/45B7D1/FFFFFF?text=강' }
  ]
}

const selectUser = (user) => {
  if (isUserSelected(user.id)) return

  if (formData.value.roomType === 'NORMAL') {
    selectedUsers.value = [user]
  } else {
    selectedUsers.value.push(user)
  }

  formData.value.participantUserIds = selectedUsers.value.map(u => u.id)
  userSearchQuery.value = ''
  showUserSearchResults.value = false

  // 검증 다시 실행
  validateForm()
}

const removeUser = (userId) => {
  selectedUsers.value = selectedUsers.value.filter(user => user.id !== userId)
  formData.value.participantUserIds = selectedUsers.value.map(u => u.id)
  validateForm()
}

const isUserSelected = (userId) => {
  return selectedUsers.value.some(user => user.id === userId)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    submitting.value = true
    submitError.value = ''

    // 백엔드 API 호출
    const response = await chatService.createChatRoom({
      title: formData.value.title.trim(),
      description: formData.value.description?.trim() || null,
      roomType: formData.value.roomType,
      participantUserIds: formData.value.participantUserIds,
      isPrivate: formData.value.isPrivate,
      maxParticipants: formData.value.maxParticipants || null
    })

    if (response.success) {
      // 성공 시 생성된 채팅방 정보를 부모에게 전달
      emit('created', response.data)
    } else {
      throw new Error(response.message || '채팅방 생성에 실패했습니다')
    }

  } catch (error) {
    console.error('채팅방 생성 실패:', error)
    submitError.value = error.message || '채팅방 생성 중 오류가 발생했습니다'
  } finally {
    submitting.value = false
  }
}

// 감시자
watch(() => formData.value.roomType, (newType) => {
  // 타입 변경 시 선택된 사용자 초기화
  if (newType === 'NORMAL' && selectedUsers.value.length > 1) {
    selectedUsers.value = selectedUsers.value.slice(0, 1)
    formData.value.participantUserIds = selectedUsers.value.map(u => u.id)
  }
  validateForm()
})

watch(() => formData.value.title, () => {
  validateForm()
})

// 컴포넌트 마운트 시
onMounted(() => {
  // 포커스를 제목 입력 필드로 이동
  const titleInput = document.getElementById('title')
  if (titleInput) {
    titleInput.focus()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: var(--bg-elevated);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-strong);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text-600);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: var(--c-text-500);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-button:hover {
  background: var(--bg-subtle);
  color: var(--c-text-600);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-600);
  margin-bottom: 8px;
}

.required {
  color: var(--c-danger);
}

.form-input,
.form-textarea,
.search-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--c-text-300);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: var(--bg-elevated);
}

.form-input:focus,
.form-textarea:focus,
.search-input:focus {
  outline: none;
  border-color: var(--c-info);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: var(--c-danger);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.input-helper {
  font-size: 12px;
  color: var(--c-text-500);
  margin-top: 4px;
  text-align: right;
}

.error-message {
  color: var(--c-danger);
  font-size: 12px;
  margin-top: 4px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid var(--border-strong);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-item:hover {
  border-color: var(--c-text-300);
}

.radio-item:has(input:checked) {
  border-color: var(--c-info);
  background: var(--c-info-soft);
}

.radio-item input[type="radio"] {
  display: none;
}

.radio-icon {
  font-size: 24px;
  margin-right: 12px;
}

.radio-content {
  flex: 1;
}

.radio-title {
  font-weight: 500;
  color: var(--c-text-600);
  margin-bottom: 4px;
}

.radio-desc {
  font-size: 13px;
  color: var(--c-text-500);
}

.user-search {
  margin-bottom: 16px;
}

.search-input-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--c-text-500);
}

.search-input {
  padding-left: 40px;
}

.selected-users {
  margin-bottom: 16px;
}

.selected-users-header {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-600);
  margin-bottom: 8px;
}

.selected-users-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-user-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--border-default);
  border-radius: 20px;
  font-size: 13px;
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--border-strong);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 12px;
  font-weight: 500;
  color: var(--c-text-500);
}

.user-name {
  font-weight: 500;
  color: var(--c-text-600);
}

.remove-user-btn {
  background: none;
  border: none;
  color: var(--c-text-500);
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  transition: all 0.2s;
}

.remove-user-btn:hover {
  background: var(--border-strong);
  color: var(--c-text-600);
}

.user-search-results {
  border: 1px solid var(--c-text-300);
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  background: var(--bg-elevated);
}

.search-loading,
.no-results {
  padding: 16px;
  text-align: center;
  color: var(--c-text-500);
  font-size: 13px;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.search-results-list {
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid var(--border-default);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: var(--bg-subtle);
}

.search-result-item .user-avatar {
  width: 32px;
  height: 32px;
}

.user-info {
  flex: 1;
}

.user-info .user-name {
  font-size: 14px;
  margin-bottom: 2px;
}

.user-email {
  font-size: 12px;
  color: var(--c-text-500);
}

.selected-indicator {
  color: var(--c-success);
}

.toggle-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--c-info);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0;
}

.toggle-button svg {
  transition: transform 0.2s;
}

.toggle-button svg.rotated {
  transform: rotate(180deg);
}

.advanced-settings {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-strong);
}

.setting-item {
  margin-bottom: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-600);
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--c-text-300);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
  background: var(--c-info);
  border-color: var(--c-info);
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.setting-desc {
  font-size: 12px;
  color: var(--c-text-500);
  margin-top: 4px;
  margin-left: 26px;
}

.submit-error {
  background: var(--c-danger-soft);
  border: 1px solid var(--c-danger-soft);
  color: var(--c-danger);
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-subtle);
  color: var(--c-text-600);
  border: 1px solid var(--border-strong);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-subtle);
}

.btn-primary {
  background: var(--c-info);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 반응형 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
  }

  .modal-container {
    max-width: 100%;
    max-height: 95vh;
  }

  .modal-header,
  .modal-body {
    padding: 16px;
  }

  .radio-group {
    gap: 8px;
  }

  .radio-item {
    padding: 12px;
  }

  .radio-icon {
    font-size: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .modal-container {
    background: var(--c-ink-900);
    color: var(--bg-subtle);
  }

  .modal-title {
    color: var(--bg-subtle);
  }

  .close-button {
    color: var(--c-text-400);
  }

  .close-button:hover {
    background: var(--c-text-600);
    color: var(--bg-subtle);
  }

  .form-label {
    color: var(--c-text-300);
  }

  .form-input,
  .form-textarea,
  .search-input {
    background: var(--c-text-600);
    border-color: var(--c-text-600);
    color: var(--bg-subtle);
  }

  .form-input:focus,
  .form-textarea:focus,
  .search-input:focus {
    border-color: var(--c-info);
    background: var(--c-text-600);
  }

  .radio-item {
    border-color: var(--c-text-600);
    background: var(--c-text-600);
  }

  .radio-item:hover {
    border-color: var(--c-text-500);
  }

  .radio-item:has(input:checked) {
    background: #1e3a8a;
    border-color: var(--c-info);
  }

  .user-search-results {
    background: var(--c-text-600);
    border-color: var(--c-text-600);
  }

  .search-result-item:hover {
    background: var(--c-text-600);
  }

  .selected-user-item {
    background: var(--c-text-600);
  }

  .btn-secondary {
    background: var(--c-text-600);
    color: var(--c-text-300);
    border-color: var(--c-text-600);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--c-text-600);
  }
}

/* 접근성 개선 */
.form-input:focus,
.form-textarea:focus,
.search-input:focus,
.btn:focus,
.close-button:focus,
.toggle-button:focus {
  outline: 2px solid var(--c-info);
  outline-offset: 2px;
}

/* 터치 디바이스 최적화 */
@media (hover: none) and (pointer: coarse) {
  .radio-item,
  .search-result-item,
  .close-button,
  .remove-user-btn,
  .toggle-button {
    min-height: 44px;
  }

  .btn {
    min-height: 48px;
  }
}

/* 애니메이션 감소 설정 지원 */
@media (prefers-reduced-motion: reduce) {
  .spinner-small,
  .toggle-button svg {
    animation: none !important;
    transition: none !important;
  }
}
</style>