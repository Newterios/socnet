import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const authAPI = {
    register: (data) => api.post('/register', data),
    login: (data) => api.post('/login', data),
}

export const usersAPI = {
    getProfile: (id) => api.get(`/users/${id}`),
    updateProfile: (id, data) => api.put(`/users/${id}`, data),
    search: (query) => api.get(`/users/search?q=${query}`),
}

export const postsAPI = {
    create: (data) => api.post('/posts', data),
    getById: (id) => api.get(`/posts/${id}`),
    update: (id, data) => api.put(`/posts/${id}`, data),
    delete: (id) => api.delete(`/posts/${id}`),
    getFeed: () => api.get('/feed'),
    like: (id) => api.post(`/posts/${id}/like`),
    unlike: (id) => api.delete(`/posts/${id}/like`),
    getComments: (id) => api.get(`/posts/${id}/comments`),
    addComment: (id, data) => api.post(`/posts/${id}/comments`, data),
}

export const friendsAPI = {
    getList: () => api.get('/friends'),
    getPending: () => api.get('/friends/pending'),
    sendRequest: (addresseeId) => api.post('/friends/request', { addressee_id: addresseeId }),
    accept: (id) => api.put(`/friends/${id}/accept`),
    block: (id) => api.put(`/friends/${id}/block`),
}

export const messagesAPI = {
    getConversations: () => api.get('/conversations'),
    createConversation: (participantId) => api.post('/conversations', { participant_id: participantId }),
    getMessages: (id) => api.get(`/conversations/${id}/messages`),
    sendMessage: (id, body) => api.post(`/conversations/${id}/messages`, { body }),
}

export const groupsAPI = {
    getList: () => api.get('/groups'),
    create: (data) => api.post('/groups', data),
    getById: (id) => api.get(`/groups/${id}`),
    join: (id) => api.post(`/groups/${id}/join`),
    leave: (id) => api.delete(`/groups/${id}/leave`),
    getPosts: (id) => api.get(`/groups/${id}/posts`),
    createPost: (id, data) => api.post(`/groups/${id}/posts`, data),
}

export const notificationsAPI = {
    getList: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    getUnreadCount: () => api.get('/notifications/unread'),
    clearAll: () => api.delete('/notifications'),
}

export const reportsAPI = {
    create: (targetType, targetId, reason) =>
        api.post('/reports', { target_type: targetType, target_id: targetId, reason }),
}

export const adminAPI = {
    getReports: (status = 'pending') => api.get(`/admin/reports?status=${status}`),
    reviewReport: (id, status) => api.put(`/admin/reports/${id}`, { status }),
    deleteContent: (type, id) => api.delete(`/admin/content/${type}/${id}`),
}

export default api
