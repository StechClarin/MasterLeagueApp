import os
import sys
import json
from urllib.parse import quote_plus

def main():
    """Run administrative tasks."""
    
    # --- INDUSTRIAL HUB ORCHESTRATION v2.0/v2.1 ---
    # Safe Config Injection from Stdin
    if os.environ.get("ETHER_HUB_PID"):
        try:
            line = sys.stdin.readline()
            if line:
                config = json.loads(line)
                os.environ['ETHER_SESSION_TOKEN'] = config.get('session_token', '')
                os.environ['ETHER_APP_PORT'] = str(config.get('app_port', 8000))
                os.environ['ETHER_TENANT_ID'] = config.get('tenant_id', '')
                os.environ['ETHER_HUB_API_KEY'] = config.get('hub_api_key', 'ethernanos-hub-secret-2026')
                
                db = config.get('db_config')
                if db:
                    # BLINDAGE: Encode password for URL safety (handles special chars like @ or :)
                    safe_pass = quote_plus(db['pass'])
                    os.environ['DATABASE_URL'] = f"postgres://{db['user']}:{safe_pass}@{db['host']}:{db['port']}/{db['name']}"
                
                print("[DEBUG] Hub Configuration received via STDIN.")
        except Exception as e:
            print(f"[DEBUG] Stdin config error: {e}")

    # Legacy args...
    hub_args = {'--app-port': 'ETHER_APP_PORT', '--tenant-id': 'ETHER_TENANT_ID'}
    for arg_key, env_key in hub_args.items():
        if arg_key in sys.argv:
            idx = sys.argv.index(arg_key)
            if idx + 1 < len(sys.argv):
                os.environ[env_key] = sys.argv.pop(idx + 1)
            sys.argv.remove(arg_key)

    # --- DATABASE_URL FALLBACK ---
    if not os.environ.get('DATABASE_URL'):
        db_path = os.path.join(os.path.abspath(os.curdir), 'db.sqlite3')
        os.environ['DATABASE_URL'] = f"sqlite:///{db_path}"

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    # --- MAINTENANCE & SETUP ---
    if "ether_setup" in sys.argv or "--ether-setup" in sys.argv:
        if "--ether-setup" in sys.argv:
            sys.argv = [sys.argv[0], 'ether_setup']
        try:
            import django
            django.setup()
            from django.core.management import execute_from_command_line
            execute_from_command_line(sys.argv)
            sys.exit(0)
        except Exception as e:
            print(f"CRITICAL: Ether Setup Failure ({e}).")
            sys.exit(1)

    # --- SECURITY HANDSHAKE (Shield) ---
    is_hub_mode = os.environ.get("ETHER_HUB_PID") is not None
    if is_hub_mode:
        try:
            from hub_security import verify_hub_handshake
            verify_hub_handshake()
            print("[DEBUG] Security Shield: ACTIVE.")
        except Exception as e:
            print(f"CRITICAL: Security Failure ({e}).")
            sys.exit(1)
    elif "runserver" in sys.argv:
        print("[WARNING] Local Dev Mode: Hub Security is BYPASSED.")

    # --- PRODUCTION MODE (Waitress) ---
    if is_hub_mode:
        try:
            import django
            django.setup()
            from config.wsgi import application
            from waitress import serve
            
            port = int(os.environ.get('ETHER_APP_PORT', 8000))
            print(f"[DEBUG] Starting Industrial WSGI Server on port {port}...")
            print("[HUB_SIGNAL:READY]") # REW: Ready signal for Rust
            sys.stdout.flush()
            
            serve(application, host='127.0.0.1', port=port, threads=4)
            sys.exit(0)
        except Exception as e:
            print(f"CRITICAL: WSGI Failure: {e}")
            sys.exit(1)

    # --- DEV MODE (Standard Django) ---
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError("Couldn't import Django.") from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
