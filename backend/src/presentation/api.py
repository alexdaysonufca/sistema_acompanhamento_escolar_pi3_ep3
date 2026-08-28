"""Instanciação de rotas, configuração de CORS e adaptadores de API REST do TrAcEs."""
from src.presentation.server import create_server, run_api_server, TracesAPIHandler
from src.presentation.controllers import AppContext, AuthController, ParentController, TeacherController
from src.presentation.openapi_spec import OPENAPI_SPEC

__all__ = [
    "create_server",
    "run_api_server",
    "TracesAPIHandler",
    "AppContext",
    "AuthController",
    "ParentController",
    "TeacherController",
    "OPENAPI_SPEC"
]
