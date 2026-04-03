#!/usr/bin/env python
import os
import sys
import json

def main():
    """Run administrative tasks."""
    # --- INDUSTRIAL ORCHESTRATION (v2.6) ---
    is_setup_mode = "--ether-setup" in sys.argv
    if is_setup_mode:
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

    # --- PRODUCTION MODE (Waitress Orchestration) ---
    if is_hub_mode:
        config = {}
        try:
            # Safer stdin detection
            if not sys.stdin.isatty():
                line = sys.stdin.readline()
                if line and line.strip():
                    config = json.loads(line)
                    print("[DEBUG] Hub Configuration received via STDIN.")
        except Exception as e:
            print(f"[DEBUG] Stdin config error: {e}")

        try:
            import django
            django.setup()
            from config.wsgi import application
            from waitress import serve
            
            # Priority: STDIN JSON > ENV > Default (8000)
            port = int(config.get("app_port", os.environ.get('ETHER_APP_PORT', 8000)))
            
            # --- FIX: Industrial Static Files Directory logic ---
            # If running as PyInstaller bundle, use _MEIPASS, otherwise local path
            base_dir = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
            static_root = os.path.join(base_dir, "_internal", "staticfiles")
            
            # Fallback for OneDir mode
            if not os.path.exists(static_root):
                try:
                    os.makedirs(static_root, exist_ok=True)
                except:
                    pass

            print(f"[DEBUG] Starting Industrial WSGI Server on port {port}...")
            print("[HUB_SIGNAL:READY]") 
            sys.stdout.flush()
            
            # Bind to 0.0.0.0 for maximum accessibility, with Hub contacting 127.0.0.1
            serve(application, host='0.0.0.0', port=port, threads=4)
            sys.exit(0)
        except Exception as e:
            print(f"CRITICAL: WSGI Failure: {e}")
            sys.exit(1)

    # --- DEV MODE (Standard Django) ---
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
