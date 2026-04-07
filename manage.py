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

    # --- AUDIT: PATH DIAGNOSTICS (v4.4 WINDOWS) ---
    # Trigger settings load ONLY AFTER environment injection
    from django.conf import settings
    if settings.DEBUG or os.environ.get('ETHER_HUB_PID'):
        frontend_dir = os.path.normpath(str(getattr(settings, 'FRONTEND_DIR', 'Unknown')))
        active_static_root = os.path.normpath(str(settings.STATIC_ROOT))
        
        # FORCE WORKING DIRECTORY to the core data folder
        try:
            target_dir = os.path.abspath(getattr(settings, 'PROJECT_DATA_DIR', str(BASE_DIR)))
            if os.path.exists(target_dir):
                os.chdir(target_dir)
                print(f"[DEBUG] Working directory forced to: {os.getcwd()}")
            else:
                print(f"[WARNING] target_dir DOES NOT EXIST: {target_dir}")
        except Exception as e:
            print(f"[ERROR] Failed to force working directory: {e}")
            
        print(f"[DEBUG] INDUSTRIAL ROOT (_MEIPASS): {getattr(sys, '_MEIPASS', 'Not Frozen')}")
        print(f"[DEBUG] FRONTEND_SOURCE: {frontend_dir}")
        print(f"[DEBUG] STATIC_ROOT (Used by Django): {active_static_root}")
        
        # --- INDUSTRIAL AUTO-REPAIR: BULLETPROOF INDEX FIX (v5.3) ---
        # NOTE: We ONLY repair if we are NOT in the StatReloader child process 
        # to avoid infinite restart loops!
        if os.environ.get('RUN_MAIN') != 'true':
            def repair_index(d):
                if not d or d == 'Unknown': return
                idx = os.path.join(d, 'index.html')
                if os.path.exists(idx):
                    try:
                        import re
                        with open(idx, 'r', encoding='utf-8') as f: content = f.read()
                        
                        # Pattern robuste pour détecter <base href="...">
                        pattern = r'<base\s+href=["\'][^"\']*["\']'
                        
                        if re.search(pattern, content, re.IGNORECASE):
                            # On rétablit base href="/" pour le routeur Angular
                            new_content = re.sub(pattern, '<base href="/"', content, flags=re.IGNORECASE)
                            
                            # ASTUCE : Pour que les fichiers chargent sans changer la base, 
                            # on préfixe les scripts et links par /static/
                            new_content = re.sub(r'(src|href)=["\'](styles|main|polyfills|runtime|chunk-)', r'\1="/static/\2', new_content)
                            
                            # --- HUB HANDSHAKE INJECTION (v20.3) ---
                            session_token = os.environ.get("ETHER_SESSION_TOKEN")
                            if session_token and 'name="ether-session-token"' not in new_content:
                                meta_tag = f'<meta name="ether-session-token" content="{session_token}">'
                                new_content = new_content.replace('<head>', f'<head>{meta_tag}')
                                print(f"[DEBUG] SECURITY: session token INJECTED into {idx}")

                            if new_content != content:
                                with open(idx, 'w', encoding='utf-8') as f: f.write(new_content)
                                print(f"[DEBUG] SUCCESS: index.html STABILIZED at {idx}")
                            else:
                                print(f"[DEBUG] OK: index.html already clean at {idx}")
                        else:
                            new_content = content.replace('<head>', '<head><base href="/">')
                            with open(idx, 'w', encoding='utf-8') as f: f.write(new_content)
                            print(f"[DEBUG] OK: base href INJECTED at {idx}")
                    except Exception as e:
                        print(f"[ERROR] Failed to repair index.html: {e}")
            
            # On répare la source unifiée (parent process only)
            repair_index(active_static_root)
        else:
            print(f"[DEBUG] Skipping index repair (Reloader Active).")

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
            # Send signal as soon as Waitress starts
            print("[HUB_SIGNAL:READY]") 
            sys.stdout.flush()
            
            # Use high-concurrency mode (32 threads) to avoid Hub-side timeouts
            serve(application, host='0.0.0.0', port=port, threads=32)
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
