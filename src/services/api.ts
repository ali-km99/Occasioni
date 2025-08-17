import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import type {
  User,
  UserCreate,
  UserUpdate,
  Hall,
  HallCreate,
  HallUpdate,
  ActivityType,
  ActivityTypeCreate,
  ActivityTypeUpdate,
  ReservationType,
  ReservationTypeCreate,
  ReservationTypeUpdate,
  PaginatedResponse,
} from '@/types'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://occasioni.fexpress.ly/api',
  timeout: 10000,
})

// Request interceptor to add auth token

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// Authentication API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post<{ token: string; user: User }>('/auth/login', credentials),
  me: () => api.get<User>('/auth/me'),
}

// Halls API
export const hallsAPI = {
  getAll: (params?: {
    page?: number
    limit?: number
    status?: number
    typeOfActivityId?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status.toString())
    if (params?.typeOfActivityId) queryParams.append('typeOfActivityId', params.typeOfActivityId)

    const queryString = queryParams.toString()
    const url = queryString ? `/Hall/all?${queryString}` : '/Hall/all'
    return api.get<PaginatedResponse<Hall>>(url)
  },
  getById: (id: string) => api.get<Hall>(`/hall/${id}`),
  create: (data: HallCreate) => api.post<Hall>('/hall', data),
  update: (id: string, data: HallUpdate) => api.patch<Hall>(`/hall/${id}`, data),
  delete: (id: string) => api.delete(`/hall/${id}`),
  block: (id: string) => api.post(`/hall/${id}/block`),

  // Hall images and attachments
  uploadImage: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post(`/hall/${id}/hallImage`, formData)
  },
  uploadAttachments: (id: string, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('attachments', file))
    return api.post(`/hall/${id}/hallAttachments`, formData)
  },

  // Hall user management
  getUsers: (id: string) => api.get<User[]>(`/hall/${id}/users`),
  addUser: (id: string, userId: string) => api.post(`/hall/${id}/user`, { userId }),
  blockUser: (userId: string) => api.post(`/hall/user/${userId}/block`),
}

// Reservation Types API
export const reservationTypesAPI = {
  getAll: () => api.get<ReservationType[]>('/ReservationType'),
  getById: (id: string) => api.get<ReservationType>(`/ReservationType/${id}`),
  create: (data: ReservationTypeCreate) => api.post<ReservationType>('/ReservationType', data),
  update: (id: string, data: ReservationTypeUpdate) =>
    api.patch<ReservationType>(`/ReservationType/${id}`, data),
  delete: (id: string) => api.delete(`/ReservationType/${id}`),
  block: (id: string) => api.post(`/ReservationType/${id}/block`),
}

// Activity Types API
export const activityTypesAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status.toString())

    const queryString = queryParams.toString()
    const url = queryString ? `/typeOfActivities/all?${queryString}` : '/typeOfActivities/all'
    return api.get<PaginatedResponse<ActivityType>>(url)
  },
  getById: (id: string) => api.get<ActivityType>(`/typeOfActivities/${id}`),
  create: (data: ActivityTypeCreate) => api.post<ActivityType>('/typeOfActivities', data),
  update: (id: string, data: ActivityTypeCreate) =>
    api.patch<ActivityType>(`/typeOfActivities/${id}`, data),
  delete: (id: string) => api.delete(`/typeOfActivities/${id}`),
  block: (id: string) => api.post(`/typeOfActivities/${id}/block`),
}

// Users API
export const usersAPI = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: UserCreate) => api.post<User>('/users', data),
  update: (id: string, data: UserUpdate) => api.patch<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  block: (id: string) => api.post(`/users/${id}/block`),
}

export default api
