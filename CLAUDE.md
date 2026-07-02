# 프로젝트 가이드 (Claude용)

## 중요 — 작업 시작 전 먼저 읽어야 하는 문서

### UI / 디자인 작업 시 필수
**`docs/design-system.md`를 먼저 읽는다.**

다음 중 하나에 해당되면 반드시 이 문서를 먼저 참조:
- 컬렉션 / 리워드 / 레벨 / 뱃지 / 예측 전적 관련 페이지·컴포넌트 수정
- **피드 / 배틀 / 채팅 / 마이페이지 등 어디든 유저 닉네임 옆에 레벨·등급·뱃지 표시**
- 새 카드·버튼·탭·토스트를 만들 때 톤 & 매너를 맞춰야 할 때
- 기존 디자인 토큰(컬러, 타이포, 라운드, 그림자) 수정
- 이모지 / 그라데이션 사용 여부 판단이 필요할 때

이 문서에 정의된 대원칙:
1. **그라데이션 금지** — 모두 솔리드 컬러
2. **이모지는 뱃지 + 큰 tier 아바타에만** — 뱃지 10종(badge.emoji)과 Hero/TierDetail의 큰 tier 아바타 블록(tier.emoji)만 이모지 허용. 그 외 **모든 UI는 Lucide SVG** (streak, 메달, 토스트, 배너, 인라인 tier, 작은 tier 원 등)
3. **배경은 흰색**
4. **PC 퍼스트 반응형** — 기준은 데스크톱. 모바일은 adaptation
5. **토스/당근/무신사 톤** — 넓은 여백, 굵은 타이포, 섬세한 그림자, 절제된 컬러, 깔끔한 line 아이콘

### 유저 아이덴티티 표시 시 재사용 컴포넌트

닉네임 옆에 레벨·뱃지를 표시할 때는 **반드시 아래 컴포넌트를 사용**한다. 직접 스타일링 X.

- `src/components/identity/UserLevelTag.vue` — 레벨+tier 뱃지
- `src/components/identity/UserBadgeInline.vue` — 뱃지 1개 인라인
- `src/components/identity/UserIdentity.vue` — 닉네임+레벨+뱃지 컴포지트

사용 예시와 props는 `docs/design-system.md` 5절 참조.

---

## 프로젝트 구조 요약

- **프레임워크**: Vue 3.5 (Composition API `<script setup>`) + Vite 6.x + Pinia 3.x + Vue Router 4.x
- **모바일 앱**: Capacitor 7.x (iOS / Android) + `@capgo/capacitor-social-login` (Apple/Google 소셜 로그인) — `npm run cap:ios`, `npm run cap:android`
- **OTA 배포**: `@capgo/capacitor-updater@7.45.10` — `npm run ota:deploy`로 웹 변경분을 스토어 심사 없이 즉시 배포. `src/capacitor/bootstrap.js`에서 `notifyAppReady()` 호출 필수 (누락 시 60초 후 자동 롤백)
- **UI 라이브러리**: Tailwind 4.x (유틸), `lucide-vue-next` (아이콘), `@heroicons/vue`
- **HTTP**: Axios (`src/api/client.js` + 인터셉터 `src/api/interceptors.js`)
- **실시간**: STOMP + SockJS (`src/services/webSocketService.js`) — STOMP 내장 자동 재연결 비활성화(`reconnectDelay: 0`), 서비스 자체가 capped exponential backoff + jitter 무한 재시도로 관리. `shouldConnect` 인텐트 플래그로 의도적 disconnect(로그아웃/백그라운드) 시엔 재연결 안 함. 채팅 진입 등 강한 신호에는 `ensureConnection()` 호출로 즉시 연결·await 지원. 토큰 갱신 후 `onTokenRefreshed()` 호출 필수(인터셉터에서 자동 처리). 개인 큐 구독 경로·메시지 발신자 ID는 반드시 `sessionUserId`(소켓 인증 JWT 기준) 사용, `getCurrentUserId()`(localStorage 기반) 혼용 금지 — 계정 전환 직후 두 값이 달라져 `INVALID_DESTINATION` 발생. **한 번도 못 붙은 단말 자동 회복**: `everConnected` 플래그로 가드 — 정상 연결된 단말엔 영향 없음. attempts 3에 deviceId 1회 자동 리셋(`localStorage` 마커로 영구 제한), attempts 5에 `/diagnostics/ws-fail` best-effort 텔레메트리 발신, attempts 5~9는 xhr-streaming 우선·10+는 xhr-polling 강제로 SockJS transport 자동 회전, attempts 15+에서 `permanentFailureCalled` 콜백 — 외부 HTTP 폴링 fallback 전환 가능. prod에서 `localStorage.setItem('ws-debug', '1')` 후 재접속으로 STOMP 디버그 로그 토글 가능
- **푸시 알림**: Firebase FCM 11.x (`src/services/fcmService.js`, `src/services/pushNotificationService.js`)
- **날짜 유틸**: `date-fns 4.x`
- **주요 디렉토리**:
  - `src/views/` — 라우트 단위 페이지
    - 루트: `HomeView`, `MyPageView`, `DashboardView`, `CollectionView`, `UserFeedListView`, `FollowListView`, `ChatApp`/`ChatDetailView`/`ChatRoomView`, `SettingsView`, `AccountSettingsView`, `NotificationSettingsView`, `BlockedUsersView`, `ReviewWritePageView`, `PrivacyPolicyView`, `TermsOfServiceView`, `SupportView`, `LoginView`, `WelcomeView`, `AboutView`, `OAuth2Callback`, `CategoryAdminView`, `NotFoundView`, `ConsentView` 등
    - 서브폴더:
      - `admin/` — `CollectionAdminView`
      - `battle/` — `BattleListView`, `BattleDetailView`, `BattleCreateView`, `SwipeBattleView`, `SwipeBattleResultView`
      - `carrier/` — `CarrierView` + `constants.js` (레이아웃·컬러·스킨 상수) + 자체 `components/` (CarrierCanvas, CarrierItemList, MobileStickerTray, ShareModal, SkinCarousel, StickerPackPanel)
      - `category/` — `CategoryListView`
      - `feed/` — `FeedHomeView`, `FeedCreateView`, `FeedDetailView`
      - `product/` — `BulkProductAdminView`, `MyProductView`, `ProductAdminView`, `ProductCreateView`, `ProductDetailView`, `ProductRankingView`
  - `src/components/` — 도메인별 재사용 컴포넌트
    - `feed/` (+ `detail/` 서브폴더), `battle/` (+ `create/`, `detail/` 서브폴더), `collection/`, `identity/`, `chat/` (+ `detail/` 서브폴더), `notification/`, `product/` (+ `create/`, `detail/` 서브폴더)
    - `common/`, `layout/`, `login/`, `dashboard/`, `exp/`, `icons/`, `category/`, `userFeed/`, `MZLifestyle/`
    - **AppHeader 주의**: `layout/AppHeader.vue`가 전역 헤더. `battle/AppHeader.vue`(단순 타이틀 헤더)·`feed/AppHeader.vue`(검색 박스 포함)는 해당 도메인 전용 로컬 헤더 — 전역 헤더와 혼동 금지. `layout/`에는 전역 헤더 외 `AdminMenu.vue`(관리자 드롭다운)·`UserMenu.vue`(유저 메뉴 드롭다운)도 포함
    - **`exp/ExpFeedback.vue`** — `<Teleport to="body">` 기반 EXP 획득 버스트 애니메이션 레이어 (`useExpToast` composable과 연동). 직접 mount 금지, `useExpToast`로만 트리거
    - identity 주요: `UserLevelTag`, `UserBadgeInline`, `UserIdentity`, `YogurtTierArt`
    - **`common/ShareModal.vue`** — 전역 공유 모달 (카카오·트위터·페이스북·네이티브 공유·링크 복사). 공유 UI 직접 구현 금지, 이 컴포넌트 재사용. 공유 링크는 내부적으로 `buildShareUrl()` (`src/config/env.js`)을 통해 `yogurtte.com` 공개 도메인으로 정규화됨 — 직접 `window.location` 사용 금지
    - **`common/CategorySelectModal.vue`** — 카테고리 탐색 모달. `type` prop으로 도메인 구분(BATTLE 등). 카테고리 선택 UI 직접 구현 금지, 이 컴포넌트 재사용
    - **`common/ReportModal.vue`** — 신고하기 모달 (`<Teleport to="body">`). 피드·배틀·댓글 등 콘텐츠 신고 UI 직접 구현 금지, 이 컴포넌트 재사용
    - **`common/BottomNavigation.vue`** — 전역 하단 네비게이션 바 (피드·배틀·캐꾸·핫아템·마이). 실제로 대부분 뷰가 이 경로로 import. `MZLifestyle/BottomNavigation.vue`는 레거시로 `HomeView.vue`에서만 사용 중 — 새 뷰에서는 `common/` 경로 사용
    - **`common/FeedbackModal.vue`** — 익명 의견·버그 제보 모달 (`<Teleport to="body">`). `BottomNavigation`·`feed/AppSidebar.vue`·`DashboardQuickNav` 내부에 내장됨
    - **`common/AdSlot.vue`** — Google AdSense 슬롯 래퍼. `BottomNavigation` 하단에 배치
    - **`common/CategoryChipSelector.vue`** — 인라인 카테고리 칩 셀렉터 (1뎁스 칩 + "더보기" → `CategorySelectModal` 연동). `contentType` prop으로 도메인 구분
    - **battle/ 루트 주요**: `BattleCard.vue`, `BattleList.vue`, `BattleTabs.vue`, `HotBattleSection.vue` — **SWIPE 배틀 분기 패턴**: `battle.voteType === 'SWIPE'`이면 참여수는 `battle.totalSwipes` 사용, `totalVotes` 아님. 배지·라우팅도 SWIPE 전용 처리 필요(`/battles/:id/swipe`). 새 배틀 표시 컴포넌트 추가 시 반드시 `voteType` 분기 적용
    - `dashboard/` 주요: `DashboardBrandHero.vue` (4슬라이드 히어로 캐러셀 — 요거픽/핫피드/캐꾸/핫아템), `DashboardQuickNav.vue` (주요 메뉴 퀵내비 **가로 스크롤 한 줄** — 히어로 아래 밀착 배치), `DashboardHotFeeds.vue` (**최신 피드** 섹션 — `/feeds/scroll` cursor 기반 API, 모바일 4개·균등 2열 그리드. 요거픽 위에 배치됨), `DashboardBattles.vue` (요거픽 섹션 — SWIPE/일반 voteType 분기, 모바일 4개·균등 2열 그리드. 1위 아이템명 라벨 표시), `DashboardSectionHeader.vue` (공통 섹션 헤더 컴포넌트 — 새 섹션 추가 시 재사용), `DashboardTrendBanner.vue`, `DashboardRanking.vue`, `DashboardYogurtBom.vue`
    - `MZLifestyle/` — `AIMemeGeneratorPromo`, `MBTIRecommendationBanner`, `MZHeader`, `NavigationTabs`, `QuickActions`, `TrendingFoodsSection`, `TrendingMemesSection` (레거시 `BottomNavigation.vue` 포함 — `HomeView.vue` 전용)
    - 루트 레벨 홈/랜딩 컴포넌트: `NavigationTabs.vue`, `QuickActions.vue`, `TrendingFoods.vue`, `TrendingMemes.vue`, `HeyBread.vue`, `MemeGeneratorPromo.vue`
  - `src/services/` — 도메인별 서비스 클래스 (`Index.js`로 일괄 export)
    - `AuthService`, `FeedService`, `BattleService`, `ProductService`, `ProductReviewService`, `ChatService`, `NotificationService`, `NotificationSettingService`, `RewardsService`, `CarrierService`, `UserService`, `FeedbackService`, `FileService`, `DashboardService`, `CategoryService`, `SwipeBattleService`
    - **`RewardsService.js`는 실 API 호출용** — mock 스위치(`USE_MOCK`)는 `src/api/rewardsApi.js`에 있음 (별개)
    - `presenceService.js` — presence 비콘 전용. 앱 백그라운드/탭 비활성/종료 시 `POST /api/connection/offline`으로 오프라인 통보. **Index.js export 제외** (직접 import)
    - `SwipeBattleService.js` — 스와이프 배틀 전용 API 클라이언트 (`BaseApiService` 확장). `getNext(battleId)` / `submit(battleId, itemId, verdict)` / `getResult(battleId)`. `verdict`는 `SWIPE_VERDICT` 상수 사용 (`STRONG_PICK` / `PICK` / `PASS`). **Index.js export 제외** (직접 import)
    - `BaseApiService.js` — Fetch API 기반 공통 기반 클래스 (401 자동 갱신). Axios `interceptors.js`와 별개
    - `apiService.js` — Auth/Chat 서버 통합 API 서비스 (Fetch 기반, `BaseApiService` 확장)
    - `nativeAuth.js` — 네이티브 빌드(iOS/Android) Apple/Google 소셜 로그인 처리. 오류 코드 체계: `ERR-A1xx`~`ERR-G3xx`
  - `src/api/` — Axios 클라이언트·인터셉터·레거시 mock API (`rewardsApi.js`)
  - `src/stores/` — Pinia 스토어 (`auth.js`, `counter.js`, `userBlock.js`)
  - `src/composables/` — Vue 컴포저블
    - `useAuth`, `useChat`, `useTheme`, `useNotification`, `useCarrier`, `useBattleDraft`
    - `useProduct`, `useCategoryCache`, `useUserBlock`, `useConfirmDialog`, `useLoginPrompt`, `useExpToast`
    - `useChatDetailMode` — 모바일 채팅 디테일 진입 시 전역 헤더 숨기기용 모듈 스코프 공유 상태 (`isChatDetailOpen`). `App.vue`와 `ChatApp.vue`에서 같이 사용
    - `useNotificationPanelMode` — 알림 패널 열림 시 모바일 FAB(글쓰기) 겹침 방지용 모듈 스코프 공유 상태 (`isNotificationPanelOpen`). `NotificationDropdown.vue`와 `BottomNavigation.vue`에서 사용
    - `useConsentGate` — 개인정보 처리방침 동의 게이트. 로그인/OAuth 콜백/토큰 재발급 응답의 `consentRequired` 플래그가 `true`면 `/consent` 화면으로 라우팅. `setPendingRedirect` / `consumePendingRedirect`로 동의 완료 후 원래 목적지 복원
  - `src/router/` — 라우터 설정 + `guards/authGuard.js`
  - `src/capacitor/` — Capacitor 네이티브 브릿지 코드
  - `src/config/` — 환경 설정 (`env.js`, `ads.js`). `env.js`는 MSA 서비스 URL(`API_URLS`), 환경 식별자(`ENV`), 공유 URL 빌더(`buildShareUrl`, `PUBLIC_WEB_URL`) 중앙 관리. 공유 링크 생성 시 반드시 `buildShareUrl()` 사용
  - `src/data/` — mock 데이터 (`levelSystemData.js`)
  - `src/utils/` — 헬퍼 (`auth.js`, `categoryIcon.js`, `collectionIcons.js`, `chatUtils.js`, `youtubeEmbed.js`, `defaultAvatar.js`)
  - `src/assets/` — 정적 자산 (폰트 등)
  - `docs/` — 설계 문서
    - `design-system.md` — 디자인 대원칙·토큰·컴포넌트 가이드
    - `reward-system-v2-exp-spec.md` — EXP/레벨/티어 스펙
    - `user-block-system.md` — 차단 시스템 스펙 (Apple 심사 필수)
    - `community-list-style.md` — 모바일 커뮤니티 리스트 레이아웃 패턴
    - `mobile-fcm-setup.md` — FCM·safe-area 이슈 변경 기록

## 리워드 시스템 (현재 상태)

- **백엔드 미배포**. `src/api/rewardsApi.js`가 서비스 레이어 역할
- `USE_MOCK = true` 플래그로 mock/실호출 스위치
- Mock 데이터는 `src/data/levelSystemData.js`에 집중
- 실 API 연결 시 `rewardsApi.js`의 주석된 `apiClient.get/post` 활성화 + `levelSystemData.js`의 mock 섹션 삭제
- 자세한 제거 순서: `rewardsApi.js` 상단 주석 참조

## 테스트 유저 셀렉터

`CollectionView.vue` 상단 `.dev-bar`는 개발용. 백엔드 연동 시 로그인 유저 고정으로 전환하며 해당 블록 삭제.

## 전역 UI 패턴 — 반드시 재사용

### 확인/삭제/알림 다이얼로그
`useConfirmDialog` composable + `GlobalConfirmDialog.vue` (`common/`에 전역 마운트됨):
```js
const { open } = useConfirmDialog()
await open({ type: 'danger', title: '삭제', message: '정말 삭제할까요?' })
// type: 'confirm' | 'alert' | 'danger' | 'login'
```
직접 `window.confirm()` 또는 인라인 커스텀 모달 사용 금지.

### 로그인 게이트
`useLoginPrompt` composable + `LoginPromptModal.vue`:
```js
const { openLoginPrompt } = useLoginPrompt()
await openLoginPrompt('이 기능은 로그인 후 이용할 수 있어요')
```

### 차단 기능
`useUserBlock` composable (`src/stores/userBlock.js` 래퍼). **Apple App Store 심사 필수 기능.**
스펙 전체는 `docs/user-block-system.md` 참조.

### 한글 검색 입력 (IME 조합 처리)
한글 입력 시 `@input` 이벤트는 IME 조합 중 `v-model` 값이 미반영되므로, 검색 디바운스는 반드시 `watch`로 처리:
```js
watch(searchKeyword, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { /* API 호출 */ }, 300)
})
```
`@input` + debounce 조합은 한글 마지막 음절이 누락되는 버그가 있으므로 사용 금지. `BattleListView.vue` 참조.

### KeepAlive — 현재 미사용
`App.vue`에서 KeepAlive를 **전면 제거**함 (refactor: 2026-05-30). 뷰 진입 시 항상 fresh fetch 수행. `defineOptions({ name })` 선언은 더이상 KeepAlive 목적으로 불필요하다.

> 과거 대상: `DashboardView`, `MyPageView`, `CollectionView`, `BattleListView`, `ProductRankingView` — 현재는 모두 매번 재마운트.

---

## 빌드 / 검증

- `npm run build` → Vite 빌드 (문법·import 오류 검증)
- UI 변경 시 `npm run dev`로 브라우저에서 실제 인터랙션 확인 필요 (타입/빌드만으로는 UX 검증 불가)
- `npm run ota:deploy` → **Capgo OTA 배포** (patch 버전 bump → production 빌드 → capgo bundle upload). 웹 레이어(JS/CSS/HTML) 변경분을 스토어 심사 없이 즉시 전체 사용자에 반영. **플러그인 추가·네이티브 코드 변경은 반드시 스토어 업데이트 필요.**

---

## 커밋 메시지 컨벤션

기존 프로젝트 컨벤션을 따른다 (`git log` 참조):
- `feat: 설명`
- `fix: 설명`
- `refactor: 설명`
- 한국어 허용

**중요 — 커밋 메시지에 Claude 워터마크 절대 포함 금지:**
- `Co-Authored-By: Claude ...` 라인 넣지 말 것
- `🤖 Generated with [Claude Code](...)` 라인 넣지 말 것
- 메시지는 변경 내용만 간결하게 작성

---

## 주요 변경사항 (최근 이력)

- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-07-02)**: `webSocketService.js` 자동 회복·텔레메트리·transport 회전 신기능 반영 (`docs`)
- **WebSocket 한 번도 못 붙은 단말 자동 회복 + best-effort 텔레메트리**: `webSocketService.js` — `everConnected` 가드 기반 회복 전략 추가. attempts 3에 deviceId 1회 자동 리셋, attempts 5에 `/diagnostics/ws-fail` 텔레메트리, attempts 5~9는 xhr 우선·10+는 polling 강제로 SockJS transport 회전, attempts 15+에서 permanent-failure 콜백. prod에서 `localStorage.setItem('ws-debug', '1')`로 STOMP 디버그 토글 가능 (`feat(ws)`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-07-01)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음. 최근 커밋은 CLAUDE.md 자동 업데이트 전용, 코드 변경 없음 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-30)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음. 최근 커밋은 CLAUDE.md 자동 업데이트 전용, 코드 변경 없음 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-29, 2회차)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음. 최근 7일 커밋은 CLAUDE.md 자동 업데이트 전용, 코드 변경 없음 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-29)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음. 최근 커밋은 CLAUDE.md 자동 업데이트(2026-06-28) 외 코드 변경 없음 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-28)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음. 최근 커밋은 CLAUDE.md 자동 업데이트 2회(2026-06-27) 외 코드 변경 없음. push 동기화 문제(detached HEAD에만 커밋되던 이슈) 발견·수정 완료 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-27)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음. 최근 커밋은 dashboard/feed UI 폴리시(평가 뱃지 디자인 통일, 피드 폰트 복원) 및 OTA 1.1.37 배포 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-26)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음. 누락된 STOMP/WebSocket 상세·AppHeader 주의·ExpFeedback·CategoryChipSelector·SWIPE 배틀 분기 패턴 설명 복원 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-25)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음. `docs/`에 이미지 참조 파일(`img.png`, `IMG_3526.PNG`) 존재 확인 — 설계 스펙 문서 아님, 목록 제외 적절 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-24)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-23)**: `DashboardHotFeeds.vue` 최신 피드 수 6→4 수정, `DashboardBattles.vue` 1위 아이템명 라벨 추가 반영, 누락 커밋 이력 추가 (`docs`)
- **피드 카드 리뷰 폰트 크기 복원**: `DashboardHotFeeds.vue` — backdrop-blur 글래스 실험 이후 리뷰 폰트를 원래 크기(13/14/15px)로 복원 (`fix(dashboard)`)
- **요거픽 1위 아이템명 라벨 + 최신 피드 4개로 축소**: `DashboardBattles.vue` 1위 아이템명 라벨 추가, `DashboardView.vue` 최신 피드 fetch `size` 6→4로 변경 (`feat(dashboard)`)
- **요거픽 1위 강조 축소로 2~5위 가시성 확보**: `DashboardBattles.vue` 1위 카드 강조 스타일 축소 (`fix(dashboard)`)
- **피드 상세 이미지 order 필드 기준 정렬**: `FeedService.js` — 피드 상세 이미지를 `order` 필드 기준으로 정렬하도록 수정 (`fix(feed)`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-22)**: `DashboardHotFeeds.vue` 최신 피드 전환(핫→최신순, `/feeds/scroll` cursor API, 요거픽 위 배치) 및 `DashboardBattles.vue` 모바일 2열 그리드 정보 반영 (`docs`)
- **버전 1.1.9**: iOS 빌드 23, Android versionCode 20 (`chore`)
- **대시보드 피드 카드 평가 뱃지 디자인 통일**: 피드 카드 평가 딱지를 흰 글래스 + 컬러 텍스트 미니멀 톤으로 통일, 블러 제거 + 컬러 도트 미니멀 스타일 적용. normalize된 문자열 코드 지원, 작성·목록·상세 명칭 통일 (`feat/fix(dashboard/feed)`)
- **대시보드 모바일 요거픽·피드 2열 그리드 통일**: 모바일에서 요거픽 4개·피드 6개로 제한, 균등 2열 그리드로 통일. 최신 피드를 요거픽 위로 배치, 호출을 `/feeds/scroll`(cursor 기반)로 전환 (`feat/fix(dashboard)`)
- **OTA 번들 1.1.36·1.1.37 배포**: Capgo OTA로 대시보드/피드 UI 변경분 전체 사용자 즉시 반영 (`chore`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-21)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-20)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-19)**: 구조·버전·파일 목록 정확성 검증 완료 — STOMP 재연결 메커니즘 변경 반영, 신규 WS API(`ensureConnection`, `onTokenRefreshed`) 명시 (`docs`)
- **버전 1.1.8**: iOS 빌드 22, Android versionCode 19 (`chore`)
- **네이티브 안정화 패치**: `App.vue`·`bootstrap.js` StatusBar Style enum 정정(다크모드 시계·아이콘 가시성 수정), `AppViewController.swift` swipe back 전환 중 검정 플래시 차단, `LoginForm.vue` Apple Sign-In iOS 전용 한정(Android 노출 제거·소셜 그리드 2컬럼), `nativeAuth.js` Google login scopes 제거(Android 에러 차단), `interceptors.js` 토큰 갱신 후 `webSocketService.onTokenRefreshed()` 자동 호출로 WS 자동 복구 (`fix`)
- **채팅 진입 시 소켓 즉시 연결**: `ChatDetailView`·`ChatApp` 진입 시 `webSocketService.ensureConnection()` 사용 — 미연결이면 백오프 대기 리셋 후 즉시 연결, 완료까지 await. `ensureConnection` 진행 중이면 실제로 대기 가능(awaitable) (`feat(chat)`)
- **WebSocket 무한 재연결 개선**: 재연결 5회 후 영구 포기 제거 → capped exponential backoff + jitter 무한 재시도. `shouldConnect` 인텐트 플래그·`pendingConnectPromises` hanging promise 일괄 reject·connect timeout 인스턴스 추적·STOMP 인증 실패 시 폭주 차단 등 신뢰성 전반 강화 (`fix(ws)`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-18)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-17)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-16)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-15)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인, 신규 구조 변경 없음 (`docs`)
- **CLAUDE.md 프로젝트 구조 자동 업데이트 (2026-06-14)**: 구조·버전·파일 목록 정확성 검증 완료 — 실제 코드베이스와 완전 일치 확인 (`docs`)
- **CLAUDE.md 구조 문서 개선**: layout 컴포넌트 목록 추가, `AppHeader` 혼동 방지 주의사항·`ExpFeedback` 설명, STOMP `sessionUserId` 패턴·SWIPE 배틀 분기 패턴 명시 (`docs`)
- **STOMP 구독 경로 userId 불일치 수정**: `webSocketService.js` — 같은 기기에서 계정 전환 시 STOMP 구독 경로에 이전 userId가 남아 있던 버그 수정 (`fix(ws)`)
- **대시보드·요거픽 SWIPE 배틀 분기**: `DashboardBattles.vue` 등 — `voteType` / `totalSwipes` 대응으로 SWIPE 배틀 전용 렌더링 분기 처리 (`feat(battle)`)
- **버전 1.1.7**: iOS 빌드 21, Android versionCode 18 (`chore`)
- **OTA 번들 1.1.31 배포**: Capgo OTA로 웹 변경분(스와이프 백 관련 패치) 전체 사용자 즉시 반영 (`chore`)
- **iOS 스와이프 백 네이티브 제스처로 전환**: `AppViewController.swift` — 커스텀 스냅샷 오버레이 방식(350줄)을 완전 제거하고 iOS 네이티브 `allowsBackForwardNavigationGestures`로 전환. 표준 전환 애니메이션(현재 화면이 오른쪽으로 밀려나며 이전 화면이 드러남)으로 단순화 (`fix(ios)`)
- **인앱 스플래시 콜드스타트 1회 제한**: `App.vue` — `sessionStorage` 가드(`yogurtte:splashShown`)로 앱 세션당 스플래시 1회만 노출. 네이티브 스와이프 백 등으로 App.vue가 remount돼도 재등장 방지 (`fix(ios)`)
- **버전 1.1.6**: iOS 빌드 20, Android versionCode 17 (`chore`)
- **배틀 SWIPE 투표 방식 전체 통합**: `SwipeBattleView.vue` + `SwipeBattleResultView.vue` 신설 + `SwipeBattleService.js` 추가. 배틀 생성 Step3에서 `VoteType.SWIPE` 선택 가능. `BattleDetailView.vue` — SWIPE 타입 배틀에 미참여 상태면 자동으로 `/battles/:id/swipe`로 진입. 스와이프 방향: 오른쪽=PICK/STRONG_PICK, 왼쪽=PASS (Tinder 표준). 모든 카드 완료 후 결과 화면(`SwipeBattleResultView`) 이동 + 재시작 지원. `BottomNavigation`은 `<Teleport to="body">`로 스와이프 UI 위에 오버레이 (`feat(battle)`)
- **스와이프 UX 보강**: 단일 카드 렌더(다음 카드 peek 표시), 미진행 SWIPE 배틀 자동 스와이프 화면 진입, 라벨·방향·완료 후 재시작·스탬프 리디자인 (`fix/feat(battle)`)
- **iOS 스와이프 백 이전 페이지 스냅샷 표시**: `AppViewController.swift` — 스와이프 백 제스처 중 좌측에 이전 페이지 스냅샷을 오버레이로 표시하여 검정 화면 완전 제거 (`fix(ios)`)
- **회원가입 후 닉네임 설정 온보딩(/welcome)**: `WelcomeView.vue` 신설 + `/welcome` 라우트. 회원가입 직후 첫 로그인 시 닉네임 설정 화면 표시 — 아바타 이니셜 미리보기, 2~20자 유효성 검사, "나중에 할게요" 스킵 지원. `LoginView.vue`에서 신규 가입 플래그 감지 후 `/welcome`으로 라우팅 (`feat(auth)`)
- **배틀 YouTube 탭 자동 클립보드 입력**: `AddProductModal.vue` — YouTube 탭에 "YouTube에서 영상 찾기" 버튼 추가. Capacitor Browser로 `m.youtube.com` 오픈 후 앱 복귀 시(`App.appStateChange` / `window.focus`) 클립보드를 읽어 YouTube URL이면 자동 채움. **네이티브(iOS/Android)에서만 버튼 노출**, 데스크탑/PWA도 `window.focus` 시 동일 시도. `youtubeBrowserOpened` 플래그로 사용자가 명시적으로 열었을 때만 동작 (무관한 클립보드 침범 방지) (`feat(battle)`)
- **ConsentView 약관 전문 시트화**: `ConsentView.vue` — "전문 보기" 링크가 잘못된 라우트(`/privacy-policy`, `/terms-of-service`)로 새 창 열기 시도하던 버그 수정. `/privacy` / `/terms`로 정정하고, 네이티브에서도 동의 상태 보존되도록 풀스크린 시트(`<Teleport>` + `<Transition>`)로 전환. `PrivacyPolicyView` / `TermsOfServiceView`를 lazy import해 재사용 (`fix`)
- **배틀 댓글 전문 표시**: `BattleDetailView.vue` — 더보기 후 `.arg-text`에 남아 있던 `white-space: nowrap + ellipsis` 잘림 제거 → `pre-wrap + word-break`로 전문 표시 (`fix(battle)`)
- **대시보드 PC 사이드바 간격 통일**: `DashboardView.vue` — `main-content`에 `padding-left:1.5rem` 추가, 피드 등 다른 페이지와 좌측 여백 일치 (`fix(dashboard)`)
- **개인정보처리방침 동의 게이트**: `useConsentGate.js` 신설 + `ConsentView.vue` 추가 + `/consent` 라우트. 로그인·OAuth·토큰 재발급 응답에서 `consentRequired: true` 수신 시 `interceptors.js`가 자동으로 `/consent`로 라우팅. 동의 완료 후 원래 목적지로 복원 (`feat(auth)`)
- **개인정보처리방침 + 이용약관 v1.0**: `PrivacyPolicyView.vue`, `TermsOfServiceView.vue` 전면 갱신 — 시행일 2026-06-01 (`feat(legal)`)
- **공유 링크 공개 도메인 정규화**: `ShareModal.vue` + `src/config/env.js` 신설 — 공유 URL을 `yogurtte.com` 도메인 기준으로 생성. `VITE_PUBLIC_WEB_URL` env var 또는 기본값 사용. 공유 링크 생성 시 `buildShareUrl()` 직접 호출 가능 (`fix(share)`)
- **이벤트 배틀(id=21) 인스타 ID 입력 모달**: `AddProductModal.vue` — 이벤트 배틀 전용 인스타 ID 입력 블록을 모달 상단 단일 영역으로 통합. `BattleService.js` `addBattleItems` 매퍼에 `eventId` 필드 추가 (`feat(battle)`)
- **ProductCard 랭크 표기 개선**: `ProductCard.vue`, `HotBattleSection.vue` — '01' → '1위' 형식 + 폰트 크기 조정 (`feat(battle)`)
- **버전 1.1.5**: iOS 빌드 19, Android versionCode 16 (`chore`)
- **배틀 아이템 16개 초과 더보기 토글**: `BattleDetailView.vue` — pc-grid가 상위 16개(`displayedItems`) 기준 렌더, 17개 이상이면 '아이템 N개 더 보기' / '접기' 토글 노출. `sortedItems`는 그대로 — 통계/PICK 한마디 정합성 유지 (`feat(battle)`)
- **KeepAlive 전면 제거**: `App.vue` — `<KeepAlive>` 제거, 뷰 진입 시 항상 fresh fetch. `DashboardBattles`, `DashboardRanking`, `DashboardView`의 `defineOptions` 관련 KeepAlive 코드도 정리 (`refactor`)
- **Capgo Live Updates OTA 셋업**: `@capgo/capacitor-updater@7.45.10` 설치. `src/capacitor/bootstrap.js`에 `notifyAppReady()` 호출 추가 (없으면 60초 후 자동 롤백). `npm run ota:deploy`로 웹 변경분 OTA 즉시 배포 가능. 플러그인 첫 탑재이므로 스토어 1회 업데이트 필요, 이후엔 OTA만으로 전체 사용자 반영 (`feat(ota)`)
- **배틀·피드 카피·뱃지 위치 정리**: `ProductCard.vue`, `BattleListView.vue` 불필요 코드 제거, `BattleListView` 섹션 중복 정리 (`feat(battle/feed)`)
- **버전 1.1.4**: iOS 빌드 18, Android versionCode 15 (`chore`)
- **KeepAlive로 뒤로가기 깜빡임 제거**: `App.vue` — 주요 화면(DashboardView·MyPageView·CollectionView·BattleListView·ProductRankingView)을 `<KeepAlive>`로 감싸 뒤로가기 시 즉시 복원. 각 뷰에 `defineOptions({ name })` 추가 (`feat(nav)`) **→ 이후 refactor로 제거됨 (버전 1.1.5)**
- **섹션 헤더 글자 크기 통일**: `DashboardSectionHeader.vue`·`FeedList.vue`·`HotSection.vue`·`ProductRankingView.vue` — 전 섹션 헤더 스타일 한 단계 축소하여 일관화 (`style`)
- **DashboardBattles.vue 투표율 누적 막대 리디자인**: 요거픽 1픽 투표율을 누적 막대 한 줄 + 순위별 컬러로 표시, 막대 위 라벨(아이템명·퍼센트) 정렬 (`feat/fix(dashboard)`)
- **DashboardQuickNav 퀵메뉴 BottomNavigation 일치**: 라벨·아이콘·순서를 하단 네비게이션과 동일하게 정렬 (`refactor(dashboard)`)
- **대시보드 컴팩트 레이아웃**: `DashboardQuickNav.vue` — 그리드 → 가로 스크롤 한 줄로 전환, 아이콘·간격 컴팩트화. `DashboardView.vue` 섹션 여백 40~64px → 26~40px 축소, 퀵내비 히어로 아래 밀착. `DashboardSectionHeader.vue` 하단 여백 축소 (`feat(dashboard)`)
- **버전 1.1.3**: iOS 빌드 17, Android versionCode 14 (`chore`)
- **배틀 목록 검색 + 카테고리 탐색 모달**: `BattleListView.vue` — `CommonCategoryFilter` 제거, 검색 input + 300ms watch 디바운스 자동 로드, `CategorySelectModal`(BATTLE 타입)로 카테고리 선택. 선택 카테고리는 brand-soft 칩으로 표시 (`feat(battle)`)
- **검색 IME 한글 미반영 수정**: `BattleListView.vue` — `@input` 디바운스 → `watch` 디바운스로 전환. 한글 IME 조합 종료 후 ref 갱신을 정확히 감지 (`fix(battle)`)
- **푸시 라우팅 강제 remount**: `fcmService.js` + `App.vue` — 동일 라우트 푸시 알림 수신 시 `_push` 타임스탬프 쿼리 파라미터 부여 + `RouterView :key` 바인딩으로 강제 remount → 최신 데이터 재fetch 보장 (`feat`)
- **알림 설정 요거픽(배틀) 카테고리 추가**: `NotificationSettingService.js` (`feat(notification)`)
- **버전 1.1.2**: iOS 빌드 16, Android versionCode 13 (`chore`)
- **대시보드 전면 리디자인 (오늘의집 톤)**: `DashboardView.vue` 대폭 리팩터링 — 각 섹션 독립 컴포넌트 분리 완료. `DashboardBattles.vue` 요거픽 섹션이 매거진 레이아웃으로 전면 재설계 (사진 위주, 투표율 바 보라+골드 보색) (`refactor/feat(dashboard)`)
- **대시보드 공통 섹션 헤더 신설**: `DashboardSectionHeader.vue` — 모든 대시보드 섹션 헤더 공통 컴포넌트. 새 섹션 추가 시 직접 스타일링 대신 이 컴포넌트 재사용 (`feat(dashboard)`)
- **피드 대댓글 답글 지원**: `FeedCommentSection.vue` — 대댓글에서도 답글 작성 가능, 멘션 자동 프리필 (`feat(feed)`)
- **iOS 테마 브릿지 + PICK 한마디 모바일 키보드 가림 해소**: `AppViewController.swift` + `App.vue` 테마 API 강화, `BattleCommentModal.vue`·`BattleCommentSummary.vue` 키보드 가림 수정 (`feat`)
- **이미지 업로드 완료 후 '업로드 중' 표시 잔존 버그 수정**: `Step2ItemSetup.vue`, `AddProductModal.vue` (`fix(battle)`)
- **버전 1.1.1**: iOS 빌드 15, Android versionCode 12 (`chore`)
- **배틀 카드 디자인 폴리시**: `BattleCard.vue` — glass 배지·라이브 닷·아이콘 통계·호버 줌·D-7 조건 마감 텍스트. `BattleList.vue` 섹션 레이아웃 정비 (`feat(battle)`, `fix(battle)`)
- **핫 배틀 섹션 고도화**: `HotBattleSection.vue` — 메달(1·2·3위)·라이브 펄스·D-Day 표시. 카테고리 칩·heat meter는 정리 후 제거됨 (`feat/refactor(battle)`)
- **배틀 리스트 섹션 디테일 폴리시**: `BattleListView.vue` 레이아웃 및 탭 UI 정비 (`feat(battle)`)
- **대시보드 히어로 배너 캐러셀**: `DashboardBrandHero.vue` — 4슬라이드(요거픽/핫피드/캐꾸/핫아템) 자동 캐러셀. 슬라이드 아트는 실제 API 데이터(배틀 썸네일 등) 연동. `DashboardView.vue`에서 기존 인트로 블록 대체 (`feat(dashboard)`)
- **대시보드 퀵내비 추가**: `DashboardQuickNav.vue` — 주요 메뉴(피드·배틀·캐꾸·핫아템 등) 직접 이동 그리드 타일. `DashboardView.vue`에서 중복 헤더 제거와 함께 도입 (`feat(dashboard)`)
- **배틀 step2 탭 라벨 항시 노출**: `Step2ItemSetup.vue` — 모바일 아이템 입력 탭에 텍스트 라벨 항시 표시. ≤480px에서 아이콘 위 라벨 스택 레이아웃. 상단 안내 헤더(아이콘+제목+칩)+설명+방법 리스트로 재구성 (`feat(battle)`)
- **배틀 생성 스텝 인디케이터 아이콘+이름 표시**: `BattleCreateHeader.vue` — 배틀 생성 진행 단계 인디케이터에 단계별 아이콘과 이름 항시 노출 (`feat(battle)`)
- **D-day 배지 표시 조건 변경**: `BattleCard.vue`, `DashboardBattles.vue` — 마감 **7일 이하**인 **진행중** 배틀에만 D-day 배지 표시. 종료 배틀·마감 여유 있는 배틀에는 미표시 (`fix(battle)`)
- **버전 1.1.0**: iOS 빌드 14, Android versionCode 11 (`chore`)
- **배틀 종료 우승자 셀러브레이션 모달**: `BattleDetailView` 인라인 winner-spotlight 제거 → `<Teleport to="body">` 이벤트 모달로 전환. 내 픽 있으면 최고 등수, 없으면 전체 1위 표시. 1·2·3·4위+ tier별 아이콘·라벨·컬러·confetti 차등화(gold/silver/bronze/consolation). **세션당 배틀별 1회** (`sessionStorage`) + "일주일간 다시 보지 않기" (`localStorage` 만료 키). 다크모드 대응 (`feat(battle)`)
- **버전 1.0.10**: iOS 빌드 13, Android versionCode 10 (`chore`)
- **배틀 모바일 PICK 한마디·아이템 카드 UX 다듬기**: `BattleDetailView`, `BattleCommentSummary`, `ProductCard` — 빈 상태 CTA 모바일 컴팩트 정리 포함 (`feat(battle)`, `fix(battle)`)
- **네이티브 StatusBar 다크모드 대응**: `App.vue` + `capacitor/bootstrap.js` — 테마 변경 시 iOS/Android StatusBar 스타일 토글 (`feat(theme)`)
- **Android 앱 아이콘·스플래시 yogurtte 로고로 교체**: 흰 배경 + 가운데 50% 비율 (`feat(android)`)
- **버전 1.0.9**: iOS 빌드 12, Android versionCode 9 (`chore`)
- **iOS 채팅 입력창 키보드 노티피케이션 관찰**: `AppViewController.swift` + `ChatDetailView.vue` — 키보드 show/hide 네이티브 노티피케이션으로 입력창이 키보드 바로 위에 붙도록 (`fix(chat)`)
- **버전 1.0.8**: iOS 빌드 11, Android versionCode 8 (`chore`)
- **알림 패널 모바일 UX 개선**: `useNotificationPanelMode` composable 신설 — 알림 패널 열릴 때 모바일 FAB(글쓰기) 자동 숨김. `NotificationDropdown` desktop/mobile 두 인스턴스 공유 ref 덮어쓰기 버그 수정 (`fix(notification)`)
- **배틀 아이템 다중 추가 + 업로드 실패 처리 일관화**: `Step2ItemSetup`, `AddProductModal` 개선 — 아이템 다중 선택 추가 및 업로드 실패 핸들링 통일 (`feat(battle/feed)`)
- **배틀 PICK 한마디 UI 정돈 + 더블탭 줌 차단**: `BattleCommentSummary` 리팩터링, `index.html`·`main.css` 더블탭 줌 방지 (`fix(battle)`)
- **iOS 키보드 도구막대(✓ Done) 숨김**: `AppViewController.swift`에서 `WKContentView` 런타임 서브클래싱으로 제거 — 채팅 입력창이 키보드에 완전히 붙도록 (`fix(chat)`)
- **SockJS jsonp transport 제외**: `webSocketService.js` — chat-service `HttpMessageNotWritableException` 워닝 차단 (`fix(ws)`)
- **핫 아이템 인기지수 강조**: `ProductRankingView` 우측 컬럼에서 별점·리뷰 수 제거, 인기지수만 표시 (`feat(ranking)`)
- **버전 1.0.7**: iOS 빌드 10, Android versionCode 7 (`chore`)
- **모바일 채팅방 글로벌 헤더 숨김**: `useChatDetailMode` composable 신설 — 채팅 디테일 진입 시 전역 헤더 숨기고 입력창 하단 빈공간 제거 (`fix(chat)`)
- **배틀 모바일 플로팅 [전체 PICK] 버튼 개선**: 하단 이동 + 스크롤 시 자동 숨김, 아이템 필터 활성 시 썸네일·이름 확인하며 한 번에 해제 가능 (`feat(battle)`)
- **배틀 생성 플로우 다듬기**: Step1~4 기간 프리셋·필수 표시·카피 간결화 (`feat(battle)`)
- **iOS 뒤로가기 스와이프 개선**: Chrome 스타일 화살표 인디케이터 + 다크모드 배경 매칭, 화살표 위치 화면 중앙 고정 (`feat(ios)`, `fix(ios)`)
- **스플래시 화면 2번 뜨는 문제 수정**: `capacitor.config.json` 오버레이 자동 숨김으로 변경, 네이티브 런치 스크린만 표시 (`fix(capacitor)`)
- **버전 1.0.6**: iOS 빌드 9, Android versionCode 6 (`chore`)
- **캐리어 공유 모달 강화 + 피드 더블탭 가드 + iOS 넓은 스와이프 뒤로가기**: `common/ShareModal.vue` 전면 개편, `FeedCreateView` 중복 제출 방지, `AppViewController.swift` 전체 너비 엣지 스와이프 지원 (`feat`)
- **전역 뒤로가기 까만 플리커 제거**: Android `styles.xml`, `capacitor.config.json`, `index.html`, `main.css` 다층 수정 (`fix`)
- **피드 상세 좌측 엣지 스와이프 백**: `FeedDetailView` 내장 제스처 핸들러로 플리커 없이 뒤로가기 (`feat(feed)`)
- **배틀 투표 UX 개선**: `VoteSelectionBar` 가중치 투표 + 다크모드 대응, `ProductCard` always-enabled + auto-compact 정책 (`feat(battle)`, `refactor(battle)`)
- **헤더 채팅 빨간점 + 피드 사진 라이브 리오더**: `App.vue` 미읽은 채팅 표시, `FeedCreateView` 사진 순서 드래그 재정렬 (`feat`)
- **채팅 입력창 가려짐 수정**: `ChatDetailView` 포커스 시 최신 메시지 자동 표시 (`fix(chat)`)
- **버전 1.0.5 통일**: iOS 빌드 8, Android versionCode 5로 버전 일치 (`chore`)
- **Presence 비콘 + 피드 작성 UX**: `presenceService.js` 신설 — 앱 종료/백그라운드 시 오프라인 통보, `FeedCreateView` 및 `FeedProductSection` 다듬기 (`feat`)
- **채팅 키보드 레이아웃**: 모바일 채팅 디테일을 `position: fixed`로 잠그고 키보드 높이로 bottom 동적 조정 (`fix(chat)`)
- **마이페이지 인라인 편집**: 프로필 필드를 인라인으로 편집하고 미니 저장 토스트로 피드백 (`feat(mypage)`)
- **Android 출시 서명 / SDK 36**: AGP 8.9.1 업그레이드, 버전 1.0.4 배포 준비 (`chore(android)`)
