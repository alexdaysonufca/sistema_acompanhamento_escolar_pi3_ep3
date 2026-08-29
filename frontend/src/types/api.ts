/**
 * Tipos e Contratos da API REST do TrAcEs
 * Correspondência estrita com o Manual de Engenharia (EP2_ARQUITETURA.md)
 */

export type UserRole = "PARENT" | "TEACHER" | "ADMIN";

export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  dependents?: number[];
  subjects?: string[];
}

export interface AuthResponse {
  token: string;
  user: UserSession;
}

export interface ParentDependentSummary {
  student_id: number;
  name: string;
  registration: string;
  email: string;
  classroom: string;
  shift: string;
  average_grade: number;
  attendance_rate: number;
  total_absences: number;
  alerts: {
    critical_attendance: boolean;
    low_grades: boolean;
  };
}

export interface BimesterGrades {
  "1": number | null;
  "2": number | null;
  "3": number | null;
  "4": number | null;
}

export interface ReportCardSubjectItem {
  subject: string;
  teacher: string;
  bimester_grades: BimesterGrades;
  final_average: number | null;
  status: "Aprovado" | "Recuperação" | "Reprovado" | "Em Andamento" | "Incompleto";
}

export interface ReportCardResponse {
  student_id: number;
  student_name: string;
  registration: string;
  classroom: string;
  academic_year: number;
  report: ReportCardSubjectItem[];
}

export interface AssessmentDetailItem {
  id: number;
  assessment_id: number;
  seq_title?: string;
  title: string;
  original_title?: string;
  type: string;
  description: string;
  max_score: number;
  weight: number;
  score: number;
  status: "Aprovado" | "Recuperação" | "Reprovado";
  date: string | null;
}

export interface BimesterDetailItem {
  bimester: string;
  bimester_name: string;
  next_seq_title?: string;
  average: number | null;
  assessments: AssessmentDetailItem[];
}

export interface AddAssessmentPayload {
  student_id?: number;
  subject: string;
  bimester: string;
  academic_year?: number;
  title?: string;
  assessment_type?: string;
  weight?: number;
  score?: number;
  description?: string;
  graded_by?: string;
}

export interface DetailedAssessmentsResponse {
  student_id: number;
  student_name: string;
  subject: string;
  academic_year: number;
  annual_average: number | null;
  formula: string;
  bimesters: BimesterDetailItem[];
}

export interface CalendarDayItem {
  day: number;
  date: string;
  weekday: string;
  status: "PRESENT" | "ABSENT" | "JUSTIFIED_ABSENCE" | "NO_CLASS";
  is_weekend: boolean;
}

export interface JustificationItem {
  date: string;
  reason: string;
  status: "APROVADA" | "PENDENTE" | "REJEITADA";
}

export interface AttendanceCalendarResponse {
  student_id: number;
  student_name: string;
  subject: string;
  month: number;
  year: number;
  summary: {
    total_classes: number;
    presences: number;
    absences: number;
    justified_absences: number;
    attendance_rate: number;
    minimum_rate: number;
  };
  calendar: CalendarDayItem[];
  justifications: JustificationItem[];
}

export interface AnnouncementTag {
  label: string;
  color: string;
  bg?: string;
}

export interface AnnouncementItem {
  id: number;
  announcement_id?: number;
  title: string;
  content: string;
  category: "URGENT" | "GENERAL" | "EVENT" | "IMPORTANT";
  sender_role?: "COORDENACAO" | "DIRECAO" | "SECRETARIA" | "PROFESSOR";
  sender_name?: string;
  sender?: string;
  target_type?: "ALL" | "CLASSROOM" | "STUDENT";
  classroom_id?: number | null;
  student_id?: number | null;
  student_name?: string | null;
  student_registration?: string | null;
  classroom_name?: string | null;
  subject?: string | null;
  tags?: AnnouncementTag[];
  date_published: string;
  is_read: boolean;
  read_at?: string | null;
  created_at?: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  category?: "URGENT" | "GENERAL" | "EVENT" | "IMPORTANT";
  sender_role?: "COORDENACAO" | "DIRECAO" | "SECRETARIA" | "PROFESSOR";
  sender_name?: string;
  target_type?: "ALL" | "CLASSROOM" | "STUDENT";
  classroom_id?: number | null;
  student_id?: number | null;
  subject?: string | null;
  tags?: AnnouncementTag[];
  date_published?: string;
}

export interface UpdateAnnouncementPayload {
  title?: string;
  content?: string;
  category?: "URGENT" | "GENERAL" | "EVENT" | "IMPORTANT";
  sender_role?: "COORDENACAO" | "DIRECAO" | "SECRETARIA" | "PROFESSOR";
  sender_name?: string;
  target_type?: "ALL" | "CLASSROOM" | "STUDENT";
  classroom_id?: number | null;
  student_id?: number | null;
  subject?: string | null;
  tags?: AnnouncementTag[];
  date_published?: string;
}

export interface StudentEnrolled {
  student_id: number;
  name: string;
  registration: string;
}

export interface ClassroomScope {
  classroom_id: number;
  name: string;
  year: string;
  identifier: string;
  shift: string;
  level: string;
  subjects: string[];
  students: StudentEnrolled[];
}

export interface BulkGradePayload {
  assessment_id?: number;
  subject?: string;
  bimester?: string;
  academic_year?: number;
  graded_by?: string;
  grades: {
    student_id: number;
    score: number;
  }[];
}

export interface BulkAttendancePayload {
  date: string;
  subject: string;
  classroom_id?: number;
  records: {
    student_id: number;
    is_present: boolean;
    justification?: string;
  }[];
}

export interface ScheduleException {
  id: string;
  date: string;
  type: "EXTRA" | "NO_CLASS";
  reason: string;
  lessonCount?: number;
}

export interface ClassScheduleConfig {
  classroomId: number;
  subject: string;
  bimester: string;
  academicYear: number;
  startDate: string;
  endDate: string;
  lessonDuration: number; // 40 | 45 | 50 | 60
  weeklyDays: number[]; // 1=Segunda .. 6=Sábado
  dailyLessons: {
    [dayOfWeek: number]: {
      lessonCount: number; // 1, 2, 3, etc.
      slotsText: string; // "1º tempo", "1º e 2º tempos", etc.
      startTime: string; // "07:30"
      endTime: string; // "09:10"
    };
  };
  exceptions: ScheduleException[];
}

