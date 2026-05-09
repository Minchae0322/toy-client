import { reactive, readonly } from 'vue'

const state = reactive({
  visible: false,
  message: '',
  resolve: null
})

function openLoginPrompt(message = '') {
  state.message = message
  state.visible = true
  return new Promise((resolve) => {
    state.resolve = resolve
  })
}

function closeLoginPrompt(result = null) {
  if (state.resolve) state.resolve(result)
  state.visible = false
  state.resolve = null
  state.message = ''
}

export function useLoginPrompt() {
  return {
    state: readonly(state),
    openLoginPrompt,
    closeLoginPrompt
  }
}
