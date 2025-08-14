<template>
  <div class="login-container">
    <v-card class="login-card" max-width="400">
      <v-card-title class="text-center text-h4 mb-4"> إدارة حجز القاعات </v-card-title>

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
          ></v-text-field>

          <v-text-field
            v-model="form.password"
            label="كلمة المرور"
            type="password"
            prepend-icon="mdi-lock"
            :rules="passwordRules"
            required
            variant="outlined"
            class="mb-6"
          ></v-text-field>

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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/services/api'
import type { User } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})

const isValid = ref(false)
const isLoading = ref(false)
const error = ref('')

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
    const { token, user } = response.data

    authStore.setToken(token)
    authStore.setUser(user)

    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}
</style>
