import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'http://127.0.0.1:8000/graphql/',
    data=json.dumps({
        "query": "query { compiledSchedule(startDate: \"2026-06-08\", endDate: \"2026-06-14\") }"
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    response = urllib.request.urlopen(req, context=ctx)
    print(response.read().decode('utf-8'))
except Exception as e:
    print(e)
