# 사용자 차단(Block) 시스템 사양

## 목적

Apple App Store Review Guideline 1.2 (UGC) 의 필수 요건 중 하나인 **"The ability to block abusive users from the service"** 충족.

이 앱은 피드/배틀/댓글/채팅 모두 UGC 이므로 차단 기능 부재 시 심사 거절 확정. 신고(`ReportModal.vue`)만 있는 현재 상태는 불충분.

## 단계 계획

| Phase | 범위 | 시점 |
|---|---|---|
| **Phase 1** | 클라이언트 LocalStorage 차단 — 차단한 유저의 콘텐츠를 내 화면에서만 숨김 | **지금** (심사 통과용) |
| **Phase 2** | 백엔드 연동 — 서버 측 차단 테이블, 양방향 격리, 다기기 동기화 | 백엔드 배포 후 |

Apple 심사는 Phase 1만으로 통과 가능. 단, 기기 변경 시 차단 목록이 초기화됨을 인지.

---

## Phase 1 사양 (클라이언트 전용)

### 1. 데이터 모델

```js
// Pinia store: src/stores/userBlock.js (신규)
{
  blockedUserIds: Set<number|string>,  // 차단된 userId 모음
}
```

- 영구 저장: `localStorage` 키 `yogurtte:blocked-users` (JSON array)
- 키 prefix는 기존 컨벤션 확인 후 통일
- 로그아웃 시 초기화 여부: **유지** (재로그인 시에도 차단 상태 보존이 자연스러움)
- 로그인 유저별 분리: `yogurtte:blocked-users:{userId}` — 다계정 공유 기기 대비

### 2. Store API

```js
// src/stores/userBlock.js
export const useUserBlockStore = defineStore('userBlock', () => {
  const blockedIds = ref(new Set())

  function load(currentUserId) { /* localStorage → Set */ }
  function persist(currentUserId) { /* Set → localStorage */ }

  function block(userId)   { blockedIds.value.add(userId);   persist() }
  function unblock(userId) { blockedIds.value.delete(userId); persist() }
  function isBlocked(userId) { return blockedIds.value.has(userId) }

  return { blockedIds, block, unblock, isBlocked, load }
})
```

### 3. UI 흐름

#### 3.1 신고 모달에 "차단" 옵션 통합 (권장)

`src/components/common/ReportModal.vue` 신고 완료 화면 하단에 체크박스 추가:

```
[√] 이 사용자를 차단합니다 (해당 유저의 게시물·댓글·메시지가 보이지 않습니다)
```

체크 상태로 신고 제출 시 `userBlockStore.block(targetUserId)` 동시 호출.

#### 3.2 게시물 메뉴에 "차단" 직접 진입

피드 카드 / 배틀 / 댓글의 ⋮ 메뉴(이미 신고 항목이 있는 곳)에 신고와 별개로:

```
- 신고
- 차단    ← 추가
```

차단 클릭 시 confirm:
```
"이 사용자를 차단할까요?
차단하면 해당 유저의 게시물·댓글·채팅이 보이지 않게 됩니다."
```

#### 3.3 차단 목록 관리 화면

`src/views/BlockedUsersView.vue` (신규) — 마이페이지에서 진입:

```
마이페이지 → 계정 설정 → "차단한 사용자 관리"
```

화면 구성:
- 차단한 유저 리스트 (닉네임 + 프로필 이미지)
- 각 항목 우측에 "차단 해제" 버튼
- 빈 상태: "차단한 사용자가 없습니다"

라우트 추가: `/account/blocked-users` → `BlockedUsersView.vue`

### 4. 차단 적용 대상 (필터링 지점)

| 화면 | 파일 | 필터링 방식 |
|---|---|---|
| 피드 리스트 | `FeedList.vue` | `feeds.filter(f => !isBlocked(f.author.userId))` |
| 피드 상세 댓글 | `FeedCommentSection.vue` | 차단 유저 댓글 숨김 (개수에서도 제외) |
| 배틀 한줄 변론 | `BattleCommentSummary.vue` | 차단 유저 댓글 숨김 |
| 배틀 리스트 | `BattleList.vue` | 작성자 차단 시 숨김 |
| 채팅방 메시지 | `ChatDetailView.vue` | 차단 유저 메시지 숨김 (또는 "차단된 사용자의 메시지" placeholder) |
| 채팅방 목록 | 채팅 리스트 | 차단 유저와의 1:1 방은 숨김 또는 회색 처리 |
| 사용자 프로필 | `UserFeedListView.vue` | 차단된 유저 프로필 방문 시 상단 배너 "차단된 사용자입니다" + 콘텐츠 숨김 |

#### 필터링 시 주의
- **무한스크롤** — 필터 후 페이지 크기가 줄어들어 빈 페이지가 나올 수 있음. 필터링 후 부족하면 추가 페이지 요청.
- **본인 자신 차단 방지** — `block()` 호출 전 `userId !== currentUserId` 가드.
- **이미 본 콘텐츠는 즉시 사라지지 않아도 됨** — 다음 새로고침/스크롤부터 적용해도 무방.

### 5. Composable 패턴 권장

각 컴포넌트에서 store 직접 import 대신 헬퍼:

```js
// src/composables/useUserBlock.js
export function useUserBlock() {
  const store = useUserBlockStore()
  return {
    isBlocked: store.isBlocked,
    block: store.block,
    unblock: store.unblock,
    filterBlocked: (list, getUserId = (x) => x.userId) =>
      list.filter((item) => !store.isBlocked(getUserId(item))),
  }
}
```

---

## Phase 2 사양 (백엔드 연동)

### 권장 API

```
POST   /users/me/blocks         body: { targetUserId }   → 차단
DELETE /users/me/blocks/{id}                              → 차단 해제
GET    /users/me/blocks                                   → 차단 목록
```

### 응답 측에서 자동 필터링 (선호)
- 피드/배틀/댓글/채팅 조회 API가 백엔드에서 차단 유저 콘텐츠를 **자동 제외**하면 클라이언트 필터 로직 제거 가능.
- 단, 양방향 격리(차단당한 유저는 나를 보지 못함) 여부는 정책 결정 필요.

### 클라이언트 마이그레이션 절차
1. `userBlockStore`에 백엔드 fetch/sync 로직 추가
2. 앱 시작 시 `GET /users/me/blocks` → store 동기화
3. `block()/unblock()` 함수 내부에서 API 호출 후 store 업데이트
4. LocalStorage 값은 백엔드 응답이 오기 전까지의 **캐시** 역할로만 사용
5. 백엔드가 자동 필터링하면 클라이언트 필터 로직 단계적 제거

---

## Phase 1 구현 체크리스트

- [ ] `src/stores/userBlock.js` 생성 (Pinia + LocalStorage persist)
- [ ] `src/composables/useUserBlock.js` 생성
- [ ] `ReportModal.vue` 에 "이 사용자 차단" 체크박스 추가
- [ ] 피드/배틀/댓글 ⋮ 메뉴에 "차단" 메뉴 항목 추가
- [ ] `BlockedUsersView.vue` 신규 화면 + 라우트 등록
- [ ] `AccountSettingsView.vue` 에 "차단한 사용자 관리" 진입 row 추가
- [ ] 필터링 적용 (위 표의 7개 화면)
- [ ] 본인 차단 방지 가드
- [ ] 채팅 메시지 차단 처리 (실시간 메시지 도착 시에도 적용)
- [ ] 빈 상태 / 무한스크롤 보정
- [ ] **심사 답변용**: 차단 흐름 스크린샷을 App Store Connect 리뷰 노트에 함께 첨부 (어디서 차단하고 어디서 확인하는지)

---

## 메모

- Apple 심사관은 종종 "신고/차단 기능을 보여달라"고 metadata rejection 으로 요청. **App Review Information 의 Notes 필드에 "Block flow: 게시물 ⋮ 메뉴 → 차단 / 마이페이지 → 계정 설정 → 차단한 사용자 관리" 같이 한 줄로 명시** 하면 통과 확률 상승.
- 신고 기능과 별개로 차단은 **즉시 효과**가 있어야 함. 신고만 하고 콘텐츠가 계속 보이면 심사관이 거절함.
- "차단된 사용자입니다" 같은 placeholder 보다는 **완전 숨김**이 UX 적으로 깔끔. (단, 채팅 1:1 방은 placeholder가 자연스러움)
