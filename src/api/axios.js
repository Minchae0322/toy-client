import axios from 'axios'

// 환경변수에서 BASE_URL 가져오기
const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8081'
const CONTENT_BASE_URL = import.meta.env.VITE_CONTENT_BASE_URL || 'http://localhost:8082'

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    timeout: 5000
})

const contentApi = axios.create({
    baseURL: `${CONTENT_BASE_URL}/api`,
    timeout: 5000
})


// access_token 자동 추가
api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// refresh 자동 재발급
api.interceptors.response.use(
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
                // 환경변수 사용하여 refresh 요청
                const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, {
                    withCredentials: true
                })
                const newToken = res.data.accessToken
                localStorage.setItem('access_token', newToken)
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return api(originalRequest)
            } catch (e) {
                // 모든 토큰 제거
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')

                // storage 이벤트 발생시켜서 App.vue에서 감지하도록
                window.dispatchEvent(new StorageEvent('storage', {
                    key: 'access_token',
                    newValue: null
                }))

                window.location.href = '/login'
            }
        }
        return Promise.reject(err)
    }
)

export default api