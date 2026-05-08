// iOS Capacitor에서 YouTube 인라인 재생 보장. origin/도메인은 건드리지 않음
// (origin 미스매치로 "구성 오류" 발생 가능)
export function normalizeYoutubeEmbedUrl(url) {
  if (!url) return url
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      if (u.hostname === 'youtube.com') u.hostname = 'www.youtube.com'
      u.searchParams.set('playsinline', '1')
      u.searchParams.set('rel', '0')
      return u.toString()
    }
    return url
  } catch {
    return url
  }
}
