import { reactive, readonly } from 'vue'

const state = reactive({
  visible: false,
  type: 'confirm', // 'confirm' | 'alert' | 'danger' | 'login'
  title: '',
  message: '',
  confirmText: '확인',
  cancelText: '취소',
  resolve: null
})

function open({ type = 'confirm', title = '', message = '', confirmText, cancelText } = {}) {
  const defaults = {
    confirm: { confirmText: '확인', cancelText: '취소' },
    alert: { confirmText: '확인', cancelText: null },
    danger: { confirmText: '삭제', cancelText: '취소' },
    login: { confirmText: '로그인하기', cancelText: '나중에' }
  }

  const d = defaults[type] || defaults.confirm

  state.type = type
  state.title = title
  state.message = message
  state.confirmText = confirmText ?? d.confirmText
  state.cancelText = cancelText ?? d.cancelText
  state.visible = true

  return new Promise((resolve) => {
    state.resolve = resolve
  })
}

function dismiss() {
  if (state.resolve) state.resolve(null)
  close()
}

function openLoginRequired(message = '이 기능을 사용하려면 로그인이 필요합니다.') {
  return open({
    type: 'login',
    title: '로그인이 필요합니다',
    message
  })
}

function confirm(result = true) {
  if (state.resolve) state.resolve(result)
  close()
}

function cancel() {
  if (state.resolve) state.resolve(false)
  close()
}

function close() {
  state.visible = false
  state.resolve = null
}

export function useConfirmDialog() {
  return {
    state: readonly(state),
    open,
    openLoginRequired,
    confirm,
    cancel,
    dismiss
  }
}
