export type UserRole = 'ADMINISTRATION' | 'INSPECTION' | 'INSTRUCTOR' | 'STUDENT';

export interface InsfpUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone_number?: string | null;
  department?: string | null;
  created_at: string;
}

export interface Speciality {
  id: string;
  code: string;
  name?: string;
  name_ar?: string | null;
  name_fr?: string | null;
  description?: string | null;
  department?: string | null;
  training_type?: string | null;
  duration?: string | null;
  diploma?: string | null;
  conditions?: string | null;
  capacity?: number | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  student_id: string;
  student_name?: string;
  matricule?: string;
  class_name?: string;
  subject: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  context_type?: string;
  last_message?: string;
  unread_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: 'ADMINISTRATION' | 'STUDENT' | 'INSTRUCTOR';
  sender_name: string;
  body: string;
  attachment_url?: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  target_user_id?: string | null;
  target_role?: string;
  title: string;
  body: string;
  type: 'ANNOUNCEMENT' | 'PASSWORD_RESET' | 'ALERT' | 'JUSTIFICATION' | 'SYSTEM' | 'INFO';
  data_payload?: Record<string, any> | null;
  is_read: boolean;
  created_at: string;
}

export interface InsfpClass {
  id: string;
  code: string;
  name: string;
  speciality_id: string;
  speciality?: Speciality;
  semester: number;
  academic_year: string;
  capacity?: number;
  created_at: string;
}

export interface Student {
  id: string;
  matricule: string;
  first_name: string;
  last_name: string;
  birth_date?: string | null;
  phone_number?: string | null;
  email?: string | null;
  class_id?: string | null;
  class_name?: string | null;
  speciality_name?: string | null;
  attendance_rate?: number;
  total_absences?: number;
  unjustified_absences?: number;
  is_active: boolean;
  created_at: string;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  coefficient: number;
  total_hours: number;
  created_at: string;
}

export interface Session {
  id: string;
  class_id: string;
  class_name?: string;
  module_id: string;
  module_name?: string;
  instructor_id: string;
  instructor_name?: string;
  room?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  session_type: 'COURSE' | 'TD' | 'TP';
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  qr_token?: string | null;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  student_name?: string;
  matricule?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  scanned_at?: string | null;
  verification_method?: 'QR' | 'MANUAL' | 'BIOMETRIC';
  notes?: string | null;
  created_at: string;
}

export interface Justification {
  id: string;
  student_id: string;
  student_name?: string;
  matricule?: string;
  absence_date: string;
  reason: string;
  document_url?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  ai_audit_score?: number | null;
  ai_audit_summary?: string | null;
  created_at: string;
}

export interface AbsenceAlert {
  id: string;
  student_id: string;
  student_name?: string;
  matricule?: string;
  class_name?: string;
  alert_level: 'WARNING_3_DAYS' | 'CRITICAL_10_DAYS' | 'EXCLUSION_THRESHOLD';
  total_unjustified_hours: number;
  absence_percentage: number;
  is_resolved: boolean;
  notified_at?: string | null;
  created_at: string;
}

export interface AIRiskAssessment {
  id: string;
  student_id: string;
  dropout_risk_score: number;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  contributing_factors: string[];
  recommended_actions: string[];
  assessed_at: string;
}

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absencesToday: number;
  pendingJustifications: number;
  activeSessionsCount: number;
  criticalAlertsCount: number;
  overallAttendanceRate: number;
}
