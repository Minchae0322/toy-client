/**
 * 컬렉션 페이지 아이콘 매핑
 * 이모지 대신 Lucide SVG 컴포넌트를 사용해 엔터프라이즈 톤 유지.
 */
import {
  // tiers
  Sprout,
  Zap,
  Palette,
  Rocket,
  Gem,
  // badges
  Star,
  Camera,
  Vote,
  MessageCircle,
  Users,
  Trophy,
  Award,
  Flame,
  Target,
  Crown,
  // proficiency
  Circle,
  Medal,
  ChevronsUp,
  Diamond,
  // ui chrome
  Gift,
  Ticket,
  Sparkles,
  Pin,
  AlertCircle,
  CheckCircle2,
} from 'lucide-vue-next'

const TIER_ICON_MAP = {
  newbie: Sprout,
  regular: Zap,
  collector: Palette,
  maniac: Rocket,
  legend: Gem,
}

const BADGE_ICON_MAP = {
  first_post: Star,
  photographer: Camera,
  vote_king: Vote,
  communicator: MessageCircle,
  influencer: Users,
  weekly_champion: Trophy,
  top10: Award,
  hot_master: Flame,
  early_bird: Target,
  user_of_year: Crown,
}

const PROFICIENCY_ICON_MAP = {
  BEGINNER: Circle,
  INTERMEDIATE: Medal,
  ADVANCED: ChevronsUp,
  EXPERT: Diamond,
  MASTER: Crown,
}

export function getTierIcon(tierKey) {
  return TIER_ICON_MAP[tierKey] || Sprout
}

export function getBadgeIcon(badgeId) {
  return BADGE_ICON_MAP[badgeId] || Star
}

export function getProficiencyIcon(tierKey) {
  return PROFICIENCY_ICON_MAP[tierKey] || Circle
}

export {
  Gift,
  Ticket,
  Flame,
  Sparkles,
  Pin,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Target,
  Award,
}
