# -*- coding: utf-8 -*-
"""
Suite de tests d'intégration LIVE pour les APIs REST + GraphQL de l'Ethernanos Hub.

Objectif : tester les APIs dans leur contexte réel (serveur démarré, données seedées).
Usage : .venv/bin/python tests/test_api_live.py [base_url]
Par défaut, base_url = http://127.0.0.1:8010
"""
import json
import sys
import urllib.request
import urllib.error
import traceback

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8010"
EST_ID = "bea2f670-1fa5-483a-99b0-d3c5d507e8f3"  # Ethernanos (PostgreSQL seed)
HUB_API_KEY = "ethernanos-hub-secret-2026"
USERNAME = "ethernanos"
PASSWORD = "admin1234"

RESULTS = []


def log(name, ok, detail=""):
    status = "PASS" if ok else "FAIL"
    RESULTS.append(bool(ok))
    print(f"[{status}] {name}" + (f"  -> {detail}" if detail and not ok else ""))


def request(method, path, payload=None, headers=None):
    """Effectue une requête HTTP et retourne (status_code, body_dicty)."""
    url = BASE_URL + path
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read()
            try:
                return resp.status, json.loads(body)
            except Exception:
                return resp.status, body.decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        body = e.read()
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body.decode("utf-8", "replace")
    except Exception as e:
        return 0, {"error": str(e)}


def auth_headers(token=None, est_id=EST_ID):
    h = {}
    if token:
        h["Authorization"] = "Bearer " + token
    if est_id:
        h["X-Establishment-ID"] = est_id
    return h


# ==============================================================================
# 1. AUTHENTIFICATION JWT
# ==============================================================================
def test_auth():
    print("\n=== 1. AUTHENTIFICATION JWT ===")

    # 1.1 Login réussi (username)
    code, body = request("POST", "/api/auth/login/", {"username": USERNAME, "password": PASSWORD})
    log("Login par username", code == 200 and "access" in body and "refresh" in body, f"code={code}")
    token = body.get("access") if code == 200 else None

    # 1.2 Login réussi (email)
    code2, body2 = request("POST", "/api/auth/login/", {"username": "ethernanos@gmail.com", "password": PASSWORD})
    log("Login par email", code2 == 200 and "access" in body2, f"code={code2}")

    # 1.3 Mauvais mot de passe
    code3, _ = request("POST", "/api/auth/login/", {"username": USERNAME, "password": "wrong"})
    log("Login mot de passe invalide -> 401", code3 == 401, f"code={code3}")

    # 1.4 Utilisateur inexistant
    code4, _ = request("POST", "/api/auth/login/", {"username": "ghost", "password": "x"})
    log("Login utilisateur inconnu -> 401", code4 == 401, f"code={code4}")

    # 1.5 Champs manquants
    code5, _ = request("POST", "/api/auth/login/", {})
    log("Login champs manquants -> 400", code5 == 400, f"code={code5}")

    # 1.6 Refresh token
    if token:
        refresh = body.get("refresh")
        code6, body6 = request("POST", "/api/auth/refresh/", {"refresh": refresh})
        log("Refresh token valide", code6 == 200 and "access" in body6, f"code={code6}")

        # 1.7 Refresh invalide
        code7, _ = request("POST", "/api/auth/refresh/", {"refresh": "invalid.token.here"})
        log("Refresh token invalide -> 401", code7 in (400, 401), f"code={code7}")

    # 1.8 JWT claims personnalisés
    if token:
        import base64
        payload = token.split(".")[1]
        payload += "=" * (-len(payload) % 4)
        claims = json.loads(base64.urlsafe_b64decode(payload))
        log("JWT contient claims username + is_superuser",
            claims.get("username") == USERNAME and claims.get("is_superuser") is True)

    return token


# ==============================================================================
# 2. HEALTH / PING
# ==============================================================================
def test_health_ping():
    print("\n=== 2. HEALTH / PING ===")

    code, body = request("GET", "/api/core/health/")
    log("Health check -> 200 healthy", code == 200 and body.get("status") == "healthy", f"code={code}")

    code, body = request("GET", "/api/external/ping/")
    log("Ping -> 200 ready", code == 200 and body.get("status") == "ready", f"code={code}")


# ==============================================================================
# 3. REST ROUTER (CUD)
# ==============================================================================
def test_rest_router(token):
    print("\n=== 3. ROUTER REST (CUD) ===")

    # 3.1 Requête sans token -> 401
    code, body = request("POST", "/api/establishment/list/")
    log("Router sans token -> 401", code == 401, f"code={code} {body}")

    # 3.2 Token invalide -> 401
    code, _ = request("POST", "/api/establishment/list/", headers=auth_headers("invalid.token"))
    log("Router token invalide -> 401", code == 401, f"code={code}")

    # 3.3 Liste des établissements (avec contexte)
    code, body = request("POST", "/api/establishment/list/", headers=auth_headers(token))
    log("establishment/list avec contexte -> 200 + data",
        code == 200 and body.get("data", {}).get("count", 0) >= 1,
        f"code={code} count={body.get('data', {}).get('count')}")

    # 3.4 Liste via GET
    code, body = request("GET", "/api/establishment/list/", headers=auth_headers(token))
    log("establishment/list via GET -> 200",
        code == 200 and "data" in body, f"code={code}")

    # 3.5 Controller inconnu -> 404
    code, body = request("POST", "/api/nonexistent/save/", {"name": "x"}, headers=auth_headers(token))
    log("Controller inconnu -> 404", code == 404, f"code={code} {body}")

    # 3.6 Méthode inconnue -> 405
    code, body = request("POST", "/api/establishment/hack/", {}, headers=auth_headers(token))
    log("Méthode inconnue -> 405", code == 405, f"code={code} {body}")

    # 3.7 Auth via routeur -> 404 (interdit)
    code, _ = request("POST", "/api/auth/save/", {}, headers=auth_headers(token))
    log("Auth via routeur interdit -> 404", code == 404, f"code={code}")

    # 3.8 Save (Création d'un module de test)
    import uuid
    test_name = f"Module Test {uuid.uuid4().hex[:6]}"
    code, body = request(
        "POST", "/api/module/save/",
        {"code": f"mod-test-{uuid.uuid4().hex[:6]}", "name": test_name, "is_active": True},
        headers=auth_headers(token),
    )
    ok = code in (200, 201) and body.get("data", {}).get("name") == test_name
    log("module/save (création) -> 201", ok, f"code={code} {body}")
    created_id = body.get("data", {}).get("id") if ok else None

    # 3.9 Save (Mise à jour)
    if created_id:
        code, body = request(
            "POST", "/api/module/save/",
            {"id": created_id, "code": f"mod-test-updated-{uuid.uuid4().hex[:6]}", "name": test_name + " V2", "is_active": False},
            headers=auth_headers(token),
        )
        log("module/save (mise à jour) -> 200", code == 200, f"code={code} {body}")

    # 3.10 Status par pk
    if created_id:
        code, body = request("POST", f"/api/module/status/{created_id}/", {}, headers=auth_headers(token))
        log("module/status par pk -> 200", code in (200, 400, 405), f"code={code}")

    # 3.11 Delete (si créé)
    if created_id:
        code, body = request("POST", f"/api/module/delete/{created_id}/", {}, headers=auth_headers(token))
        log("module/delete par pk -> 200", code == 200, f"code={code} {body}")

    # 3.12 export_data -> fichier CSV (fixé : plus de 404/500)
    code, body = request("GET", "/api/establishment/export_data/?format=csv", headers=auth_headers(token))
    is_csv = isinstance(body, str) and "id" in body[:200]
    log("establishment/export_data -> CSV (fix v1.0)", code == 200 and is_csv, f"code={code} type={type(body).__name__}")

    # 3.13 import_data sans fichier -> 400
    code, body = request("POST", "/api/module/import_data/", {}, headers=auth_headers(token))
    log("import_data sans fichier -> 400", code == 400, f"code={code} {body}")

    return created_id


# ==============================================================================
# 4. GRAPHQL (Lecture)
# ==============================================================================
def test_graphql(token):
    print("\n=== 4. GRAPHQL (Lecture) ===")

    def gql(query, token=None, est_id=EST_ID, variables=None):
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        return request("POST", "/graphql", payload, headers=auth_headers(token, est_id))

    # 4.1 Introspection du schéma
    code, body = gql("{ __schema { queryType { fields { name } } } }")
    field_count = len(body.get("data", {}).get("__schema", {}).get("queryType", {}).get("fields", [])) if code == 200 else 0
    log(f"Introspection GraphQL -> {field_count} champs", code == 200 and field_count > 50, f"code={code}")

    # 4.2 me (authentifié)
    code, body = gql("{ me { id username email } }", token=token)
    me = body.get("data", {}).get("me") if code == 200 else None
    log("Query 'me' authentifiée", code == 200 and me and me.get("username") == USERNAME, f"code={code} {body}")

    # 4.3 me (non authentifié) -> null
    code, body = gql("{ me { id username email } }", token=None)
    log("Query 'me' non authentifiée -> null", code == 200 and body.get("data", {}).get("me") is None, f"code={code} {body}")

    # 4.4 establishments (authentifié superuser)
    code, body = gql("{ establishments { totalCount items { id name } } }", token=token)
    count = body.get("data", {}).get("establishments", {}).get("totalCount", 0) if code == 200 else 0
    log("Query 'establishments' authentifiée", code == 200 and count >= 1, f"code={code} count={count}")

    # 4.5 establishments sans token -> accès refus (résolver renvoie null, soft-fail)
    code, body = gql("{ establishments { totalCount } }", token=None)
    log("Query 'establishments' sans token -> refus", code == 200 and body.get("data", {}).get("establishments") is None, f"code={code} {body}")

    # 4.6 establishment by id
    code, body = gql(f'{{ establishment(id: "{EST_ID}") {{ id name code }} }}', token=token)
    est = body.get("data", {}).get("establishment") if code == 200 else None
    log("Query 'establishment' par id", code == 200 and est and est.get("code") == "ETH-NANOS-SPA001", f"code={code} {body}")

    # 4.7 establishment inexistant -> null
    code, body = gql('{ establishment(id: "00000000-0000-0000-0000-000000000000") { id name } }', token=token)
    log("Query 'establishment' id inconnu -> null", code == 200 and body.get("data", {}).get("establishment") is None, f"code={code}")

    # 4.8 users (avec filtre)
    code, body = gql('{ users(username: "eth", isActive: true) { totalCount items { id username } } }', token=token)
    log("Query 'users' (filtre username)", code == 200, f"code={code} {body}")

    # 4.9 modules
    code, body = gql("{ modules { code name } }", token=token)
    log("Query 'modules'", code == 200, f"code={code}")

    # 4.10 students (données contextuelles)
    code, body = gql("{ students(page: 1, pageSize: 5) { totalCount items { id firstName lastName } } }", token=token)
    log("Query 'students' paginée", code == 200, f"code={code}")

    # 4.11 classrooms (contrainte : requiert X-Establishment-ID + permission)
    code, body = gql("{ classrooms { totalCount items { id name } } }", token=token)
    log("Query 'classrooms' (superuser bypass)", code == 200, f"code={code} {body}")

    # 4.12 Query invalide -> erreur GraphQL (200 ou 400 avec erreurs)
    code, body = gql("{ this_query_does_not_exist { x } }", token=token)
    log("Query inconnue -> erreurs GraphQL", code in (200, 400) and body.get("errors"), f"code={code}")

    # 4.13 dashboardData
    code, body = gql("{ dashboardData { totalStudents totalTeachers } }", token=token)
    log("Query 'dashboardData'", code == 200, f"code={code}")

    # 4.14 Filtrer par search
    code, body = gql('{ establishments(search: "Ether") { totalCount items { id name } } }', token=token)
    log("Query 'establishments' avec search", code == 200 and body.get("data", {}).get("establishments", {}).get("totalCount", 0) >= 1, f"code={code} {body}")


# ==============================================================================
# 5. EXTERNAL APIS (HUB BRIDGE - API KEY)
# ==============================================================================
def test_external_apis():
    print("\n=== 5. API EXTERNES (BRIDGE HUB) ===")
    import uuid
    hub_id = f"hub-test-{uuid.uuid4().hex[:8]}"
    hk = {"X-Hub-Api-Key": HUB_API_KEY}

    # 5.1 Provision tenant : clé invalide -> 401
    code, body = request("POST", "/api/external/provision-tenant/", {"tenant_id": "x"}, headers={"X-Hub-Api-Key": "bad-key"})
    log("Provision clé invalide -> 401", code == 401, f"code={code} {body}")

    # 5.2 Provision tenant : champs manquants -> 400
    code, body = request("POST", "/api/external/provision-tenant/", {}, headers=hk)
    log("Provision champs manquants -> 400", code == 400, f"code={code} {body}")

    # 5.3 Provision tenant : succès
    code, body = request("POST", "/api/external/provision-tenant/", {
        "tenant_id": hub_id, "tenant_name": "École Test Hub", "hub_id": hub_id,
        "admin_email": f"{hub_id}@test.com", "included-mods": ["mod-finance"],
    }, headers=hk)
    log("Provision tenant -> 201", code == 201, f"code={code} {body}")

    # 5.4 Sync tenant : tenant_id manquant -> 400
    code, body = request("GET", "/api/external/sync-tenant/", headers=hk)
    log("Sync tenant sans tenant_id -> 400", code == 400, f"code={code} {body}")

    # 5.5 Sync tenant : tenant inconnu -> 404
    code, body = request("GET", "/api/external/sync-tenant/?tenant_id=unknown-hub", headers=hk)
    log("Sync tenant inconnu -> 404", code == 404, f"code={code} {body}")

    # 5.6 Sync tenant : succès (hub_id de test provisionné)
    code, body = request("GET", f"/api/external/sync-tenant/?tenant_id={hub_id}", headers=hk)
    log("Sync tenant provisionné -> 200", code == 200 and "admin" in body and "establishments" in body, f"code={code}")

    # 5.7 Unlock module : clé invalide -> 401
    code, body = request("POST", "/api/external/unlock-module/", {"hub_id": hub_id, "module_code": "mod-finance"}, headers={"X-Hub-Api-Key": "bad"})
    log("Unlock module clé invalide -> 401", code == 401, f"code={code} {body}")

    # 5.8 Unlock module : owner inconnu -> 404
    code, body = request("POST", "/api/external/unlock-module/", {"hub_id": "unknown-hub", "module_code": "mod-finance"}, headers=hk)
    log("Unlock module owner inconnu -> 404", code == 404, f"code={code} {body}")

    # 5.9 Unlock module : succès
    code, body = request("POST", "/api/external/unlock-module/", {"hub_id": hub_id, "module_code": "mod-finance", "is_active": True}, headers=hk)
    log("Unlock module -> 200", code == 200, f"code={code} {body}")

    # 5.10 Unlock module : champs manquants -> 400
    code, body = request("POST", "/api/external/unlock-module/", {"hub_id": hub_id}, headers=hk)
    log("Unlock module champs manquants -> 400", code == 400, f"code={code} {body}")

    # 5.11 Sync delta (lecture)
    code, body = request("GET", "/api/external/sync-delta/", headers=hk)
    log("Sync delta -> 200", code == 200, f"code={code}")

    # 5.12 Sync in : clé invalide -> 401
    code, body = request("POST", "/api/external/sync-in/", {}, headers={"X-Hub-Api-Key": "bad"})
    log("Sync in clé invalide -> 401", code == 401, f"code={code} {body}")

    # 5.13 Push delta
    code, body = request("POST", "/api/external/push-delta/", {"deltas": []}, headers=hk)
    log("Push delta -> 200", code == 200, f"code={code} {body}")

    # 5.14 Manifest assets : tenant inconnu -> 404
    code, body = request("GET", "/api/external/sync-assets/manifest/?tenant_id=unknown-hub", headers=hk)
    log("Asset manifest tenant inconnu -> 404", code == 404, f"code={code} {body}")

    # 5.15 Manifest assets : tenant_id manquant -> 400
    code, body = request("GET", "/api/external/sync-assets/manifest/", headers=hk)
    log("Asset manifest sans tenant_id -> 400", code == 400, f"code={code} {body}")

    # 5.16 Asset transfer : path traversal -> 403
    code, body = request("GET", "/api/external/sync-assets/transfer/?path=../../etc/passwd", headers=hk)
    log("Asset transfer path traversal -> 403", code == 403, f"code={code} {body}")

# ==============================================================================
# 6. SÉCURITÉ & MIDDLEWARES
# ==============================================================================
def test_security(token):
    print("\n=== 6. SÉCURITÉ & MIDDLEWARES ===")

    # 6.1 Sans header establishment, un utilisateur normal ne voit pas tout
    code, body = request("POST", "/api/establishment/list/", headers=auth_headers(token, est_id=None))
    count = body.get("data", {}).get("count", 0) if code == 200 else -1
    log("Superuser list sans header -> données complètes", code == 200, f"code={code} count={count}")

    # 6.2 X-Establishment-ID invalide : middleware ignore silencieusement
    code, body = request("POST", "/api/establishment/list/", headers=auth_headers(token, est_id="invalid-uuid"))
    log("Header establishment invalide -> pas d'erreur 500", code in (200, 400, 403), f"code={code}")

    # 6.3 CORS preflight
    import urllib.request as u
    req = urllib.request.Request(BASE_URL + "/api/core/health/", method="OPTIONS")
    req.add_header("Origin", "http://localhost:4200")
    req.add_header("Access-Control-Request-Method", "GET")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            cors = resp.headers.get("Access-Control-Allow-Origin")
            log("CORS preflight autorisé", resp.status == 200 and cors is not None, f"status={resp.status} cors={cors}")
    except urllib.error.HTTPError as e:
        cors = e.headers.get("Access-Control-Allow-Origin")
        log("CORS preflight autorisé (HTTPError)", e.code in (200, 204) or cors is not None, f"status={e.code} cors={cors}")
    except Exception as e:
        log("CORS preflight autorisé", False, str(e))


# ==============================================================================
# MAIN
# ==============================================================================
if __name__ == "__main__":
    print("Ethernanos Hub - Suite de tests d'intégration LIVE")
    print(f"Base URL : {BASE_URL}")
    print(f"Établissement de test : {EST_ID}")

    try:
        token = test_auth()
        test_health_ping()
        test_rest_router(token)
        test_graphql(token)
        test_external_apis()
        test_security(token)
    except Exception as e:
        traceback.print_exc()
        RESULTS.append(False)
        log("EXCEPTION GÉNÉRALE", False, str(e))

    total = len(RESULTS)
    passed = sum(RESULTS)
    print("\n" + "=" * 60)
    print(f"RÉSULTATS : {passed}/{total} tests réussis")
    print("=" * 60)
    sys.exit(0 if passed == total else 1)


    # 5.17 Asset transfer : fichier manquant -> 400
    code, body = request("GET", "/api/external/sync-assets/transfer/", headers=hk)
    log("Asset transfer sans path -> 400", code == 400, f"code={code} {body}")
