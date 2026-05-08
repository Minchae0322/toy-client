// Capacitor 앱의 capacitor:// origin은 일부 YouTube 영상에서 "비디오 사용 불가"가 뜸.
// youtube-nocookie 도메인 + playsinline + origin 명시로 우회.
export function normalizeYoutubeEmbedUrl(url) {
  if (!url) return url
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtube-nocookie.com')) {
      u.hostname = 'www.youtube-nocookie.com'
      u.searchParams.set('playsinline', '1')
      u.searchParams.set('rel', '0')
      if (!u.searchParams.has('origin')) {
        u.searchParams.set('origin', 'https://yogurtte.com')
      }
      return u.toString()
    }
    return url
  } catch {
    return url
  }
}
