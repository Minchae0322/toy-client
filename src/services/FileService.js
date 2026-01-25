// services/FileService.js
// 파일 업로드/다운로드 관련 API 서비스 (Batch 업로드 최적화)

import { BaseApiService } from './BaseApiService.js'
import { ENV, getServiceUrl } from '@/config/env.js'

/**
 * 파일 관리 서비스
 * File Server와의 통신을 담당
 */
class FileService extends BaseApiService {
  constructor() {
    const baseURL = getServiceUrl('AUTH')
    super(baseURL, 'FILE')
    console.log(`📁 [FILE] File Server URL: ${this.baseURL}`)
    console.log(`🌍 [FILE] Environment: ${ENV.MODE}`)
  }

  // ==================== S3 Presigned URL 업로드 API ====================

  /**
   * S3 Presigned URL 발급 (업로드용)
   * @param {string} fileName - 파일명
   * @param {string} contentType - MIME 타입
   * @returns {Promise<{presignedUrl: string, fileKey: string}>} Presigned URL 및 파일 키
   */
  async getPresignedUploadUrl(fileName, contentType) {
    if (!fileName) {
      throw new Error('파일명이 필요합니다.')
    }
    if (!contentType) {
      throw new Error('Content-Type이 필요합니다.')
    }

    console.log(`🔗 [FILE] Presigned URL 발급 요청: ${fileName} (${contentType})`)

    const response = await this.get('/v1/files/presigned/upload', {
      fileName,
      contentType
    })

    console.log(`✅ [FILE] Presigned URL 발급 완료`)
    return response.data
  }

  /**
   * S3 Presigned URL로 파일 직접 업로드
   * @param {File} file - 업로드할 파일
   * @param {string} presignedUrl - S3 Presigned URL
   * @returns {Promise<void>}
   */
  async uploadToS3(file, presignedUrl) {
    if (!file) {
      throw new Error('업로드할 파일이 필요합니다.')
    }
    if (!presignedUrl) {
      throw new Error('Presigned URL이 필요합니다.')
    }

    console.log(`📤 [FILE] S3 업로드 시작: ${file.name} (${this.formatFileSize(file.size)})`)

    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ [FILE] S3 업로드 실패:`, errorText)
        throw new Error(`S3 업로드 실패: ${response.status} ${response.statusText}`)
      }

      console.log(`✅ [FILE] S3 업로드 완료: ${file.name}`)
    } catch (error) {
      console.error(`❌ [FILE] S3 업로드 에러:`, error)
      throw error
    }
  }

  /**
   * S3 Presigned URL 방식으로 파일 업로드 (통합)
   * @param {File} file - 업로드할 파일
   * @param {Object} options - 업로드 옵션
   * @returns {Promise<{fileKey: string, fileName: string, contentType: string, size: number}>}
   */
  async uploadWithPresignedUrl(file, options = {}) {
    if (!file) {
      throw new Error('업로드할 파일이 필요합니다.')
    }

    // 파일 검증
    const maxSize = options.maxSize || 10 * 1024 * 1024 // 기본 10MB
    if (file.size === 0) {
      throw new Error('빈 파일은 업로드할 수 없습니다.')
    }
    if (file.size > maxSize) {
      throw new Error(`파일 크기는 ${this.formatFileSize(maxSize)} 이하여야 합니다.`)
    }

    console.log(`🚀 [FILE] Presigned URL 업로드 시작: ${file.name}`)

    // 1. Presigned URL 발급
    const { presignedUrl, fileKey } = await this.getPresignedUploadUrl(file.name, file.type)

    // 2. S3에 직접 업로드
    await this.uploadToS3(file, presignedUrl)

    console.log(`✅ [FILE] Presigned URL 업로드 완료: fileKey=${fileKey}`)

    return {
      fileKey,
      fileName: file.name,
      contentType: file.type,
      size: file.size
    }
  }

  /**
   * S3 Presigned URL 방식으로 다중 파일 업로드
   * @param {File[]} files - 업로드할 파일 배열
   * @param {Object} options - 업로드 옵션
   * @returns {Promise<Array<{fileKey: string, fileName: string, contentType: string, size: number}>>}
   */
  async uploadMultipleWithPresignedUrl(files, options = {}) {
    const fileArray = Array.isArray(files) ? files : [files]

    if (fileArray.length === 0) {
      throw new Error('업로드할 파일이 필요합니다.')
    }

    console.log(`🚀 [FILE] 다중 파일 Presigned URL 업로드 시작: ${fileArray.length}개`)

    const results = await Promise.all(
      fileArray.map(file => this.uploadWithPresignedUrl(file, options))
    )

    console.log(`✅ [FILE] 다중 파일 Presigned URL 업로드 완료: ${results.length}개`)

    return results
  }

  // ==================== S3 Presigned URL 다운로드 API ====================

  /**
   * S3 Presigned URL 발급 (다운로드용)
   * @param {string} fileKey - S3 파일 키
   * @returns {Promise<{presignedUrl: string}>} Presigned URL
   */
  async getPresignedDownloadUrl(fileKey) {
    if (!fileKey) {
      throw new Error('파일 키가 필요합니다.')
    }

    console.log(`🔗 [FILE] 다운로드 Presigned URL 발급 요청: ${fileKey}`)

    const response = await this.get('/v1/files/presigned/download', {
      fileKey
    })

    console.log(`✅ [FILE] 다운로드 Presigned URL 발급 완료`)
    return response.data
  }

  /**
   * S3 Presigned URL로 파일 다운로드
   * @param {string} fileKey - S3 파일 키
   * @param {string} fileName - 저장할 파일명 (선택)
   * @returns {Promise<{blob: Blob, fileName: string}>}
   */
  async downloadWithPresignedUrl(fileKey, fileName = null) {
    if (!fileKey) {
      throw new Error('파일 키가 필요합니다.')
    }

    console.log(`📥 [FILE] Presigned URL 다운로드 시작: ${fileKey}`)

    // 1. Presigned URL 발급
    const { presignedUrl } = await this.getPresignedDownloadUrl(fileKey)

    // 2. S3에서 직접 다운로드
    try {
      const response = await fetch(presignedUrl, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      const resolvedFileName = fileName || this.extractFileNameFromKey(fileKey)

      console.log(`✅ [FILE] Presigned URL 다운로드 완료: ${resolvedFileName}`)

      return {
        blob,
        fileName: resolvedFileName,
        contentType: response.headers.get('content-type')
      }
    } catch (error) {
      console.error(`❌ [FILE] S3 다운로드 에러:`, error)
      throw error
    }
  }

  /**
   * S3 Presigned URL로 파일 다운로드 트리거 (브라우저 다운로드 시작)
   * @param {string} fileKey - S3 파일 키
   * @param {string} fileName - 저장할 파일명 (선택)
   */
  async triggerDownloadWithPresignedUrl(fileKey, fileName = null) {
    const { blob, fileName: resolvedFileName } = await this.downloadWithPresignedUrl(fileKey, fileName)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = resolvedFileName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    console.log(`💾 [FILE] Presigned URL 다운로드 트리거 완료: ${resolvedFileName}`)
  }

  /**
   * fileKey에서 파일명 추출
   * @param {string} fileKey - S3 파일 키
   * @returns {string} 파일명
   */
  extractFileNameFromKey(fileKey) {
    if (!fileKey) return 'download'
    const parts = fileKey.split('/')
    return parts[parts.length - 1] || 'download'
  }

  // ==================== 파일 업로드 API (환경에 따라 자동 분기) ====================

  /**
   * 단일/다중 파일 업로드 (통합 - 환경에 따라 자동 분기)
   * - Production: S3 Presigned URL 방식
   * - 그 외: 기존 FormData 방식
   * @param {File|File[]} files - 단일 파일 또는 파일 배열
   * @param {Object} options - 업로드 옵션 { fileCode, fileExplain }
   * @returns {Promise} 업로드 결과
   */
  async uploadFiles(files, options = {}) {
    // Production 환경에서는 Presigned URL 방식 사용
    if (ENV.isProduction) {
      console.log(`🚀 [FILE] Production 환경 - Presigned URL 방식으로 업로드`)
      return this._uploadWithPresignedUrlCompat(files, options)
    }

    // 그 외 환경에서는 기존 FormData 방식 사용
    console.log(`📦 [FILE] ${ENV.ENV_NAME} 환경 - FormData 방식으로 업로드`)
    return this._uploadWithFormData(files, options)
  }

  /**
   * Presigned URL 방식 업로드 (기존 응답 형식과 호환)
   * @private
   */
  async _uploadWithPresignedUrlCompat(files, options = {}) {
    const fileArray = Array.isArray(files) ? files : [files]

    if (fileArray.length === 0) {
      throw new Error('업로드할 파일이 필요합니다.')
    }

    // 파일 검증
    const maxSize = 10 * 1024 * 1024 // 10MB
    fileArray.forEach(file => {
      if (file.size === 0) {
        throw new Error(`빈 파일은 업로드할 수 없습니다: ${file.name}`)
      }
      if (file.size > maxSize) {
        throw new Error(
            `파일 크기는 ${this.formatFileSize(maxSize)} 이하여야 합니다: ${file.name}`
        )
      }
    })

    console.log(
        `📤 [FILE] Presigned URL 업로드 시작: ${fileArray.length}개 파일 ` +
        `(총 ${this.formatFileSize(fileArray.reduce((sum, f) => sum + f.size, 0))})`
    )

    try {
      // 모든 파일을 병렬로 업로드
      const uploadResults = await Promise.all(
          fileArray.map(async (file) => {
            // 1. Presigned URL 발급
            const presignedData = await this.getPresignedUploadUrl(file.name, file.type)

            // 2. S3에 직접 업로드
            await this.uploadToS3(file, presignedData.presignedUrl)

            // 3. fileUrl 생성 (presignedUrl에서 쿼리 파라미터 제거)
            const fileUrl = presignedData.presignedUrl.split('?')[0]

            // 4. 기존 응답 형식과 호환되는 객체 반환
            return {
              id: presignedData.s3Key,
              fileUrl: fileUrl,
              fileKey: presignedData.s3Key,
              storeFileName: presignedData.storeFileName,
              orgFileNm: file.name,
              fileSize: file.size,
              contentType: file.type,
              fileExt: this.getFileExtension(file.name)
            }
          })
      )

      console.log(`✅ [FILE] Presigned URL 업로드 완료: ${fileArray.length}개 파일`)

      // 단일 파일인 경우 배열이 아닌 단일 객체 반환 (기존 방식과 동일)
      return {
        success: true,
        data: fileArray.length === 1 ? uploadResults[0] : uploadResults
      }
    } catch (error) {
      console.error(`❌ [FILE] Presigned URL 업로드 실패:`, error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * FormData 방식 업로드 (기존 방식)
   * @private
   */
  async _uploadWithFormData(files, options = {}) {
    const fileArray = Array.isArray(files) ? files : [files]

    if (fileArray.length === 0) {
      throw new Error('업로드할 파일이 필요합니다.')
    }

    // 파일 검증
    const maxSize = 10 * 1024 * 1024 // 10MB
    fileArray.forEach(file => {
      if (file.size === 0) {
        throw new Error(`빈 파일은 업로드할 수 없습니다: ${file.name}`)
      }
      if (file.size > maxSize) {
        throw new Error(
            `파일 크기는 ${this.formatFileSize(maxSize)} 이하여야 합니다: ${file.name}`
        )
      }
    })

    const formData = new FormData()

    // 모든 파일을 'files' 키로 추가
    fileArray.forEach(file => {
      formData.append('files', file)
    })

    if (options.fileCode) {
      formData.append('fileCode', options.fileCode)
    }

    if (options.fileExplain) {
      formData.append('fileExplain', options.fileExplain)
    }

    console.log(
        `📤 [FILE] FormData 업로드 시작: ${fileArray.length}개 파일 ` +
        `(총 ${this.formatFileSize(fileArray.reduce((sum, f) => sum + f.size, 0))})`
    )

    const response = await super.uploadFile('/files/bulk', formData)

    console.log(`✅ [FILE] FormData 업로드 완료: ${fileArray.length}개 파일`)

    // 단일 파일인 경우 배열이 아닌 단일 객체 반환
    return {
      ...response,
      data: fileArray.length === 1 ? response.data[0] : response.data
    }
  }

  // ==================== 파일 다운로드 API ====================

  /**
   * 파일 다운로드
   */
  async downloadFile(fileId) {
    if (!fileId) {
      throw new Error('파일 ID가 필요합니다.')
    }

    console.log(`📥 [FILE] 파일 다운로드 시작: fileId=${fileId}`)

    const response = await this.fetch(`/files/download/${fileId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error('파일 다운로드에 실패했습니다.')
    }

    const blob = await response.blob()
    const contentDisposition = response.headers.get('content-disposition')
    const fileName = this.extractFileName(contentDisposition)

    console.log(`✅ [FILE] 파일 다운로드 완료: ${fileName}`)

    return {
      blob,
      fileName,
      contentType: response.headers.get('content-type')
    }
  }

  /**
   * 파일 다운로드 트리거 (브라우저 다운로드 시작)
   */
  async triggerDownload(fileId) {
    const { blob, fileName } = await this.downloadFile(fileId)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    console.log(`💾 [FILE] 파일 다운로드 트리거 완료: ${fileName}`)
  }

  /**
   * 파일 정보 조회
   */
  async getFileInfo(fileId) {
    if (!fileId) {
      throw new Error('파일 ID가 필요합니다.')
    }

    console.log(`🔍 [FILE] 파일 정보 조회: fileId=${fileId}`)
    return await this.get(`/files/${fileId}`)
  }

  /**
   * 파일 목록 조회
   */
  async getFileList(params = {}) {
    const queryParams = {
      page: params.page || 0,
      size: params.size || 20,
      sort: params.sort || 'createdAt,desc',
      ...params
    }

    console.log(`📋 [FILE] 파일 목록 조회:`, queryParams)
    return await this.get('/files', queryParams)
  }

  // ==================== 파일 삭제 API ====================

  /**
   * 파일 삭제
   */
  async deleteFile(fileId) {
    if (!fileId) {
      throw new Error('파일 ID가 필요합니다.')
    }

    console.log(`🗑️ [FILE] 파일 삭제: fileId=${fileId}`)
    return await this.delete(`/files/${fileId}`)
  }

  /**
   * 다중 파일 삭제
   */
  async deleteFiles(fileIds) {
    if (!fileIds || fileIds.length === 0) {
      throw new Error('삭제할 파일 ID가 필요합니다.')
    }

    console.log(`🗑️ [FILE] 다중 파일 삭제: ${fileIds.length}개 파일`)

    const deletePromises = fileIds.map(id => this.deleteFile(id))
    const results = await Promise.allSettled(deletePromises)

    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failedCount = results.filter(r => r.status === 'rejected').length

    console.log(
        `✅ [FILE] 다중 파일 삭제 완료: 성공 ${successCount}개, 실패 ${failedCount}개`
    )

    return {
      success: successCount > 0,
      successCount,
      failedCount
    }
  }

  // ==================== 유틸리티 메서드 ====================

  /**
   * 이미지 파일 여부 확인
   */
  isImageFile(file) {
    if (!file) return false
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    return imageTypes.includes(file.type)
  }

  /**
   * 파일 확장자 추출
   */
  getFileExtension(fileName) {
    if (!fileName) return ''
    const lastDot = fileName.lastIndexOf('.')
    return lastDot !== -1 ? fileName.substring(lastDot + 1).toLowerCase() : ''
  }

  /**
   * 파일 크기 포맷팅
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Content-Disposition 헤더에서 파일명 추출
   */
  extractFileName(contentDisposition) {
    if (!contentDisposition) return 'download'

    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
    if (matches && matches[1]) {
      let filename = matches[1].replace(/['"]/g, '')
      try {
        filename = decodeURIComponent(filename)
      } catch (e) {
        console.warn('⚠️ [FILE] 파일명 디코딩 실패:', e)
      }
      return filename
    }

    return 'download'
  }

  /**
   * 이미지 미리보기 URL 생성
   */
  async createPreviewUrl(file) {
    if (!this.isImageFile(file)) {
      throw new Error('이미지 파일만 미리보기 가능합니다.')
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  /**
   * 파일 타입 아이콘 가져오기
   */
  getFileIcon(fileName) {
    const ext = this.getFileExtension(fileName)
    const iconMap = {
      jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image',
      pdf: 'file-pdf', doc: 'file-word', docx: 'file-word',
      xls: 'file-excel', xlsx: 'file-excel',
      ppt: 'file-powerpoint', pptx: 'file-powerpoint',
      zip: 'file-archive', rar: 'file-archive', '7z': 'file-archive',
      js: 'file-code', ts: 'file-code', java: 'file-code',
      html: 'file-code', css: 'file-code',
      mp4: 'file-video', avi: 'file-video', mov: 'file-video',
      mp3: 'file-audio', wav: 'file-audio'
    }
    return iconMap[ext] || 'file'
  }
}

// ==================== Export ====================

export const fileService = new FileService()
export default fileService

// ==================== Vue Composables ====================

export function useFile() {
  return {
    // 파일 업로드 (FormData 방식)
    upload: (file, options) => fileService.uploadFiles(file, options),
    uploadMultiple: (files, options) => fileService.uploadFiles(files, options),

    // 파일 업로드 (S3 Presigned URL 방식)
    uploadPresigned: (file, options) => fileService.uploadWithPresignedUrl(file, options),
    uploadMultiplePresigned: (files, options) => fileService.uploadMultipleWithPresignedUrl(files, options),
    getPresignedUploadUrl: (fileName, contentType) => fileService.getPresignedUploadUrl(fileName, contentType),
    uploadToS3: (file, presignedUrl) => fileService.uploadToS3(file, presignedUrl),

    // 파일 다운로드 (기존 방식)
    download: (fileId) => fileService.triggerDownload(fileId),
    downloadFile: (fileId) => fileService.downloadFile(fileId),

    // 파일 다운로드 (S3 Presigned URL 방식)
    downloadPresigned: (fileKey, fileName) => fileService.triggerDownloadWithPresignedUrl(fileKey, fileName),
    downloadFilePresigned: (fileKey, fileName) => fileService.downloadWithPresignedUrl(fileKey, fileName),
    getPresignedDownloadUrl: (fileKey) => fileService.getPresignedDownloadUrl(fileKey),

    // 파일 조회
    getInfo: (fileId) => fileService.getFileInfo(fileId),
    getList: (params) => fileService.getFileList(params),

    // 파일 삭제
    remove: (fileId) => fileService.deleteFile(fileId),
    removeMultiple: (fileIds) => fileService.deleteFiles(fileIds),

    // 유틸리티
    isImageFile: (file) => fileService.isImageFile(file),
    formatFileSize: (bytes) => fileService.formatFileSize(bytes),
    getFileIcon: (fileName) => fileService.getFileIcon(fileName),
    getFileExtension: (fileName) => fileService.getFileExtension(fileName),
    createPreview: (file) => fileService.createPreviewUrl(file)
  }
}