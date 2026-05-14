<template>
  <div class="account-settings-page">
    <header class="page-header">
      <button @click="goBack" class="back-btn" aria-label="뒤로 가기">
        <ChevronLeft :size="22" />
      </button>
      <h1 class="page-title">계정 설정</h1>
      <span class="page-spacer" />
    </header>

    <main class="page-main">
      <!-- 계정 정보 -->
      <section class="card" v-if="user">
        <h2 class="card-title">계정 정보</h2>
        <div class="info-row">
          <span class="info-label">닉네임</span>
          <span class="info-value">{{ user.nickname || user.username || '-' }}</span>
        </div>
      </section>

      <!-- 안전/관리 -->
      <section class="card">
        <h2 class="card-title">안전 / 관리</h2>
        <button class="policy-row" @click="goToBlockedUsers">
          <span>차단한 사용자</span>
          <ChevronRight :size="16" />
        </button>
      </section>

      <!-- 약관 및 정책 -->
      <section class="card">
        <h2 class="card-title">약관 및 정책</h2>
        <button class="policy-row" @click="openTerms('terms')">
          <span>이용약관</span>
          <ChevronRight :size="16" />
        </button>
        <button class="policy-row" @click="openTerms('privacy')">
          <span>개인정보처리방침</span>
          <ChevronRight :size="16" />
        </button>
      </section>

      <!-- 회원 탈퇴 -->
      <section class="card danger-card">
        <h2 class="card-title">회원 탈퇴</h2>
        <p class="card-desc">
          회원 탈퇴 시 다음 정보가 <strong>영구 삭제</strong>되며 복구할 수 없습니다.
        </p>
        <ul class="delete-list">
          <li>프로필 정보 (닉네임, 프로필 사진)</li>
          <li>작성한 피드, 배틀, 한줄 변론</li>
          <li>채팅 내역 및 알림</li>
          <li>보유한 EXP, 뱃지, 컬렉션</li>
          <li>팔로우/팔로워 관계</li>
        </ul>
        <button
          class="btn-delete"
          :disabled="submitting"
          @click="handleDeleteAccount"
        >
          <Trash2 :size="16" />
          <span>{{ submitting ? '처리 중...' : '회원 탈퇴' }}</span>
        </button>
      </section>
    </main>

    <TermsModal
      :visible="termsModalVisible"
      :initial-tab="termsInitialTab"
      @close="termsModalVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-vue-next'
import { authService } from '@/services/AuthService.js'
import { getUserInfo } from '@/utils/auth.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import TermsModal from '@/components/login/TermsModal.vue'

const router = useRouter()
const { open } = useConfirmDialog()

const user = ref(null)
const submitting = ref(false)

const termsModalVisible = ref(false)
const termsInitialTab = ref('terms')
const openTerms = (tab) => {
  termsInitialTab.value = tab
  termsModalVisible.value = true
}

const goToBlockedUsers = () => router.push({ name: 'BlockedUsers' })

onMounted(() => {
  user.value = getUserInfo()
})

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'MyPage' })
}

const handleDeleteAccount = async () => {
  const confirmed = await open({
    type: 'danger',
    title: '정말 탈퇴하시겠어요?',
    message: '계정과 모든 데이터가 영구 삭제되며 복구할 수 없습니다.',
    confirmText: '탈퇴',
    cancelText: '취소',
  })
  if (!confirmed) return

  submitting.value = true
  try {
    const response = await authService.deleteAccount()
    if (!response?.success) {
      throw new Error(response?.message || '회원 탈퇴에 실패했습니다.')
    }
    await open({
      type: 'alert',
      title: '탈퇴 완료',
      message: '그동안 요거뜨를 이용해 주셔서 감사합니다.',
    })
    router.replace({ name: 'Login' })
  } catch (err) {
    console.error('[AccountSettings] 회원 탈퇴 실패:', err)
    await open({
      type: 'alert',
      title: '오류',
      message: err.message || '회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.account-settings-page {
  min-height: 100vh;
  background: var(--bg-base);
}

.page-header {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 12px;
  border-bottom: 1px solid var(--border-default);
  position: sticky;
  top: 0;
  background: var(--bg-elevated);
  z-index: 10;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--c-text-600);
  cursor: pointer;
}

.back-btn:hover { background: var(--bg-subtle); }

.page-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin: 0;
}

.page-spacer { width: 36px; }

.page-main {
  max-width: 640px;
  margin: 0 auto;
  padding: 20px 16px 64px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  padding: 18px;
}

.card-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 12px;
  letter-spacing: -0.02em;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid var(--bg-subtle);
  font-size: 14px;
}

.info-row:first-of-type { border-top: none; }

.info-label { color: var(--c-text-500); }

.info-value { color: var(--text-primary); font-weight: 600; }

.policy-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 0;
  border: none;
  border-top: 1px solid var(--bg-subtle);
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: color 0.15s ease;
}

.policy-row:first-of-type { border-top: none; }

.policy-row:hover { color: var(--c-brand); }

.danger-card {
  border-color: var(--c-danger-soft);
  background: #fff7f7;
}

.card-desc {
  font-size: 13px;
  color: var(--c-text-600);
  line-height: 1.55;
  margin: 0 0 12px;
}

.card-desc strong { color: #b91c1c; font-weight: 700; }

.delete-list {
  margin: 0 0 16px;
  padding-left: 18px;
  font-size: 13px;
  color: var(--c-text-600);
  line-height: 1.7;
}

.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--c-danger);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-delete:hover:not(:disabled) { background: #b91c1c; }

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
