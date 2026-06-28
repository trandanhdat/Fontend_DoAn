export type UserRole = "Admin" | "Doctor" | "Patient";

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  roles: UserRole[];
  doctorId?: number;
  patientId?: number;
}

export interface LoginResponse {
  accessToken: string;
  user: UserProfile;
}
