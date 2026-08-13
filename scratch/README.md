# 📦 scratch/ — Zone d'archives & scripts jetables

Ce dossier contient les **scripts one-shot de debug / migration / smoke-test**
qui ont servi pendant le développement et n'ont **plus d'utilité permanente**.

## Structure
```
scratch/
├── repro_student_creation.py     # scripts conservés (exemples, reproducteurs)
├── test_classroom_serialization.py
├── test_sync_in_exception.py
└── archives/                     # scripts one-shot archivés (voir ci-dessous)
```

## `archives/`
Scripts ponctuels : correctifs de données scolaires (`fix_enrollment*`,
`replace_enrollment*`, `rm_student_methods*`, `update_enrollment.py`),
diagnostics du routeur (`debug_router.py`, `debug_imports.py`,
`debug_url_resolve.py`), smoke-tests jetables (`test_*.py`, `test_*.js`).

> Ils sont conservés **uniquement pour la mémoire** (l'historique git suffit
> normalement). Aucun fichier du projet ne les référence.
>
> Pour les ré-exécuter avec les imports du projet :
> `cd .. && PYTHONPATH=. python scratch/archives/<script>.py`

La **vraie** suite de tests est désormais dans `apps/*/tests/` (pytest) —
voir le `README.md` racine.
