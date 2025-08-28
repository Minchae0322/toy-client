import axios from 'axios'

/**
 * 마이크로서비스 API 통합 관리 시스템
 */

// ==================== 환경 설정 ====================
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

// ==================== AXIOS 인스턴스 생성 ====================
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

// ==================== 토큰 관리 함수들 ====================

/**
 * 토큰 갱신 함수 (auth 서버에서만 처리)
 */
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

/**
 * 로그아웃 처리 함수
 */
const handleLogout = () => {
    // 모든 토큰 제거
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    // 추가적인 사용자 데이터 제거
    localStorage.removeItem('user_profile')
    localStorage.removeItem('user_preferences')

    // storage 이벤트 발생시켜서 App.vue에서 감지하도록
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'access_token',
        newValue: null
    }))

    // 로그인 페이지로 리다이렉트
    window.location.href = '/login'
}

/**
 * 토큰 만료 체크 함수
 */
const isTokenExpired = (token) => {
    if (!token) return true

    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const currentTime = Date.now() / 1000
        return payload.exp < currentTime
    } catch (error) {
        return true
    }
}

// ==================== 인터셉터 설정 ====================

/**
 * Auth API 인터셉터 (토큰 발급만 담당)
 */
authApi.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token')

    // 로그인/회원가입 요청이 아닌 경우에만 토큰 첨부
    if (token && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
}, error => {
    return Promise.reject(error)
})

authApi.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            handleLogout()
        }
        return Promise.reject(error)
    }
)

/**
 * 보호된 API들 인터셉터 (토큰 검증 및 자동 갱신)
 */
const addProtectedApiInterceptor = (apiInstance) => {
    // Request interceptor - access_token 자동 추가
    apiInstance.interceptors.request.use(config => {
        const token = localStorage.getItem('access_token')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    }, error => {
        return Promise.reject(error)
    })

    // Response interceptor - 401 시 토큰 갱신 시도
    apiInstance.interceptors.response.use(
        response => response,
        async error => {
            const originalRequest = error.config

            if (
                error.response?.status === 401 &&
                !originalRequest._retry &&
                localStorage.getItem('refresh_token')
            ) {
                originalRequest._retry = true

                try {
                    console.log('토큰 만료 감지, 갱신 시도 중...')

                    // auth 서버에서 토큰 갱신
                    const newToken = await refreshToken()

                    console.log('토큰 갱신 성공')

                    // 갱신된 토큰으로 원래 요청 재시도
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    return apiInstance(originalRequest)
                } catch (refreshError) {
                    console.error('토큰 갱신 실패:', refreshError)
                    handleLogout()
                }
            }

            return Promise.reject(error)
        }
    )
}

// 보호된 API들에 인터셉터 적용
protectedApis.forEach(api => addProtectedApiInterceptor(api))

// ==================== 개발 환경 로깅 ====================
if (import.meta.env.DEV) {
    const addLoggingInterceptor = (apiInstance, serviceName) => {
        apiInstance.interceptors.request.use(config => {
            console.log(`📤 [${serviceName}] Request:`, config.method?.toUpperCase(), config.url)
            if (config.data) {
                console.log(`📤 [${serviceName}] Data:`, config.data)
            }
            return config
        })

        apiInstance.interceptors.response.use(
            response => {
                console.log(`📥 [${serviceName}] Response:`, response.status, response.config.url)
                return response
            },
            error => {
                console.error(`❌ [${serviceName}] Error:`, error.response?.status, error.config?.url, error.response?.data)
                return Promise.reject(error)
            }
        )
    }

    addLoggingInterceptor(authApi, 'AUTH')
    addLoggingInterceptor(contentApi, 'CONTENT')
    addLoggingInterceptor(userApi, 'USER')
    addLoggingInterceptor(chatApi, 'CHAT')
}

// ==================== 서비스별 API 함수들 ====================

/**
 * 인증 관련 API 서비스
 */
export const authService = {
    // 인증 관련
    login: async (credentials) => {
        try {
            const response = await authApi.post('/auth/login', credentials)
            return response
        } catch (error) {
            throw error
        }
    },

    register: async (userData) => {
        try {
            const response = await authApi.post('/auth/register', userData)
            return response
        } catch (error) {
            throw error
        }
    },

    logout: async () => {
        try {
            await authApi.post('/auth/logout')
        } catch (error) {
            console.error('로그아웃 API 호출 실패:', error)
        } finally {
            handleLogout()
        }
    },

    refresh: () => refreshToken(),

    verifyToken: () => authApi.get('/auth/verify'),

    // 비밀번호 관련
    forgotPassword: (email) => authApi.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => authApi.post('/auth/reset-password', { token, password }),

    // 이메일 인증
    verifyEmail: (token) => authApi.post('/auth/verify-email', { token }),
    resendVerification: (email) => authApi.post('/auth/resend-verification', { email })
}

/**
 * 컨텐츠 관련 API 서비스
 */
export const contentService = {
    // 한입 거리 관련
    getOneMouths: (params = {}) => contentApi.get('/one-mouths', { params }),
    getOneMouthDetail: (id) => contentApi.get(`/one-mouths/${id}`),
    createOneMouth: (data) => contentApi.post('/one-mouths', data),
    updateOneMouth: (id, data) => contentApi.put(`/one-mouths/${id}`, data),
    deleteOneMouth: (id) => contentApi.delete(`/one-mouths/${id}`),

    // 관심 상품 관련 (새로 추가)
    toggleOneMouthFavorite: (id) => contentApi.post(`/one-mouths/${id}/favorite`),
    removeOneMouthFavorite: (id) => contentApi.delete(`/one-mouths/${id}/favorite`),

    // 밈/짤 관련
    getMemes: (params = {}) => contentApi.get('/memes', { params }),
    getMemeDetail: (id) => contentApi.get(`/memes/${id}`),
    createMeme: (data) => contentApi.post('/memes', data),
    updateMeme: (id, data) => contentApi.put(`/memes/${id}`, data),
    deleteMeme: (id) => contentApi.delete(`/memes/${id}`),

    // 카테고리 관련
    getCategoriesPages: (pageable = {}, condition = {}) =>
        contentApi.get('/categories', { params: { ...pageable, ...condition } }),

    getCategories: (condition = {}) =>
        contentApi.get('/categories/list', { params: condition }),

    getCategoryDetail: (categoryId) =>
        contentApi.get(`/categories/${categoryId}`),

    createCategory: (data) =>
        contentApi.post('/categories', data),

    updateCategory: (categoryId, data) =>
        contentApi.put(`/categories/${categoryId}`, data),

    deleteCategory: (categoryId) =>
        contentApi.delete(`/categories/${categoryId}`),

    toggleCategoryStatus: (categoryId) =>
        contentApi.patch(`/categories/${categoryId}/toggle-status`),

    reorderCategory: (categoryId, targetPosition) =>
        contentApi.put(`/categories/${categoryId}/reorder`, { targetPosition }),

    getCategoryStats: () =>
        contentApi.get('/categories/stats'),

    // 좋아요/북마크 관련
    likeContent: (contentId, type) =>
        contentApi.post(`/${type}/${contentId}/like`),

    unlikeContent: (contentId, type) =>
        contentApi.delete(`/${type}/${contentId}/like`),

    bookmarkContent: (contentId, type) =>
        contentApi.post(`/${type}/${contentId}/bookmark`),

    unbookmarkContent: (contentId, type) =>
        contentApi.delete(`/${type}/${contentId}/bookmark`),

    // 댓글 관련
    getComments: (contentId, type, params = {}) =>
        contentApi.get(`/${type}/${contentId}/comments`, { params }),

    createComment: (contentId, type, data) =>
        contentApi.post(`/${type}/${contentId}/comments`, data),

    updateComment: (commentId, data) =>
        contentApi.put(`/comments/${commentId}`, data),

    deleteComment: (commentId) =>
        contentApi.delete(`/comments/${commentId}`),

    // 신고 관련
    reportContent: (contentId, type, reason) =>
        contentApi.post(`/${type}/${contentId}/report`, { reason }),

    // 검색 관련
    searchContent: (query, filters = {}) =>
        contentApi.get('/search', { params: { query, ...filters } })
}

/**
 * 사용자 관련 API 서비스
 */
export const userService = {
    // 프로필 관련
    getProfile: () => userApi.get('/users/profile'),
    updateProfile: (data) => userApi.put('/users/profile', data),
    deleteAccount: () => userApi.delete('/users/profile'),
    uploadAvatar: (formData) => userApi.post('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // 사용자 활동
    getUserPosts: (userId, params = {}) =>
        userApi.get(`/users/${userId}/posts`, { params }),

    getUserLikes: (userId, params = {}) =>
        userApi.get(`/users/${userId}/likes`, { params }),

    getUserBookmarks: (params = {}) =>
        userApi.get('/users/bookmarks', { params }),

    getUserComments: (userId, params = {}) =>
        userApi.get(`/users/${userId}/comments`, { params }),

    // 팔로우 시스템
    followUser: (userId) => userApi.post(`/users/${userId}/follow`),
    unfollowUser: (userId) => userApi.delete(`/users/${userId}/follow`),
    getFollowers: (userId, params = {}) =>
        userApi.get(`/users/${userId}/followers`, { params }),

    getFollowing: (userId, params = {}) =>
        userApi.get(`/users/${userId}/following`, { params }),

    checkFollowStatus: (userId) =>
        userApi.get(`/users/${userId}/follow/status`),

    // 알림 관련
    getNotifications: (params = {}) =>
        userApi.get('/users/notifications', { params }),

    markNotificationAsRead: (notificationId) =>
        userApi.patch(`/users/notifications/${notificationId}/read`),

    markAllNotificationsAsRead: () =>
        userApi.patch('/users/notifications/read-all'),

    getUnreadNotificationCount: () =>
        userApi.get('/users/notifications/unread-count'),

    // 알림 설정
    getNotificationSettings: () =>
        userApi.get('/users/notification-settings'),

    updateNotificationSettings: (settings) =>
        userApi.put('/users/notification-settings', settings),

    // 사용자 검색
    searchUsers: (query, params = {}) =>
        userApi.get('/users/search', { params: { query, ...params } }),

    // 차단 관련
    blockUser: (userId) => userApi.post(`/users/${userId}/block`),
    unblockUser: (userId) => userApi.delete(`/users/${userId}/block`),
    getBlockedUsers: (params = {}) => userApi.get('/users/blocked', { params })
}

/**
 * 채팅 관련 API 서비스
 */
export const chatService = {
    // 채팅방 관련
    getChatRooms: (params = {}) => chatApi.get('/v1/chat/rooms', { params }),
    getChatRoom: (roomId) => chatApi.get(`/v1/chat/rooms/${roomId}`),
    createChatRoom: (data) => chatApi.post('/v1/chat/rooms', data),
    updateChatRoom: (roomId, data) => chatApi.put(`/v1/chat/rooms/${roomId}`, data),
    leaveChatRoom: (roomId) => chatApi.delete(`/chat/rooms/${roomId}/leave`),
    inviteToRoom: (roomId, userIds) => chatApi.post(`/chat/rooms/${roomId}/invite`, { userIds }),

    // 메시지 관련
    getChatMessages: (roomId, params = {}) =>
        chatApi.get(`/chat/rooms/${roomId}/messages`, { params }),

    sendMessage: (roomId, message) =>
        chatApi.post(`/chat/rooms/${roomId}/messages`, message),

    updateMessage: (roomId, messageId, data) =>
        chatApi.put(`/chat/rooms/${roomId}/messages/${messageId}`, data),

    deleteMessage: (roomId, messageId) =>
        chatApi.delete(`/chat/rooms/${roomId}/messages/${messageId}`),

    // 파일 업로드
    uploadFile: (roomId, formData) =>
        chatApi.post(`/chat/rooms/${roomId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // 읽음 처리
    markAsRead: (roomId) => chatApi.post(`/chat/rooms/${roomId}/read`),
    getUnreadCount: () => chatApi.get('/chat/unread-count'),
    getRoomUnreadCount: (roomId) => chatApi.get(`/chat/rooms/${roomId}/unread-count`),

    // 채팅 설정
    updateChatSettings: (settings) => chatApi.put('/chat/settings', settings),
    getChatSettings: () => chatApi.get('/chat/settings'),

    // 온라인 상태
    updateOnlineStatus: (status) => chatApi.patch('/chat/online-status', { status }),
    getRoomMembers: (roomId) => chatApi.get(`/chat/rooms/${roomId}/members`)
}

// ==================== 토큰 관련 유틸리티 ====================

/**
 * 토큰 관련 유틸리티 함수들
 */
export const tokenUtils = {
    // 토큰 조회
    getAccessToken: () => localStorage.getItem('access_token'),
    getRefreshToken: () => localStorage.getItem('refresh_token'),

    // 토큰 설정
    setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken)
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken)
        }

        // 토큰 설정 시 이벤트 발생
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'access_token',
            newValue: accessToken
        }))
    },

    // 토큰 삭제
    clearTokens: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        // 토큰 삭제 시 이벤트 발생
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'access_token',
            newValue: null
        }))
    },

    // 로그인 상태 확인
    isLoggedIn: () => !!localStorage.getItem('access_token'),

    // 토큰 만료 확인
    isTokenExpired: (token) => isTokenExpired(token),

    // 토큰에서 사용자 정보 추출
    getUserFromToken: (token) => {
        if (!token) return null

        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            return {
                id: payload.sub,
                email: payload.email,
                roles: payload.roles || [],
                exp: payload.exp
            }
        } catch (error) {
            return null
        }
    },

    // 현재 사용자 정보 조회
    getCurrentUser: () => {
        const token = localStorage.getItem('access_token')
        return tokenUtils.getUserFromToken(token)
    }
}

// ==================== 에러 처리 유틸리티 ====================

/**
 * API 에러 처리 유틸리티
 */
export const errorUtils = {
    // 에러 메시지 추출
    getErrorMessage: (error) => {
        if (error.response?.data?.message) {
            return error.response.data.message
        }
        if (error.response?.data?.error) {
            return error.response.data.error
        }
        if (error.message) {
            return error.message
        }
        return '알 수 없는 오류가 발생했습니다.'
    },

    // 에러 상태 코드 확인
    isUnauthorized: (error) => error.response?.status === 401,
    isForbidden: (error) => error.response?.status === 403,
    isNotFound: (error) => error.response?.status === 404,
    isServerError: (error) => error.response?.status >= 500,

    // 네트워크 에러 확인
    isNetworkError: (error) => !error.response && error.request,

    // 에러 로깅
    logError: (error, context = '') => {
        console.error(`[API Error] ${context}:`, {
            message: errorUtils.getErrorMessage(error),
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method,
            data: error.response?.data
        })
    }
}

// ==================== 기본 Export ====================

// 기본 export (기존 코드 호환성을 위해)
export default authApi

// 모든 API 인스턴스들 export
export { authApi, contentApi, userApi, chatApi }

// 추가 유틸리티 export
export { handleLogout, refreshToken, isTokenExpired }