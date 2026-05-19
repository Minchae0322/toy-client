import { ref } from 'vue'

// 모바일 채팅 디테일 진입 시 전역 헤더를 숨기기 위한 공유 상태.
// 모듈 스코프 ref 라 import 마다 동일 인스턴스를 공유.
const isChatDetailOpen = ref(false)

export function useChatDetailMode() {
  return { isChatDetailOpen }
}
