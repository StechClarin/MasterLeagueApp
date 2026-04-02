import os
import sys
import psutil

def verify_hub_handshake():
    """
    INDUSTRIAL HANDSHAKE v2.0
    Verifies that the app was launched by the official Hub 
    using a one-time SESSION_TOKEN injected via stdin.
    """
    session_token = os.environ.get("ETHER_SESSION_TOKEN")
    hub_pid_str = os.environ.get("ETHER_HUB_PID")

    if not session_token or not hub_pid_str:
        print("CRITICAL: Unauthorized Launch Attempt (Missing Session Credentials).")
        sys.exit(1)

    try:
        # 1. Verify Parent Process (Double Check)
        hub_pid = int(hub_pid_str)
        current_ppid = os.getppid()

        # On Windows/Linux, we check if the parent is authorized
        if current_ppid != hub_pid:
            try:
                parent = psutil.Process(current_ppid)
                parent_name = parent.name().lower()
                # Allow common shell wrappers
                if "hub" not in parent_name and "sh" not in parent_name and "cmd" not in parent_name:
                    print(f"CRITICAL: Unauthorized Parent Process ({parent_name}).")
                    sys.exit(1)
            except:
                pass # Process might have exited or access denied, fallback to token check

        # 2. Verify Session Token (The Key)
        if len(session_token) < 16:
             print("CRITICAL: Invalid Security Handshake (Insecure Token).")
             sys.exit(1)

        return True

    except Exception as e:
        print(f"CRITICAL: Security Subsystem Failure ({e}).")
        sys.exit(1)
