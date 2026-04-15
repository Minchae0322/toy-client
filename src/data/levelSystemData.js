/**
 * 5단계 레벨 시스템 & 10종 뱃지 시스템 테스트 데이터
 */

// ==================== 레벨 등급 정의 ====================
export const LEVEL_TIERS = [
  {
    tier: 'newbie',
    name: '뉴비',
    emoji: '🌱',
    levelRange: [1, 5],
    color: '#22c55e',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    description: '탐색의 시기 - 플랫폼을 둘러보며 감을 잡아보세요!',
    requirements: '가입 즉시',
    nextGoal: '레벨 6에 도달해서 레귤러가 되자!',
    features: ['인증 게시물 작성', '🔥 및 👍 반응', '댓글 작성', 'DM 전송', '배틀 투표'],
    restrictions: ['배틀 생성 불가', '제품 등록 불가', '프로필 커스텀 불가'],
  },
  {
    tier: 'regular',
    name: '레귤러',
    emoji: '💪',
    levelRange: [6, 10],
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    description: '정착의 시기 - 본격적으로 커뮤니티 활동을 시작합니다.',
    requirements: '인증 10개 이상 + 총 500 EXP 이상',
    nextGoal: '레벨 11에 도달해서 컬렉터가 되자!',
    features: ['배틀 제품 등록', '배틀 생성 (1개)', '레귤러 뱃지'],
    restrictions: ['프로필 커스텀 불가', '전문 카테고리 불가'],
  },
  {
    tier: 'collector',
    name: '컬렉터',
    emoji: '🎨',
    levelRange: [11, 15],
    color: '#a855f7',
    bgColor: '#faf5ff',
    borderColor: '#e9d5ff',
    description: '전문성의 시기 - 자신의 취향과 전문성을 구축합니다.',
    requirements: '인증 30개 이상 + 총 2,000 EXP 이상',
    nextGoal: '레벨 16에 도달해서 마니아가 되자!',
    features: ['프로필 커스텀', '배틀 3개 동시 생성', '전문 카테고리 선택', '추천 피드 우선 노출'],
    restrictions: ['브랜드 협업 불가', 'VIP 라운지 불가'],
  },
  {
    tier: 'maniac',
    name: '마니아',
    emoji: '🔥',
    levelRange: [16, 20],
    color: '#f97316',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    description: '영향력의 시기 - 커뮤니티를 이끄는 인플루언서입니다.',
    requirements: '인증 50개 이상 + 🔥 1,000개 누적',
    nextGoal: '레벨 21에 도달해서 레전드가 되자!',
    features: ['브랜드 협업 기회', 'VIP 라운지 접근', '배틀 스폰서', '피드 최우선 노출'],
    restrictions: ['공식 앰배서더 불가', '커스텀 뱃지 불가'],
  },
  {
    tier: 'legend',
    name: '레전드',
    emoji: '💎',
    levelRange: [21, 99],
    color: '#06b6d4',
    bgColor: '#ecfeff',
    borderColor: '#a5f3fc',
    description: '리더십의 시기 - 커뮤니티의 문화를 만들고 생태계를 키웁니다.',
    requirements: '인증 100개 이상 + 팔로워 500명 이상',
    nextGoal: '커뮤니티를 발전시키고 새로운 가치를 만들어가세요!',
    features: ['공식 앰배서더', '커스텀 뱃지 제작', '레전드 배틀 배너', '수익 창출', '전용 컬러 닉네임', '오프라인 이벤트 초대'],
    restrictions: [],
  },
]

// ==================== EXP 획득 기준표 ====================
export const EXP_RULES = {
  daily: [
    { action: '인증 게시', exp: 50, icon: '📸', limit: null },
    { action: '🔥 받기', exp: 10, icon: '🔥', limit: null, unit: '개당' },
    { action: '👍 받기', exp: 5, icon: '👍', limit: null, unit: '개당' },
    { action: '댓글 작성', exp: 3, icon: '💬', limit: '하루 50개' },
  ],
  battle: [
    { action: '배틀 투표', exp: 5, icon: '🗳️', limit: '하루 10개' },
    { action: '배틀 제품 등록', exp: 20, icon: '📦', limit: null },
    { action: '배틀 우승', exp: 1000, icon: '🏆', limit: null },
    { action: '배틀 TOP 10', exp: 500, icon: '⭐', limit: null },
  ],
  social: [
    { action: 'DM 10회 소통', exp: 20, icon: '💌', limit: '일일 1회' },
    { action: '일일 출석', exp: 10, icon: '📅', limit: '일일 1회' },
  ],
  special: [
    { action: '에디터픽 선정', exp: 200, icon: '✨', limit: null },
    { action: '첫 인증', exp: 100, icon: '🌟', limit: '최초 1회' },
    { action: '10일 연속 출석', exp: 50, icon: '🎯', limit: null },
  ],
}

// ==================== 레벨별 필요 EXP ====================
export const LEVEL_EXP_TABLE = [
  { level: 1, requiredExp: 0, totalExp: 0 },
  { level: 2, requiredExp: 100, totalExp: 100 },
  { level: 3, requiredExp: 150, totalExp: 250 },
  { level: 4, requiredExp: 200, totalExp: 450 },
  { level: 5, requiredExp: 300, totalExp: 750 },
  { level: 6, requiredExp: 400, totalExp: 1150 },
  { level: 7, requiredExp: 500, totalExp: 1650 },
  { level: 8, requiredExp: 600, totalExp: 2250 },
  { level: 9, requiredExp: 750, totalExp: 3000 },
  { level: 10, requiredExp: 900, totalExp: 3900 },
  { level: 11, requiredExp: 1100, totalExp: 5000 },
  { level: 12, requiredExp: 1300, totalExp: 6300 },
  { level: 13, requiredExp: 1500, totalExp: 7800 },
  { level: 14, requiredExp: 1800, totalExp: 9600 },
  { level: 15, requiredExp: 2200, totalExp: 11800 },
  { level: 16, requiredExp: 2600, totalExp: 14400 },
  { level: 17, requiredExp: 3000, totalExp: 17400 },
  { level: 18, requiredExp: 3500, totalExp: 20900 },
  { level: 19, requiredExp: 4000, totalExp: 24900 },
  { level: 20, requiredExp: 5000, totalExp: 29900 },
  { level: 21, requiredExp: 6000, totalExp: 35900 },
]

// ==================== 뱃지 정의 ====================
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
      description: '배틀 투표 50회 이상 참여 시 지급',
      condition: '배틀 투표 50회',
      effect: '배틀 "활발한 배틀" 표시',
      color: '#6366f1',
    },
    {
      id: 'communicator',
      name: '소통왕',
      emoji: '💬',
      type: 'basic',
      description: '댓글 100개 이상 작성 시 지급 (스팸 제외)',
      condition: '댓글 100개 (5자 이상)',
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
  // 특별 뱃지 (5개)
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
}

// ==================== 테스트 유저 데이터 ====================
export const TEST_USERS = [
  // 뉴비 유저
  {
    userId: 'user_001',
    nickname: '김뉴비',
    profileImage: null,
    level: 3,
    currentExp: 180,
    totalExp: 430,
    tier: 'newbie',
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
    },
    recentExpHistory: [
      { date: '2026-03-06', action: '인증 게시', exp: 50 },
      { date: '2026-03-06', action: '🔥 받기 x5', exp: 50 },
      { date: '2026-03-06', action: '일일 출석', exp: 10 },
      { date: '2026-03-05', action: '인증 게시', exp: 50 },
      { date: '2026-03-05', action: '댓글 작성 x3', exp: 9 },
      { date: '2026-03-04', action: '인증 게시', exp: 50 },
      { date: '2026-03-04', action: '🔥 받기 x8', exp: 80 },
    ],
  },
  // 레귤러 유저
  {
    userId: 'user_002',
    nickname: '박레귤러',
    profileImage: null,
    level: 8,
    currentExp: 420,
    totalExp: 2670,
    tier: 'regular',
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
    },
    recentExpHistory: [
      { date: '2026-03-06', action: '인증 게시', exp: 50 },
      { date: '2026-03-06', action: '🔥 받기 x12', exp: 120 },
      { date: '2026-03-06', action: '배틀 투표 x3', exp: 15 },
      { date: '2026-03-06', action: '일일 출석', exp: 10 },
      { date: '2026-03-05', action: '배틀 제품 등록', exp: 20 },
      { date: '2026-03-05', action: '🔥 받기 x15', exp: 150 },
      { date: '2026-03-05', action: '10일 연속 출석', exp: 50 },
    ],
  },
  // 컬렉터 유저
  {
    userId: 'user_003',
    nickname: '이컬렉터',
    profileImage: null,
    level: 13,
    currentExp: 950,
    totalExp: 8750,
    tier: 'collector',
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
    ],
    badgeProgress: {
      influencer: { current: 89, target: 100 },
      weekly_champion: { current: 0, target: 1 },
      hot_master: { current: 623, target: 1000 },
      early_bird: { current: 5, target: 10 },
      user_of_year: { current: 0, target: 1 },
    },
    recentExpHistory: [
      { date: '2026-03-06', action: '인증 게시', exp: 50 },
      { date: '2026-03-06', action: '🔥 받기 x25', exp: 250 },
      { date: '2026-03-06', action: '배틀 TOP 10', exp: 500 },
      { date: '2026-03-05', action: '에디터픽 선정', exp: 200 },
      { date: '2026-03-05', action: '인증 게시', exp: 50 },
      { date: '2026-03-04', action: '🔥 받기 x30', exp: 300 },
    ],
  },
  // 마니아 유저
  {
    userId: 'user_004',
    nickname: '최마니아',
    profileImage: null,
    level: 18,
    currentExp: 2800,
    totalExp: 23700,
    tier: 'maniac',
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
    ],
    badgeProgress: {
      early_bird: { current: 7, target: 10 },
      user_of_year: { current: 0, target: 1 },
    },
    recentExpHistory: [
      { date: '2026-03-06', action: '배틀 우승!', exp: 1000 },
      { date: '2026-03-06', action: '🔥 받기 x40', exp: 400 },
      { date: '2026-03-06', action: '인증 게시', exp: 50 },
      { date: '2026-03-05', action: '에디터픽 선정', exp: 200 },
      { date: '2026-03-05', action: '🔥 받기 x35', exp: 350 },
    ],
  },
  // 레전드 유저
  {
    userId: 'user_005',
    nickname: '정레전드',
    profileImage: null,
    level: 23,
    currentExp: 4200,
    totalExp: 52100,
    tier: 'legend',
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
    ],
    badgeProgress: {},
    recentExpHistory: [
      { date: '2026-03-06', action: '배틀 우승!', exp: 1000 },
      { date: '2026-03-06', action: '🔥 받기 x55', exp: 550 },
      { date: '2026-03-06', action: '인증 게시 x2', exp: 100 },
      { date: '2026-03-06', action: '에디터픽 선정', exp: 200 },
      { date: '2026-03-05', action: '배틀 TOP 10', exp: 500 },
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

// ==================== 오늘의 미션 ====================
export const DAILY_MISSIONS = {
  user_001: [
    { missionId: 'm1', title: '인증 1개 올리기', difficulty: 'EASY', exp: 50, currentCount: 0, targetCount: 1, status: 'IN_PROGRESS' },
    { missionId: 'm2', title: '배틀 3개 투표', difficulty: 'EASY', exp: 30, currentCount: 2, targetCount: 3, status: 'IN_PROGRESS' },
    { missionId: 'm3', title: '댓글 5개 작성', difficulty: 'NORMAL', exp: 50, currentCount: 0, targetCount: 5, status: 'IN_PROGRESS' },
  ],
  user_002: [
    { missionId: 'm1', title: '인증 2개 올리기', difficulty: 'EASY', exp: 50, currentCount: 2, targetCount: 2, status: 'COMPLETED' },
    { missionId: 'm2', title: '배틀 5개 투표', difficulty: 'NORMAL', exp: 50, currentCount: 5, targetCount: 5, status: 'CLAIMED' },
    { missionId: 'm3', title: '🔥 20개 받기', difficulty: 'HARD', exp: 150, currentCount: 12, targetCount: 20, status: 'IN_PROGRESS' },
  ],
  user_003: [
    { missionId: 'm1', title: '인증 3개 올리기', difficulty: 'NORMAL', exp: 80, currentCount: 3, targetCount: 3, status: 'COMPLETED' },
    { missionId: 'm2', title: '배틀 10개 투표', difficulty: 'NORMAL', exp: 60, currentCount: 10, targetCount: 10, status: 'CLAIMED' },
    { missionId: 'm3', title: '🔥 30개 받기', difficulty: 'HARD', exp: 200, currentCount: 25, targetCount: 30, status: 'IN_PROGRESS' },
  ],
  user_004: [
    { missionId: 'm1', title: '배틀 제품 등록', difficulty: 'NORMAL', exp: 100, currentCount: 1, targetCount: 1, status: 'CLAIMED' },
    { missionId: 'm2', title: '🔥 50개 받기', difficulty: 'HARD', exp: 250, currentCount: 42, targetCount: 50, status: 'IN_PROGRESS' },
    { missionId: 'm3', title: '신상 최초 인증', difficulty: 'HARD', exp: 300, currentCount: 0, targetCount: 1, status: 'IN_PROGRESS' },
  ],
  user_005: [
    { missionId: 'm1', title: '인증 5개 올리기', difficulty: 'HARD', exp: 200, currentCount: 5, targetCount: 5, status: 'COMPLETED' },
    { missionId: 'm2', title: '팔로워 10명 늘리기', difficulty: 'HARD', exp: 300, currentCount: 7, targetCount: 10, status: 'IN_PROGRESS' },
    { missionId: 'm3', title: '배틀 우승', difficulty: 'HARD', exp: 1000, currentCount: 1, targetCount: 1, status: 'CLAIMED' },
  ],
}

// ==================== 카테고리 숙련도 ====================
export const PROFICIENCY_TIERS = [
  { tier: 'BEGINNER', name: '비기너', color: '#94a3b8', bgColor: '#f1f5f9', icon: '🥉', minActivity: 0 },
  { tier: 'INTERMEDIATE', name: '인터미디엇', color: '#22c55e', bgColor: '#f0fdf4', icon: '🥈', minActivity: 30 },
  { tier: 'ADVANCED', name: '어드밴스드', color: '#3b82f6', bgColor: '#eff6ff', icon: '🥇', minActivity: 100 },
  { tier: 'EXPERT', name: '엑스퍼트', color: '#a855f7', bgColor: '#faf5ff', icon: '💠', minActivity: 300 },
  { tier: 'MASTER', name: '마스터', color: '#f59e0b', bgColor: '#fffbeb', icon: '👑', minActivity: 700 },
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
    { userId: 'user_005', nickname: '정레전드', activity: 850, rank: 1 },
    { userId: 'user_003', nickname: '이컬렉터', activity: 180, rank: 2 },
    { userId: 'user_004', nickname: '최마니아', activity: 150, rank: 3 },
    { userId: 'user_002', nickname: '박레귤러', activity: 45, rank: 4 },
    { userId: 'user_001', nickname: '김뉴비', activity: 5, rank: 5 },
  ],
  tech: [
    { userId: 'user_004', nickname: '최마니아', activity: 420, rank: 1 },
    { userId: 'user_005', nickname: '정레전드', activity: 180, rank: 2 },
    { userId: 'user_003', nickname: '이컬렉터', activity: 22, rank: 3 },
    { userId: 'user_002', nickname: '박레귤러', activity: 18, rank: 4 },
  ],
  fashion: [
    { userId: 'user_005', nickname: '정레전드', activity: 320, rank: 1 },
    { userId: 'user_003', nickname: '이컬렉터', activity: 65, rank: 2 },
    { userId: 'user_002', nickname: '박레귤러', activity: 12, rank: 3 },
    { userId: 'user_001', nickname: '김뉴비', activity: 2, rank: 4 },
  ],
  beauty: [
    { userId: 'user_004', nickname: '최마니아', activity: 40, rank: 1 },
  ],
  food: [
    { userId: 'user_005', nickname: '정레전드', activity: 90, rank: 1 },
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
  const allBadges = [...ALL_BADGES.basic, ...ALL_BADGES.special]
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
  const allBadges = [...ALL_BADGES.basic, ...ALL_BADGES.special]
  return allBadges
    .filter((b) => !earnedIds.has(b.id))
    .map((b) => ({
      ...b,
      progress: user.badgeProgress[b.id] || null,
    }))
}
