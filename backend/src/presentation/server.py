"""
Servidor HTTP REST nativo do sistema TrAcEs.
Roteador desacoplado com suporte total a CORS e payloads JSON padronizados.
"""
import sys
import os
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from typing import Optional

# Garantir path raiz e encoding UTF-8 no Windows
if sys.platform == "win32":
    if sys.stdout.encoding != "utf-8":
        reconfig = getattr(sys.stdout, "reconfigure", None)
        if reconfig:
            reconfig(encoding="utf-8")

backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    from src.presentation.serializers import to_json, from_json
    from src.presentation.controllers import AppContext, AuthController, ParentController, TeacherController
    from src.presentation.seed_data import seed_database
    from src.presentation.openapi_spec import OPENAPI_SPEC, get_swagger_html
except ImportError:
    from src.infrastructure.api.serializers import to_json, from_json
    from src.infrastructure.api.controllers import AppContext, AuthController, ParentController, TeacherController
    from src.infrastructure.api.seed_data import seed_database
    from src.infrastructure.api.openapi_spec import OPENAPI_SPEC, get_swagger_html


class TracesAPIHandler(BaseHTTPRequestHandler):
    """Handler HTTP para requisições da API REST."""

    # Contexto compartilhado da aplicação
    ctx: Optional[AppContext] = None
    auth_ctrl: Optional[AuthController] = None
    parent_ctrl: Optional[ParentController] = None
    teacher_ctrl: Optional[TeacherController] = None

    @classmethod
    def setup_context(cls, db_path: Optional[str] = None):
        cls.ctx = AppContext(db_path)
        cls.auth_ctrl = AuthController(cls.ctx)
        cls.parent_ctrl = ParentController(cls.ctx)
        cls.teacher_ctrl = TeacherController(cls.ctx)

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("Content-Type", "application/json; charset=utf-8")

    def do_OPTIONS(self):
        """Trata requisições preflight do CORS."""
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def _send_json(self, data: any, status_code: int = 200):
        body = to_json(data).encode("utf-8")
        self.send_response(status_code)
        self._set_cors_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_html(self, html_content: str, status_code: int = 200):
        body = html_content.encode("utf-8")
        self.send_response(status_code)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _parse_body(self) -> dict:
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            return {}
        raw_body = self.rfile.read(content_length).decode("utf-8")
        try:
            return from_json(raw_body)
        except Exception:
            return {}

    def do_GET(self):
        """Trata requisições HTTP GET."""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        params = parse_qs(parsed_url.query)

        try:
            # 0. Documentação Interativa Swagger UI & OpenAPI Specification
            if path in ["/docs", "/swagger", "/docs/", "/swagger/", "/api/docs", "/api/swagger", "/api/docs/", "/api/swagger/"]:
                return self._send_html(get_swagger_html("/openapi.json"))

            if path in ["/openapi.json", "/api/openapi.json"]:
                return self._send_json(OPENAPI_SPEC)

            # 1. Health check
            if path == "/api/health" or path == "/api":
                return self._send_json({
                    "status": "ok",
                    "system": "TrAcEs — Trilha de Acompanhamento Estudantil API",
                    "version": "1.0.0",
                    "docs_url": "/docs",
                    "openapi_url": "/openapi.json"
                })

            # 2. Consulta de Dependentes do Responsável: GET /api/parent/dependents
            if path == "/api/parent/dependents":
                parent_id = int(params.get("parent_id", [1])[0])
                dependents = self.parent_ctrl.get_dependents(parent_id)
                return self._send_json(dependents)

            # 3. Boletim Escolar: GET /api/students/{student_id}/report-card
            if path.startswith("/api/students/") and path.endswith("/report-card"):
                parts = path.split("/")
                student_id = int(parts[3])
                year = int(params.get("year", [2026])[0])
                report = self.parent_ctrl.get_report_card(student_id, year)
                if "error" in report:
                    return self._send_json(report, report.get("code", 404))
                return self._send_json(report)

            # 4. Notas Detalhadas: GET /api/students/{student_id}/assessments
            if path.startswith("/api/students/") and path.endswith("/assessments"):
                parts = path.split("/")
                student_id = int(parts[3])
                subject = params.get("subject", ["Matemática"])[0]
                year = int(params.get("year", [2026])[0])
                details = self.parent_ctrl.get_detailed_assessments(student_id, subject, year)
                if "error" in details:
                    return self._send_json(details, details.get("code", 404))
                return self._send_json(details)

            # 5. Frequência e Calendário: GET /api/students/{student_id}/attendance
            if path.startswith("/api/students/") and path.endswith("/attendance"):
                parts = path.split("/")
                student_id = int(parts[3])
                subject = params.get("subject", ["Matemática"])[0]
                month = int(params.get("month", [3])[0])
                year = int(params.get("year", [2026])[0])
                att_cal = self.parent_ctrl.get_attendance_calendar(student_id, subject, month, year)
                if "error" in att_cal:
                    return self._send_json(att_cal, att_cal.get("code", 404))
                return self._send_json(att_cal)

            # 6. Mural de Avisos (Pais): GET /api/parent/announcements
            if path == "/api/parent/announcements":
                student_id = int(params.get("student_id", [None])[0]) if params.get("student_id", [None])[0] else None
                parent_id = int(params.get("parent_id", [None])[0]) if params.get("parent_id", [None])[0] else None
                announcements = self.parent_ctrl.get_announcements(student_id=student_id, parent_id=parent_id)
                return self._send_json(announcements)

            # 7. Escopo de Turmas do Docente: GET /api/teacher/classes
            if path == "/api/teacher/classes":
                teacher_id = int(params.get("teacher_id", [1])[0])
                classes = self.teacher_ctrl.get_classes(teacher_id)
                return self._send_json(classes)

            # 8. Listagem de Avaliações por Escopo: GET /api/teacher/assessments
            if path == "/api/teacher/assessments":
                subject = params.get("subject", ["Matemática"])[0]
                bimester = params.get("bimester", [None])[0]
                year = int(params.get("year", [2026])[0])
                assessments = self.teacher_ctrl.get_assessments_by_scope(subject, bimester, year)
                return self._send_json(assessments)

            # 9. Gestão de Avisos do Docente: GET /api/teacher/announcements
            if path == "/api/teacher/announcements":
                classroom_id = int(params.get("classroom_id", [None])[0]) if params.get("classroom_id", [None])[0] else None
                teacher_id = int(params.get("teacher_id", [None])[0]) if params.get("teacher_id", [None])[0] else None
                announcements = self.teacher_ctrl.get_announcements(classroom_id=classroom_id, teacher_id=teacher_id)
                return self._send_json(announcements)

            # Rota não encontrada
            return self._send_json({"error": "Endpoint não encontrado", "path": path}, 404)

        except Exception as e:
            return self._send_json({"error": "Erro interno no servidor", "details": str(e)}, 500)

    def do_POST(self):
        """Trata requisições HTTP POST."""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        body = self._parse_body()

        try:
            # 1. Login: POST /api/auth/login
            if path == "/api/auth/login":
                res = self.auth_ctrl.login(body)
                if "error" in res:
                    return self._send_json(res, res.get("code", 400))
                return self._send_json(res, 200)

            # 2. Lançamento de Notas em Lote (Docente): POST /api/teacher/grades/bulk
            if path == "/api/teacher/grades/bulk":
                res = self.teacher_ctrl.bulk_save_grades(body)
                if "error" in res:
                    return self._send_json(res, res.get("code", 400))
                return self._send_json(res, 201)

            # 3. Registro de Chamada em Lote (Docente): POST /api/teacher/attendance/bulk
            if path == "/api/teacher/attendance/bulk":
                res = self.teacher_ctrl.bulk_save_attendance(body)
                if "error" in res:
                    return self._send_json(res, res.get("code", 400))
                return self._send_json(res, 201)

            # 4. Adicionar Nova Avaliação Sequencial: POST /api/teacher/assessments/add ou POST /api/assessments
            if path in ["/api/teacher/assessments/add", "/api/assessments"]:
                res = self.teacher_ctrl.add_assessment(body)
                if "error" in res:
                    return self._send_json(res, res.get("code", 400))
                return self._send_json(res, 201)

            # 5. Criar Novo Aviso / Comunicado (Docente): POST /api/teacher/announcements
            if path == "/api/teacher/announcements":
                res = self.teacher_ctrl.create_announcement(body)
                if "error" in res:
                    return self._send_json(res, res.get("code", 400))
                return self._send_json(res, 201)

            # 6. Marcar Aviso como Lido (Responsável): POST /api/parent/announcements/{id}/read
            if path.startswith("/api/parent/announcements/") and path.endswith("/read"):
                parts = path.strip("/").split("/")
                try:
                    announcement_id = int(parts[3])
                    res = self.parent_ctrl.mark_announcement_as_read(announcement_id)
                    return self._send_json(res, 200)
                except (IndexError, ValueError):
                    return self._send_json({"error": "ID de aviso inválido", "code": 400}, 400)

            # 7. Atualizar Avaliação Existente (Docente): POST /api/teacher/assessments/update ou POST /api/teacher/assessments/{id}
            if path == "/api/teacher/assessments/update" or path.startswith("/api/teacher/assessments/"):
                av_id = body.get("assessment_id")
                if not av_id and len(path.split("/")) > 4:
                    try:
                        av_id = int(path.split("/")[4])
                    except ValueError:
                        pass
                if not av_id:
                    return self._send_json({"error": "assessment_id é obrigatório", "code": 400}, 400)
                res = self.teacher_ctrl.update_assessment(av_id, body)
                if "error" in res:
                    return self._send_json(res, res.get("code", 400))
                return self._send_json(res, 200)

            # Rota não encontrada
            return self._send_json({"error": "Endpoint não encontrado", "path": path}, 404)

        except Exception as e:
            return self._send_json({"error": "Erro interno no processamento", "details": str(e)}, 500)

    def do_PUT(self):
        """Trata requisições HTTP PUT."""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        body = self._parse_body()

        try:
            # 1. Atualizar Avaliação: PUT /api/teacher/assessments/{id} ou PUT /api/assessments/{id}
            if path.startswith("/api/teacher/assessments/") or path.startswith("/api/assessments/"):
                parts = path.strip("/").split("/")
                try:
                    av_id = int(parts[-1])
                    res = self.teacher_ctrl.update_assessment(av_id, body)
                    if "error" in res:
                        return self._send_json(res, res.get("code", 400))
                    return self._send_json(res, 200)
                except ValueError:
                    return self._send_json({"error": "ID de avaliação inválido na URL", "code": 400}, 400)

            # 2. Atualizar Aviso / Comunicado: PUT /api/teacher/announcements/{id}
            if path.startswith("/api/teacher/announcements/"):
                parts = path.strip("/").split("/")
                try:
                    announcement_id = int(parts[-1])
                    res = self.teacher_ctrl.update_announcement(announcement_id, body)
                    if "error" in res:
                        return self._send_json(res, res.get("code", 400))
                    return self._send_json(res, 200)
                except ValueError:
                    return self._send_json({"error": "ID de aviso inválido na URL", "code": 400}, 400)

            return self._send_json({"error": "Endpoint PUT não encontrado", "path": path}, 404)
        except Exception as e:
            return self._send_json({"error": "Erro interno no processamento", "details": str(e)}, 500)

    def log_message(self, format, *args):
        """Log formatado das requisições."""
        print(f"[API TrAcEs] {self.address_string()} - {format % args}")


def create_server(host: str = "127.0.0.1", port: int = 8000, db_path: Optional[str] = None) -> ThreadingHTTPServer:
    """Cria instância multithreaded configurada do servidor HTTP."""
    TracesAPIHandler.setup_context(db_path)
    return ThreadingHTTPServer((host, port), TracesAPIHandler)


def run_api_server(host: str = "127.0.0.1", port: int = 8000, db_path: Optional[str] = None):
    """Inicializa banco e executa o servidor em loop contínuo."""
    print("=" * 60)
    print("🚀 INICIALIZANDO SERVIDOR REST TRACES")
    print("=" * 60)
    seed_database(db_path)
    server = create_server(host, port, db_path)
    print(f"📡 Servidor API REST ativo em http://{host}:{port}")
    print(f"🔗 Healthcheck: http://{host}:{port}/api/health")
    print("Pressione Ctrl+C para encerrar.")
    print("=" * 60)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor encerrado.")
        server.server_close()


if __name__ == "__main__":
    run_api_server()
