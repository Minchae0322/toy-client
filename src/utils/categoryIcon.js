/**
 * 카테고리 이름에서 키워드를 매칭하여 이모지를 반환.
 * 백엔드에 별도 아이콘 필드 없을 때 자동 매핑 헬퍼.
 *
 * 매칭 우선순위 = 배열 순서 (구체적인 키워드 먼저).
 * 매칭 실패 시 카테고리 도메인별 기본 이모지 반환.
 */

const RULES = [
  // 음식·식 — 피드 영역 핵심
  { match: ['편의점'], emoji: '🏪' },
  { match: ['카페', '디저트', '커피'], emoji: '☕' },
  { match: ['배달', '맛집'], emoji: '🍽️' },
  { match: ['홈메이드', '집밥', '요리'], emoji: '🍳' },
  { match: ['야식', '술안주', '술', '주류'], emoji: '🍻' },
  { match: ['다이어트', '헬시', '건강식'], emoji: '🥗' },
  { match: ['디저트', '간식', '빵', '베이커리'], emoji: '🧁' },
  { match: ['핫먹거리', '먹거리', '음식', '푸드', '식품'], emoji: '🍱' },
  { match: ['음료'], emoji: '🥤' },

  // 패션
  { match: ['상의', '티셔츠'], emoji: '👕' },
  { match: ['하의', '바지'], emoji: '👖' },
  { match: ['아우터', '코트', '자켓'], emoji: '🧥' },
  { match: ['원피스', '드레스', '스커트'], emoji: '👗' },
  { match: ['언더웨어', '잠옷'], emoji: '🩲' },
  { match: ['스트릿', '캐주얼'], emoji: '👚' },
  { match: ['럭셔리', '명품'], emoji: '💎' },
  { match: ['빈티지', '리셀'], emoji: '👜' },
  { match: ['정장', '포멀'], emoji: '👔' },
  { match: ['패션', '의류', '옷'], emoji: '👕' },

  // 신발
  { match: ['스니커즈', '운동화'], emoji: '👟' },
  { match: ['구두', '로퍼'], emoji: '👞' },
  { match: ['샌들', '슬리퍼'], emoji: '🩴' },
  { match: ['부츠'], emoji: '🥾' },
  { match: ['신발'], emoji: '👟' },

  // 가방·잡화
  { match: ['백팩'], emoji: '🎒' },
  { match: ['크로스백', '숄더백', '가방'], emoji: '👜' },
  { match: ['지갑', '카드지갑'], emoji: '👛' },
  { match: ['캐리어', '여행가방'], emoji: '🧳' },
  { match: ['모자'], emoji: '🧢' },
  { match: ['선글라스', '안경'], emoji: '🕶️' },
  { match: ['액세서리', '악세사리', '잡화'], emoji: '🎀' },

  // 뷰티
  { match: ['스킨케어', '바디케어'], emoji: '🧴' },
  { match: ['메이크업', '화장'], emoji: '💄' },
  { match: ['헤어', '샴푸'], emoji: '💇' },
  { match: ['향수', '디퓨저'], emoji: '🌸' },
  { match: ['네일'], emoji: '💅' },
  { match: ['그루밍'], emoji: '🪒' },
  { match: ['뷰티'], emoji: '💄' },

  // 디지털·가전
  { match: ['스마트폰', '폰'], emoji: '📱' },
  { match: ['노트북', 'PC', '컴퓨터'], emoji: '💻' },
  { match: ['태블릿'], emoji: '📱' },
  { match: ['모니터', '디스플레이'], emoji: '🖥️' },
  { match: ['이어폰', '헤드폰'], emoji: '🎧' },
  { match: ['스피커', '음향'], emoji: '🔊' },
  { match: ['카메라'], emoji: '📷' },
  { match: ['TV', '프로젝터'], emoji: '📺' },
  { match: ['키보드', '마우스'], emoji: '⌨️' },
  { match: ['스마트워치', '웨어러블'], emoji: '⌚' },
  { match: ['AI'], emoji: '🤖' },
  { match: ['생활가전', '주방가전', '가전'], emoji: '🔌' },
  { match: ['디지털'], emoji: '💻' },

  // 가구·인테리어
  { match: ['가구'], emoji: '🛋️' },
  { match: ['침구', '매트리스'], emoji: '🛏️' },
  { match: ['조명'], emoji: '💡' },
  { match: ['홈데코', '소품'], emoji: '🪴' },
  { match: ['DIY', '셀프인테리어'], emoji: '🔧' },
  { match: ['수납', '정리'], emoji: '📦' },
  { match: ['인테리어'], emoji: '🛋️' },

  // 생활용품
  { match: ['주방용품'], emoji: '🍳' },
  { match: ['욕실', '위생'], emoji: '🚿' },
  { match: ['세제', '세정'], emoji: '🧼' },
  { match: ['문구', '오피스'], emoji: '✏️' },
  { match: ['생활'], emoji: '🧺' },

  // 스포츠·레저
  { match: ['헬스', '요가', '피트니스'], emoji: '🧘' },
  { match: ['골프'], emoji: '⛳' },
  { match: ['등산', '아웃도어'], emoji: '🥾' },
  { match: ['캠핑'], emoji: '🏕️' },
  { match: ['자전거'], emoji: '🚴' },
  { match: ['수상', '수영'], emoji: '🏊' },
  { match: ['축구', '농구', '야구', '구기'], emoji: '⚽' },
  { match: ['스키', '보드'], emoji: '🎿' },
  { match: ['스포츠웨어'], emoji: '🎽' },
  { match: ['스포츠', '레저'], emoji: '⚽' },

  // 자동차·모빌리티
  { match: ['신차', '전기차'], emoji: '🚗' },
  { match: ['차량용품', '튜닝'], emoji: '🔧' },
  { match: ['오토바이'], emoji: '🏍️' },
  { match: ['킥보드', '모빌리티'], emoji: '🛴' },
  { match: ['자동차'], emoji: '🚗' },

  // 도서·웹툰
  { match: ['웹툰', '만화'], emoji: '📖' },
  { match: ['웹소설', '소설'], emoji: '📚' },
  { match: ['에세이', '자기계발'], emoji: '📝' },
  { match: ['IT', '과학'], emoji: '💡' },
  { match: ['eBook', '오디오북'], emoji: '🎧' },
  { match: ['도서', '책'], emoji: '📚' },

  // 완구·취미
  { match: ['프라모델', '피규어'], emoji: '🧸' },
  { match: ['보드게임', '퍼즐'], emoji: '🧩' },
  { match: ['레고', '블록'], emoji: '🧱' },
  { match: ['악기'], emoji: '🎸' },
  { match: ['미술', '공예'], emoji: '🎨' },
  { match: ['드론', 'RC'], emoji: '🚁' },
  { match: ['카드', '트레이딩'], emoji: '🃏' },
  { match: ['취미'], emoji: '🎨' },

  // 반려동물
  { match: ['강아지', '개'], emoji: '🐶' },
  { match: ['고양이'], emoji: '🐱' },
  { match: ['소동물', '어류'], emoji: '🐹' },
  { match: ['반려'], emoji: '🐾' },

  // 건강·헬스
  { match: ['영양제', '비타민'], emoji: '💊' },
  { match: ['다이어트'], emoji: '🥗' },
  { match: ['건강기기', '안마', '마사지'], emoji: '💆' },
  { match: ['건강', '헬스'], emoji: '❤️‍🩹' },

  // 유아동
  { match: ['유아동', '유아', '아기'], emoji: '👶' },
  { match: ['장난감', '교구'], emoji: '🧸' },
  { match: ['출산', '임부'], emoji: '🤱' },

  // 주얼리·시계
  { match: ['반지', '귀걸이'], emoji: '💍' },
  { match: ['목걸이', '팔찌'], emoji: '📿' },
  { match: ['시계'], emoji: '⌚' },
  { match: ['커플링', '웨딩'], emoji: '💞' },
  { match: ['주얼리'], emoji: '💎' },

  // 게임·앱
  { match: ['FPS', '슈터'], emoji: '🔫' },
  { match: ['MOBA', 'AOS'], emoji: '⚔️' },
  { match: ['전략', '시뮬레이션'], emoji: '♟️' },
  { match: ['RPG', 'MMORPG'], emoji: '🐉' },
  { match: ['배틀로얄', '서바이벌'], emoji: '🏝️' },
  { match: ['레이싱'], emoji: '🏎️' },
  { match: ['리듬', '캐주얼'], emoji: '🎵' },
  { match: ['인디', '로그라이크'], emoji: '🎮' },
  { match: ['오픈월드', '어드벤처'], emoji: '🗺️' },
  { match: ['게임기'], emoji: '🕹️' },
  { match: ['e스포츠'], emoji: '🏆' },
  { match: ['게임굿즈', '스킨'], emoji: '🎁' },
  { match: ['게임'], emoji: '🎮' },

  // 영화·드라마·음악
  { match: ['한국영화', '해외영화', '영화'], emoji: '🎬' },
  { match: ['드라마', '시리즈'], emoji: '📺' },
  { match: ['예능', '리얼리티'], emoji: '🎤' },
  { match: ['OTT', '스트리밍'], emoji: '🎞️' },
  { match: ['애니메이션', '애니'], emoji: '🌸' },
  { match: ['K-POP'], emoji: '🎤' },
  { match: ['콘서트', '페스티벌'], emoji: '🎉' },
  { match: ['뮤지컬', '연극'], emoji: '🎭' },
  { match: ['전시', '아트'], emoji: '🖼️' },
  { match: ['음악', '공연'], emoji: '🎵' },
  { match: ['유튜브'], emoji: '📺' },
  { match: ['틱톡', '릴스', '숏츠', '숏폼'], emoji: '📱' },
  { match: ['트위치', '치지직', '방송'], emoji: '🎙️' },
  { match: ['팟캐스트'], emoji: '🎙️' },

  // 교육·금융·여행
  { match: ['온라인강의', '강의'], emoji: '🎓' },
  { match: ['어학', '외국어'], emoji: '🗣️' },
  { match: ['코딩'], emoji: '💻' },
  { match: ['자격증', '취업'], emoji: '📜' },
  { match: ['독서', '글쓰기'], emoji: '✍️' },
  { match: ['교육', '자기계발'], emoji: '🎓' },
  { match: ['주식', 'ETF'], emoji: '📈' },
  { match: ['코인', '가상자산'], emoji: '🪙' },
  { match: ['부동산'], emoji: '🏠' },
  { match: ['저축', '보험'], emoji: '💰' },
  { match: ['카드', '포인트'], emoji: '💳' },
  { match: ['금융', '재테크'], emoji: '💹' },
  { match: ['국내여행', '해외여행'], emoji: '✈️' },
  { match: ['항공'], emoji: '✈️' },
  { match: ['숙박', '호텔'], emoji: '🏨' },
  { match: ['액티비티', '투어'], emoji: '🎒' },
  { match: ['여행'], emoji: '🌍' },

  // 덕질·팬덤
  { match: ['아이돌'], emoji: '🌟' },
  { match: ['굿즈', '포카'], emoji: '🎁' },
  { match: ['코스프레'], emoji: '👘' },
  { match: ['팬아트', '2차창작'], emoji: '🖌️' },
  { match: ['덕질', '팬덤'], emoji: '💖' },
]

// 기본 이모지 (도메인별)
const DEFAULTS = {
  FEED: '📷',
  PRODUCT: '🛍️',
  BATTLE: '⚡',
}

/**
 * @param {string} categoryName - 카테고리명
 * @param {object} [options]
 * @param {string} [options.fallbackType] - 매칭 실패 시 사용할 기본값 (FEED|PRODUCT|BATTLE)
 * @returns {string} 이모지
 */
export function getCategoryEmoji(categoryName, { fallbackType = 'PRODUCT' } = {}) {
  if (!categoryName) return DEFAULTS[fallbackType] || DEFAULTS.PRODUCT

  for (const rule of RULES) {
    if (rule.match.some(kw => categoryName.includes(kw))) {
      return rule.emoji
    }
  }

  return DEFAULTS[fallbackType] || DEFAULTS.PRODUCT
}

export default getCategoryEmoji
