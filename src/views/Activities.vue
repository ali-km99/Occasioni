<template>
  <AppLayout>
    <div class="activities-page">
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-6">
            <h1 class="text-h3">إداره أنواع الحجوزات</h1>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
              إضافة نشاط جديد
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Search -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            label="البحث في الأنشطة..."
            prepend-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
          ></v-text-field>
        </v-col>
      </v-row>

      <!-- Activities Table -->
      <v-card>
        <v-data-table
          :headers="headers"
          :items="filteredActivityTypes"
          :loading="loading"
          :search="search"
          class="elevation-1"
        >
          <template v-slot:item.status="{ item }">
            <v-chip :color="item.status === 1 ? 'success' : 'error'" size="small">
              {{ item.status === 1 ? 'نشط' : 'محظور' }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="warning"
              @click="editActivityType(item)"
              title="تعديل النشاط"
            ></v-btn>
            <v-btn
              icon="mdi-block-helper"
              size="small"
              variant="text"
              :color="item.status === 1 ? 'error' : 'success'"
              @click="toggleActivityTypeStatus(item)"
              :title="item.status === 1 ? 'حظر النشاط' : 'إلغاء حظر النشاط'"
            ></v-btn>
          </template>
        </v-data-table>
      </v-card>

      <!-- Create/Edit Dialog -->
      <v-dialog v-model="showCreateDialog" max-width="500">
        <v-card>
          <v-card-title>
            {{ editingActivityType ? 'تعديل نوع النشاط' : 'إنشاء نشاط جديد' }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="saveActivityType" v-model="isValid">
              <v-text-field
                v-model="activityTypeForm.name"
                label="اسم النشاط"
                :rules="[(v) => !!v || 'الاسم مطلوب']"
                required
                variant="outlined"
                class="mb-4"
              ></v-text-field>

              <!-- <v-textarea
                v-model="activityTypeForm.description"
                label="الوصف"
                variant="outlined"
                rows="3"
                class="mb-4"
              ></v-textarea>

              <v-text-field
                v-model="activityTypeForm.category"
                label="الفئة"
                variant="outlined"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="activityTypeForm.estimatedDuration"
                label="المدة المقدرة (دقائق)"
                type="number"
                variant="outlined"
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="activityTypeForm.requiredEquipment"
                label="المعدات المطلوبة"
                variant="outlined"
                hint="افصل بين العناصر المتعددة بفواصل"
              ></v-text-field> -->
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
import type { ActivityType, ActivityTypeCreate, PaginatedResponse } from '@/types'

// Data
const activityTypes = ref<ActivityType[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')

// Dialogs
const showCreateDialog = ref(false)
const editingActivityType = ref<ActivityType | null>(null)

// Pagination
const currentPage = ref<number>(1)
const itemsPerPage = ref(10)
const totalRecords = ref(0)

// Form
const activityTypeForm = reactive<ActivityTypeCreate>({
  name: '',
  status: 1,
})

const isValid = ref(false)

// Table headers
const headers = [
  { title: 'الاسم', key: 'name', sortable: true },
  { title: 'الفئة', key: 'category', sortable: true },
  { title: 'الوصف', key: 'description', sortable: false },
  { title: 'المدة المقدرة (دقائق)', key: 'estimatedDuration', sortable: true },
  { title: 'المعدات المطلوبة', key: 'requiredEquipment', sortable: false },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false },
]

// Computed
const filteredActivityTypes = computed(() => {
  return activityTypes.value
})

// Methods
const fetchActivityTypes = async (page: number) => {
  try {
    loading.value = true
    const response = await activityTypesAPI.getAll({
      page,
      limit: itemsPerPage.value,
    })
    activityTypes.value = response.data.data
  } catch (error) {
    console.error('Error fetching activity types:', error)
  } finally {
    loading.value = false
  }
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
    category: '',
    description: '',
    estimatedDuration: 0,
    requiredEquipment: '',
  })
}

onMounted(() => {
  fetchActivityTypes(currentPage.value)
})
</script>

<style scoped>
.activities-page {
  padding: 20px;
}
</style>
