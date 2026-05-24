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
- **모바일 앱**: Capacitor 7.x (iOS / Android) — `npm run cap:ios`, `npm run cap:android`
- **UI 라이브러리**: Tailwind 4.x (유틸), `lucide-vue-next` (아이콘), `@heroicons/vue`
- **HTTP**: Axios (`src/api/client.js` + 인터셉터 `src/api/interceptors.js`)
- **실시간**: STOMP + SockJS (`src/services/webSocketService.js`)
- **푸시 알림**: Firebase FCM 11.x (`src/services/fcmService.js`, `src/services/pushNotificationService.js`)
- **주요 디렉토리**:
  - `src/views/` — 라우트 단위 페이지
    - 루트: `HomeView`, `MyPageView`, `DashboardView`, `CollectionView`, `UserFeedListView`, `FollowListView`, `ChatApp`/`ChatDetailView`/`ChatRoomView`, `SettingsView`, `AccountSettingsView`, `NotificationSettingsView`, `BlockedUsersView`, `ReviewWritePageView`, `PrivacyPolicyView`, `TermsOfServiceView`, `SupportView`, `LoginView`, `AboutView`, `OAuth2Callback`, `CategoryAdminView`, `NotFoundView` 등
    - 서브폴더:
      - `admin/` — `CollectionAdminView`
      - `battle/` — `BattleListView`, `BattleDetailView`, `BattleCreateView`
      - `carrier/` — `CarrierView` + `constants.js` (레이아웃·컬러·스킨 상수) + 자체 `components/` (CarrierCanvas, CarrierItemList, MobileStickerTray, ShareModal, SkinCarousel, StickerPackPanel)
      - `category/` — `CategoryListView`
      - `feed/` — `FeedHomeView`, `FeedCreateView`, `FeedDetailView`
      - `product/` — `BulkProductAdminView`, `MyProductView`, `ProductAdminView`, `ProductCreateView`, `ProductDetailView`, `ProductRankingView`
  - `src/components/` — 도메인별 재사용 컴포넌트
    - `feed/` (+ `detail/` 서브폴더), `battle/` (+ `create/`, `detail/` 서브폴더), `collection/`, `identity/`, `chat/` (+ `detail/` 서브폴더), `notification/`, `product/` (+ `create/`, `detail/` 서브폴더)
    - `common/`, `layout/`, `login/`, `dashboard/`, `exp/`, `icons/`, `category/`, `userFeed/`, `MZLifestyle/`
    - identity 주요: `UserLevelTag`, `UserBadgeInline`, `UserIdentity`, `YogurtTierArt`
    - **`common/ShareModal.vue`** — 전역 공유 모달 (카카오·트위터·페이스북·네이티브 공유·링크 복사). 공유 UI 직접 구현 금지, 이 컴포넌트 재사용
    - `MZLifestyle/` — `AIMemeGeneratorPromo`, `BottomNavigation`, `MBTIRecommendationBanner`, `MZHeader`, `NavigationTabs`, `QuickActions`, `TrendingFoodsSection`, `TrendingMemesSection`
    - 루트 레벨 홈/랜딩 컴포넌트: `NavigationTabs.vue`, `QuickActions.vue`, `TrendingFoods.vue`, `TrendingMemes.vue`, `HeyBread.vue`, `MemeGeneratorPromo.vue`
  - `src/services/` — 도메인별 서비스 클래스 (`Index.js`로 일괄 export)
    - `AuthService`, `FeedService`, `BattleService`, `ProductService`, `ProductReviewService`, `ChatService`, `NotificationService`, `NotificationSettingService`, `RewardsService`, `CarrierService`, `UserService`, `FeedbackService`, `FileService`, `DashboardService`, `CategoryService`
    - **`RewardsService.js`는 실 API 호출용** — mock 스위치(`USE_MOCK`)는 `src/api/rewardsApi.js`에 있음 (별개)
    - `presenceService.js` — presence 비콘 전용. 앱 백그라운드/탭 비활성/종료 시 `POST /api/connection/offline`으로 오프라인 통보. **Index.js export 제외** (직접 import)
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
  - `src/router/` — 라우터 설정 + `guards/authGuard.js`
  - `src/capacitor/` — Capacitor 네이티브 브릿지 코드
  - `src/config/` — 환경 설정 (`env.js`, `ads.js`)
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

---

## 빌드 / 검증

- `npm run build` → Vite 빌드 (문법·import 오류 검증)
- UI 변경 시 `npm run dev`로 브라우저에서 실제 인터랙션 확인 필요 (타입/빌드만으로는 UX 검증 불가)

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
