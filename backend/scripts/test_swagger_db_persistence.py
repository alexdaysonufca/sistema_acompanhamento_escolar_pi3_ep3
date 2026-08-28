"""
Script de Teste de Integridade e Persistência Direta no Banco SQLite 3
Verifica inserções e alterações feitas via Swagger UI Live / API RESTful
"""
import sys
import os
import json
import sqlite3
import urllib.request
import urllib.parse

# Garantir UTF-8 no Windows
if sys.platform == "win32":
    if sys.stdout.encoding != "utf-8":
        reconfig = getattr(sys.stdout, "reconfigure", None)
        if reconfig:
            reconfig(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../src/infrastructure/school.db"))


def print_banner(title: str):
    print("\n" + "═" * 85)
    print(f"  {title.upper()}")
    print("═" * 85)


def http_get(path: str):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "Swagger-DB-Verifier/1.0"})
    with urllib.request.urlopen(req) as response:
        return response.status, json.loads(response.read().decode("utf-8"))


def http_post(path: str, payload: dict):
    url = f"{BASE_URL}{path}"
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data_bytes,
        headers={"Content-Type": "application/json", "User-Agent": "Swagger-DB-Verifier/1.0"},
        method="POST"
    )
    with urllib.request.urlopen(req) as response:
        return response.status, json.loads(response.read().decode("utf-8"))


def query_db(sql: str, params: tuple = ()):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(sql, params)
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


def run_persistence_verification():
    print_banner("🧪 Teste de Persistência em Banco de Dados SQLite 3 via Swagger UI Live")

    # =========================================================================
    # CENÁRIO 1: LANÇAMENTO / ALTERAÇÃO DE NOTAS
    # =========================================================================
    print_banner("1. Teste de Lançamento e Alteração de Notas (Grade Insertion & Mutation)")

    # 1.1 Consultar nota ANTES
    print("\n🔍 [PASSO 1.1] Consultando notas atuais no banco SQLite 3 para o Aluno 1 (João Silva)...")
    notas_antes_db = query_db(
        "SELECT g.grade_id, g.student_id, g.assessment_id, g.score, g.graded_by, a.title, a.subject "
        "FROM grades g JOIN assessments a ON g.assessment_id = a.assessment_id "
        "WHERE g.student_id = 1 AND g.assessment_id = 1"
    )
    score_antes = notas_antes_db[0]["score"] if notas_antes_db else None
    print(f"   📊 [SQL DIRECT SELECT] Nota atual no banco: {score_antes} (Avaliação: Prova Bimestral 1)")

    # 1.2 Alterar nota via POST Swagger /api/teacher/grades/bulk
    nova_nota_joao = 9.95
    nova_nota_ana = 8.85
    print(f"\n📡 [PASSO 1.2] Executando POST /api/teacher/grades/bulk (Swagger Try it Out)...")
    print(f"   📦 Payload: João Silva (ID 1) ➜ {nova_nota_joao} | Ana Silva (ID 2) ➜ {nova_nota_ana}")

    payload_grade = {
        "assessment_id": 1,
        "graded_by": "Prof. Carlos Mendes (Swagger Live)",
        "grades": [
            {"student_id": 1, "score": nova_nota_joao},
            {"student_id": 2, "score": nova_nota_ana}
        ]
    }
    status_code, res_post = http_post("/api/teacher/grades/bulk", payload_grade)
    print(f"   📥 [API RESPONSE {status_code} CREATED]: {res_post['message']}")

    # 1.3 Verificar gravação física no banco SQLite 3
    print("\n💾 [PASSO 1.3] Verificando gravação física na tabela 'grades' do arquivo SQLite (school.db)...")
    notas_depois_db = query_db(
        "SELECT g.grade_id, g.student_id, g.assessment_id, g.score, g.graded_by, g.graded_at "
        "FROM grades g WHERE g.student_id IN (1, 2) AND g.assessment_id = 1"
    )
    print("   🗄️ [REGISTROS FÍSICOS NO SQLITE]:")
    for row in notas_depois_db:
        print(f"      • ID: {row['grade_id']} | Aluno ID: {row['student_id']} | Nota Gravada: {row['score']} | Responsável: {row['graded_by']}")

    assert any(r["student_id"] == 1 and r["score"] == nova_nota_joao for r in notas_depois_db), "Nota de João não gravada no SQLite!"
    assert any(r["student_id"] == 2 and r["score"] == nova_nota_ana for r in notas_depois_db), "Nota de Ana não gravada no SQLite!"
    print("   ✅ [ASSERTION OK] Notas físicas gravadas e verificadas no banco com sucesso!")

    # 1.4 Consultar se a API reflete imediatamente o novo cálculo no Boletim
    print("\n🌐 [PASSO 1.4] Consultando GET /api/students/1/assessments via HTTP para validar média recalculada...")
    subj_enc = urllib.parse.quote("Matemática")
    _, res_assessments = http_get(f"/api/students/1/assessments?subject={subj_enc}&year=2026")
    bim1 = next(b for b in res_assessments["bimesters"] if b["bimester"] == "PRIMEIRO")
    av1_item = next(a for a in bim1["assessments"] if a["id"] == 1)
    print(f"   📈 [API RESPONSE]: Nova nota no Boletim = {av1_item['score']} | Nova Média Ponderada = {bim1['average']}")
    assert av1_item["score"] == nova_nota_joao
    print("   ✅ [ASSERTION OK] Cálculo pedagógico e visualização sincronizados em tempo real!")

    # =========================================================================
    # CENÁRIO 2: REGISTRO E ALTERAÇÃO DE FREQUÊNCIA
    # =========================================================================
    print_banner("2. Teste de Registro e Alteração de Frequência (Attendance Insertion)")

    # 2.1 Lançar chamada para uma data específica via POST Swagger
    data_teste = "2026-03-30"
    print(f"\n📡 [PASSO 2.1] Executando POST /api/teacher/attendance/bulk para o dia {data_teste} (Swagger Try it Out)...")
    payload_att = {
        "date": data_teste,
        "subject": "Matemática",
        "classroom_id": 1,
        "records": [
            {"student_id": 1, "is_present": True},
            {"student_id": 2, "is_present": False, "justification": "Atestado Médico Oftalmológico (Comprovado)"}
        ]
    }
    status_att, res_att = http_post("/api/teacher/attendance/bulk", payload_att)
    print(f"   📥 [API RESPONSE {status_att} CREATED]: {res_att['message']}")

    # 2.2 Verificar gravação física na tabela 'attendance' do banco SQLite 3
    print("\n💾 [PASSO 2.2] Verificando gravação física na tabela 'attendance' do SQLite...")
    att_db = query_db(
        "SELECT attendance_id, student_id, subject, attendance_date, is_present, is_justified, justification "
        "FROM attendance WHERE attendance_date = ? AND subject = ?",
        (data_teste, "Matemática")
    )
    print("   🗄️ [REGISTROS FÍSICOS NO SQLITE]:")
    for row in att_db:
        presenca_txt = "PRESENTE [P]" if row["is_present"] else "FALTA [F]"
        justif_txt = f" (Justificada: '{row['justification']}')" if row["is_justified"] else ""
        print(f"      • ID: {row['attendance_id']} | Aluno ID: {row['student_id']} | {presenca_txt}{justif_txt}")

    assert any(r["student_id"] == 1 and r["is_present"] == 1 for r in att_db), "Presença de João não encontrada no banco!"
    assert any(r["student_id"] == 2 and r["is_present"] == 0 and r["is_justified"] == 1 for r in att_db), "Falta justificada de Ana não encontrada!"
    print("   ✅ [ASSERTION OK] Registros de frequência persistidos com sucesso na base SQLite!")

    # 2.3 Consultar Calendário de Frequência via API
    print("\n🌐 [PASSO 2.3] Consultando GET /api/students/2/attendance para validar reflexo da falta justificada...")
    _, res_att_get = http_get(f"/api/students/2/attendance?subject={subj_enc}&month=3&year=2026")
    dia_30 = next((d for d in res_att_get["calendar"] if d["day"] == 30), None)
    print(f"   📅 [CALENDÁRIO GET]: Dia 30/03/2026 no perfil de Ana Silva = {dia_30['status']} (JUSTIFIED_ABSENCE)")
    assert dia_30 is not None and dia_30["status"] == "JUSTIFIED_ABSENCE"
    print("   ✅ [ASSERTION OK] Frequência confirmada na API e no banco SQLite!")

    print_banner("🎉 TODOS OS TESTES DE GRAVAÇÃO E PERSISTÊNCIA FÍSICA NO SQLITE FORAM APROVADOS!")


if __name__ == "__main__":
    run_persistence_verification()
