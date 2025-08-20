import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Actions
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (newUser: User) => {
    user.value = newUser
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  /** ✅ جلب بيانات المستخدم عبر api/auth/me */
  const fetchMe = async () => {
    if (!token.value) return null
    try {
      const response = await authAPI.me()
      setUser(response.data)
      return response.data
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    setToken,
    setUser,
    logout,
    clearAuth,
    fetchMe, // ← أضفناها
  }
})
