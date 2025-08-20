<template>
  <AppLayout>
    <div class="reservation-types-page">
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-6">
            <h1 class="text-h3">إدارة أنواع الأنشطة</h1>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
              إضافة نوع نشاط جديد
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Search and Filters -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            label="البحث في أنواع الأنشطة..."
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
      </v-row>

      <!-- Activity Types Table -->
      <v-card>
        <v-data-table
          :headers="headers"
          :items="filteredActivityTypes"
          :loading="loading"
          :search="search"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :total="totalRecords"
          class="elevation-1"
        >
          <template v-slot:item.status="{ item }">
            <v-chip :color="item.status === 1 ? 'success' : 'error'" size="small">
              {{ item.status === 1 ? 'نشط' : 'محظور' }}
            </v-chip>
          </template>

          <template v-slot:item.createAt="{ item }">
            <span dir="rtl">{{ formatDate(item.createAt) }}</span>
          </template>

          <template v-slot:item.updatedAt="{ item }">
            <span>{{ item.updatedAt ? formatDate(item.updatedAt) : 'لم يتم التحديث' }}</span>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="warning"
              @click="editActivityType(item)"
              title="تعديل نوع النشاط"
            ></v-btn>
            <v-btn
              icon="mdi-block-helper"
              size="small"
              variant="text"
              :color="item.status === 1 ? 'error' : 'success'"
              @click="toggleActivityTypeStatus(item)"
              :title="item.status === 1 ? 'حظر النوع' : 'إلغاء حظر النوع'"
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

      <!-- Create/Edit Activity Type Dialog -->
      <v-dialog v-model="showCreateDialog" max-width="600">
        <v-card>
          <v-card-title>
            {{ editingActivityType ? 'تعديل نوع النشاط' : 'إنشاء نوع نشاط جديد' }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="saveActivityType" v-model="isValid">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="activityTypeForm.name"
                    label="اسم نوع النشاط"
                    :rules="[(v) => !!v || 'الاسم مطلوب']"
                    required
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="activityTypeForm.status"
                    label="الحالة"
                    :items="statusOptions"
                    item-title="title"
                    item-value="value"
                    :rules="[(v) => !!v || 'الحالة مطلوبة']"
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
            <v-btn color="primary" @click="saveActivityType" :loading="saving" :disabled="!isValid">
              {{ editingActivityType ? 'تحديث' : 'إنشاء' }}
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
import { activityTypesAPI } from '@/services/api'
import type { ActivityType, ActivityTypeCreate } from '@/types'

// Data
const activityTypes = ref<ActivityType[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const statusFilter = ref<number | ''>('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalRecords = ref(0)

// Dialogs
const showCreateDialog = ref(false)
const editingActivityType = ref<ActivityType | null>(null)

// Form
const activityTypeForm = reactive<ActivityTypeCreate>({
  name: '',
  status: 1,
})

const isValid = ref(false)

// Table headers
const headers: Array<{
  title: string
  key: string
  sortable: boolean
  align?: 'start' | 'center' | 'end'
}> = [
  { title: 'الاسم', key: 'name', sortable: true, align: 'center' },
  { title: 'الحالة', key: 'status', sortable: true, align: 'center' },
  { title: 'تاريخ الإنشاء', key: 'createAt', sortable: true, align: 'center' },
  { title: 'آخر تحديث', key: 'updatedAt', sortable: true, align: 'center' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' },
]

// Filter options
const statusOptions = [
  { title: 'نشط', value: 1 },
  { title: 'محظور', value: 3 },
]

// Computed
const filteredActivityTypes = computed(() => {
  let filtered = activityTypes.value

  if (statusFilter.value !== '') {
    filtered = filtered.filter((type) => type.status === statusFilter.value)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(totalRecords.value / itemsPerPage.value))

// Methods
const fetchActivityTypes = async (page: number = 1) => {
  try {
    loading.value = true
    const response = await activityTypesAPI.getAll({
      page,
      limit: itemsPerPage.value,
      status: statusFilter.value || undefined,
    })
    activityTypes.value = response.data.data
    totalRecords.value = response.data.totalRecords
    currentPage.value = page
  } catch (error) {
    console.error('Error fetching activity types:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  fetchActivityTypes(page)
}

const handleStatusFilterChange = () => {
  currentPage.value = 1
  fetchActivityTypes(1)
}

const saveActivityType = async () => {
  try {
    saving.value = true

    if (editingActivityType.value) {
      await activityTypesAPI.update(editingActivityType.value.id, activityTypeForm)
    } else {
      await activityTypesAPI.create(activityTypeForm)
    }

    showCreateDialog.value = false
    resetForm()
    fetchActivityTypes(currentPage.value)
  } catch (error) {
    console.error('Error saving activity type:', error)
  } finally {
    saving.value = false
  }
}

const editActivityType = (activityType: ActivityType) => {
  editingActivityType.value = activityType
  Object.assign(activityTypeForm, activityType)
  showCreateDialog.value = true
}

const toggleActivityTypeStatus = async (activityType: ActivityType) => {
  try {
    const newStatus = activityType.status === 1 ? 3 : 1
    await activityTypesAPI.block(activityType.id, newStatus)
    fetchActivityTypes(currentPage.value)
  } catch (error) {
    console.error('Error toggling activity type status:', error)
  }
}

const resetForm = () => {
  editingActivityType.value = null
  Object.assign(activityTypeForm, {
    name: '',
    status: 1,
  })
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ar-LY', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
}

onMounted(() => {
  fetchActivityTypes(1)
})
</script>

<style scoped>
.reservation-types-page {
  padding: 20px;
}
</style>
