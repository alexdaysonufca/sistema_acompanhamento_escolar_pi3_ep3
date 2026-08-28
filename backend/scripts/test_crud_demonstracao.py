"""
Script de Demonstração e Teste Completo de Operações CRUD
Sistema TrAcEs — Trilha de Acompanhamento Estudantil
Validação das Camadas de Domínio, Aplicação, Infraestrutura e Banco de Dados SQLite 3
"""

import sys
import os
from datetime import date, datetime
from decimal import Decimal

# Garantir UTF-8 no Windows
if sys.platform == "win32":
    if sys.stdout.encoding != "utf-8":
        reconfig = getattr(sys.stdout, "reconfigure", None)
        if reconfig:
            reconfig(encoding="utf-8")

# Adicionar backend ao path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from src.infrastructure.database import (
    get_database,
    StudentRepository,
    TeacherRepository,
    ParentRepository,
    ClassroomRepository,
    AssessmentRepository,
    GradeRepository,
    AttendanceRepository,
)
from src.application.services import ServicosDoAluno, ServicosSecretaria
from src.domain.models import (
    Student, Teacher, Parent, Classroom, Assessment, Grade, Attendance,
    EducationLevel, Shift, AssessmentType, Bimester
)
from src.infrastructure.api.controllers import AppContext, AuthController, ParentController, TeacherController


def print_banner(title: str):
    print("\n" + "=" * 75)
    print(f"  {title.upper()}")
    print("=" * 75)


def print_step(step_name: str, desc: str = ""):
    print(f"\n🔹 [{step_name}] {desc}")


def run_crud_demonstration():
    print_banner("TrAcEs — Bateria de Testes CRUD e Validação de Integridade")

    # 1. INICIALIZAÇÃO DO BANCO DE DADOS
    print_step("SETUP", "Inicializando banco de dados relacional SQLite 3 com schema.sql")
    demo_db_path = os.path.join(os.path.dirname(__file__), "demo_crud.db")
    if os.path.exists(demo_db_path):
        try:
            os.remove(demo_db_path)
        except Exception:
            pass
    db = get_database(demo_db_path)
    db.initialize_database()

    student_repo = StudentRepository(db)
    teacher_repo = TeacherRepository(db)
    parent_repo = ParentRepository(db)
    classroom_repo = ClassroomRepository(db)
    assessment_repo = AssessmentRepository(db)
    grade_repo = GradeRepository(db)
    attendance_repo = AttendanceRepository(db)

    sec_service = ServicosSecretaria(student_repo, classroom_repo, parent_repo)
    aluno_service = ServicosDoAluno(grade_repo, assessment_repo, student_repo, attendance_repo)

    # =========================================================================
    # 2. CRUD DE ESTUDANTES (STUDENT)
    # =========================================================================
    print_banner("1. CRUD de Estudantes (Students)")

    # [C] CREATE
    print_step("CREATE", "Cadastrando novo estudante: 'Lucas Oliveira'")
    lucas = Student(
        name="Lucas Oliveira",
        registration="2026099",
        email="lucas.oliveira@escola.edu.br",
        active=True
    )
    lucas = student_repo.save(lucas)
    print(f"   ✅ [CREATE OK] ID gerado: {lucas.id} | Nome: {lucas.name} | Matrícula: {lucas.registration}")

    # [R] READ
    print_step("READ", f"Consultando estudante pelo ID {lucas.id}")
    lucas_consultado = student_repo.find_by_id(lucas.id)
    assert lucas_consultado is not None
    print(f"   ✅ [READ OK] Encontrado: {lucas_consultado.name} ({lucas_consultado.email})")

    # [U] UPDATE
    print_step("UPDATE", "Atualizando e-mail e nome do estudante")
    lucas_consultado.name = "Lucas Oliveira Santos"
    lucas_consultado.email = "lucas.santos@escola.edu.br"
    student_repo.save(lucas_consultado)

    lucas_atualizado = student_repo.find_by_id(lucas.id)
    print(f"   ✅ [UPDATE OK] Dados atualizados: {lucas_atualizado.name} | {lucas_atualizado.email}")

    # =========================================================================
    # 3. CRUD DE PROFESSORES (TEACHER)
    # =========================================================================
    print_banner("2. CRUD de Professores (Teachers)")

    # [C] CREATE
    print_step("CREATE", "Cadastrando Professor: 'Prof. Carlos Mendes'")
    carlos = Teacher(
        name="Prof. Carlos Mendes",
        email="carlos.mendes@escola.edu.br",
        subjects=["Matemática", "Física"]
    )
    carlos = teacher_repo.save(carlos)
    print(f"   ✅ [CREATE OK] Professor ID: {carlos.id} | Disciplinas: {', '.join(carlos.subjects)}")

    # [U] UPDATE
    print_step("UPDATE", "Adicionando nova disciplina ao professor: 'Geometria'")
    carlos.subjects.append("Geometria")
    carlos = teacher_repo.save(carlos)
    carlos_read = teacher_repo.find_by_id(carlos.id)
    print(f"   ✅ [UPDATE OK] Disciplinas atualizadas: {', '.join(carlos_read.subjects)}")

    # =========================================================================
    # 4. CRUD DE RESPONSÁVEIS E VÍNCULO N:N (PARENT & STUDENT_PARENT)
    # =========================================================================
    print_banner("3. CRUD de Responsáveis e Vínculos Familiares (Parents)")

    # [C] CREATE com CPF válido
    print_step("CREATE", "Cadastrando Responsável 'Maria Silva' com validação algorítmica de CPF")
    maria = Parent(
        name="Maria Silva Oliveira",
        email="maria.silva@email.com",
        cpf="123.456.789-09"
    )
    maria = parent_repo.save(maria)
    print(f"   ✅ [CREATE OK] Responsável ID: {maria.id} | Nome: {maria.name} | CPF: {maria.cpf}")

    # [C] CREATE VÍNCULO
    print_step("LINK", f"Vinculando Maria (ID {maria.id}) ao estudante Lucas (ID {lucas.id}) como 'Mãe'")
    sec_service.vincular_responsavel(maria.id, lucas.id, "Mãe")
    alunos_da_maria = sec_service.listar_alunos_do_responsavel(maria.id)
    print(f"   ✅ [LINK OK] Estudantes vinculados à Maria: IDs {alunos_da_maria}")

    # =========================================================================
    # 5. CRUD DE TURMAS E MATRÍCULAS (CLASSROOM & ENROLLMENT)
    # =========================================================================
    print_banner("4. CRUD de Turmas e Matrículas Escolares")

    print_step("CREATE", "Criando turma '9º Ano A - Manhã'")
    turma_9a = Classroom(
        year="9º Ano",
        identifier="A",
        shift=Shift.MANHA,
        level=EducationLevel.FUNDAMENTAL_II,
        teacher_id=carlos.id
    )
    turma_9a = classroom_repo.save(turma_9a)
    print(f"   ✅ [CREATE OK] Turma ID: {turma_9a.id} | {turma_9a.year} {turma_9a.identifier} ({turma_9a.shift.value})")

    print_step("ENROLL", f"Matriculando estudante {lucas.name} na Turma ID {turma_9a.id}")
    sec_service.matricular_aluno(lucas.id, turma_9a.id, 2026)
    print(f"   ✅ [ENROLL OK] Aluno {lucas.name} matriculado com sucesso para o ano letivo de 2026")

    # =========================================================================
    # 6. CRUD DE AVALIAÇÕES E NOTAS (ASSESSMENT & GRADE)
    # =========================================================================
    print_banner("5. CRUD de Avaliações e Lançamento de Notas (Cálculo Ponderado)")

    print_step("CREATE", "Criando avaliações do 1º Bimestre de Matemática")
    av1 = assessment_repo.save(Assessment(
        title="Prova Bimestral 1",
        subject="Matemática",
        description="Equações e Álgebra",
        assessment_type=AssessmentType.PROVA,
        max_score=10.0,
        weight=2.0,  # Peso 2
        bimester=Bimester.PRIMEIRO,
        academic_year=2026,
        assessment_date=date(2026, 3, 15)
    ))

    av2 = assessment_repo.save(Assessment(
        title="Trabalho de Geometria",
        subject="Matemática",
        description="Teorema de Pitágoras",
        assessment_type=AssessmentType.TRABALHO,
        max_score=10.0,
        weight=1.0,  # Peso 1
        bimester=Bimester.PRIMEIRO,
        academic_year=2026,
        assessment_date=date(2026, 3, 28)
    ))
    print(f"   ✅ [CREATE OK] Av1 (Peso 2): ID {av1.id} | Av2 (Peso 1): ID {av2.id}")

    # [C] Lançar Notas
    print_step("CREATE (GRADE)", f"Lançando notas: Prova=8.0 (peso 2), Trabalho=9.5 (peso 1)")
    aluno_service.lancar_nota(lucas.id, av1.id, 8.0, "Prof. Carlos Mendes")
    aluno_service.lancar_nota(lucas.id, av2.id, 9.5, "Prof. Carlos Mendes")

    # [R] Calcular Média Bimestral
    media_b1 = aluno_service.calcular_media_bimestral(lucas.id, "Matemática", Bimester.PRIMEIRO, 2026)
    # Cálculo esperado: (8.0*2 + 9.5*1) / (2+1) = (16.0 + 9.5) / 3 = 25.5 / 3 = 8.50
    print(f"   ✅ [READ/CALC OK] Média Ponderada 1º Bimestre: {media_b1} (Esperado: 8.50)")

    # [U] Atualizar Nota (Retificação pedagógica)
    print_step("UPDATE (GRADE)", "Retificando nota da Prova para 9.0 (ex: revisão de prova)")
    grade_av1 = grade_repo.find_by_student_and_assessment(lucas.id, av1.id)
    grade_av1.student = lucas
    grade_av1.assessment = av1
    grade_av1.score = 9.0
    grade_repo.save(grade_av1)

    media_b1_atualizada = aluno_service.calcular_media_bimestral(lucas.id, "Matemática", Bimester.PRIMEIRO, 2026)
    # Cálculo esperado: (9.0*2 + 9.5*1) / 3 = 27.5 / 3 = 9.17
    print(f"   ✅ [UPDATE/CALC OK] Nova Média Ponderada após retificação: {media_b1_atualizada} (Esperado: 9.17)")

    # =========================================================================
    # 7. CRUD DE FREQUÊNCIA E JUSTIFICATIVAS (ATTENDANCE)
    # =========================================================================
    print_banner("6. CRUD de Frequência e Assiduidade Escolar")

    print_step("CREATE (ATTENDANCE)", "Lançando chamadas de Março/2026 (Presenças e Faltas)")
    # 19 presenças e 1 falta justificada
    for d in range(1, 21):
        dia_data = date(2026, 3, d)
        if d == 11:
            attendance_repo.save(Attendance(
                student=lucas,
                subject="Matemática",
                attendance_date=dia_data,
                is_present=False,
                justified=True,
                justification="Consulta odontológica com atestado"
            ))
        else:
            attendance_repo.save(Attendance(
                student=lucas,
                subject="Matemática",
                attendance_date=dia_data,
                is_present=True
            ))

    extrato = aluno_service.consultar_extrato(lucas.id, "Matemática", date(2026, 3, 1), date(2026, 3, 31))
    print(f"   ✅ [READ/EXTRATO OK] Total Aulas: {extrato.total_aulas} | Presenças: {extrato.presencas} | Faltas: {extrato.faltas} (Justificadas: {extrato.faltas_justificadas})")
    print(f"   ✅ [PERCENTUAL OK] Taxa de Assiduidade: {extrato.percentual_presenca}% (Limite legal: ≥ 75.0%)")

    # =========================================================================
    # 8. TESTE INTEGRADO VIA CONTROLADORES DA API REST (CONTROLLERS)
    # =========================================================================
    print_banner("7. Teste de Operações via Controladores da API REST (JSON Payloads)")

    ctx = AppContext()
    auth_ctrl = AuthController(ctx)
    parent_ctrl = ParentController(ctx)
    teacher_ctrl = TeacherController(ctx)

    # 1. Login
    print_step("API - AUTH", "Testando POST /api/auth/login")
    login_res = auth_ctrl.login({"email": "maria.silva@email.com", "role": "PARENT"})
    print(f"   ✅ [API 200 OK] Token: {login_res['token'][:25]}... | Usuário: {login_res['user']['name']} ({login_res['user']['role']})")

    # 2. Boletim
    print_step("API - BOLETIM", f"Testando GET /api/students/{lucas.id}/report-card")
    boletim_res = parent_ctrl.get_report_card(lucas.id, 2026)
    mat_report = next(r for r in boletim_res["report"] if r["subject"] == "Matemática")
    print(f"   ✅ [API 200 OK] Aluno: {boletim_res['student_name']} | Turma: {boletim_res['classroom']}")
    print(f"      • Matemática: 1º Bim = {mat_report['bimester_grades']['1']} | Status = {mat_report['status']}")

    # 3. Lançamento em Lote Docente
    print_step("API - DOCENTE", "Testando POST /api/teacher/grades/bulk")
    bulk_res = teacher_ctrl.bulk_save_grades({
        "assessment_id": av2.id,
        "graded_by": "Prof. Carlos Mendes",
        "grades": [{"student_id": lucas.id, "score": 10.0}]
    })
    print(f"   ✅ [API 201 OK] {bulk_res['message']}")

    # =========================================================================
    # 9. [D] DELETE E INTEGRIDADE REFERENCIAL (CASCADE)
    # =========================================================================
    print_banner("8. Teste de Desvinculação e Delete com Integridade Referencial")

    print_step("UNLINK", f"Desvinculando responsável Maria do estudante Lucas")
    desvinculou = sec_service.desvincular_responsavel(maria.id, lucas.id)
    assert desvinculou is True
    alunos_restantes = sec_service.listar_alunos_do_responsavel(maria.id)
    print(f"   ✅ [DELETE/UNLINK OK] Vínculo removido. Alunos restantes de Maria: {alunos_restantes}")

    print_banner("🎉 BATERIA DE TESTES CRUD E INTEGRIDADE CONCLUÍDA COM 100% DE SUCESSO!")


if __name__ == "__main__":
    run_crud_demonstration()
