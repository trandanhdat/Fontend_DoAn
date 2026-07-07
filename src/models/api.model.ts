export interface SpecialtyResponseDto {
  id: number;
  name: string;
  description: string;
  iconUrl?: string;
  isActive: boolean;
}

export interface CreateSpecialtyDto {
  name: string;
  description: string;
  iconUrl?: string;
  isActive: boolean;
}

export interface SpecialtyDetailResponseDto extends SpecialtyResponseDto {
  services: ServiceResponseDto[];
}

export interface ServiceResponseDto {
  id: number;
  specialtyId: number;
  name: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface CreateServiceDto {
  specialtyId: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface DoctorDto {
  id: number;
  userId: number;
  specialtyId: number;
  specialtyName: string;
  fullName: string;
  avatarUrl?: string;
  licenseNumber?: string;
  bio?: string;
  degree: string;
  experienceYears: number;
  consultationFee: number;
  isActive: boolean;
  averageRating?: number;
  totalReviews?: number;
}

export interface UpdateDoctorDto {
  bio?: string;
  degree: string;
  experienceYears: number;
  consultationFee: number;
}

export interface CreateDoctorWithAccountDto {
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  specialtyId: number;
  licenseNumber?: string;
  yearsExperience?: number;
  bio?: string;
  degree?: string;
  consultationFee: number;
  isActive: boolean;
}

export interface CreateDoctorDto {
  userId: number;
  specialtyId: number;
  licenseNumber: string;
  yearsExperience: number;
  degree: string;
  bio?: string;
  consultationFee: number;
  isActive: boolean;
}


export interface TimeSlotDto {
  id: number;
  doctorId: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  status: 'Available' | 'Booked' | 'Blocked';
}

export interface DoctorScheduleDto {
  id: number;
  doctorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface ReviewDto {
  id: number;
  appointmentId: number;
  rating: number;
  comment: string;
  reviewerName: string;
  createdAt: string;
  editCount?: number;
  updatedAt?: string;
}

export interface UpdateReviewDto {
  rating: number;
  comment: string;
}

export interface CreateReviewDto {
  appointmentId: number;
  rating: number;
  comment: string;
}

export type ArticleStatus = 'Draft' | 'Pending' | 'Published' | 'Rejected';

export interface ArticleSummaryDto {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  thumbnailUrl?: string;
  authorName: string;
  specialtyName: string;
  viewCount: number;
  status: ArticleStatus;
  publishedAt?: string;
}

export interface ArticleDetailDto extends ArticleSummaryDto {
  content: string;
  specialtyId: number;
}

export interface CreateArticleDto {
  specialtyId: number;
  title: string;
  summary: string;
  content: string;
  thumbnailUrl?: string;
}

export interface UpdateArticleDto {
  specialtyId?: number;
  title?: string;
  summary?: string;
  content?: string;
  thumbnailUrl?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateAppointmentDto {
  doctorId?: number;
  timeSlotId?: number;
  specialtyId?: number;
  serviceId?: number;
  patientId: number;
  appointmentDate: string;
  startTime: string;
  reason?: string;
  notes?: string;
}

export interface AppointmentDto {
  id: number;
  patientId: number;
  patientName: string;
  patientPhone?: string;
  doctorId?: number;
  doctorName?: string;
  timeSlotId?: number;
  serviceId?: number;
  serviceName?: string;
  specialtyId?: number;
  specialtyName?: string;
  slotDate: string;
  startTime: string;
  endTime?: string;
  checkInTime?: string;
  status: string;
  paymentStatus: string;
  fee?: number;
  reason?: string;
}

export interface PatientDto {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
  avatarUrl?: string;
}

export interface UpdateProfileDto {
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  type?: string;
  data?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface PatientRecordSummaryDto {
  patientId: number;
  userId: number;
  fullName: string;
  avatarUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  patientCode?: string;
  totalVisits: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
}

export interface CreateMedicalRecordDto {
  appointmentId: number;
  diagnosis: string;
  treatment: string;
  symptoms?: string;
  notes?: string;
  attachments?: string;
  followUpDate?: string;
}

export interface MedicalRecordDto {
  id: number;
  appointmentId: number;
  patientId: number;
  doctorId: number;
  patientName: string;
  doctorName: string;
  serviceName?: string;
  appointmentDate: string;
  diagnosis: string;
  treatment: string;
  symptoms?: string;
  notes?: string;
  attachments?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleDto {
  doctorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  effectiveTo?: string;
}

// ─── ADMIN & DASHBOARD ────────────────────────────────────────────────────────
export interface DashboardSummaryDto {
  totalDoctors: number;
  totalPatients: number;
  upcomingAppointments: number;
  totalCompleted: number;
  totalCancelled: number;
  cancellationRate: number;
  totalRevenue: number;
}

export interface DailyCountDto {
  date: string; // "yyyy-MM-dd"
  count: number;
}

export interface TopDoctorDto {
  doctorId: number;
  name: string;
  avatarUrl?: string;
  specialtyName?: string;
  averageRating: number;
  reviewCount: number;
  totalAppointments: number;
}

export interface UserDetailDto {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: string;
  createdAt: string;
  roles: string[];
}

export interface AdminUpdateUserDto {
  fullName: string;
  phone: string;
  status: string;
}