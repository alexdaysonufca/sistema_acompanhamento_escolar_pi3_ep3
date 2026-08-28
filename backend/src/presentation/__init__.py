"""Módulo da Camada de Apresentação (Presentation / Interface Adapters) do TrAcEs.

Responsável por controladores REST, manipuladores de rotas HTTP,
serialização JSON e documentação OpenAPI.
"""
from src.presentation.server import create_server, run_api_server
from src.presentation.controllers import AppContext, AuthController, ParentController, TeacherController
from src.presentation.openapi_spec import OPENAPI_SPEC

__all__ = [
    "create_server",
    "run_api_server",
    "AppContext",
    "AuthController",
    "ParentController",
    "TeacherController",
    "OPENAPI_SPEC"
]
