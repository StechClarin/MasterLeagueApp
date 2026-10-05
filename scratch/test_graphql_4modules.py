#!/usr/bin/env python3
"""
Test GraphQL queries across 4 key modules:
1. Référentiel (Structure)
2. Finance
3. Évaluations
4. Vie Scolaire (Students / Enrollments)
"""

import sys
import json
import urllib.request
import urllib.parse
from uuid import uuid4

BASE_URL = "http://127.0.0.1:8000"
GRAPHQL_URL = f"{BASE_URL}/graphql/"
AUTH_URL = f"{BASE_URL}/api/auth/login/"

def get_token_and_establishment():
    payload = json.dumps({"username": "ethernanos", "password": "admin1234"}).encode('utf-8')
    req = urllib.request.Request(AUTH_URL, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            token = data.get("access") or data.get("token")
            user_info = data.get("user", {})
            est_id = user_info.get("establishment_id")
            return token, est_id
    except Exception as e:
        print(f"❌ Erreur d'authentification REST Token: {e}")
        sys.exit(1)

def gql_query(token, establishment_id, query_str, variables=None):
    payload = json.dumps({
        "query": query_str,
        "variables": variables or {}
    }).encode('utf-8')
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    if establishment_id:
        headers["X-Establishment-ID"] = str(establishment_id)
        
    req = urllib.request.Request(GRAPHQL_URL, data=payload, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            return res_data
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        return {"errors": [{"message": f"HTTP {e.code}: {err_body}"}]}
    except Exception as e:
        return {"errors": [{"message": str(e)}]}

def run_test_suite():
    print("==================================================")
    print("🚀 TEST GRAPHQL SUR LES 4 MODULES")
    print("==================================================")
    
    token, est_id = get_token_and_establishment()
    print("✔ Authentification réussie")
    print(f"✔ Token JWT généré. Contexte Établissement: {est_id}")
    
    success_count = 0
    fail_count = 0
    
    def test_q(module_name, query_name, gql_body, vars_dict=None):
        nonlocal success_count, fail_count
        res = gql_query(token, est_id, gql_body, vars_dict)
        if "errors" in res:
            print(f"  ❌ [{module_name}] Query '{query_name}' ÉCHOUÉE: {res['errors']}")
            fail_count += 1
        else:
            data = res.get("data", {})
            data_keys = list(data.keys())
            first_key = data_keys[0] if data_keys else None
            
            # Count items if available
            count_str = ""
            if first_key and isinstance(data[first_key], dict):
                items = data[first_key].get("items")
                if isinstance(items, list):
                    count_str = f" ({len(items)} éléments)"
                elif "totalCount" in data[first_key]:
                    count_str = f" (totalCount: {data[first_key]['totalCount']})"
            elif first_key and isinstance(data[first_key], list):
                count_str = f" ({len(data[first_key])} éléments)"

            print(f"  ✔ [{module_name}] Query '{query_name}' RÉUSSIE -> Result: {first_key}{count_str}")
            success_count += 1

    # -------------------------------------------------------------------------
    # 1. MODULE RÉFÉRENTIEL (STRUCTURE)
    # -------------------------------------------------------------------------
    print("\n--- 1. MODULE RÉFÉRENTIEL (STRUCTURE) ---")
    
    test_q("Référentiel", "academicyears", """
        query {
            academicyears {
                items {
                    id
                    name
                    start_date
                    end_date
                }
                totalCount
            }
        }
    """)
    
    test_q("Référentiel", "cycles", """
        query {
            cycles {
                items {
                    id
                    name
                    code
                    hasOptions
                }
                totalCount
            }
        }
    """)
    
    test_q("Référentiel", "levels", """
        query {
            levels {
                items {
                    id
                    name
                    shortName
                    order
                }
                totalCount
            }
        }
    """)
    
    test_q("Référentiel", "options", """
        query {
            options {
                items {
                    id
                    name
                    code
                }
                totalCount
            }
        }
    """)
    
    test_q("Référentiel", "subjects (Validation sans volume horaire)", """
        query {
            subjects {
                items {
                    id
                    name
                    code
                    levelSubjects {
                        id
                        coefficient
                        credits
                        isOptional
                        level {
                            id
                            name
                        }
                    }
                }
                totalCount
            }
        }
    """)
    
    test_q("Référentiel", "classrooms", """
        query {
            classrooms {
                items {
                    id
                    name
                    capacity
                }
                totalCount
            }
        }
    """)

    # -------------------------------------------------------------------------
    # 2. MODULE FINANCE
    # -------------------------------------------------------------------------
    print("\n--- 2. MODULE FINANCE ---")
    
    test_q("Finance", "feeDefinitions", """
        query {
            feeDefinitions {
                items {
                    id
                    name
                    amount
                    category
                }
                totalCount
            }
        }
    """)
    
    test_q("Finance", "invoices", """
        query {
            invoices {
                items {
                    id
                    title
                    totalAmount
                    paidAmount
                    remainingAmount
                    status
                }
                totalCount
            }
        }
    """)
    
    test_q("Finance", "payments", """
        query {
            payments {
                items {
                    id
                    amount
                    paymentDate
                    paymentMethod
                    reference
                }
                totalCount
            }
        }
    """)

    # -------------------------------------------------------------------------
    # 3. MODULE ÉVALUATIONS
    # -------------------------------------------------------------------------
    print("\n--- 3. MODULE ÉVALUATIONS ---")
    
    test_q("Évaluations", "evaluationTypes", """
        query {
            evaluationTypes {
                items {
                    id
                    name
                    code
                    weight
                }
                totalCount
            }
        }
    """)
    
    test_q("Évaluations", "evaluationSessions", """
        query {
            evaluationSessions {
                items {
                    id
                    title
                    status
                }
                totalCount
            }
        }
    """)

    # -------------------------------------------------------------------------
    # 4. MODULE VIE SCOLAIRE (STUDENTS & ENROLLMENTS)
    # -------------------------------------------------------------------------
    print("\n--- 4. MODULE VIE SCOLAIRE ---")
    
    test_q("Vie Scolaire", "students", """
        query {
            students {
                items {
                    id
                    firstName
                    lastName
                    matricule
                    gender
                    enrollments {
                        id
                        status
                        classroom {
                            id
                            name
                        }
                    }
                }
                totalCount
            }
        }
    """)

    print("\n==================================================")
    print(f"🎉 RÉSUMÉ DES TESTS GRAPHQL : {success_count} Succès, {fail_count} Échecs")
    print("==================================================")
    
    if fail_count > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_test_suite()
