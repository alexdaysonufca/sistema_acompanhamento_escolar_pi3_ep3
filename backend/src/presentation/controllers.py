"""
Controladores REST da aplicação TrAcEs.
Orquestram chamadas aos serviços e repositórios da Clean Architecture.
"""
from datetime import date, datetime
from typing import Dict, Any, List, Optional
import calendar

from src.domain.models import (
    Student, Teacher, Parent, Classroom, Assessment, Grade, Attendance,
    EducationLevel, Shift, AssessmentType, Bimester
)
from src.infrastructure.database import (
    get_database,
    StudentRepository,
    TeacherRepository,
    ParentRepository,
    ClassroomRepository,
    AssessmentRepository,
    GradeRepository,
    AttendanceRepository,
    AnnouncementRepository
)
from src.application.services import ServicosSecretaria, ServicosDoAluno


class AppContext:
    """Contêiner de Injeção de Dependências para os controladores."""

    def __init__(self, db_path: Optional[str] = None):
        self.db = get_database(db_path)
        self.student_repo = StudentRepository(self.db)
        self.teacher_repo = TeacherRepository(self.db)
        self.parent_repo = ParentRepository(self.db)
        self.classroom_repo = ClassroomRepository(self.db)
        self.assessment_repo = AssessmentRepository(self.db)
        self.grade_repo = GradeRepository(self.db)
        self.attendance_repo = AttendanceRepository(self.db)
        self.announcement_repo = AnnouncementRepository(self.db)

        self.sec_service = ServicosSecretaria(
            self.student_repo, self.classroom_repo, self.parent_repo
        )
        self.student_service = ServicosDoAluno(
            self.grade_repo, self.assessment_repo, self.student_repo, self.attendance_repo
        )


class AuthController:
    """Controlador de Autenticação e Sessão."""

    def __init__(self, ctx: AppContext):
        self.ctx = ctx

    def login(self, data: Dict[str, Any]) -> Dict[str, Any]:
        email = data.get("email", "").strip().lower()
        role = data.get("role", "PARENT").upper()

        if role == "TEACHER":
            teachers = self.ctx.teacher_repo.list_all()
            if email:
                teacher = next((t for t in teachers if t.email.lower() == email), None)
            else:
                teacher = teachers[0] if teachers else None
            
            if not teacher:
                return {"error": "Professor não encontrado", "code": 404}

            return {
                "token": f"jwt_mock_teacher_{teacher.id}",
                "user": {
                    "id": teacher.id,
                    "name": teacher.name,
                    "email": teacher.email,
                    "role": "TEACHER",
                    "subjects": teacher.subjects
                }
            }
        else:
            parents = self.ctx.parent_repo.list_all()
            if email:
                parent = next((p for p in parents if p.email.lower() == email), None)
            else:
                parent = parents[0] if parents else None

            if not parent:
                return {"error": "Responsável não encontrado", "code": 404}

            dependents_ids = self.ctx.parent_repo.get_students(parent.id)
            return {
                "token": f"jwt_mock_parent_{parent.id}",
                "user": {
                    "id": parent.id,
                    "name": parent.name,
                    "email": parent.email,
                    "role": "PARENT",
                    "dependents": dependents_ids
                }
            }


class ParentController:
    """Controlador de Acesso do Responsável."""

    def __init__(self, ctx: AppContext):
        self.ctx = ctx

    def get_dependents(self, parent_id: int) -> List[Dict[str, Any]]:
        student_ids = self.ctx.parent_repo.get_students(parent_id)
        result = []
        for sid in student_ids:
            student = self.ctx.student_repo.find_by_id(sid)
            if not student:
                continue

            # Buscar turma
            conn = self.ctx.db.get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT c.year, c.identifier, c.shift
                FROM classroom_enrollments ce
                JOIN classrooms c ON ce.classroom_id = c.classroom_id
                WHERE ce.student_id = ?
                ORDER BY ce.academic_year DESC LIMIT 1
            """, (sid,))
            c_row = cursor.fetchone()
            conn.close()

            classroom_name = f"{c_row['year']} {c_row['identifier']}" if c_row else "Turma A"
            shift_name = c_row['shift'] if c_row else "MANHA"

            # Calcular médias em todas as disciplinas
            subjects = ["Matemática", "Português", "História", "Ciências"]
            medias = []
            for subj in subjects:
                b = self.ctx.student_service.gerar_boletim(sid, subj, 2026)
                if b.media_anual is not None:
                    medias.append(b.media_anual)

            avg_grade = round(sum(medias) / len(medias), 2) if medias else 7.0

            # Calcular assiduidade (Março 2026)
            extrato = self.ctx.student_service.consultar_extrato(
                sid, "Matemática", date(2026, 3, 1), date(2026, 3, 31)
            )
            att_rate = extrato.percentual_presenca if extrato.total_aulas > 0 else 90.0
            faltas_count = extrato.faltas

            has_critical_attendance = att_rate < 75.0
            has_low_grades = avg_grade < 6.0

            result.append({
                "student_id": student.id,
                "name": student.name,
                "registration": student.registration,
                "email": student.email,
                "classroom": classroom_name,
                "shift": shift_name,
                "average_grade": avg_grade,
                "attendance_rate": att_rate,
                "total_absences": faltas_count,
                "alerts": {
                    "critical_attendance": has_critical_attendance,
                    "low_grades": has_low_grades
                }
            })
        return result

    def get_report_card(self, student_id: int, year: int = 2026) -> Dict[str, Any]:
        student = self.ctx.student_repo.find_by_id(student_id)
        if not student:
            return {"error": "Estudante não encontrado", "code": 404}

        # Buscar dados da turma
        conn = self.ctx.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.year, c.identifier
            FROM classroom_enrollments ce
            JOIN classrooms c ON ce.classroom_id = c.classroom_id
            WHERE ce.student_id = ?
            ORDER BY ce.academic_year DESC LIMIT 1
        """, (student_id,))
        c_row = cursor.fetchone()
        conn.close()
        classroom_name = f"{c_row['year']} {c_row['identifier']}" if c_row else "Turma"

        subjects = ["Matemática", "Português", "História", "Ciências", "Geografia", "Artes", "Educação Física", "Inglês"]
        report_rows = []

        for subj in subjects:
            boletim = self.ctx.student_service.gerar_boletim(student_id, subj, year)
            teacher_name = "Prof. Carlos Mendes" if subj in ["Matemática", "Português"] else "Profa. Patrícia Lima"
            
            # Buscar status detalhado
            status = boletim.situacao
            if status == "Incompleto" and boletim.media_anual is not None:
                if boletim.media_anual >= 6.0:
                    status = "Aprovado"
                elif boletim.media_anual >= 4.0:
                    status = "Recuperação"
                else:
                    status = "Reprovado"
            elif status == "Incompleto":
                status = "Em Andamento"

            report_rows.append({
                "subject": subj,
                "teacher": teacher_name,
                "bimester_grades": {
                    "1": boletim.media_1bim,
                    "2": boletim.media_2bim,
                    "3": boletim.media_3bim,
                    "4": boletim.media_4bim
                },
                "final_average": boletim.media_anual,
                "status": status
            })

        return {
            "student_id": student.id,
            "student_name": student.name,
            "registration": student.registration,
            "classroom": classroom_name,
            "academic_year": year,
            "report": report_rows
        }

    def get_detailed_assessments(self, student_id: int, subject: str = "Matemática", year: int = 2026) -> Dict[str, Any]:
        student = self.ctx.student_repo.find_by_id(student_id)
        if not student:
            return {"error": "Estudante não encontrado", "code": 404}

        bim_names = {
            Bimester.PRIMEIRO: "1º Bimestre",
            Bimester.SEGUNDO: "2º Bimestre",
            Bimester.TERCEIRO: "3º Bimestre",
            Bimester.QUARTO: "4º Bimestre"
        }

        bimesters_data = []
        for bim in [Bimester.PRIMEIRO, Bimester.SEGUNDO, Bimester.TERCEIRO, Bimester.QUARTO]:
            grades = self.ctx.grade_repo.find_by_student_and_bimester(student_id, subject, bim, year)
            items = []
            for idx, g in enumerate(grades):
                status = "Aprovado" if g.score >= 6.0 else ("Recuperação" if g.score >= 4.0 else "Reprovado")
                seq_title = f"Avaliação {idx + 1}"
                items.append({
                    "id": g.id,
                    "assessment_id": g.assessment.id if g.assessment else 0,
                    "seq_title": seq_title,
                    "title": seq_title,
                    "original_title": g.assessment.title if g.assessment else seq_title,
                    "type": g.assessment.assessment_type.value if g.assessment else "Prova",
                    "description": g.assessment.description if g.assessment else "",
                    "max_score": g.assessment.max_score if g.assessment else 10.0,
                    "weight": g.assessment.weight if g.assessment else 1.0,
                    "score": g.score,
                    "status": status,
                    "date": g.assessment.assessment_date.isoformat() if (g.assessment and g.assessment.assessment_date) else None
                })
            
            media_bim = self.ctx.student_service.calcular_media_bimestral(student_id, subject, bim, year)
            bimesters_data.append({
                "bimester": bim.value,
                "bimester_name": bim_names[bim],
                "next_seq_title": f"Avaliação {len(items) + 1}",
                "average": media_bim,
                "assessments": items
            })

        boletim = self.ctx.student_service.gerar_boletim(student_id, subject, year)

        return {
            "student_id": student.id,
            "student_name": student.name,
            "subject": subject,
            "academic_year": year,
            "annual_average": boletim.media_anual,
            "formula": "Σ(nota × peso) / Σ(peso)",
            "bimesters": bimesters_data
        }

    def get_attendance_calendar(self, student_id: int, subject: str = "Matemática", month: int = 3, year: int = 2026) -> Dict[str, Any]:
        student = self.ctx.student_repo.find_by_id(student_id)
        if not student:
            return {"error": "Estudante não encontrado", "code": 404}

        _, num_days = calendar.monthrange(year, month)
        start_d = date(year, month, 1)
        end_d = date(year, month, num_days)

        extrato = self.ctx.student_service.consultar_extrato(student_id, subject, start_d, end_d)
        attendances = self.ctx.attendance_repo.find_by_student_and_period(student_id, subject, start_d, end_d)
        att_map = {a.attendance_date.isoformat(): a for a in attendances if a.attendance_date}

        calendar_days = []
        justifications = []

        for d in range(1, num_days + 1):
            cur_date = date(year, month, d)
            iso_d = cur_date.isoformat()
            is_weekend = cur_date.weekday() >= 5

            if iso_d in att_map:
                att = att_map[iso_d]
                if att.is_present:
                    st = "PRESENT"
                elif att.justified:
                    st = "JUSTIFIED_ABSENCE"
                    justifications.append({
                        "date": iso_d,
                        "reason": att.justification or "Atestado médico",
                        "status": "APROVADA"
                    })
                else:
                    st = "ABSENT"
            else:
                st = "NO_CLASS" if is_weekend else "PRESENT"

            calendar_days.append({
                "day": d,
                "date": iso_d,
                "weekday": cur_date.strftime("%a"),
                "status": st,
                "is_weekend": is_weekend
            })

        return {
            "student_id": student.id,
            "student_name": student.name,
            "subject": subject,
            "month": month,
            "year": year,
            "summary": {
                "total_classes": max(extrato.total_aulas, 20),
                "presences": extrato.presencas if extrato.total_aulas > 0 else 18,
                "absences": extrato.faltas if extrato.total_aulas > 0 else 2,
                "justified_absences": extrato.faltas_justificadas,
                "attendance_rate": extrato.percentual_presenca if extrato.total_aulas > 0 else 90.0,
                "minimum_rate": 75.0
            },
            "calendar": calendar_days,
            "justifications": justifications
        }

    def get_announcements(self, student_id: Optional[int] = None, parent_id: Optional[int] = None) -> List[Dict[str, Any]]:
        classroom_id = None
        if student_id:
            conn = self.ctx.db.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT classroom_id FROM classroom_enrollments WHERE student_id = ? AND status = 'ACTIVE' LIMIT 1", (student_id,))
            row = cursor.fetchone()
            if row:
                classroom_id = row['classroom_id']
            conn.close()

        announcements = self.ctx.announcement_repo.list_all(classroom_id=classroom_id, student_id=student_id)
        if not announcements:
            return [
                {
                    "id": 101,
                    "title": "IMPORTANTE: Reunião de Pais e Mestres do 1º Bimestre",
                    "content": "Prezados pais e responsáveis, convidamos todos para a Reunião Pedagógica Bimestral que ocorrerá no próximo sábado, às 09:00 no auditório da escola.",
                    "category": "URGENT",
                    "sender_role": "COORDENACAO",
                    "sender_name": "Profa. Regina Vasconcelos",
                    "sender": "Coordenação Pedagógica",
                    "target_type": "ALL",
                    "tags": [{"label": "Reunião de Pais", "color": "#1B4F8A", "bg": "#EEF2F7"}],
                    "date_published": "2026-06-20",
                    "is_read": False
                },
                {
                    "id": 102,
                    "title": "Campanha de Vacinação Escolar 2026",
                    "content": "A equipe de saúde municipal estará presente na escola para atualização das cadernetas de vacinação dos alunos do Fundamental II.",
                    "category": "EVENT",
                    "sender_role": "SECRETARIA",
                    "sender_name": "Fabiana Souza",
                    "sender": "Secretaria Escolar",
                    "target_type": "ALL",
                    "tags": [{"label": "Saúde / Vacinação", "color": "#059669", "bg": "#ECFDF5"}],
                    "date_published": "2026-06-15",
                    "is_read": False
                },
                {
                    "id": 103,
                    "title": "Início do Período de Recuperação Paralela",
                    "content": "Os plantões de dúvidas de Matemática e Português serão realizados nas terças e quintas-feiras no contraturno.",
                    "category": "GENERAL",
                    "sender_role": "PROFESSOR",
                    "sender_name": "Prof. Carlos Mendes",
                    "sender": "Prof. Carlos Mendes — Matemática (9º Ano A)",
                    "target_type": "CLASSROOM",
                    "classroom_id": 1,
                    "subject": "Matemática",
                    "tags": [{"label": "Recuperação Paralela", "color": "#D97706", "bg": "#FFFBEB"}],
                    "date_published": "2026-06-01",
                    "is_read": True
                }
            ]
        return announcements

    def mark_announcement_as_read(self, announcement_id: int) -> Dict[str, Any]:
        success = self.ctx.announcement_repo.mark_as_read(announcement_id)
        return {
            "status": "success" if success else "not_found",
            "announcement_id": announcement_id,
            "is_read": True,
            "message": "Aviso marcado como lido com sucesso."
        }


class TeacherController:
    """Controlador de Operações do Docente."""

    def __init__(self, ctx: AppContext):
        self.ctx = ctx

    def get_classes(self, teacher_id: int) -> List[Dict[str, Any]]:
        classrooms = self.ctx.classroom_repo.list_all()
        teacher = self.ctx.teacher_repo.find_by_id(teacher_id)
        subjects = teacher.subjects if teacher else ["Matemática", "Português"]

        result = []
        for c in classrooms:
            # Buscar estudantes matriculados
            conn = self.ctx.db.get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT s.student_id, s.name, s.registration
                FROM classroom_enrollments ce
                JOIN students s ON ce.student_id = s.student_id
                WHERE ce.classroom_id = ? AND s.active = 1
                ORDER BY s.name
            """, (c.id,))
            students = [{"student_id": r['student_id'], "name": r['name'], "registration": r['registration']} for r in cursor.fetchall()]
            conn.close()

            result.append({
                "classroom_id": c.id,
                "name": f"{c.year} {c.identifier} - {c.shift.value.capitalize()}",
                "year": c.year,
                "identifier": c.identifier,
                "shift": c.shift.value,
                "level": c.level.value,
                "subjects": subjects,
                "students": students
            })
        return result

    def bulk_save_grades(self, data: Dict[str, Any]) -> Dict[str, Any]:
        assessment_id = data.get("assessment_id")
        subject = data.get("subject")
        bimester_str = data.get("bimester")
        year = int(data.get("academic_year", 2026))
        graded_by = data.get("graded_by", "Docente")
        grades_list = data.get("grades", [])

        # Se assessment_id não for informado, busca ou cria automaticamente pelo subject e bimester
        if not assessment_id and (subject or bimester_str):
            subj_val = subject or "Matemática"
            bimester_map = {
                "1": Bimester.PRIMEIRO, "PRIMEIRO": Bimester.PRIMEIRO, "1º BIMESTRE": Bimester.PRIMEIRO, "1º BIM": Bimester.PRIMEIRO,
                "2": Bimester.SEGUNDO, "SEGUNDO": Bimester.SEGUNDO, "2º BIMESTRE": Bimester.SEGUNDO, "2º BIM": Bimester.SEGUNDO,
                "3": Bimester.TERCEIRO, "TERCEIRO": Bimester.TERCEIRO, "3º BIMESTRE": Bimester.TERCEIRO, "3º BIM": Bimester.TERCEIRO,
                "4": Bimester.QUARTO, "QUARTO": Bimester.QUARTO, "4º BIMESTRE": Bimester.QUARTO, "4º BIM": Bimester.QUARTO,
            }
            bim_enum = bimester_map.get(str(bimester_str or "1").strip().upper(), Bimester.PRIMEIRO)

            conn = self.ctx.db.get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT assessment_id FROM assessments
                WHERE subject = ? AND bimester = ? AND academic_year = ?
                ORDER BY assessment_id ASC LIMIT 1
            """, (subj_val, bim_enum.value, year))
            row = cursor.fetchone()
            conn.close()

            if row:
                assessment_id = row['assessment_id']
            else:
                bim_names = {
                    Bimester.PRIMEIRO: "1º Bimestre",
                    Bimester.SEGUNDO: "2º Bimestre",
                    Bimester.TERCEIRO: "3º Bimestre",
                    Bimester.QUARTO: "4º Bimestre"
                }
                new_av = Assessment(
                    title=f"Prova Bimestral ({bim_names.get(bim_enum, 'Bimestral')}) - {subj_val}",
                    subject=subj_val,
                    description=f"Avaliação regular de {subj_val} do {bim_names.get(bim_enum, '')}",
                    assessment_type=AssessmentType.PROVA,
                    max_score=10.0,
                    weight=2.0,
                    bimester=bim_enum,
                    academic_year=year,
                    assessment_date=datetime.now().date()
                )
                saved_av = self.ctx.assessment_repo.save(new_av)
                assessment_id = saved_av.id

        if not assessment_id:
            return {"error": "assessment_id ou (subject e bimester) são obrigatórios", "code": 400}

        saved_count = 0
        errors = []

        for item in grades_list:
            student_id = item.get("student_id")
            score = item.get("score")

            if score is None or not (0.0 <= float(score) <= 10.0):
                errors.append(f"Nota inválida ({score}) para estudante {student_id}. Deve estar entre 0.0 e 10.0.")
                continue

            try:
                existing = self.ctx.grade_repo.find_by_student_and_assessment(student_id, assessment_id)
                student = self.ctx.student_repo.find_by_id(student_id)
                assessment = self.ctx.assessment_repo.find_by_id(assessment_id)

                new_grade = Grade(
                    grade_id=existing.id if existing else None,
                    student=student,
                    assessment=assessment,
                    score=float(score),
                    graded_at=datetime.now(),
                    graded_by=graded_by
                )
                self.ctx.grade_repo.save(new_grade)
                saved_count += 1
            except Exception as e:
                errors.append(str(e))

        if errors and saved_count == 0:
            return {"error": "Falha ao salvar notas", "details": errors, "code": 400}

        return {
            "status": "success",
            "message": f"{saved_count} notas registradas e publicadas com sucesso!",
            "records_created": saved_count,
            "warnings": errors
        }

    def bulk_save_attendance(self, data: Dict[str, Any]) -> Dict[str, Any]:
        date_str = data.get("date")
        subject = data.get("subject", "Matemática")
        records = data.get("records", [])

        if not date_str:
            return {"error": "date é obrigatório", "code": 400}

        att_date = datetime.fromisoformat(date_str).date()
        saved_count = 0

        for r in records:
            student_id = r.get("student_id")
            is_present = bool(r.get("is_present", True))
            justification = r.get("justification")
            is_justified = bool(justification)

            student = self.ctx.student_repo.find_by_id(student_id)
            if not student:
                continue

            att = Attendance(
                student=student,
                subject=subject,
                attendance_date=att_date,
                is_present=is_present,
                justified=is_justified,
                justification=justification
            )
            self.ctx.attendance_repo.save(att)
            saved_count += 1

        return {
            "status": "success",
            "message": f"Chamada registrada com sucesso para o dia {date_str} ({saved_count} alunos processados).",
            "records_count": saved_count
        }

    def add_assessment(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria uma nova avaliação sequencial (Avaliação N) para a disciplina/bimestre."""
        subject = data.get("subject", "Matemática")
        bimester_str = data.get("bimester", "PRIMEIRO")
        year = int(data.get("academic_year", 2026))
        student_id = data.get("student_id")
        score = data.get("score")
        weight = float(data.get("weight", 1.0))
        graded_by = data.get("graded_by", "Docente")
        type_str = data.get("assessment_type", "TRABALHO").upper()
        custom_title = data.get("title")

        bimester_map = {
            "1": Bimester.PRIMEIRO, "PRIMEIRO": Bimester.PRIMEIRO, "1º BIMESTRE": Bimester.PRIMEIRO, "1º BIM": Bimester.PRIMEIRO,
            "2": Bimester.SEGUNDO, "SEGUNDO": Bimester.SEGUNDO, "2º BIMESTRE": Bimester.SEGUNDO, "2º BIM": Bimester.SEGUNDO,
            "3": Bimester.TERCEIRO, "TERCEIRO": Bimester.TERCEIRO, "3º BIMESTRE": Bimester.TERCEIRO, "3º BIM": Bimester.TERCEIRO,
            "4": Bimester.QUARTO, "QUARTO": Bimester.QUARTO, "4º BIMESTRE": Bimester.QUARTO, "4º BIM": Bimester.QUARTO,
        }
        bim_enum = bimester_map.get(str(bimester_str).strip().upper(), Bimester.PRIMEIRO)

        type_map = {
            "PROVA": AssessmentType.PROVA,
            "TRABALHO": AssessmentType.TRABALHO,
            "SEMINARIO": AssessmentType.TRABALHO,
            "ATIVIDADE_PRATICA": AssessmentType.ATIVIDADE_PRATICA,
            "PROJETO": AssessmentType.TRABALHO,
        }
        ass_type = type_map.get(type_str, AssessmentType.TRABALHO)

        # Contar avaliações existentes para esse bimestre, disciplina e ano
        conn = self.ctx.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) as total FROM assessments
            WHERE subject = ? AND bimester = ? AND academic_year = ?
        """, (subject, bim_enum.value, year))
        count_row = cursor.fetchone()
        next_seq = (count_row['total'] if count_row else 0) + 1
        conn.close()

        seq_title = f"Avaliação {next_seq}"
        final_title = custom_title if custom_title else seq_title

        new_av = Assessment(
            title=final_title,
            subject=subject,
            description=data.get("description", f"{final_title} de {subject}"),
            assessment_type=ass_type,
            max_score=10.0,
            weight=weight,
            bimester=bim_enum,
            academic_year=year,
            assessment_date=datetime.now().date()
        )
        saved_av = self.ctx.assessment_repo.save(new_av)

        # Se nota inicial foi informada
        if student_id is not None and score is not None:
            student = self.ctx.student_repo.find_by_id(student_id)
            if student:
                new_grade = Grade(
                    student=student,
                    assessment=saved_av,
                    score=float(score),
                    graded_at=datetime.now(),
                    graded_by=graded_by
                )
                self.ctx.grade_repo.save(new_grade)

        return {
            "status": "success",
            "assessment_id": saved_av.id,
            "title": final_title,
            "seq_title": seq_title,
            "bimester": bim_enum.value,
            "weight": weight,
            "message": f"{final_title} criada com sucesso para o {bim_enum.value}º Bimestre!"
        }

    def get_assessments_by_scope(self, subject: str = "Matemática", bimester: Optional[str] = None, year: int = 2026) -> List[Dict[str, Any]]:
        """Retorna lista de avaliações por disciplina e bimestre com numeração sequencial."""
        conn = self.ctx.db.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT assessment_id, title, subject, description, assessment_type, max_score, weight, bimester, academic_year, assessment_date
            FROM assessments
            WHERE subject = ? AND academic_year = ?
        """
        params = [subject, year]
        if bimester and bimester.upper() != "CONSOLIDADO" and bimester.upper() != "TODAS":
            bimester_map = {
                "1": "PRIMEIRO", "1º BM": "PRIMEIRO", "1º BIMESTRE": "PRIMEIRO", "PRIMEIRO": "PRIMEIRO",
                "2": "SEGUNDO", "2º BM": "SEGUNDO", "2º BIMESTRE": "SEGUNDO", "SEGUNDO": "SEGUNDO",
                "3": "TERCEIRO", "3º BM": "TERCEIRO", "3º BIMESTRE": "TERCEIRO", "TERCEIRO": "TERCEIRO",
                "4": "QUARTO", "4º BM": "QUARTO", "4º BIMESTRE": "QUARTO", "QUARTO": "QUARTO",
            }
            bim_val = bimester_map.get(str(bimester).strip().upper(), bimester)
            query += " AND bimester = ?"
            params.append(bim_val)

        query += " ORDER BY assessment_id ASC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        bimester_counts: Dict[str, int] = {}
        result = []
        for r in rows:
            bim = r['bimester']
            bimester_counts[bim] = bimester_counts.get(bim, 0) + 1
            seq_num = bimester_counts[bim]
            result.append({
                "assessment_id": r['assessment_id'],
                "seq_title": f"Avaliação {seq_num}",
                "title": f"Avaliação {seq_num}",
                "original_title": r['title'],
                "subject": r['subject'],
                "description": r['description'] or "",
                "type": r['assessment_type'],
                "max_score": r['max_score'],
                "weight": r['weight'],
                "bimester": bim,
                "academic_year": r['academic_year'],
                "assessment_date": r['assessment_date']
            })
        return result

    def update_assessment(self, assessment_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza os dados de uma avaliação existente (título, tipo, peso, descrição)."""
        av = self.ctx.assessment_repo.find_by_id(assessment_id)
        if not av:
            return {"error": "Avaliação não encontrada", "code": 404}

        if "title" in data and data["title"]:
            av.title = data["title"]
        if "description" in data:
            av.description = data["description"]
        if "weight" in data:
            av.weight = float(data["weight"])
        if "max_score" in data:
            av.max_score = float(data["max_score"])
        if "assessment_type" in data and data["assessment_type"]:
            type_str = str(data["assessment_type"]).upper()
            type_map = {
                "PROVA": AssessmentType.PROVA,
                "TRABALHO": AssessmentType.TRABALHO,
                "ATIVIDADE_PRATICA": AssessmentType.ATIVIDADE_PRATICA,
                "ATIVIDADE PRÁTICA": AssessmentType.ATIVIDADE_PRATICA,
                "SEMINARIO": AssessmentType.SEMINARIO,
                "SEMINÁRIO": AssessmentType.SEMINARIO,
            }
            if type_str in type_map:
                av.assessment_type = type_map[type_str]

        updated_av = self.ctx.assessment_repo.save(av)
        return {
            "status": "success",
            "assessment_id": updated_av.id,
            "title": updated_av.title,
            "description": updated_av.description,
            "weight": updated_av.weight,
            "type": updated_av.assessment_type.value,
            "message": f"Avaliação '{updated_av.title}' atualizada com sucesso!"
        }

    def get_announcements(self, classroom_id: Optional[int] = None, teacher_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Retorna todos os avisos criados ou filtrados por turma."""
        return self.ctx.announcement_repo.list_all(classroom_id=classroom_id)

    def create_announcement(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cria um novo aviso com formatação estruturada de emissor, cargo e tags."""
        title = data.get("title", "").strip()
        if not title:
            return {"error": "Título do aviso é obrigatório", "code": 400}

        content = data.get("content", "").strip()
        category = data.get("category", "GENERAL")
        sender_role = data.get("sender_role", "PROFESSOR")
        sender_name = data.get("sender_name", "Prof. Carlos Mendes")
        target_type = data.get("target_type", "CLASSROOM")
        classroom_id = data.get("classroom_id")
        student_id = data.get("student_id")
        subject = data.get("subject", "Matemática")
        tags = data.get("tags", [])

        # Formatação padronizada do Emissor
        if sender_role == "COORDENACAO":
            sender = "Coordenação Pedagógica"
        elif sender_role == "DIRECAO":
            sender = "Direção Geral"
        elif sender_role == "SECRETARIA":
            sender = "Secretaria Escolar"
        else:
            turma_label = ""
            if classroom_id:
                cl = self.ctx.classroom_repo.find_by_id(classroom_id)
                if cl:
                    turma_label = f" ({cl.year} {cl.identifier})"
            elif target_type == "ALL":
                turma_label = " (Geral)"
            sender = f"{sender_name} — {subject}{turma_label}"

        announcement_payload = {
            "title": title,
            "content": content,
            "category": category,
            "sender_role": sender_role,
            "sender_name": sender_name,
            "sender": sender,
            "target_type": target_type,
            "classroom_id": classroom_id,
            "student_id": student_id,
            "subject": subject,
            "tags": tags,
            "date_published": data.get("date_published", datetime.now().strftime("%Y-%m-%d")),
            "is_read": False,
            "read_at": None
        }

        created = self.ctx.announcement_repo.save(announcement_payload)
        return {
            "status": "success",
            "message": "Aviso criado e publicado com sucesso no mural!",
            "announcement": created
        }

    def update_announcement(self, announcement_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza um aviso existente."""
        existing = self.ctx.announcement_repo.find_by_id(announcement_id)
        if not existing:
            return {"error": "Aviso não encontrado", "code": 404}

        title = data.get("title", existing["title"]).strip()
        content = data.get("content", existing["content"]).strip()
        category = data.get("category", existing["category"])
        sender_role = data.get("sender_role", existing["sender_role"])
        sender_name = data.get("sender_name", existing["sender_name"])
        target_type = data.get("target_type", existing["target_type"])
        classroom_id = data.get("classroom_id", existing["classroom_id"])
        student_id = data.get("student_id", existing["student_id"])
        subject = data.get("subject", existing["subject"])
        tags = data.get("tags", existing["tags"])

        if sender_role == "COORDENACAO":
            sender = "Coordenação Pedagógica"
        elif sender_role == "DIRECAO":
            sender = "Direção Geral"
        elif sender_role == "SECRETARIA":
            sender = "Secretaria Escolar"
        else:
            turma_label = ""
            if classroom_id:
                cl = self.ctx.classroom_repo.find_by_id(classroom_id)
                if cl:
                    turma_label = f" ({cl.year} {cl.identifier})"
            sender = f"{sender_name} — {subject}{turma_label}"

        update_payload = {
            "id": announcement_id,
            "title": title,
            "content": content,
            "category": category,
            "sender_role": sender_role,
            "sender_name": sender_name,
            "sender": sender,
            "target_type": target_type,
            "classroom_id": classroom_id,
            "student_id": student_id,
            "subject": subject,
            "tags": tags,
            "date_published": data.get("date_published", existing["date_published"]),
            "is_read": existing["is_read"],
            "read_at": existing["read_at"]
        }

        updated = self.ctx.announcement_repo.save(update_payload)
        return {
            "status": "success",
            "message": "Aviso atualizado com sucesso!",
            "announcement": updated
        }
