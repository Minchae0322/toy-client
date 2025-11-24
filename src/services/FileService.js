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
    const baseURL = `${getServiceUrl('AUTH')}/api`
    super(baseURL, 'FILE')
    console.log(`📁 [FILE] File Server URL: ${this.baseURL}`)
    console.log(`🌍 [FILE] Environment: ${ENV.MODE}`)
  }

  // ==================== 파일 업로드 API ====================

  /**
   * 단일/다중 파일 업로드 (통합 - Batch 처리)
   * @param {File|File[]} files - 단일 파일 또는 파일 배열
   * @param {Object} options - 업로드 옵션
   * @returns {Promise} 업로드 결과
   */
  async uploadFiles(files, options = {}) {
    // 단일 파일을 배열로 변환
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

    // 모든 파일을 'files' 키로 추가 (서버에서 List<MultipartFile>로 받음)
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
        `📤 [FILE] 파일 업로드 시작: ${fileArray.length}개 파일 ` +
        `(총 ${this.formatFileSize(fileArray.reduce((sum, f) => sum + f.size, 0))})`
    )

    // BaseApiService의 uploadFile 메서드 호출 (Batch로 한 번에 전송)
    const response = await super.uploadFile('/files/bulk', formData)

    console.log(`✅ [FILE] 파일 업로드 완료: ${fileArray.length}개 파일`)

    // 단일 파일인 경우 배열이 아닌 단일 객체 반환
    return {
      ...response,
      data: fileArray.length === 1 ? response.data[0] : response.data
    }
  }

  /**
   * 단일 파일 업로드 (하위 호환성 유지)
   */
  async uploadFile(file, options = {}) {
    return this.uploadFiles(file, options)
  }

  /**
   * 이미지 파일 업로드
   */
  async uploadImage(imageFile, imageType = 'PRODUCT') {
    if (!this.isImageFile(imageFile)) {
      throw new Error('이미지 파일만 업로드 가능합니다.')
    }

    console.log(`🖼️ [FILE] 이미지 업로드: ${imageFile.name}, 타입: ${imageType}`)

    return this.uploadFiles(imageFile, {
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

    console.log(
        `🖼️ [FILE] 다중 이미지 업로드: ${validImages.length}개 이미지, 타입: ${imageType}`
    )

    return this.uploadFiles(validImages, {
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

    console.log(`📥 [FILE] 파일 다운로드 시작: fileId=${fileId}`)

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

      console.log(`✅ [FILE] 파일 다운로드 완료: ${fileName}`)

      return {
        blob,
        fileName,
        contentType: response.headers.get('content-type')
      }
    } catch (error) {
      console.error('❌ [FILE] 파일 다운로드 실패:', error)
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

      console.log(`💾 [FILE] 파일 다운로드 트리거 완료: ${fileName}`)
    } catch (error) {
      console.error('❌ [FILE] 파일 다운로드 트리거 실패:', error)
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
   * 다중 파일 삭제 (Batch)
   */
  async deleteFiles(fileIds) {
    if (!fileIds || fileIds.length === 0) {
      throw new Error('삭제할 파일 ID가 필요합니다.')
    }

    console.log(`🗑️ [FILE] 다중 파일 삭제: ${fileIds.length}개 파일`)

    // 서버에 Batch 삭제 API가 있다면 사용
    // return await this.delete('/files/batch', { ids: fileIds })

    // 없다면 Promise.allSettled 사용
    const deletePromises = fileIds.map(id => this.deleteFile(id))

    try {
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
    } catch (error) {
      console.error('❌ [FILE] 다중 파일 삭제 실패:', error)
      throw error
    }
  }

  // ==================== 유틸리티 메서드 ====================

  /**
   * 이미지 파일 여부 확인
   */
  isImageFile(file) {
    if (!file) return false

    const imageTypes = [
      'image/jpeg', 'image/jpg', 'image/png',
      'image/gif', 'image/webp'
    ]
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
    console.log('Environment:', ENV.MODE)
    console.log('Base URL:', this.baseURL)
    console.log('파일 업로드: Batch 방식 (단일/다중 통합)')
    console.log('파일 다운로드: 브라우저 다운로드 트리거')
    console.log('이미지 처리: 이미지 전용 업로드 및 미리보기')
    console.log('파일 관리: 조회, 삭제 기능')
    this.debugStatus()
    console.groupEnd()
  }
}

// ==================== 싱글톤 인스턴스 ====================

export const fileService = new FileService()
export default fileService

// ==================== Vue Composables ====================

export function useFile() {
  const service = new FileService()

  const upload = async (file, options = {}) => {
    try {
      const response = await service.uploadFiles(file, options)
      return {
        success: true,
        data: response.data,
        message: response.message || '파일이 업로드되었습니다.'
      }
    } catch (error) {
      console.error('❌ [FILE] 파일 업로드 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const uploadMultiple = async (files, options = {}) => {
    try {
      const response = await service.uploadFiles(files, options)
      const fileCount = Array.isArray(response.data) ? response.data.length : 1

      return {
        success: true,
        data: response.data,
        message: `${fileCount}개 파일이 업로드되었습니다.`
      }
    } catch (error) {
      console.error('❌ [FILE] 다중 파일 업로드 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const uploadImage = async (imageFile, imageType = 'PRODUCT') => {
    try {
      const response = await service.uploadImage(imageFile, imageType)
      return {
        success: true,
        data: response.data,
        message: response.message || '이미지가 업로드되었습니다.'
      }
    } catch (error) {
      console.error('❌ [FILE] 이미지 업로드 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const download = async (fileId) => {
    try {
      await service.triggerDownload(fileId)
      return {
        success: true,
        message: '파일 다운로드를 시작합니다.'
      }
    } catch (error) {
      console.error('❌ [FILE] 파일 다운로드 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const remove = async (fileId) => {
    try {
      const response = await service.deleteFile(fileId)
      return {
        success: true,
        message: response.message || '파일이 삭제되었습니다.'
      }
    } catch (error) {
      console.error('❌ [FILE] 파일 삭제 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const getInfo = async (fileId) => {
    try {
      const response = await service.getFileInfo(fileId)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('❌ [FILE] 파일 정보 조회 실패:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  const createPreview = async (file) => {
    try {
      const previewUrl = await service.createPreviewUrl(file)
      return {
        success: true,
        previewUrl
      }
    } catch (error) {
      console.error('❌ [FILE] 미리보기 생성 실패:', error)
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
    uploadImages: (files, type) => service.uploadImages(files, type),
    download,
    downloadFile: (fileId) => service.downloadFile(fileId),
    getInfo,
    getList: (params) => service.getFileList(params),
    remove,
    removeMultiple: (fileIds) => service.deleteFiles(fileIds),
    isImageFile: (file) => service.isImageFile(file),
    formatFileSize: (bytes) => service.formatFileSize(bytes),
    getFileIcon: (fileName) => service.getFileIcon(fileName),
    getFileExtension: (fileName) => service.getFileExtension(fileName),
    createPreview,
    testConnection: () => service.testConnection(),
    debugStatus: () => service.debugFileStatus()
  }
}