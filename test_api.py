import os
import requests
import json

base_url = "http://localhost:8000/api/evaluations/evaluation_session/"

data = {
    "title": "API Test",
    "scope": "Niveau",
    "academic_period": 1,
    "evaluation_type": 1,
    "subjects": [
        {
            "subject": 1,
            "levels": [1],
            "max_score": 20,
            "plannings": [
                {
                    "date": "2026-03-10",
                    "start_time": "10:30",
                    "duration_minutes": 120,
                    "levels": [1],
                    "classrooms": [9]
                }
            ]
        }
    ],
    "supervisions": [
        {
            "date": "2026-03-10",
            "classroom": 9,
            "supervisors": [1]
        }
    ]
}

headers = {
    "Content-Type": "application/json",
    # Login as ethernanos to get token or session if necessary, or bypass if API is open locally
}

response = requests.post(base_url, json=data)
print("STATUS CODE:", response.status_code)
try:
    print("RESPONSE JSON:", json.dumps(response.json(), indent=2))
except:
    print("RESPONSE TEXT:", response.text)
