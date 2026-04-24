// AdSense 광고 설정
//
// 사용 흐름:
// 1) AdSense 사이트 승인 받기 (현재 미승인 상태)
// 2) 승인 후 광고 단위 생성 → 발급된 숫자 ID를 AD_SLOTS 각 항목에 입력
// 3) ADS_ENABLED = true 로 변경
//
// 승인 전에는 ADS_ENABLED=false 로 두어 빈 광고 박스/컬럼이 노출되지 않게 함.

export const ADS_ENABLED = false

export const ADSENSE_CLIENT_ID = 'ca-pub-6101308382817399'

export const AD_SLOTS = {
  DASHBOARD_RIGHT: '',
  // 추가 위치 발급 시 여기에 키 추가:
  // PRODUCT_RANKING_INLINE: '',
  // FEED_HOME_INLINE: '',
  // FEED_DETAIL_BOTTOM: '',
  // BATTLE_DETAIL_BOTTOM: '',
}
