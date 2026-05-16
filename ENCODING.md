# 🔧 Encodage UTF-8 - Résolution de problèmes

## Problème
Lors du lancement des migrations Django, vous pouviez rencontrer l'erreur :
```
'utf-8' codec can't decode byte 0xe9 in position 78: invalid continuation byte
migration failed
```

Cela se produit quand Python essaie de décoder un fichier Python avec une déclaration d'encodage manquante ou avec des caractères accentués en encodage non-UTF-8.

## Solutions implémentées

### 1. **Variables d'environnement Python** ✅
Les fichiers de démarrage ont été modifiés pour forcer UTF-8 :

- **entrypoint.sh** - Conteneur Docker
  ```bash
  export PYTHONIOENCODING=utf-8
  export PYTHONDEFAULTENCODING=utf-8
  ```

- **hub_start.sh** - Lancement local du Hub
  ```bash
  export PYTHONIOENCODING=utf-8
  export PYTHONDEFAULTENCODING=utf-8
  ```

- **manage.py** - Script Django
  ```python
  os.environ.setdefault('PYTHONIOENCODING', 'utf-8')
  os.environ.setdefault('PYTHONDEFAULTENCODING', 'utf-8')
  ```

- **docker-compose.yml & docker-compose.prod.yml**
  ```yaml
  environment:
    - PYTHONIOENCODING=utf-8
    - PYTHONDEFAULTENCODING=utf-8
  ```

### 2. **Nettoyage des fichiers de migration** (optionnel)
Si vous avez encore des problèmes, exécutez :

```bash
python scripts/fix_migration_encoding.py
```

Ce script :
- ✅ Scanne tous les fichiers de migration
- ✅ Ajoute la déclaration `# -*- coding: utf-8 -*-` si manquante
- ✅ Convertit les fichiers en encoding non-UTF-8 vers UTF-8
- ✅ Rapport détaillé des changements

## Prévention future

### Pour de nouvelles migrations :
Django génère automatiquement les fichiers de migration. Pour vous assurer qu'ils ont le bon encodage :

1. **Vérifier l'encoding du système**
   ```bash
   echo $LANG
   # Devrait afficher: xx_XX.UTF-8
   ```

2. **Configuration Python globale**
   ```bash
   # Dans ~/.bashrc ou ~/.zshrc
   export PYTHONIOENCODING=utf-8
   ```

3. **Dans PyCharm/VS Code**
   - Paramètres > Outils > Python > Encodage par défaut → UTF-8

## Vérification

Pour vérifier que tout fonctionne :

```bash
# Tester que les migrations se chargent
python manage.py migrate --plan

# Lancer effectivement les migrations
python manage.py migrate

# Vérifier qu'aucune migration n'a échoué
python manage.py showmigrations
```

## Documentation complète

- [Encodage Python](https://docs.python.org/3/howto/unicode.html)
- [Django Migrations](https://docs.djangoproject.com/en/stable/topics/migrations/)
- [Problèmes d'encodage courants](https://wiki.python.org/moin/UnicodeEncodeError)
