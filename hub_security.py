import os
import sys
import psutil
import hashlib
import hmac
import time

# Shared Secret (MUST match SHARED_SECRET in Hub's lib.rs)
SHARED_SECRET = "ETHERNANOS_SHIELD_2026_PROD_SECRET"

def verify_hub_handshake():
    """
    Verifies that the current process was launched by the Ethernanos Hub
    using a secure HMAC-based handshake and parent process verification.
    """
    
    # 1. Get Security Tokens from Environment
    token = os.environ.get("ETHER_HUB_TOKEN")
    timestamp = os.environ.get("ETHER_HUB_TS")
    hub_pid_str = os.environ.get("ETHER_HUB_PID")

    if not all([token, timestamp, hub_pid_str]):
        print("CRITICAL: Unauthorized Launch Attempt (Missing Security Tokens).")
        sys.exit(1)

    try:
        # 2. Verify Time Window (TTL: 30 seconds to allow for slow startup)
        now = int(time.time())
        ts_int = int(timestamp)
        if abs(now - ts_int) > 30:
            print(f"CRITICAL: Unauthorized Launch Attempt (Security Token Expired - Diff: {abs(now - ts_int)}s).")
            sys.exit(1)

        # 3. Verify HMAC Signature
        expected_data = f"{timestamp}:{SHARED_SECRET}".encode()
        expected_token = hashlib.sha256(expected_data).hexdigest()

        if token != expected_token:
            print("CRITICAL: Unauthorized Launch Attempt (Invalid Security Signature).")
            sys.exit(1)

        # 4. Verify Parent Process
        hub_pid = int(hub_pid_str)
        current_ppid = os.getppid()

        # Check if current_ppid is the same as hub_pid
        if current_ppid != hub_pid:
            # On some systems/shells, the PPID might be different (shell shim)
            # We also check the process name via psutil for robustness
            try:
                parent = psutil.Process(current_ppid)
                parent_name = parent.name().lower()
                # Check for 'hub' in parent name or any common shell names if launched via script
                if "hub" not in parent_name and "sh" not in parent_name and "cmd" not in parent_name:
                    print(f"CRITICAL: Unauthorized Parent Process ({parent_name}).")
                    sys.exit(1)
            except Exception:
                print("CRITICAL: Could not verify parent process identity.")
                sys.exit(1)

    except (ValueError, TypeError) as e:
        print(f"CRITICAL: Security Check Error ({e}).")
        sys.exit(1)

    # If we reached here, the handshake succeeded
    # We clear the token from the environment for extra safety
    os.environ.pop("ETHER_HUB_TOKEN", None)
    return True
