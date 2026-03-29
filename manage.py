#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    # --- ETHER-SETUP (Maintenance) ---
    # One-time setup task for SQLite initialization
    if "--ether-setup" in sys.argv:
        os.environ['DATABASE_URL'] = 'sqlite:///db.sqlite3'
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        try:
            import django
            django.setup()
            from django.core.management import execute_from_command_line
            # Transform our flag into a real command call
            sys.argv = [sys.argv[0], 'ether_setup']
            execute_from_command_line(sys.argv)
            sys.exit(0)
        except Exception as e:
            print(f"CRITICAL: Ether Setup Failure ({e}). Installation Aborted.")
            sys.exit(1)

    # --- SECURITY HANDSHAKE (The Shield) ---
    # Skip security for migrations or help commands to avoid blocking dev/maintenance tasks,
    # but enforce it for 'runserver' which is what the Hub uses for the web app.
    if len(sys.argv) > 1 and sys.argv[1] == "runserver":
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
