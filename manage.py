#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Django management script with UTF-8 encoding enforcement
"""
import os
import sys
import json

# --- CRITICAL: Force UTF-8 encoding BEFORE any other imports ---
os.environ.setdefault('PYTHONIOENCODING', 'utf-8')
os.environ.setdefault('PYTHONDEFAULTENCODING', 'utf-8')
os.environ.setdefault('PYTHONUTF8', '1')

def main():
    """Run administrative tasks."""
    from pathlib import Path
    BASE_DIR = Path(__file__).resolve().parent
    
    # --- INDUSTRIAL CONFIGURATION: GLOBAL IDENTITY ---
    # Force UTF-8 for Windows compatibility with Unicode log symbols
    try:
        if hasattr(sys.stdout, 'reconfigure') and sys.stdout.encoding.lower() != 'utf-8':
            sys.stdout.reconfigure(encoding='utf-8')  # type: ignore
        if hasattr(sys.stderr, 'reconfigure') and sys.stderr.encoding.lower() != 'utf-8':
            sys.stderr.reconfigure(encoding='utf-8')  # type: ignore
        if hasattr(sys.stdin, 'reconfigure') and sys.stdin.encoding.lower() != 'utf-8':
            sys.stdin.reconfigure(encoding='utf-8', errors='replace')  # type: ignore
    except Exception:
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
                try:
                    # On tente de lire une ligne de config
                    line = sys.stdin.readline()
                    if line and line.strip():
                        config = json.loads(line)
                        print("[DEBUG] Hub Configuration received via STDIN.")
                except UnicodeDecodeError as ude:
                    print(f"[ERROR] Stdin Encoding Error: {ude}")
                    # En cas d'erreur de décodage, on tente une lecture brute si possible
                    # Mais normalement reconfigure(errors='replace') gère déjà ça.
                except Exception as e:
                    print(f"[DEBUG] Stdin read error: {e}")

            # --- DYNAMIC ENV INJECTION ---
            if "session_token" in config:
                os.environ["ETHER_SESSION_TOKEN"] = str(config["session_token"])
            if "tenant_id" in config:
                os.environ["ETHER_TENANT_ID"] = str(config["tenant_id"])
            if "hub_api_key" in config:
                os.environ["HUB_API_KEY"] = str(config["hub_api_key"])
                os.environ["ETHER_HUB_API_KEY"] = str(config["hub_api_key"])

            if "cloud_api_url" in config and config["cloud_api_url"]:
                os.environ["ETHER_CLOUD_API_URL"] = str(config["cloud_api_url"])

            if "admin_pass" in config:
                os.environ["ADMIN_DEFAULT_PASSWORD"] = str(config["admin_pass"])

            # --- ROUTING SYNC (v22.2) ---
            # On capture le préfixe envoyé par le Launcher (ex: /schoolmanage/test/)
            if "url_prefix" in config:
                prefix = str(config["url_prefix"])
                if not prefix.startswith('/'):
                    prefix = '/' + prefix
                if not prefix.endswith('/'):
                    prefix = prefix + '/'
                os.environ["ETHER_APP_PREFIX"] = prefix

            # --- DATABASE OVERRIDE ---
            db = config.get("db_config")
            if db:
                engine = db.get("engine", "postgres")
                if engine == "sqlite":
                    db_name = db.get("name", "db.sqlite3")
                    os.environ["DATABASE_URL"] = f"sqlite:///{db_name}"
                else:
                    import urllib.parse
                    db_user = urllib.parse.quote_plus(str(db.get('user', '')))
                    db_pass = urllib.parse.quote_plus(str(db.get('password', '')))
                    db_host = str(db.get('host', ''))
                    db_port = str(db.get('port', ''))
                    db_name = urllib.parse.quote_plus(str(db.get('name', '')))
                    db_url = f"postgres://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
                    os.environ["DATABASE_URL"] = db_url
                    # Force English messages to avoid encoding issues with localized error messages (e.g. French accents)
                    os.environ["LC_ALL"] = "C"
                    os.environ["LC_MESSAGES"] = "C"
                    os.environ["LANG"] = "C"
                    os.environ.setdefault("PGCLIENTENCODING", "UTF8")
                    print(f"[DEBUG] Environment forced to LC_ALL=C for Postgres safety.")
                    print(f"[DEBUG] DATABASE_URL repr={db_url!r}")
                    print(f"[DEBUG] DATABASE CONFIG user={db_user!r} host={db_host!r} port={db_port!r} name={db_name!r}")
                print(f"[DEBUG] Dynamic Database Configuration ({engine}) injected.")
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
                            if session_token:
                                meta_tag = f'<meta name="ether-session-token" content="{session_token}">'
                                if 'name="ether-session-token"' in new_content:
                                    import re
                                    new_content = re.sub(
                                        r'<meta\s+name=["\']ether-session-token["\']\s+content=["\'][^"\']*["\']\s*/?>',
                                        meta_tag,
                                        new_content,
                                        flags=re.IGNORECASE,
                                    )
                                    print(f"[DEBUG] SECURITY: session token UPDATED in {idx}")
                                else:
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
            
            # --- AUTO-MIGRATE ON STARTUP ---
            # Ensures the SQLite DB (or any DB) is fully populated before taking requests
            print("[DEBUG] Running auto-migrations and seeders to ensure database integrity...")
            from django.core.management import call_command
            try:
                call_command("ether_setup")
            except Exception as e:
                print(f"[WARNING] Auto-setup encountered an issue: {e}")
            
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
            
            # Use high-concurrency mode for industrial stability
            serve(
                application, 
                host='0.0.0.0', 
                port=port, 
                threads=32, 
                connection_limit=1000, 
                channel_timeout=30,
                max_request_body_size=1024 * 1024 * 100, # 100MB
                expose_tracebacks=False
            )
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
