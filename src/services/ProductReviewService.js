// services/ProductReviewService.js
// 상품 리뷰 API (CONTENT 서비스)
// 백엔드 매핑: /products/{productId}/reviews

import { BaseApiService } from './BaseApiService.js'
import { getServiceUrl } from '@/config/env.js'

class ProductReviewService extends BaseApiService {
  constructor() {
    super(getServiceUrl('CONTENT'), 'CONTENT')
  }

  /**
   * 리뷰 작성
   * POST /products/{productId}/reviews
   * 첨부파일은 현재 미지원 (백엔드는 attachmentFileInfos 받지만 빈 배열로 보냄)
   */
  async createReview(productId, { rating, comment }) {
    return await this.post(`/products/${productId}/reviews`, {
      productId,
      rating,
      comment: comment ?? '',
      attachmentFileInfos: [],
    })
  }

  /**
   * 리뷰 목록 조회
   * GET /products/{productId}/reviews?page=&size=&sort=
   */
  async getReviews(productId, { page = 0, size = 10, sort = 'createdAt,DESC' } = {}) {
    return await this.get(`/products/${productId}/reviews`, { page, size, sort })
  }

  /**
   * 리뷰 수정
   * PUT /products/{productId}/reviews/{reviewId}
   */
  async updateReview(productId, reviewId, { rating, comment }) {
    return await this.put(`/products/${productId}/reviews/${reviewId}`, {
      rating,
      comment: comment ?? '',
    })
  }

  /**
   * 리뷰 삭제
   * DELETE /products/{productId}/reviews/{reviewId}
   */
  async deleteReview(productId, reviewId) {
    return await this.delete(`/products/${productId}/reviews/${reviewId}`)
  }
}

export const productReviewService = new ProductReviewService()
export default productReviewService
