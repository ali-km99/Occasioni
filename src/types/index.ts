// User interfaces
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'user'
  phone?: string
  address?: string
  status: 'active' | 'blocked'
  avatar?: string
  preferences?: {
    language: string
    timezone: string
    notifications: boolean
  }
}

export interface UserCreate {
  name: string
  email: string
  password: string
  role: string
  phone?: string
  address?: string
}

export interface UserUpdate extends Partial<UserCreate> {
  password?: string
}

// Hall interfaces
export interface Hall {
  id: string
  name: string
  phoneNumber: string
  latitude: number
  longitude: number
  address: string
  location: string
  typeOfActivityId: string
  typeOfActivityName: string
  path?: string
  createAt: string
  updatedAt?: string
  status: number // 1 = active, 3 = blocked
  images?: Array<{ url: string; id: string }>
  attachments?: Array<{ name: string; size: string; id: string }>
  users?: User[]
}

export interface HallCreate {
  name: string
  phoneNumber: string
  latitude: number
  longitude: number
  address: string
  location: string
  typeOfActivityId: string
}

export interface HallUpdate extends Partial<HallCreate> {}

// Activity Type interfaces
export interface ActivityType {
  id: string
  name: string
  createAt: string
  updatedAt?: string
  status: number // 1 = active, 3 = blocked
}

export interface ActivityTypeCreate {
  name: string
  status: number
}

export interface ActivityTypeUpdate extends Partial<ActivityTypeCreate> {}

// Reservation Type interfaces
export interface ReservationType {
  id: string
  name: string
  description?: string
  duration?: number
  maxCapacity?: number
  status: 'active' | 'blocked'
}

export interface ReservationTypeCreate {
  name: string
  description?: string
  duration?: number
  maxCapacity?: number
}

export interface ReservationTypeUpdate extends Partial<ReservationTypeCreate> {}

// Reservation interfaces
export interface Reservation {
  id: string
  hallId: string
  userId: string
  typeId: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'cancelled'
  hallName?: string
  userName?: string
  typeName?: string
}

// API Response interfaces
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  totalRecords: number
  data: T[]
  page?: number
  limit?: number
}

// Filter interfaces
export interface HallFilters {
  status?: number
  typeOfActivityId?: string
  search?: string
  page?: number
  limit?: number
}

export interface UserFilters {
  role?: string
  status?: string
  search?: string
}
