<template>
  <AppLayout>
    <div class="users-page">
      <v-row>
        <v-col cols="12">
          <div class="d-flex justify-space-between align-center mb-6">
            <h1 class="text-h3">إدارة المستخدمين</h1>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
              إضافة مستخدم جديد
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Search and Filters -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            label="البحث في المستخدمين..."
            prepend-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="roleFilter"
            label="الدور"
            :items="roleOptions"
            variant="outlined"
            density="compact"
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="statusFilter"
            label="الحالة"
            :items="statusOptions"
            variant="outlined"
            density="compact"
            clearable
          ></v-select>
        </v-col>
      </v-row>

      <!-- Users Table -->
      <v-card>
        <v-data-table
          :headers="headers"
          :items="filteredUsers"
          :loading="loading"
          :search="search"
          class="elevation-1"
        >
          <template v-slot:item.avatar="{ item }">
            <v-avatar size="40" v-if="item.avatar">
              <v-img :src="item.avatar" alt="صورة المستخدم"></v-img>
            </v-avatar>
            <v-avatar size="40" color="grey" v-else>
              <v-icon color="white">mdi-account</v-icon>
            </v-avatar>
          </template>

          <template v-slot:item.role="{ item }">
            <v-chip :color="getRoleColor(item.role)" size="small">
              {{ getRoleTitle(item.role) }}
            </v-chip>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip :color="item.status === 'active' ? 'success' : 'error'" size="small">
              {{ item.status === 'active' ? 'نشط' : 'محظور' }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="info"
              @click="viewUser(item)"
              title="عرض التفاصيل"
            ></v-btn>
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="warning"
              @click="editUser(item)"
              title="تعديل المستخدم"
            ></v-btn>
            <v-btn
              icon="mdi-block-helper"
              size="small"
              variant="text"
              :color="item.status === 'active' ? 'error' : 'success'"
              @click="toggleUserStatus(item)"
              :title="item.status === 'active' ? 'حظر المستخدم' : 'إلغاء حظر المستخدم'"
            ></v-btn>
          </template>
        </v-data-table>
      </v-card>

      <!-- Create/Edit User Dialog -->
      <v-dialog v-model="showCreateDialog" max-width="600">
        <v-card>
          <v-card-title>
            {{ editingUser ? 'تعديل المستخدم' : 'إنشاء مستخدم جديد' }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="saveUser" v-model="isValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="userForm.name"
                    label="الاسم الكامل"
                    :rules="[(v) => !!v || 'الاسم مطلوب']"
                    required
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="userForm.email"
                    label="البريد الإلكتروني"
                    type="email"
                    :rules="emailRules"
                    required
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" v-if="!editingUser">
                  <v-text-field
                    v-model="userForm.password"
                    label="كلمة المرور"
                    type="password"
                    :rules="passwordRules"
                    required
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="userForm.role"
                    label="الدور"
                    :items="roleOptions"
                    :rules="[(v) => !!v || 'الدور مطلوب']"
                    required
                    variant="outlined"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="userForm.phone"
                    label="رقم الهاتف"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="userForm.address"
                    label="العنوان"
                    variant="outlined"
                    rows="2"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="showCreateDialog = false"> إلغاء </v-btn>
            <v-btn color="primary" @click="saveUser" :loading="saving" :disabled="!isValid">
              {{ editingUser ? 'تحديث' : 'إنشاء' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- User Details Dialog -->
      <v-dialog v-model="showDetailsDialog" max-width="600">
        <v-card v-if="selectedUser">
          <v-card-title class="d-flex justify-space-between align-center">
            {{ selectedUser.name }}
            <v-btn icon="mdi-close" variant="text" @click="showDetailsDialog = false"></v-btn>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4" class="text-center">
                <v-avatar size="120" v-if="selectedUser.avatar">
                  <v-img :src="selectedUser.avatar" alt="صورة المستخدم"></v-img>
                </v-avatar>
                <v-avatar size="120" color="grey" v-else>
                  <v-icon color="white" size="64">mdi-account</v-icon>
                </v-avatar>
              </v-col>
              <v-col cols="12" md="8">
                <div class="text-h6 mb-3">معلومات المستخدم</div>
                <div class="mb-2"><strong>البريد الإلكتروني:</strong> {{ selectedUser.email }}</div>
                <div class="mb-2">
                  <strong>الدور:</strong>
                  <v-chip :color="getRoleColor(selectedUser.role)" size="small">
                    {{ getRoleTitle(selectedUser.role) }}
                  </v-chip>
                </div>
                <div class="mb-2">
                  <strong>الهاتف:</strong> {{ selectedUser.phone || 'غير محدد' }}
                </div>
                <div class="mb-2">
                  <strong>الحالة:</strong>
                  <v-chip
                    :color="selectedUser.status === 'active' ? 'success' : 'error'"
                    size="small"
                  >
                    {{ selectedUser.status === 'active' ? 'نشط' : 'محظور' }}
                  </v-chip>
                </div>
                <div class="mb-2"><strong>العنوان:</strong></div>
                <p class="text-body-2">{{ selectedUser.address || 'لا يوجد عنوان متاح' }}</p>
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
import { usersAPI } from '@/services/api'
import type { User, UserCreate } from '@/types'

const router = useRouter()

// Data
const users = ref<User[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

// Dialogs
const showCreateDialog = ref(false)
const showDetailsDialog = ref(false)
const editingUser = ref<User | null>(null)
const selectedUser = ref<User | null>(null)

// Form
const userForm = reactive<UserCreate>({
  name: '',
  email: '',
  password: '',
  role: 'user',
  phone: '',
  address: '',
})

const isValid = ref(false)

// Table headers
const headers = [
  { title: 'الصورة', key: 'avatar', sortable: false, align: 'center' as const },
  { title: 'الاسم', key: 'name', sortable: true, align: 'center' as const },
  { title: 'البريد الإلكتروني', key: 'username', sortable: true, align: 'center' as const },
  { title: 'الدور', key: 'isAdmin', sortable: true, align: 'center' as const },
  { title: 'الحالة', key: 'status', sortable: true, align: 'center' as const },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' as const },
]

// Filter options
const roleOptions = [
  { title: 'مدير', value: 'admin' },
  { title: 'مشرف', value: 'manager' },
  { title: 'مستخدم', value: 'user' },
]

const statusOptions = [
  { title: 'نشط', value: 'active' },
  { title: 'محظور', value: 'blocked' },
]

// Validation rules
const emailRules = [
  (v: string) => !!v || 'البريد الإلكتروني مطلوب',
  (v: string) => /.+@.+\..+/.test(v) || 'يجب أن يكون البريد الإلكتروني صحيحاً',
]

const passwordRules = [
  (v: string) => !!v || 'كلمة المرور مطلوبة',
  (v: string) => v.length >= 6 || 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
]

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  if (roleFilter.value) {
    filtered = filtered.filter((user) => user.role === roleFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter((user) => user.status === statusFilter.value)
  }

  return filtered
})

// Methods
const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await usersAPI.getAll()
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

const saveUser = async () => {
  try {
    saving.value = true

    if (editingUser.value) {
      await usersAPI.update(editingUser.value.id, userForm)
    } else {
      await usersAPI.create(userForm)
    }

    showCreateDialog.value = false
    resetForm()
    fetchUsers()
  } catch (error) {
    console.error('Error saving user:', error)
  } finally {
    saving.value = false
  }
}

const editUser = (user: User) => {
  editingUser.value = user
  Object.assign(userForm, {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    phone: user.phone || '',
    address: user.address || '',
  })
  showCreateDialog.value = true
}

const viewUser = (user: User) => {
  selectedUser.value = user
  showDetailsDialog.value = true
}

const toggleUserStatus = async (user: User) => {
  try {
    await usersAPI.block(user.id)
    fetchUsers()
  } catch (error) {
    console.error('Error toggling user status:', error)
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

const getRoleColor = (role: string) => {
  const colorMap: Record<string, string> = {
    admin: 'error',
    manager: 'warning',
    user: 'info',
  }
  return colorMap[role] || 'default'
}

const resetForm = () => {
  editingUser.value = null
  Object.assign(userForm, {
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    address: '',
  })
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-page {
  padding: 20px;
}
</style>
