<template>
  <AppLayout>
    <div class="user-details-page" v-if="user">
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center mb-6">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              @click="$router.push('/users')"
              class="mr-4"
            ></v-btn>
            <h1 class="text-h3">{{ user.name }}</h1>
            <v-spacer></v-spacer>
            <v-btn color="warning" prepend-icon="mdi-pencil" @click="editMode = !editMode">
              {{ editMode ? 'إلغاء التعديل' : 'تعديل المستخدم' }}
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <!-- User Information -->
        <v-col cols="12" md="8">
          <v-card class="mb-6">
            <v-card-title>معلومات المستخدم</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="user.name"
                    label="الاسم الكامل"
                    :readonly="!editMode"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="user.email"
                    label="البريد الإلكتروني"
                    type="email"
                    :readonly="!editMode"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="user.role"
                    label="الدور"
                    :items="roleOptions"
                    :readonly="!editMode"
                    variant="outlined"
                    class="mb-4"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="user.phone"
                    label="رقم الهاتف"
                    :readonly="!editMode"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="user.address"
                    label="العنوان"
                    :readonly="!editMode"
                    variant="outlined"
                    rows="3"
                    class="mb-4"
                  ></v-textarea>
                </v-col>
              </v-row>

              <v-row v-if="editMode">
                <v-col cols="12">
                  <v-btn color="primary" @click="saveChanges" :loading="saving">
                    حفظ التغييرات
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- User Statistics -->
          <v-card class="mb-6">
            <v-card-title>إحصائيات المستخدم</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold text-primary">
                      {{ stats.totalReservations || 0 }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis">إجمالي الحجوزات</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold text-success">
                      {{ stats.activeReservations || 0 }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis">الحجوزات النشطة</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold text-info">
                      {{ stats.totalHours || 0 }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis">إجمالي الساعات</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold text-warning">
                      {{ stats.favoriteHalls || 0 }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis">القاعات المفضلة</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Recent Reservations -->
          <v-card class="mb-6">
            <v-card-title>الحجوزات الأخيرة</v-card-title>
            <v-card-text>
              <v-list v-if="recentReservations.length > 0">
                <v-list-item v-for="reservation in recentReservations" :key="reservation.id">
                  <template v-slot:prepend>
                    <v-avatar :color="getReservationStatusColor(reservation.status)" size="32">
                      <v-icon color="white" size="20">mdi-calendar</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ reservation.hallName }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatDate(reservation.startTime) }} - {{ formatDate(reservation.endTime) }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-chip :color="getReservationStatusColor(reservation.status)" size="small">
                      {{ getReservationStatusTitle(reservation.status) }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
              <div v-else class="text-center text-medium-emphasis py-4">
                لم يتم العثور على حجوزات
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" md="4">
          <!-- Profile Card -->
          <v-card class="mb-6">
            <v-card-text class="text-center">
              <v-avatar size="120" class="mb-4">
                <v-img v-if="user.avatar" :src="user.avatar"></v-img>
                <v-icon v-else size="64">mdi-account</v-icon>
              </v-avatar>

              <div class="text-h6 mb-2">{{ user.name }}</div>
              <div class="text-body-2 text-medium-emphasis mb-3">{{ user.email }}</div>

              <v-chip :color="getRoleColor(user.role)" size="large" class="mb-3">
                {{ getRoleTitle(user.role) }}
              </v-chip>

              <v-chip
                :color="user.status === 'active' ? 'success' : 'error'"
                size="large"
                class="mb-4"
              >
                {{ user.status === 'active' ? 'نشط' : 'محظور' }}
              </v-chip>
            </v-card-text>
          </v-card>

          <!-- Actions -->
          <v-card class="mb-6">
            <v-card-title>الإجراءات</v-card-title>
            <v-card-text>
              <v-btn
                :color="user.status === 'active' ? 'error' : 'success'"
                block
                class="mb-3"
                @click="toggleStatus"
              >
                {{ user.status === 'active' ? 'حظر المستخدم' : 'إلغاء حظر المستخدم' }}
              </v-btn>

              <v-btn color="warning" block class="mb-3" @click="resetPassword">
                إعادة تعيين كلمة المرور
              </v-btn>

              <v-btn color="info" block @click="sendNotification"> إرسال إشعار </v-btn>
            </v-card-text>
          </v-card>

          <!-- User Preferences -->
          <v-card class="mb-6">
            <v-card-title>التفضيلات</v-card-title>
            <v-card-text>
              <div class="mb-3">
                <strong>اللغة:</strong> {{ user.preferences?.language || 'العربية' }}
              </div>
              <div class="mb-3">
                <strong>المنطقة الزمنية:</strong> {{ user.preferences?.timezone || 'UTC' }}
              </div>
              <div class="mb-3">
                <strong>الإشعارات:</strong>
                <v-chip size="small" :color="user.preferences?.notifications ? 'success' : 'error'">
                  {{ user.preferences?.notifications ? 'مفعلة' : 'معطلة' }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { usersAPI } from '@/services/api'
import type { User, Reservation } from '@/types'

const route = useRoute()

// Data
const user = ref<User | null>(null)
const userReservations = ref<Reservation[]>([])
const editMode = ref(false)
const saving = ref(false)
const loading = ref(false)

// Mock data for demonstration
const stats = ref({
  totalReservations: 15,
  activeReservations: 3,
  totalHours: 48,
  favoriteHalls: 2,
})

const recentReservations = ref([
  {
    id: '1',
    hallName: 'قاعة المؤتمرات أ',
    typeName: 'اجتماع عمل',
    startTime: '2024-01-15T09:00:00',
    endTime: '2024-01-15T11:00:00',
    status: 'confirmed',
  },
  {
    id: '2',
    hallName: 'غرفة الاجتماعات ب',
    typeName: 'عرض تقديمي',
    startTime: '2024-01-16T14:00:00',
    endTime: '2024-01-16T16:00:00',
    status: 'pending',
  },
])

// Role options
const roleOptions = [
  { title: 'مدير', value: 'admin' },
  { title: 'مشرف', value: 'manager' },
  { title: 'مستخدم', value: 'user' },
]

// Methods
const fetchUserDetails = async () => {
  try {
    loading.value = true
    const response = await usersAPI.getById(route.params.id as string)
    user.value = response.data
  } catch (error) {
    console.error('Error fetching user details:', error)
  } finally {
    loading.value = false
  }
}

const fetchUserReservations = async () => {
  try {
    // TODO: Implement API call to fetch user reservations
    // const response = await reservationsAPI.getByUserId(route.params.id as string)
    // userReservations.value = response.data
  } catch (error) {
    console.error('Error fetching user reservations:', error)
  }
}

const saveChanges = async () => {
  if (!user.value) return

  try {
    saving.value = true
    await usersAPI.update(user.value.id, user.value)
    editMode.value = false
  } catch (error) {
    console.error('Error saving user changes:', error)
  } finally {
    saving.value = false
  }
}

const toggleStatus = async () => {
  if (!user.value) return

  try {
    await usersAPI.block(user.value.id)
    await fetchUserDetails()
  } catch (error) {
    console.error('Error toggling user status:', error)
  }
}

const resetPassword = async () => {
  if (!user.value) return

  try {
    // TODO: Implement password reset API call
    // await usersAPI.resetPassword(user.value.id)
    console.log('Password reset requested for user:', user.value.id)
  } catch (error) {
    console.error('Error resetting password:', error)
  }
}

const sendNotification = async () => {
  if (!user.value) return

  try {
    // TODO: Implement notification API call
    // await notificationsAPI.sendToUser(user.value.id, 'Test notification')
    console.log('Notification sent to user:', user.value.id)
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'error'
    case 'manager':
      return 'warning'
    case 'user':
      return 'info'
    default:
      return 'grey'
  }
}

const getRoleTitle = (role: string) => {
  const roleMap: Record<string, string> = {
    admin: 'مدير',
    manager: 'مشرف',
    user: 'مستخدم',
  }
  return roleMap[role] || role
}

const getReservationStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'error'
    default:
      return 'grey'
  }
}

const getReservationStatusTitle = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'في الانتظار',
    confirmed: 'مؤكد',
    cancelled: 'ملغي',
  }
  return statusMap[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(() => {
  fetchUserDetails()
  fetchUserReservations()
})
</script>

<style scoped>
.user-details-page {
  padding: 20px;
}
</style>
