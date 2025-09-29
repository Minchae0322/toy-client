// services/FileService.js
// 파일 업로드/다운로드 관련 API 서비스 (Fetch API 기반)

import { BaseApiService } from './BaseApiService.js'

/**
 * 파일 관리 서비스
 * File Server와의 통신을 담당
 */
class FileService extends BaseApiService {
  constructor() {
    const baseURL = import.meta.env.DEV
        ? 'http://localhost:8081/api'
        : `${import.meta.env.VITE_API_BASE_URL}/api`

    super(baseURL, 'FILE')
  }

  // ==================== 파일 업로드 API ====================

  /**
   * 단일 파일 업로드
   */
  async uploadFile(file, options = {}) {
    if (!file) {
      throw new Error('업로드할 파일이 필요합니다.')
    }

    // 기본 검증만 수행
    if (file.size === 0) {
      throw new Error('빈 파일은 업로드할 수 없습니다.')
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error(`파일 크기는 ${this.formatFileSize(maxSize)} 이하여야 합니다.`)
    }

    const formData = new FormData()

    // 원본 파일 그대로 전송 (서버에서 파일명 처리)
    formData.append('file', file)

    if (options.fileCode) {
      formData.append('fileCode', options.fileCode)
    }

    if (options.fileExplain) {
      formData.append('fileExplain', options.fileExplain)
    }

    // BaseApiService의 uploadFile 메서드 호출
    return await super.uploadFile('/files/upload', formData)
  }

  /**
   * 다중 파일 업로드
   */
  async uploadFiles(files, options = {}) {
    if (!files || files.length === 0) {
      throw new Error('업로드할 파일이 필요합니다.')
    }

    const uploadPromises = Array.from(files).map(file =>
        this.uploadFile(file, options)
    )

    try {
      const results = await Promise.allSettled(uploadPromises)

      const successResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value.data)

      const failedResults = results
      .filter(result => result.status === 'rejected')
      .map(result => result.reason)

      if (failedResults.length > 0) {
        console.warn('[FILE] 일부 파일 업로드 실패:', failedResults)
      }

      return {
        success: successResults.length > 0,
        data: successResults,
        failedCount: failedResults.length,
        errors: failedResults
      }
    } catch (error) {
      console.error('[FILE] 다중 파일 업로드 실패:', error)
      throw error
    }
  }

  /**
   * 이미지 파일 업로드 (이미지 전용)
   */
  async uploadImage(imageFile, imageType = 'PRODUCT') {
    if (!this.isImageFile(imageFile)) {
      throw new Error('이미지 파일만 업로드 가능합니다.')
    }

    return this.uploadFile(imageFile, {
      fileCode: imageType,
      fileExplain: `${imageType} 이미지`
    })
  }

  /**
   * 다중 이미지 업로드
   */
  async uploadImages(imageFiles, imageType = 'PRODUCT') {
    const validImages = Array.from(imageFiles).filter(file =>
        this.isImageFile(file)
    )

    if (validImages.length === 0) {
      throw new Error('유효한 이미지 파일이 없습니다.')
    }

    return await this.uploadFiles(validImages, {
      fileCode: imageType
    })
  }

  // ==================== 파일 다운로드 API ====================

  /**
   * 파일 다운로드
   */
  async downloadFile(fileId) {
    if (!fileId) {
      throw new Error('파일 ID가 필요합니다.')
    }

    try {
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

      return {
        blob,
        fileName,
        contentType: response.headers.get('content-type')
      }
    } catch (error) {
      console.error('[FILE] 파일 다운로드 실패:', error)
      throw error
    }
  }

  /**
   * 파일 다운로드 트리거 (브라우저 다운로드 시작)
   */
  async triggerDownload(fileId) {
    try {
      const { blob, fileName } = await this.downloadFile(fileId)

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log('[FILE] 파일 다운로드 시작:', fileName)
    } catch (error) {
      console.error('[FILE] 파일 다운로드 트리거 실패:', error)
      throw error
    }
  }

  /**
   * 파일 정보 조회
   */
  async getFileInfo(fileId) {
    if (!fileId) {
      throw new Error('파일 ID가 필요합니다.')
    }

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

    return await this.delete(`/files/${fileId}`)
  }

  /**
   * 다중 파일 삭제
   */
  async deleteFiles(fileIds) {
    if (!fileIds || fileIds.length === 0) {
      throw new Error('삭제할 파일 ID가 필요합니다.')
    }

    const deletePromises = fileIds.map(id => this.deleteFile(id))

    try {
      const results = await Promise.allSettled(deletePromises)

      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failedCount = results.filter(r => r.status === 'rejected').length

      return {
        success: successCount > 0,
        successCount,
        failedCount
      }
    } catch (error) {
      console.error('[FILE] 다중 파일 삭제 실패:', error)
      throw error
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
        console.warn('[FILE] 파일명 디코딩 실패:', e)
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

      reader.onload = (e) => {
        resolve(e.target.result)
      }

      reader.onerror = (error) => {
        reject(error)
      }

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

  // ==================== 디버깅 ====================

  debugFileStatus() {
    console.group('🔍 [FILE] 파일 서비스 상태')
    console.log('파일 업로드: 단일/다중 파일 지원')
    console.log('파일 다운로드: 브라우저 다운로드 트리거')
    console.log('이미지 처리: 이미지 전용 업로드 및 미리보기')
    console.log('파일 관리: 조회, 삭제 기능')
    this.debugStatus()
    console.groupEnd()
  }
}

// ==================== Vue Composables ====================

export function useFile() {
  const fileService = new FileService()

  const upload = async (file, options = {}) => {
    try {
      const response = await fileService.uploadFile(file, options)
      return {
        success: true,
        data: response.data,
        message: response.message || '파일이 업로드되었습니다.'
      }
    } catch (error) {
      console.error('[FILE] 파일 업로드 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const uploadMultiple = async (files, options = {}) => {
    try {
      const response = await fileService.uploadFiles(files, options)
      return {
        success: response.success,
        data: response.data,
        failedCount: response.failedCount,
        message: `${response.data.length}개 파일이 업로드되었습니다.`
      }
    } catch (error) {
      console.error('[FILE] 다중 파일 업로드 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const uploadImage = async (imageFile, imageType = 'PRODUCT') => {
    try {
      const response = await fileService.uploadImage(imageFile, imageType)
      return {
        success: true,
        data: response.data,
        message: response.message || '이미지가 업로드되었습니다.'
      }
    } catch (error) {
      console.error('[FILE] 이미지 업로드 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const download = async (fileId) => {
    try {
      await fileService.triggerDownload(fileId)
      return {
        success: true,
        message: '파일 다운로드를 시작합니다.'
      }
    } catch (error) {
      console.error('[FILE] 파일 다운로드 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const remove = async (fileId) => {
    try {
      const response = await fileService.deleteFile(fileId)
      return {
        success: true,
        message: response.message || '파일이 삭제되었습니다.'
      }
    } catch (error) {
      console.error('[FILE] 파일 삭제 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const getInfo = async (fileId) => {
    try {
      const response = await fileService.getFileInfo(fileId)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('[FILE] 파일 정보 조회 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const createPreview = async (file) => {
    try {
      const previewUrl = await fileService.createPreviewUrl(file)
      return {
        success: true,
        previewUrl
      }
    } catch (error) {
      console.error('[FILE] 미리보기 생성 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  return {
    upload,
    uploadMultiple,
    uploadImage,
    uploadImages: (files, type) => fileService.uploadImages(files, type),
    download,
    downloadFile: (fileId) => fileService.downloadFile(fileId),
    getInfo,
    getList: (params) => fileService.getFileList(params),
    remove,
    removeMultiple: (fileIds) => fileService.deleteFiles(fileIds),
    isImageFile: (file) => fileService.isImageFile(file),
    formatFileSize: (bytes) => fileService.formatFileSize(bytes),
    getFileIcon: (fileName) => fileService.getFileIcon(fileName),
    getFileExtension: (fileName) => fileService.getFileExtension(fileName),
    createPreview,
    testConnection: () => fileService.testConnection(),
    debugStatus: () => fileService.debugFileStatus()
  }
}

export const fileService = new FileService()
export default fileService