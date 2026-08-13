# Ethernanos Hub Starter

Socle d'application **Django + Angular** déployable par le Launcher Desktop Ethernanos.
Cette branche (`InitHubApp`) est le **template minimal** à partir duquel de nouvelles
applications sont générées (`init_app.py`).

---

## 🚀 Lancement

```bash
# Dev local
./snake run                     # http://127.0.0.1:8000

# Via le Launcher (mode Hub) : config DB/tenant passée en CLI
./snake start --db-host ... --db-user ... --db-name ... --app-port 8000 --admin-pass ...

# Créer une NOUVELLE application depuis ce template
python3 init_app.py
```

`./snake` est le wrapper de `manage.py` (jamais de `manage.py` direct).
`ethernanos.json` est le manifeste lu par le Launcher (id UUID, nom, port).

---

## 🏗️ Architecture

### Backend (Django 5.2 + DRF + Strawberry)
```
urls génériques
  /api/<model>/<method>/   -> RouterController (réflexion) -> BaseController -> BaseService
  /graphql                 -> GraphQLController (Strawberry, schéma auto-assemblé)
  /api/external/*          -> API Hub (provision, sync, unlock...) sécurisée X-Hub-Api-Key
```
- **Modèle → Service → Controller → GraphQL** (pas de Views ni urls manuels par app).
- **Multi-tenant** : les modèles métier héritent d'`EstablishmentAwareModel`
  (FK `establishment` + audit `created_by_user`/`updated_by_user`) ;
  les services reçoivent le contexte via `set_context(user, establishment_id)`.
- **Sécurité** : JWT + RBAC contextuel (`EstablishmentMembership`) + licences
  (`TenantLicense`) + handshake Hub (`X-Hub-Session-Token`).
- **Seeds** : `./snake seed:all` (access -> navigation -> roles -> data).
  Les seeds canoniques du socle sont versionnés dans `bootstrap/`.

### Frontend (Angular 18 + Apollo)
- Routing **piloté par la DB** : `seed_navigation.py` -> `Module`/`Page` ->
  `DynamicRouterService` -> `component.registry.ts` (lazy-loading).
- UI Kit `shared/components` + abstracts `BaseListComponent` / `BaseFormComponent`.

---

## 🧪 Tests

```bash
# Prérequis (venv)
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt

# Exécution (SQLite recommandé)
DATABASE_URL=sqlite:///db_test.sqlite3 pytest
```

### Le socle générique `BaseModelTest` (`apps/core/tests/base.py`)
Pour tester un **nouveau modèle**, héritez et définissez `model` + `payload()` :

```python
# apps/<app>/tests/test_<modele>.py
from apps.core.tests.base import BaseModelTest

class Test<Modele>Contract(BaseModelTest):
    model = <Modele>
    def payload(self, establishment, index=""):
        return {"name": "Objet" + index}   # sans establishment/user (auto-injectés)
```

9 tests automatiques : création via service, injection établissement + audit,
lecture, isolation multi-tenant, update, delete, API REST (`/api/<model>/save/`),
GraphQL (si `gql_query` / `gql_response_key` renseignés).

### CI
`.github/workflows/ci.yml` : `pytest` (backend) + `tsc --noEmit` (frontend).

---

## 🐛 Corrections notables (récentes)
- `BaseService`/`schema_loader` : politique **fail-fast** (les erreurs d'import
  ou collisions de champs GraphQL sont levées au démarrage).
- `UserService.before_save` : rappel du hook parent (injection audit) — corrigé.
- `settings_base` : une URL `sqlite://` n'est plus forcée en Postgres (`env.db`).
- `init_app.py` refactorisé : les seeds canoniques sont copiés depuis `bootstrap/`
  avec validation `compile()` (plus de strings embarquées).

---

## 📄 Documentation
- `documentation.txt` — la référence technique détaillée.
- `onboarding.md` / `.agent/rules/approche-code.md` — conventions de code.
- `scratch/` — archives de scripts one-shot (plus de débogage jetable à la racine).
