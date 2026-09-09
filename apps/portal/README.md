# Portail Eteyelo — Authentification par magic link (code 6 chiffres)

Module Django du portail public **Eteyelo.ethernanos.space** : connexion sans
mot de passe par code à usage unique reçu par **email ou SMS**.

## Espaces pris en charge

| Espace | Profils résolus | Identifiants acceptés |
| ------ | --------------- | --------------------- |
| `student` | `Guardian` (parent/tuteur) → enfants | Téléphone (clé métier) ou email du compte |
| `student` | `Student` (élève avec compte) | Email ou téléphone du compte |
| `prof` | `Personnel` (enseignant/agent) | `email_pro`, `phone_number` ou compte lié |

> Un parent peut être rattaché à **plusieurs enfants** : la réponse d'auth
> renvoie la liste `children`, affichée dans le sélecteur du header de l'espace
> étudiant. Les données affichées dépendent de l'enfant sélectionné.

## Endpoints (API REST publique, JSON)

| Méthode | URL | Rôle |
| ------- | --- | ---- |
| POST | `/api/portal/auth/request/` | `{space, contact}` → envoi du code |
| POST | `/api/portal/auth/verify/` | `{space, contact, code}` → JWT + `person` + `children` |
| GET | `/api/portal/session/` | `Authorization: Bearer <token>` → session à jour |

Sécurité :
- Code haché en base (HMAC-SHA256 + `SECRET_KEY`), jamais stocké en clair.
- Usage unique, expiration **10 min**, **5 tentatives** max, cooldown d'envoi **90 s**.
- Réponses neutres (pas de révélation d'existence de compte) hors mode DEBUG.
- Le code n'est renvoyé par l'API **que si `settings.DEBUG = True`** (démo locale).
  En production, il est uniquement envoyé par email/SMS.

## Configuration

- **Email** : backend SMTP Django standard (`EMAIL_HOST`, `DEFAULT_FROM_EMAIL`, …).
- **SMS** : fournisseur à brancher dans `apps/portal/services/notification_service.py`
  (backend `console` par défaut : le SMS est journalisé, parfait en développement).
- Variables additionnelles (optionnelles) :
  - `PORTAL_SMS_FROM` — expéditeur SMS
  - `PORTAL_SMS_BACKEND` — `console` (défaut) ou votre backend
  - `PORTAL_SESSION_HOURS` — durée du jeton de session (défaut 12 h)

## Essai rapide en local

```bash
# 1. Backend Django (un code est renvoyé directement par l'API si DEBUG)
DEBUG=true ./snake run
./snake seed_portal_demo        # crée parent (2 enfants) + enseignant de démo

# 2. Frontend du portail
cd Eteyelo.ethernanos.space
cp .env.example .env            # VITE_API_URL=http://localhost:8000
npm install && npm run dev
```

Comptes de démo créés par `seed_portal_demo` :

- **Parent** : `+241060000001` ou `parent.demo@eteyelo.test` → Awa & Samuel MENGUE
- **Enseignant** : `+241060000002` ou `prof.martin@eteyelo.test`

Tests : `.venv/bin/python manage.py test apps.portal`
