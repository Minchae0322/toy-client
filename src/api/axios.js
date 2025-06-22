import axios from 'axios'

/**
 * // 로그인 (Auth 서버에서 토큰 발급)
 * const loginResponse = await authService.login({
 *   email: 'user@example.com',
 *   password: 'password123'
 * })
 *
 * // 토큰 자동 저장
 * tokenUtils.setTokens(
 *   loginResponse.data.accessToken,
 *   loginResponse.data.refreshToken
 * )
 *
 * // 컨텐츠 조회 (토큰 자동 첨부 + 갱신)
 * const foods = await contentService.getOneMouths()
 *
 * // 사용자 프로필 조회 (토큰 자동 갱신 처리)
 * const profile = await userService.getProfile()
 * @type {any|string}
 */

// 환경변수에서 각 서비스의 BASE_URL 가져오기
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:8081'
const CONTENT_BASE_URL = import.meta.env.VITE_CONTENT_BASE_URL || 'http://localhost:8082'
const USER_BASE_URL = import.meta.env.VITE_USER_BASE_URL || 'http://localhost:8083'
const CHAT_BASE_URL = import.meta.env.VITE_CHAT_BASE_URL || 'http://localhost:8084'

// 공통 설정
const commonConfig = {
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
}

// 각 서비스별 axios 인스턴스 생성
const authApi = axios.create({
    baseURL: `${AUTH_BASE_URL}/api`,
    ...commonConfig
})

const contentApi = axios.create({
    baseURL: `${CONTENT_BASE_URL}/api`,
    ...commonConfig
})

const userApi = axios.create({
    baseURL: `${USER_BASE_URL}/api`,
    ...commonConfig
})

const chatApi = axios.create({
    baseURL: `${CHAT_BASE_URL}/api`,
    ...commonConfig
})

// 인증이 필요한 서비스들 (auth 제외)
const protectedApis = [contentApi, userApi, chatApi]

// 토큰 갱신 함수 (auth 서버에서만)
const refreshToken = async () => {
    try {
        const refreshTokenValue = localStorage.getItem('refresh_token')
        if (!refreshTokenValue) {
            throw new Error('No refresh token available')
        }

        const response = await axios.post(`${AUTH_BASE_URL}/api/auth/refresh`, {
            refreshToken: refreshTokenValue
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data

        // 새 토큰들 저장
        localStorage.setItem('access_token', accessToken)
        if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken)
        }

        return accessToken
    } catch (error) {
        console.error('토큰 갱신 실패:', error)
        throw error
    }
}

// 로그아웃 처리 함수
const handleLogout = () => {
    // 모든 토큰 제거
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    // storage 이벤트 발생시켜서 App.vue에서 감지하도록
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'access_token',
        newValue: null
    }))

    // 로그인 페이지로 리다이렉트
    window.location.href = '/login'
}

// Auth API 인터셉터 (토큰 발급만 담당)
authApi.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token')
    if (token && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

authApi.interceptors.response.use(
    res => res,
    async err => {
        if (err.response?.status === 401) {
            handleLogout()
        }
        return Promise.reject(err)
    }
)

// 보호된 API들 인터셉터 (토큰 검증 및 자동 갱신)
const addProtectedApiInterceptor = (apiInstance) => {
    // Request interceptor - access_token 자동 추가
    apiInstance.interceptors.request.use(config => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })

    // Response interceptor - 401 시 토큰 갱신 시도
    apiInstance.interceptors.response.use(
        res => res,
        async err => {
            const originalRequest = err.config

            if (
                err.response?.status === 401 &&
                !originalRequest._retry &&
                localStorage.getItem('refresh_token')
            ) {
                originalRequest._retry = true

                try {
                    // auth 서버에서 토큰 갱신
                    const newToken = await refreshToken()

                    // 갱신된 토큰으로 원래 요청 재시도
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    return apiInstance(originalRequest)
                } catch (refreshError) {
                    console.error('토큰 갱신 실패:', refreshError)
                    handleLogout()
                }
            }

            return Promise.reject(err)
        }
    )
}

// 보호된 API들에 인터셉터 적용
protectedApis.forEach(api => addProtectedApiInterceptor(api))

// 개발/디버깅용 요청/응답 로깅 (개발환경에서만)
if (import.meta.env.DEV) {
    const addLoggingInterceptor = (apiInstance, serviceName) => {
        apiInstance.interceptors.request.use(config => {
            console.log(`📤 [${serviceName}] Request:`, config.method?.toUpperCase(), config.url)
            return config
        })

        apiInstance.interceptors.response.use(
            res => {
                console.log(`📥 [${serviceName}] Response:`, res.status, res.config.url)
                return res
            },
            err => {
                console.error(`❌ [${serviceName}] Error:`, err.response?.status, err.config?.url)
                return Promise.reject(err)
            }
        )
    }

    addLoggingInterceptor(authApi, 'AUTH')
    addLoggingInterceptor(contentApi, 'CONTENT')
    addLoggingInterceptor(userApi, 'USER')
    addLoggingInterceptor(chatApi, 'CHAT')
}

// 서비스별 API 함수들
export const authService = {
    // 토큰 발급 관련 (auth 서버만)
    login: (credentials) => authApi.post('/auth/login', credentials),
    register: (userData) => authApi.post('/auth/register', userData),
    logout: () => authApi.post('/auth/logout'),
    refresh: () => refreshToken(), // 직접 함수 호출

    // 인증 확인
    verifyToken: () => authApi.get('/auth/verify'),

    // 비밀번호 관련
    forgotPassword: (email) => authApi.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => authApi.post('/auth/reset-password', { token, password })
}

export const contentService = {
    // 한입거리 관련 API (토큰 검증만)
    getOneMouths: (params) => contentApi.get('/one-mouths', { params }),
    getOneMouthDetail: (id) => contentApi.get(`/one-mouths/${id}`),
    createOneMouth: (data) => contentApi.post('/one-mouths', data),
    updateOneMouth: (id, data) => contentApi.put(`/one-mouths/${id}`, data),
    deleteOneMouth: (id) => contentApi.delete(`/one-mouths/${id}`),

    // 밈/짤 관련 API
    getMemes: (params) => contentApi.get('/memes', { params }),
    getMemeDetail: (id) => contentApi.get(`/memes/${id}`),
    createMeme: (data) => contentApi.post('/memes', data),
    updateMeme: (id, data) => contentApi.put(`/memes/${id}`, data),
    deleteMeme: (id) => contentApi.delete(`/memes/${id}`),

    // 카테고리 API
    getCategories: (params) => contentApi.get('/categories', { params }),
    getCategoryStats: () => contentApi.get('/categories/stats'),

    // 좋아요/북마크
    likeContent: (contentId, type) => contentApi.post(`/${type}/${contentId}/like`),
    unlikeContent: (contentId, type) => contentApi.delete(`/${type}/${contentId}/like`),
    bookmarkContent: (contentId, type) => contentApi.post(`/${type}/${contentId}/bookmark`)
}

export const userService = {
    // 사용자 프로필 (토큰 검증만)
    getProfile: () => userApi.get('/users/profile'),
    updateProfile: (data) => userApi.put('/users/profile', data),
    deleteAccount: () => userApi.delete('/users/profile'),

    // 사용자 활동
    getUserPosts: (userId, params) => userApi.get(`/users/${userId}/posts`, { params }),
    getUserLikes: (userId, params) => userApi.get(`/users/${userId}/likes`, { params }),
    getUserBookmarks: (params) => userApi.get('/users/bookmarks', { params }),

    // 팔로우 시스템
    followUser: (userId) => userApi.post(`/users/${userId}/follow`),
    unfollowUser: (userId) => userApi.delete(`/users/${userId}/follow`),
    getFollowers: (userId, params) => userApi.get(`/users/${userId}/followers`, { params }),
    getFollowing: (userId, params) => userApi.get(`/users/${userId}/following`, { params }),

    // 알림 설정
    getNotificationSettings: () => userApi.get('/users/notification-settings'),
    updateNotificationSettings: (settings) => userApi.put('/users/notification-settings', settings)
}

export const chatService = {
    // 채팅 관련 API (토큰 검증만)
    getChatRooms: (params) => chatApi.get('/chat/rooms', { params }),
    getChatRoom: (roomId) => chatApi.get(`/chat/rooms/${roomId}`),
    createChatRoom: (data) => chatApi.post('/chat/rooms', data),
    leaveChatRoom: (roomId) => chatApi.delete(`/chat/rooms/${roomId}/leave`),

    // 메시지 관련
    getChatMessages: (roomId, params) => chatApi.get(`/chat/rooms/${roomId}/messages`, { params }),
    sendMessage: (roomId, message) => chatApi.post(`/chat/rooms/${roomId}/messages`, message),
    deleteMessage: (roomId, messageId) => chatApi.delete(`/chat/rooms/${roomId}/messages/${messageId}`),

    // 읽음 처리
    markAsRead: (roomId) => chatApi.post(`/chat/rooms/${roomId}/read`),
    getUnreadCount: () => chatApi.get('/chat/unread-count')
}

// 토큰 관련 유틸리티 함수들
export const tokenUtils = {
    getAccessToken: () => localStorage.getItem('access_token'),
    getRefreshToken: () => localStorage.getItem('refresh_token'),
    setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken)
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken)
        }
    },
    clearTokens: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
    },
    isLoggedIn: () => !!localStorage.getItem('access_token')
}

// 기본 export (기존 코드 호환성을 위해)
export default authApi

// 모든 API 인스턴스들 export
export { authApi, contentApi, userApi, chatApi }