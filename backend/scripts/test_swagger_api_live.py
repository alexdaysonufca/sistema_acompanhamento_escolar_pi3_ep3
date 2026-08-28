"""
Script de Teste Live de Todos os Endpoints do Swagger UI / API RESTful
Servidor em execução: http://127.0.0.1:8000
"""
import sys
import json
import urllib.request
import urllib.error

# Garantir UTF-8 no Windows
if sys.platform == "win32":
    if sys.stdout.encoding != "utf-8":
        reconfig = getattr(sys.stdout, "reconfigure", None)
        if reconfig:
            reconfig(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"


def print_banner(title: str):
    print("\n" + "=" * 80)
    print(f"  {title.upper()}")
    print("=" * 80)


def print_test(endpoint: str, method: str, desc: str):
    print(f"\n📡 [{method}] {endpoint}")
    print(f"   ℹ️  {desc}")


def http_get(path: str):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "TrAcEs-Swagger-Tester/1.0"})
    with urllib.request.urlopen(req) as response:
        status = response.status
        content_type = response.headers.get("Content-Type", "")
        data = response.read()
        if "application/json" in content_type:
            return status, json.loads(data.decode("utf-8"))
        return status, data.decode("utf-8")


def http_post(path: str, payload: dict):
    url = f"{BASE_URL}{path}"
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data_bytes,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "TrAcEs-Swagger-Tester/1.0"
        },
        method="POST"
    )
    with urllib.request.urlopen(req) as response:
        status = response.status
        data = response.read()
        return status, json.loads(data.decode("utf-8"))


def run_all_tests():
    print_banner("TrAcEs — Teste de 100% das Funcionalidades da API RESTful via Swagger")

    # 1. SWAGGER UI & OPENAPI SPEC
    print_test("/docs", "GET", "Documentação Interativa Swagger UI")
    s, html = http_get("/docs")
    assert s == 200 and "SwaggerUIBundle" in html
    print(f"   ✅ [STATUS {s} OK] Swagger UI renderizado com sucesso ({len(html)} bytes)")

    print_test("/openapi.json", "GET", "Especificação OpenAPI 3.0 em formato JSON")
    s, spec = http_get("/openapi.json")
    assert s == 200 and spec["openapi"] == "3.0.3"
    print(f"   ✅ [STATUS {s} OK] OpenAPI 3.0 validada ({len(spec['paths'])} endpoints documentados)")

    # 2. SISTEMA / HEALTHCHECK
    print_test("/api/health", "GET", "Healthcheck e diagnóstico da API")
    s, res = http_get("/api/health")
    assert s == 200 and res["status"] == "ok"
    print(f"   ✅ [STATUS {s} OK] Sistema: {res['system']} (v{res['version']})")

    # 3. AUTENTICAÇÃO - LOGIN RESPONSÁVEL
    print_test("/api/auth/login", "POST", "Login de Responsável (Maria Silva)")
    s, res = http_post("/api/auth/login", {"email": "maria.silva@email.com", "role": "PARENT"})
    assert s == 200 and res["user"]["role"] == "PARENT"
    print(f"   ✅ [STATUS {s} OK] Usuário autenticado: {res['user']['name']} | Token: {res['token'][:20]}...")

    # 4. AUTENTICAÇÃO - LOGIN DOCENTE
    print_test("/api/auth/login", "POST", "Login de Docente (Prof. Carlos Mendes)")
    s, res = http_post("/api/auth/login", {"email": "carlos.mendes@escola.edu.br", "role": "TEACHER"})
    assert s == 200 and res["user"]["role"] == "TEACHER"
    print(f"   ✅ [STATUS {s} OK] Professor autenticado: {res['user']['name']} | Disciplinas: {res['user']['subjects']}")

    # 5. MÓDULO RESPONSÁVEL - DEPENDENTES
    print_test("/api/parent/dependents?parent_id=1", "GET", "Lista de estudantes dependentes da família")
    s, deps = http_get("/api/parent/dependents?parent_id=1")
    assert s == 200 and len(deps) >= 2
    print(f"   ✅ [STATUS {s} OK] {len(deps)} dependentes retornados:")
    for d in deps:
        print(f"      • {d['name']} ({d['classroom']}) — Média: {d['average_grade']} | Presença: {d['attendance_rate']}% | Alerta Frequência: {d['alerts']['critical_attendance']}")

    # 6. MÓDULO RESPONSÁVEL - BOLETIM ESCOLAR
    print_test("/api/students/1/report-card?year=2026", "GET", "Boletim Escolar consolidado nos 4 bimestres")
    s, boletim = http_get("/api/students/1/report-card?year=2026")
    assert s == 200 and boletim["student_id"] == 1
    print(f"   ✅ [STATUS {s} OK] Boletim de {boletim['student_name']} ({boletim['classroom']}):")
    for r in boletim["report"]:
        b1 = r['bimester_grades']['1']
        b2 = r['bimester_grades']['2']
        print(f"      • {r['subject']} ({r['teacher']}) — 1º Bim: {b1} | 2º Bim: {b2} | Média: {r['final_average']} | Status: {r['status']}")

    # 7. MÓDULO RESPONSÁVEL - NOTAS DETALHADAS
    subj_encoded = urllib.parse.quote("Matemática")
    print_test(f"/api/students/1/assessments?subject={subj_encoded}&year=2026", "GET", "Composição analítica de avaliações e pesos")
    s, notas = http_get(f"/api/students/1/assessments?subject={subj_encoded}&year=2026")
    assert s == 200 and notas["subject"] == "Matemática"
    print(f"   ✅ [STATUS {s} OK] Fórmula pedagógica: {notas['formula']} | Média Anual: {notas['annual_average']}")
    for bim in notas["bimesters"]:
        print(f"      [{bim['bimester_name']}] Média: {bim['average']}")
        for av in bim["assessments"]:
            print(f"         - {av['title']} ({av['type']}) Peso {av['weight']} ➜ Nota {av['score']} ({av['status']})")

    # 8. MÓDULO RESPONSÁVEL - FREQUÊNCIA E CALENDÁRIO
    print_test(f"/api/students/1/attendance?subject={subj_encoded}&month=3&year=2026", "GET", "Calendário tátil de frequência de Março/2026")
    s, freq = http_get(f"/api/students/1/attendance?subject={subj_encoded}&month=3&year=2026")
    assert s == 200 and "summary" in freq
    summ = freq["summary"]
    print(f"   ✅ [STATUS {s} OK] Extrato: {summ['presences']}/{summ['total_classes']} presenças ({summ['attendance_rate']}%) | Faltas justif.: {summ['justified_absences']}")
    dias_marcados = [f"Dia {d['day']}: {d['status']}" for d in freq["calendar"] if d['status'] in ['ABSENT', 'JUSTIFIED_ABSENCE']]
    print(f"      • Ocorrências no mês: {', '.join(dias_marcados)}")

    # 9. MÓDULO RESPONSÁVEL - MURAL DE AVISOS
    print_test("/api/parent/announcements", "GET", "Mural de avisos institucionais e comunicados")
    s, avisos = http_get("/api/parent/announcements")
    assert s == 200 and len(avisos) >= 2
    print(f"   ✅ [STATUS {s} OK] {len(avisos)} avisos recuperados:")
    for a in avisos:
        print(f"      • [{a['category']}] {a['title']} ({a['date_published']}) — Lido: {a['is_read']}")

    # 10. MÓDULO DOCENTE - ESCOPO DE TURMAS
    print_test("/api/teacher/classes?teacher_id=1", "GET", "Turmas e estudantes atribuídos ao docente")
    s, turmas = http_get("/api/teacher/classes?teacher_id=1")
    assert s == 200 and len(turmas) >= 1
    print(f"   ✅ [STATUS {s} OK] {len(turmas)} turma(s) vinculada(s):")
    for t in turmas:
        print(f"      • {t['name']} | Disciplinas: {', '.join(t['subjects'])} | {len(t['students'])} estudantes matriculados")

    # 11. MÓDULO DOCENTE - LANÇAMENTO DE NOTAS EM LOTE
    print_test("/api/teacher/grades/bulk", "POST", "Lançamento e publicação de notas em lote no SQLite")
    payload_notas = {
        "assessment_id": 1,
        "graded_by": "Prof. Carlos Mendes",
        "grades": [
            {"student_id": 1, "score": 9.8},
            {"student_id": 2, "score": 8.5}
        ]
    }
    s, res_notas = http_post("/api/teacher/grades/bulk", payload_notas)
    assert s == 201 and res_notas["status"] == "success"
    print(f"   ✅ [STATUS {s} OK] {res_notas['message']} ({res_notas['records_created']} registros criados no SQLite)")

    # 12. MÓDULO DOCENTE - REGISTRO DE CHAMADA EM LOTE
    print_test("/api/teacher/attendance/bulk", "POST", "Registro de chamada diária em lote no SQLite")
    payload_chamada = {
        "date": "2026-03-25",
        "subject": "Matemática",
        "classroom_id": 1,
        "records": [
            {"student_id": 1, "is_present": True},
            {"student_id": 2, "is_present": False, "justification": "Consulta médica"}
        ]
    }
    s, res_chamada = http_post("/api/teacher/attendance/bulk", payload_chamada)
    assert s == 201 and res_chamada["status"] == "success"
    print(f"   ✅ [STATUS {s} OK] {res_chamada['message']} ({res_chamada['records_count']} registros de frequência)")

    print_banner("🎉 100% DOS ENDPOINTS DA API RESTFUL E SWAGGER TESTADOS COM SUCESSO!")


if __name__ == "__main__":
    run_all_tests()
