"""
Servidor Principal do Backend — TrAcEs (Clean Architecture & REST API)
Ponto de entrada oficial para execução do servidor backend e API REST.

Execução:
    python main.py              # Inicia o servidor com auto-reload inteligente em desenvolvimento
    python main.py --no-reload  # Inicia sem auto-reload
    python main.py --demo       # Executa demonstração CLI no terminal
"""

import os
import sys
import time
import subprocess

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


def _get_py_mtimes():
    """Coleta timestamps de modificação de todos os arquivos .py do backend."""
    mtimes = {}
    for root, dirs, files in os.walk(backend_dir):
        dirs[:] = [d for d in dirs if d not in ("__pycache__", ".pytest_cache", ".venv", "venv", ".git")]
        for f in files:
            if f.endswith(".py"):
                path = os.path.join(root, f)
                try:
                    mtimes[path] = os.path.getmtime(path)
                except OSError:
                    pass
    return mtimes


def run_with_reloader(host: str, port: int):
    """Executa o servidor com monitoramento de arquivos e reinício automático."""
    if os.environ.get("TRACES_RELOAD_CHILD") == "1":
        run_api_server(host=host, port=port)
        return

    print("🚀 [TrAcEs Watcher] Auto-reload ativo em desenvolvimento (Ctrl+S para recarregar)...")
    while True:
        env = os.environ.copy()
        env["TRACES_RELOAD_CHILD"] = "1"
        env["HOST"] = host
        env["PORT"] = str(port)

        args = [sys.executable, os.path.abspath(__file__)] + sys.argv[1:]
        proc = subprocess.Popen(args, env=env)
        initial_mtimes = _get_py_mtimes()

        reloaded = False
        try:
            while proc.poll() is None:
                time.sleep(0.8)
                current_mtimes = _get_py_mtimes()
                changed = [p for p, mt in current_mtimes.items() if initial_mtimes.get(p) != mt]
                new_files = [p for p in current_mtimes if p not in initial_mtimes]
                if changed or new_files:
                    changed_file = (changed or new_files)[0]
                    rel = os.path.relpath(changed_file, backend_dir)
                    print(f"\n🔄 [TrAcEs Watcher] Alteração detectada em '{rel}'. Recarregando backend...")
                    proc.terminate()
                    try:
                        proc.wait(timeout=2)
                    except subprocess.TimeoutExpired:
                        proc.kill()
                    reloaded = True
                    break
        except KeyboardInterrupt:
            proc.terminate()
            try:
                proc.wait(timeout=2)
            except subprocess.TimeoutExpired:
                proc.kill()
            break

        if not reloaded:
            break


def main():
    """Função principal de inicialização."""
    if "--demo" in sys.argv or "--cli" in sys.argv:
        run_cli_demo()
        return

    # Permite sobrescrever via terminal/contêiner ou assume padrão local
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    # Identifica se é ambiente de desenvolvimento (padrão: True)
    is_dev = os.getenv("ENV", "development").lower() == "development"
    no_reload = "--no-reload" in sys.argv
    force_reload = "--reload" in sys.argv

    for arg in sys.argv:
        if arg.startswith("--port="):
            try:
                port = int(arg.split("=")[1])
            except ValueError:
                pass
        elif arg.startswith("--host="):
            host = arg.split("=")[1]

    # reload ativo por padrão no ambiente de desenvolvimento
    use_reload = (is_dev or force_reload) and not no_reload

    if use_reload:
        run_with_reloader(host=host, port=port)
    else:
        run_api_server(host=host, port=port)


if __name__ == "__main__":
    main()


