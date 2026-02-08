<template>
  <div>
    <div
        class="upload-area"
        :class="{
          'dragover': isDragOver,
          'disabled': !isLoggedIn || additionalFiles.length >= 4
        }"
        @click="isLoggedIn && additionalFiles.length < 4 && triggerInput()"
        @drop.prevent="isLoggedIn && additionalFiles.length < 4 && handleDrop($event)"
        @dragover.prevent="isLoggedIn && additionalFiles.length < 4 && handleDragOver($event)"
        @dragleave="isLoggedIn && handleDragLeave()"
    >
      <svg class="upload-icon" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="18" width="36" height="24" rx="2" stroke="currentColor" stroke-width="2"/>
        <path d="M6 30L14 22L22 30L38 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="32" cy="14" r="3" fill="currentColor"/>
      </svg>
      <div class="upload-text">
        <template v-if="isLoggedIn">
          <template v-if="additionalFiles.length < 4">
            <strong>클릭</strong>하거나 <strong>드래그</strong>하여 추가 이미지 업로드
          </template>
          <template v-else>
            최대 4개까지 업로드 가능합니다
          </template>
        </template>
        <template v-else>
          로그인 후 이미지를 업로드할 수 있습니다
        </template>
      </div>
      <div class="upload-hint" v-if="isLoggedIn && additionalFiles.length < 4">
        <span class="upload-count">{{ additionalFiles.length }}/4</span>
        <span>PNG, JPG, JPEG · 최대 5MB</span>
      </div>
      <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          style="display: none"
          @change="handleFileSelect"
          :disabled="!isLoggedIn"
      >
    </div>

    <!-- 미리보기 -->
    <div v-if="additionalFiles.length > 0" class="preview-grid">
      <div class="preview-header">
        <span class="preview-title">등록된 추가 이미지</span>
        <span class="preview-count">{{ additionalFiles.length }}/4</span>
      </div>
      <div class="preview-items">
        <div
            v-for="(file, index) in additionalFiles"
            :key="index"
            class="preview-item"
        >
          <div class="image-number">{{ index + 1 }}</div>
          <img
              :src="file.preview"
              :alt="file.name"
              class="preview-image"
          >
          <button
              type="button"
              class="remove-btn"
              @click="handleRemove(index)"
              :disabled="!isLoggedIn"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="file-info">
            <div class="file-name" :title="file.name">{{ file.name }}</div>
            <div class="file-size">{{ formatFileSize(file.size) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFile } from '@/services/FileService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const props = defineProps({
  additionalFiles: {
    type: Array,
    default: () => []
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update', 'remove'])

const fileService = useFile()
const { isImageFile, createPreview } = fileService
const { open, openLoginRequired } = useConfirmDialog()

const fileInput = ref(null)
const isDragOver = ref(false)

const triggerInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  await processFiles(files)
  event.target.value = ''
}

const handleDrop = async (event) => {
  event.preventDefault()
  isDragOver.value = false

  const files = Array.from(event.dataTransfer.files)
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  await processFiles(imageFiles)
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const processFiles = async (files) => {
  if (!props.isLoggedIn) {
    await openLoginRequired()
    return
  }

  const remainingSlots = 4 - props.additionalFiles.length

  if (files.length > remainingSlots) {
    await open({ type: 'alert', title: '업로드 제한', message: `추가 이미지는 최대 4개까지만 업로드할 수 있습니다 (현재: ${props.additionalFiles.length}/4)` })
    files = files.slice(0, remainingSlots)
  }

  const newFiles = [...props.additionalFiles]

  for (const file of files) {
    if (!isImageFile(file)) {
      await open({ type: 'alert', title: '파일 형식 오류', message: `${file.name}: PNG, JPG, JPEG 파일만 업로드 가능합니다` })
      continue
    }

    if (file.size > 5 * 1024 * 1024) {
      await open({ type: 'alert', title: '파일 크기 초과', message: `${file.name}: 파일 크기는 5MB 이하만 업로드 가능합니다` })
      continue
    }

    if (file.size === 0) {
      await open({ type: 'alert', title: '파일 오류', message: `${file.name}: 빈 파일은 업로드할 수 없습니다` })
      continue
    }

    const previewResult = await createPreview(file)
    if (!previewResult.success) {
      console.error('미리보기 생성 실패:', previewResult.error)
      continue
    }

    // 로컬 미리보기로 먼저 추가
    const fileIndex = newFiles.length
    const fileObj = {
      file: file,
      name: file.name,
      size: file.size,
      preview: previewResult.previewUrl,
      uploading: true,
      attachmentInfo: null
    }
    newFiles.push(fileObj)
    emit('update', [...newFiles])

    // Presigned URL로 S3 업로드
    try {
      const uploadResult = await fileService.upload(file, { fileCode: 'PRODUCT' })

      if (uploadResult.success && uploadResult.data) {
        const serverUrl = uploadResult.data.fileUrl || uploadResult.data.storedPath

        // 서버 URL로 업데이트
        newFiles[fileIndex] = {
          file: file,
          name: file.name,
          size: file.size,
          preview: serverUrl,
          uploading: false,
          attachmentInfo: {
            fileId: uploadResult.data.id,
            storedPath: uploadResult.data.fileUrl,
            originName: uploadResult.data.orgFileNm || file.name,
            fileSize: uploadResult.data.fileSize || file.size,
            contentType: uploadResult.data.contentType || file.type
          }
        }
        emit('update', [...newFiles])
        console.log(`✅ [PRODUCT] 추가 이미지 ${fileIndex + 1} 업로드 완료`)
      } else {
        throw new Error(uploadResult.error || '업로드 실패')
      }
    } catch (error) {
      console.error(`❌ [PRODUCT] 추가 이미지 업로드 실패:`, error)
      // 실패 시 로컬 미리보기 유지
      newFiles[fileIndex] = {
        ...newFiles[fileIndex],
        uploading: false,
        uploadFailed: true
      }
      emit('update', [...newFiles])
    }
  }
}

const handleRemove = (index) => {
  if (!props.isLoggedIn) return
  emit('remove', index)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

defineExpose({
  triggerInput
})
</script>

<style scoped>
.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  border: 2px dashed #D1D5DB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #FAFAFA;
  min-height: 150px;
}

.upload-area:hover:not(.disabled) {
  border-color: #059669;
  background: #F0FDF4;
}

.upload-area.dragover {
  border-color: #059669;
  background: #ECFDF5;
}

.upload-area.disabled {
  background: #F9FAFB;
  border-color: #E5E7EB;
  cursor: not-allowed;
  opacity: 0.8;
}

.upload-icon {
  color: #9CA3AF;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.upload-text strong {
  color: #059669;
  font-weight: 600;
}

.upload-hint {
  font-size: 12px;
  color: #9CA3AF;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-count {
  display: inline-block;
  padding: 2px 8px;
  background: #059669;
  color: white;
  border-radius: 10px;
  font-weight: 600;
}

.preview-grid {
  margin-top: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #FAFAFA;
  border-radius: 10px 10px 0 0;
  border: 1px solid #F3F4F6;
  border-bottom: none;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.preview-count {
  font-size: 13px;
  font-weight: 600;
  color: #059669;
  background: #ECFDF5;
  padding: 4px 10px;
  border-radius: 10px;
}

.preview-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #F3F4F6;
  border-radius: 0 0 10px 10px;
}

.preview-item {
  position: relative;
  border: 1px solid #F3F4F6;
  border-radius: 10px;
  overflow: hidden;
  background: white;
}

.image-number {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  background: rgba(5, 150, 105, 0.9);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  z-index: 5;
  backdrop-filter: blur(4px);
}

.preview-image {
  width: 100%;
  height: 120px;
  object-fit: contain;
  background: #f3f4f6;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.remove-btn:hover:not(:disabled) {
  background: #DC2626;
  transform: scale(1.1);
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-info {
  padding: 8px;
  text-align: center;
  background: #FAFAFA;
}

.file-name {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 11px;
  color: #9CA3AF;
  font-weight: 500;
}

.error-message {
  margin-top: 8px;
  font-size: 13px;
  color: #DC2626;
  font-weight: 500;
}

@media (max-width: 768px) {
  .preview-items {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .preview-image {
    height: 100px;
  }
}
</style>