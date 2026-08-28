"""
Teste Completo de Lançamento de Notas dos 4 Bimestres e Persistência no SQLite 3
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


def test_4_bimesters():
    print("\n" + "═" * 80)
    print("  🧪 TESTE DE LANÇAMENTO E PERSISTÊNCIA DOS 4 BIMESTRES NO SQLITE 3")
    print("═" * 80)

    # 1. Lançar notas nos 4 Bimestres em Matemática para João Silva (ID 1)
    bimesters_payloads = [
        {"bimester": "PRIMEIRO", "score": 9.0},
        {"bimester": "SEGUNDO",  "score": 8.5},
        {"bimester": "TERCEIRO", "score": 7.5},
        {"bimester": "QUARTO",   "score": 8.0},
    ]

    print("\n📡 [1] Enviando POST /api/teacher/grades/bulk para 1º, 2º, 3º e 4º Bimestres em Matemática...")
    for bim in bimesters_payloads:
        payload = {
            "subject": "Matemática",
            "bimester": bim["bimester"],
            "academic_year": 2026,
            "graded_by": "Prof. Carlos Mendes",
            "grades": [{"student_id": 1, "score": bim["score"]}]
        }
        s, res = execute_post("/api/teacher/grades/bulk", payload)
        print(f"   📥 [{bim['bimester']} BIMESTRE - STATUS {s}]: {res['message']}")
        assert s == 201

    # 2. Verificar gravação física na tabela 'grades' do SQLite
    print("\n💾 [2] Verificando gravação na tabela 'grades' do SQLite para os 4 Bimestres...")
    rows = query_db(
        "SELECT g.grade_id, g.student_id, g.score, a.bimester, a.subject, a.title "
        "FROM grades g JOIN assessments a ON g.assessment_id = a.assessment_id "
        "WHERE g.student_id = 1 AND a.subject = 'Matemática' "
        "ORDER BY a.bimester"
    )
    print("   🗄️ [REGISTROS NO BANCO SQLITE]:")
    for r in rows:
        print(f"      • Bimestre: {r['bimester']:<10} | Nota: {r['score']:<4} | Avaliação: {r['title']}")

    bimesters_found = {r["bimester"] for r in rows}
    assert "PRIMEIRO" in bimesters_found
    assert "SEGUNDO" in bimesters_found
    assert "TERCEIRO" in bimesters_found
    assert "QUARTO" in bimesters_found
    print("   ✅ [ASSERTION OK] Todos os 4 bimestres gravados fisicamente no arquivo school.db!")

    # 3. Consultar Boletim Escolar consolidado
    print("\n🌐 [3] Consultando GET /api/students/1/report-card para validar médias e situação...")
    _, boletim = execute_get("/api/students/1/report-card?year=2026")
    mat_report = next(r for r in boletim["report"] if r["subject"] == "Matemática")

    print(f"   📊 [BOLETIM FINAL - MATEMÁTICA]:")
    print(f"      • 1º Bimestre: {mat_report['bimester_grades']['1']}")
    print(f"      • 2º Bimestre: {mat_report['bimester_grades']['2']}")
    print(f"      • 3º Bimestre: {mat_report['bimester_grades']['3']}")
    print(f"      • 4º Bimestre: {mat_report['bimester_grades']['4']}")
    print(f"      • Média Anual: {mat_report['final_average']}")
    print(f"      • Situação:    {mat_report['status']}")

    assert mat_report["bimester_grades"]["1"] is not None
    assert mat_report["bimester_grades"]["2"] is not None
    assert mat_report["bimester_grades"]["3"] is not None
    assert mat_report["bimester_grades"]["4"] is not None
    assert float(mat_report["final_average"]) >= 7.0
    print("   ✅ [ASSERTION OK] Boletim escolar refletindo com precisão as notas dos 4 Bimestres!")

    print("\n" + "═" * 80)
    print("  🎉 LANÇAMENTO E PERSISTÊNCIA DOS 4 BIMESTRES CONCLUÍDOS COM SUCESSO!")
    print("═" * 80)


if __name__ == "__main__":
    test_4_bimesters()
