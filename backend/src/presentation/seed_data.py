import sys
import os

if sys.platform == "win32":
    if sys.stdout.encoding != "utf-8":
        reconfig = getattr(sys.stdout, "reconfigure", None)
        if reconfig:
            reconfig(encoding="utf-8")

from datetime import date, datetime
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


def seed_database(db_path: str = None) -> bool:
    """Popula o banco de dados com dados consistentes para o MVP."""
    db = get_database(db_path)
    db.reset_database()
    db.initialize_database()

    # Repositórios
    student_repo = StudentRepository(db)
    teacher_repo = TeacherRepository(db)
    parent_repo = ParentRepository(db)
    classroom_repo = ClassroomRepository(db)
    assessment_repo = AssessmentRepository(db)
    grade_repo = GradeRepository(db)
    attendance_repo = AttendanceRepository(db)

    # Serviços
    sec_service = ServicosSecretaria(student_repo, classroom_repo, parent_repo)
    student_service = ServicosDoAluno(grade_repo, assessment_repo, student_repo, attendance_repo)

    # 1. Criar Professores
    prof_carlos = Teacher(
        name="Prof. Carlos Mendes",
        email="carlos.mendes@escola.edu.br",
        subjects=["Matemática", "Português"]
    )
    prof_carlos = teacher_repo.save(prof_carlos)

    prof_patricia = Teacher(
        name="Profa. Patrícia Lima",
        email="patricia.lima@escola.edu.br",
        subjects=["História", "Ciências"]
    )
    prof_patricia = teacher_repo.save(prof_patricia)

    # 2. Criar Turmas
    turma_9a = Classroom(
        year="9º Ano",
        identifier="A",
        shift=Shift.MANHA,
        level=EducationLevel.FUNDAMENTAL_II,
        teacher_id=prof_carlos.id
    )
    turma_9a = classroom_repo.save(turma_9a)

    turma_6b = Classroom(
        year="6º Ano",
        identifier="B",
        shift=Shift.MANHA,
        level=EducationLevel.FUNDAMENTAL_II,
        teacher_id=prof_carlos.id
    )
    turma_6b = classroom_repo.save(turma_6b)

    # 3. Criar Estudantes
    joao = Student(
        name="João Silva Oliveira",
        registration="2024001",
        email="joao.silva@aluno.escola.edu.br",
        active=True
    )
    joao = student_repo.save(joao)

    ana = Student(
        name="Ana Silva Oliveira",
        registration="2024002",
        email="ana.silva@aluno.escola.edu.br",
        active=True
    )
    ana = student_repo.save(ana)

    pedro = Student(
        name="Pedro Costa Santos",
        registration="2024003",
        email="pedro.costa@aluno.escola.edu.br",
        active=True
    )
    pedro = student_repo.save(pedro)

    # 4. Matricular Estudantes nas Turmas
    sec_service.matricular_aluno(joao.id, turma_9a.id, 2026)
    sec_service.matricular_aluno(pedro.id, turma_9a.id, 2026)
    sec_service.matricular_aluno(ana.id, turma_6b.id, 2026)

    # 5. Criar Responsável e Vincular
    maria = Parent(
        name="Maria Silva Oliveira",
        email="maria.silva@email.com",
        cpf="123.456.789-09"
    )
    maria = parent_repo.save(maria)

    sec_service.vincular_responsavel(maria.id, joao.id, "Mãe")
    sec_service.vincular_responsavel(maria.id, ana.id, "Mãe")
    sec_service.vincular_responsavel(maria.id, pedro.id, "Tutora")

    # 6. Criar Avaliações para 2026 (1 Avaliação Bimestral Principal por Disciplina e Bimestre)
    # Matemática - 9º Ano
    av_mat_1bim = assessment_repo.save(Assessment(
        title="Prova Bimestral (1º Bimestre) - Matemática",
        subject="Matemática",
        description="Álgebra, Equações e Geometria",
        assessment_type=AssessmentType.PROVA,
        max_score=10.0,
        weight=1.0,
        bimester=Bimester.PRIMEIRO,
        academic_year=2026,
        assessment_date=date(2026, 3, 15)
    ))

    av_mat_2bim = assessment_repo.save(Assessment(
        title="Prova Bimestral (2º Bimestre) - Matemática",
        subject="Matemática",
        description="Funções e Gráficos",
        assessment_type=AssessmentType.PROVA,
        max_score=10.0,
        weight=1.0,
        bimester=Bimester.SEGUNDO,
        academic_year=2026,
        assessment_date=date(2026, 6, 10)
    ))

    # Português - 9º Ano
    av_port_1bim = assessment_repo.save(Assessment(
        title="Prova Bimestral (1º Bimestre) - Português",
        subject="Português",
        description="Interpretação e Análise Sintática",
        assessment_type=AssessmentType.PROVA,
        max_score=10.0,
        weight=1.0,
        bimester=Bimester.PRIMEIRO,
        academic_year=2026,
        assessment_date=date(2026, 3, 20)
    ))

    # História - 9º Ano
    av_hist_1bim = assessment_repo.save(Assessment(
        title="Prova Bimestral (1º Bimestre) - História",
        subject="História",
        description="Brasil República e Cidadania",
        assessment_type=AssessmentType.PROVA,
        max_score=10.0,
        weight=1.0,
        bimester=Bimester.PRIMEIRO,
        academic_year=2026,
        assessment_date=date(2026, 3, 25)
    ))

    # Ciências - 9º Ano
    av_cien_1bim = assessment_repo.save(Assessment(
        title="Prova Bimestral (1º Bimestre) - Ciências",
        subject="Ciências",
        description="Química e Tabela Periódica",
        assessment_type=AssessmentType.PROVA,
        max_score=10.0,
        weight=1.0,
        bimester=Bimester.PRIMEIRO,
        academic_year=2026,
        assessment_date=date(2026, 3, 22)
    ))

    # 7. Lançar Notas Iniciais
    # João Silva (9º Ano A)
    student_service.lancar_nota(joao.id, av_mat_1bim.id, 8.5, "Prof. Carlos Mendes")
    student_service.lancar_nota(joao.id, av_mat_2bim.id, 7.5, "Prof. Carlos Mendes")
    student_service.lancar_nota(joao.id, av_port_1bim.id, 7.5, "Prof. Carlos Mendes")
    student_service.lancar_nota(joao.id, av_hist_1bim.id, 8.5, "Profa. Patrícia Lima")
    student_service.lancar_nota(joao.id, av_cien_1bim.id, 9.0, "Profa. Patrícia Lima")

    # Pedro Costa (9º Ano A)
    student_service.lancar_nota(pedro.id, av_mat_1bim.id, 7.0, "Prof. Carlos Mendes")
    student_service.lancar_nota(pedro.id, av_port_1bim.id, 7.5, "Prof. Carlos Mendes")
    student_service.lancar_nota(pedro.id, av_hist_1bim.id, 8.0, "Profa. Patrícia Lima")
    student_service.lancar_nota(pedro.id, av_cien_1bim.id, 8.5, "Profa. Patrícia Lima")

    # Ana Silva (6º Ano B)
    av_ana_mat = assessment_repo.save(Assessment(
        title="Prova Bimestral (1º Bimestre) - Matemática",
        subject="Matemática",
        description="Operações com Frações",
        assessment_type=AssessmentType.PROVA,
        max_score=10.0,
        weight=1.0,
        bimester=Bimester.PRIMEIRO,
        academic_year=2026,
        assessment_date=date(2026, 3, 18)
    ))
    av_ana_port = assessment_repo.save(Assessment(
        title="Prova Bimestral (1º Bimestre) - Português",
        subject="Português",
        description="Gramática e Produção de Texto",
        assessment_type=AssessmentType.PROVA,
        max_score=10.0,
        weight=1.0,
        bimester=Bimester.PRIMEIRO,
        academic_year=2026,
        assessment_date=date(2026, 3, 22)
    ))
    student_service.lancar_nota(ana.id, av_ana_mat.id, 5.5, "Prof. Carlos Mendes")
    student_service.lancar_nota(ana.id, av_ana_port.id, 5.0, "Prof. Carlos Mendes")

    # 8. Lançar Frequências (Março 2026)
    # João: 18 presenças, 2 faltas (1 justificada com atestado médico no dia 11) -> 90%
    for dia in range(1, 21):
        d = date(2026, 3, dia)
        if dia == 11:
            attendance_repo.save(Attendance(
                student=joao,
                subject="Matemática",
                attendance_date=d,
                is_present=False,
                justified=True,
                justification="Atestado médico odontológico"
            ))
        elif dia == 17:
            attendance_repo.save(Attendance(
                student=joao,
                subject="Matemática",
                attendance_date=d,
                is_present=False,
                justified=False
            ))
        else:
            attendance_repo.save(Attendance(
                student=joao,
                subject="Matemática",
                attendance_date=d,
                is_present=True
            ))

    # Ana: Frequência crítica de 70% (abaixo do limite legal de 75%)
    for dia in range(1, 21):
        d = date(2026, 3, dia)
        is_p = dia not in [3, 7, 10, 14, 18, 20]
        attendance_repo.save(Attendance(
            student=ana,
            subject="Matemática",
            attendance_date=d,
            is_present=is_p,
            justified=False
        ))

    # Pedro: 19 presenças, 1 falta (95%)
    for dia in range(1, 21):
        d = date(2026, 3, dia)
        is_p = dia != 8
        attendance_repo.save(Attendance(
            student=pedro,
            subject="Matemática",
            attendance_date=d,
            is_present=is_p,
            justified=False
        ))

    # 10. Criar Avisos e Comunicados Iniciais
    announcement_repo = AnnouncementRepository(db)
    announcements_data = [
        {
            "title": "Reunião de Pais e Mestres do 1º Bimestre",
            "content": "Prezados pais e responsáveis, convidamos todos para a Reunião Pedagógica Bimestral que ocorrerá no próximo sábado, às 09:00 no auditório da escola. Apresentaremos o balanço pedagógico e alinhamento de metas.",
            "category": "URGENT",
            "sender_role": "COORDENACAO",
            "sender_name": "Profa. Regina Vasconcelos",
            "sender": "Coordenação Pedagógica",
            "target_type": "ALL",
            "tags": [
                {"label": "Reunião de Pais", "color": "#1B4F8A", "bg": "#EEF2F7"},
                {"label": "Presencial", "color": "#059669", "bg": "#ECFDF5"}
            ],
            "date_published": "2026-06-20",
            "is_read": False
        },
        {
            "title": "Campanha de Vacinação Escolar 2026",
            "content": "A equipe de saúde municipal estará presente na escola para atualização das cadernetas de vacinação dos alunos do Ensino Fundamental. Tragam o cartão de vacina e autorização assinada.",
            "category": "EVENT",
            "sender_role": "SECRETARIA",
            "sender_name": "Fabiana Souza",
            "sender": "Secretaria Escolar",
            "target_type": "ALL",
            "tags": [
                {"label": "Saúde / Vacinação", "color": "#059669", "bg": "#ECFDF5"},
                {"label": "Documentação", "color": "#6366F1", "bg": "#EEF2FF"}
            ],
            "date_published": "2026-06-15",
            "is_read": False
        },
        {
            "title": "Plantão de Dúvidas de Álgebra e Geometria",
            "content": "Avisamos aos estudantes do 9º Ano A que realizaremos um plantão especial para esclarecimento de dúvidas sobre equações e polinômios todas as terças-feiras às 14:00.",
            "category": "GENERAL",
            "sender_role": "PROFESSOR",
            "sender_name": "Prof. Carlos Mendes",
            "sender": "Prof. Carlos Mendes — Matemática (9º Ano A)",
            "target_type": "CLASSROOM",
            "classroom_id": turma_9a.id,
            "subject": "Matemática",
            "tags": [
                {"label": "Plantão de Dúvidas", "color": "#D97706", "bg": "#FFFBEB"},
                {"label": "Reforço", "color": "#8B5CF6", "bg": "#F5F3FF"}
            ],
            "date_published": "2026-06-05",
            "is_read": True,
            "read_at": "2026-06-06 10:15:00"
        },
        {
            "title": "Aviso Individual: Entrega do Trabalho de Geometria",
            "content": "Parabéns ao estudante João Silva pela excelente pontuação na Avaliação 1. Lembramos que a entrega do trabalho complementar de geometria espacial está agendada para a próxima sexta-feira.",
            "category": "IMPORTANT",
            "sender_role": "PROFESSOR",
            "sender_name": "Prof. Carlos Mendes",
            "sender": "Prof. Carlos Mendes — Matemática (9º Ano A)",
            "target_type": "STUDENT",
            "classroom_id": turma_9a.id,
            "student_id": joao.id,
            "subject": "Matemática",
            "tags": [
                {"label": "Entrega de Trabalhos", "color": "#2563EB", "bg": "#EFF6FF"},
                {"label": "Elogio Acadêmico", "color": "#10B981", "bg": "#ECFDF5"}
            ],
            "date_published": "2026-06-10",
            "is_read": False
        }
    ]

    for a_data in announcements_data:
        announcement_repo.save(a_data)

    print("🌱 Carga de dados pedagógicos (Seed Data) finalizada com sucesso!")
    return True


if __name__ == "__main__":
    seed_database()

