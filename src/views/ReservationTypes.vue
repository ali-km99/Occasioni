<template>
  <AppLayout>
    <div class="reservation-types-page">
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-6">
            <h1 class="text-h3">إدارة أنواع الحجوزات</h1>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
              إضافة نوع جديد
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Search -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            label="البحث في الأنواع..."
            prepend-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Reservation Types Table -->
      <v-card>
        <v-data-table
          :headers="headers"
          :items="filteredReservationTypes"
          :loading="loading"
          :search="search"
          class="elevation-1"
        >
          <template v-slot:item.status="{ item }">
            <v-chip :color="item.status === 'active' ? 'success' : 'error'" size="small">
              {{ item.status === 'active' ? 'نشط' : 'محظور' }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="warning"
              @click="editReservationType(item)"
              title="تعديل النوع"
            ></v-btn>
            <v-btn
              icon="mdi-block-helper"
              size="small"
              variant="text"
              :color="item.status === 'active' ? 'error' : 'success'"
              @click="toggleReservationTypeStatus(item)"
              :title="item.status === 'active' ? 'حظر النوع' : 'إلغاء حظر النوع'"
            ></v-btn>
          </template>
        </v-data-table>
      </v-card>

      <!-- Create/Edit Dialog -->
      <v-dialog v-model="showCreateDialog" max-width="500">
        <v-card>
          <v-card-title>
            {{ editingReservationType ? 'تعديل نوع الحجز' : 'إنشاء نوع جديد' }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="saveReservationType" v-model="isValid">
              <v-text-field
                v-model="reservationTypeForm.name"
                label="اسم النوع"
                :rules="[(v) => !!v || 'الاسم مطلوب']"
                required
                variant="outlined"
                class="mb-4"
              ></v-text-field>

              <v-textarea
                v-model="reservationTypeForm.description"
                label="الوصف"
                variant="outlined"
                rows="3"
                class="mb-4"
              ></v-textarea>

              <v-text-field
                v-model="reservationTypeForm.duration"
                label="المدة الافتراضية (ساعات)"
                type="number"
                variant="outlined"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="reservationTypeForm.maxCapacity"
                label="السعة القصوى"
                type="number"
                variant="outlined"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="showCreateDialog = false"> إلغاء </v-btn>
            <v-btn
              color="primary"
              @click="saveReservationType"
              :loading="saving"
              :disabled="!isValid"
            >
              {{ editingReservationType ? 'تحديث' : 'إنشاء' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { reservationTypesAPI } from '@/services/api'
import type { ReservationType, ReservationTypeCreate } from '@/types'

// Data
const reservationTypes = ref<ReservationType[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')

// Dialogs
const showCreateDialog = ref(false)
const editingReservationType = ref<ReservationType | null>(null)

// Form
const reservationTypeForm = reactive<ReservationTypeCreate>({
  name: '',
  description: '',
  duration: 0,
  maxCapacity: 0,
})

const isValid = ref(false)

// Table headers
const headers = [
  { title: 'الاسم', key: 'name', sortable: true },
  { title: 'الوصف', key: 'description', sortable: false },
  { title: 'المدة (ساعات)', key: 'duration', sortable: true },
  { title: 'السعة القصوى', key: 'maxCapacity', sortable: true },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false },
]

// Computed
const filteredReservationTypes = computed(() => {
  return reservationTypes.value
})

// Methods
const fetchReservationTypes = async () => {
  try {
    loading.value = true
    const response = await reservationTypesAPI.getAll()
    reservationTypes.value = response.data
  } catch (error) {
    console.error('Error fetching reservation types:', error)
  } finally {
    loading.value = false
  }
}

const saveReservationType = async () => {
  try {
    saving.value = true

    if (editingReservationType.value) {
      await reservationTypesAPI.update(editingReservationType.value.id, reservationTypeForm)
    } else {
      await reservationTypesAPI.create(reservationTypeForm)
    }

    showCreateDialog.value = false
    resetForm()
    fetchReservationTypes()
  } catch (error) {
    console.error('Error saving reservation type:', error)
  } finally {
    saving.value = false
  }
}

const editReservationType = (reservationType: ReservationType) => {
  editingReservationType.value = reservationType
  Object.assign(reservationTypeForm, reservationType)
  showCreateDialog.value = true
}

const toggleReservationTypeStatus = async (reservationType: ReservationType) => {
  try {
    await reservationTypesAPI.block(reservationType.id)
    fetchReservationTypes()
  } catch (error) {
    console.error('Error toggling reservation type status:', error)
  }
}

const resetForm = () => {
  editingReservationType.value = null
  Object.assign(reservationTypeForm, {
    name: '',
    description: '',
    duration: 0,
    maxCapacity: 0,
  })
}

onMounted(() => {
  fetchReservationTypes()
})
</script>

<style scoped>
.reservation-types-page {
  padding: 20px;
}
</style>
