/**
 * Cliente HTTP da API TrAcEs
 * Comunicação assíncrona com o backend Python REST (http://127.0.0.1:8000)
 */

import {
  AuthResponse,
  ParentDependentSummary,
  ReportCardResponse,
  DetailedAssessmentsResponse,
  AttendanceCalendarResponse,
  AnnouncementItem,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
  ClassroomScope,
  BulkGradePayload,
  BulkAttendancePayload,
} from "../types/api";

const API_BASE_URL = "/api";
const FALLBACK_BASE_URL = "http://127.0.0.1:8000/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const tryFetch = async (baseUrl: string): Promise<Response> => {
    const url = `${baseUrl}${endpoint}`;
    return fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
  };

  try {
    let res: Response;
    try {
      res = await tryFetch(API_BASE_URL);
    } catch {
      // Se /api falhar (ex: rodando sem proxy Vite), tenta URL direta do backend Python
      res = await tryFetch(FALLBACK_BASE_URL);
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || `Erro HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`[TrAcEs API Error] Falha na requisição para ${endpoint}:`, err.message);
    throw err;
  }
}

export const tracesApi = {
  // Autenticação
  login: async (email: string, role: "PARENT" | "TEACHER" = "PARENT"): Promise<AuthResponse> => {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  },

  // Responsável: Dependentes
  getDependents: async (parentId: number = 1): Promise<ParentDependentSummary[]> => {
    return request<ParentDependentSummary[]>(`/parent/dependents?parent_id=${parentId}`);
  },
  getParentDependents: async (parentId: number = 1): Promise<ParentDependentSummary[]> => {
    return request<ParentDependentSummary[]>(`/parent/dependents?parent_id=${parentId}`);
  },

  // Responsável: Boletim Escolar
  getReportCard: async (studentId: number, year: number = 2026): Promise<ReportCardResponse> => {
    return request<ReportCardResponse>(`/students/${studentId}/report-card?year=${year}`);
  },

  // Responsável: Notas Detalhadas
  getDetailedAssessments: async (
    studentId: number,
    subject: string = "Matemática",
    year: number = 2026
  ): Promise<DetailedAssessmentsResponse> => {
    return request<DetailedAssessmentsResponse>(
      `/students/${studentId}/assessments?subject=${encodeURIComponent(subject)}&year=${year}`
    );
  },

  // Responsável: Frequência e Calendário
  getAttendanceCalendar: async (
    studentId: number,
    subject: string = "Matemática",
    month: number = 3,
    year: number = 2026
  ): Promise<AttendanceCalendarResponse> => {
    return request<AttendanceCalendarResponse>(
      `/students/${studentId}/attendance?subject=${encodeURIComponent(subject)}&month=${month}&year=${year}`
    );
  },

  // Responsável: Mural de Avisos
  getAnnouncements: async (studentId?: number, parentId?: number): Promise<AnnouncementItem[]> => {
    const params = new URLSearchParams();
    if (studentId) params.append("student_id", String(studentId));
    if (parentId) params.append("parent_id", String(parentId));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request<AnnouncementItem[]>(`/parent/announcements${qs}`);
  },

  // Responsável: Marcar Aviso como Lido
  markAnnouncementAsRead: async (announcementId: number): Promise<{ status: string; is_read: boolean; message: string }> => {
    return request<{ status: string; is_read: boolean; message: string }>(
      `/parent/announcements/${announcementId}/read`,
      { method: "POST" }
    );
  },

  // Docente: Escopo de Turmas e Estudantes
  getTeacherClasses: async (teacherId: number = 1): Promise<ClassroomScope[]> => {
    return request<ClassroomScope[]>(`/teacher/classes?teacher_id=${teacherId}`);
  },

  // Docente: Listagem de Avaliações por Disciplina e Bimestre
  getAssessments: async (
    subject: string = "Matemática",
    bimester?: string,
    year: number = 2026
  ): Promise<AssessmentDetailItem[]> => {
    const qBim = bimester && bimester !== "Consolidado" && bimester !== "Todas" ? `&bimester=${encodeURIComponent(bimester)}` : "";
    return request<AssessmentDetailItem[]>(`/teacher/assessments?subject=${encodeURIComponent(subject)}&year=${year}${qBim}`);
  },

  // Docente: Listagem de Avisos e Comunicados da Turma
  getTeacherAnnouncements: async (classroomId?: number, teacherId?: number): Promise<AnnouncementItem[]> => {
    const params = new URLSearchParams();
    if (classroomId) params.append("classroom_id", String(classroomId));
    if (teacherId) params.append("teacher_id", String(teacherId));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request<AnnouncementItem[]>(`/teacher/announcements${qs}`);
  },

  // Docente: Criar Novo Aviso / Comunicado
  createAnnouncement: async (
    payload: CreateAnnouncementPayload
  ): Promise<{ status: string; message: string; announcement: AnnouncementItem }> => {
    return request<{ status: string; message: string; announcement: AnnouncementItem }>(
      "/teacher/announcements",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  // Docente: Editar Aviso Existente
  updateAnnouncement: async (
    announcementId: number,
    payload: UpdateAnnouncementPayload
  ): Promise<{ status: string; message: string; announcement: AnnouncementItem }> => {
    return request<{ status: string; message: string; announcement: AnnouncementItem }>(
      `/teacher/announcements/${announcementId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
  },

  // Docente: Lançamento de Notas em Lote
  saveBulkGrades: async (payload: BulkGradePayload): Promise<{ status: string; message: string }> => {
    return request<{ status: string; message: string }>("/teacher/grades/bulk", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Docente: Registro de Chamada em Lote
  saveBulkAttendance: async (
    payload: BulkAttendancePayload
  ): Promise<{ status: string; message: string }> => {
    return request<{ status: string; message: string }>("/teacher/attendance/bulk", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Docente / Sistema: Adicionar Nova Avaliação Sequencial
  addAssessment: async (
    payload: {
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
  ): Promise<{ status: string; assessment_id: number; title: string; message: string }> => {
    return request<{ status: string; assessment_id: number; title: string; message: string }>(
      "/teacher/assessments/add",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  // Docente / Sistema: Editar Avaliação Existente
  updateAssessment: async (
    assessmentId: number,
    payload: {
      title?: string;
      assessment_type?: string;
      weight?: number;
      description?: string;
      max_score?: number;
    }
  ): Promise<{ status: string; assessment_id: number; title: string; weight: number; type: string; message: string }> => {
    return request<{ status: string; assessment_id: number; title: string; weight: number; type: string; message: string }>(
      `/teacher/assessments/${assessmentId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
  },
};

