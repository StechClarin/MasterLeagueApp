import os
import sys
import json

def main():
    """Run administrative tasks."""
    
    # --- INDUSTRIAL HUB ORCHESTRATION v2.0 ---
    # If launched by the Hub, read encrypted/sensitive config from STDIN
    if os.environ.get("ETHER_HUB_PID"):
        try:
            # We expect a JSON line on stdin immediately
            line = sys.stdin.readline()
            if line:
                config = json.loads(line)
                os.environ['ETHER_SESSION_TOKEN'] = config.get('session_token', '')
                os.environ['ETHER_APP_PORT'] = str(config.get('app_port', 8000))
                os.environ['ETHER_TENANT_ID'] = config.get('tenant_id', '')
                os.environ['ETHER_HUB_API_KEY'] = config.get('hub_api_key', 'ethernanos-hub-secret-2026')
                
                db = config.get('db_config')
                if db:
                    os.environ['DATABASE_URL'] = f"postgres://{db['user']}:{db['pass']}@{db['host']}:{db['port']}/{db['name']}"
                
                print("[DEBUG] Hub Configuration received via STDIN.")
        except Exception as e:
            print(f"[DEBUG] Stdin config error: {e}")

    # --- LEGACY ARG INTERCEPTION (For manual Dev mode) ---
    hub_args = {
        '--app-port': 'ETHER_APP_PORT',
        '--tenant-id': 'ETHER_TENANT_ID',
    }
    new_argv = []
    i = 0
    argv = sys.argv
    while i < len(argv):
        arg = argv[i]
        if arg in hub_args and i + 1 < len(argv):
            os.environ[hub_args[arg]] = argv[i+1]
            i += 2
        else:
            new_argv.append(arg)
            i += 1
    sys.argv = new_argv

    # --- DATABASE_URL FALLBACK (Absolute SQLite) ---
    if not os.environ.get('DATABASE_URL'):
        db_path = os.path.join(os.path.abspath(os.curdir), 'db.sqlite3')
        os.environ['DATABASE_URL'] = f"sqlite:///{db_path}"

    # --- ETHER-SETUP (Maintenance) ---
    if "ether_setup" in sys.argv:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        try:
            import django
            django.setup()
            from django.core.management import execute_from_command_line
            execute_from_command_line(sys.argv)
            sys.exit(0)
        except Exception as e:
            print(f"CRITICAL: Ether Setup Failure ({e}).")
            sys.exit(1)

    # --- SECURITY HANDSHAKE (The Shield) ---
    is_runserver = "runserver" in sys.argv or os.environ.get("ETHER_HUB_PID")
    if is_runserver:
        try:
            from hub_security import verify_hub_handshake
            if verify_hub_handshake():
                print("[DEBUG] Security Handshake: SUCCESS.")
        except Exception as e:
            print(f"CRITICAL: Security Subsystem Failure ({e}).")
            sys.exit(1)

    # --- PRODUCTION WSGI SERVER (Waitress) ---
    # In Hub mode, we use Waitress instead of runserver
    if os.environ.get("ETHER_HUB_PID"):
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        try:
            import django
            django.setup()
            from config.wsgi import application
            from waitress import serve
            
            port = int(os.environ.get('ETHER_APP_PORT', 8000))
            print(f"[DEBUG] Starting Industrial WSGI Server (Waitress) on port {port}...")
            
            # THE REVOLUTION: The Ready Signal
            # This line tells Rust to open the UI immediately
            print("[HUB_SIGNAL:READY]")
            sys.stdout.flush()
            
            serve(application, host='127.0.0.1', port=port, threads=4)
            sys.exit(0)
        except Exception as e:
            print(f"CRITICAL: WSGI Server Failure: {e}")
            sys.exit(1)

    # --- DEVELOPMENT RELOAD MODE (Fallback for manual runserver) ---
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError("Couldn't import Django.") from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
