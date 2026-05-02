# 커뮤니티 리스트 스타일 (모바일 대시보드 / 피드)

## 출처

`docs/IMG_3526.PNG` (솜시당 자유게시판) 의 정보 밀도 + 정돈된 list-based 레이아웃을
참고하여, 프로젝트의 기존 톤(`design-system.md`)에 맞게 재정의한 모바일 리스트 패턴.

## 0. 대원칙

- **수직 리스트** — 가로 스크롤 / 그리드 대신 한 줄 한 아이템 세로 정렬
- **우측 썸네일** — 64–72px 정사각, 좌측은 텍스트 영역
- **헤어라인 분리** — 카드 그림자/라운드 대신 `1px solid #F1F3F6` 하단 구분선
- **얇은 카테고리 라벨** — 11px / `#71717A` / 배경 없음 / 줄 위로
- **N 배지** — 신규 항목은 5px 빨간 점 또는 mini badge로 표시
- **단일 FAB** — 우하단 56px 원형, 브랜드 컬러 솔리드
- 그라데이션 / 이모지 / 칩에 색채감 폭주 금지 (design-system.md 0절 준수)

---

## 1. 컬러 (design-system.md 1절을 베이스로 하되 리스트에서 자주 쓰는 값만 정리)

| 역할 | Hex | 비고 |
|---|---|---|
| Brand | `#9333EA` | FAB, 활성 탭/칩 fill, "N" 배지 |
| Brand Soft | `#FAF5FF` | 활성 칩 hover bg (옵션) |
| Ink 900 | `#0A0E1A` | 리스트 타이틀 |
| Text 500 | `#64748B` | 미리보기 본문 |
| Text 400 | `#94A3B8` | 메타 (댓글/좋아요/시간) |
| Text 300 | `#CBD5E1` | meta divider 점 |
| Border | `#F1F3F6` | 아이템 하단 헤어라인 |
| Chip Bg (Off) | `#F4F4F5` | 비활성 필터칩 bg |
| Notice Bg | `#FEF3C7` | 상단 핀 공지 (warning soft) |
| Notice Text | `#92400E` | 공지 텍스트 |

---

## 2. 타이포그래피

| 요소 | Size | Weight | Color |
|---|---|---|---|
| 카테고리 라벨 | 11px | 600 | `#71717A` |
| 리스트 타이틀 | 14.5px | 700 | `#0A0E1A` |
| 본문 미리보기 | 12.5px | 500 | `#64748B` |
| 메타 (수치) | 11px | 600 | `#64748B` |
| 메타 (라벨/시간) | 11px | 500 | `#94A3B8` |
| FAB 아이콘 | 22px Lucide | — | `#FFFFFF` |

라인 클램프: 타이틀 1줄, 본문 1줄(고밀도) / 2줄(저밀도). `text-overflow: ellipsis`.

---

## 3. 스페이싱 / 사이즈

| 토큰 | 값 | 용도 |
|---|---|---|
| `--list-item-py` | 14px | 아이템 세로 패딩 |
| `--list-item-px` | 16px | 아이템 가로 패딩 |
| `--list-thumb` | 68px | 정사각 썸네일 |
| `--list-thumb-radius` | 12px | 썸네일 라운드 |
| `--list-gap` | 12px | 텍스트 ↔ 썸네일 간격 |
| `--meta-gap` | 8px | 메타 토큰 간 간격 |
| `--chip-h` | 30px | 필터 칩 높이 |
| `--chip-radius` | 999px | 필터 칩 (pill) |
| `--fab-size` | 56px | FAB 지름 |
| `--fab-offset` | 18px | FAB bottom/right offset |

---

## 4. 컴포넌트 패턴

### 4.1 List Item

```
┌────────────────────────────────────────────┐
│ [카테고리]                                ┌────┐ │
│ 타이틀 (1줄, ellipsis) [N]                │ img│ │
│ 본문 미리보기 (1–2줄)                       └────┘ │
│ 💬 12  👁 96  · 닉네임 · 8시간 전             │
└────────────────────────────────────────────┘
        └─────────  border-bottom 1px ─────────┘
```

- `display: flex; gap: 12px; padding: 14px 16px;`
- 좌측 텍스트 컬럼: `flex: 1; min-width: 0`
- 우측 썸네일: `width: 68px; height: 68px; border-radius: 12px; flex-shrink: 0`
- 썸네일 없으면 placeholder (#F4F4F5 + 카테고리 첫글자) 또는 생략 가능
- N 배지: 타이틀 옆 5px circle (`#EF4444`) 또는 inline `mini-badge` (8px 폰트, 둥근 5px 패드)
- 메타 아이콘은 Lucide 12px / 색 `#94A3B8`. 이모지 사용 금지 (위 ASCII는 가이드용)

### 4.2 Sticky Header + Filter Chips

```
[← 뒤로]  자유게시판 ▾                            [🔔]
─────────────────────────────────────────────
[전체] (인기) (베이킹) (연애) (운동) (맛집)         ← horizontal scroll
─────────────────────────────────────────────
```

- 헤더: `position: sticky; top: 0; background: #FFF; z-index: 10`
- 필터 영역: `display: flex; overflow-x: auto; gap: 8px; padding: 10px 16px`
- 활성칩: `bg: #9333EA; color: #fff; font-weight: 700`
- 비활성칩: `bg: #F4F4F5; color: #475569; font-weight: 600`
- 칩 padding: `0 14px`, height 30px, radius 999px

### 4.3 Pinned Notice

```
┌──────────────────────────────────────────────┐
│ [공지] [이벤트]   타이틀 (~5/20)         2일 전 │
└──────────────────────────────────────────────┘
```

- bg: `#FEF3C7`, 라운드 12px, 좌측 4px solid `#F59E0B`
- "공지" 라벨: 9px / 800 / `#92400E`

### 4.4 FAB

- `position: fixed; right: 18px; bottom: calc(96px + safe-area-inset-bottom)` — BottomNavigation 위로 띄움
- 56px 원형, `bg: #9333EA`, `box-shadow: 0 6px 20px rgba(147, 51, 234, 0.32)`
- 액션이 단일이면 simple FAB, 복수면 long-press / 시트 오픈

### 4.5 Tab Underline (페이지 내 탭)

- 활성 탭: `border-bottom: 2px solid #0A0E1A; color: #0A0E1A; font-weight: 800`
- 비활성: `color: #94A3B8; font-weight: 600`
- 탭 컨테이너 하단에 `1px solid #F1F3F6` (구분선)

---

## 5. Do / Don't

| ✅ | ❌ |
|---|---|
| 헤어라인으로 아이템 구분 | 카드마다 그림자 + 라운드 + 보더 동시 사용 |
| 우측 정사각 썸네일 (16:9 / 4:5 그림자 카드 X) | 풀블리드 큰 이미지 카드 |
| 메타에 Lucide 12px 아이콘 | 이모지 (🔥💬 등) 메타로 사용 |
| FAB 1개 + brand 컬러 | 페이지마다 다색 FAB / 그라데이션 FAB |
| 활성 칩만 색 / 나머지 회색 | 칩마다 카테고리 컬러 입히기 |

---

## 6. 적용 컴포넌트 (현 시점)

- `src/views/DashboardView.vue` 모바일 — `mhot-section`을 우측 썸네일 리스트로 변환 (출발점)
- 향후 적용: `mpick-section`(요거픽 미니 리스트), `FeedHomeView`의 모바일 카드 → 통일

스타일 토큰을 변경할 때는 이 문서와 `design-system.md`를 함께 갱신.
