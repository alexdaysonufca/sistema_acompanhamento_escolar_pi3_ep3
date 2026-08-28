"""
Testes automatizados completos dos controladores e endpoints da API REST do TrAcEs.
Cobre autenticação, módulos de acompanhamento familiar, lançamento em lote e documentação OpenAPI.
"""
import pytest
from datetime import date
try:
    from src.presentation.controllers import AppContext, AuthController, ParentController, TeacherController
    from src.presentation.seed_data import seed_database
    from src.presentation.openapi_spec import OPENAPI_SPEC, get_swagger_html
except ImportError:
    from src.infrastructure.api.controllers import AppContext, AuthController, ParentController, TeacherController
    from src.infrastructure.api.seed_data import seed_database
    from src.infrastructure.api.openapi_spec import OPENAPI_SPEC, get_swagger_html


@pytest.fixture(scope="module")
def api_context(tmp_path_factory):
    """Cria banco temporário e contexto da API para testes isolados."""
    db_file = tmp_path_factory.mktemp("data") / "test_api.db"
    seed_database(str(db_file))
    return AppContext(str(db_file))


# ─── 1. Autenticação e Perfis ────────────────────────────────────────────────

def test_auth_login_parent(api_context):
    """Testa login de responsável e integridade do payload de retorno."""
    auth = AuthController(api_context)
    res = auth.login({"email": "maria.silva@email.com", "role": "PARENT"})
    assert "token" in res
    assert res["user"]["role"] == "PARENT"
    assert len(res["user"]["dependents"]) >= 2
    assert res["user"]["email"] == "maria.silva@email.com"


def test_auth_login_teacher(api_context):
    """Testa login de professor com listagem de disciplinas atribuídas."""
    auth = AuthController(api_context)
    res = auth.login({"email": "carlos.mendes@escola.edu.br", "role": "TEACHER"})
    assert "token" in res
    assert res["user"]["role"] == "TEACHER"
    assert "Matemática" in res["user"]["subjects"]


def test_auth_login_invalid_user(api_context):
    """Testa rejeição de login com usuário inexistente."""
    auth = AuthController(api_context)
    res = auth.login({"email": "inexistente@escola.edu.br", "role": "PARENT"})
    assert "error" in res
    assert res["code"] == 404


# ─── 2. Módulo Responsável ───────────────────────────────────────────────────

def test_parent_get_dependents(api_context):
    """Testa listagem de dependentes do responsável com médias e alertas."""
    parent_ctrl = ParentController(api_context)
    dependents = parent_ctrl.get_dependents(1)
    assert len(dependents) >= 2

    joao = next(d for d in dependents if "João" in d["name"])
    assert joao["average_grade"] >= 6.0
    assert "alerts" in joao
    assert "attendance_rate" in joao
    assert joao["classroom"] is not None


def test_parent_get_report_card(api_context):
    """Testa emissão de boletim escolar consolidado com notas e status."""
    parent_ctrl = ParentController(api_context)
    report = parent_ctrl.get_report_card(1, 2026)
    assert report["student_id"] == 1
    assert len(report["report"]) >= 4

    mat = next(r for r in report["report"] if r["subject"] == "Matemática")
    assert mat["bimester_grades"]["1"] is not None
    assert mat["status"] in ["Aprovado", "Recuperação", "Reprovado", "Em Andamento"]


def test_parent_get_detailed_assessments(api_context):
    """Testa consulta analítica de avaliações, pesos e fórmula pedagógica."""
    parent_ctrl = ParentController(api_context)
    details = parent_ctrl.get_detailed_assessments(1, "Matemática", 2026)
    assert details["student_id"] == 1
    assert details["subject"] == "Matemática"
    assert "bimesters" in details
    assert len(details["bimesters"]) == 4

    bim1 = next(b for b in details["bimesters"] if b["bimester"] == "PRIMEIRO")
    assert bim1["average"] is not None
    assert len(bim1["assessments"]) >= 1
    assert bim1["assessments"][0]["weight"] > 0


def test_parent_get_attendance_calendar(api_context):
    """Testa geração do calendário tátil de frequência e resumo mensal."""
    parent_ctrl = ParentController(api_context)
    cal = parent_ctrl.get_attendance_calendar(1, "Matemática", 3, 2026)
    assert cal["student_id"] == 1
    assert cal["month"] == 3
    assert len(cal["calendar"]) == 31
    assert cal["summary"]["total_classes"] > 0
    assert cal["summary"]["attendance_rate"] >= 0.0


def test_parent_get_announcements(api_context):
    """Testa recuperação dos avisos institucionais."""
    parent_ctrl = ParentController(api_context)
    announcements = parent_ctrl.get_announcements()
    assert len(announcements) >= 2
    assert all("title" in a and "category" in a for a in announcements)


# ─── 3. Módulo Docente (Lançamento e Turmas) ─────────────────────────────────

def test_teacher_get_classes(api_context):
    """Testa consulta de turmas e lista de estudantes atribuídos ao docente."""
    teacher_ctrl = TeacherController(api_context)
    classes = teacher_ctrl.get_classes(1)
    assert len(classes) >= 1
    turma = classes[0]
    assert "classroom_id" in turma
    assert "subjects" in turma
    assert len(turma["students"]) >= 1


def test_teacher_bulk_grades_first_bimester(api_context):
    """Testa lançamento de notas em lote no 1º bimestre via assessment_id."""
    teacher_ctrl = TeacherController(api_context)
    res = teacher_ctrl.bulk_save_grades({
        "assessment_id": 1,
        "graded_by": "Prof. Carlos Mendes",
        "grades": [
            {"student_id": 1, "score": 9.5},
            {"student_id": 2, "score": 8.0}
        ]
    })
    assert res["status"] == "success"
    assert res["records_created"] == 2


def test_teacher_bulk_grades_second_bimester_dynamic(api_context):
    """Testa lançamento dinâmico de notas no 2º bimestre por subject e bimester."""
    teacher_ctrl = TeacherController(api_context)
    res = teacher_ctrl.bulk_save_grades({
        "subject": "Português",
        "bimester": "SEGUNDO",
        "academic_year": 2026,
        "graded_by": "Prof. Carlos Mendes",
        "grades": [
            {"student_id": 1, "score": 9.2},
            {"student_id": 3, "score": 8.7}
        ]
    })
    assert res["status"] == "success"
    assert res["records_created"] == 2

    # Verifica se o boletim reflete imediatamente a nova nota do 2º bimestre
    parent_ctrl = ParentController(api_context)
    report = parent_ctrl.get_report_card(1, 2026)
    port = next(r for r in report["report"] if r["subject"] == "Português")
    assert port["bimester_grades"]["2"] == 9.2


def test_teacher_bulk_grades_validation_bounds(api_context):
    """Testa validação de limites de notas (rejeição de notas > 10.0 ou < 0.0)."""
    teacher_ctrl = TeacherController(api_context)
    res = teacher_ctrl.bulk_save_grades({
        "subject": "Matemática",
        "bimester": "PRIMEIRO",
        "academic_year": 2026,
        "grades": [
            {"student_id": 1, "score": 15.0},  # Inválido
            {"student_id": 2, "score": -2.0}   # Inválido
        ]
    })
    assert "error" in res or len(res.get("warnings", [])) > 0


def test_teacher_bulk_attendance(api_context):
    """Testa registro de chamada diária em lote pelo docente com justificativa."""
    teacher_ctrl = TeacherController(api_context)
    res = teacher_ctrl.bulk_save_attendance({
        "date": "2026-03-25",
        "subject": "Matemática",
        "classroom_id": 1,
        "records": [
            {"student_id": 1, "is_present": True},
            {"student_id": 2, "is_present": False, "justification": "Atestado de Consulta Médica"}
        ]
    })
    assert res["status"] == "success"
    assert res["records_count"] == 2


# ─── 4. Documentação OpenAPI e Swagger UI ────────────────────────────────────

def test_openapi_spec_integrity():
    """Valida a integridade da especificação OpenAPI 3.0 e do Swagger UI HTML."""
    assert OPENAPI_SPEC["openapi"] == "3.0.3"
    assert OPENAPI_SPEC["info"]["title"] == "TrAcEs — Trilha de Acompanhamento Estudantil API"
    assert len(OPENAPI_SPEC["paths"]) >= 10

    # Valida caminhos essenciais
    paths = OPENAPI_SPEC["paths"]
    assert "/api/health" in paths
    assert "/api/auth/login" in paths
    assert "/api/parent/dependents" in paths
    assert "/api/students/{student_id}/report-card" in paths
    assert "/api/students/{student_id}/assessments" in paths
    assert "/api/students/{student_id}/attendance" in paths
    assert "/api/parent/announcements" in paths
    assert "/api/teacher/classes" in paths
    assert "/api/teacher/assessments" in paths
    assert "/api/teacher/assessments/{id}" in paths
    assert "/api/teacher/grades/bulk" in paths
    assert "/api/teacher/attendance/bulk" in paths
    assert "/api/teacher/assessments/add" in paths

    html = get_swagger_html()
    assert "SwaggerUIBundle" in html
    assert "TrAcEs" in html


def test_add_sequential_assessment_and_detailed_bimesters(api_context):
    """Testa a criação de avaliação sequencial (Avaliação N) e cálculo no 1º Bimestre."""
    parent_ctrl = ParentController(api_context)
    teacher_ctrl = TeacherController(api_context)

    # 1. Consultar estado inicial
    data_before = parent_ctrl.get_detailed_assessments(1, "Matemática", 2026)
    bim1_before = data_before["bimesters"][0]
    assert bim1_before["bimester_name"] == "1º Bimestre"
    count_before = len(bim1_before["assessments"])
    expected_seq = f"Avaliação {count_before + 1}"

    # 2. Criar nova avaliação sequencial
    payload = {
        "student_id": 1,
        "subject": "Matemática",
        "bimester": "PRIMEIRO",
        "academic_year": 2026,
        "title": expected_seq,
        "assessment_type": "TRABALHO",
        "weight": 1.0,
        "score": 9.0,
        "description": "Trabalho prático de Álgebra",
        "graded_by": "Prof. Carlos Mendes"
    }
    res_post = teacher_ctrl.add_assessment(payload)
    assert res_post["status"] == "success"
    assert res_post["title"] == expected_seq

    # 3. Consultar estado posterior e validar média e nova sequência
    data_after = parent_ctrl.get_detailed_assessments(1, "Matemática", 2026)
    bim1_after = data_after["bimesters"][0]
    assert len(bim1_after["assessments"]) == count_before + 1
    assert bim1_after["assessments"][-1]["title"] == expected_seq
    assert bim1_after["next_seq_title"] == f"Avaliação {count_before + 2}"


def test_edit_assessment_and_recalculate(api_context):
    """Testa a edição de avaliação existente (peso, tipo, descrição) e persistência."""
    teacher_ctrl = TeacherController(api_context)

    # 1. Buscar avaliações
    assessments = teacher_ctrl.get_assessments_by_scope("Matemática", "PRIMEIRO", 2026)
    assert len(assessments) >= 1
    av_target = assessments[0]
    av_id = av_target["assessment_id"]

    # 2. Atualizar avaliação
    update_payload = {
        "title": "Avaliação 1 Revisada",
        "assessment_type": "PROVA",
        "weight": 3.0,
        "description": "Conteúdo Atualizado - Equações e Inequações"
    }
    res_update = teacher_ctrl.update_assessment(av_id, update_payload)
    assert res_update["status"] == "success"
    assert res_update["weight"] == 3.0
    assert res_update["description"] == "Conteúdo Atualizado - Equações e Inequações"

    # 3. Confirmar que a busca reflete a alteração
    assessments_after = teacher_ctrl.get_assessments_by_scope("Matemática", "PRIMEIRO", 2026)
    av_updated = next(a for a in assessments_after if a["assessment_id"] == av_id)
    assert av_updated["weight"] == 3.0
    assert av_updated["description"] == "Conteúdo Atualizado - Equações e Inequações"


# ─── 4. Módulo de Avisos e Comunicados ────────────────────────────────────────

def test_announcement_crud_and_read_status(api_context):
    """Testa criação de aviso pelo docente, visualização pelo responsável, marcação de leitura e atualização."""
    teacher_ctrl = TeacherController(api_context)
    parent_ctrl = ParentController(api_context)

    # 1. Docente cria aviso para a Turma 1 (9º Ano A) com tag personalizada
    create_payload = {
        "title": "Olimpíada Brasileira de Matemática (OBMEP)",
        "content": "Estão abertas as inscrições para a 1ª fase da OBMEP. Todos os estudantes interessados devem confirmar participação.",
        "category": "EVENT",
        "sender_role": "PROFESSOR",
        "sender_name": "Prof. Carlos Mendes",
        "target_type": "CLASSROOM",
        "classroom_id": 1,
        "subject": "Matemática",
        "tags": [
            {"label": "OBMEP", "color": "#7C3AED", "bg": "#F5F3FF"},
            {"label": "Inscrições", "color": "#2563EB", "bg": "#EFF6FF"}
        ]
    }
    res_create = teacher_ctrl.create_announcement(create_payload)
    assert res_create["status"] == "success"
    announcement = res_create["announcement"]
    ann_id = announcement["id"]
    assert "Prof. Carlos Mendes — Matemática" in announcement["sender"]
    assert announcement["is_read"] is False

    # 2. Responsável do aluno João Silva (Turma 1) consulta avisos e encontra o novo comunicado
    parent_announcements = parent_ctrl.get_announcements(student_id=1)
    found = next((a for a in parent_announcements if a["id"] == ann_id), None)
    assert found is not None
    assert found["title"] == "Olimpíada Brasileira de Matemática (OBMEP)"
    assert found["is_read"] is False

    # 3. Responsável marca aviso como lido
    res_read = parent_ctrl.mark_announcement_as_read(ann_id)
    assert res_read["status"] == "success"
    assert res_read["is_read"] is True

    # 4. Docente visualiza avisos e constata que o status de leitura foi atualizado para True
    teacher_announcements = teacher_ctrl.get_announcements(classroom_id=1)
    target = next(a for a in teacher_announcements if a["id"] == ann_id)
    assert target["is_read"] is True
    assert target["read_at"] is not None

    # 5. Docente edita o aviso
    update_payload = {
        "title": "OBMEP 2026 — Inscrições Prorrogadas",
        "content": "As inscrições para a OBMEP foram prorrogadas até a próxima quarta-feira.",
        "category": "URGENT",
        "sender_role": "PROFESSOR",
        "sender_name": "Prof. Carlos Mendes",
        "target_type": "CLASSROOM",
        "classroom_id": 1,
        "subject": "Matemática",
        "tags": [
            {"label": "OBMEP", "color": "#7C3AED", "bg": "#F5F3FF"},
            {"label": "Urgente", "color": "#DC2626", "bg": "#FEE2E2"}
        ]
    }
    res_update = teacher_ctrl.update_announcement(ann_id, update_payload)
    assert res_update["status"] == "success"
    assert res_update["announcement"]["title"] == "OBMEP 2026 — Inscrições Prorrogadas"
    assert res_update["announcement"]["category"] == "URGENT"

