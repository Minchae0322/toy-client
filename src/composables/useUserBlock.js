// src/composables/useUserBlock.js
// userBlock store 래퍼. 컴포넌트에서 단일 import 로 사용.

import { storeToRefs } from 'pinia'
import { useUserBlockStore } from '@/stores/userBlock.js'
import { useConfirmDialog } from '@/composables/useConfirmDialog'

export function useUserBlock() {
  const store = useUserBlockStore()
  const { blockedItems, blockedIds, blockedSet } = storeToRefs(store)

  /**
   * confirm 다이얼로그를 띄우고 차단 — UI 에서 자주 쓰는 패턴
   * @returns {Promise<boolean>} 실제로 차단되었는지
   */
  async function blockWithConfirm(userId, meta = null) {
    const { open } = useConfirmDialog()
    const nickname = meta?.nickname
    const confirmed = await open({
      type: 'confirm',
      title: nickname ? `${nickname}님을 차단할까요?` : '이 사용자를 차단할까요?',
      message: '차단하면 해당 사용자의 게시물·댓글·메시지가 보이지 않게 됩니다. 차단 해제는 [계정 설정 → 차단한 사용자] 에서 할 수 있어요.',
      confirmText: '차단',
      cancelText: '취소',
    })
    if (!confirmed) return false

    const result = store.block(userId, meta)
    if (result === 'self') {
      await open({ type: 'alert', title: '차단 불가', message: '본인 계정은 차단할 수 없어요.' })
      return false
    }
    if (result === 'invalid') {
      await open({ type: 'alert', title: '오류', message: '사용자 정보를 확인할 수 없어요.' })
      return false
    }
    return true
  }

  return {
    blockedItems,
    blockedIds,
    blockedSet,
    isBlocked: (id) => store.isBlocked(id),
    block: (id, meta) => store.block(id, meta),
    unblock: (id) => store.unblock(id),
    filterBlocked: (list, getUserId) => store.filterBlocked(list, getUserId),
    load: (currentUserId) => store.load(currentUserId),
    clear: () => store.clear(),
    blockWithConfirm,
  }
}
