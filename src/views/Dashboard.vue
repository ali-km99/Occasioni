<template>
  <AppLayout>
    <div class="dashboard">
      <v-row>
        <v-col cols="12">
          <h1 class="text-h3 mb-6">لوحة التحكم</h1>
        </v-col>
      </v-row>

      <!-- Statistics Cards -->
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="primary" class="mb-2">mdi-domain</v-icon>
              <div class="text-h4 font-weight-bold">{{ stats.totalHalls || 0 }}</div>
              <div class="text-body-2 text-medium-emphasis">إجمالي القاعات</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="success" class="mb-2">mdi-calendar-check</v-icon>
              <div class="text-h4 font-weight-bold">{{ stats.activeReservations || 0 }}</div>
              <div class="text-body-2 text-medium-emphasis">الحجوزات النشطة</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="info" class="mb-2">mdi-account-group</v-icon>
              <div class="text-h4 font-weight-bold">{{ stats.totalUsers || 0 }}</div>
              <div class="text-body-2 text-medium-emphasis">إجمالي المستخدمين</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card">
            <v-card-text class="text-center">
              <v-icon size="48" color="warning" class="mb-2">mdi-account-multiple</v-icon>
              <div class="text-h4 font-weight-bold">{{ stats.totalActivities || 0 }}</div>
              <div class="text-body-2 text-medium-emphasis">أنواع الأنشطة</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quick Actions -->
      <v-row class="mt-6">
        <v-col cols="12">
          <h2 class="text-h5 mb-4">الإجراءات السريعة</h2>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-card class="action-card" @click="$router.push('/halls')">
            <v-card-text class="text-center">
              <v-icon size="64" color="primary" class="mb-3">mdi-domain-plus</v-icon>
              <div class="text-h6">إضافة قاعة جديدة</div>
              <div class="text-body-2 text-medium-emphasis">إنشاء قاعة جديدة للحجوزات</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-card class="action-card" @click="$router.push('/reservation-types')">
            <v-card-text class="text-center">
              <v-icon size="64" color="success" class="mb-3">mdi-calendar-plus</v-icon>
              <div class="text-h6">إدارة أنواع الحجوزات</div>
              <div class="text-body-2 text-medium-emphasis">تكوين فئات الحجوزات</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-card class="action-card" @click="$router.push('/users')">
            <v-card-text class="text-center">
              <v-icon size="64" color="info" class="mb-3">mdi-account-plus</v-icon>
              <div class="text-h6">إضافة مستخدم جديد</div>
              <div class="text-body-2 text-medium-emphasis">إنشاء حسابات المستخدمين</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Activity -->
      <v-card class="mb-6">
        <v-card-title>النشاط الأخير</v-card-title>
        <v-card-text>
          <v-list v-if="recentHalls.length > 0 || recentUsers.length > 0">
            <v-list-item v-for="hall in recentHalls" :key="hall.id">
              <template v-slot:prepend>
                <v-icon color="primary">mdi-domain</v-icon>
              </template>
              <v-list-item-title>{{ hall.name }}</v-list-item-title>
              <v-list-item-subtitle>تمت إضافة قاعة جديدة</v-list-item-subtitle>
              <template v-slot:append>
                <span class="text-caption text-medium-emphasis">منذ ساعة</span>
              </template>
            </v-list-item>

            <v-list-item v-for="user in recentUsers" :key="user.id">
              <template v-slot:prepend>
                <v-icon color="success">mdi-account-plus</v-icon>
              </template>
              <v-list-item-title>{{ user.name }}</v-list-item-title>
              <v-list-item-subtitle>تم تسجيل مستخدم جديد</v-list-item-subtitle>
              <template v-slot:append>
                <span class="text-caption text-medium-emphasis">منذ ساعتين</span>
              </template>
            </v-list-item>
          </v-list>

          <v-alert v-else type="info" variant="tonal"> لا يوجد نشاط حديث </v-alert>
        </v-card-text>
      </v-card>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { hallsAPI, usersAPI, activityTypesAPI } from '@/services/api'
import type { Hall, User, ActivityType } from '@/types'

// Data
const stats = ref({
  totalHalls: 0,
  totalUsers: 0,
  totalActivities: 0,
  activeReservations: 0,
})

const recentHalls = ref<Hall[]>([])
const recentUsers = ref<User[]>([])
const loading = ref(false)

// Methods
const fetchDashboardData = async () => {
  try {
    loading.value = true

    // Fetch statistics
    const [hallsResponse, usersResponse, activitiesResponse] = await Promise.all([
      hallsAPI.getAll(),
      usersAPI.getAll(),
      activityTypesAPI.getAll(),
    ])

    stats.value = {
      totalHalls: hallsResponse.data.totalRecords,
      totalUsers: usersResponse.data.length,
      totalActivities: activitiesResponse.data.length,
      activeReservations: 0, // TODO: Implement reservations API
    }

    // Get recent items
    recentHalls.value = hallsResponse.data.data.slice(0, 5)
    recentUsers.value = usersResponse.data.slice(0, 5)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.action-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
</style>
