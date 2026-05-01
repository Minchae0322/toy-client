<template>
  <div>
    <div
        class="upload-area"
        :class="{
          'dragover': isDragOver,
          'disabled': !isLoggedIn || thumbnailFile !== null,
          'has-image': thumbnailFile !== null,
          'error': error
        }"
        @click="isLoggedIn && !thumbnailFile && triggerInput()"
        @drop.prevent="isLoggedIn && !thumbnailFile && handleDrop($event)"
        @dragover.prevent="isLoggedIn && !thumbnailFile && handleDragOver($event)"
        @dragleave="isLoggedIn && handleDragLeave()"
    >
      <template v-if="!thumbnailFile">
        <svg class="upload-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="8" width="48" height="48" rx="4" stroke="currentColor" stroke-width="2.5"/>
          <path d="M8 40L20 28L32 40L52 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="44" cy="20" r="4" fill="currentColor"/>
        </svg>
        <div class="upload-text">
          <template v-if="isLoggedIn">
            <strong>클릭</strong>하거나 <strong>드래그</strong>하여 이미지 업로드
          </template>
          <template v-else>
            로그인 후 이미지를 업로드할 수 있습니다
          </template>
        </div>
        <div class="upload-hint" v-if="isLoggedIn">
          제품의 대표 이미지를 등록해주세요
        </div>
      </template>

      <template v-else>
        <div class="thumbnail-preview">
          <div class="success-badge">대표 이미지</div>
          <img
              :src="thumbnailFile.preview"
              :alt="thumbnailFile.name"
              class="preview-image"
          >
          <button
              type="button"
              class="remove-btn"
              @click.stop="handleRemove"
              :disabled="!isLoggedIn"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="file-info">
            <div class="file-name">{{ thumbnailFile.name }}</div>
            <div class="file-size">{{ formatFileSize(thumbnailFile.size) }}</div>
          </div>
        </div>
      </template>

      <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileSelect"
          :disabled="!isLoggedIn"
      >
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <div v-else-if="thumbnailFile" class="success-message">
      대표 이미지가 등록되었습니다
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFile } from '@/services/FileService.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const props = defineProps({
  thumbnailFile: {
    type: Object,
    default: null
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
const { open, openLoginRequired } = useConfirmDialog()
const { isImageFile, createPreview } = fileService

const fileInput = ref(null)
const isDragOver = ref(false)
const isUploading = ref(false)

const triggerInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    await processFile(files[0])
  }
  event.target.value = ''
}

const handleDrop = async (event) => {
  event.preventDefault()
  isDragOver.value = false

  const files = Array.from(event.dataTransfer.files)
  const imageFiles = files.filter(file => file.type.startsWith('image/'))

  if (imageFiles.length > 0) {
    await processFile(imageFiles[0])
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const processFile = async (file) => {
  if (!props.isLoggedIn) {
    await openLoginRequired()
    return
  }

  if (!isImageFile(file)) {
    await open({ type: 'alert', title: '파일 형식 오류', message: 'PNG, JPG, JPEG 파일만 업로드 가능합니다' })
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    await open({ type: 'alert', title: '파일 크기 초과', message: '파일 크기는 10MB 이하만 업로드 가능합니다' })
    return
  }

  if (file.size === 0) {
    await open({ type: 'alert', title: '파일 오류', message: '빈 파일은 업로드할 수 없습니다' })
    return
  }

  // 로컬 미리보기 생성
  const previewResult = await createPreview(file)
  if (!previewResult.success) {
    console.error('미리보기 생성 실패:', previewResult.error)
    return
  }

  // 로컬 미리보기로 먼저 업데이트
  const fileObj = {
    file: file,
    name: file.name,
    size: file.size,
    preview: previewResult.previewUrl,
    uploading: true,
    attachmentInfo: null
  }
  emit('update', fileObj)

  // Presigned URL로 S3 업로드
  isUploading.value = true
  try {
    const uploadResult = await fileService.upload(file, { fileCode: 'PRODUCT' })

    if (uploadResult.success && uploadResult.data) {
      const serverUrl = uploadResult.data.fileUrl || uploadResult.data.storedPath

      // 서버 URL로 업데이트
      const updatedFileObj = {
        file: file,
        name: file.name,
        size: file.size,
        preview: serverUrl, // 서버 URL로 교체
        uploading: false,
        attachmentInfo: {
          fileId: uploadResult.data.id,
          storedPath: uploadResult.data.fileUrl,
          originName: uploadResult.data.orgFileNm || file.name,
          fileSize: uploadResult.data.fileSize || file.size,
          contentType: uploadResult.data.contentType || file.type
        }
      }
      emit('update', updatedFileObj)
      console.log('✅ [PRODUCT] 대표 이미지 업로드 완료')
    } else {
      throw new Error(uploadResult.error || '업로드 실패')
    }
  } catch (error) {
    console.error('❌ [PRODUCT] 대표 이미지 업로드 실패:', error)
    await open({ type: 'alert', title: '업로드 실패', message: '이미지 업로드에 실패했습니다. 다시 시도해주세요.' })
    // 실패 시 로컬 미리보기 유지, 제출 시 재업로드
    const failedFileObj = {
      file: file,
      name: file.name,
      size: file.size,
      preview: previewResult.previewUrl,
      uploading: false,
      uploadFailed: true,
      attachmentInfo: null
    }
    emit('update', failedFileObj)
  } finally {
    isUploading.value = false
  }
}

const handleRemove = () => {
  if (!props.isLoggedIn) return
  emit('remove')
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
  padding: 40px 20px;
  border: 2px dashed #D1D5DB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: #FAFAFA;
  position: relative;
  min-height: 300px;
}

.upload-area:hover:not(.disabled):not(.has-image) {
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

.upload-area.has-image {
  padding: 0;
  border: 2px solid #059669;
  background: white;
}

.upload-area.error {
  border-color: #EF4444;
  background: #FEF2F2;
}

.upload-icon {
  color: #9CA3AF;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 15px;
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
  font-size: 13px;
  color: #9CA3AF;
  text-align: center;
  font-weight: 500;
}

.thumbnail-preview {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.success-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 14px;
  background: rgba(5, 150, 105, 0.95);
  color: white;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  z-index: 5;
  backdrop-filter: blur(4px);
  letter-spacing: -0.01em;
}

.preview-image {
  width: 100%;
  height: 100%;
  min-height: 300px;
  object-fit: contain;
  border-radius: 10px;
}

.remove-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(239, 68, 68, 0.95);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
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
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  border-radius: 0 0 10px 10px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  opacity: 0.9;
  font-weight: 500;
}

.error-message {
  margin-top: 8px;
  font-size: 13px;
  color: #DC2626;
  font-weight: 500;
}

.success-message {
  margin-top: 8px;
  font-size: 13px;
  color: #059669;
  font-weight: 500;
}
</style>