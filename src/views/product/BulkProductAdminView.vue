<template>
  <div class="admin-container">
    <main class="main-content">
      <header class="page-header">
        <div class="header-left">
          <h2>벌크 제품 등록</h2>
          <p class="header-desc">엑셀 데이터 기반 이미지 업로드 및 SQL 생성</p>
        </div>
        <div class="header-right">
          <span class="admin-badge">관리자</span>
          <button class="btn-back" @click="$router.push('/admin/products')">
            상품 관리로 돌아가기
          </button>
        </div>
      </header>

      <div class="iframe-wrapper">
        <iframe
          ref="bulkFrame"
          src="/admin/bulk-product.html"
          frameborder="0"
          class="bulk-iframe"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const bulkFrame = ref(null)
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: #f5f6fa;
}

.main-content {
  max-width: 1500px;
  margin: 0 auto;
  padding: 16px 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header h2 {
  color: #333;
  font-size: 20px;
  font-weight: 700;
}

.header-desc {
  color: #999;
  font-size: 13px;
  margin-top: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-badge {
  background: #4a7cff;
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.btn-back {
  padding: 8px 16px;
  background: #f0f1f3;
  color: #555;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.15s;
}

.btn-back:hover {
  background: #e4e6e9;
}

.iframe-wrapper {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .04);
}

.bulk-iframe {
  width: 100%;
  height: calc(100vh - 120px);
  background: #f5f6fa;
}
</style>
