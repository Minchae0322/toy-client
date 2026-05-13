# 모바일/FCM 셋업 변경 내역

## 1. 모바일 BottomNavigation FAB 위치 수정

**파일:** `src/components/common/BottomNavigation.vue`

iOS에서 `+` (FAB) 버튼이 너무 위에 떠 있던 이슈.

- `.fab-wrap`의 `bottom`에서 중복된 `env(safe-area-inset-bottom)` 제거
- 부모 `.bottom-nav`의 `padding-bottom`이 이미 safe-area를 처리하고 있어 이중 적용되던 것을 정리

```diff
- bottom: calc(100% + 14px + env(safe-area-inset-bottom));
+ bottom: calc(100% + 14px);
```

---

## 2. 모바일 채팅 상세 — 한 화면 레이아웃 (스크롤 제거)

채팅방 목록은 그대로 스크롤되고, **채팅방 진입 시에만** 모바일에서 페이지 스크롤 없이 한 화면에 들어가도록 변경.

### `src/views/ChatApp.vue`
- `selectedRoom`이 있을 때 `.app-container`에 `chat-detail-mode` 클래스 부여
- 모바일(`max-width: 767px`)에서 해당 모드일 때:
  - `min-height: 0; height: calc(100dvh - 66px); overflow: hidden`
  - 내부 `.main-content`도 `padding: 0; height: 100%`
- `BottomNavigation`도 채팅 상세에서는 `v-if="!selectedRoom"`로 숨김 (입력창과 충돌 방지)

### `src/views/ChatDetailView.vue`
- 모바일 분기에서 `100vh` 기반 height 계산 제거
- 부모(`.main-content`)가 한 화면 높이를 보장하므로 `height: 100%`로 변경
- 하단 영역에 `padding-bottom: calc(64px + env(safe-area-inset-bottom))`로 BottomNav 공간만 확보

### `src/App.vue`
- `isChatRoute` computed 추가 (`route.path.startsWith('/chat')`)
- `<footer>`에 `:class="{ 'hide-on-mobile-chat': isChatRoute }"` 바인딩
- 모바일 미디어쿼리에서 해당 클래스 `display: none` — 채팅 영역 어디서도 사이트 푸터가 보이지 않게 함

---

## 3. GoogleService-Info.plist 위치 이동

**기존:** `src/assets/GoogleService-Info.plist` (잘못된 위치 — Vite가 웹 번들에 넣음, 네이티브에서 못 읽음)
**변경:** `ios/App/App/GoogleService-Info.plist` (`AppDelegate.swift` 옆)

> ⚠️ 이 파일은 Xcode 프로젝트 타겟에도 추가해야 빌드 시 앱 번들에 포함됩니다.
> Project Navigator → App 그룹 우클릭 → Add Files to "App"... → `Add to targets: App` 체크.
> 확인: 타겟 → Build Phases → "Copy Bundle Resources"에 plist가 있는지 확인.

---

## 4. FCM(Firebase Cloud Messaging) 클라이언트 셋업

### 4-1. 의존성 추가

```bash
npm i @capacitor-firebase/messaging@7.5.0 firebase
npx cap sync ios
```

`@capacitor-firebase/messaging` 최신(8.x)은 Capacitor 8+ 필요. 현 프로젝트는 Capacitor 7이라 **7.5.0** 고정.

`ios/App/Podfile`에 `pod 'CapacitorFirebaseMessaging'`이 자동 추가됨.

### 4-2. AppDelegate.swift — Firebase 초기화

```diff
  import UIKit
  import Capacitor
+ import FirebaseCore

  @UIApplicationMain
  class AppDelegate: UIResponder, UIApplicationDelegate {
      ...
      func application(...) -> Bool {
+         FirebaseApp.configure()
          return true
      }
  }
```

### 4-3. FCM 서비스 추가

**신규 파일:** `src/services/fcmService.js`

- `registerFcm()` — 권한 요청 → 토큰 발급 → `POST /users/me/fcm-token`으로 백엔드 등록 → 토큰 갱신/수신/탭 리스너 등록
- `unregisterFcm()` — 백엔드에서 토큰 삭제 + `FirebaseMessaging.deleteToken()`
- 네이티브(`Capacitor.isNativePlatform()`)에서만 동작, 웹은 no-op

> 기존 `pushNotificationService.js`는 Web Push(Service Worker + VAPID) 구현이라 별도 파일로 분리.

### 4-4. App.vue 통합

로그인 직후 / 로그인 상태 변경 시 자동 호출:

```js
import { registerFcm, unregisterFcm } from '@/services/fcmService.js'

onMounted(() => {
  if (isLoggedIn.value) {
    ...
    registerFcm().catch(e => console.warn('[FCM] 등록 실패:', e))
  }
})

watch(isLoggedIn, (newVal) => {
  if (newVal) {
    registerFcm().catch(...)
  } else {
    unregisterFcm().catch(...)
  }
})
```

---

## 5. 남은 수동 작업 (Xcode)

자동화 불가능. 한 번만 해두면 됨.

### Xcode에서
1. `npx cap open ios`로 워크스페이스 실행
2. **GoogleService-Info.plist를 App 타겟에 추가** (위 3절 참조)
3. **Capability 추가** (App 타겟 → Signing & Capabilities → +Capability)
   - Push Notifications
   - Background Modes → ☑ Remote notifications

### Apple Developer 콘솔
4. Keys → "+" → APNs 체크 → Register → `.p8` 다운로드 (1회 한정)
5. Key ID와 Team ID 메모

### Firebase Console (`toy-chat-30d47` 프로젝트)
6. Project settings → Cloud Messaging → Apple app configuration
7. APNs Authentication Key 업로드 (`.p8` + Key ID + Team ID)

### 검증
- 실기기에서 빌드 후 로그인 → Xcode 콘솔에서 토큰 확인 + `POST /users/me/fcm-token` 요청 확인
- Firebase Console → Messaging → "Send test message"로 해당 토큰에 직접 발송 → 단말에 알림이 뜨면 클라이언트 셋업 완료

---

## 6. 다음 단계 (백엔드 — 미진행)

- Spring에 `firebase-admin` 의존성 추가
- Service Account JSON으로 `FirebaseApp` 초기화 빈 등록
- `POST /api/users/me/fcm-token`, `DELETE /api/users/me/fcm-token` 엔드포인트
- 채팅 메시지 저장 후 수신자 오프라인이면 `FirebaseMessaging.send(...)` 호출

---

## 7. 푸시 알림 아이콘 (작은 아이콘 + 큰 이미지)

### 7-1. Android 작은 아이콘 (상태바 / 알림 좌측)

Android Lollipop+은 작은 아이콘을 **알파 마스크 단색 실루엣**으로 렌더링한다. 컬러 PNG를 넣으면 하얀 사각형으로 보이는 버그가 발생.

**적용 완료:**
- `android/app/src/main/res/drawable/ic_stat_notification.xml` — U 자 + 상승 화살표 단색 벡터 드로어블
- `AndroidManifest.xml`의 `default_notification_icon` 메타데이터를 `@drawable/ic_stat_notification`으로 변경
- 틴트 색상은 기존 `@color/notification_color`(#9333EA 브랜드 보라) 유지

### 7-2. 큰 이미지 (컬러 로고)

FCM payload에 `notification.image` 필드로 컬러 로고 URL을 실어 보내면 알림 본문에 큰 이미지로 표시됨.

**백엔드에서 FCM 전송 시 payload 예시:**

```json
{
  "message": {
    "token": "...",
    "notification": {
      "title": "댓글이 달렸어요",
      "body": "...",
      "image": "https://app.yogurtte.com/images/yogurtte_logo_3.png"
    },
    "data": { "referenceType": "POST", "referenceId": "123" }
  }
}
```

`firebase-admin` Java SDK 사용 시:

```java
Notification notification = Notification.builder()
    .setTitle(title)
    .setBody(body)
    .setImage("https://app.yogurtte.com/images/yogurtte_logo_3.png")
    .build();
```

> 컬러 로고는 `public/images/yogurtte_logo_3.png`로 이미 배포돼 있어 `https://app.yogurtte.com/images/yogurtte_logo_3.png`로 접근 가능. URL은 **HTTPS 필수**이고 디바이스에서 외부망으로 접근 가능해야 함.

### 7-3. iOS

iOS 알림 좌측 아이콘은 **앱 아이콘(`AppIcon.appiconset`)** 으로 자동 설정되며 개별 알림에서 변경 불가. 별도 작업 없음.

큰 이미지는 위 `notification.image`가 그대로 사용됨(Notification Service Extension은 미구성 — 기본 동작 사용).
