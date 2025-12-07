<template>
  <Transition name="fade">
    <div v-if="show" class="room-menu-overlay" @click="$emit('update:show', false)">
      <Transition name="slide-up">
        <div v-if="show" class="room-menu" @click.stop>
          <div class="menu-header">
            <h3>채팅 설정</h3>
            <button @click="$emit('update:show', false)" class="close-btn">
              <X :size="20" />
            </button>
          </div>

          <div class="menu-content">
            <button class="menu-item" @click="$emit('show-participants')">
              <div class="menu-icon">
                <Users :size="20" />
              </div>
              <div class="menu-text">
                <span class="menu-label">참여자 보기</span>
                <span class="menu-desc">채팅방 참여자 목록</span>
              </div>
              <ChevronRight :size="18" class="menu-arrow" />
            </button>

            <button class="menu-item" @click="$emit('search-messages')">
              <div class="menu-icon">
                <Search :size="20" />
              </div>
              <div class="menu-text">
                <span class="menu-label">메시지 검색</span>
                <span class="menu-desc">대화 내용 검색하기</span>
              </div>
              <ChevronRight :size="18" class="menu-arrow" />
            </button>

            <button class="menu-item" @click="$emit('toggle-notification')">
              <div class="menu-icon">
                <Bell :size="20" />
              </div>
              <div class="menu-text">
                <span class="menu-label">알림 설정</span>
                <span class="menu-desc">알림 켜기/끄기</span>
              </div>
              <ChevronRight :size="18" class="menu-arrow" />
            </button>

            <button class="menu-item" @click="$emit('toggle-device-info')">
              <div class="menu-icon">
                <Monitor :size="20" />
              </div>
              <div class="menu-text">
                <span class="menu-label">디바이스 정보</span>
                <span class="menu-desc">연결 상태 확인</span>
              </div>
              <ChevronRight :size="18" class="menu-arrow" />
            </button>

            <button class="menu-item" @click="$emit('reconnect')">
              <div class="menu-icon accent">
                <RefreshCw :size="20" />
              </div>
              <div class="menu-text">
                <span class="menu-label">연결 새로고침</span>
                <span class="menu-desc">채팅 연결 재시도</span>
              </div>
              <ChevronRight :size="18" class="menu-arrow" />
            </button>
          </div>

          <div class="menu-footer">
            <button class="menu-item danger" @click="$emit('leave-room')">
              <div class="menu-icon danger">
                <LogOut :size="20" />
              </div>
              <div class="menu-text">
                <span class="menu-label">채팅방 나가기</span>
                <span class="menu-desc">대화 내용이 삭제됩니다</span>
              </div>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import {
  Users, Search, Bell, Monitor, RefreshCw, LogOut, X, ChevronRight
} from 'lucide-vue-next'

defineProps({
  show: { type: Boolean, default: false }
})

defineEmits([
  'update:show',
  'show-participants',
  'search-messages',
  'toggle-notification',
  'toggle-device-info',
  'reconnect',
  'leave-room'
])
</script>

<style scoped>
.room-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.room-menu {
  background: #FFFFFF;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .room-menu-overlay {
    align-items: center;
  }

  .room-menu {
    border-radius: 20px;
    max-height: 70vh;
  }
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #E2E8F0;
}

.menu-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #F5F5F5;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #EEEEEE;
  color: #222;
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 24px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.menu-item:hover {
  background: #FAF5FF;
}

.menu-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  flex-shrink: 0;
  transition: all 0.2s;
}

.menu-item:hover .menu-icon {
  background: #F3E8FF;
  color: #9333EA;
}

.menu-icon.accent {
  background: #F3E8FF;
  color: #9333EA;
}

.menu-icon.danger {
  background: #FEF2F2;
  color: #DC2626;
}

.menu-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.menu-label {
  font-size: 15px;
  font-weight: 600;
  color: #222;
}

.menu-desc {
  font-size: 13px;
  color: #999;
}

.menu-arrow {
  color: #CCC;
  flex-shrink: 0;
}

.menu-footer {
  padding: 8px 0;
  border-top: 1px solid #E2E8F0;
}

.menu-item.danger .menu-label {
  color: #DC2626;
}

.menu-item.danger:hover {
  background: #FEF2F2;
}

/* 트랜지션 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
}

@media (min-width: 768px) {
  .slide-up-enter-from, .slide-up-leave-to {
    transform: translateY(20px) scale(0.95);
  }
}

/* 터치 디바이스 최적화 */
@media (hover: none) and (pointer: coarse) {
  .menu-item {
    min-height: 60px;
  }
}

/* 스크롤바 */
.menu-content::-webkit-scrollbar {
  width: 4px;
}

.menu-content::-webkit-scrollbar-track {
  background: transparent;
}

.menu-content::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 2px;
}
</style>