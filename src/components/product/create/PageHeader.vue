<template>
  <div class="page-header">
    <div class="header-content">
      <div class="title-section">
        <div class="step-badge">상품 등록</div>
        <h1>새 상품을 등록해주세요</h1>
        <p>등록하신 상품은 관리자 승인 후 다른 사용자들도 이용할 수 있습니다</p>
      </div>

      <div class="approval-info">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="#059669" stroke-width="1.5"/>
          <path d="M10 6V10L12.5 12.5" stroke="#059669" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>보통 2-3시간 내 승인됩니다</span>
      </div>
    </div>

    <div class="author-card">
      <div class="author-info">
        <div class="author-avatar">{{ getInitial(userNickname) }}</div>
        <div class="author-details">
          <div class="author-name">{{ userNickname }}</div>
          <div class="author-role" :class="getRoleClass(userRole)">
            {{ getRoleText(userRole) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  userNickname: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    default: 'USER'
  }
})

const getInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : '?'
}

const getRoleClass = (role) => {
  return role?.toLowerCase() || 'user'
}

const getRoleText = (role) => {
  return role === 'ADMIN' ? '관리자' : '일반회원'
}
</script>

<style scoped>
.page-header {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  border: 1px solid #F3F4F6;
}

.header-content {
  text-align: center;
  margin-bottom: 32px;
}

.step-badge {
  display: inline-block;
  padding: 6px 16px;
  background: #ECFDF5;
  color: #059669;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
  letter-spacing: -0.01em;
}

.title-section h1 {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.title-section p {
  font-size: 15px;
  color: #6B7280;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.approval-info {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #F0FDF4;
  border: 1px solid #D1FAE5;
  border-radius: 10px;
  margin-top: 20px;
  font-size: 14px;
  color: #059669;
  font-weight: 600;
}

.author-card {
  padding: 20px;
  background: #FAFAFA;
  border-radius: 12px;
  border: 1px solid #F3F4F6;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.author-details {
  flex: 1;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

.author-role {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.author-role.admin {
  background: #FEE2E2;
  color: #DC2626;
}

.author-role.user {
  background: #ECFDF5;
  color: #059669;
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px;
  }

  .title-section h1 {
    font-size: 24px;
  }

  .title-section p {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 20px;
  }

  .title-section h1 {
    font-size: 22px;
  }

  .approval-info {
    font-size: 13px;
  }
}
</style>