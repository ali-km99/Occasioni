<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" :rail="rail" permanent @click="rail = false">
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
        :title="authStore.user?.name || 'المستخدم'"
        :subtitle="authStore.user?.email || ''"
        nav
      >
        <template v-slot:append>
          <v-btn variant="text" @click.stop="rail = !rail">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="لوحة التحكم"
          value="dashboard"
          to="/dashboard"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-domain"
          title="القاعات"
          value="halls"
          to="/halls"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="أنواع الأنشطة"
          value="reservation-types"
          to="/reservation-types"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-calendar-clock"
          title="انواع الحجوزات"
          value="activities"
          to="/activities"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-account-multiple"
          title="المستخدمين"
          value="users"
          to="/users"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>إدارة حجز القاعات</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="showProfile">
            <v-list-item-title>الملف الشخصي</v-list-item-title>
          </v-list-item>
          <v-list-item @click="authStore.logout()">
            <v-list-item-title>تسجيل الخروج</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <slot></slot>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const drawer = ref(true)
const rail = ref(false)

const showProfile = () => {
  // TODO: Implement profile view
  console.log('Show profile')
}
</script>

<style scoped>
.v-navigation-drawer {
  transition: width 0.2s ease-in-out;
}
</style>
