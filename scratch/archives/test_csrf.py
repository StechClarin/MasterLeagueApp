import urllib.request
import urllib.error
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/planning/cancel_event/',
    data=json.dumps({
        "event_id": 1,
        "target_date": "2026-06-10",
        "event_type": "SPECIFIC"
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    response = urllib.request.urlopen(req, context=ctx)
    print("SUCCESS", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"ERROR {e.code}: {e.read().decode('utf-8')}")
except Exception as e:
    print("ERROR", e)
