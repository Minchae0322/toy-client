import { ref, watch, onMounted, onUnmounted } from 'vue'

const DRAFT_KEY = 'battle_draft'
const AUTO_SAVE_INTERVAL = 30000 // 30초

/**
 * 배틀 생성 임시저장 composable
 * - localStorage 기반 임시저장
 * - 자동저장 (30초마다)
 * - File 객체는 제외하고 저장 (이미지 URL만 저장)
 */
export function useBattleDraft() {
  const hasDraft = ref(false)
  const lastSavedAt = ref(null)
  const isSaving = ref(false)
  const autoSaveEnabled = ref(true)

  let autoSaveTimer = null
  let formRef = null
  let itemsRef = null

  /**
   * 드래프트 존재 여부 확인
   */
  const checkDraftExists = () => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      hasDraft.value = !!draft
      if (draft) {
        const data = JSON.parse(draft)
        lastSavedAt.value = data.savedAt ? new Date(data.savedAt) : null
      }
      return hasDraft.value
    } catch {
      return false
    }
  }

  /**
   * 폼 데이터에서 저장 가능한 형태로 변환
   * - File 객체 제외
   * - 이미지 URL 및 attachmentInfo만 저장
   */
  const serializeFormData = (battleForm, selectedItems) => {
    // battleForm에서 File 객체 제외
    const serializedForm = { ...battleForm }
    delete serializedForm.thumbnailFile // File 객체 제거

    // 썸네일 미리보기 URL이 있으면 저장 (data URL 또는 업로드된 URL)
    if (battleForm.thumbnailPreviewUrl) {
      serializedForm.thumbnailPreviewUrl = battleForm.thumbnailPreviewUrl
    }

    // 아이템에서 File 객체 제외
    const serializedItems = selectedItems.map(item => {
      const serializedItem = { ...item }
      delete serializedItem.customImageFile // File 객체 제거

      // 커스텀 이미지 미리보기 URL이 있으면 저장
      if (item.customImagePreviewUrl) {
        serializedItem.customImagePreviewUrl = item.customImagePreviewUrl
      }

      return serializedItem
    })

    return {
      battleForm: serializedForm,
      selectedItems: serializedItems,
      savedAt: new Date().toISOString()
    }
  }

  /**
   * 임시저장
   */
  const saveDraft = (battleForm, selectedItems) => {
    try {
      isSaving.value = true

      const draftData = serializeFormData(battleForm, selectedItems)
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))

      lastSavedAt.value = new Date(draftData.savedAt)
      hasDraft.value = true

      return true
    } catch (error) {
      console.error('임시저장 실패:', error)
      return false
    } finally {
      isSaving.value = false
    }
  }

  /**
   * 임시저장 불러오기
   */
  const loadDraft = () => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      if (!draft) return null

      const draftData = JSON.parse(draft)
      lastSavedAt.value = draftData.savedAt ? new Date(draftData.savedAt) : null

      return draftData
    } catch (error) {
      console.error('임시저장 불러오기 실패:', error)
      return null
    }
  }

  /**
   * 임시저장 삭제
   */
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY)
      hasDraft.value = false
      lastSavedAt.value = null
      return true
    } catch {
      return false
    }
  }

  /**
   * 자동저장 시작
   */
  const startAutoSave = (battleFormRef, selectedItemsRef) => {
    formRef = battleFormRef
    itemsRef = selectedItemsRef

    // 기존 타이머 제거
    stopAutoSave()

    autoSaveTimer = setInterval(() => {
      if (autoSaveEnabled.value && formRef && itemsRef) {
        const form = formRef.value || formRef
        const items = itemsRef.value || itemsRef

        // 제목이 입력된 경우에만 자동저장
        if (form.title && form.title.trim().length > 0) {
          saveDraft(form, items)
        }
      }
    }, AUTO_SAVE_INTERVAL)
  }

  /**
   * 자동저장 중지
   */
  const stopAutoSave = () => {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
  }

  /**
   * 저장 시간 포맷
   */
  const formatSavedTime = (date) => {
    if (!date) return ''

    const now = new Date()
    const diff = now - date

    // 1분 이내
    if (diff < 60000) {
      return '방금 전 저장됨'
    }

    // 1시간 이내
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes}분 전 저장됨`
    }

    // 오늘
    if (date.toDateString() === now.toDateString()) {
      const hours = date.getHours()
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const period = hours >= 12 ? '오후' : '오전'
      const hour12 = hours % 12 || 12
      return `오늘 ${period} ${hour12}:${minutes} 저장됨`
    }

    // 어제
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      const hours = date.getHours()
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const period = hours >= 12 ? '오후' : '오전'
      const hour12 = hours % 12 || 12
      return `어제 ${period} ${hour12}:${minutes} 저장됨`
    }

    // 그 외
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}월 ${day}일 저장됨`
  }

  // 컴포넌트 언마운트 시 타이머 정리
  onUnmounted(() => {
    stopAutoSave()
  })

  // 초기 드래프트 확인
  onMounted(() => {
    checkDraftExists()
  })

  return {
    hasDraft,
    lastSavedAt,
    isSaving,
    autoSaveEnabled,
    saveDraft,
    loadDraft,
    clearDraft,
    checkDraftExists,
    startAutoSave,
    stopAutoSave,
    formatSavedTime
  }
}
