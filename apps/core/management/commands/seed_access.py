# Fichier: apps/core/management/commands/seed_access.py
from django.core.management.base import BaseCommand
# On importe depuis 'core' car c'est là qu'on a mis les modèles
from apps.core.models import Group, Permission 
from typing import List, Dict, Any
# TA STRUCTURE DE SEED (CORRIGÉE)
GROUP_STRUCTURE: List[Dict[str, Any]] = [
    {
        "name": "Gestion des Utilisateurs",
        "tag": "user", # Le tag correspond à la page "user"
        "permissions": [
            {"name": "Lire les utilisateurs", "codename": "view_user"},
            {"name": "Ajouter un utilisateur", "codename": "add_user"},
            {"name": "Modifier un utilisateur", "codename": "change_user"},
            {"name": "Supprimer un utilisateur", "codename": "delete_user"},
        ]
    },
    {
        "name": "Gestion des Rôles",
        "tag": "role", # Le tag correspond à la page "Role"
        "permissions": [
            {"name": "Lire les rôles", "codename": "view_role"},
            {"name": "Ajouter un rôle", "codename": "add_role"},
            {"name": "Modifier un rôle", "codename": "change_role"},
            {"name": "Supprimer un rôle", "codename": "delete_role"},
        ]
    },
    {
        "name": "Gestion des Classes",
        "tag": "classroom",
        "permissions": [
            {"name": "Lire les classes", "codename": "view_classroom"},
            {"name": "Ajouter une classe", "codename": "add_classroom"},
            {"name": "Modifier une classe", "codename": "change_classroom"},
            {"name": "Supprimer une classe", "codename": "delete_classroom"},
        ]
    },
    {
        "name": "Gestion des Niveaux",
        "tag": "level",
        "permissions": [
            {"name": "Lire les niveaux", "codename": "view_level"},
            {"name": "Ajouter un niveau", "codename": "add_level"},
            {"name": "Modifier un niveau", "codename": "change_level"},
            {"name": "Supprimer un niveau", "codename": "delete_level"},
        ]
    },
    {
        "name": "Gestion des Matières",
        "tag": "subject",
        "permissions": [
            {"name": "Lire les matières", "codename": "view_subject"},
            {"name": "Ajouter une matière", "codename": "add_subject"},
            {"name": "Modifier une matière", "codename": "change_subject"},
            {"name": "Supprimer une matière", "codename": "delete_subject"},
        ]
    },
    {
        "name": "Gestion des Années Académiques",
        "tag": "academic_year",
        "permissions": [
            {"name": "Lire les années académiques", "codename": "view_academic_year"},
            {"name": "Ajouter une année académique", "codename": "add_academic_year"},
            {"name": "Modifier une année académique", "codename": "change_academic_year"},
            {"name": "Supprimer une année académique", "codename": "delete_academic_year"},
        ]
    },
    {
        "name": "Gestion des Cycles",
        "tag": "cycle",
        "permissions": [
            {"name": "Lire les cycles", "codename": "view_cycle"},
            {"name": "Ajouter un cycle", "codename": "add_cycle"},
            {"name": "Modifier un cycle", "codename": "change_cycle"},
            {"name": "Supprimer un cycle", "codename": "delete_cycle"},
        ]
    },
    {
        "name": "Gestion des Etablissements",
        "tag": "establishment",
        "permissions": [
            {"name": "Lire les établissements", "codename": "view_establishment"},
            {"name": "Ajouter un établissement", "codename": "add_establishment"},
            {"name": "Modifier un établissement", "codename": "change_establishment"},
            {"name": "Supprimer un établissement", "codename": "delete_establishment"},
        ]
    },
    {
        "name": "Gestion des Personnels",
        "tag": "personnel",
        "permissions": [
            {"name": "Lire les personnels", "codename": "view_personnel"},
            {"name": "Ajouter un personnel", "codename": "add_personnel"},
            {"name": "Modifier un personnel", "codename": "change_personnel"},
            {"name": "Supprimer un personnel", "codename": "delete_personnel"},
        ]
    },
    {
        "name": "Gestion des Enseignants",
        "tag": "teacher",
        "permissions": [
            {"name": "Lire les enseignants", "codename": "view_teacher"},
            {"name": "Ajouter un enseignant", "codename": "add_teacher"},
            {"name": "Modifier un enseignant", "codename": "change_teacher"},
            {"name": "Supprimer un enseignant", "codename": "delete_teacher"},
        ]
    },
    {
        "name": "Gestion des Affectations",
        "tag": "teachingassignment",
        "permissions": [
            {"name": "Lire les affectations", "codename": "view_teachingassignment"},
            {"name": "Ajouter une affectation", "codename": "add_teachingassignment"},
            {"name": "Modifier une affectation", "codename": "change_teachingassignment"},
            {"name": "Supprimer une affectation", "codename": "delete_teachingassignment"},
        ]
    },
    {
        "name": "Gestion des Type de contrat",
        "tag": "contract_type",
        "permissions": [
            {"name": "Lire les type de contrat", "codename": "view_contract_type"},
            {"name": "Ajouter un type de contrat", "codename": "add_contract_type"},
            {"name": "Modifier un type de contrat", "codename": "change_contract_type"},
            {"name": "Supprimer un type de contrat", "codename": "delete_contract_type"},
        ]
    },
    {
        "name": "Gestion des Apprenants",
        "tag": "student",
        "permissions": [
            {"name": "Lire les apprenants", "codename": "view_student"},
            {"name": "Ajouter un apprenant", "codename": "add_student"},
            {"name": "Modifier un apprenant", "codename": "change_student"},
            {"name": "Supprimer un apprenant", "codename": "delete_student"},
        ]
    },
    {
        "name": "Gestion des Tuteurs",
        "tag": "guardian",
        "permissions": [
            {"name": "Lire les tuteurs", "codename": "view_guardian"},
            {"name": "Ajouter un tuteur", "codename": "add_guardian"},
            {"name": "Modifier un tuteur", "codename": "change_guardian"},
            {"name": "Supprimer un tuteur", "codename": "delete_guardian"},
        ]
    },
    {
        "name": "Gestion des Inscriptions",
        "tag": "enrollment",
        "permissions": [
            {"name": "Lire les inscriptions", "codename": "view_enrollment"},
            {"name": "Ajouter une inscription", "codename": "add_enrollment"},
            {"name": "Modifier une inscription", "codename": "change_enrollment"},
            {"name": "Supprimer une inscription", "codename": "delete_enrollment"},
        ]
    },
    {
        "name": "Gestion des Plannings",
        "tag": "planning",
        "permissions": [
            {"name": "Lire les plannings", "codename": "view_planning"},
            {"name": "Ajouter un planning", "codename": "add_planning"},
            {"name": "Modifier un planning", "codename": "change_planning"},
            {"name": "Supprimer un planning", "codename": "delete_planning"},
        ]
    },
    {
        "name": "Gestion des Tarifs",
        "tag": "feedefinition",
        "permissions": [
            {"name": "Lire les tarifs", "codename": "view_feedefinition"},
            {"name": "Ajouter un tarif", "codename": "add_feedefinition"},
            {"name": "Modifier un tarif", "codename": "change_feedefinition"},
            {"name": "Supprimer un tarif", "codename": "delete_feedefinition"},
        ]
    },
    {
        "name": "Gestion des Factures",
        "tag": "invoice",
        "permissions": [
            {"name": "Lire les factures", "codename": "view_invoice"},
            {"name": "Ajouter une facture", "codename": "add_invoice"},
            {"name": "Modifier une facture", "codename": "change_invoice"},
            {"name": "Supprimer une facture", "codename": "delete_invoice"},
        ]
    },
    {
        "name": "Gestion des Paiements",
        "tag": "payment",
        "permissions": [
            {"name": "Lire les paiements", "codename": "view_payment"},
            {"name": "Ajouter un paiement", "codename": "add_payment"},
            {"name": "Modifier un paiement", "codename": "change_payment"},
            {"name": "Supprimer un paiement", "codename": "delete_payment"},
        ]
    },
    {
        "name": "Gestion des Options",
        "tag": "option",
        "permissions": [
            {"name": "Lire les options", "codename": "view_option"},
            {"name": "Ajouter une option", "codename": "add_option"},
            {"name": "Modifier une option", "codename": "change_option"},
            {"name": "Supprimer une option", "codename": "delete_option"},
        ]
    },
    {
        "name": "Gestion des Périodes Académiques",
        "tag": "academicperiod",
        "permissions": [
            {"name": "Lire les périodes académiques", "codename": "view_academicperiod"},
            {"name": "Ajouter une période académique", "codename": "add_academicperiod"},
            {"name": "Modifier une période académique", "codename": "change_academicperiod"},
            {"name": "Supprimer une période académique", "codename": "delete_academicperiod"},
        ]
    },
    {
        "name": "Gestion des Salles",
        "tag": "room",
        "permissions": [
            {"name": "Lire les salles", "codename": "view_room"},
            {"name": "Ajouter une salle", "codename": "add_room"},
            {"name": "Modifier une salle", "codename": "change_room"},
            {"name": "Supprimer une salle", "codename": "delete_room"},
        ]
    },
    {
        "name": "Gestion des Évaluations",
        "tag": "evaluation",
        "permissions": [
            {"name": "Lire les évaluations", "codename": "view_evaluation"},
            {"name": "Ajouter une évaluation", "codename": "add_evaluation"},
            {"name": "Modifier une évaluation", "codename": "change_evaluation"},
            {"name": "Supprimer une évaluation", "codename": "delete_evaluation"},
        ]
    },
    {
        "name": "Gestion des Notes",
        "tag": "grade",
        "permissions": [
            {"name": "Lire les notes", "codename": "view_grade"},
            {"name": "Ajouter une note", "codename": "add_grade"},
            {"name": "Modifier une note", "codename": "change_grade"},
            {"name": "Supprimer une note", "codename": "delete_grade"},
        ]
    },
    {
        "name": "Gestion des Types d'Évaluations",
        "tag": "evaluationtype",
        "permissions": [
            {"name": "Lire les types d'évaluations", "codename": "view_evaluationtype"},
            {"name": "Ajouter un type d'évaluation", "codename": "add_evaluationtype"},
            {"name": "Modifier un type d'évaluation", "codename": "change_evaluationtype"},
            {"name": "Supprimer un type d'évaluation", "codename": "delete_evaluationtype"},
        ]
    },
]

class Command(BaseCommand):
    help = "Crée les Permissions et les Groupes selon la structure définie."

    def handle(self, *args, **options):
        self.stdout.write(getattr(self.style, 'NOTICE', lambda x: x)("--- Début du seeding Access (Permissions & Groups) ---"))
        
        for group_data in GROUP_STRUCTURE:
            group_name = group_data['name']
            tag = group_data['tag']
            
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(f"  Groupe '{group_name}' créé.")
            
            group.permissions.clear()
            
            for perm_data in group_data['permissions']:
                perm, p_created = Permission.objects.get_or_create(
                    codename=perm_data['codename'],
                    defaults={'name': perm_data['name'], 'tag': tag}
                )
                
                if p_created:
                    self.stdout.write(f"    Permission '{perm.codename}' créée.")
                
                group.permissions.add(perm)

            self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)(f"  ✔ Permissions pour '{group_name}' synchronisées."))

        self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)("--- Seeding Access terminé ---"))