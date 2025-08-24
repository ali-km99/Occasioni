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
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="warning"
                  v-bind="props"
                  title="خيارات القاعة"
                ></v-btn>
              </template>

              <v-list>
                <v-list-item
                  title="تعديل القاعة"
                  prepend-icon="mdi-pencil"
                  @click="editHall(item)"
                ></v-list-item>

                <v-list-item
                  title="إدارة صور القاعة"
                  prepend-icon="mdi-image-multiple"
                  @click="manageHallImages(item)"
                ></v-list-item>

                <v-list-item
                  title="إضافة شعار للقاعة"
                  prepend-icon="mdi-image-plus"
                  @click="addHallLogo(item)"
                ></v-list-item>
              </v-list>
            </v-menu>

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
      <!-- Hall Details Dialog -->
      <v-dialog v-model="showDetailsDialog" max-width="800">
        <v-card v-if="selectedHall">
          <v-card-title class="d-flex justify-space-between align-center">
            {{ selectedHall.name }}
            <v-btn icon="mdi-close" variant="text" @click="showDetailsDialog = false"></v-btn>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <!-- كاروسيل الصور والفيديوهات -->
                <div v-if="selectedHallAttachments.length > 0" class="mb-4">
                  <v-carousel
                    v-model="currentImageIndex"
                    height="300"
                    show-arrows-on-hover
                    cycle
                    interval="4000"
                  >
                    <v-carousel-item v-for="(attachment, i) in selectedHallAttachments" :key="i">
                      <div class="d-flex justify-center align-center h-100">
                        <v-img
                          v-if="!isVideo(attachment.path)"
                          :src="attachment.path"
                          height="300"
                          contain
                          class="rounded"
                        ></v-img>
                        <video
                          v-else
                          :src="attachment.path"
                          controls
                          class="rounded"
                          style="max-height: 300px; max-width: 100%"
                        ></video>
                      </div>
                    </v-carousel-item>
                  </v-carousel>

                  <!-- مؤشر الصور المصغر -->
                  <div class="d-flex justify-center mt-2 gap-2 flex-wrap">
                    <div
                      v-for="(attachment, index) in selectedHallAttachments"
                      :key="index"
                      class="thumbnail"
                      :class="{ 'thumbnail-active': currentImageIndex === index }"
                      @click="currentImageIndex = index"
                    >
                      <v-img
                        v-if="!isVideo(attachment.path)"
                        :src="attachment.path"
                        width="50"
                        height="50"
                        cover
                        class="rounded"
                      ></v-img>
                      <div v-else class="video-thumbnail rounded">
                        <v-icon color="white" size="24">mdi-play</v-icon>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- صورة افتراضية إذا لم يكن هناك مرفقات -->
                <v-img
                  v-else
                  src="/placeholder-hall.jpg"
                  height="200"
                  cover
                  class="rounded mb-4"
                ></v-img>
              </v-col>

              <v-col cols="12">
                <div class="text-h6 mb-2">معلومات القاعة</div>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="mb-2">
                      <strong>رقم الهاتف:</strong> {{ selectedHall.phoneNumber || 'غير محدد' }}
                    </div>
                    <div class="mb-2">
                      <strong>العنوان:</strong> {{ selectedHall.address || 'غير محدد' }}
                    </div>
                    <div class="mb-2">
                      <strong>الموقع:</strong> {{ selectedHall.location || 'غير محدد' }}
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="mb-2">
                      <strong>خط العرض:</strong> {{ selectedHall.latitude || 'غير محدد' }}
                    </div>
                    <div class="mb-2">
                      <strong>خط الطول:</strong> {{ selectedHall.longitude || 'غير محدد' }}
                    </div>
                    <div class="mb-2">
                      <strong>الحالة:</strong>
                      <v-chip
                        :color="getStatusColor(selectedHall.status)"
                        size="small"
                        class="ml-1"
                      >
                        {{ getStatusText(selectedHall.status) }}
                      </v-chip>
                    </div>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>
      <!-- Hall logo Dialog -->
      <v-dialog v-model="showAddLogoDialog" max-width="600">
        <v-card>
          <v-card-title>إضافة شعار للقاعة</v-card-title>
          <v-card-text>
            <v-file-input
              v-model="logoFile"
              accept="image/*"
              label="اختر الشعار"
              prepend-icon="mdi-image"
              show-size
              clearable
            />
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="saveLogo">حفظ</v-btn>
            <v-btn text @click="showAddLogoDialog = false">إلغاء</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Hall Images Management Dialog -->
      <v-dialog v-model="showEditImageDialog" max-width="900px" scrollable>
        <v-card>
          <v-card-title class="text-h6">إدارة صور وفيديوهات القاعة</v-card-title>
          <v-card-text>
            <!-- Current Attachments -->
            <div class="mb-6">
              <h3 class="text-h6 mb-3">المرفقات الحالية</h3>
              <div v-if="hallAttachments.length === 0" class="text-center py-4 text-grey">
                لا توجد مرفقات للقاعة
              </div>
              <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div
                  v-for="attachment in hallAttachments"
                  :key="attachment.id"
                  class="relative group"
                >
                  <div class="relative overflow-hidden rounded-lg shadow-md">
                    <!-- عرض الصورة مباشرة من path -->
                    <v-img
                      :src="attachment.path"
                      aspect-ratio="1"
                      class="bg-grey-lighten-2"
                      cover
                    />
                    <div
                      class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <!-- <v-btn 
                        icon 
                        size="small" 
                        color="error"
                        @click="deleteAttachment(attachment.id)"
                        class="ma-1"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                      <v-btn 
                        icon 
                        size="small" 
                        color="primary"
                        @click="setAsPrimary(attachment.id)"
                        class="ma-1"
                        :title="attachment.isPrimary ? 'الصورة الأساسية' : 'تعيين كصورة أساسية'"
                      >
                        <v-icon>{{ attachment.isPrimary ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
                      </v-btn> -->
                    </div>
                  </div>
                  <div class="text-caption text-center mt-1 truncate">
                    {{ getFileNameFromPath(attachment.path) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Add New Attachments -->
            <h3 class="text-h6 mb-3">إضافة مرفقات جديدة</h3>
            <v-file-input
              v-model="newAttachments"
              label="اختر الصور أو الفيديوهات"
              accept="image/*,video/*"
              prepend-icon="mdi-paperclip"
              multiple
              chips
              counter
              show-size
              clearable
              class="mb-4"
            />

            <div v-if="newAttachments.length > 0" class="preview-grid mb-4">
              <div
                v-for="(file, index) in newAttachments"
                :key="index"
                class="preview-item relative"
              >
                <div class="preview-content">
                  <!-- معاينة الملفات الجديدة قبل الرفع -->
                  <v-img
                    v-if="file.type.includes('image')"
                    :src="getObjectURL(file)"
                    aspect-ratio="1"
                    class="bg-grey-lighten-2 rounded"
                    cover
                  />
                  <video
                    v-else-if="file.type.includes('video')"
                    :src="getObjectURL(file)"
                    class="w-full h-40 object-cover bg-grey-lighten-2 rounded"
                  ></video>
                  <div class="preview-overlay">
                    <v-btn icon size="x-small" color="error" @click="removeNewAttachment(index)">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </div>
                </div>
                <div class="text-caption text-center mt-1 truncate">{{ file.name }}</div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="uploadAttachments" :loading="uploading">
              حفظ المرفقات
            </v-btn>
            <v-btn text @click="showEditImageDialog = false">إغلاق</v-btn>
          </v-card-actions>
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
import type { Hall, ActivityType, HallCreate, HallAttachment } from '@/types'

const router = useRouter()

// Data
const halls = ref<Hall[]>([])
const activityTypes = ref<ActivityType[]>([])
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const search = ref('')
const statusFilter = ref<number | ''>('')
const typeFilter = ref('')
const logoFile = ref<File | null>(null)
const newAttachments = ref<File[]>([])
const hallAttachments = ref<HallAttachment[]>([])

// بيانات الكاروسيل
const selectedHallAttachments = ref<HallAttachment[]>([])
const currentImageIndex = ref(0)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalRecords = ref(0)

// Dialogs
const showCreateDialog = ref(false)
const showAddLogoDialog = ref(false)
const showDetailsDialog = ref(false)
const showEditImageDialog = ref(false)
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
    const response = await activityTypesAPI.getActivitys()
    activityTypes.value = response.data
  } catch (error) {
    console.error('Error fetching activity types:', error)
  }
}

// دالة جلب مرفقات القاعة
const fetchHallAttachments = async (hallId: string) => {
  try {
    const response = await hallsAPI.getHallAttachments(hallId)
    hallAttachments.value = response.data
  } catch (error) {
    console.error('Error fetching hall attachments:', error)
  }
}

// دالة للتحقق إذا كان المرفق فيديو
const isVideo = (path: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv']
  return videoExtensions.some((ext) => path.toLowerCase().endsWith(ext))
}

const getStatusColor = (status: number): string => {
  switch (status) {
    case 1:
      return 'success'
    case 2:
      return 'error'
    case 3:
      return 'warning'
    default:
      return 'grey'
  }
}

const getStatusText = (status: number): string => {
  switch (status) {
    case 1:
      return 'نشط'
    case 2:
      return 'محظور'
    case 3:
      return 'مغلق'
    default:
      return 'غير معروف'
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

const saveLogo = async () => {
  if (!editingHall.value || !logoFile.value) return
  try {
    await hallsAPI.uploadHallImage(editingHall.value.id, logoFile.value)
    showAddLogoDialog.value = false
    logoFile.value = null
    fetchHalls(currentPage.value)
  } catch (error) {
    console.error('Error uploading hall logo:', error)
  }
}

const manageHallImages = async (hall: Hall) => {
  editingHall.value = hall
  await fetchHallAttachments(hall.id)
  showEditImageDialog.value = true
}

const addHallLogo = (hall: Hall) => {
  editingHall.value = hall
  showAddLogoDialog.value = true
}

// دالة لاستخراج اسم الملف من المسار
const getFileNameFromPath = (path: string) => {
  return path.split('/').pop() || 'صورة القاعة'
}

// دالة لإنشاء Object URL للملفات الجديدة (للمعاينة فقط)
const getObjectURL = (file: File) => {
  return URL.createObjectURL(file)
}

// دالة رفع المرفقات الجديدة
const uploadAttachments = async () => {
  if (!editingHall.value || newAttachments.value.length === 0) return

  try {
    uploading.value = true
    const formData = new FormData()

    // استخدام 'files' بدلاً من 'attachments' كما في الـ cURL الناجح
    newAttachments.value.forEach((file) => {
      formData.append('files', file) // تغيير من 'attachments' إلى 'files'
    })

    await hallsAPI.uploadAttachments(editingHall.value.id, formData)

    await fetchHallAttachments(editingHall.value.id)
    newAttachments.value = []
  } catch (error) {
    console.error('Error uploading attachments:', error)
  } finally {
    uploading.value = false
  }
}

const removeNewAttachment = (index: number) => {
  newAttachments.value.splice(index, 1)
}

// عدل دالة viewHall
const viewHall = async (hall: Hall) => {
  selectedHall.value = hall
  try {
    const response = await hallsAPI.getHallAttachments(hall.id)
    selectedHallAttachments.value = response.data
    currentImageIndex.value = 0
  } catch (error) {
    console.error('Error fetching hall attachments:', error)
    selectedHallAttachments.value = []
  }
  showDetailsDialog.value = true
}

const editHall = (hall: Hall) => {
  editingHall.value = hall
  Object.assign(hallForm, hall)
  showCreateDialog.value = true
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

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.preview-item {
  position: relative;
}

.preview-content {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  height: 120px;
}

.preview-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-item:hover .preview-overlay {
  opacity: 1;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.md\:grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.relative {
  position: relative;
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.transition-opacity {
  transition: opacity 0.2s;
}

.thumbnail {
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;
  border-radius: 4px;
  overflow: hidden;
}

.thumbnail-active {
  border-color: #1976d2;
}

.video-thumbnail {
  width: 50px;
  height: 50px;
  background-color: #424242;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.gap-2 {
  gap: 8px;
}
</style>
