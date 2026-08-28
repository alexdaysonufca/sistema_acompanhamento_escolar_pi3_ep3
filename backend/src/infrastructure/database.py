"""Banco de dados e repositórios."""
import sqlite3
import json
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime, date

from src.domain.models import (
    Student, Teacher, Parent,
    Classroom, Assessment, Grade, Attendance,
    EducationLevel, Shift, AssessmentType, Bimester
)


# =============================================
# CONEXÃO COM O BANCO DE DADOS
# =============================================

class DatabaseManager:
    """Gerencia conexões e inicialização do banco SQLite."""

    def __init__(self, db_path: Optional[str] = None):
        if db_path:
            self.db_path = Path(db_path)
        else:
            base_dir = Path(__file__).parent
            self.db_path = base_dir / "school.db"
        self.db_path.parent.mkdir(parents=True, exist_ok=True)

    def get_connection(self) -> sqlite3.Connection:
        """Retorna uma nova conexão com o banco."""
        conn = sqlite3.connect(str(self.db_path), timeout=30.0)
        conn.execute("PRAGMA foreign_keys = ON")
        conn.row_factory = sqlite3.Row
        return conn

    def initialize_database(self) -> bool:
        """Inicializa o banco executando schema.sql."""
        print("\n=== INICIALIZANDO BANCO DE DADOS ===\n")

        schema_file = Path(__file__).parent / "schema.sql"

        if not schema_file.exists():
            print(f"❌ Erro: schema.sql não encontrado em {schema_file}")
            return False

        try:
            with open(schema_file, 'r', encoding='utf-8') as f:
                schema_sql = f.read()

            conn = self.get_connection()
            conn.executescript(schema_sql)
            conn.commit()
            conn.close()

            print(f"✅ Schema criado com sucesso!")
            print(f"   Arquivo: {self.db_path}")
            self._show_tables()
            return True

        except Exception as e:
            print(f"❌ Erro ao inicializar banco: {e}")
            return False

    def _show_tables(self):
        """Mostra lista de tabelas criadas."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        """)
        tables = [row['name'] for row in cursor.fetchall()]
        conn.close()
        print(f"\n📊 Tabelas criadas ({len(tables)}):")
        for table in tables:
            print(f"   • {table}")

    def reset_database(self):
        """Remove o arquivo do banco de dados."""
        if self.db_path.exists():
            self.db_path.unlink()
            print(f"🗑️  Banco removido: {self.db_path}")
        else:
            print("⚠️  Banco não existe")

_db_instance = None


def get_database(db_path: Optional[str] = None) -> DatabaseManager:
    """Retorna sempre a mesma instância do banco (evita recriar conexão)."""
    global _db_instance
    if _db_instance is None:
        _db_instance = DatabaseManager(db_path)
    return _db_instance


# =============================================
# REPOSITÓRIOS
# =============================================

class StudentRepository:
    """Repositório de Alunos."""

    def __init__(self, db_manager):
        self.db_manager = db_manager

    def save(self, student: Student) -> Student:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        if student.id:
            cursor.execute("""
                UPDATE students SET name = ?, registration = ?, email = ?, active = ?
                WHERE student_id = ?
            """, (student.name, student.registration,
                  student.email, 1 if student.active else 0, student.id))
            if cursor.rowcount == 0:
                cursor.execute("""
                    INSERT INTO students (student_id, name, registration, email, active)
                    VALUES (?, ?, ?, ?, ?)
                """, (student.id, student.name, student.registration,
                      student.email, 1 if student.active else 0))
        else:
            cursor.execute("""
                INSERT INTO students (name, registration, email, active)
                VALUES (?, ?, ?, ?)
            """, (student.name, student.registration,
                  student.email, 1 if student.active else 0))
            student.id = cursor.lastrowid
        conn.commit()
        conn.close()
        return student

    def find_by_id(self, student_id: int) -> Optional[Student]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT student_id, name, registration, email, active FROM students WHERE student_id = ?",
            (student_id,)
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return Student(
                student_id=row['student_id'],
                name=row['name'],
                registration=row['registration'],
                email=row['email'],
                active=bool(row['active'])
            )
        return None

    def list_all(self) -> List[Student]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT student_id, name, registration, email, active FROM students WHERE active = 1 ORDER BY name")
        rows = cursor.fetchall()
        conn.close()
        return [
            Student(student_id=r['student_id'], name=r['name'],
                    registration=r['registration'], email=r['email'], active=bool(r['active']))
            for r in rows
        ]

    def delete(self, student_id: int) -> bool:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM students WHERE student_id = ?", (student_id,))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted


class TeacherRepository:
    """Repositório de Professores."""

    def __init__(self, db_manager):
        self.db_manager = db_manager

    def save(self, teacher: Teacher) -> Teacher:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        if teacher.id:
            cursor.execute("""
                INSERT OR REPLACE INTO teachers (teacher_id, name, email)
                VALUES (?, ?, ?)
            """, (teacher.id, teacher.name, teacher.email))
        else:
            cursor.execute("""
                INSERT INTO teachers (name, email)
                VALUES (?, ?)
            """, (teacher.name, teacher.email))
            teacher.id = cursor.lastrowid

        cursor.execute("DELETE FROM teacher_subjects WHERE teacher_id = ?", (teacher.id,))
        for subject in teacher.subjects:
            cursor.execute(
                "INSERT INTO teacher_subjects (teacher_id, subject) VALUES (?, ?)",
                (teacher.id, subject)
            )
        conn.commit()
        conn.close()
        return teacher

    def find_by_id(self, teacher_id: int) -> Optional[Teacher]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT teacher_id, name, email FROM teachers WHERE teacher_id = ?", (teacher_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        cursor.execute("SELECT subject FROM teacher_subjects WHERE teacher_id = ?", (teacher_id,))
        subjects = [r['subject'] for r in cursor.fetchall()]
        conn.close()
        return Teacher(
            teacher_id=row['teacher_id'],
            name=row['name'], email=row['email'],
            subjects=subjects
        )

    def list_all(self) -> List[Teacher]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT teacher_id, name, email FROM teachers ORDER BY name")
        teachers = []
        for row in cursor.fetchall():
            cursor.execute("SELECT subject FROM teacher_subjects WHERE teacher_id = ?", (row['teacher_id'],))
            subjects = [r['subject'] for r in cursor.fetchall()]
            teachers.append(Teacher(
                teacher_id=row['teacher_id'],
                name=row['name'], email=row['email'],
                subjects=subjects
            ))
        conn.close()
        return teachers


class ParentRepository:
    """Repositório de Responsáveis."""

    def __init__(self, db_manager):
        self.db_manager = db_manager

    def save(self, parent: Parent) -> Parent:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        if parent.id:
            cursor.execute("""
                INSERT OR REPLACE INTO parents (parent_id, name, email, cpf)
                VALUES (?, ?, ?, ?)
            """, (parent.id, parent.name, parent.email, parent.cpf))
        else:
            cursor.execute("""
                INSERT INTO parents (name, email, cpf)
                VALUES (?, ?, ?)
            """, (parent.name, parent.email, parent.cpf))
            parent.id = cursor.lastrowid
        conn.commit()
        conn.close()
        return parent

    def find_by_id(self, parent_id: int) -> Optional[Parent]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT parent_id, name, email, cpf FROM parents WHERE parent_id = ?", (parent_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return Parent(
                parent_id=row['parent_id'],
                name=row['name'], email=row['email'],
                cpf=row['cpf']
            )
        return None

    def list_all(self) -> List[Parent]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT parent_id, name, email, cpf FROM parents ORDER BY name")
        rows = cursor.fetchall()
        conn.close()
        return [
            Parent(parent_id=r['parent_id'], name=r['name'],
                   email=r['email'], cpf=r['cpf'])
            for r in rows
        ]

    def link_to_student(self, parent_id: int, student_id: int, relationship: str = "Responsável") -> bool:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO student_parent (student_id, parent_id, relationship_type)
                VALUES (?, ?, ?)
            """, (student_id, parent_id, relationship))
            conn.commit()
            conn.close()
            return True
        except sqlite3.IntegrityError:
            conn.close()
            return False

    def unlink_from_student(self, parent_id: int, student_id: int) -> bool:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM student_parent WHERE parent_id = ? AND student_id = ?",
            (parent_id, student_id)
        )
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted

    def get_students(self, parent_id: int) -> List[int]:
        """Retorna IDs dos alunos vinculados ao responsável."""
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT student_id FROM student_parent WHERE parent_id = ?",
            (parent_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [r['student_id'] for r in rows]

    def get_parents_by_student(self, student_id: int) -> List[int]:
        """Retorna IDs dos responsáveis vinculados ao aluno."""
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT parent_id FROM student_parent WHERE student_id = ?",
            (student_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [r['parent_id'] for r in rows]


class ClassroomRepository:
    """Repositório de Turmas."""

    def __init__(self, db_manager):
        self.db_manager = db_manager

    def save(self, classroom: Classroom) -> Classroom:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        if classroom.id:
            cursor.execute("""
                INSERT OR REPLACE INTO classrooms (classroom_id, year, identifier, shift, education_level, teacher_id)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (classroom.id, classroom.year, classroom.identifier,
                  classroom.shift.value, classroom.level.value,
                  classroom.teacher_id))
        else:
            cursor.execute("""
                INSERT INTO classrooms (year, identifier, shift, education_level, teacher_id)
                VALUES (?, ?, ?, ?, ?)
            """, (classroom.year, classroom.identifier,
                  classroom.shift.value, classroom.level.value,
                  classroom.teacher_id))
            classroom.id = cursor.lastrowid
        conn.commit()
        conn.close()
        return classroom

    def find_by_id(self, classroom_id: int) -> Optional[Classroom]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT classroom_id, year, identifier, shift, education_level, teacher_id FROM classrooms WHERE classroom_id = ?",
            (classroom_id,)
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return Classroom(
                classroom_id=row['classroom_id'],
                year=row['year'],
                identifier=row['identifier'],
                shift=Shift(row['shift']),
                level=EducationLevel(row['education_level'])
            )
        return None

    def add_student_to_classroom(self, classroom_id: int, student_id: int, academic_year: int):
        """Matricula estudante na turma (insere em classroom_enrollments)."""
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO classroom_enrollments (student_id, classroom_id, academic_year)
                VALUES (?, ?, ?)
            """, (student_id, classroom_id, academic_year))
            conn.commit()
        except sqlite3.IntegrityError:
            pass
        conn.close()

    def list_all(self) -> List[Classroom]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT classroom_id, year, identifier, shift, education_level, teacher_id FROM classrooms ORDER BY year, identifier")
        rows = cursor.fetchall()
        conn.close()
        return [
            Classroom(
                classroom_id=r['classroom_id'],
                year=r['year'], identifier=r['identifier'],
                shift=Shift(r['shift']),
                level=EducationLevel(r['education_level'])
            )
            for r in rows
        ]


class AssessmentRepository:
    """Repositório de Avaliações."""

    def __init__(self, db_manager):
        self.db_manager = db_manager

    def save(self, assessment: Assessment) -> Assessment:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        if assessment.id:
            cursor.execute("""
                UPDATE assessments SET
                    title = ?, subject = ?, description = ?, max_score = ?, weight = ?,
                    assessment_type = ?, bimester = ?, academic_year = ?, assessment_date = ?
                WHERE assessment_id = ?
            """, (assessment.title, assessment.subject,
                  assessment.description, float(assessment.max_score),
                  float(assessment.weight), assessment.assessment_type.value,
                  assessment.bimester.value, assessment.academic_year,
                  assessment.assessment_date.isoformat() if assessment.assessment_date else None,
                  assessment.id))
        else:
            cursor.execute("""
                INSERT INTO assessments (
                    title, subject, description, max_score, weight,
                    assessment_type, bimester, academic_year, assessment_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (assessment.title, assessment.subject,
                  assessment.description, float(assessment.max_score),
                  float(assessment.weight), assessment.assessment_type.value,
                  assessment.bimester.value, assessment.academic_year,
                  assessment.assessment_date.isoformat() if assessment.assessment_date else None))
            assessment.id = cursor.lastrowid
        conn.commit()
        conn.close()
        return assessment

    def find_by_id(self, assessment_id: int) -> Optional[Assessment]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT assessment_id, title, subject, description,
                   max_score, weight, assessment_type, bimester,
                   academic_year, assessment_date
            FROM assessments WHERE assessment_id = ?
        """, (assessment_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return Assessment(
                assessment_id=row['assessment_id'],
                title=row['title'],
                subject=row['subject'],
                description=row['description'] or "",
                max_score=float(row['max_score']),
                weight=float(row['weight']),
                assessment_type=AssessmentType(row['assessment_type']),
                bimester=Bimester(row['bimester']),
                academic_year=row['academic_year'],
                assessment_date=datetime.fromisoformat(row['assessment_date']).date() if row['assessment_date'] else None
            )
        return None

    def list_all(self) -> List[Assessment]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT assessment_id, title, subject, description,
                   max_score, weight, assessment_type, bimester,
                   academic_year, assessment_date
            FROM assessments ORDER BY assessment_date DESC
        """)
        rows = cursor.fetchall()
        conn.close()
        return [
            Assessment(
                assessment_id=r['assessment_id'],
                title=r['title'],
                subject=r['subject'],
                description=r['description'] or "",
                max_score=float(r['max_score']),
                weight=float(r['weight']),
                assessment_type=AssessmentType(r['assessment_type']),
                bimester=Bimester(r['bimester']),
                academic_year=r['academic_year'],
                assessment_date=datetime.fromisoformat(r['assessment_date']).date() if r['assessment_date'] else None
            )
            for r in rows
        ]


class GradeRepository:
    """Repositório de Notas."""

    def __init__(self, db_manager):
        self.db_manager = db_manager

    def save(self, grade: Grade) -> Grade:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        student_id = grade.student.id if grade.student else None
        assessment_id = grade.assessment.id if grade.assessment else None
        if grade.id:
            cursor.execute("""
                INSERT INTO grades (grade_id, student_id, assessment_id, score)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(student_id, assessment_id) DO UPDATE SET score = excluded.score
            """, (grade.id, student_id, assessment_id, float(grade.score)))
        else:
            cursor.execute("""
                INSERT INTO grades (student_id, assessment_id, score)
                VALUES (?, ?, ?)
                ON CONFLICT(student_id, assessment_id) DO UPDATE SET score = excluded.score
            """, (student_id, assessment_id, float(grade.score)))
            grade.id = cursor.lastrowid
        conn.commit()
        conn.close()
        return grade

    def find_by_student_and_assessment(self, student_id: int, assessment_id: int) -> Optional[Grade]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT grade_id, student_id, assessment_id, score FROM grades WHERE student_id = ? AND assessment_id = ?",
            (student_id, assessment_id)
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return Grade(grade_id=row['grade_id'], score=float(row['score']))
        return None

    def find_by_student_and_bimester(self, student_id: int, subject: str, bimester, year: int) -> List[Grade]:
        """Busca notas do aluno na disciplina/bimestre, com assessment populado (para peso)."""
        bim_value = bimester.value if hasattr(bimester, 'value') else str(bimester)

        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT g.grade_id, g.student_id, g.assessment_id, g.score,
                   a.title, a.subject, a.description, a.max_score, a.weight,
                   a.assessment_type, a.bimester, a.academic_year, a.assessment_date
            FROM grades g
            JOIN assessments a ON g.assessment_id = a.assessment_id
            WHERE g.student_id = ? AND a.subject = ? AND a.bimester = ? AND a.academic_year = ?
        """, (student_id, subject, bim_value, year))

        grades = []
        for row in cursor.fetchall():
            assessment = Assessment(
                assessment_id=row['assessment_id'],
                title=row['title'], subject=row['subject'],
                description=row['description'] or "",
                max_score=float(row['max_score']),
                weight=float(row['weight']),
                assessment_type=AssessmentType(row['assessment_type']),
                bimester=Bimester(row['bimester']),
                academic_year=row['academic_year'],
                assessment_date=datetime.fromisoformat(row['assessment_date']).date() if row['assessment_date'] else None
            )
            grade = Grade(
                grade_id=row['grade_id'],
                assessment=assessment,
                score=float(row['score'])
            )
            grades.append(grade)

        conn.close()
        return grades

    def list_all(self) -> List[Grade]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT grade_id, student_id, assessment_id, score FROM grades ORDER BY graded_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [Grade(grade_id=r['grade_id'], score=float(r['score'])) for r in rows]


class AttendanceRepository:
    """Repositório de Frequência."""

    def __init__(self, db_manager):
        self.db_manager = db_manager

    def save(self, attendance: Attendance) -> Attendance:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        student_id = attendance.student.id if attendance.student else None
        if attendance.id:
            cursor.execute("""
                INSERT INTO attendance (attendance_id, student_id, subject, attendance_date, is_present, is_justified, justification)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(student_id, subject, attendance_date) DO UPDATE SET
                    is_present = excluded.is_present, is_justified = excluded.is_justified,
                    justification = excluded.justification
            """, (attendance.id, student_id, attendance.subject,
                  attendance.attendance_date.isoformat() if attendance.attendance_date else None,
                  1 if attendance.is_present else 0,
                  1 if attendance.justified else 0,
                  attendance.justification))
        else:
            cursor.execute("""
                INSERT INTO attendance (student_id, subject, attendance_date, is_present, is_justified, justification)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(student_id, subject, attendance_date) DO UPDATE SET
                    is_present = excluded.is_present, is_justified = excluded.is_justified,
                    justification = excluded.justification
            """, (student_id, attendance.subject,
                  attendance.attendance_date.isoformat() if attendance.attendance_date else None,
                  1 if attendance.is_present else 0,
                  1 if attendance.justified else 0,
                  attendance.justification))
            attendance.id = cursor.lastrowid
        conn.commit()
        conn.close()
        return attendance

    def find_by_student_and_period(self, student_id: int, subject: str, start_date: date, end_date: date) -> List[Attendance]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT attendance_id, student_id, subject, attendance_date, is_present, is_justified, justification
            FROM attendance
            WHERE student_id = ? AND subject = ? AND attendance_date BETWEEN ? AND ?
            ORDER BY attendance_date
        """, (student_id, subject, start_date.isoformat(), end_date.isoformat()))
        rows = cursor.fetchall()
        conn.close()
        return [
            Attendance(
                attendance_id=r['attendance_id'],
                subject=r['subject'],
                attendance_date=datetime.fromisoformat(r['attendance_date']).date() if r['attendance_date'] else None,
                is_present=bool(r['is_present']),
                justified=bool(r['is_justified']),
                justification=r['justification']
            )
            for r in rows
        ]

    def list_all(self) -> List[Attendance]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT attendance_id, student_id, subject, attendance_date, is_present, is_justified, justification
            FROM attendance ORDER BY attendance_date DESC
        """)
        rows = cursor.fetchall()
        conn.close()
        return [
            Attendance(
                attendance_id=r['attendance_id'],
                subject=r['subject'],
                attendance_date=datetime.fromisoformat(r['attendance_date']).date() if r['attendance_date'] else None,
                is_present=bool(r['is_present']),
                justified=bool(r['is_justified']),
                justification=r['justification']
            )
            for r in rows
        ]


class AnnouncementRepository:
    """Repositório de Avisos e Comunicados."""

    def __init__(self, db_manager):
        self.db_manager = db_manager

    def save(self, announcement_data: Dict[str, Any]) -> Dict[str, Any]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()

        announcement_id = announcement_data.get("id") or announcement_data.get("announcement_id")
        title = announcement_data.get("title", "")
        content = announcement_data.get("content", "")
        category = announcement_data.get("category", "GENERAL")
        sender_role = announcement_data.get("sender_role", "PROFESSOR")
        sender_name = announcement_data.get("sender_name", "")
        sender = announcement_data.get("sender", "")
        target_type = announcement_data.get("target_type", "CLASSROOM")
        classroom_id = announcement_data.get("classroom_id")
        student_id = announcement_data.get("student_id")
        subject = announcement_data.get("subject")
        tags = announcement_data.get("tags")
        if isinstance(tags, (list, dict)):
            tags_str = json.dumps(tags, ensure_ascii=False)
        else:
            tags_str = tags or "[]"
        date_published = announcement_data.get("date_published", datetime.now().strftime("%Y-%m-%d"))
        is_read = 1 if announcement_data.get("is_read") else 0
        read_at = announcement_data.get("read_at")

        if announcement_id:
            cursor.execute("""
                UPDATE announcements
                SET title = ?, content = ?, category = ?, sender_role = ?, sender_name = ?, sender = ?,
                    target_type = ?, classroom_id = ?, student_id = ?, subject = ?, tags = ?,
                    date_published = ?, is_read = ?, read_at = ?
                WHERE announcement_id = ?
            """, (title, content, category, sender_role, sender_name, sender, target_type,
                  classroom_id, student_id, subject, tags_str, date_published, is_read, read_at, announcement_id))
        else:
            cursor.execute("""
                INSERT INTO announcements (
                    title, content, category, sender_role, sender_name, sender,
                    target_type, classroom_id, student_id, subject, tags,
                    date_published, is_read, read_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (title, content, category, sender_role, sender_name, sender, target_type,
                  classroom_id, student_id, subject, tags_str, date_published, is_read, read_at))
            announcement_id = cursor.lastrowid

        conn.commit()
        conn.close()
        return self.find_by_id(announcement_id)

    def find_by_id(self, announcement_id: int) -> Optional[Dict[str, Any]]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.announcement_id, a.title, a.content, a.category, a.sender_role, a.sender_name, a.sender,
                   a.target_type, a.classroom_id, a.student_id, a.subject, a.tags, a.date_published,
                   a.is_read, a.read_at, a.created_at,
                   s.name as student_name, s.registration as student_registration,
                   c.year || ' ' || c.identifier as classroom_name
            FROM announcements a
            LEFT JOIN students s ON a.student_id = s.student_id
            LEFT JOIN classrooms c ON a.classroom_id = c.classroom_id
            WHERE a.announcement_id = ?
        """, (announcement_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return self._row_to_dict(row)

    def list_all(self, classroom_id: Optional[int] = None, student_id: Optional[int] = None) -> List[Dict[str, Any]]:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()

        query = """
            SELECT a.announcement_id, a.title, a.content, a.category, a.sender_role, a.sender_name, a.sender,
                   a.target_type, a.classroom_id, a.student_id, a.subject, a.tags, a.date_published,
                   a.is_read, a.read_at, a.created_at,
                   s.name as student_name, s.registration as student_registration,
                   c.year || ' ' || c.identifier as classroom_name
            FROM announcements a
            LEFT JOIN students s ON a.student_id = s.student_id
            LEFT JOIN classrooms c ON a.classroom_id = c.classroom_id
        """
        params = []
        conditions = []
        if classroom_id is not None and student_id is not None:
            conditions.append("(a.target_type = 'ALL' OR (a.target_type = 'CLASSROOM' AND a.classroom_id = ?) OR (a.target_type = 'STUDENT' AND a.student_id = ?))")
            params.extend([classroom_id, student_id])
        elif classroom_id is not None:
            conditions.append("(a.target_type = 'ALL' OR a.classroom_id = ?)")
            params.append(classroom_id)
        elif student_id is not None:
            conditions.append("(a.target_type = 'ALL' OR a.student_id = ?)")
            params.append(student_id)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY a.date_published DESC, a.title COLLATE NOCASE ASC, a.announcement_id DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        return [self._row_to_dict(r) for r in rows]

    def mark_as_read(self, announcement_id: int) -> bool:
        conn = self.db_manager.get_connection()
        cursor = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            UPDATE announcements
            SET is_read = 1, read_at = ?
            WHERE announcement_id = ?
        """, (now_str, announcement_id))
        affected = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return affected

    def _row_to_dict(self, row) -> Dict[str, Any]:
        tags_raw = row['tags']
        tags_parsed = []
        if tags_raw:
            try:
                tags_parsed = json.loads(tags_raw)
            except Exception:
                tags_parsed = []
        return {
            "id": row['announcement_id'],
            "announcement_id": row['announcement_id'],
            "title": row['title'],
            "content": row['content'],
            "category": row['category'],
            "sender_role": row['sender_role'],
            "sender_name": row['sender_name'],
            "sender": row['sender'],
            "target_type": row['target_type'],
            "classroom_id": row['classroom_id'],
            "student_id": row['student_id'],
            "student_name": row['student_name'],
            "student_registration": row['student_registration'],
            "classroom_name": row['classroom_name'],
            "subject": row['subject'],
            "tags": tags_parsed,
            "date_published": row['date_published'],
            "is_read": bool(row['is_read']),
            "read_at": row['read_at'],
            "created_at": row['created_at']
        }

