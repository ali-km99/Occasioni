<template>
  <AppLayout>
    <div class="hall-details-page" v-if="hall">
      <v-row>
        <v-col cols="12">
          <div class="d-flex align-center mb-6">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              @click="$router.push('/halls')"
              class="mr-4"
            ></v-btn>
            <h1 class="text-h3">{{ hall.name }}</h1>
            <v-spacer></v-spacer>
            <v-btn color="warning" prepend-icon="mdi-pencil" @click="editMode = !editMode">
              {{ editMode ? 'إلغاء التعديل' : 'تعديل القاعة' }}
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <!-- Hall Information -->
        <v-col cols="12" md="8">
          <v-card class="mb-6">
            <v-card-title>معلومات القاعة</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="hall.name"
                    label="اسم القاعة"
                    :readonly="!editMode"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="hall.phoneNumber"
                    label="رقم الهاتف"
                    :readonly="!editMode"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="hall.latitude"
                    label="خط العرض"
                    type="number"
                    step="0.000001"
                    :readonly="!editMode"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="hall.longitude"
                    label="خط الطول"
                    type="number"
                    step="0.000001"
                    :readonly="!editMode"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="hall.address"
                    label="العنوان"
                    :readonly="!editMode"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="hall.location"
                    label="الموقع"
                    :readonly="!editMode"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
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

          <!-- Hall Images -->
          <v-card class="mb-6">
            <v-card-title class="d-flex justify-space-between align-center">
              صور القاعة
              <v-btn
                v-if="editMode"
                color="primary"
                prepend-icon="mdi-plus"
                @click="triggerImageInput"
              >
                إضافة صورة
              </v-btn>
            </v-card-title>
            <v-card-text>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleImageUpload"
              />

              <v-row>
                <v-col v-for="(image, index) in hall.images" :key="index" cols="12" sm="6" md="4">
                  <v-card>
                    <v-img :src="image.url" height="200" cover class="rounded"></v-img>
                    <v-card-actions v-if="editMode">
                      <v-btn color="error" variant="text" @click="removeImage(index)">
                        إزالة
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Hall Attachments -->
          <!-- <v-card class="mb-6">
            <v-card-title class="d-flex justify-space-between align-center">
              مرفقات القاعة
              <v-btn
                v-if="editMode"
                color="primary"
                prepend-icon="mdi-plus"
                @click="triggerAttachmentInput"
              >
                إضافة مرفق
              </v-btn>
            </v-card-title>
            <v-card-text>
              <input
                id="attachmentInput"
                type="file"
                multiple
                style="display: none"
                @change="handleAttachmentUpload"
              />

              <v-list>
                <v-list-item v-for="(attachment, index) in hall.attachments" :key="index">
                  <template v-slot:prepend>
                    <v-icon>mdi-file</v-icon>
                  </template>
                  <v-list-item-title>{{ attachment.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ attachment.size }}</v-list-item-subtitle>
                  <template v-slot:append>
                    <v-btn
                      v-if="editMode"
                      icon="mdi-delete"
                      variant="text"
                      color="error"
                      @click="removeAttachment(index)"
                    ></v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card> -->
        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" md="4">
          <!-- Status Card -->
          <v-card class="mb-6">
            <v-card-title>الحالة</v-card-title>
            <v-card-text>
              <v-chip :color="hall.status === 1 ? 'success' : 'error'" size="large" class="mb-4">
                {{ hall.status === 1 ? 'نشط' : 'محظور' }}
              </v-chip>

              <v-btn :color="hall.status === 1 ? 'error' : 'success'" block @click="toggleStatus">
                {{ hall.status === 1 ? 'حظر القاعة' : 'إلغاء حظر القاعة' }}
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Hall Users -->
          <v-card class="mb-6">
            <v-card-title class="d-flex justify-space-between align-center">
              مستخدمو القاعة
              <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddUserDialog = true">
                إضافة مستخدم
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item v-for="user in hallUsers" :key="user.id">
                  <template v-slot:prepend>
                    <v-avatar size="32">
                      <v-img v-if="user.avatar" :src="user.avatar"></v-img>
                      <v-icon v-else>mdi-account</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ user.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
                  <template v-slot:append>
                    <v-btn
                      icon="mdi-block-helper"
                      variant="text"
                      color="error"
                      @click="blockUser(user.id)"
                    ></v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Add User Dialog -->
      <v-dialog v-model="showAddUserDialog" max-width="400">
        <v-card>
          <v-card-title>إضافة مستخدم إلى القاعة</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedUserId"
              label="اختر المستخدم"
              :items="availableUsers"
              item-title="name"
              item-value="id"
              variant="outlined"
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="showAddUserDialog = false"> إلغاء </v-btn>
            <v-btn color="primary" @click="addUserToHall" :loading="addingUser">
              إضافة المستخدم
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { hallsAPI } from '@/services/api'
import type { Hall, User } from '@/types'

const route = useRoute()

// Data
const hall = ref<Hall | null>(null)
const hallUsers = ref<User[]>([])
const availableUsers = ref<User[]>([])
const editMode = ref(false)
const saving = ref(false)
const addingUser = ref(false)
const selectedUserId = ref('')
const showAddUserDialog = ref(false)

// Methods
const fetchHallDetails = async () => {
  try {
    const response = await hallsAPI.getById(route.params.id as string)
    hall.value = response.data
  } catch (error) {
    console.error('Error fetching hall details:', error)
  }
}

const fetchHallUsers = async () => {
  try {
    const response = await hallsAPI.getUsers(route.params.id as string)
    hallUsers.value = response.data
  } catch (error) {
    console.error('Error fetching hall users:', error)
  }
}

const saveChanges = async () => {
  if (!hall.value) return

  try {
    saving.value = true
    await hallsAPI.update(hall.value.id, hall.value)
    editMode.value = false
  } catch (error) {
    console.error('Error saving hall changes:', error)
  } finally {
    saving.value = false
  }
}

const toggleStatus = async () => {
  if (!hall.value) return

  try {
    await hallsAPI.block(hall.value.id, 2)
    await fetchHallDetails()
  } catch (error) {
    console.error('Error toggling hall status:', error)
  }
}

const handleImageUpload = async (event: Event) => {
  if (!hall.value) return

  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    try {
      await hallsAPI.uploadHallImage(hall.value.id, file)
      await fetchHallDetails()
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }
}

// const handleAttachmentUpload = async (event: Event) => {
//   if (!hall.value) return

//   const target = event.target as HTMLInputElement
//   const files = Array.from(target.files || [])
//   if (files.length > 0) {
//     try {
//       await hallsAPI.uploadAttachments(hall.value.id, files)
//       await fetchHallDetails()
//     } catch (error) {
//       console.error('Error uploading attachments:', error)
//     }
//   }
// }

const removeImage = (index: number) => {
  if (hall.value?.images) {
    hall.value.images.splice(index, 1)
  }
}

const removeAttachment = (index: number) => {
  if (hall.value?.attachments) {
    hall.value.attachments.splice(index, 1)
  }
}

const addUserToHall = async () => {
  if (!selectedUserId.value || !hall.value) return

  try {
    addingUser.value = true
    await hallsAPI.addUser(hall.value.id, selectedUserId.value)
    await fetchHallUsers()
    showAddUserDialog.value = false
    selectedUserId.value = ''
  } catch (error) {
    console.error('Error adding user to hall:', error)
  } finally {
    addingUser.value = false
  }
}

const blockUser = async (userId: string) => {
  try {
    await hallsAPI.blockUser(userId)
    await fetchHallUsers()
  } catch (error) {
    console.error('Error blocking user:', error)
  }
}

const triggerImageInput = () => {
  const input = document.getElementById('imageInput') as HTMLInputElement
  input?.click()
}

const triggerAttachmentInput = () => {
  const input = document.getElementById('attachmentInput') as HTMLInputElement
  input?.click()
}

onMounted(() => {
  fetchHallDetails()
  fetchHallUsers()
})
</script>

<style scoped>
.hall-details-page {
  padding: 20px;
}
</style>
