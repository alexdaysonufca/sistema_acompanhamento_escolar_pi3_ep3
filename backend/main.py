"""
Servidor Principal do Backend — TrAcEs (Clean Architecture & REST API)
Ponto de entrada oficial para execução do servidor backend e API REST.

Execução:
    python main.py              # Inicia o servidor RESTful na porta 8000
    python main.py --demo       # Executa demonstração CLI no terminal
"""

import os
import sys

# Configurar encoding UTF-8 no Windows
if sys.platform == "win32":
    if sys.stdout.encoding != "utf-8":
        reconfigure_stdout = getattr(sys.stdout, "reconfigure", None)
        if reconfigure_stdout:
            reconfigure_stdout(encoding="utf-8")
    if sys.stderr.encoding != "utf-8":
        reconfigure_stderr = getattr(sys.stderr, "reconfigure", None)
        if reconfigure_stderr:
            reconfigure_stderr(encoding="utf-8")

# Adicionar diretório raiz do backend ao sys.path
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from src.presentation.server import run_api_server
from src.presentation.seed_data import seed_database


def run_cli_demo():
    """Executa simulação de demonstração completa no terminal."""
    try:
        from scripts.test_crud_demonstracao import run_crud_demonstration
        run_crud_demonstration()
    except Exception as e:
        print(f"Erro ao executar demonstração: {e}")


def main():
    """Função principal de inicialização."""
    if "--demo" in sys.argv or "--cli" in sys.argv:
        run_cli_demo()
    else:
        # Modo Padrão: Iniciar Servidor RESTful na Porta 8000
        port = 8000
        host = "127.0.0.1"
        for arg in sys.argv:
            if arg.startswith("--port="):
                try:
                    port = int(arg.split("=")[1])
                except ValueError:
                    pass
            elif arg.startswith("--host="):
                host = arg.split("=")[1]

        run_api_server(host=host, port=port)


if __name__ == "__main__":
    main()
