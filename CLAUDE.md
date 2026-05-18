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
    - 서브폴더: `admin/`, `battle/`, `carrier/`(자체 `components/` 서브폴더 포함), `category/`, `feed/`, `product/`
  - `src/components/` — 도메인별 재사용 컴포넌트
    - `feed/`, `battle/`, `collection/`, `identity/`, `chat/`, `notification/`, `product/`
    - `common/`, `layout/`, `login/`, `dashboard/`, `exp/`, `icons/`, `category/`, `userFeed/`, `MZLifestyle/`
    - identity 주요: `UserLevelTag`, `UserBadgeInline`, `UserIdentity`, `YogurtTierArt`
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

- **버전 1.0.5 통일**: iOS 빌드 8, Android versionCode 5로 버전 일치 (`chore`)
- **Presence 비콘 + 피드 작성 UX**: `presenceService.js` 신설 — 앱 종료/백그라운드 시 오프라인 통보, `FeedCreateView` 및 `FeedProductSection` 다듬기 (`feat`)
- **채팅 키보드 레이아웃**: 모바일 채팅 디테일을 `position: fixed`로 잠그고 키보드 높이로 bottom 동적 조정 (`fix(chat)`)
- **마이페이지 인라인 편집**: 프로필 필드를 인라인으로 편집하고 미니 저장 토스트로 피드백 (`feat(mypage)`)
- **Android 출시 서명 / SDK 36**: AGP 8.9.1 업그레이드, 버전 1.0.4 배포 준비 (`chore(android)`)
- **네비게이션 아이콘 개선**: 활성 탭에 fill 아이콘 적용, 커스텀 캐리어 아이콘 추가, 버전 1.0.3 (`feat(nav)`)
- **피드 카드 스와이프**: 가로 스와이프로 상세 페이지 진입 지원 (`feat(feed)`)
- **모바일 채팅 UX**: 인스타그램 스타일로 채팅 UX 개선 (`feat(chat)`)
- **다크 모드 전면 지원**: 전체 페이지(알림·관리자·상품·배틀·피드 등)에 다크 모드 적용 (`feat(theme)`)
- **환경설정 페이지 신설**: 설정 화면 추가, 메뉴 아이콘 Lucide 통일 (`feat(settings)`)
- **iOS 네이버/Apple 로그인**: 네이티브 딥링크 + Apple 로그인 앱 노출 (`feat(auth/ios)`)
- **iOS APNs production 환경 적용**: 푸시 알림 production 빌드 대응 (`fix(ios/push)`)
