#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    
    # --- HUB ARGUMENT INTERCEPTION ---
    # The Hub passes custom flags like --app-port 8000.
    # Standard Django management commands don't recognize these and will crash.
    # We extract them here and put them in the environment for the app to use.
    
    hub_args = {
        '--app-port': 'ETHER_APP_PORT',
        '--tenant-id': 'ETHER_TENANT_ID',
        '--db-host': 'ETHER_DB_HOST',
        '--db-port': 'ETHER_DB_PORT',
        '--db-name': 'ETHER_DB_NAME',
        '--db-user': 'ETHER_DB_USER',
        '--db-pass': 'ETHER_DB_PASS',
    }
    
    new_argv = []
    i = 0
    argv = sys.argv
    while i < len(argv):
        arg = argv[i]
        if arg in hub_args and i + 1 < len(argv):
            os.environ[hub_args[arg]] = argv[i+1]
            i += 2 # Skip flag and value
        else:
            new_argv.append(arg)
            i += 1
            
    sys.argv = new_argv

    # --- DATABASE_URL AUTO-CONSTRUCTION ---
    # If the Hub passed DB parameters, we build the DATABASE_URL string for Django
    db_host = os.environ.get('ETHER_DB_HOST')
    db_port = os.environ.get('ETHER_DB_PORT')
    db_name = os.environ.get('ETHER_DB_NAME')
    db_user = os.environ.get('ETHER_DB_USER')
    db_pass = os.environ.get('ETHER_DB_PASS')

    if db_host and db_port and db_name:
        # Build PostgreSQL URL
        os.environ['DATABASE_URL'] = f"postgres://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
    elif not os.environ.get('DATABASE_URL'):
        # Fallback to local SQLite with ABSOLUTE path
        # This prevents the app from creating db.sqlite3 in temp folders
        db_path = os.path.join(os.path.abspath(os.curdir), 'db.sqlite3')
        os.environ['DATABASE_URL'] = f"sqlite:///{db_path}"

    # --- ETHER_HUB_API_KEY (Sync Handshake) ---
    # We ensure the API Key is also in environment even if not using postgres
    if not os.environ.get('ETHER_HUB_API_KEY'):
         os.environ['ETHER_HUB_API_KEY'] = 'ethernanos-hub-secret-2026'

    # --- ETHER-SETUP (Maintenance) ---
    # One-time setup task for SQLite initialization
    if "ether_setup" in sys.argv or "--ether-setup" in sys.argv:
        # If launched via its dedicated --ether-setup flag, we normalize it to a Django command
        if "--ether-setup" in sys.argv:
            sys.argv = [sys.argv[0], 'ether_setup']
            
        db_path = os.path.join(os.path.abspath(os.curdir), 'db.sqlite3')
        os.environ['DATABASE_URL'] = f"sqlite:///{db_path}"
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        try:
            import django
            django.setup()
            from django.core.management import execute_from_command_line
            execute_from_command_line(sys.argv)
            sys.exit(0)
        except Exception as e:
            print(f"CRITICAL: Ether Setup Failure ({e}). Installation Aborted.")
            sys.exit(1)

    # --- RUNSERVER PORT OVERRIDE ---
    # If the Hub specified a port, we ensure 'runserver' uses it
    app_port = os.environ.get('ETHER_APP_PORT')
    if "runserver" in sys.argv and app_port:
        # Check if port is already specified in the command (e.g. runserver 8080)
        # If not, we append the Hub's port
        has_addr_port = any(':' in arg or arg.isdigit() for arg in sys.argv[2:])
        if not has_addr_port:
            sys.argv.append(f"127.0.0.1:{app_port}")

    # --- SECURITY HANDSHAKE (The Shield) ---
    if "runserver" in sys.argv:
        try:
            from hub_security import verify_hub_handshake
            verify_hub_handshake()
        except Exception as e:
            print(f"CRITICAL: Security Subsystem Failure ({e}). Access Denied.")
            sys.exit(1)

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
