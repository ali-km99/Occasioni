<template>
  <AppLayout>
    <div class="halls-page">
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-6">
            <h1 class="text-h3">إدارة القاعات</h1>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
              إضافة قاعة جديدة
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Search and Filters -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            label="البحث في القاعات..."
            prepend-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="statusFilter"
            label="الحالة"
            :items="statusOptions"
            variant="outlined"
            density="compact"
            clearable
            @update:model-value="handleStatusFilterChange"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="typeFilter"
            label="نوع النشاط"
            :items="activityTypes"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="compact"
            clearable
            @update:model-value="handleTypeFilterChange"
          ></v-select>
        </v-col>
      </v-row>

      <!-- Halls Table -->
      <v-card>
        <v-data-table
          :headers="headers"
          :items="filteredHalls"
          :loading="loading"
          :search="search"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :total="totalRecords"
          class="elevation-1"
        >
          <template v-slot:item.path="{ item }">
            <v-avatar size="40" v-if="item.path">
              <v-img :src="item.path" alt="صورة القاعة"></v-img>
            </v-avatar>
            <v-avatar size="40" color="grey" v-else>
              <v-icon color="white">mdi-domain</v-icon>
            </v-avatar>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="item.status === 1 ? 'success' : item.status === 3 ? 'warning' : 'error'"
              size="small"
            >
              {{ item.status === 1 ? 'نشط' : item.status === 3 ? 'مغلق' : 'محظور' }}
            </v-chip>
          </template>

          <template v-slot:item.location="{ item }">
            <span>{{ item.location }}</span>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="info"
              @click="viewHall(item)"
              title="عرض التفاصيل"
            ></v-btn>
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="warning"
              @click="editHall(item)"
              title="تعديل القاعة"
            ></v-btn>
            <v-btn
              icon="mdi-block-helper"
              size="small"
              variant="text"
              :color="item.status === 1 ? 'warning' : 'success'"
              @click="toggleHallStatus(item, item.status === 1 ? 2 : 1)"
              :title="item.status === 1 ? 'حظر القاعة' : 'إلغاء حظر القاعة'"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              :color="item.status === 1 ? 'error' : 'success'"
              @click="toggleHallStatus(item, 3)"
              :title="item.status === 1 ? 'غلق القاعة' : ' إلغاء غلق القاعة'"
            ></v-btn>
          </template>
        </v-data-table>

        <!-- Pagination Controls -->
        <v-card-actions class="d-flex justify-center">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="7"
            @update:model-value="handlePageChange"
          ></v-pagination>
        </v-card-actions>
      </v-card>

      <!-- Create/Edit Hall Dialog -->
      <v-dialog v-model="showCreateDialog" max-width="800">
        <v-card>
          <v-card-title>
            {{ editingHall ? 'تعديل القاعة' : 'إنشاء قاعة جديدة' }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="saveHall" v-model="isValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="hallForm.name"
                    label="اسم القاعة"
                    :rules="[(v) => !!v || 'الاسم مطلوب']"
                    required
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="hallForm.phoneNumber"
                    label="رقم الهاتف"
                    :rules="[(v) => !!v || 'رقم الهاتف مطلوب']"
                    required
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="hallForm.latitude"
                    label="خط العرض"
                    type="number"
                    step="0.000001"
                    :rules="[(v) => !!v || 'خط العرض مطلوب']"
                    required
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="hallForm.longitude"
                    label="خط الطول"
                    type="number"
                    step="0.000001"
                    :rules="[(v) => !!v || 'خط الطول مطلوب']"
                    required
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="hallForm.address"
                    label="العنوان"
                    :rules="[(v) => !!v || 'العنوان مطلوب']"
                    required
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="hallForm.location"
                    label="الموقع"
                    :rules="[(v) => !!v || 'الموقع مطلوب']"
                    required
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="hallForm.typeOfActivityId"
                    label="نوع النشاط"
                    :items="activityTypes"
                    item-title="name"
                    item-value="id"
                    :rules="[(v) => !!v || 'نوع النشاط مطلوب']"
                    required
                    variant="outlined"
                  ></v-select>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="showCreateDialog = false"> إلغاء </v-btn>
            <v-btn color="primary" @click="saveHall" :loading="saving" :disabled="!isValid">
              {{ editingHall ? 'تحديث' : 'إنشاء' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Hall Details Dialog -->
      <v-dialog v-model="showDetailsDialog" max-width="800">
        <v-card v-if="selectedHall">
          <v-card-title class="d-flex justify-space-between align-center">
            {{ selectedHall.name }}
            <v-btn icon="mdi-close" variant="text" @click="showDetailsDialog = false"></v-btn>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-img
                  :src="
                    selectedHall.images && selectedHall.images.length > 0
                      ? selectedHall.images[0].url
                      : '/placeholder-hall.jpg'
                  "
                  height="200"
                  cover
                  class="rounded"
                ></v-img>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-h6 mb-2">معلومات القاعة</div>
                <div class="mb-2">
                  <strong>رقم الهاتف:</strong> {{ selectedHall.phoneNumber || 'غير محدد' }}
                </div>
                <div class="mb-2">
                  <strong>العنوان:</strong> {{ selectedHall.address || 'غير محدد' }}
                </div>
                <div class="mb-2">
                  <strong>الموقع:</strong> {{ selectedHall.location || 'غير محدد' }}
                </div>
                <div class="mb-2">
                  <strong>خط العرض:</strong> {{ selectedHall.latitude || 'غير محدد' }}
                </div>
                <div class="mb-2">
                  <strong>خط الطول:</strong> {{ selectedHall.longitude || 'غير محدد' }}
                </div>
                <div class="mb-2">
                  <strong>الحالة:</strong>
                  <v-chip :color="selectedHall.status === 1 ? 'success' : 'error'" size="small">
                    {{ selectedHall.status === 1 ? 'نشط' : 'محظور' }}
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { hallsAPI, activityTypesAPI } from '@/services/api'
import type { Hall, ActivityType, HallCreate } from '@/types'

const router = useRouter()

// Data
const halls = ref<Hall[]>([])
const activityTypes = ref<ActivityType[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const statusFilter = ref<number | ''>('')
const typeFilter = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalRecords = ref(0)

// Dialogs
const showCreateDialog = ref(false)
const showDetailsDialog = ref(false)
const editingHall = ref<Hall | null>(null)
const selectedHall = ref<Hall | null>(null)

// Form
const hallForm = reactive<HallCreate>({
  name: '',
  phoneNumber: '',
  latitude: 0,
  longitude: 0,
  address: '',
  location: '',
  typeOfActivityId: '',
})

const isValid = ref(false)

// Table headers
const headers: Array<{
  title: string
  key: string
  sortable: boolean
  align?: 'start' | 'center' | 'end'
}> = [
  { title: 'الصورة', key: 'path', sortable: false, align: 'center' },
  { title: 'الاسم', key: 'name', sortable: true, align: 'center' },
  { title: 'رقم الهاتف', key: 'phoneNumber', sortable: true, align: 'center' },
  { title: 'الموقع', key: 'location', sortable: true, align: 'center' },
  { title: 'نوع النشاط', key: 'typeOfActivityName', sortable: true, align: 'center' },
  { title: 'الحالة', key: 'status', sortable: true, align: 'center' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' },
]

// Filter options
const statusOptions = [
  { title: 'نشط', value: 1 },
  { title: 'محظور', value: 2 },
  { title: 'مغلق', value: 3 },
]

// Computed
const filteredHalls = computed(() => {
  let filtered = halls.value

  if (statusFilter.value !== '') {
    filtered = filtered.filter((hall) => hall.status === statusFilter.value)
  }

  if (typeFilter.value) {
    filtered = filtered.filter((hall) => hall.typeOfActivityId === typeFilter.value)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(totalRecords.value / itemsPerPage.value))

// Methods
const fetchHalls = async (page: number = 1) => {
  try {
    loading.value = true
    const response = await hallsAPI.getAll({
      page,
      limit: itemsPerPage.value,
      status: statusFilter.value || undefined,
      typeOfActivityId: typeFilter.value || undefined,
    })
    halls.value = response.data.data
    totalRecords.value = response.data.totalRecords
    currentPage.value = page
  } catch (error) {
    console.error('Error fetching halls:', error)
  } finally {
    loading.value = false
  }
}

const fetchActivityTypes = async () => {
  try {
    const response = await activityTypesAPI.getAll()
    activityTypes.value = response.data.data
  } catch (error) {
    console.error('Error fetching activity types:', error)
  }
}

const handlePageChange = (page: number) => {
  fetchHalls(page)
}

const handleStatusFilterChange = () => {
  currentPage.value = 1
  fetchHalls(1)
}

const handleTypeFilterChange = () => {
  currentPage.value = 1
  fetchHalls(1)
}

const saveHall = async () => {
  try {
    saving.value = true

    if (editingHall.value) {
      await hallsAPI.update(editingHall.value.id, hallForm)
    } else {
      await hallsAPI.create(hallForm)
    }

    showCreateDialog.value = false
    resetForm()
    fetchHalls(currentPage.value)
  } catch (error) {
    console.error('Error saving hall:', error)
  } finally {
    saving.value = false
  }
}

const editHall = (hall: Hall) => {
  editingHall.value = hall
  Object.assign(hallForm, hall)
  showCreateDialog.value = true
}

const viewHall = (hall: Hall) => {
  selectedHall.value = hall
  showDetailsDialog.value = true
}

const toggleHallStatus = async (hall: Hall, type: number) => {
  try {
    await hallsAPI.block(hall.id, type)
    fetchHalls(currentPage.value)
  } catch (error) {
    console.error('Error toggling hall status:', error)
  }
}

const resetForm = () => {
  editingHall.value = null
  Object.assign(hallForm, {
    name: '',
    phoneNumber: '',
    latitude: 0,
    longitude: 0,
    address: '',
    location: '',
    typeOfActivityId: '',
  })
}

onMounted(() => {
  fetchHalls(1)
  fetchActivityTypes()
})
</script>

<style scoped>
.halls-page {
  padding: 20px;
}
</style>
