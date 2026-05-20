import { ref } from 'vue'

// 알림 드롭다운이 열려 있을 때 모바일 FAB(글쓰기) 등 겹치는 요소를 숨기기 위한 공유 상태.
// 모듈 스코프 ref 라 import 마다 동일 인스턴스를 공유.
const isNotificationPanelOpen = ref(false)

export function useNotificationPanelMode() {
  return { isNotificationPanelOpen }
}
