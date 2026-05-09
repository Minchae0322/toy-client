export const DEFAULT_AVATAR_URL = '/default-avatar.svg'

export const resolveProfileImage = (...candidates) => {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c
  }
  return DEFAULT_AVATAR_URL
}

export const onAvatarError = (event) => {
  if (event?.target && event.target.src !== window.location.origin + DEFAULT_AVATAR_URL) {
    event.target.src = DEFAULT_AVATAR_URL
  }
}
