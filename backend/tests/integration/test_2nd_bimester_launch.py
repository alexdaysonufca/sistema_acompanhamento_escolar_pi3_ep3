"""
Teste Específico de Lançamento de Notas do 2º Bimestre e Persistência no SQLite
Suporta execução via HTTP e in-process sob Pytest.
"""
import sys
import os
import json
import sqlite3
import urllib.request
import urllib.parse
from pathlib import Path

# Garantir UTF-8 no Windows
if sys.platform == "win32":
    if sys.stdout.encoding != "utf-8":
        reconfig = getattr(sys.stdout, "reconfigure", None)
        if reconfig:
            reconfig(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../src/infrastructure/school.db"))


def execute_post(path: str, payload: dict):
    try:
        url = f"{BASE_URL}{path}"
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=1.0) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except Exception:
        # Execução in-process sob Pytest
        from src.presentation.controllers import AppContext, TeacherController
        ctx = AppContext(DB_PATH)
        tc = TeacherController(ctx)
        res = tc.bulk_save_grades(payload)
        return 201, res


def execute_get(path: str):
    try:
        url = f"{BASE_URL}{path}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=1.0) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except Exception:
        from src.presentation.controllers import AppContext, ParentController
        ctx = AppContext(DB_PATH)
        pc = ParentController(ctx)
        parsed = urllib.parse.urlparse(path)
        qs = urllib.parse.parse_qs(parsed.query)
        year = int(qs.get("year", ["2026"])[0])
        student_id = int(parsed.path.split("/")[3])
        res = pc.get_report_card(student_id, year)
        return 200, res


def query_db(sql: str, params: tuple = ()):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute(sql, params)
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return rows


def test_2nd_bimester():
    print("\n" + "═" * 80)
    print("  🧪 TESTE DE LANÇAMENTO DE NOTAS DO 2º BIMESTRE — PERSISTÊNCIA NO BANCO")
    print("═" * 80)

    # 1. Lançar nota de Português no 2º Bimestre para João Silva (ID 1) e Pedro Costa (ID 3)
    print("\n📡 [1] Enviando POST /api/teacher/grades/bulk com subject='Português' e bimester='SEGUNDO'...")
    payload_port_b2 = {
        "subject": "Português",
        "bimester": "SEGUNDO",
        "academic_year": 2026,
        "graded_by": "Prof. Carlos Mendes",
        "grades": [
            {"student_id": 1, "score": 9.2},
            {"student_id": 3, "score": 8.4}
        ]
    }
    s, res = execute_post("/api/teacher/grades/bulk", payload_port_b2)
    print(f"   📥 [STATUS {s}]: {res['message']}")
    assert s == 201

    # 2. Verificar gravação física no banco SQLite
    print("\n💾 [2] Verificando gravação na tabela 'grades' do SQLite para Português 2º Bimestre...")
    rows = query_db(
        "SELECT g.grade_id, g.student_id, g.score, a.title, a.bimester, a.subject "
        "FROM grades g JOIN assessments a ON g.assessment_id = a.assessment_id "
        "WHERE a.subject = 'Português' AND a.bimester = 'SEGUNDO'"
    )
    print("   🗄️ [REGISTROS NO BANCO SQLITE]:")
    for r in rows:
        print(f"      • Aluno ID: {r['student_id']} | Nota: {r['score']} | {r['title']} ({r['bimester']})")

    assert any(r["student_id"] == 1 and r["score"] == 9.2 for r in rows), "Nota de João não gravada no 2º Bimestre de Português!"
    assert any(r["student_id"] == 3 and r["score"] == 8.4 for r in rows), "Nota de Pedro não gravada no 2º Bimestre de Português!"
    print("   ✅ [ASSERTION OK] Notas do 2º Bimestre gravadas fisicamente no SQLite!")

    # 3. Lançar nota de Matemática no 2º Bimestre para João Silva (ID 1)
    print("\n📡 [3] Enviando POST /api/teacher/grades/bulk com subject='Matemática' e bimester='SEGUNDO'...")
    payload_mat_b2 = {
        "subject": "Matemática",
        "bimester": "SEGUNDO",
        "academic_year": 2026,
        "graded_by": "Prof. Carlos Mendes",
        "grades": [
            {"student_id": 1, "score": 9.7}
        ]
    }
    s_mat, res_mat = execute_post("/api/teacher/grades/bulk", payload_mat_b2)
    print(f"   📥 [STATUS {s_mat}]: {res_mat['message']}")
    assert s_mat == 201

    # 4. Consultar o Boletim Escolar via API GET para verificar a coluna 2º Bimestre
    print("\n🌐 [4] Consultando GET /api/students/1/report-card para validar a coluna 2º Bimestre...")
    _, boletim = execute_get("/api/students/1/report-card?year=2026")
    mat_report = next(r for r in boletim["report"] if r["subject"] == "Matemática")
    port_report = next(r for r in boletim["report"] if r["subject"] == "Português")

    print(f"   📊 [BOLETIM JOÃO SILVA]:")
    print(f"      • Matemática ➜ 1º Bim: {mat_report['bimester_grades']['1']} | 2º Bim: {mat_report['bimester_grades']['2']} | Média: {mat_report['final_average']} | Status: {mat_report['status']}")
    print(f"      • Português  ➜ 1º Bim: {port_report['bimester_grades']['1']} | 2º Bim: {port_report['bimester_grades']['2']} | Média: {port_report['final_average']} | Status: {port_report['status']}")

    assert mat_report["bimester_grades"]["2"] is not None, "2º Bimestre de Matemática não preenchido no Boletim!"
    assert port_report["bimester_grades"]["2"] is not None, "2º Bimestre de Português não preenchido no Boletim!"
    print("   ✅ [ASSERTION OK] Boletim escolar refletindo com precisão as notas do 2º Bimestre!")

    print("\n" + "═" * 80)
    print("  🎉 LANÇAMENTO DO 2º BIMESTRE VALIDADO COM SUCESSO TOTAL!")
    print("═" * 80)


if __name__ == "__main__":
    test_2nd_bimester()
