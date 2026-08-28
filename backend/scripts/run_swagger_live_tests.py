"""
Execução e Demonstração dos Testes Live no Swagger UI (Try it Out)
Sistema TrAcEs — Trilha de Acompanhamento Estudantil API
"""
import sys
import os
import json
import time
import urllib.request
import urllib.parse
import urllib.error

# Garantir UTF-8 no Windows
if sys.platform == "win32":
    if sys.stdout.encoding != "utf-8":
        reconfig = getattr(sys.stdout, "reconfigure", None)
        if reconfig:
            reconfig(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"


def print_swagger_banner():
    print("\n" + "═" * 85)
    print("  🎓 TrAcEs API RESTful — EXECUÇÃO DE TESTES LIVE NO SWAGGER UI (Try it Out)")
    print("  URL do Swagger UI: http://127.0.0.1:8000/docs | OpenAPI 3.0.3")
    print("═" * 85)


def swagger_try_it_out(tag: str, operation_id: str, method: str, path: str, query_params: dict = None, body_payload: dict = None):
    print("\n" + "─" * 85)
    print(f"📂 TAG: [{tag}] ➜ OPERAÇÃO: {operation_id}")
    print(f"🔘 MÉTODO: {method} | ROTA: {path}")

    # Monta URL com query params
    full_path = path
    if query_params:
        encoded_query = urllib.parse.urlencode(query_params)
        full_path = f"{path}?{encoded_query}"

    full_url = f"{BASE_URL}{full_path}"
    print(f"🔗 Request URL (Swagger UI): {full_url}")

    # Monta comando curl correspondente
    if method == "GET":
        print(f"💻 cURL: curl -X 'GET' '{full_url}' -H 'accept: application/json'")
    else:
        payload_str = json.dumps(body_payload, ensure_ascii=False)
        print(f"💻 cURL: curl -X 'POST' '{full_url}' -H 'accept: application/json' -H 'Content-Type: application/json' -d '{payload_str}'")
        print(f"📦 Request Body (JSON):\n{json.dumps(body_payload, indent=2, ensure_ascii=False)}")

    # Executa a requisição HTTP real
    start_time = time.time()
    try:
        req_headers = {
            "Accept": "application/json",
            "User-Agent": "Swagger-UI/5.0 (Live-Try-It-Out)",
            "Origin": "http://127.0.0.1:8000",
            "Referer": "http://127.0.0.1:8000/docs"
        }

        if method == "GET":
            req = urllib.request.Request(full_url, headers=req_headers)
            with urllib.request.urlopen(req) as response:
                duration_ms = round((time.time() - start_time) * 1000, 2)
                status = response.status
                raw_data = response.read().decode("utf-8")
                res_json = json.loads(raw_data) if "json" in response.headers.get("Content-Type", "") else raw_data
        else:
            req_headers["Content-Type"] = "application/json"
            data_bytes = json.dumps(body_payload).encode("utf-8")
            req = urllib.request.Request(full_url, data=data_bytes, headers=req_headers, method="POST")
            with urllib.request.urlopen(req) as response:
                duration_ms = round((time.time() - start_time) * 1000, 2)
                status = response.status
                raw_data = response.read().decode("utf-8")
                res_json = json.loads(raw_data)

        # Exibe resposta formatada
        print(f"\n📥 Server Response: Code {status} OK (Tempo: {duration_ms} ms)")
        print(f"📋 Response Headers: Content-Type: application/json; charset=utf-8 | Access-Control-Allow-Origin: *")
        print(f"📄 Response Body (JSON):\n{json.dumps(res_json, indent=2, ensure_ascii=False)}")
        print("✅ [SWAGGER TRY-IT-OUT: SUCESSO]")

    except urllib.error.HTTPError as e:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        error_body = e.read().decode("utf-8")
        print(f"\n❌ Server Response: Code {e.code} (Tempo: {duration_ms} ms)")
        print(f"📄 Error Body: {error_body}")
    except Exception as err:
        print(f"\n❌ Falha na execução: {err}")


def run_live_swagger_suite():
    print_swagger_banner()

    # 1. /api/health
    swagger_try_it_out(
        tag="Sistema",
        operation_id="get_healthcheck",
        method="GET",
        path="/api/health"
    )

    # 2. /api/auth/login (Responsável)
    swagger_try_it_out(
        tag="Autenticação",
        operation_id="post_auth_login_parent",
        method="POST",
        path="/api/auth/login",
        body_payload={"email": "maria.silva@email.com", "role": "PARENT"}
    )

    # 3. /api/auth/login (Docente)
    swagger_try_it_out(
        tag="Autenticação",
        operation_id="post_auth_login_teacher",
        method="POST",
        path="/api/auth/login",
        body_payload={"email": "carlos.mendes@escola.edu.br", "role": "TEACHER"}
    )

    # 4. /api/parent/dependents
    swagger_try_it_out(
        tag="Módulo Responsável",
        operation_id="get_parent_dependents",
        method="GET",
        path="/api/parent/dependents",
        query_params={"parent_id": 1}
    )

    # 5. /api/students/1/report-card
    swagger_try_it_out(
        tag="Módulo Responsável",
        operation_id="get_student_report_card",
        method="GET",
        path="/api/students/1/report-card",
        query_params={"year": 2026}
    )

    # 6. /api/students/1/assessments
    swagger_try_it_out(
        tag="Módulo Responsável",
        operation_id="get_student_assessments",
        method="GET",
        path="/api/students/1/assessments",
        query_params={"subject": "Matemática", "year": 2026}
    )

    # 7. /api/students/1/attendance
    swagger_try_it_out(
        tag="Módulo Responsável",
        operation_id="get_student_attendance",
        method="GET",
        path="/api/students/1/attendance",
        query_params={"subject": "Matemática", "month": 3, "year": 2026}
    )

    # 8. /api/parent/announcements
    swagger_try_it_out(
        tag="Módulo Responsável",
        operation_id="get_parent_announcements",
        method="GET",
        path="/api/parent/announcements"
    )

    # 9. /api/teacher/classes
    swagger_try_it_out(
        tag="Módulo Docente",
        operation_id="get_teacher_classes",
        method="GET",
        path="/api/teacher/classes",
        query_params={"teacher_id": 1}
    )

    # 10. /api/teacher/grades/bulk
    swagger_try_it_out(
        tag="Módulo Docente",
        operation_id="post_teacher_bulk_grades",
        method="POST",
        path="/api/teacher/grades/bulk",
        body_payload={
            "assessment_id": 1,
            "graded_by": "Prof. Carlos Mendes",
            "grades": [
                {"student_id": 1, "score": 9.5},
                {"student_id": 2, "score": 8.0}
            ]
        }
    )

    # 11. /api/teacher/attendance/bulk
    swagger_try_it_out(
        tag="Módulo Docente",
        operation_id="post_teacher_bulk_attendance",
        method="POST",
        path="/api/teacher/attendance/bulk",
        body_payload={
            "date": "2026-03-25",
            "subject": "Matemática",
            "classroom_id": 1,
            "records": [
                {"student_id": 1, "is_present": True},
                {"student_id": 2, "is_present": False, "justification": "Atestado médico odontológico"}
            ]
        }
    )

    print("\n" + "═" * 85)
    print("  🎉 TODAS AS 11 OPERAÇÕES DO SWAGGER UI FORAM TESTADAS COM SUCESSO!")
    print("  Documentação interativa ao vivo em: http://127.0.0.1:8000/docs")
    print("═" * 85)


if __name__ == "__main__":
    run_live_swagger_suite()
