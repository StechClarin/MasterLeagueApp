# -*- coding: utf-8 -*-
"""Seed via l'API REST (comme Postman) : matières, personnels, affectations, évaluations.
Audite chaque réponse POST + vérifie en lecture."""
import json, sys, urllib.request, urllib.error

BASE = 'http://127.0.0.1:8000'
EST_ID = 'bea2f670-1fa5-483a-99b0-d3c5d507e8f3'          # Ethernanos
ACAD_YEAR = '3a7c62a7-6411-4948-9909-aa5d3151399d'       # 2026-2027

# Référentiel
LEVELS = {
    '3eme': 'ff1e0c93-e2fc-46bb-b3c4-6a14c06796d4',
    '4eme': '7b4be620-add7-479e-b8a0-7ee3b89883ac',
    '6eme': '89fba6d4-dca2-4293-bf06-81bc1e3d67f2',
    'second': '869c238e-8b95-4a71-a797-9caafafbb8b3',
}
CLASSES = {
    '3eme': '22504631-9b9c-4045-80e3-fd5d4448781c',
    '4eme': '9d28041a-8417-4eab-b2a0-fba0b2da3ad4',
    '6eme': '43335f04-eec0-449a-a50c-e1cfed0defa0',
    'LGL1': 'b4121688-1154-456a-93dd-3f494931d459',
    'LIG1': 'd10ca38f-97e1-44d7-83fb-794bfa4059ec',
    'Second C': '5ff34efc-d056-45a4-95ed-3db11c1cae55',
    'second D': 'e998b007-fa12-4948-8d1c-fd37fda46445',
}
EVAL_TYPES = {'devoir': 'cb318cd5-2b28-437b-a32f-4662dc29aebf', 'examen': '92136d2e-0f7b-4e34-b948-b2e950c2710f'}
PERIODS = {'t1': '143748cf-943e-44fa-aabe-c60cf8a2db1e', 't2': '5271a5a6-710d-4c14-9d95-837009c5fbe4'}
ROLE_ENSEIGNANT = '3dde3616-a2f3-4130-8735-4bca2a20aecc'
ROLE_SURVEILLANT = '5fc45ee6-ad9f-4093-bbb8-efab34f3c743'
CONTRAT_CDI = 'ebec1390-b940-439d-80ff-2e939e9d03d5'
CONTRAT_CDD = '06964483-ef42-44ed-bdae-497faf82e63a'
SALLE1 = 'f78fa1df-fbbb-496a-b89b-832cf7297e61'
SALLE2 = '9219194e-8f70-464e-a6f6-9727c1310b0d'

results = {'subject': [], 'personnel': [], 'assignment': [], 'evaluation': []}

def login():
    req = urllib.request.Request(BASE + '/api/auth/login/',
        data=json.dumps({'username': 'ethernanos', 'password': 'admin1234'}).encode(),
        headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())['access']

def post_json(token, endpoint, payload):
    req = urllib.request.Request(BASE + f'/api/{endpoint}/save/',
        data=json.dumps(payload).encode(),
        headers={'Authorization': 'Bearer ' + token, 'X-Establishment-ID': EST_ID,
                 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as r:
            res = json.loads(r.read())
        return {'ok': True, 'status': 'success', 'data': res.get('data'), 'message': res.get('message')}
    except urllib.error.HTTPError as e:
        return {'ok': False, 'status': e.code, 'error': e.read().decode()[:600]}

def get_json(token, endpoint):
    req = urllib.request.Request(BASE + f'/api/{endpoint}/',
        headers={'Authorization': 'Bearer ' + token, 'X-Establishment-ID': EST_ID})
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        return {'error': e.read().decode()[:600], 'status': e.code}

def audit(label, res, detail=''):
    if res.get('ok'):
        results.setdefault(label, []).append(res)
        print(f'  OK  {label:<22} {detail}')
    else:
        print(f'  ERR {label:<22} status={res.get("status")} {res.get("error","")}')

# ============================ 1. MATIÈRES ============================
def create_subjects(token):
    print('=== MATIÈRES ===')
    existing = set(get_subjects(token).keys())
    subjects = [
        # (name, code, [(level, coeff, quota), ...])
        ('Mathématiques', 'MATH', [('3eme',3,5), ('4eme',3,5), ('6eme',3,5), ('second',4,6)]),
        ('SVT', 'SVT', [('3eme',2,2), ('4eme',2,2), ('6eme',2,2), ('second',2,2)]),
        ('Français', 'FRAN', [('3eme',3,5), ('4eme',3,5), ('6eme',3,5), ('second',3,5)]),
        ('Physique-Chimie', 'PC', [('3eme',2,3), ('4eme',2,3), ('6eme',2,3), ('second',3,4)]),
        ('Anglais', 'ANG', [('3eme',3,4), ('4eme',3,4), ('6eme',3,4), ('second',3,4)]),
        ('Histoire-Géo', 'HG', [('3eme',2,3), ('4eme',2,3), ('6eme',2,3), ('second',2,3)]),
        ('EPS', 'EPS', [('3eme',1,2), ('4eme',1,2), ('6eme',1,2), ('second',1,2)]),
        ('Philosophie', 'PHILO', [('second',2,2)]),
    ]
    for name, code, lvls in subjects:
        if name in existing:
            print(f'  SKIP matière {name} (existe déjà)')
            continue
        payload = {
            'name': name,
            'code': code,
            'level_subjects': [
                {'level': LEVELS[l], 'option': None, 'group': None,
                 'coefficient': c, 'hourly_quota': q, 'credits': 0, 'is_optional': False}
                for l, c, q in lvls
            ]
        }
        audit('matière', post_json(token, 'subject', payload), f'{name} ({code})')

# ============================ 2. PERSONNELS ============================
def get_personnel_emails(token):
    data = graphql(token, '{ personnels(pageSize: 100) { items { emailPro user { email } } } }')
    out = set()
    for it in data.get('personnels', {}).get('items', []):
        if it.get('emailPro'): out.add(it['emailPro'])
        if it.get('user', {}).get('email'): out.add(it['user']['email'])
    return out

def create_personnel(token):
    print('=== PERSONNELS (10 enseignants) ===')
    existing = get_personnel_emails(token)
    teachers = [
        ('Jean', 'Mbarga', 'M', 'CDI'), ('Marie', 'Etoundi', 'F', 'CDD'),
        ('Pierre', 'Kamga', 'M', 'CDI'), ('Amina', 'Njoya', 'F', 'CDD'),
        ('Samuel', 'Fouda', 'M', 'CDI'), ('Carine', 'Essomba', 'F', 'CDD'),
        ('Paul', 'Owona', 'M', 'CDI'), ('Esther', 'Nkoulou', 'F', 'CDD'),
        ('Marc', 'Tchoupo', 'M', 'CDI'), ('Clarisse', 'Atangana', 'F', 'CDD'),
    ]
    ids = []
    for i, (first, last, gender, contrat) in enumerate(teachers):
        email = f"{first.lower()}.{last.lower().replace(' ', '')}@ethernanos.com"
        if email in existing:
            print(f'  SKIP personnel {first} {last} (existe déjà)')
            continue
        payload = {
            'matricule': f'PERS-2026-{i+1:04d}',
            'job_title': 'Enseignant',
            'roles': [ROLE_ENSEIGNANT],
            'contract_type': CONTRAT_CDI if contrat == 'CDI' else CONTRAT_CDD,
            'establishment': EST_ID,
            'address': f'Quartier {["Bonapriso","Akwa","Bastos","Mvan","Bali","Makepe","Nlongkak","Deido","Ndogbong","Elig-Edzoa"][i]}',
            'date_hired': '2026-09-01',
            'gender': gender,
            'user': {'first_name': first, 'last_name': last, 'email': email},
            'email_pro': email,
            'phone_number': f'+23769010{1000 + i}',
        }
        res = post_json(token, 'personnel', payload)
        audit('personnel', res, f'{first} {last}')
        if res.get('ok') and res.get('data'):
            ids.append(res['data']['id'])
    return ids

# ============================ LECTURE (GraphQL) ============================
def graphql(token, query, variables=None):
    req = urllib.request.Request(BASE + '/graphql',
        data=json.dumps({'query': query, 'variables': variables or {}}).encode(),
        headers={'Authorization': 'Bearer ' + token, 'X-Establishment-ID': EST_ID,
                 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as r:
            res = json.loads(r.read())
        if res.get('errors'):
            return {'error': res['errors']}
        return res.get('data', {})
    except urllib.error.HTTPError as e:
        return {'error': e.read().decode()[:400], 'status': e.code}

def get_subjects(token):
    data = graphql(token, '{ subjects(pageSize: 100) { items { id name code } } }')
    return {it['name']: it['id'] for it in data.get('subjects', {}).get('items', [])}

def audit_reads(token):
    print('\n=== AUDIT LECTURE (GraphQL) ===')
    d = graphql(token, '{ subjects(pageSize: 100) { totalCount items { name code } } }')
    print(' Matières :', d.get('subjects', {}).get('totalCount'),
          [f"{i['name']}({i['code']})" for i in d.get('subjects', {}).get('items', [])])
    d = graphql(token, '{ personnels(pageSize: 100) { totalCount } }')
    print(' Personnels :', d.get('personnels', {}).get('totalCount'))
    d = graphql(token, '{ teachingAssignments(pageSize: 200) { totalCount } }')
    print(' Affectations :', d.get('teachingAssignments', {}).get('totalCount'))
    d = graphql(token, '{ evaluationSessions(pageSize: 100) { totalCount items { id title evaluationType { name } } } }')
    print(' Sessions évaluation :', d.get('evaluationSessions', {}).get('totalCount'),
          [(i.get('title'), i.get('evaluationType', {}).get('name')) for i in d.get('evaluationSessions', {}).get('items', [])])

# ============================ 3. AFFECTATIONS ============================
def create_assignments(token, teacher_ids, subj):
    print('=== AFFECTATIONS PROF / ACADÉMIQUE ===')
    # Idempotence : récupérer les affectations existantes (personnel, classroom, subject)
    existing = set()
    d = graphql(token, '{ teachingAssignments(pageSize: 500) { items { personnel { id } classroom { id } subject { id } } } }')
    for it in d.get('teachingAssignments', {}).get('items', []):
        p, c, s = it.get('personnel', {}).get('id'), it.get('classroom', {}).get('id'), it.get('subject', {}).get('id')
        if p and c and s:
            existing.add((p, c, s))
    # Répartition : collège (3eme/4eme/6eme) + lycée (Second C / second D)
    college = ['3eme', '4eme', '6eme']
    lycee = ['Second C', 'second D']
    plan = [
        (0, 'Mathématiques', college), (1, 'Français', college), (2, 'Anglais', college),
        (3, 'Histoire-Géo', college), (4, 'SVT', college), (5, 'Physique-Chimie', college),
        (6, 'EPS', college), (7, 'Mathématiques', lycee), (8, 'Philosophie', lycee),
        (9, 'Français', lycee), (9, 'Anglais', lycee),
    ]
    for t_idx, subject_name, classes in plan:
        for cls in classes:
            key = (teacher_ids[t_idx], CLASSES[cls], subj[subject_name])
            if key in existing:
                print(f'  SKIP affectation {subject_name} -> {cls} (existe)')
                continue
            payload = {
                'personnel_id': teacher_ids[t_idx],
                'classroom_id': CLASSES[cls],
                'subject_id': subj[subject_name],
                'academic_year_id': ACAD_YEAR,
                'start_date': '2026-09-07',
                'end_date': '2027-07-15',
                'hours_scheduled': 4,
            }
            audit('affectation', post_json(token, 'teaching_assignment', payload),
                  f'{subject_name} -> {cls}')

# ============================ 4. ÉVALUATIONS ============================
def create_evaluations(token, subj, teacher_ids):
    print('=== ÉVALUATIONS (Devoir + Examen) ===')
    d = graphql(token, '{ evaluationSessions(pageSize: 100) { items { title } } }')
    existing_titles = {it['title'] for it in d.get('evaluationSessions', {}).get('items', [])}
    classe6 = CLASSES['6eme']
    def make_session(title, etype, date, duration, subject_names):
        subjects = []
        room_by_subject = {}
        for i, sname in enumerate(subject_names):
            room = SALLE1 if i % 2 == 0 else SALLE2
            room_by_subject[sname] = room
            subjects.append({
                'id': None, 'subject': subj[sname], 'classrooms': [classe6],
                'max_score': 20,
                'plannings': [{
                    'id': None, 'date': date, 'start_time': '08:00',
                    'duration_minutes': duration, 'classrooms_ids': [classe6],
                    'rooms_ids': [room],
                }],
            })
        # Une seule surveillance par (date, salle) — contrainte unique (session, date, room)
        supervisions = []
        used_rooms = set()
        for i, sname in enumerate(subject_names):
            room = room_by_subject[sname]
            if room in used_rooms:
                continue
            used_rooms.add(room)
            supervisions.append({
                'id': None, 'date': date, 'room': room,
                'supervisors': [teacher_ids[i % 10]],
            })
        return {
            'title': title, 'scope': 'CLASS',
            'academic_period': PERIODS['t1'],
            'evaluation_type': EVAL_TYPES[etype],
            'subjects': subjects, 'supervisions': supervisions,
        }
    devoir = make_session('Devoir 1 - Trimestre 1', 'devoir', '2026-10-06', 60,
                          ['Mathématiques', 'Français', 'Anglais', 'SVT'])
    if devoir['title'] in existing_titles:
        print(f"  SKIP évaluation {devoir['title']} (existe)")
    else:
        audit('évaluation', post_json(token, 'evaluation_session', devoir), 'Devoir 1 - Trimestre 1 (6eme)')
    examen = make_session('Examen - Trimestre 1', 'examen', '2026-12-14', 120,
                          ['Mathématiques', 'Français', 'Anglais', 'SVT', 'Physique-Chimie', 'Histoire-Géo'])
    if examen['title'] in existing_titles:
        print(f"  SKIP évaluation {examen['title']} (existe)")
    else:
        audit('évaluation', post_json(token, 'evaluation_session', examen), 'Examen - Trimestre 1 (6eme)')

# ============================ MAIN ============================
def get_teacher_ids(token):
    d = graphql(token, '{ personnels(pageSize: 100) { items { id } } }')
    return [it['id'] for it in d.get('personnels', {}).get('items', [])]

def main():
    token = login()
    print('Login OK')
    create_subjects(token)
    subj = get_subjects(token)
    print('Matières en base (GET) :', list(subj.keys()))
    teacher_ids = create_personnel(token)
    if len(teacher_ids) < 10:
        teacher_ids = get_teacher_ids(token)
    print(f'Enseignants disponibles : {len(teacher_ids)}')
    create_assignments(token, teacher_ids, subj)
    create_evaluations(token, subj, teacher_ids)
    audit_reads(token)
    print('\n=== TERMINÉ ===')

if __name__ == '__main__':
    sys.exit(main())


