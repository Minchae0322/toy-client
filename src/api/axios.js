// src/api/axios.js - API 통신 및 토큰 관리
import axios from 'axios'
import * as authUtils from '@/utils/auth.js'

// 환경 설정
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

// 토큰 갱신 상태 관리
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

// 토큰 갱신 함수
const refreshToken = async () => {
    const refreshTokenValue = authUtils.getRefreshToken()

    if (!refreshTokenValue) {
        throw new Error('RefreshToken이 없습니다')
    }

    if (authUtils.isTokenExpired(refreshTokenValue)) {
        throw new Error('RefreshToken이 만료되었습니다')
    }

    try {
        console.log('🔄 토큰 갱신 시작...')

        const response = await axios.post(`${AUTH_BASE_URL}/api/auth/refresh`, {
            refreshToken: refreshTokenValue
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = response.data.data || response.data
        const { accessToken, refreshToken: newRefreshToken } = data

        if (!accessToken) {
            throw new Error('새로운 AccessToken을 받지 못했습니다')
        }

        // 새 토큰들 저장
        authUtils.setTokens(accessToken, newRefreshToken || refreshTokenValue)

        console.log('✅ 토큰 갱신 완료')
        return accessToken

    } catch (error) {
        console.error('❌ 토큰 갱신 실패:', error)

        // 토큰 갱신 실패시 로그아웃 처리
        authUtils.logout()

        // 로그인 페이지로 리다이렉트
        if (window.location.pathname !== '/login') {
            window.location.href = '/login?reason=token_expired'
        }

        throw error
    }
}

// API 인스턴스 생성 함수
const createApiInstance = (baseURL, isAuthApi = false) => {
    const instance = axios.create({
        baseURL: `${baseURL}/api`,
        ...commonConfig
    })

    // Request 인터셉터 - 토큰 자동 첨부
    instance.interceptors.request.use(
        config => {
            const token = authUtils.getAccessToken()

            // 인증 API의 로그인/회원가입 요청에는 토큰 첨부하지 않음
            const skipTokenUrls = ['/auth/login', '/auth/register', '/auth/refresh']
            const shouldSkipToken = isAuthApi && skipTokenUrls.some(url => config.url?.includes(url))

            if (token && !shouldSkipToken) {
                config.headers.Authorization = `Bearer ${token}`
            }

            return config
        },
        error => {
            return Promise.reject(error)
        }
    )

    // Response 인터셉터 - 401 에러 시 토큰 갱신
    instance.interceptors.response.use(
        response => response,
        async error => {
            const originalRequest = error.config

            // 401 에러이고, 아직 재시도하지 않았으며, 인증 API가 아닌 경우
            if (
                error.response?.status === 401 &&
                !originalRequest._retry &&
                !originalRequest.url?.includes('/auth/')
            ) {
                console.log('🚨 401 에러 감지 - 토큰 갱신 시도')

                if (isRefreshing) {
                    // 이미 갱신 중이면 대기열에 추가
                    console.log('⏳ 토큰 갱신 중 - 대기열에 추가')
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject })
                    }).then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return instance(originalRequest)
                    }).catch(err => {
                        return Promise.reject(err)
                    })
                }

                originalRequest._retry = true
                isRefreshing = true

                try {
                    const newToken = await refreshToken()
                    processQueue(null, newToken)

                    // 원래 요청에 새 토큰 적용하여 재시도
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    return instance(originalRequest)

                } catch (refreshError) {
                    processQueue(refreshError, null)
                    return Promise.reject(refreshError)
                } finally {
                    isRefreshing = false
                }
            }

            return Promise.reject(error)
        }
    )

    return instance
}

// API 인스턴스들 생성
export const authApi = createApiInstance(AUTH_BASE_URL, true)
export const contentApi = createApiInstance(CONTENT_BASE_URL)
export const userApi = createApiInstance(USER_BASE_URL)
export const chatApi = createApiInstance(CHAT_BASE_URL)

// 개발 환경에서 API 로깅
if (import.meta.env.DEV) {
    const addLoggingInterceptor = (apiInstance, serviceName) => {
        apiInstance.interceptors.request.use(config => {
            console.log(`📤 [${serviceName}] ${config.method?.toUpperCase()} ${config.url}`)
            return config
        })

        apiInstance.interceptors.response.use(
            response => {
                console.log(`📥 [${serviceName}] ${response.status} ${response.config.url}`)
                return response
            },
            error => {
                console.error(`❌ [${serviceName}] ${error.response?.status || 'Network Error'} ${error.config?.url}`)
                return Promise.reject(error)
            }
        )
    }

    addLoggingInterceptor(authApi, 'AUTH')
    addLoggingInterceptor(contentApi, 'CONTENT')
    addLoggingInterceptor(userApi, 'USER')
    addLoggingInterceptor(chatApi, 'CHAT')
}

// 인증 관련 API 서비스
export const authService = {
    // 로그인
    login: async (credentials) => {
        const response = await authApi.post('/auth/login', credentials)
        return response
    },

    // 회원가입
    register: async (userData) => {
        const response = await authApi.post('/auth/register', userData)
        return response
    },

    // 로그아웃
    logout: async () => {
        try {
            const refreshTokenValue = authUtils.getRefreshToken()
            if (refreshTokenValue) {
                await authApi.post('/auth/logout', {
                    refreshToken: refreshTokenValue
                })
                console.log('✅ 백엔드 로그아웃 완료')
            }
        } catch (error) {
            console.warn('⚠️ 백엔드 로그아웃 실패:', error)
        } finally {
            // 로컬 인증 정보 정리
            authUtils.logout()
        }
    },

    // 토큰 갱신
    refresh: async () => {
        const newToken = await refreshToken()
        return { data: { accessToken: newToken } }
    },

    // 토큰 검증
    verifyToken: async () => {
        return await authApi.get('/auth/verify')
    },

    // 비밀번호 재설정 요청
    forgotPassword: async (email) => {
        return await authApi.post('/auth/forgot-password', { email })
    },

    // 비밀번호 재설정
    resetPassword: async (token, password) => {
        return await authApi.post('/auth/reset-password', { token, password })
    },

    // 이메일 인증
    verifyEmail: async (token) => {
        return await authApi.post('/auth/verify-email', { token })
    },

    // 인증 이메일 재전송
    resendVerification: async (email) => {
        return await authApi.post('/auth/resend-verification', { email })
    }
}

// 컨텐츠 관련 API 서비스
export const contentService = {
    // 한입만 관련
    getOneMouths: (params = {}) =>
        contentApi.get('/one-mouths', { params }),

    getOneMouthDetail: (id) =>
        contentApi.get(`/one-mouths/${id}`),

    createOneMouth: (data) =>
        contentApi.post('/one-mouths', data),

    updateOneMouth: (id, data) =>
        contentApi.put(`/one-mouths/${id}`, data),

    deleteOneMouth: (id) =>
        contentApi.delete(`/one-mouths/${id}`),

    // 관심 상품 관련
    toggleOneMouthFavorite: (id) =>
        contentApi.post(`/one-mouths/${id}/favorite`),

    removeOneMouthFavorite: (id) =>
        contentApi.delete(`/one-mouths/${id}/favorite`),

    // 밈 관련
    getMemes: (params = {}) =>
        contentApi.get('/memes', { params }),

    getMemeDetail: (id) =>
        contentApi.get(`/memes/${id}`),

    createMeme: (data) =>
        contentApi.post('/memes', data),

    updateMeme: (id, data) =>
        contentApi.put(`/memes/${id}`, data),

    deleteMeme: (id) =>
        contentApi.delete(`/memes/${id}`),

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

    // 좋아요/댓글/신고 관련
    likeContent: (contentId, type) =>
        contentApi.post(`/${type}/${contentId}/like`),

    unlikeContent: (contentId, type) =>
        contentApi.delete(`/${type}/${contentId}/like`),

    getComments: (contentId, type, params = {}) =>
        contentApi.get(`/${type}/${contentId}/comments`, { params }),

    createComment: (contentId, type, data) =>
        contentApi.post(`/${type}/${contentId}/comments`, data),

    updateComment: (commentId, data) =>
        contentApi.put(`/comments/${commentId}`, data),

    deleteComment: (commentId) =>
        contentApi.delete(`/comments/${commentId}`),

    reportContent: (contentId, type, reason) =>
        contentApi.post(`/${type}/${contentId}/report`, { reason }),

    // 검색 관련
    searchContent: (query, filters = {}) =>
        contentApi.get('/search', { params: { query, ...filters } })
}

// 사용자 관련 API 서비스
export const userService = {
    // 프로필 관련
    getProfile: () => userApi.get('/users/profile'),
    updateProfile: (data) => userApi.put('/users/profile', data),
    deleteAccount: () => userApi.delete('/users/profile'),

    // 사용자 활동 관련
    getUserPosts: (userId, params = {}) =>
        userApi.get(`/users/${userId}/posts`, { params }),

    getUserLikes: (userId, params = {}) =>
        userApi.get(`/users/${userId}/likes`, { params }),

    getUserBookmarks: (params = {}) =>
        userApi.get('/users/bookmarks', { params }),

    // 팔로우 관련
    followUser: (userId) => userApi.post(`/users/${userId}/follow`),
    unfollowUser: (userId) => userApi.delete(`/users/${userId}/follow`),

    // 알림 관련
    getNotifications: (params = {}) =>
        userApi.get('/users/notifications', { params }),

    markNotificationAsRead: (notificationId) =>
        userApi.patch(`/users/notifications/${notificationId}/read`),

    // 검색 및 차단 관련
    searchUsers: (query, params = {}) =>
        userApi.get('/users/search', { params: { query, ...params } }),

    blockUser: (userId) => userApi.post(`/users/${userId}/block`),
    unblockUser: (userId) => userApi.delete(`/users/${userId}/block`)
}

// 채팅 관련 API 서비스
export const chatService = {
    // 채팅방 관련
    getChatRooms: (params = {}) =>
        chatApi.get('/v1/chat/rooms', { params }),

    getChatRoom: (roomId) =>
        chatApi.get(`/v1/chat/rooms/${roomId}`),

    createChatRoom: (data) =>
        chatApi.post('/v1/chat/rooms', data),

    leaveChatRoom: (roomId) =>
        chatApi.delete(`/v1/chat/rooms/${roomId}/leave`),

    // 채팅 시작 (한입만에서 채팅하기 클릭시)
    startChat: (data) => {
        console.log('📞 채팅 시작 API 호출:', data)
        return chatApi.post('/v1/chat/rooms/chat', data)
    },

    // 채팅방 상세 정보
    getChatRoomDetail: (roomId) => {
        console.log('🔍 채팅방 상세 정보 API 호출:', roomId)
        return chatApi.get(`/v1/chat/rooms/${roomId}`)
    },

    // 메시지 관련
    getChatMessages: (roomId, cursorPageRequest = {}) => {
        console.log('💬 메시지 조회 API 호출:', { roomId, cursorPageRequest })

        const params = {}
        if (cursorPageRequest.size) params.size = cursorPageRequest.size
        if (cursorPageRequest.lastMessageId) params.lastMessageId = cursorPageRequest.lastMessageId

        return chatApi.get(`/chat/${roomId}/messages`, { params })
    },

    sendMessage: (roomId, message) => {
        console.log('📤 메시지 전송 API 호출:', { roomId, message })

        const sendRequest = {
            content: message.content,
            type: message.type || 'TEXT',
            replyToMessageId: message.replyToMessageId || null
        }

        return chatApi.post(`/chat/rooms/${roomId}/messages`, sendRequest)
    },

    // 파일 업로드
    uploadFile: (roomId, formData) =>
        chatApi.post(`/v1/chat/rooms/${roomId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // 읽음 처리 및 알림
    markAsRead: (roomId) =>
        chatApi.post(`/v1/chat/rooms/${roomId}/read`),

    getUnreadCount: () =>
        chatApi.get('/v1/chat/unread-count'),

    // 채팅방 입장/퇴장
    joinRoom: (roomId) => {
        console.log('🚪 채팅방 입장 API 호출:', roomId)
        return chatApi.post(`/v1/chat/rooms/${roomId}/join`)
    },

    leaveRoom: (roomId) => {
        console.log('🚪 채팅방 퇴장 API 호출:', roomId)
        return chatApi.post(`/v1/chat/rooms/${roomId}/leave`)
    },

    // 연결 테스트
    testConnection: async () => {
        try {
            const response = await chatApi.get('/v1/chat/health')
            return response.status === 200
        } catch (error) {
            console.error('💥 채팅 API 연결 테스트 실패:', error)
            return false
        }
    }
}

// 토큰 유틸리티 (하위 호환성 유지)
export const tokenUtils = {
    getAccessToken: authUtils.getAccessToken,
    getRefreshToken: authUtils.getRefreshToken,
    setTokens: authUtils.setTokens,
    clearTokens: authUtils.clearTokens,
    isLoggedIn: authUtils.isAuthenticated,
    isTokenExpired: authUtils.isTokenExpired,
    getCurrentUser: authUtils.getCurrentUser,
    getUserId: authUtils.getUserId,
    getUserRole: authUtils.getUserRole,
    getDeviceId: authUtils.getDeviceId
}

// 에러 처리 유틸리티
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

// 기본 Export
export default authApi