<template>
  <div class="blocked-users-page">
    <header class="page-header">
      <button @click="goBack" class="back-btn" aria-label="뒤로 가기">
        <ChevronLeft :size="22" />
      </button>
      <h1 class="page-title">차단한 사용자</h1>
      <span class="page-spacer" />
    </header>

    <main class="page-main">
      <p class="page-desc">
        차단한 사용자의 게시물·댓글·메시지가 보이지 않게 됩니다.
        해제하면 다시 표시됩니다.
      </p>

      <!-- 빈 상태 -->
      <div v-if="blockedItems.length === 0" class="empty-state">
        <UserX :size="40" :stroke-width="1.6" />
        <h2 class="empty-title">차단한 사용자가 없습니다</h2>
        <p class="empty-desc">
          게시물·댓글의 ⋮ 메뉴 또는 신고 화면에서 차단할 수 있어요.
        </p>
      </div>

      <!-- 목록 -->
      <ul v-else class="block-list">
        <li v-for="item in sortedItems" :key="item.userId" class="block-row">
          <div class="block-user">
            <div class="avatar">
              <img v-if="item.profileImage" :src="item.profileImage" :alt="item.nickname || '사용자'" />
              <span v-else class="avatar-fallback">
                <User :size="20" />
              </span>
            </div>
            <div class="block-meta">
              <span class="block-name">{{ item.nickname || `사용자 #${item.userId}` }}</span>
              <span class="block-date">{{ formatDate(item.blockedAt) }} 차단</span>
            </div>
          </div>
          <button class="btn-unblock" @click="onUnblock(item)">차단 해제</button>
        </li>
      </ul>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, User, UserX } from 'lucide-vue-next'
import { useUserBlock } from '@/composables/useUserBlock.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

const router = useRouter()
const { open } = useConfirmDialog()
const { blockedItems, unblock } = useUserBlock()

const sortedItems = computed(() => {
  return [...blockedItems.value].sort((a, b) => (b.blockedAt || 0) - (a.blockedAt || 0))
})

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'AccountSettings' })
}

const onUnblock = async (item) => {
  const name = item.nickname || `사용자 #${item.userId}`
  const confirmed = await open({
    type: 'confirm',
    title: '차단을 해제할까요?',
    message: `${name}의 게시물·댓글·메시지가 다시 보이게 됩니다.`,
    confirmText: '해제',
    cancelText: '취소',
  })
  if (!confirmed) return
  unblock(item.userId)
}

const formatDate = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}
</script>

<style scoped>
.blocked-users-page {
  min-height: 100vh;
  background: #ffffff;
}

.page-header {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 12px;
  border-bottom: 1px solid #ede9f8;
  position: sticky;
  top: 0;
  background: #ffffff;
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
  color: #4b5563;
  cursor: pointer;
}

.back-btn:hover { background: #f5f5f7; }

.page-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #0a0e1a;
  letter-spacing: -0.02em;
  margin: 0;
}

.page-spacer { width: 36px; }

.page-main {
  max-width: 640px;
  margin: 0 auto;
  padding: 20px 16px 64px;
}

.page-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.55;
}

.empty-state {
  margin-top: 48px;
  padding: 36px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #9ca3af;
}

.empty-title {
  font-size: 15px;
  font-weight: 700;
  color: #374151;
  margin: 6px 0 0;
}

.empty-desc {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.5;
}

.block-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.block-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid #ede9f8;
  border-radius: 12px;
  background: #ffffff;
}

.block-user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar img { width: 100%; height: 100%; object-fit: cover; }

.avatar-fallback {
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
}

.block-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.block-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.block-date {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

.btn-unblock {
  flex-shrink: 0;
  padding: 8px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
  color: #374151;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.btn-unblock:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}
</style>
