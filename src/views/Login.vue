<template>
  <div class="login-wrapper">
    <!-- Canvas الخلفية المتحركة -->
    <canvas ref="canvas" class="background-canvas"></canvas>

    <!-- بطاقة تسجيل الدخول -->
    <v-card class="login-card p-4" max-width="400" min-width="400">
      <v-card-title class="text-center text-h4 mb-4">إدارة حجز القاعات</v-card-title>

      <v-card-subtitle class="text-center text-body-1 mb-6">
        تسجيل الدخول إلى حسابك
      </v-card-subtitle>

      <v-card-text>
        <v-form @submit.prevent="handleLogin" v-model="isValid">
          <v-text-field
            v-model="form.username"
            label="البريد الإلكتروني"
            type="text"
            prepend-icon="mdi-email"
            :rules="emailRules"
            required
            variant="outlined"
            class="mb-4"
          />

          <v-text-field
            v-model="form.password"
            label="كلمة المرور"
            type="password"
            prepend-icon="mdi-lock"
            :rules="passwordRules"
            required
            variant="outlined"
            class="mb-6"
          />

          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            :loading="isLoading"
            :disabled="!isValid"
          >
            تسجيل الدخول
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-alert v-if="error" type="error" variant="tonal" class="w-100">
          {{ error }}
        </v-alert>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})

const isValid = ref(false)
const isLoading = ref(false)
const error = ref('')
const canvas = ref<HTMLCanvasElement | null>(null)

const emailRules = [
  (v: string) => !!v || 'البريد الإلكتروني مطلوب',
  (v: string) => /.+@.+\..+/.test(v) || 'يجب أن يكون البريد الإلكتروني صحيحاً',
]

const passwordRules = [
  (v: string) => !!v || 'كلمة المرور مطلوبة',
  (v: string) => v.length >= 6 || 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
]

const handleLogin = async () => {
  try {
    isLoading.value = true
    error.value = ''

    const response = await authAPI.login({
      username: form.username,
      password: form.password,
    })
    const { token } = response.data

    authStore.setToken(token)

    // ✅ بعد تسجيل الدخول مباشرة نجيب بيانات المستخدم
    await authStore.fetchMe()

    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.'
  } finally {
    isLoading.value = false
  }
}

/* 🎇 إنشاء النقاط المضيئة */
onMounted(() => {
  const c = canvas.value
  if (!c) return
  const ctx = c.getContext('2d') as CanvasRenderingContext2D

  let particles: { x: number; y: number; r: number; dx: number; dy: number }[] = []
  const numParticles = 80

  const resizeCanvas = () => {
    c.width = window.innerWidth
    c.height = window.innerHeight
    particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 1,
      dy: (Math.random() - 0.5) * 1,
    }))
  }

  const draw = () => {
    ctx.fillStyle = '#0a0f1f' // خلفية أزرق داكن
    ctx.fillRect(0, 0, c.width, c.height)

    ctx.fillStyle = 'white'
    ctx.shadowColor = '#66aaff'
    ctx.shadowBlur = 15

    particles.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()

      p.x += p.dx
      p.y += p.dy

      // ارتداد عن الحواف
      if (p.x < 0 || p.x > c.width) p.dx *= -1
      if (p.y < 0 || p.y > c.height) p.dy *= -1
    })

    requestAnimationFrame(draw)
  }

  resizeCanvas()
  draw()
  window.addEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Canvas الخلفية */
.background-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* بطاقة تسجيل الدخول بزجاجية */
.login-card {
  padding: 5px 20px;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(15px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  color: white;
}
</style>
