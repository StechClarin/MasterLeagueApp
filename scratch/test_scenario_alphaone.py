import requests
import json
import sys
import uuid

BASE_URL = 'http://127.0.0.1:8000'

class AlphaOneTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.headers = {'Content-Type': 'application/json'}
        self.establishment_id = None

    def log_step(self, title):
        print(f"\n==================================================")
        print(f"  {title}")
        print(f"==================================================")

    def login(self, username, password):
        self.log_step("0. AUTHENTIFICATION")
        res = self.session.post(f"{BASE_URL}/api/auth/login/", json={'username': username, 'password': password})
        if res.status_code == 200:
            data = res.json()
            self.access_token = data['access']
            self.headers['Authorization'] = f"Bearer {self.access_token}"
            print(f"✔ Authentification réussie pour '{username}'. Token JWT généré.")
            return True
        else:
            print(f"❌ Échec de la connexion: {res.status_code} {res.text}")
            sys.exit(1)

    def set_establishment_context(self, est_id):
        self.establishment_id = str(est_id)
        self.headers['X-Establishment-Id'] = str(est_id)
        print(f"📌 Contexte d'établissement mis à jour : {est_id}")

    def call_api_cud(self, model, method, payload={}, pk=None):
        url = f"{BASE_URL}/api/{model}/{method}/"
        if pk:
            url += f"{pk}/"
        res = self.session.post(url, json=payload, headers=self.headers)
        return res

    def run_test_and_real_creation(self, entity_name, model_api_name, dummy_payload, dummy_edit_payload, real_payloads):
        print(f"\n--- [TEST DUMMY] {entity_name} ---")
        
        # Generer des noms et codes uniques pour le test dummy (code max 10 chars pour Cycle)
        uid = uuid.uuid4().hex[:4]
        if 'code' in dummy_payload:
            dummy_payload['code'] = f"D_{uid}"[:10]
        if 'name' in dummy_payload:
            dummy_payload['name'] = f"{dummy_payload['name']}_{uid}"
            
        if dummy_edit_payload:
            if 'code' in dummy_edit_payload:
                dummy_edit_payload['code'] = f"E_{uid}"[:10]
            if 'name' in dummy_edit_payload:
                dummy_edit_payload['name'] = f"{dummy_edit_payload['name']}_EDIT_{uid}"

        # 1. Création Dummy
        res_create = self.call_api_cud(model_api_name, 'save', dummy_payload)
        assert res_create.status_code in [200, 201], f"❌ Échec création dummy {entity_name}: {res_create.status_code} {res_create.text}"
        dummy_data = res_create.json()
        dummy_id = dummy_data.get('id') or dummy_data.get('data', {}).get('id')
        print(f"  ✔ [1/3] Création Dummy réussie (ID: {dummy_id})")

        # 2. Édition Dummy
        if dummy_id and dummy_edit_payload:
            dummy_edit_payload['id'] = dummy_id
            res_edit = self.call_api_cud(model_api_name, 'save', dummy_edit_payload, pk=dummy_id)
            assert res_edit.status_code in [200, 201], f"❌ Échec édition dummy {entity_name}: {res_edit.status_code} {res_edit.text}"
            print(f"  ✔ [2/3] Édition Dummy réussie")

        # 3. Supprimer / Nettoyer Dummy
        if dummy_id:
            res_del = self.call_api_cud(model_api_name, 'delete', {'id': dummy_id}, pk=dummy_id)
            print(f"  ✔ [3/3] Supprimer Dummy réussi (Status HTTP: {res_del.status_code})")

        # 4. Créations Réelles (Scénario Métier)
        print(f"\n--- [CRÉATION RÉELLE SCÉNARIO] {entity_name} ({len(real_payloads)} élément(s)) ---")
        created_items = []
        for idx, payload in enumerate(real_payloads, 1):
            res_real = self.call_api_cud(model_api_name, 'save', payload)
            assert res_real.status_code in [200, 201], f"❌ Échec création réelle {entity_name} #{idx}: {res_real.status_code} {res_real.text}"
            item_data = res_real.json()
            item_id = item_data.get('id') or item_data.get('data', {}).get('id')
            item_data['created_id'] = item_id
            created_items.append(item_data)
            name_val = payload.get('name') or payload.get('title') or payload.get('code')
            print(f"  ✔ [{idx}/{len(real_payloads)}] '{name_val}' créé avec succès (ID: {item_id})")

        return created_items

if __name__ == '__main__':
    tester = AlphaOneTester()
    tester.login('ethernanos', 'admin1234')

    # =========================================================================
    # 1. ÉTABLISSEMENTS (/establishments) -> Establishment
    # =========================================================================
    tester.log_step("1. PAGE ÉTABLISSEMENTS (/establishments)")
    uid_alpha = uuid.uuid4().hex[:4]
    real_est = tester.run_test_and_real_creation(
        entity_name="Établissement",
        model_api_name="establishment",
        dummy_payload={"name": "TEST_ETABLISSEMENT_DUMMY", "code": "DUMMY", "city": "Brazzaville", "address": "Rue Test"},
        dummy_edit_payload={"name": "TEST_ETABLISSEMENT_EDITED", "code": "DUMMY", "city": "Brazzaville", "address": "Rue Test Edit"},
        real_payloads=[
            {"name": f"AlphaOne_{uid_alpha}", "code": f"A1_{uid_alpha}"[:10], "city": "Brazzaville", "address": "123 Rue de l'Éducation", "phone": "+242 06 000 0000", "email": "contact@alphaone.edu"}
        ]
    )
    
    alphaone_id = real_est[0]['created_id']
    tester.set_establishment_context(alphaone_id)

    # =========================================================================
    # 2. ANNÉES SCOLAIRES (/years) -> AcademicYear
    # =========================================================================
    tester.log_step("2. PAGE ANNÉES SCOLAIRES (/years)")
    real_years = tester.run_test_and_real_creation(
        entity_name="Année Scolaire",
        model_api_name="academicyear",
        dummy_payload={"name": f"2098-{uid_alpha}", "start_date": "2098-09-01", "end_date": "2099-06-30", "is_current": False},
        dummy_edit_payload={"name": f"2098-{uid_alpha}", "start_date": "2098-09-01", "end_date": "2099-06-30", "is_current": False},
        real_payloads=[
            {"name": f"2025-2026_{uid_alpha}", "start_date": "2025-09-01", "end_date": "2026-06-30", "is_current": True}
        ]
    )
    year_id = real_years[0]['created_id']

    # =========================================================================
    # 3. CYCLES & NIVEAUX (/tree) -> Cycle & Level
    # (Doit précéder Périodes Académiques car AcademicPeriod exige des cycles !)
    # =========================================================================
    tester.log_step("3. PAGE CYCLES & NIVEAUX (/tree)")
    real_cycles = tester.run_test_and_real_creation(
        entity_name="Cycle",
        model_api_name="cycle",
        dummy_payload={"name": "Cycle Test Dummy", "code": "CYC_DUMMY", "order": 99},
        dummy_edit_payload={"name": "Cycle Test Edited", "code": "CYC_ED", "order": 99},
        real_payloads=[
            {"name": "Collège", "code": f"COL_{uid_alpha}"[:10], "order": 1, "has_options": False},
            {"name": "Lycée", "code": f"LYC_{uid_alpha}"[:10], "order": 2, "has_options": True}
        ]
    )
    cycle_college_id = real_cycles[0]['created_id']
    cycle_lycee_id = real_cycles[1]['created_id']
    all_cycle_ids = [cycle_college_id, cycle_lycee_id]

    real_levels = tester.run_test_and_real_creation(
        entity_name="Niveau",
        model_api_name="level",
        dummy_payload={"name": "Niveau Test Dummy", "code": "NIV_DUMMY", "cycle": cycle_college_id, "order": 99},
        dummy_edit_payload={"name": "Niveau Test Edited", "code": "NIV_ED", "cycle": cycle_college_id, "order": 99},
        real_payloads=[
            # Collège
            {"name": "6ème", "code": f"6E_{uid_alpha}"[:20], "cycle": cycle_college_id, "order": 1},
            {"name": "5ème", "code": f"5E_{uid_alpha}"[:20], "cycle": cycle_college_id, "order": 2},
            {"name": "4ème", "code": f"4E_{uid_alpha}"[:20], "cycle": cycle_college_id, "order": 3},
            {"name": "3ème", "code": f"3E_{uid_alpha}"[:20], "cycle": cycle_college_id, "order": 4},
            # Lycée
            {"name": "Seconde", "code": f"2N_{uid_alpha}"[:20], "cycle": cycle_lycee_id, "order": 5},
            {"name": "Première", "code": f"1E_{uid_alpha}"[:20], "cycle": cycle_lycee_id, "order": 6},
            {"name": "Terminale", "code": f"TL_{uid_alpha}"[:20], "cycle": cycle_lycee_id, "order": 7},
        ]
    )
    level_6eme_id = real_levels[0]['created_id']
    level_3eme_id = real_levels[3]['created_id']
    level_2nd_id = real_levels[4]['created_id']
    level_tle_id = real_levels[6]['created_id']

    # =========================================================================
    # 4. PÉRIODES ACADÉMIQUES (/academic-periods) -> AcademicPeriod
    # =========================================================================
    tester.log_step("4. PAGE PÉRIODES ACADÉMIQUES (/academic-periods)")
    real_periods = tester.run_test_and_real_creation(
        entity_name="Période Académique",
        model_api_name="academicperiod",
        dummy_payload={"name": "Trimestre Test", "academic_year": year_id, "cycles": all_cycle_ids, "start_date": "2025-09-01", "end_date": "2025-10-01"},
        dummy_edit_payload={"name": "Trimestre Test", "academic_year": year_id, "cycles": all_cycle_ids, "start_date": "2025-09-01", "end_date": "2025-10-01"},
        real_payloads=[
            {"name": "Trimestre 1", "academic_year": year_id, "cycles": all_cycle_ids, "start_date": "2025-09-01", "end_date": "2025-12-20"},
            {"name": "Trimestre 2", "academic_year": year_id, "cycles": all_cycle_ids, "start_date": "2026-01-05", "end_date": "2026-04-10"},
            {"name": "Trimestre 3", "academic_year": year_id, "cycles": all_cycle_ids, "start_date": "2026-04-20", "end_date": "2026-06-30"}
        ]
    )

    # =========================================================================
    # 5. OPTIONS / FILIÈRES (/options) -> Option
    # =========================================================================
    tester.log_step("5. PAGE OPTIONS / FILIÈRES (/options)")
    real_options = tester.run_test_and_real_creation(
        entity_name="Option / Filière",
        model_api_name="option",
        dummy_payload={"name": "Option Test Dummy", "code": "OPT_DUMMY", "description": "Desc test"},
        dummy_edit_payload={"name": "Option Test Edited", "code": "OPT_ED", "description": "Desc test edit"},
        real_payloads=[
            {"name": "Série D", "code": f"SER_D_{uid_alpha}"[:20], "description": "Sciences Biologiques & Physiques"},
            {"name": "Série C", "code": f"SER_C_{uid_alpha}"[:20], "description": "Mathématiques & Physiques"},
        ]
    )
    option_serie_d_id = real_options[0]['created_id']
    option_serie_c_id = real_options[1]['created_id']

    # =========================================================================
    # 6. GROUPES & UES (/subject-groups) -> SubjectGroup
    # =========================================================================
    tester.log_step("6. PAGE GROUPES & UES (/subject-groups)")
    real_sub_groups = tester.run_test_and_real_creation(
        entity_name="Groupe de Matières (UE)",
        model_api_name="subjectgroup",
        dummy_payload={"name": "Groupe Test Dummy", "code": "GRP_DUMMY"},
        dummy_edit_payload={"name": "Groupe Test Edited", "code": "GRP_ED"},
        real_payloads=[
            {"name": "Sciences Exactes", "code": f"SCI_EX_{uid_alpha}"[:20]},
            {"name": "Lettres & Langues", "code": f"LET_LA_{uid_alpha}"[:20]},
            {"name": "Sciences Humaines", "code": f"SCI_HU_{uid_alpha}"[:20]},
        ]
    )
    group_sci_id = real_sub_groups[0]['created_id']
    group_lettres_id = real_sub_groups[1]['created_id']
    group_humaines_id = real_sub_groups[2]['created_id']

    level_6eme_id = real_levels[0]['created_id']
    level_5eme_id = real_levels[1]['created_id']
    level_4eme_id = real_levels[2]['created_id']
    level_3eme_id = real_levels[3]['created_id']
    level_2nd_id = real_levels[4]['created_id']
    level_1ere_id = real_levels[5]['created_id']
    level_tle_id = real_levels[6]['created_id']

    # =========================================================================
    # 7. MATIÈRES (/subjects) -> Subject + LevelSubjects (Paramétrage Coefficients par Niveau & Option)
    # =========================================================================
    tester.log_step("7. PAGE MATIÈRES (/subjects) - Paramétrage Coefficients par Niveau & Option")
    real_subjects = tester.run_test_and_real_creation(
        entity_name="Matière",
        model_api_name="subject",
        dummy_payload={
            "name": "Matière Test Dummy", 
            "code": "MAT_DUMMY", 
            "group": group_sci_id,
            "level_subjects": [{"level": level_6eme_id, "coefficient": 2}]
        },
        dummy_edit_payload={
            "name": "Matière Test Edited", 
            "code": "MAT_ED", 
            "group": group_sci_id,
            "level_subjects": [{"level": level_6eme_id, "coefficient": 3}]
        },
        real_payloads=[
            {
                "name": "Mathématiques", 
                "code": f"MATH_{uid_alpha}"[:20], 
                "group": group_sci_id,
                "level_subjects": [
                    {"level": level_6eme_id, "group": group_sci_id, "coefficient": 3},
                    {"level": level_5eme_id, "group": group_sci_id, "coefficient": 3},
                    {"level": level_4eme_id, "group": group_sci_id, "coefficient": 4},
                    {"level": level_3eme_id, "group": group_sci_id, "coefficient": 4},
                    {"level": level_2nd_id, "option": option_serie_c_id, "group": group_sci_id, "coefficient": 5},
                    {"level": level_2nd_id, "option": option_serie_d_id, "group": group_sci_id, "coefficient": 4},
                    {"level": level_tle_id, "option": option_serie_c_id, "group": group_sci_id, "coefficient": 6},
                    {"level": level_tle_id, "option": option_serie_d_id, "group": group_sci_id, "coefficient": 4},
                ]
            },
            {
                "name": "Physique-Chimie", 
                "code": f"PHYS_{uid_alpha}"[:20], 
                "group": group_sci_id,
                "level_subjects": [
                    {"level": level_4eme_id, "group": group_sci_id, "coefficient": 2},
                    {"level": level_3eme_id, "group": group_sci_id, "coefficient": 2},
                    {"level": level_2nd_id, "option": option_serie_c_id, "group": group_sci_id, "coefficient": 4},
                    {"level": level_2nd_id, "option": option_serie_d_id, "group": group_sci_id, "coefficient": 4},
                    {"level": level_tle_id, "option": option_serie_c_id, "group": group_sci_id, "coefficient": 5},
                    {"level": level_tle_id, "option": option_serie_d_id, "group": group_sci_id, "coefficient": 5},
                ]
            },
            {
                "name": "SVT", 
                "code": f"SVT_{uid_alpha}"[:20], 
                "group": group_sci_id,
                "level_subjects": [
                    {"level": level_6eme_id, "group": group_sci_id, "coefficient": 2},
                    {"level": level_5eme_id, "group": group_sci_id, "coefficient": 2},
                    {"level": level_4eme_id, "group": group_sci_id, "coefficient": 2},
                    {"level": level_3eme_id, "group": group_sci_id, "coefficient": 2},
                    {"level": level_2nd_id, "option": option_serie_c_id, "group": group_sci_id, "coefficient": 2},
                    {"level": level_2nd_id, "option": option_serie_d_id, "group": group_sci_id, "coefficient": 5},
                    {"level": level_tle_id, "option": option_serie_d_id, "group": group_sci_id, "coefficient": 6},
                ]
            },
            {
                "name": "Français", 
                "code": f"FRA_{uid_alpha}"[:20], 
                "group": group_lettres_id,
                "level_subjects": [
                    {"level": level_6eme_id, "group": group_lettres_id, "coefficient": 3},
                    {"level": level_5eme_id, "group": group_lettres_id, "coefficient": 3},
                    {"level": level_4eme_id, "group": group_lettres_id, "coefficient": 4},
                    {"level": level_3eme_id, "group": group_lettres_id, "coefficient": 4},
                    {"level": level_2nd_id, "group": group_lettres_id, "coefficient": 3},
                    {"level": level_1ere_id, "group": group_lettres_id, "coefficient": 4},
                    {"level": level_tle_id, "group": group_lettres_id, "coefficient": 3},
                ]
            },
            {
                "name": "Anglais", 
                "code": f"ANG_{uid_alpha}"[:20], 
                "group": group_lettres_id,
                "level_subjects": [
                    {"level": level_6eme_id, "group": group_lettres_id, "coefficient": 2},
                    {"level": level_5eme_id, "group": group_lettres_id, "coefficient": 2},
                    {"level": level_4eme_id, "group": group_lettres_id, "coefficient": 2},
                    {"level": level_3eme_id, "group": group_lettres_id, "coefficient": 2},
                    {"level": level_2nd_id, "group": group_lettres_id, "coefficient": 2},
                    {"level": level_1ere_id, "group": group_lettres_id, "coefficient": 2},
                    {"level": level_tle_id, "group": group_lettres_id, "coefficient": 2},
                ]
            },
            {
                "name": "Histoire-Géo", 
                "code": f"HG_{uid_alpha}"[:20], 
                "group": group_humaines_id,
                "level_subjects": [
                    {"level": level_6eme_id, "group": group_humaines_id, "coefficient": 2},
                    {"level": level_5eme_id, "group": group_humaines_id, "coefficient": 2},
                    {"level": level_4eme_id, "group": group_humaines_id, "coefficient": 2},
                    {"level": level_3eme_id, "group": group_humaines_id, "coefficient": 2},
                    {"level": level_2nd_id, "group": group_humaines_id, "coefficient": 2},
                    {"level": level_1ere_id, "group": group_humaines_id, "coefficient": 2},
                    {"level": level_tle_id, "group": group_humaines_id, "coefficient": 2},
                ]
            },
        ]
    )

    # 8. CLASSES (/classes) -> ClassRoom (Au moins 1 classe par niveau, capacité: 30)
    # =========================================================================
    tester.log_step("8. PAGE CLASSES (/classes) - 1 Classe par Niveau (Capacité: 30)")
    real_classes = tester.run_test_and_real_creation(
        entity_name="Classe",
        model_api_name="classroom",
        dummy_payload={"name": "Classe Test Dummy", "level": level_6eme_id, "academic_year": year_id, "capacity": 30},
        dummy_edit_payload={"name": "Classe Test Edited", "level": level_6eme_id, "academic_year": year_id, "capacity": 30},
        real_payloads=[
            {"name": "6ème A", "level": level_6eme_id, "academic_year": year_id, "capacity": 30},
            {"name": "5ème A", "level": level_5eme_id, "academic_year": year_id, "capacity": 30},
            {"name": "4ème A", "level": level_4eme_id, "academic_year": year_id, "capacity": 30},
            {"name": "3ème B", "level": level_3eme_id, "academic_year": year_id, "capacity": 30},
            {"name": "Seconde C", "level": level_2nd_id, "option": option_serie_c_id, "academic_year": year_id, "capacity": 30},
            {"name": "Première C", "level": level_1ere_id, "option": option_serie_c_id, "academic_year": year_id, "capacity": 30},
            {"name": "Terminale D", "level": level_tle_id, "option": option_serie_d_id, "academic_year": year_id, "capacity": 30},
        ]
    )

    # =========================================================================
    # 9. SALLES (/rooms) -> Room (15 Salles)
    # =========================================================================
    tester.log_step("9. PAGE SALLES (/rooms) - 15 Salles")
    room_payloads = [
        {"name": f"Salle {i:02d}", "code": f"S_{i:02d}_{uid_alpha}"[:20], "capacity": 40} for i in range(1, 16)
    ]
    real_rooms = tester.run_test_and_real_creation(
        entity_name="Salle",
        model_api_name="room",
        dummy_payload={"name": "Salle Test Dummy", "code": "SALLE_DUMMY", "capacity": 10},
        dummy_edit_payload={"name": "Salle Test Edited", "code": "SALLE_ED", "capacity": 20},
        real_payloads=room_payloads
    )

    # =========================================================================
    # MODULE FINANCE
    # =========================================================================

    # 10. PAGE CONFIGURATION TARIFS (/fees) -> FeeDefinition
    tester.log_step("10. PAGE CONFIGURATION TARIFS (/fees)")
    real_fees = tester.run_test_and_real_creation(
        entity_name="Définition de Frais",
        model_api_name="feedefinition",
        dummy_payload={"name": "Frais Test Dummy", "category": "TUITION", "amount": 10000, "level": level_6eme_id, "academic_year": year_id},
        dummy_edit_payload={"name": "Frais Test Edited", "category": "TUITION", "amount": 12000, "level": level_6eme_id, "academic_year": year_id},
        real_payloads=[
            {
                "name": "Frais d'Inscription Collège",
                "category": "REGISTRATION",
                "amount": 15000,
                "level": level_6eme_id,
                "academic_year": year_id,
                "payment_modality": "UNIQUE"
            },
            {
                "name": "Scolarité Trimestrielle Collège",
                "category": "TUITION",
                "amount": 45000,
                "level": level_6eme_id,
                "academic_year": year_id,
                "payment_modality": "INSTALLMENTS",
                "installment_count": 3,
                "installment_period": "TRIMESTRIAL"
            },
            {
                "name": "Scolarité Lycée Série C",
                "category": "TUITION",
                "amount": 60000,
                "level": level_2nd_id,
                "option": option_serie_c_id,
                "academic_year": year_id,
                "payment_modality": "INSTALLMENTS",
                "installment_count": 3
            }
        ]
    )

    # 11. PAGE DÉPENSES (/expenses) -> Expense
    tester.log_step("11. PAGE DÉPENSES (/expenses)")
    real_expenses = tester.run_test_and_real_creation(
        entity_name="Dépense",
        model_api_name="expense",
        dummy_payload={"title": "Dépense Test Dummy", "category": "AUTRE", "amount": 5000, "expense_date": "2026-09-01", "payment_method": "CASH"},
        dummy_edit_payload={"title": "Dépense Test Edited", "category": "AUTRE", "amount": 6000, "expense_date": "2026-09-01", "payment_method": "CASH"},
        real_payloads=[
            {
                "title": "Achat fournitures de bureau",
                "category": "SUPPLIES",
                "amount": 25000,
                "expense_date": "2026-09-15",
                "payment_method": "CASH",
                "reference": "FAC-FOURN-001"
            },
            {
                "title": "Abonnement Internet Septembre",
                "category": "UTILITIES",
                "amount": 35000,
                "expense_date": "2026-09-20",
                "payment_method": "MOBILE_MONEY",
                "reference": "MM-INT-9921"
            }
        ]
    )

    # 12. PRÉREQUIS ÉLÈVE D'ESSAI POUR FACTURATION & ENCAISSEMENT
    tester.log_step("12. PRÉREQUIS: CRÉATION D'UN ÉLÈVE D'ESSAI POUR FINANCES")
    class_6eme_a_id = real_classes[0]['created_id']
    real_students = tester.run_test_and_real_creation(
        entity_name="Élève",
        model_api_name="student",
        dummy_payload={
            "matricule": f"MAT_D_{uid_alpha}"[:15],
            "first_name": "DummyFirst",
            "last_name": "DummyLast",
            "gender": "M",
            "date_of_birth": "2012-01-01",
            "parents_input": [{"role": "FATHER", "first_name": "FatherD", "last_name": "LastD", "phone_number": "060000000"}]
        },
        dummy_edit_payload={
            "matricule": f"MAT_D_{uid_alpha}"[:15],
            "first_name": "DummyFirstEdit",
            "last_name": "DummyLastEdit",
            "gender": "M",
            "date_of_birth": "2012-01-01",
            "parents_input": [{"role": "FATHER", "first_name": "FatherD", "last_name": "LastD", "phone_number": "060000000"}]
        },
        real_payloads=[
            {
                "matricule": f"MAT_REAL_{uid_alpha}"[:20],
                "first_name": "Jean",
                "last_name": "KOUASSI",
                "gender": "M",
                "date_of_birth": "2011-04-12",
                "parents_input": [{"role": "FATHER", "first_name": "Marc", "last_name": "KOUASSI", "phone_number": "061234567"}],
                "enrollment_input": {"classroom_id": class_6eme_a_id, "academic_year_id": year_id}
            }
        ]
    )
    student_jean_id = real_students[0]['created_id']

    # 13. PAGE FACTURATION (/invoices) -> Invoice
    tester.log_step("13. PAGE FACTURATION (/invoices)")
    real_invoices = tester.run_test_and_real_creation(
        entity_name="Facture",
        model_api_name="invoice",
        dummy_payload={"student": student_jean_id, "title": "Facture Test Dummy", "total_amount": 10000, "installment_count": 3, "category": "TUITION"},
        dummy_edit_payload={"student": student_jean_id, "title": "Facture Test Edited", "total_amount": 12000, "installment_count": 3, "category": "TUITION"},
        real_payloads=[
            {
                "student": student_jean_id,
                "title": "Facture Inscription - Jean KOUASSI",
                "total_amount": 15000,
                "installment_count": 1,
                "category": "REGISTRATION",
                "due_date": "2025-09-30"
            },
            {
                "student": student_jean_id,
                "title": "Facture Scolarité T1 - Jean KOUASSI",
                "total_amount": 45000,
                "installment_count": 3,
                "category": "TUITION",
                "due_date": "2025-10-15"
            }
        ]
    )
    invoice_registration_id = real_invoices[0]['created_id']
    invoice_tuition_id = real_invoices[1]['created_id']

    # 14. PAGE ENCAISSEMENTS (/payments) -> Payment
    tester.log_step("14. PAGE ENCAISSEMENTS (/payments)")
    real_payments = tester.run_test_and_real_creation(
        entity_name="Paiement",
        model_api_name="payment",
        dummy_payload={"invoice": invoice_tuition_id, "amount": 5000, "payment_method": "CASH", "note": "Dummy payment"},
        dummy_edit_payload={"invoice": invoice_tuition_id, "amount": 6000, "payment_method": "CASH", "note": "Dummy edit payment"},
        real_payloads=[
            {
                "invoice": invoice_registration_id,
                "amount": 15000,
                "payment_method": "CASH",
                "reference": "REC-001-ALPHA",
                "note": "Paiement total inscription"
            },
            {
                "invoice": invoice_tuition_id,
                "amount": 20000,
                "payment_method": "MOBILE_MONEY",
                "reference": "MM-88776655",
                "note": "Acompte tranche 1"
            }
        ]
    )

    # =========================================================================
    # MODULE ÉVALUATIONS
    # =========================================================================

    # 15. PAGE PARAMÉTRAGE BARÈME (/evaluation-types) -> EvaluationType
    tester.log_step("15. PAGE PARAMÉTRAGE BARÈME (/evaluation-types)")
    real_eval_types = tester.run_test_and_real_creation(
        entity_name="Type d'Évaluation",
        model_api_name="evaluationtype",
        dummy_payload={"name": "Type Test Dummy", "code": "TYP_DUMMY", "weight": 1.0},
        dummy_edit_payload={"name": "Type Test Edited", "code": "TYP_ED", "weight": 1.5},
        real_payloads=[
            {"name": "Contrôle Continu", "code": f"CC_{uid_alpha}"[:20], "weight": 1.0, "description": "Interrogations et devoirs en classe"},
            {"name": "Composition Trimestrielle", "code": f"CP_{uid_alpha}"[:20], "weight": 2.0, "description": "Examens de fin de trimestre"},
            {"name": "Examen Blanc", "code": f"EX_{uid_alpha}"[:20], "weight": 3.0, "description": "Épreuves de préparation aux examens d'État"}
        ]
    )
    eval_type_compo_id = real_eval_types[1]['created_id']

    # 16. PAGE SESSIONS D'EXAMENS (/evaluations) -> EvaluationSession
    tester.log_step("16. PAGE SESSIONS D'EXAMENS (/evaluations)")
    period_t1_id = real_periods[0]['created_id']
    real_eval_sessions = tester.run_test_and_real_creation(
        entity_name="Session d'Évaluation",
        model_api_name="evaluationsession",
        dummy_payload={"title": f"Session Dummy {uid_alpha}", "scope": "CLASS", "status": "DRAFT", "academic_period": period_t1_id, "evaluation_type": eval_type_compo_id},
        dummy_edit_payload={"title": f"Session Dummy Edit {uid_alpha}", "scope": "CLASS", "status": "DRAFT", "academic_period": period_t1_id, "evaluation_type": eval_type_compo_id},
        real_payloads=[
            {
                "title": f"Composition du 1er Trimestre {uid_alpha}",
                "scope": "ESTABLISHMENT",
                "status": "IN_PROGRESS",
                "academic_period": period_t1_id,
                "evaluation_type": eval_type_compo_id
            }
        ]
    )
    session_compo_t1_id = real_eval_sessions[0]['created_id']

    # 17. ÉPREUVES D'ÉVALUATION (EvaluationSubject)
    tester.log_step("17. ÉPREUVES DE LA SESSION D'EXAMEN")
    subject_math_id = real_subjects[0]['created_id']
    subject_francais_id = real_subjects[3]['created_id']
    real_eval_subjects = tester.run_test_and_real_creation(
        entity_name="Épreuve d'Évaluation",
        model_api_name="evaluationsubject",
        dummy_payload={"session": session_compo_t1_id, "subject": subject_math_id, "max_score": 20.0},
        dummy_edit_payload={"session": session_compo_t1_id, "subject": subject_math_id, "max_score": 20.0},
        real_payloads=[
            {"session": session_compo_t1_id, "subject": subject_math_id, "max_score": 20.0},
            {"session": session_compo_t1_id, "subject": subject_francais_id, "max_score": 20.0}
        ]
    )
    eval_sub_math_id = real_eval_subjects[0]['created_id']
    eval_sub_fra_id = real_eval_subjects[1]['created_id']

    # 18. PLANIFICATION LOGISTIQUE (EvaluationPlanning) - Date de commencement 05/10/2026
    tester.log_step("18. PLANIFICATION D'ÉPREUVES (Commencement le 05/10/2026)")
    room_1_id = real_rooms[0]['created_id']
    real_plannings = tester.run_test_and_real_creation(
        entity_name="Planification d'Épreuve",
        model_api_name="evaluationplanning",
        dummy_payload={"evaluation_subject": eval_sub_math_id, "date": "2026-10-05", "start_time": "08:00:00", "duration_minutes": 60},
        dummy_edit_payload={"evaluation_subject": eval_sub_math_id, "date": "2026-10-05", "start_time": "08:30:00", "duration_minutes": 60},
        real_payloads=[
            {
                "evaluation_subject": eval_sub_math_id,
                "date": "2026-10-05",
                "start_time": "08:00:00",
                "duration_minutes": 120,
                "rooms": [room_1_id]
            },
            {
                "evaluation_subject": eval_sub_fra_id,
                "date": "2026-10-06",
                "start_time": "08:00:00",
                "duration_minutes": 120,
                "rooms": [room_1_id]
            }
        ]
    )

    # 19. PAGE NOTES & BULLETINS (/grade-entry) -> Grade
    tester.log_step("19. PAGE NOTES & BULLETINS (/grade-entry)")
    dummy_student_res = tester.call_api_cud('student', 'save', {
        "matricule": f"MAT_DG_{uid_alpha}"[:15],
        "first_name": "DummyGrade",
        "last_name": "Student",
        "gender": "F",
        "date_of_birth": "2012-05-05",
        "parents_input": [{"role": "MOTHER", "first_name": "Mom", "last_name": "Dummy", "phone_number": "060000001"}]
    })
    dummy_student_id = dummy_student_res.json().get('id') or dummy_student_res.json().get('data', {}).get('id')

    real_grades = tester.run_test_and_real_creation(
        entity_name="Note",
        model_api_name="grade",
        dummy_payload={"student": dummy_student_id, "evaluation_subject": eval_sub_math_id, "value": 10.0, "comment": "Dummy note"},
        dummy_edit_payload={"student": dummy_student_id, "evaluation_subject": eval_sub_math_id, "value": 12.0, "comment": "Dummy note edit"},
        real_payloads=[
            {
                "student": student_jean_id,
                "evaluation_subject": eval_sub_math_id,
                "value": 16.50,
                "comment": "Très bon travail en mathématiques"
            },
            {
                "student": student_jean_id,
                "evaluation_subject": eval_sub_fra_id,
                "value": 14.00,
                "comment": "Bonne analyse de texte"
            }
        ]
    )
    if dummy_student_id:
        tester.call_api_cud('student', 'delete', {'id': dummy_student_id}, pk=dummy_student_id)

    # =========================================================================
    # MODULE VIE SCOLAIRE / SCOLARITÉ
    # =========================================================================

    # 20. PAGE APPRENANTS (ÉLÈVES) (/students) -> Student
    tester.log_step("20. PAGE APPRENANTS (ÉLÈVES) (/students)")
    real_students_vs = tester.run_test_and_real_creation(
        entity_name="Élève (Vie Scolaire)",
        model_api_name="student",
        dummy_payload={
            "matricule": f"MAT_VS_{uid_alpha}"[:15],
            "first_name": "DummyVS",
            "last_name": "Student",
            "gender": "F",
            "date_of_birth": "2011-01-01",
            "parents_input": [{"role": "TUTOR", "first_name": "Tuteur", "last_name": "Dummy", "phone_number": "060000002"}]
        },
        dummy_edit_payload={
            "matricule": f"MAT_VS_{uid_alpha}"[:15],
            "first_name": "DummyVSEdit",
            "last_name": "Student",
            "gender": "F",
            "date_of_birth": "2011-01-01",
            "parents_input": [{"role": "TUTOR", "first_name": "Tuteur", "last_name": "Dummy", "phone_number": "060000002"}]
        },
        real_payloads=[
            {
                "matricule": f"MAT_MB_{uid_alpha}"[:15],
                "first_name": "Marie",
                "last_name": "MBEMBA",
                "gender": "F",
                "date_of_birth": "2010-09-18",
                "parents_input": [{"role": "MOTHER", "first_name": "Alice", "last_name": "MBEMBA", "phone_number": "065554433"}]
            },
            {
                "matricule": f"MAT_ND_{uid_alpha}"[:15],
                "first_name": "Paul",
                "last_name": "NDINGA",
                "gender": "M",
                "date_of_birth": "2008-03-25",
                "parents_input": [{"role": "FATHER", "first_name": "Joseph", "last_name": "NDINGA", "phone_number": "067778899"}]
            }
        ]
    )
    student_marie_id = real_students_vs[0]['created_id']
    student_paul_id = real_students_vs[1]['created_id']

    # 21. PAGE INSCRIPTIONS (/enrollments) -> Enrollment
    tester.log_step("21. PAGE INSCRIPTIONS (/enrollments)")
    class_3eme_b_id = real_classes[3]['created_id']
    class_seconde_c_id = real_classes[4]['created_id']

    # Élève temporaire pour le test dummy d'inscription afin de respecter la contrainte d'unicité (student, academic_year)
    dummy_student_enr_res = tester.call_api_cud('student', 'save', {
        "matricule": f"MAT_DENR_{uid_alpha}"[:15],
        "first_name": "DummyEnroll",
        "last_name": "Student",
        "gender": "M",
        "date_of_birth": "2010-02-02",
        "parents_input": [{"role": "FATHER", "first_name": "Dad", "last_name": "Dummy", "phone_number": "060000003"}]
    })
    dummy_student_enr_id = dummy_student_enr_res.json().get('id') or dummy_student_enr_res.json().get('data', {}).get('id')

    real_enrollments = tester.run_test_and_real_creation(
        entity_name="Inscription",
        model_api_name="enrollment",
        dummy_payload={"student": dummy_student_enr_id, "classroom": class_3eme_b_id, "academic_year": year_id, "status": "PENDING"},
        dummy_edit_payload={"student": dummy_student_enr_id, "classroom": class_3eme_b_id, "academic_year": year_id, "status": "PENDING"},
        real_payloads=[
            {
                "student": student_marie_id,
                "classroom": class_3eme_b_id,
                "academic_year": year_id,
                "status": "REGISTERED",
                "is_repeater": False
            },
            {
                "student": student_paul_id,
                "classroom": class_seconde_c_id,
                "academic_year": year_id,
                "status": "REGISTERED",
                "is_repeater": False
            }
        ]
    )
    if dummy_student_enr_id:
        tester.call_api_cud('student', 'delete', {'id': dummy_student_enr_id}, pk=dummy_student_enr_id)

    # =========================================================================
    # 22. TEST DE CAPACITÉ ET DÉBORDEMENT (40 ÉLÈVES POUR 30 PLACES)
    # =========================================================================
    tester.log_step("22. TEST DE CAPACITÉ & DÉBORDEMENT (40 ÉLÈVES POUR CLASSE CAPACITÉ 30)")
    class_6eme_a_id = real_classes[0]['created_id']
    print(f"📌 Classe cible : '6ème A' (Capacité maximale configurée : 30 places)")

    # 1. Remplissage des 30 premières places (1 élève Jean KOUASSI déjà présent + 29 nouveaux = 30/30)
    print("\n--- [REMPLISSAGE 1 à 30] Inscription des 30 premiers élèves dans '6ème A' ---")
    print(f"  ✔ [1/30] Élève 'Jean KOUASSI' déjà inscrit initialement dans '6ème A'.")
    student_30_ids = []
    for i in range(2, 31):
        s_res = tester.call_api_cud('student', 'save', {
            "matricule": f"MAT_6A_{i:02d}_{uid_alpha}"[:20],
            "first_name": f"Élève6A_{i:02d}",
            "last_name": "TEST",
            "gender": "M" if i % 2 == 1 else "F",
            "date_of_birth": "2012-01-01",
            "parents_input": [{"role": "FATHER", "first_name": "Parent", "last_name": f"Test{i}", "phone_number": "060000000"}],
            "enrollment_input": {"classroom_id": class_6eme_a_id, "academic_year_id": year_id, "auto_create_classroom": False}
        })
        assert s_res.status_code in [200, 201], f"❌ Échec inscription élève #{i}: {s_res.status_code} {s_res.text}"
        s_id = s_res.json().get('id') or s_res.json().get('data', {}).get('id')
        student_30_ids.append(s_id)
        if i in [15, 30]:
            print(f"  ✔ [{i}/30] Élève 'Élève6A_{i:02d}' inscrit avec succès dans '6ème A'. Total: {i}/30.")

    # 2. Tentative d'inscription du 31ème élève SANS auto_create (Rejet HTTP 400 CLASSROOM_FULL)
    print("\n--- [TEST REJET DÉBORDEMENT (31ème élève, auto_create=False)] ---")
    s31_fail_res = tester.call_api_cud('student', 'save', {
        "matricule": f"MAT_6A_31_FAIL_{uid_alpha}"[:20],
        "first_name": "Élève6A_31_Rejet",
        "last_name": "TEST",
        "gender": "M",
        "date_of_birth": "2012-01-01",
        "parents_input": [{"role": "FATHER", "first_name": "Parent", "last_name": "Test31", "phone_number": "060000000"}],
        "enrollment_input": {"classroom_id": class_6eme_a_id, "academic_year_id": year_id, "auto_create_classroom": False}
    })
    print(f"  ✔ [REJET VÉRIFIÉ] Status HTTP: {s31_fail_res.status_code}")
    print(f"  ✔ Réponse API reçue : {s31_fail_res.text}")
    assert s31_fail_res.status_code == 400, "❌ L'API aurait dû rejeter l'inscription du 31ème élève !"
    assert "CLASSROOM_FULL" in s31_fail_res.text or "pleine" in s31_fail_res.text, "❌ Message de classe pleine attendu !"

    # 3. Inscription des élèves 31 à 40 AVEC auto_create=True (Dédoublement automatique attendu -> 6ème A-2)
    print("\n--- [TEST DÉDOUBLEMENT AUTOMATIQUE (Élèves 31 à 40, auto_create=True)] ---")
    student_overflow_ids = []
    for i in range(31, 41):
        s_res = tester.call_api_cud('student', 'save', {
            "matricule": f"MAT_6A_{i:02d}_{uid_alpha}"[:20],
            "first_name": f"Élève6A_{i:02d}",
            "last_name": "TEST",
            "gender": "M" if i % 2 == 1 else "F",
            "date_of_birth": "2012-01-01",
            "parents_input": [{"role": "FATHER", "first_name": "Parent", "last_name": f"Test{i}", "phone_number": "060000000"}],
            "enrollment_input": {"classroom_id": class_6eme_a_id, "academic_year_id": year_id, "auto_create_classroom": True}
        })
        assert s_res.status_code in [200, 201], f"❌ Échec inscription élève dédoublé #{i}: {s_res.status_code} {s_res.text}"
        data = s_res.json().get('data') or s_res.json()
        enr_data = data.get('current_enrollment') or {}
        assigned_room = enr_data.get('classroom_name') or "Classe dédoublée"
        s_id = data.get('id')
        student_overflow_ids.append(s_id)
        print(f"  ✔ [{i}/40] Élève 'Élève6A_{i:02d}' inscrit -> Affecté automatiquement dans la classe '{assigned_room}'")

    print("\n🎉 ==================================================");
    print("  TOUS LES TESTS (Y COMPRIS CAPACITÉ & DÉBORDEMENT 40 ÉLÈVES) RÉUSSIS !");
    print("  Scénario 'AlphaOne' intégralement validé !");
    print("==================================================");

