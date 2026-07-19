<div align="center">

# 🧳 요거뜨 (Yogurtte) — Client

**요즘 뜨는 아이템의 순위, 유저들이 직접 만듭니다** — 실시간 아이템 랭킹 커뮤니티

[yogurtte.com](https://yogurtte.com)

![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-3-FFD859?logo=pinia&logoColor=black)
![Capacitor](https://img.shields.io/badge/Capacitor-7-119EFF?logo=capacitor&logoColor=white)
![Firebase](https://img.shields.io/badge/FCM-Push-FFCA28?logo=firebase&logoColor=black)
![CI/CD](https://img.shields.io/badge/GitHub%20Actions-S3%20%2B%20CloudFront-2088FF?logo=githubactions&logoColor=white)

</div>

---

## 📌 소개

**요거뜨**는 실시간 아이템 랭킹 커뮤니티입니다. 자랑하고 싶은 아이템은 피드에 올리고, 순위가 궁금한 아이템은 요거픽(투표 배틀)에 올려 가립니다. 그 참여가 모여 '지금 가장 핫한 아이템' 랭킹이 만들어집니다.

이 레포는 그 **프론트엔드**입니다. Vue 3 하나의 코드베이스로 웹(S3 + CloudFront)과 iOS/Android 앱(Capacitor)을 모두 서빙하고, 앱은 스토어 심사 없이 Capgo OTA로 즉시 업데이트합니다.

| 웹 | 모바일 |
|:---:|:---:|
| ![웹 화면](https://raw.githubusercontent.com/Minchae0322/toy-content/main/docs/img_2.png) | ![모바일 화면](https://raw.githubusercontent.com/Minchae0322/toy-content/main/docs/img_1.png) |

### 요거뜨 서비스 구성

| 레포 | 역할 |
|---|---|
| **toy-client** (이 레포) | Vue 3 프론트엔드. 웹과 iOS/Android 앱(Capacitor)을 하나의 코드로 서빙 |
| [toy-user](https://github.com/Minchae0322/toy-user) | 회원, 인증, 소셜 로그인, 팔로우, 알림 설정 |
| [toy-content](https://github.com/Minchae0322/toy-content) | 배틀, 피드, 제품, 보상 등 콘텐츠 도메인 |
| [toy-chat](https://github.com/Minchae0322/toy-chat) | 실시간 채팅과 푸시 알림 발송 |

전체 인프라는 AWS 위 K3s 클러스터에서 GitOps로 운영됩니다. 아키텍처 그림은 [toy-content README](https://github.com/Minchae0322/toy-content#%EF%B8%8F-시스템-아키텍처)에 있습니다.

---

## ✨ 주요 화면

| 화면 | 설명 |
|---|---|
| **홈 대시보드** | 히어로 캐러셀, 최신 피드, 진행 중인 요거픽, 실시간 제품 랭킹 |
| **요거픽 (배틀)** | 배틀 목록과 상세, 생성. 스와이프 배틀은 카드를 넘기며 평가하는 전용 화면 |
| **핫 아이템** | HOT 100 버블 차트로 보는 실시간 제품 랭킹, 제품 상세와 리뷰 |
| **피드** | 무한 스크롤 피드, 작성, 사용자별 피드와 팔로우 목록 |
| **캐리어 꾸미기** | 캔버스 위에서 스킨과 스티커로 캐리어를 꾸미고 공유 |
| **컬렉션** | 레벨과 뱃지로 보는 나의 활동 아이덴티티 |
| **채팅** | 실시간 채팅방, 안읽음 표시, 알림 |
| **관리자** | 제품 벌크 등록, 카테고리, 컬렉션 관리 |

---

## 💡 눈여겨볼 구현

### 스와이프 배틀 제스처

Pointer Events와 `setPointerCapture`로 드래그를 추적해 카드에 이동과 회전을 함께 입히고, 임계값을 넘으면 강추/픽/패스 스탬프가 점점 진해집니다. 놓으면 cubic-bezier 스냅백, 판정 순간에는 네이티브 햅틱이 울립니다. 라이브러리 없이 직접 구현했습니다.

### 토큰 자동 갱신

access 토큰은 localStorage, refresh 토큰은 HttpOnly 쿠키로 분리했습니다. 401이 떨어지면 인터셉터가 재발급을 요청하는데, 동시에 실패한 요청들은 큐에 모아 갱신 완료 후 일괄 재시도해 재발급이 중복 호출되지 않습니다. 백그라운드에서는 만료 5분 전에 선제 갱신하고, 갱신된 토큰으로 WebSocket도 함께 재연결합니다.

### 끊기지 않는 WebSocket

STOMP 내장 재연결 대신 직접 만들었습니다 — 상한 있는 지수 백오프에 지터를 더한 무한 재시도, "연결하려는 의도"를 별도 플래그로 관리해 의도적 종료와 장애를 구분, 반복 실패 시 SockJS 전송 방식을 자동으로 바꿔가며 시도하고, 끝내 실패하면 진단 텔레메트리를 서버로 보냅니다.

### 하이브리드 앱과 OTA

Capacitor로 iOS/Android를 패키징하고 네이티브 소셜 로그인(Apple, Google), FCM 푸시, 햅틱을 붙였습니다. JS 번들 변경은 Capgo OTA 채널로 스토어 심사 없이 배포하며, 업데이트 후 앱이 정상 기동을 알리지 못하면 60초 뒤 자동 롤백됩니다.

### 그 외

- `IntersectionObserver` 기반 무한 스크롤과 커서 페이지네이션
- 라이트/다크 2세트 CSS 커스텀 프로퍼티 디자인 토큰
- 라우트별 title, OG, canonical 메타 동적 주입과 sitemap/robots 캐시 정책

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|---|---|
| Core | Vue 3 (Composition API), Vite 6, Pinia, Vue Router |
| Mobile | Capacitor 7 — iOS/Android 패키징, Capgo OTA, 네이티브 소셜 로그인, FCM |
| Realtime | @stomp/stompjs + SockJS |
| Styling | CSS 커스텀 프로퍼티 디자인 토큰 (라이트/다크), SUIT · Noto Sans KR |
| Deploy | GitHub Actions → S3 + CloudFront (캐시 정책 분리, SHA 지정 롤백 워크플로) |
| Testing | k6 — 실사용 트래픽 믹스를 재현한 부하 테스트 |

---

## 📂 프로젝트 구조

```
src
├── views           # 페이지 — 대시보드, 피드, 배틀, 제품, 캐리어, 채팅, 마이페이지, 관리자
├── components      # 도메인별 컴포넌트 + 공통 (모달, 내비게이션, 아이덴티티)
├── services        # 도메인별 API 서비스 계층, WebSocket/FCM/presence 서비스
├── api             # axios 클라이언트와 토큰 갱신 인터셉터
├── composables     # 테마, 알림, EXP 토스트 등 재사용 로직
├── stores          # Pinia 스토어 (인증, 차단 사용자)
├── router          # 라우트와 가드 (인증, 관리자, 동의, OAuth 콜백)
├── capacitor       # 네이티브 브릿지 래퍼
└── assets          # 디자인 토큰, 전역 스타일
```

---

## 🚀 실행

```bash
npm install

# 개발 서버 — /api/* 요청을 각 백엔드 서비스로 프록시
npm run dev

# 프로덕션 빌드 / 배포
npm run build:prod
./deploy.sh <S3_BUCKET> [CLOUDFRONT_DIST_ID]

# 모바일
npm run cap:android   # 또는 cap:ios
npm run ota:deploy    # Capgo OTA 배포
```
