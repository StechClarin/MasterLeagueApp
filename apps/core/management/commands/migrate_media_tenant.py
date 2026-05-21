import os
import shutil
from django.core.management.base import BaseCommand
from django.conf import settings
from django.apps import apps
from apps.documents.utils import document_upload_path
from apps.evaluations.models.evaluation_subject import generate_subject_filename

class Command(BaseCommand):
    help = "Migrate existing media files to the multi-tenant folder structure (<hub_id>/<est_id>/...)"

    def handle(self, *args, **options):
        style_notice = getattr(self.style, 'WARNING', lambda x: str(x))
        style_success = getattr(self.style, 'SUCCESS', lambda x: str(x))
        style_error = getattr(self.style, 'ERROR', lambda x: str(x))

        self.stdout.write(style_notice("--- Starting Media Migration to Multi-Tenant Structure ---"))
        
        # Définition des champs fichiers à inspecter par modèle
        # Format: 'app_label.ModelName': [('field_name', path_generator_function)]
        target_models = {
            'students.Student': [('photo', document_upload_path)],
            'documents.Document': [('file', document_upload_path)],
            'evaluations.EvaluationSubject': [('subject_file', generate_subject_filename)],
            'profilmanagement.User': [('photo', document_upload_path)],
            'core.Establishment': [('logo', document_upload_path), ('print_header', document_upload_path)],
        }
        
        media_root: str = str(settings.MEDIA_ROOT)
        total_moved = 0
        total_ignored = 0
        total_missing = 0
        
        for model_path, fields in target_models.items():
            try:
                model_class = apps.get_model(model_path)
            except LookupError:
                self.stdout.write(style_notice(f"Model {model_path} not found. Skipping."))
                continue
                
            self.stdout.write(style_success(f"\nScanning {model_class.__name__}..."))
            
            for instance in model_class.objects.all():
                for field_name, generator in fields:
                    file_field = getattr(instance, field_name)
                    if not file_field or not file_field.name:
                        continue
                        
                    old_path_rel = str(file_field.name)
                    old_path_abs = os.path.join(media_root, old_path_rel)
                    
                    # Génération du nouveau chemin attendu
                    new_path_rel = str(generator(instance, os.path.basename(old_path_rel)))
                    
                    if old_path_rel == new_path_rel:
                        total_ignored += 1
                        continue
                        
                    new_path_abs = os.path.join(media_root, new_path_rel)
                    
                    if not os.path.exists(old_path_abs):
                        self.stdout.write(style_notice(f"File missing on disk: {old_path_abs}"))
                        total_missing += 1
                        continue
                        
                    # Créer les dossiers de destination si nécessaire
                    os.makedirs(os.path.dirname(new_path_abs), exist_ok=True)
                    
                    try:
                        shutil.move(old_path_abs, new_path_abs)
                        
                        # Mise à jour en BDD avec suppression des signaux
                        model_class.objects.filter(pk=instance.pk).update(**{field_name: new_path_rel})
                        total_moved += 1
                        self.stdout.write(f"Moved: {old_path_rel} -> {new_path_rel}")
                    except Exception as e:
                        self.stdout.write(style_error(f"Error moving {old_path_rel}: {e}"))
                        
        self.stdout.write(style_notice("\n--- Migration Complete ---"))
        self.stdout.write(style_success(f"Moved: {total_moved} | Ignored (already OK): {total_ignored} | Missing: {total_missing}"))
