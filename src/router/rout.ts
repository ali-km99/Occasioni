import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/halls',
      name: 'Halls',
      component: () => import('@/views/Halls.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/halls/:id',
      name: 'HallDetails',
      component: () => import('@/views/HallDetails.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/activities-types',
      name: 'ActivitiesTypes',
      component: () => import('@/views/ActivitiesTypes.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reservation-types',
      name: 'ReservationTypes',
      component: () => import('@/views/ReservationTypes.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('@/views/Users.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users/:id',
      name: 'UserDetails',
      component: () => import('@/views/UserDetails.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

/**
 * 🔑 Route Guards
 * - يحافظ على بقاء المستخدم مسجل بعد إعادة تحميل الصفحة
 * - يجلب بيانات المستخدم إذا عنده توكن محفوظ
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // إذا الصفحة محمية
  if (to.meta.requiresAuth) {
    if (!authStore.token) {
      // ما عنديش توكن → روح للـ login
      return next('/login')
    }

    if (!authStore.user) {
      // عندي توكن لكن ما فيش بيانات مستخدم → نجيبها
      try {
        const { authAPI } = await import('@/services/api')
        const response = await authAPI.me()
        authStore.setUser(response.data)
        return next()
      } catch (error) {
        authStore.clearAuth()
        return next('/login')
      }
    }
  }

  // إذا الصفحة للضيوف فقط (مثلاً login) والمستخدم عنده توكن
  if (to.meta.requiresGuest && authStore.token) {
    return next('/dashboard')
  }

  next()
})

export default router
