#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    """Run administrative tasks."""
    # --- SECURITY HANDSHAKE (The Shield) ---
    # We skip security check for migrations or help commands to avoid blocking dev tasks,
    # but we enforce it for 'runserver' which is what the Hub uses.
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
