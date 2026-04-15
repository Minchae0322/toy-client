# 디자인 시스템 — 컬렉션 / 리워드

이 문서는 컬렉션 페이지(`src/views/CollectionView.vue`)와 거기서 쓰이는 유저 아이덴티티 요소(tier, level, 뱃지)를 **피드 / 배틀 / 채팅 / 마이페이지 등 다른 화면에서 일관되게 재사용**하기 위한 기준을 정의한다.

## 0. 대원칙

- **그라데이션 금지** — 모두 솔리드 컬러. `linear-gradient` / `radial-gradient` 사용 X
- **이모지는 뱃지 10종에만** — 그 외 모든 UI는 Lucide SVG. 6절 참조
- **배경은 흰색** (`#fff`) — 카드가 스스로 색을 갖도록
- **PC 퍼스트 반응형** — 디자인 기준은 데스크톱. 모바일은 그 adaptation
- **토스 / 당근 / 무신사 톤** — 넓은 여백, 굵은 타이포, 절제된 컬러, 깔끔한 line 아이콘. 캐주얼 장식 최소화

---

## 1. 컬러 토큰

### 1.1 브랜드 / 텍스트 / 서피스

| 역할 | Hex | 사용처 |
|---|---|---|
| Brand | `#9333EA` | CTA, 포커스, 활성 탭 아이콘, 보라 악센트 |
| Brand Soft | `#FAF5FF` | CTA 호버 배경, 뱃지 고정 표시 |
| Ink 900 | `#0A0E1A` | 본문 헤드라인, 다크 버튼 bg |
| Ink 700 | `#1E293B` | 다크 버튼 hover |
| Text 600 | `#475569` | 본문 강조 |
| Text 500 | `#64748B` | 본문 |
| Text 400 | `#94A3B8` | 레이블, 보조 설명 |
| Text 300 | `#CBD5E1` | disabled, separator |
| Surface | `#FFFFFF` | 카드 배경 (기본) |
| Surface Subtle | `#F7F8FA` | 세컨더리 섹션 배경, 탭 트레이 |
| Surface Mute | `#F2F4F6` | 데브 바 배경 |
| Border | `#F1F3F6` | 얇은 구분선, 카드 내부 divider |

### 1.2 세맨틱

| 역할 | Hex | 소프트 | 사용처 |
|---|---|---|---|
| Success | `#16A34A` | `#DCFCE7` | 적중, 완료, EASY 난이도 |
| Warning | `#EAB308` | `#FEF9C3` | NORMAL 난이도, 골드 메달 |
| Danger | `#EF4444` | `#FEE2E2` | 실패, HARD 난이도, 빗나감 |
| Heat | `#F97316` | `#FFF7ED` | Streak 활성, 불꽃 |
| Bronze | `#D97706` | `#FFEDD5` | 3위 메달 |
| Silver | `#94A3B8` | `#F1F5F9` | 2위 메달 |
| Gold | `#EAB308` | `#FEF9C3` | 1위 메달 |

### 1.3 Tier 컬러 (5단계 레벨 등급)

`LEVEL_TIERS` in `src/data/levelSystemData.js` 참조. 수정 시 이 표도 같이 갱신.

| Tier | Name | Key | Color | BgColor |
|---|---|---|---|---|
| 1 | 뉴비 | `newbie` | `#22c55e` | `#f0fdf4` |
| 2 | 레귤러 | `regular` | `#3b82f6` | `#eff6ff` |
| 3 | 컬렉터 | `collector` | `#a855f7` | `#faf5ff` |
| 4 | 마니아 | `maniac` | `#f97316` | `#fff7ed` |
| 5 | 레전드 | `legend` | `#06b6d4` | `#ecfeff` |

### 1.4 뱃지 컬러

`ALL_BADGES` in `src/data/levelSystemData.js` 참조. 각 뱃지는 고유 color 값을 갖는다. 인라인 표시 시 `badge.color + '14'` (≈8% opacity) 배경 + `badge.color` 아이콘.

### 1.5 Proficiency Tier (카테고리 숙련도)

`PROFICIENCY_TIERS` 참조. `BEGINNER → MASTER` 순으로 회색 → 금색.

---

## 2. 타이포그래피

폰트: `'SUIT', 'Noto Sans KR', sans-serif` (앱 전역 공통)

### Weight 규칙

| Weight | 용도 |
|---|---|
| 500 | 바디 텍스트, 보조 설명 |
| 600 | 칩 레이블, emphasis 본문 |
| 700 | 값(숫자), 버튼, 칩 |
| 800 | 섹션 타이틀, Hero 숫자, 페이지 타이틀 |

> 900은 사용하지 않는다. 800으로도 충분한 무게감을 낸다.

### Scale (PC 기준 → 모바일 축소)

| 토큰 | **PC 기준** | 모바일 adaptation | 용도 |
|---|---|---|---|
| `text-xs` | 11-12px | 10-11px | 레이블, 캡션, 배지 텍스트 |
| `text-sm` | 13px | 12px | 보조 본문, 칩, 메타 |
| `text-base` | 14-15px | 13-14px | 본문, 버튼, 리스트 항목 |
| `text-lg` | 16-17px | 15-16px | 강조 본문, 작은 값 |
| `text-xl` | 19-20px | 17-18px | 섹션 타이틀 |
| `text-2xl` | 22-24px | 20-22px | 큰 섹션 타이틀, Hero 작은 숫자 |
| `text-3xl` | 30-34px | 26-28px | 페이지 타이틀, 통계 값 |

디자인 시안은 PC 기준값으로 먼저 정하고, 모바일에서는 한 단계 다운스케일한다.

### Letter Spacing

- 본문: `-0.2px` ~ `-0.3px` (약한 음수)
- 헤드라인: `-0.4px` ~ `-0.7px`
- UPPERCASE 레이블: `+0.3px` ~ `+0.6px`
- 숫자 컬럼: **`font-variant-numeric: tabular-nums`** 필수 (정렬)

---

## 3. 스페이싱 / 라운드 / 그림자

### Radius

| 토큰 | Value | 용도 |
|---|---|---|
| `radius-sm` | 6-8px | 칩, 작은 버튼, 태그 |
| `radius-md` | 10-12px | 버튼, 인풋, 아이콘 박스 |
| `radius-lg` | 14-16px | 내부 블록 카드 |
| `radius-xl` | 18-20px | 최상위 섹션 카드, Hero |

### Shadow

| 토큰 | Value | 용도 |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(15,23,42,.04)` | 얇은 떠오름 |
| `shadow-md` | `0 0 0 1px rgba(15,23,42,.05), 0 6px 20px rgba(15,23,42,.05)` | 섹션 카드 (흰 배경) |
| `shadow-lg` | `0 10px 28px rgba(15,23,42,.08), 0 4px 8px rgba(15,23,42,.04)` | Hero / 중요 카드 |
| `shadow-brand` | `0 4px 12px rgba(147,51,234,.28)` | 보라 CTA 버튼 |
| `shadow-heat` | `0 8px 20px rgba(249,115,22,.3)` | 오렌지 streak pill |

### Spacing 규칙 (PC 기준)

- 카드 내부 패딩: **PC 28-32px / 모바일 20-24px**
- Hero 내부 패딩: **PC 36-40px / 모바일 24-28px**
- 섹션 카드 간 gap: **PC 16-20px / 모바일 14-16px**
- 섹션 그룹 간 gap: **PC 48px / 모바일 36px**
- 리스트 row vertical padding: **PC 18-20px / 모바일 14-18px**

---

## 4. 컴포넌트 패턴

### 4.1 섹션 카드 (백색)

```html
<div class="section-card">
  <header class="card-header">
    <h3 class="section-title">제목</h3>
    <p class="section-sub">부가 설명</p>
  </header>
  <!-- 내용 -->
</div>
```

공통 CSS (`CollectionView.vue`의 `:deep()` 오버라이드와 동일 톤):
- `background: white; border-radius: 20px; padding: 24px (mob) / 32px (desk)`
- `box-shadow: shadow-md`
- hover 시 `shadow-lg`로 부드럽게 떠오름 (`transition: box-shadow 0.25s`)

### 4.2 컬러 Hero 카드

Tier 색상을 듬뿍 쓴 임팩트 카드. 자기 식별이 중요한 화면에 사용.
- `background: tier.bgColor` 솔리드
- 우상단에 **대형 tier 아이콘(180px, opacity 0.1)** 장식 (overflow 잘림)
- 내부 sub-block은 `background: white` 카드로 대비

### 4.3 섹션 그룹 / 헤딩 악센트

```html
<section class="section-group accent-purple">
  <header class="section-heading">
    <div class="heading-main">
      <span class="accent-dot"></span>
      <h2 class="group-title">오늘 할 일</h2>
    </div>
    <span class="group-meta"><strong>2</strong> / 3</span>
  </header>
  <p class="group-desc">설명</p>
  <!-- 카드들 -->
</section>
```

`.accent-dot` = 6×22px 컬러 바. 클래스로 `accent-purple`, `accent-gold`, `accent-orange`, `accent-green`, `accent-gray` 지정.

### 4.4 탭 바 (세그먼트 컨트롤)

```
tray: background #F2F4F6, padding 5px, radius 14px
tab: flex:1, radius 10px, weight 700
 - inactive: color #64748B, hover 반투명 흰 bg
 - active: background white, shadow-sm, icon color #9333EA
```

### 4.5 토스트 (pill + blur)

```css
background: rgba(25, 31, 40, 0.92);
backdrop-filter: blur(12px);
border-radius: 100px;
padding: 14px 26px;
font-weight: 600;
/* 트랜지션 */
cubic-bezier(0.175, 0.885, 0.32, 1.275) /* 탄력 */
```

### 4.6 Secondary 섹션 (참고 정보 격하)

```css
background: #F7F8FA;
margin: 0 -16px (mob) / 0 -24px (desk);
padding: 24px 16px / 28px 24px;
border-radius: 16px;
```
내부 카드는 흰색 유지. 펼치기/접기 토글 동반.

### 4.7 버튼

| 종류 | 스타일 |
|---|---|
| Primary CTA (보상 받기) | bg `#9333EA`, weight 800, radius 8px, `shadow-brand`, hover → `#7C3AED` |
| Dark CTA (티켓 사용) | bg `#0A0E1A`, weight 700, radius 8px, hover → `#1E293B` |
| Secondary | bg `white`, 1px border `#E5E7EB`, text `#0A0E1A`, hover border `#9333EA` |
| Filter chip (세그먼트 내부) | tray는 `#F7F8FA`, active는 보라 fill `#9333EA` |

---

## 5. 유저 아이덴티티 컴포넌트 (피드/배틀/채팅 재사용)

**위치**: `src/components/identity/`

### 5.1 `<UserLevelTag>` — 레벨 + tier 인라인 뱃지

```vue
<UserLevelTag :level="13" />                    <!-- 기본: md/filled -->
<UserLevelTag :level="13" size="xs" />          <!-- 아주 작게 -->
<UserLevelTag :level="13" variant="soft" />     <!-- 연한 배경 -->
<UserLevelTag :level="13" variant="outline" />  <!-- 외곽선만 -->
```

- `size`: `xs` (10px) / `sm` (11px) / `md` (12px)
- `variant`: `filled` (tier color fill + white) / `soft` (bgColor + tier color) / `outline`
- 렌더: `[tier icon] Lv.13` 형태

**사용 가이드**
- 피드 유저 옆: `size="sm" variant="soft"` 권장
- 배틀 참가자 옆: `size="md" variant="filled"` (존재감 크게)
- 채팅 말풍선 위: `size="xs" variant="soft"` (공간 절약)

### 5.2 `<UserBadgeInline>` — 뱃지 한 개 인라인 표시

```vue
<UserBadgeInline badge-id="photographer" />                        <!-- 아이콘만 -->
<UserBadgeInline badge-id="photographer" size="md" show-label />   <!-- 이름까지 -->
<UserBadgeInline badge-id="weekly_champion" :count="3" />          <!-- x3 표시 -->
```

### 5.3 `<UserIdentity>` — 닉네임 + Lv + 핀 뱃지 컴포지트

```vue
<UserIdentity
  nickname="이컬렉터"
  :level="13"
  :badge-ids="['first_post', 'photographer', 'vote_king']"
  size="md"
  :max-badges="3"
/>
```

- `size`: `sm` (피드 댓글/리스트) / `md` (피드 카드 헤더) / `lg` (배틀 참가자)
- `max-badges`: 기본 3. 그 이상은 잘림

---

## 6. 아이콘 시스템

### 원칙 — 이모지는 **뱃지에만** (+ tier 아바타 예외)

| 유형 | 아이콘 |
|---|---|
| **뱃지 10종** (유저가 수집하는 성취 아이템) | **이모지** (badge.emoji) |
| **큰 Tier 아바타 블록** (Hero `.tier-avatar`, TierDetail `.tier-detail-avatar`) | **이모지** (tier.emoji) |
| **그 외 모든 UI** | **Lucide SVG** |

streak, 메달, 토스트, 배너, 버튼, 레이블, 구분자, 인라인 tier tag, 작은 tier 원 등은 예외 없이 Lucide SVG. 이모지를 UI에 남발하지 않는다 — 토스/당근/무신사의 절제된 톤을 유지하기 위함. Tier 아바타는 "큰 사각 블록의 대표 심볼" 역할이라 tier.emoji 허용.

### 6.1 이모지 사용 위치

#### 뱃지 (badge.emoji)

`levelSystemData.js`의 `ALL_BADGES`의 각 뱃지 `emoji` 필드를 그대로 렌더.

| 뱃지 | emoji |
|---|---|
| first_post | 🌟 |
| photographer | 📸 |
| vote_king | 🗳️ |
| communicator | 💬 |
| influencer | 👥 |
| weekly_champion | 🏆 |
| top10 | ⭐ |
| hot_master | 🔥 |
| early_bird | 🎯 |
| user_of_year | 👑 |

렌더 위치: `BadgeCollection.vue`, `UserBadgeInline.vue`, `BadgeDetailModal.vue`.

#### Tier 아바타 (tier.emoji)

큰 심볼 블록으로 사용. 뱃지처럼 "카드의 대표 이미지" 역할.

| Tier | emoji |
|---|---|
| newbie | 🌱 |
| regular | 💪 |
| collector | 🎨 |
| maniac | 🔥 |
| legend | 💎 |

렌더 위치: **`LevelCard.vue` `.tier-avatar`**, **`TierDetail.vue` `.tier-detail-avatar`**.

**인라인 tier 표시**(UserLevelTag, 작은 칩 등)는 이모지 금지 → `getTierIcon()` SVG 사용.

### 6.2 SVG (UI chrome 전부)

**라이브러리**: `lucide-vue-next` (아웃라인 stroke 기반)

**stroke-width 기본값**: `2` (작을 때 `2.2~2.4`로 가시성 확보)

**헬퍼**: `src/utils/collectionIcons.js`

```js
import { Gift, Ticket, Flame, Sparkles, Pin, CheckCircle2, XCircle, AlertCircle, Award, Target } from '@/utils/collectionIcons'
import { getTierIcon, getProficiencyIcon } from '@/utils/collectionIcons'
```

| 맥락 | 아이콘 |
|---|---|
| Tier 아바타 / 로드맵 / 인라인 | `getTierIcon(tier.tier)` → `Sprout/Zap/Palette/Rocket/Gem` |
| 탭: 보상 / 숙련도 / 예측 | `Gift` / `Award` / `Target` |
| Streak (Hero pill) | `Flame` |
| 티켓 (Hero 티켓 row CTA) | `Ticket` |
| 토스트 — EXP 획득 | `Sparkles` |
| 토스트 — 고정/해제 | `Pin` |
| 토스트 — 에러 | `AlertCircle` |
| 미션 완료 상태 | `CheckCircle2` |
| 예측 결과 태그 | `CheckCircle2` / `XCircle` |
| 배너 (보상 받으러 가기) | `Gift` |
| 등급 상세 — 다음 목표 | `Target` |
| Proficiency tier | `getProficiencyIcon(tierKey)` → `Circle/Medal/ChevronsUp/Diamond/Crown` |
| 랭커 순위 표시 | 숫자만 (1/2/3은 `rank-1/2/3` 배경색으로 구분) |

### 6.3 새 뱃지 추가 시
1. `levelSystemData.js`의 `ALL_BADGES.basic` 또는 `ALL_BADGES.special`에 추가 (color, emoji 포함)
2. 이 문서 6.1 표 업데이트

### 6.4 새 Tier 추가 시
1. `levelSystemData.js`의 `LEVEL_TIERS`에 추가
2. `collectionIcons.js`의 `TIER_ICON_MAP`에 Lucide 매핑 추가 (Sprout/Zap 계열에서 선택)
3. 이 문서 6.2 표 업데이트

---

## 7. 반응형 (PC 퍼스트)

**디자인 기준은 데스크톱**. 모바일은 그 adaptation이며, 아래 브레이크포인트로 내려가면서 조정한다.

| 이름 | 너비 | 타겟 | 역할 |
|---|---|---|---|
| `xl` | ≥1280 | 와이드 데스크톱 | **기본 디자인 레퍼런스** |
| `lg` | 1024-1279 | 일반 데스크톱 | 1x 컬럼 + 약간 좁은 패딩 |
| `md` | 768-1023 | 태블릿 | 필요 시 2-col → 1-col |
| `sm` | 640-767 | 큰 모바일 | 단일 컬럼 + 축소 패딩 |
| `xs` | 420-639 | 일반 모바일 | 중요 요소 유지, 보조 요소 scroll/hide |
| default | ≤419 | 좁은 모바일 | CTA full-width, 스트립 2×2 등 fallback |

**코드 컨벤션** — CSS는 `min-width` 스타일로 쓰되, **기준값은 데스크톱 기준으로 먼저 정한 뒤**, 좁은 화면에서 조정하는 방식으로 작성한다.

```css
/* ✅ PC에서 이상적인 값을 먼저 정하고 */
.section-card { padding: 32px; border-radius: 20px; }
.page-title { font-size: 34px; }

/* 모바일 adaptation */
@media (max-width: 767px) {
  .section-card { padding: 24px; }
  .page-title { font-size: 26px; }
}
```

(현재 코드는 역순 `min-width` 쿼리로 작성된 곳이 많다. 새로 작성하거나 리팩터할 땐 위 방식 권장.)

**콘텐츠 최대 너비**: `xl` 900px → `md` 820px → `mobile` 720px

**PC 기준 디자인 레퍼런스**
- 섹션 카드 패딩: **32px**
- Hero 패딩: **36-40px**
- 섹션 카드 간 gap: **16-20px**
- 섹션 그룹 간 gap: **48px**
- 페이지 타이틀: **34px** / 섹션 타이틀: **22px** / 본문: **14-15px**
- 통계 스트립: **4×1**
- 뱃지 그리드: **4-5 columns**
- 미션/히스토리 리스트: single row, 모든 정보 inline

**모바일 적응 체크 포인트**
- 탭/칩 많은 바: `overflow-x: auto + scrollbar-width: none`
- 통계 스트립: **4×1 → 480px 미만에서 2×2**
- 뱃지 그리드: **5→4→3→2→1 계단식 축소**
- 히어로 상단 identity+pill: `flex-wrap` 필수
- 작은 화면(≤400px) CTA row: `flex-direction: column` + 버튼 full-width
- 숫자 정렬 리스트: 항상 `tabular-nums`

---

## 8. 애니메이션 / 트랜지션

- 프로그레스 바 fill: `0.6s cubic-bezier(0.22, 0.61, 0.36, 1)`
- 일반 hover: `0.15s ease`
- 박스 그림자 전환: `0.25s ease`
- 토스트: `0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)` (탄력)
- 탭 전환: `0.18s ease`

---

## 9. 새 UI 작업 시 체크리스트

리워드/컬렉션 맥락의 UI를 새로 만들거나, 다른 페이지에서 유저 레벨/뱃지를 표시할 때:

- [ ] **PC(≥1280px)에서 먼저 디자인했는가?** 모바일은 그 축소판
- [ ] 본 문서의 컬러 토큰만 사용했는가?
- [ ] 그라데이션을 쓰지 않았는가?
- [ ] 이모지를 뱃지 외에 쓰지 않았는가? 나머지는 모두 Lucide SVG (6절 참조)
- [ ] Tier/레벨 표시에 `<UserLevelTag>` 또는 `<UserIdentity>`를 썼는가? (직접 스타일링 X)
- [ ] 핀 뱃지 표시에 `<UserBadgeInline>`을 썼는가?
- [ ] 모바일(≤400px)에서 overflow/줄바꿈 문제 없나?
- [ ] 숫자 컬럼에 `tabular-nums` 적용했나?
- [ ] 버튼 위계가 규칙에 맞나? (Primary=보라, Dark=검정, Secondary=흰+외곽선)
- [ ] 섹션 그룹 제목에 `accent-dot` 추가했나?
