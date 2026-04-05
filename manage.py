#!/usr/bin/env python
import os
import sys
import json

def main():
    """Run administrative tasks."""
    from pathlib import Path
    BASE_DIR = Path(__file__).resolve().parent
    
    # --- INDUSTRIAL CONFIGURATION: GLOBAL IDENTITY ---
    # Force UTF-8 for Windows compatibility with Unicode log symbols
    try:
        if sys.stdout.encoding.lower() != 'utf-8':
            sys.stdout.reconfigure(encoding='utf-8')
        if sys.stderr.encoding.lower() != 'utf-8':
            sys.stderr.reconfigure(encoding='utf-8')
    except:
        pass

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

    # --- HUB ORCHESTRATION: EARLY CONFIG CAPTURE (v2.7) ---
    is_hub_mode = os.environ.get("ETHER_HUB_PID") is not None
    is_setup_mode = "--ether-setup" in sys.argv
    
    if is_hub_mode:
        config = {}
        try:
            # Safer stdin detection
            if not sys.stdin.isatty():
                line = sys.stdin.readline()
                if line and line.strip():
                    config = json.loads(line)
                    print("[DEBUG] Hub Configuration received via STDIN.")
                    
                    # --- DYNAMIC ENV INJECTION ---
                    if "session_token" in config:
                        os.environ["ETHER_SESSION_TOKEN"] = str(config["session_token"])
                    if "tenant_id" in config:
                        os.environ["ETHER_TENANT_ID"] = str(config["tenant_id"])
                    if "hub_api_key" in config:
                        os.environ["HUB_API_KEY"] = str(config["hub_api_key"])
                        os.environ["ETHER_HUB_API_KEY"] = str(config["hub_api_key"])
                    
                    # --- DATABASE OVERRIDE ---
                    db = config.get("db_config")
                    if db:
                        db_url = f"postgres://{db['user']}:{db['pass']}@{db['host']}:{db['port']}/{db['name']}"
                        os.environ["DATABASE_URL"] = db_url
                        print("[DEBUG] Dynamic Database Configuration injected.")
        except Exception as e:
            print(f"[DEBUG] Stdin config error: {e}")

    # --- AUDIT: PATH DIAGNOSTICS (v4.3 DECOUPLED) ---
    # Trigger settings load ONLY AFTER environment injection
    from django.conf import settings
    if settings.DEBUG or os.environ.get('ETHER_HUB_PID'):
        frontend_dir = getattr(settings, 'FRONTEND_DIR', 'Unknown')
        static_root = getattr(settings, 'STATIC_ROOT_DIR', settings.STATIC_ROOT)
        
        # FORCE WORKING DIRECTORY to the core data folder
        try:
            os.chdir(getattr(settings, 'PROJECT_DATA_DIR', str(BASE_DIR)))
            print(f"[DEBUG] Working directory forced to: {os.getcwd()}")
        except Exception as e:
            print(f"[ERROR] Failed to force working directory: {e}")
            
        print(f"[DEBUG] INDUSTRIAL ROOT (_MEIPASS): {getattr(sys, '_MEIPASS', 'Not Frozen')}")
        print(f"[DEBUG] FRONTEND_DIR Found: {frontend_dir}")
        print(f"[DEBUG] STATIC_ROOT Resolved: {static_root}")
        print(f"[DEBUG] Security Shield: ACTIVE.")

    # --- SETUP MODE (Database Initialization) ---
    if is_setup_mode:
        # Map our custom flag to the real management command
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

    # --- PRODUCTION MODE (Waitress Orchestration) ---
    if is_hub_mode:
        try:
            import django
            django.setup()
            from config.wsgi import application
            from waitress import serve
            
            # Use injected port or fallback
            port = int(os.environ.get('ETHER_APP_PORT', 8000))
            
            # Fix Static Files Directory for PyInstaller
            base_dir = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
            static_root = os.path.join(base_dir, "_internal", "staticfiles")
            if not os.path.exists(static_root):
                try: os.makedirs(static_root, exist_ok=True)
                except: pass

            print(f"[DEBUG] Starting Industrial WSGI Server on port {port}...")
            print("[HUB_SIGNAL:READY]") 
            sys.stdout.flush()
            
            serve(application, host='0.0.0.0', port=port, threads=4)
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
