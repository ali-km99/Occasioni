import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/halls',
      name: 'Halls',
      component: () => import('@/views/Halls.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/halls/:id',
      name: 'HallDetails',
      component: () => import('@/views/HallDetails.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reservation-types',
      name: 'ReservationTypes',
      component: () => import('@/views/ReservationTypes.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/activities',
      name: 'Activities',
      component: () => import('@/views/Activities.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('@/views/Users.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users/:id',
      name: 'UserDetails',
      component: () => import('@/views/UserDetails.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Route guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  // If authenticated and going to protected route, validate session
  if (to.meta.requiresAuth && authStore.isAuthenticated && !authStore.user) {
    try {
      const { authAPI } = await import('@/services/api')
      const response = await authAPI.me()
      authStore.setUser(response.data)
      next()
    } catch (error) {
      authStore.clearAuth()
      next('/login')
    }
    return
  }
  
  next()
})

export default router
