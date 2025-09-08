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

// ==================== 토큰 관리 함수들 ====================

/**
 * 토큰 갱신 함수
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
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_profile')
    localStorage.removeItem('user_preferences')
    localStorage.removeItem('user_info')

    window.dispatchEvent(new StorageEvent('storage', {
        key: 'access_token',
        newValue: null
    }))

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

// Auth API 인터셉터
authApi.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token')
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

// 보호된 API들 인터셉터
const addProtectedApiInterceptor = (apiInstance) => {
        apiInstance.interceptors.request.use(config => {
            const token = localStorage.getItem('access_token')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        }, error => {
            return Promise.reject(error)
        })

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
                        const newToken = await refreshToken()
                        originalRequest.headers.Authorization = `Bearer ${newToken}`
                        return apiInstance(originalRequest)
                    } catch (refreshError) {
                        handleLogout()
                    }
                }

                return Promise.reject(error)
            }
        )
    }

// 보호된 API들에 인터셉터 적용
;[contentApi, userApi, chatApi].forEach(api => addProtectedApiInterceptor(api))

// ==================== 개발 환경 로깅 ====================
if (import.meta.env.DEV) {
    const addLoggingInterceptor = (apiInstance, serviceName) => {
        apiInstance.interceptors.request.use(config => {
            console.log(`📤 [${serviceName}] Request:`, config.method?.toUpperCase(), config.url)
            return config
        })

        apiInstance.interceptors.response.use(
            response => {
                console.log(`📥 [${serviceName}] Response:`, response.status, response.config.url)
                return response
            },
            error => {
                console.error(`❌ [${serviceName}] Error:`, error.response?.status, error.config?.url)
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
    login: async (credentials) => {
        return await authApi.post('/auth/login', credentials)
    },

    register: async (userData) => {
        return await authApi.post('/auth/register', userData)
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

    forgotPassword: (email) => authApi.post('/auth/forgot-password', { email }),

    resetPassword: (token, password) => authApi.post('/auth/reset-password', { token, password }),

    verifyEmail: (token) => authApi.post('/auth/verify-email', { token }),

    resendVerification: (email) => authApi.post('/auth/resend-verification', { email })
}

/**
 * 컨텐츠 관련 API 서비스
 */
export const contentService = {
    getOneMouths: (params = {}) => contentApi.get('/one-mouths', { params }),
    getOneMouthDetail: (id) => contentApi.get(`/one-mouths/${id}`),
    createOneMouth: (data) => contentApi.post('/one-mouths', data),
    updateOneMouth: (id, data) => contentApi.put(`/one-mouths/${id}`, data),
    deleteOneMouth: (id) => contentApi.delete(`/one-mouths/${id}`),

    toggleOneMouthFavorite: (id) => contentApi.post(`/one-mouths/${id}/favorite`),
    removeOneMouthFavorite: (id) => contentApi.delete(`/one-mouths/${id}/favorite`),

    getMemes: (params = {}) => contentApi.get('/memes', { params }),
    getMemeDetail: (id) => contentApi.get(`/memes/${id}`),
    createMeme: (data) => contentApi.post('/memes', data),
    updateMeme: (id, data) => contentApi.put(`/memes/${id}`, data),
    deleteMeme: (id) => contentApi.delete(`/memes/${id}`),

    getCategoriesPages: (pageable = {}, condition = {}) =>
        contentApi.get('/categories', { params: { ...pageable, ...condition } }),

    getCategories: (condition = {}) =>
        contentApi.get('/categories/list', { params: condition }),

    getCategoryDetail: (categoryId) => contentApi.get(`/categories/${categoryId}`),
    createCategory: (data) => contentApi.post('/categories', data),
    updateCategory: (categoryId, data) => contentApi.put(`/categories/${categoryId}`, data),
    deleteCategory: (categoryId) => contentApi.delete(`/categories/${categoryId}`),

    likeContent: (contentId, type) => contentApi.post(`/${type}/${contentId}/like`),
    unlikeContent: (contentId, type) => contentApi.delete(`/${type}/${contentId}/like`),

    getComments: (contentId, type, params = {}) =>
        contentApi.get(`/${type}/${contentId}/comments`, { params }),

    createComment: (contentId, type, data) =>
        contentApi.post(`/${type}/${contentId}/comments`, data),

    updateComment: (commentId, data) => contentApi.put(`/comments/${commentId}`, data),
    deleteComment: (commentId) => contentApi.delete(`/comments/${commentId}`),

    reportContent: (contentId, type, reason) =>
        contentApi.post(`/${type}/${contentId}/report`, { reason }),

    searchContent: (query, filters = {}) =>
        contentApi.get('/search', { params: { query, ...filters } })
}

/**
 * 사용자 관련 API 서비스
 */
export const userService = {
    getProfile: () => userApi.get('/users/profile'),
    updateProfile: (data) => userApi.put('/users/profile', data),
    deleteAccount: () => userApi.delete('/users/profile'),

    getUserPosts: (userId, params = {}) => userApi.get(`/users/${userId}/posts`, { params }),
    getUserLikes: (userId, params = {}) => userApi.get(`/users/${userId}/likes`, { params }),
    getUserBookmarks: (params = {}) => userApi.get('/users/bookmarks', { params }),

    followUser: (userId) => userApi.post(`/users/${userId}/follow`),
    unfollowUser: (userId) => userApi.delete(`/users/${userId}/follow`),

    getNotifications: (params = {}) => userApi.get('/users/notifications', { params }),
    markNotificationAsRead: (notificationId) =>
        userApi.patch(`/users/notifications/${notificationId}/read`),

    searchUsers: (query, params = {}) =>
        userApi.get('/users/search', { params: { query, ...params } }),

    blockUser: (userId) => userApi.post(`/users/${userId}/block`),
    unblockUser: (userId) => userApi.delete(`/users/${userId}/block`)
}

/**
 * 채팅 관련 API 서비스
 */
export const chatService = {
    // 채팅방 관련
    getChatRooms: (params = {}) => chatApi.get('/v1/chat/rooms', { params }),
    getChatRoom: (roomId) => chatApi.get(`/v1/chat/rooms/${roomId}`),
    createChatRoom: (data) => chatApi.post('/v1/chat/rooms', data),
    leaveChatRoom: (roomId) => chatApi.delete(`/v1/chat/rooms/${roomId}/leave`),

    // 채팅 시작 (한입만에서 채팅하기 클릭시)
    startChat: (data) => {
        console.log('채팅 시작 API 호출:', data)
        return chatApi.post('/v1/chat/rooms/chat', data)
    },

    // 채팅방 상세 정보
    getChatRoomDetail: (roomId) => {
        console.log('채팅방 상세 정보 API 호출:', roomId)
        return chatApi.get(`/v1/chat/rooms/${roomId}`)
    },

    // 메시지 관련
    getChatMessages: (roomId, cursorPageRequest = {}) => {
        console.log('메시지 조회 API 호출:', { roomId, cursorPageRequest })

        const params = {}
        if (cursorPageRequest.size) params.size = cursorPageRequest.size
        if (cursorPageRequest.lastMessageId) params.lastMessageId = cursorPageRequest.lastMessageId

        return chatApi.get(`/chat/${roomId}/messages`, { params })
    },

    sendMessage: (roomId, message) => {
        console.log('메시지 전송 API 호출:', { roomId, message })

        const sendRequest = {
            content: message.content,
            type: message.type || 'TEXT',
            replyToMessageId: message.replyToMessageId || null
        }

        return chatApi.post(`/chat/rooms/${roomId}/messages`, sendRequest)
    },

    uploadFile: (roomId, formData) =>
        chatApi.post(`/v1/chat/rooms/${roomId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    markAsRead: (roomId) => chatApi.post(`/v1/chat/rooms/${roomId}/read`),
    getUnreadCount: () => chatApi.get('/v1/chat/unread-count'),

    joinRoom: (roomId) => {
        console.log('채팅방 입장 API 호출:', roomId)
        return chatApi.post(`/v1/chat/rooms/${roomId}/join`)
    },

    leaveRoom: (roomId) => {
        console.log('채팅방 퇴장 API 호출:', roomId)
        return chatApi.post(`/v1/chat/rooms/${roomId}/leave`)
    },

    testConnection: async () => {
        try {
            const response = await chatApi.get('/v1/chat/health')
            return response.status === 200
        } catch (error) {
            console.error('채팅 API 연결 테스트 실패:', error)
            return false
        }
    }
}

// ==================== 토큰 관련 유틸리티 ====================

export const tokenUtils = {
    getAccessToken: () => localStorage.getItem('access_token'),
    getRefreshToken: () => localStorage.getItem('refresh_token'),

    setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('access_token', accessToken)
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken)
        }

        window.dispatchEvent(new StorageEvent('storage', {
            key: 'access_token',
            newValue: accessToken
        }))
    },

    clearTokens: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        window.dispatchEvent(new StorageEvent('storage', {
            key: 'access_token',
            newValue: null
        }))
    },

    isLoggedIn: () => !!localStorage.getItem('access_token'),

    isTokenExpired: (token) => isTokenExpired(token),

    getUserFromToken: (token) => {
        if (!token) return null

        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            return {
                id: payload.sub || payload.userId || payload.id || payload.user_id,
                email: payload.email,
                username: payload.username || payload.name,
                roles: payload.roles || payload.authorities || [],
                exp: payload.exp,
                iat: payload.iat
            }
        } catch (error) {
            console.error('토큰 파싱 실패:', error)
            return null
        }
    },

    getCurrentUser: () => {
        const savedUserInfo = localStorage.getItem('user_info')
        if (savedUserInfo) {
            try {
                const userInfo = JSON.parse(savedUserInfo)
                if (userInfo?.id) {
                    return userInfo
                }
            } catch (error) {
                console.error('저장된 사용자 정보 파싱 실패:', error)
            }
        }

        const token = localStorage.getItem('access_token')
        const userFromToken = tokenUtils.getUserFromToken(token)

        if (userFromToken?.id) {
            localStorage.setItem('user_info', JSON.stringify(userFromToken))
            return userFromToken
        }

        return null
    },

    getDeviceId: () => {
        let deviceId = localStorage.getItem('device_id')
        if (!deviceId) {
            deviceId = 'web-' + Math.random().toString(36).substr(2, 9)
            localStorage.setItem('device_id', deviceId)
        }
        return deviceId
    },

    setDeviceId: (deviceId) => {
        localStorage.setItem('device_id', deviceId)
    },

    getUserId: () => {
        const user = tokenUtils.getCurrentUser()
        return user ? user.id : null
    }
}

// ==================== 에러 처리 유틸리티 ====================

export const errorUtils = {
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

    isUnauthorized: (error) => error.response?.status === 401,
    isForbidden: (error) => error.response?.status === 403,
    isNotFound: (error) => error.response?.status === 404,
    isServerError: (error) => error.response?.status >= 500,

    isNetworkError: (error) => !error.response && error.request,

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

export default authApi

export { authApi, contentApi, userApi, chatApi }

export { handleLogout, refreshToken, isTokenExpired }