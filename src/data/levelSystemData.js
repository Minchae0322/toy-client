/**
 * 5단계 레벨 시스템 & 16종 뱃지 시스템 (v2) 테스트 데이터
 */

// ==================== 요거트 등급 정의 (최종) ====================
// Plain → Fruity → Granola → Parfait → Signature
export const LEVEL_TIERS = [
  {
    tier: 'plain',
    name: 'Plain',
    emoji: '🥛',
    art: 'plain',
    levelRange: [1, 5],
    color: '#94a3b8',
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0',
    description: '플라스틱 컵 — 플랫폼을 둘러보며 감을 잡아보세요!',
    requirements: '가입 즉시',
    nextGoal: '레벨 6에 도달해서 Fruity가 되자!',
    features: ['인증 게시물 작성', '🔥 및 👍 반응', '댓글 작성', 'DM 전송', '배틀 투표'],
    restrictions: ['배틀 생성 불가', '제품 등록 불가', '프로필 커스텀 불가'],
  },
  {
    tier: 'fruity',
    name: 'Fruity',
    emoji: '🍓',
    art: 'fruity',
    levelRange: [6, 10],
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    description: '유리컵 + 과일 토핑 — 본격적으로 나만의 맛을 찾아가는 시기.',
    requirements: '총 2,300 EXP 이상',
    nextGoal: '레벨 11에 도달해서 Granola가 되자!',
    features: ['배틀 제품 등록', '배틀 생성', '프로필 커스텀', '전문 카테고리 선택', '추천 피드 가점'],
    restrictions: ['브랜드 협업 불가', 'VIP 라운지 불가'],
  },
  {
    tier: 'granola',
    name: 'Granola',
    emoji: '🥣',
    art: 'granola',
    levelRange: [11, 15],
    color: '#a855f7',
    bgColor: '#faf5ff',
    borderColor: '#e9d5ff',
    description: '도자기 볼 + 그래놀라 — 취향과 전문성이 단단해지는 시기.',
    requirements: '총 10,000 EXP 이상',
    nextGoal: '레벨 16에 도달해서 Parfait가 되자!',
    features: ['배틀 3개 동시 생성', '피드 우선 노출', '브랜드 협업 기회', 'VIP 라운지 접근'],
    restrictions: ['공식 앰배서더 불가', '커스텀 뱃지 불가'],
  },
  {
    tier: 'parfait',
    name: 'Parfait',
    emoji: '🍨',
    art: 'parfait',
    levelRange: [16, 20],
    color: '#f97316',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    description: '파르페 잔 + 레이어 — 커뮤니티를 이끄는 인플루언서.',
    requirements: '총 24,000 EXP 이상',
    nextGoal: '레벨 21에 도달해서 Signature가 되자!',
    features: ['공식 앰배서더', '배틀 스폰서', '피드 최우선 노출', '전용 컬러 닉네임'],
    restrictions: ['커스텀 뱃지 불가'],
  },
  {
    tier: 'signature',
    name: 'Signature',
    emoji: '💎',
    art: 'signature',
    levelRange: [21, 99],
    color: '#06b6d4',
    bgColor: '#ecfeff',
    borderColor: '#a5f3fc',
    description: '고블릿 + 금박 · 플라워 — 커뮤니티의 문화를 만드는 존재.',
    requirements: '총 53,000 EXP 이상',
    nextGoal: '커뮤니티를 발전시키고 새로운 가치를 만들어가세요!',
    features: ['커스텀 뱃지 제작', 'Signature 배틀 배너', '수익 창출', '오프라인 이벤트 초대'],
    restrictions: [],
  },
]

// ==================== EXP 획득 기준표 (v2) ====================
export const EXP_RULES = {
  // ── 피드: 인증 작성 (1회 지급) ──
  feedCreate: [
    { action: '인증 게시 기본', exp: 60, icon: '📸', limit: null },
    { action: '한줄평 50자 이상', exp: 10, icon: '📝', limit: null, condition: 'review >= 50자' },
    { action: '사진 3장 이상', exp: 15, icon: '📷', limit: null, condition: 'photos >= 3' },
    { action: '평가 입력', exp: 10, icon: '⭐', limit: null, condition: 'evaluation 존재' },
    { action: '구매처 입력', exp: 15, icon: '🏪', limit: null, condition: 'buyPlace 존재 (모름 제외)' },
    { action: '구매가 입력', exp: 10, icon: '💰', limit: null, condition: 'buyPrice > 0 (선물받음 포함)' },
    { action: '해시태그 3개 이상', exp: 10, icon: '#️⃣', limit: null, condition: 'hashtags >= 3' },
  ],
  // ── 피드: 반응 수신 (일일 캡 적용) ──
  feedReaction: [
    { action: '🔥 받기', exp: 8, icon: '🔥', limit: '일 400 EXP', dailyCap: 400, unit: '개당' },
    { action: '👍 받기', exp: 4, icon: '👍', limit: '일 150 EXP', dailyCap: 150, unit: '개당' },
    { action: '저장 당하기', exp: 12, icon: '🔖', limit: '일 300 EXP', dailyCap: 300, unit: '개당' },
    { action: '댓글 받기', exp: 6, icon: '💬', limit: '일 200 EXP', dailyCap: 200, unit: '개당' },
    { action: '공유 당하기', exp: 15, icon: '🔗', limit: '일 300 EXP', dailyCap: 300, unit: '개당' },
  ],
  // ── 피드: 피크 보상 (이벤트성) ──
  feedPeak: [
    { action: '"지금 뜨는 핫-기록" 진입', exp: 300, icon: '📈', limit: null },
    { action: '"실시간 요거 봄" TOP 6', exp: 500, icon: '🎉', limit: null },
    { action: '주간 HOT 피드 랭킹', exp: 400, icon: '📊', limit: null },
    { action: 'BEST 평가 + 🔥 50개', exp: 200, icon: '💎', limit: null },
  ],
  // ── 배틀: 참여 ──
  battle: [
    { action: '단순 투표', exp: 5, icon: '🗳️', limit: '하루 10개' },
    { action: '가중 투표 (1st/2nd/3rd)', exp: 12, icon: '🎯', limit: '하루 10개' },
    { action: 'PICK 한마디 작성 (20자+)', exp: 15, icon: '🎤', limit: null },
    { action: 'PICK 한마디 👍 받기', exp: 5, icon: '👍', limit: '일 100 EXP', dailyCap: 100, unit: '개당' },
    { action: '배틀 제품 등록', exp: 40, icon: '📦', limit: null },
  ],
  // ── 배틀: 결과 ──
  battleResult: [
    { action: '배틀 참여 (완주)', exp: 30, icon: '🏁', limit: null },
    { action: '배틀 TOP 50', exp: 150, icon: '📋', limit: null },
    { action: '배틀 TOP 10', exp: 300, icon: '⭐', limit: null },
    { action: '배틀 우승', exp: 600, icon: '🏆', limit: null },
    { action: '예측 적중 (1순위 → 1위)', exp: 100, icon: '🔮', limit: null },
  ],
  // ── 소셜 / 공통 ──
  social: [
    { action: '일일 출석', exp: 10, icon: '📅', limit: '일일 1회' },
    { action: '댓글 작성 (10자+)', exp: 5, icon: '💬', limit: '일 100 EXP', dailyCap: 100, unit: '개당' },
  ],
  // ── 특별 / 1회성 ──
  special: [
    { action: '에디터픽 선정', exp: 300, icon: '✨', limit: null },
    { action: '첫 인증', exp: 100, icon: '🌟', limit: '최초 1회' },
    { action: 'HOT 100 진입 (발굴자)', exp: 100, icon: '🏅', limit: null },
    { action: 'HOT 50 진입 (발굴자)', exp: 300, icon: '🏅', limit: null },
    { action: 'HOT 10 진입 (발굴자)', exp: 800, icon: '🏅', limit: null },
  ],
  // ── 스트릭 보너스 ──
  streak: [
    { action: '3일 연속 인증', exp: 30, icon: '🔥', limit: null },
    { action: '7일 연속 인증', exp: 80, icon: '🔥', limit: null },
    { action: '14일 연속 인증', exp: 200, icon: '🔥', limit: null },
    { action: '30일 연속 인증', exp: 500, icon: '🔥', limit: null },
    { action: '100일 연속 인증', exp: 2000, icon: '💎', limit: null },
  ],
  // ── 일일 미션 ──
  mission: [
    { action: '🔵 Easy 미션', exp: 20, icon: '🔵', limit: '일 1개' },
    { action: '🟡 Normal 미션', exp: 50, icon: '🟡', limit: '일 1개' },
    { action: '🔴 Hard 미션', exp: 100, icon: '🔴', limit: '일 1개' },
    { action: '올클리어 보너스', exp: 80, icon: '🎁', limit: '일 1회' },
  ],
  // ── 주간 랭킹 ──
  weeklyRanking: [
    { action: '주간 랭킹 TOP 1', exp: 800, icon: '🥇', limit: null },
    { action: '주간 랭킹 TOP 2~10', exp: 400, icon: '🏅', limit: null },
    { action: '카테고리 주간왕 TOP 1', exp: 500, icon: '🥇', limit: null },
    { action: '카테고리 주간왕 TOP 2~3', exp: 300, icon: '🏅', limit: null },
  ],
}

// ==================== 레벨별 필요 EXP (v2 최종) ====================
// 활성(~560/일): Fruity ~4일, Granola ~43일, Parfait ~7.5개월, Signature ~1.5년
// 하드코어(~1,536/일): Parfait ~3개월, Signature ~10개월
export const LEVEL_EXP_TABLE = [
  // ── 🥛 Plain (Lv.1-5) ──
  { level: 1, requiredExp: 0, totalExp: 0 },
  { level: 2, requiredExp: 200, totalExp: 200 },
  { level: 3, requiredExp: 300, totalExp: 500 },
  { level: 4, requiredExp: 500, totalExp: 1000 },
  { level: 5, requiredExp: 500, totalExp: 1500 },
  // ── 🍓 Fruity (Lv.6-10) ──
  { level: 6, requiredExp: 800, totalExp: 2300 },
  { level: 7, requiredExp: 1000, totalExp: 3300 },
  { level: 8, requiredExp: 1200, totalExp: 4500 },
  { level: 9, requiredExp: 1500, totalExp: 6000 },
  { level: 10, requiredExp: 2000, totalExp: 8000 },
  // ── 🥣 Granola (Lv.11-15) ──
  { level: 11, requiredExp: 2000, totalExp: 10000 },
  { level: 12, requiredExp: 2200, totalExp: 12200 },
  { level: 13, requiredExp: 2400, totalExp: 14600 },
  { level: 14, requiredExp: 2600, totalExp: 17200 },
  { level: 15, requiredExp: 2800, totalExp: 20000 },
  // ── 🍨 Parfait (Lv.16-20) ──
  { level: 16, requiredExp: 4000, totalExp: 24000 },
  { level: 17, requiredExp: 4500, totalExp: 28500 },
  { level: 18, requiredExp: 5000, totalExp: 33500 },
  { level: 19, requiredExp: 5500, totalExp: 39000 },
  { level: 20, requiredExp: 6000, totalExp: 45000 },
  // ── 💎 Signature (Lv.21+, open-ended) ──
  { level: 21, requiredExp: 8000, totalExp: 53000 },
  { level: 22, requiredExp: 10000, totalExp: 63000 },
  { level: 23, requiredExp: 12000, totalExp: 75000 },
  { level: 24, requiredExp: 15000, totalExp: 90000 },
  { level: 25, requiredExp: 18000, totalExp: 108000 },
  { level: 26, requiredExp: 20000, totalExp: 128000 },
  { level: 27, requiredExp: 22000, totalExp: 150000 },
  { level: 28, requiredExp: 24000, totalExp: 174000 },
  { level: 29, requiredExp: 26000, totalExp: 200000 },
  { level: 30, requiredExp: 28000, totalExp: 228000 },
  { level: 31, requiredExp: 30000, totalExp: 258000 },
  { level: 32, requiredExp: 32000, totalExp: 290000 },
  { level: 33, requiredExp: 35000, totalExp: 325000 },
  { level: 34, requiredExp: 38000, totalExp: 363000 },
  { level: 35, requiredExp: 40000, totalExp: 403000 },
  { level: 36, requiredExp: 45000, totalExp: 448000 },
  { level: 37, requiredExp: 50000, totalExp: 498000 },
  { level: 38, requiredExp: 55000, totalExp: 553000 },
  { level: 39, requiredExp: 60000, totalExp: 613000 },
  { level: 40, requiredExp: 70000, totalExp: 683000 },
]

// ==================== 뱃지 정의 (v2) ====================
export const ALL_BADGES = {
  // 기본 뱃지 (5개)
  basic: [
    {
      id: 'first_post',
      name: '첫 인증',
      emoji: '🌟',
      type: 'basic',
      description: '첫 인증 게시물을 작성하면 자동 지급',
      condition: '인증 게시물 1개 작성',
      effect: '소속감 부여',
      color: '#eab308',
    },
    {
      id: 'photographer',
      name: '포토그래퍼',
      emoji: '📸',
      type: 'basic',
      description: '고품질 사진 20장 업로드 시 지급',
      condition: '고품질 사진 20장',
      effect: '추천 피드 가점',
      color: '#ec4899',
    },
    {
      id: 'vote_king',
      name: '투표왕',
      emoji: '🗳️',
      type: 'basic',
      description: '가중 투표 50회 이상 참여 시 지급',
      condition: '가중 투표 50회',
      effect: '배틀 "활발한 배틀" 표시',
      color: '#6366f1',
    },
    {
      id: 'communicator',
      name: '소통왕',
      emoji: '💬',
      type: 'basic',
      description: '댓글 100개 이상 작성 시 지급 (10자 이상)',
      condition: '댓글 100개 (10자 이상)',
      effect: '댓글 상위 노출',
      color: '#14b8a6',
    },
    {
      id: 'influencer',
      name: '인플루언서',
      emoji: '👥',
      type: 'basic',
      description: '팔로워 100명 달성 시 지급',
      condition: '팔로워 100명',
      effect: '브랜드 협찬 대상 포함',
      color: '#f97316',
    },
  ],
  // 특별 뱃지 (5개 — 기존)
  special: [
    {
      id: 'weekly_champion',
      name: '주간 챔피언',
      emoji: '🏆',
      type: 'special',
      description: '배틀에서 1위 차지 시 지급 (다회 가능)',
      condition: '배틀 1위',
      effect: '"전 챔피언 추천" 표시, 트로피 케이스',
      color: '#eab308',
      stackable: true,
    },
    {
      id: 'top10',
      name: 'TOP 10',
      emoji: '⭐',
      type: 'special',
      description: '배틀 TOP 10 진입 5회 이상 시 지급',
      condition: 'TOP 10 5회',
      effect: '"검증된 추천" 표시',
      color: '#f59e0b',
    },
    {
      id: 'hot_master',
      name: '핫템 마스터',
      emoji: '🔥',
      type: 'special',
      description: '🔥 누적 1,000개 수령 시 지급',
      condition: '🔥 1,000개 누적',
      effect: '"🔥 마스터 추천" 피드 우선 노출',
      color: '#ef4444',
    },
    {
      id: 'early_bird',
      name: '얼리버드',
      emoji: '🎯',
      type: 'special',
      description: '신상품 발매일 최초 인증 10회 달성 시 지급',
      condition: '발매일 인증 10회',
      effect: '브랜드 신제품 사전 정보 제공',
      color: '#8b5cf6',
    },
    {
      id: 'user_of_year',
      name: '올해의 유저',
      emoji: '👑',
      type: 'special',
      description: '연간 랭킹 1위 달성 시 지급 (연 1명)',
      condition: '연간 랭킹 1위',
      effect: '공식 앰배서더, 왕관 애니메이션, 명예의 전당',
      color: '#d97706',
    },
  ],
  // v2 신규 뱃지 (6개)
  v2: [
    {
      id: 'store_sharer',
      name: '구매처 쉐어러',
      emoji: '🏪',
      type: 'v2',
      description: '구매처+가격 포함 인증 30개 작성 시 지급',
      condition: '구매처+가격 입력 글 30개',
      effect: '"도움되는 자랑" 라벨',
      color: '#0ea5e9',
    },
    {
      id: 'hot_maker',
      name: '핫메이커',
      emoji: '📸',
      type: 'v2',
      description: '"실시간 요거 봄" TOP 6에 10회 진입 시 지급',
      condition: 'TOP 6 10회',
      effect: '"자랑의 달인" 프로필 배너',
      color: '#f43f5e',
    },
    {
      id: 'bookmark_king',
      name: '저장왕',
      emoji: '🔖',
      type: 'v2',
      description: '저장 당한 횟수 총 500개 달성 시 지급',
      condition: '저장 당한 총 500개',
      effect: '"따라하고 싶게" 피드 가점',
      color: '#10b981',
    },
    {
      id: 'best_proof',
      name: 'BEST 증명',
      emoji: '💯',
      type: 'v2',
      description: 'BEST 평가 + 🔥 100개 이상 받은 글 10개 달성 시 지급',
      condition: 'BEST+🔥100 글 10개',
      effect: '"말이 사실이었다" 인증 마크',
      color: '#8b5cf6',
    },
    {
      id: 'pick_master',
      name: '명언가',
      emoji: '🎤',
      type: 'v2',
      description: '월간 명 PICK 한마디 선정 3회 달성 시 지급',
      condition: '월간 명 한마디 3회',
      effect: 'PICK 한마디 상단 고정',
      color: '#f59e0b',
    },
    {
      id: 'discoverer',
      name: '발굴자',
      emoji: '🏅',
      type: 'v2',
      description: 'HOT 100 TOP 10 제품 최초 인증 5회 달성 시 지급',
      condition: 'TOP 10 제품 최초 인증 5회',
      effect: '"트렌드 발견자" 프로필 타이틀',
      color: '#06b6d4',
    },
  ],
}

// ==================== 테스트 유저 데이터 (v2) ====================
export const TEST_USERS = [
  // Plain 유저
  {
    userId: 'user_001',
    nickname: '김플레인',
    profileImage: null,
    level: 3,
    currentExp: 180,
    totalExp: 680,
    tier: 'plain',
    certificationCount: 5,
    fireCount: 32,
    followerCount: 8,
    consecutiveDays: 3,
    joinDate: '2026-02-20',
    badges: [
      { badgeId: 'first_post', earnedAt: '2026-02-20', count: 1 },
    ],
    badgeProgress: {
      photographer: { current: 3, target: 20 },
      vote_king: { current: 7, target: 50 },
      communicator: { current: 12, target: 100 },
      influencer: { current: 8, target: 100 },
      weekly_champion: { current: 0, target: 1 },
      top10: { current: 0, target: 5 },
      hot_master: { current: 32, target: 1000 },
      early_bird: { current: 0, target: 10 },
      user_of_year: { current: 0, target: 1 },
      store_sharer: { current: 1, target: 30 },
      hot_maker: { current: 0, target: 10 },
      bookmark_king: { current: 4, target: 500 },
      best_proof: { current: 0, target: 10 },
      pick_master: { current: 0, target: 3 },
      discoverer: { current: 0, target: 5 },
    },
    recentExpHistory: [
      { date: '2026-03-06', action: '인증 게시 (기본)', exp: 60 },
      { date: '2026-03-06', action: '완성도 보너스 (사진3+평가)', exp: 25 },
      { date: '2026-03-06', action: '🔥 받기 x5', exp: 40 },
      { date: '2026-03-06', action: '일일 출석', exp: 10 },
      { date: '2026-03-05', action: '인증 게시 (기본)', exp: 60 },
      { date: '2026-03-05', action: '댓글 작성 x3', exp: 15 },
      { date: '2026-03-04', action: '인증 게시 (기본)', exp: 60 },
      { date: '2026-03-04', action: '🔥 받기 x8', exp: 64 },
    ],
  },
  // Fruity 유저
  {
    userId: 'user_002',
    nickname: '박프루티',
    profileImage: null,
    level: 8,
    currentExp: 900,
    totalExp: 5400,
    tier: 'fruity',
    certificationCount: 22,
    fireCount: 187,
    followerCount: 34,
    consecutiveDays: 12,
    joinDate: '2026-01-10',
    badges: [
      { badgeId: 'first_post', earnedAt: '2026-01-10', count: 1 },
      { badgeId: 'vote_king', earnedAt: '2026-02-28', count: 1 },
    ],
    badgeProgress: {
      photographer: { current: 11, target: 20 },
      communicator: { current: 45, target: 100 },
      influencer: { current: 34, target: 100 },
      weekly_champion: { current: 0, target: 1 },
      top10: { current: 1, target: 5 },
      hot_master: { current: 187, target: 1000 },
      early_bird: { current: 2, target: 10 },
      user_of_year: { current: 0, target: 1 },
      store_sharer: { current: 8, target: 30 },
      hot_maker: { current: 0, target: 10 },
      bookmark_king: { current: 22, target: 500 },
      best_proof: { current: 1, target: 10 },
      pick_master: { current: 0, target: 3 },
      discoverer: { current: 0, target: 5 },
    },
    recentExpHistory: [
      { date: '2026-03-06', action: '인증 게시 (완성도 MAX)', exp: 130 },
      { date: '2026-03-06', action: '🔥 받기 x12', exp: 96 },
      { date: '2026-03-06', action: '가중 투표 x3', exp: 36 },
      { date: '2026-03-06', action: '일일 출석', exp: 10 },
      { date: '2026-03-05', action: '배틀 제품 등록', exp: 40 },
      { date: '2026-03-05', action: '🔥 받기 x15', exp: 120 },
      { date: '2026-03-05', action: '🔵 Easy 미션', exp: 20 },
    ],
  },
  // Granola 유저
  {
    userId: 'user_003',
    nickname: '이그래놀라',
    profileImage: null,
    level: 18,
    currentExp: 3200,
    totalExp: 36700,
    tier: 'granola',
    certificationCount: 45,
    fireCount: 623,
    followerCount: 89,
    consecutiveDays: 28,
    joinDate: '2025-11-15',
    specialCategory: '스니커즈',
    badges: [
      { badgeId: 'first_post', earnedAt: '2025-11-15', count: 1 },
      { badgeId: 'photographer', earnedAt: '2026-01-20', count: 1 },
      { badgeId: 'vote_king', earnedAt: '2026-01-05', count: 1 },
      { badgeId: 'communicator', earnedAt: '2026-02-10', count: 1 },
      { badgeId: 'top10', earnedAt: '2026-03-01', count: 1 },
      { badgeId: 'store_sharer', earnedAt: '2026-02-25', count: 1 },
    ],
    badgeProgress: {
      influencer: { current: 89, target: 100 },
      weekly_champion: { current: 0, target: 1 },
      hot_master: { current: 623, target: 1000 },
      early_bird: { current: 5, target: 10 },
      user_of_year: { current: 0, target: 1 },
      hot_maker: { current: 3, target: 10 },
      bookmark_king: { current: 180, target: 500 },
      best_proof: { current: 4, target: 10 },
      pick_master: { current: 1, target: 3 },
      discoverer: { current: 2, target: 5 },
    },
    recentExpHistory: [
      { date: '2026-03-06', action: '인증 게시 (완성도 MAX)', exp: 130 },
      { date: '2026-03-06', action: '🔥 받기 x25', exp: 200 },
      { date: '2026-03-06', action: '저장 당하기 x8', exp: 96 },
      { date: '2026-03-06', action: '배틀 TOP 10', exp: 300 },
      { date: '2026-03-05', action: '에디터픽 선정', exp: 300 },
      { date: '2026-03-05', action: '인증 게시 (기본+보너스)', exp: 95 },
      { date: '2026-03-04', action: '🔥 받기 x30', exp: 240 },
    ],
  },
  // Parfait 유저
  {
    userId: 'user_004',
    nickname: '최파르페',
    profileImage: null,
    level: 28,
    currentExp: 12000,
    totalExp: 186000,
    tier: 'parfait',
    certificationCount: 78,
    fireCount: 1842,
    followerCount: 312,
    consecutiveDays: 45,
    joinDate: '2025-08-01',
    specialCategory: '테크',
    badges: [
      { badgeId: 'first_post', earnedAt: '2025-08-01', count: 1 },
      { badgeId: 'photographer', earnedAt: '2025-10-15', count: 1 },
      { badgeId: 'vote_king', earnedAt: '2025-09-20', count: 1 },
      { badgeId: 'communicator', earnedAt: '2025-11-05', count: 1 },
      { badgeId: 'influencer', earnedAt: '2026-01-15', count: 1 },
      { badgeId: 'weekly_champion', earnedAt: '2026-02-01', count: 3 },
      { badgeId: 'top10', earnedAt: '2025-12-10', count: 1 },
      { badgeId: 'hot_master', earnedAt: '2026-02-20', count: 1 },
      { badgeId: 'store_sharer', earnedAt: '2026-01-10', count: 1 },
      { badgeId: 'bookmark_king', earnedAt: '2026-03-01', count: 1 },
    ],
    badgeProgress: {
      early_bird: { current: 7, target: 10 },
      user_of_year: { current: 0, target: 1 },
      hot_maker: { current: 6, target: 10 },
      best_proof: { current: 7, target: 10 },
      pick_master: { current: 2, target: 3 },
      discoverer: { current: 3, target: 5 },
    },
    recentExpHistory: [
      { date: '2026-03-06', action: '배틀 우승!', exp: 600 },
      { date: '2026-03-06', action: '🔥 받기 x50 (캡)', exp: 400 },
      { date: '2026-03-06', action: '인증 게시 (완성도 MAX)', exp: 130 },
      { date: '2026-03-06', action: 'PICK 한마디 작성', exp: 15 },
      { date: '2026-03-05', action: '에디터픽 선정', exp: 300 },
      { date: '2026-03-05', action: '🔥 받기 x35', exp: 280 },
    ],
  },
  // Signature 유저
  {
    userId: 'user_005',
    nickname: '정시그니처',
    profileImage: null,
    level: 37,
    currentExp: 25000,
    totalExp: 523000,
    tier: 'signature',
    certificationCount: 156,
    fireCount: 4521,
    followerCount: 892,
    consecutiveDays: 120,
    joinDate: '2025-03-01',
    specialCategory: '스니커즈',
    badges: [
      { badgeId: 'first_post', earnedAt: '2025-03-01', count: 1 },
      { badgeId: 'photographer', earnedAt: '2025-05-10', count: 1 },
      { badgeId: 'vote_king', earnedAt: '2025-04-15', count: 1 },
      { badgeId: 'communicator', earnedAt: '2025-06-01', count: 1 },
      { badgeId: 'influencer', earnedAt: '2025-08-20', count: 1 },
      { badgeId: 'weekly_champion', earnedAt: '2025-07-01', count: 7 },
      { badgeId: 'top10', earnedAt: '2025-06-15', count: 1 },
      { badgeId: 'hot_master', earnedAt: '2025-09-10', count: 1 },
      { badgeId: 'early_bird', earnedAt: '2025-10-01', count: 1 },
      { badgeId: 'user_of_year', earnedAt: '2025-12-31', count: 1 },
      { badgeId: 'store_sharer', earnedAt: '2025-07-20', count: 1 },
      { badgeId: 'hot_maker', earnedAt: '2025-11-15', count: 1 },
      { badgeId: 'bookmark_king', earnedAt: '2025-10-20', count: 1 },
      { badgeId: 'best_proof', earnedAt: '2026-01-05', count: 1 },
      { badgeId: 'pick_master', earnedAt: '2026-02-10', count: 1 },
      { badgeId: 'discoverer', earnedAt: '2026-03-01', count: 1 },
    ],
    badgeProgress: {},
    recentExpHistory: [
      { date: '2026-03-06', action: '배틀 우승!', exp: 600 },
      { date: '2026-03-06', action: '🔥 받기 x50 (캡)', exp: 400 },
      { date: '2026-03-06', action: '인증 게시 x2 (완성도 MAX)', exp: 260 },
      { date: '2026-03-06', action: '에디터픽 선정', exp: 300 },
      { date: '2026-03-06', action: '주간 랭킹 TOP 1', exp: 800 },
      { date: '2026-03-05', action: '배틀 TOP 10', exp: 300 },
    ],
  },
]

// ==================== 스트릭 데이터 ====================
export const STREAK_DATA = {
  user_001: { currentStreak: 3, maxStreak: 7, lastPostedDate: '2026-04-14', recoveryTickets: 0 },
  user_002: { currentStreak: 12, maxStreak: 18, lastPostedDate: '2026-04-15', recoveryTickets: 1 },
  user_003: { currentStreak: 28, maxStreak: 42, lastPostedDate: '2026-04-15', recoveryTickets: 2 },
  user_004: { currentStreak: 45, maxStreak: 60, lastPostedDate: '2026-04-15', recoveryTickets: 3 },
  user_005: { currentStreak: 120, maxStreak: 120, lastPostedDate: '2026-04-15', recoveryTickets: 5 },
}

// ==================== 오늘의 미션 (v2: Easy 20 / Normal 50 / Hard 100 / 올클리어 +80) ====================
export const DAILY_MISSIONS = {
  user_001: [
    { missionId: 'm1', title: '🔥 5개 누르기', difficulty: 'EASY', exp: 20, currentCount: 3, targetCount: 5, status: 'IN_PROGRESS' },
    { missionId: 'm2', title: '댓글 2개 작성 (10자+)', difficulty: 'NORMAL', exp: 50, currentCount: 0, targetCount: 2, status: 'IN_PROGRESS' },
    { missionId: 'm3', title: '구매처+가격 포함 인증 1개', difficulty: 'HARD', exp: 100, currentCount: 0, targetCount: 1, status: 'IN_PROGRESS' },
  ],
  user_002: [
    { missionId: 'm1', title: '저장 2개 하기', difficulty: 'EASY', exp: 20, currentCount: 2, targetCount: 2, status: 'COMPLETED' },
    { missionId: 'm2', title: '가중 투표 배틀 3개', difficulty: 'NORMAL', exp: 50, currentCount: 3, targetCount: 3, status: 'CLAIMED' },
    { missionId: 'm3', title: '배틀 제품 등록', difficulty: 'HARD', exp: 100, currentCount: 0, targetCount: 1, status: 'IN_PROGRESS' },
  ],
  user_003: [
    { missionId: 'm1', title: '피드 10개 탐색', difficulty: 'EASY', exp: 20, currentCount: 10, targetCount: 10, status: 'CLAIMED' },
    { missionId: 'm2', title: 'PICK 한마디 1개 작성', difficulty: 'NORMAL', exp: 50, currentCount: 1, targetCount: 1, status: 'CLAIMED' },
    { missionId: 'm3', title: 'BEST 평가 인증 1개', difficulty: 'HARD', exp: 100, currentCount: 0, targetCount: 1, status: 'IN_PROGRESS' },
  ],
  user_004: [
    { missionId: 'm1', title: '🔥 5개 누르기', difficulty: 'EASY', exp: 20, currentCount: 5, targetCount: 5, status: 'CLAIMED' },
    { missionId: 'm2', title: 'PICK 한마디 1개 작성', difficulty: 'NORMAL', exp: 50, currentCount: 1, targetCount: 1, status: 'CLAIMED' },
    { missionId: 'm3', title: '구매처+가격 포함 인증 1개', difficulty: 'HARD', exp: 100, currentCount: 1, targetCount: 1, status: 'COMPLETED' },
    { missionId: 'bonus', title: '올클리어 보너스', difficulty: 'BONUS', exp: 80, currentCount: 3, targetCount: 3, status: 'COMPLETED' },
  ],
  user_005: [
    { missionId: 'm1', title: '저장 2개 하기', difficulty: 'EASY', exp: 20, currentCount: 2, targetCount: 2, status: 'CLAIMED' },
    { missionId: 'm2', title: '가중 투표 배틀 3개', difficulty: 'NORMAL', exp: 50, currentCount: 3, targetCount: 3, status: 'CLAIMED' },
    { missionId: 'm3', title: '배틀 제품 등록', difficulty: 'HARD', exp: 100, currentCount: 1, targetCount: 1, status: 'CLAIMED' },
    { missionId: 'bonus', title: '올클리어 보너스', difficulty: 'BONUS', exp: 80, currentCount: 3, targetCount: 3, status: 'CLAIMED' },
  ],
}

// ==================== 카테고리 숙련도 (v2: 4단계) ====================
// 조건 기준: activity = 인증 수 + 배틀 투표/10 + PICK 한마디/2
export const PROFICIENCY_TIERS = [
  { tier: 'INTERESTED', name: '관심자', color: '#94a3b8', bgColor: '#f1f5f9', icon: '🥉', minActivity: 0, description: '인증 5개 + 배틀 투표 20회' },
  { tier: 'ENTHUSIAST', name: '애호가', color: '#22c55e', bgColor: '#f0fdf4', icon: '🥈', minActivity: 30, description: '인증 30 + 배틀 100 + PICK 한마디 10' },
  { tier: 'CURATOR', name: '큐레이터', color: '#3b82f6', bgColor: '#eff6ff', icon: '🥇', minActivity: 100, description: '인증 70 + 예측 정확도 70%+' },
  { tier: 'EXPERT', name: '전문가', color: '#f59e0b', bgColor: '#fffbeb', icon: '👑', minActivity: 300, description: '인증 150 + 월간 예측왕 3회' },
]

export const CATEGORIES = [
  { categoryId: 'sneakers', name: '스니커즈', emoji: '👟' },
  { categoryId: 'tech', name: '테크', emoji: '💻' },
  { categoryId: 'fashion', name: '패션', emoji: '👔' },
  { categoryId: 'beauty', name: '뷰티', emoji: '💄' },
  { categoryId: 'food', name: '푸드', emoji: '🍔' },
]

export const USER_PROFICIENCY = {
  user_001: [
    { categoryId: 'sneakers', activity: 5 },
    { categoryId: 'fashion', activity: 2 },
  ],
  user_002: [
    { categoryId: 'sneakers', activity: 45 },
    { categoryId: 'tech', activity: 18 },
    { categoryId: 'fashion', activity: 12 },
  ],
  user_003: [
    { categoryId: 'sneakers', activity: 180 },
    { categoryId: 'fashion', activity: 65 },
    { categoryId: 'tech', activity: 22 },
  ],
  user_004: [
    { categoryId: 'tech', activity: 420 },
    { categoryId: 'sneakers', activity: 150 },
    { categoryId: 'beauty', activity: 40 },
  ],
  user_005: [
    { categoryId: 'sneakers', activity: 850 },
    { categoryId: 'fashion', activity: 320 },
    { categoryId: 'tech', activity: 180 },
    { categoryId: 'food', activity: 90 },
  ],
}

export const CATEGORY_TOP_RANKERS = {
  sneakers: [
    { userId: 'user_005', nickname: '정시그니처', activity: 850, rank: 1 },
    { userId: 'user_003', nickname: '이그래놀라', activity: 180, rank: 2 },
    { userId: 'user_004', nickname: '최파르페', activity: 150, rank: 3 },
    { userId: 'user_002', nickname: '박프루티', activity: 45, rank: 4 },
    { userId: 'user_001', nickname: '김플레인', activity: 5, rank: 5 },
  ],
  tech: [
    { userId: 'user_004', nickname: '최파르페', activity: 420, rank: 1 },
    { userId: 'user_005', nickname: '정시그니처', activity: 180, rank: 2 },
    { userId: 'user_003', nickname: '이그래놀라', activity: 22, rank: 3 },
    { userId: 'user_002', nickname: '박프루티', activity: 18, rank: 4 },
  ],
  fashion: [
    { userId: 'user_005', nickname: '정시그니처', activity: 320, rank: 1 },
    { userId: 'user_003', nickname: '이그래놀라', activity: 65, rank: 2 },
    { userId: 'user_002', nickname: '박프루티', activity: 12, rank: 3 },
    { userId: 'user_001', nickname: '김플레인', activity: 2, rank: 4 },
  ],
  beauty: [
    { userId: 'user_004', nickname: '최파르페', activity: 40, rank: 1 },
  ],
  food: [
    { userId: 'user_005', nickname: '정시그니처', activity: 90, rank: 1 },
  ],
}

// ==================== 배틀 예측 히스토리 ====================
export const PREDICTION_SUMMARY = {
  user_001: { hitCount: 2, totalPredictions: 8 },
  user_002: { hitCount: 14, totalPredictions: 28 },
  user_003: { hitCount: 38, totalPredictions: 65 },
  user_004: { hitCount: 72, totalPredictions: 110 },
  user_005: { hitCount: 156, totalPredictions: 220 },
}

function buildPredictionHistory(userId, total, hitRatio) {
  const items = []
  const battles = [
    { title: '나이키 덩크 vs 아디다스 삼바', items: ['덩크', '삼바'] },
    { title: '아이폰 16 vs 갤럭시 S25', items: ['아이폰 16', '갤럭시 S25'] },
    { title: '스투시 후디 vs 슈프림 후디', items: ['스투시', '슈프림'] },
    { title: '에어팟 프로 vs 소니 WF-1000XM5', items: ['에어팟 프로', '소니'] },
    { title: '조던 1 vs 덩크 로우', items: ['조던 1', '덩크 로우'] },
    { title: '룰루레몬 vs 나이키 테크 플리스', items: ['룰루레몬', '테크 플리스'] },
    { title: '티파니 vs 까르띠에', items: ['티파니', '까르띠에'] },
    { title: '아식스 GT-2000 vs 호카 본디', items: ['아식스', '호카'] },
  ]
  for (let i = 0; i < total; i++) {
    const b = battles[i % battles.length]
    const hit = i < Math.round(total * hitRatio)
    const pick = i % 2
    const date = new Date('2026-04-15')
    date.setDate(date.getDate() - i)
    items.push({
      id: `${userId}_p${i}`,
      battleTitle: b.title,
      predictedItem: b.items[pick],
      winnerItem: hit ? b.items[pick] : b.items[1 - pick],
      hit,
      date: date.toISOString().slice(0, 10),
    })
  }
  return items
}

export const PREDICTION_HISTORY = {
  user_001: buildPredictionHistory('user_001', 8, 0.25),
  user_002: buildPredictionHistory('user_002', 28, 0.5),
  user_003: buildPredictionHistory('user_003', 65, 0.58),
  user_004: buildPredictionHistory('user_004', 110, 0.65),
  user_005: buildPredictionHistory('user_005', 220, 0.71),
}

// ==================== 헬퍼 함수 ====================

export function getProficiencyTier(activity) {
  const sorted = [...PROFICIENCY_TIERS].reverse()
  return sorted.find((t) => activity >= t.minActivity) || PROFICIENCY_TIERS[0]
}

export function getNextProficiencyTier(activity) {
  return PROFICIENCY_TIERS.find((t) => t.minActivity > activity) || null
}

export function getCategoryById(categoryId) {
  return CATEGORIES.find((c) => c.categoryId === categoryId)
}

/** 레벨로 등급(tier) 구하기 */
export function getTierByLevel(level) {
  return LEVEL_TIERS.find(
    (t) => level >= t.levelRange[0] && level <= t.levelRange[1]
  )
}

/**
 * 백엔드 UserTier.code (대문자 'PLAIN') → 프론트 LEVEL_TIERS 엔트리.
 * 백엔드가 { code, description, minLevel, maxLevel } 형태의 enum 객체로 직렬화되는 경우 사용.
 * 문자열('PLAIN') 과 객체({code: 'PLAIN'}) 둘 다 허용.
 */
export function getTierByCode(code) {
  if (!code) return null
  const key = (typeof code === 'string' ? code : code.code || '').toLowerCase()
  return LEVEL_TIERS.find((t) => t.tier === key) || null
}

/**
 * 레벨로 rank 컬러 키 반환. YogurtTierArt의 color prop에 사용.
 * 1레벨 단위로 white → blue → violet → red → gold 사이클이 진행되며,
 * 5레벨마다 한 사이클이 완료되어 다시 white로 리셋된다 (티어 시작 기준).
 */
export function getTierColor(level) {
  const RANK = ['white', 'blue', 'violet', 'red', 'gold']
  const tier = getTierByLevel(level)
  if (!tier) return 'white'
  const [min] = tier.levelRange
  const idx = ((level - min) % 5 + 5) % 5
  return RANK[idx]
}

/** 다음 레벨까지 필요한 EXP 구하기 */
export function getNextLevelExp(level) {
  const entry = LEVEL_EXP_TABLE.find((e) => e.level === level + 1)
  return entry ? entry.requiredExp : null
}

/** 현재 레벨 진행도(%) 구하기 */
export function getLevelProgress(level, currentExp) {
  const nextExp = getNextLevelExp(level)
  if (!nextExp) return 100
  return Math.min(Math.round((currentExp / nextExp) * 100), 100)
}

/** 뱃지 ID로 뱃지 정보 가져오기 */
export function getBadgeById(badgeId) {
  const allBadges = [...ALL_BADGES.basic, ...ALL_BADGES.special, ...ALL_BADGES.v2]
  return allBadges.find((b) => b.id === badgeId)
}

/** 유저의 획득 뱃지 정보 (뱃지 상세 + 획득 정보) 합치기 */
export function getUserBadges(user) {
  return user.badges.map((ub) => ({
    ...getBadgeById(ub.badgeId),
    earnedAt: ub.earnedAt,
    count: ub.count,
  }))
}

/** 유저의 미획득 뱃지 리스트 구하기 */
export function getUnearnedBadges(user) {
  const earnedIds = new Set(user.badges.map((b) => b.badgeId))
  const allBadges = [...ALL_BADGES.basic, ...ALL_BADGES.special, ...ALL_BADGES.v2]
  return allBadges
    .filter((b) => !earnedIds.has(b.id))
    .map((b) => ({
      ...b,
      progress: user.badgeProgress[b.id] || null,
    }))
}
