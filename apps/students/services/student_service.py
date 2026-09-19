from django.core.exceptions import ValidationError
from apps.core.services.BaseService import BaseService
from ..models import Student, StudentHealth, Guardian, Enrollment

class StudentService(BaseService):
    model = Student

    import_field_labels = {
        'first_name': 'Prénom',
        'last_name': 'Nom',
        'gender': 'Sexe (M/F)',
        'date_of_birth': 'Date de naissance (AAAA-MM-JJ)',
        'place_of_birth': 'Lieu de naissance',
        'address': 'Adresse',
        'rfid_uid': 'Badge / Code RFID',
        'classroom': 'Classe (Code ou Nom)',
        'academic_year': 'Année Académique',
        'is_repeater': 'Redoublant (Oui/Non)',
        'blood_group': 'Groupe Sanguin (ex: A+)',
        'allergies': 'Allergies',
        'medical_conditions': 'Conditions Médicales',
        'emergency_contact_name': 'Nom Contact Urgence',
        'emergency_contact_phone': 'Tél Contact Urgence',
        'father_first_name': 'Prénom Père',
        'father_last_name': 'Nom Père',
        'father_phone_number': 'Téléphone Père',
        'father_profession': 'Profession Père',
        'father_email': 'Email Père',
        'mother_first_name': 'Prénom Mère',
        'mother_last_name': 'Nom Mère',
        'mother_phone_number': 'Téléphone Mère',
        'mother_profession': 'Profession Mère',
        'mother_email': 'Email Mère',
        'tutor_first_name': 'Prénom Tuteur',
        'tutor_last_name': 'Nom Tuteur',
        'tutor_phone_number': 'Téléphone Tuteur',
        'tutor_profession': 'Profession Tuteur',
        'tutor_email': 'Email Tuteur',
    }

    def before_validate(self, data, instance=None):
        import json
        # Handle JSON strings from FormData (Angular Refactor)
        json_fields = ['health_input', 'parents_input', 'enrollment_input']
        
        # Determine if data supports item assignment (dict or mutable)
        if hasattr(data, 'dict'):
             data = data.dict()
        elif hasattr(data, 'copy'):
             data = data.copy()

        for field in json_fields:
            if field in data and isinstance(data[field], str):
                try:
                    data[field] = json.loads(data[field])
                except json.JSONDecodeError:
                    pass

        # Parse flat Excel import columns into nested structures if not already provided
        # 1. Santé
        if not data.get('health_input'):
            health_dict = {}
            for h_field in ['blood_group', 'allergies', 'medical_conditions', 'emergency_contact_name', 'emergency_contact_phone']:
                if h_field in data and data[h_field]:
                    health_dict[h_field] = data.pop(h_field)
                elif h_field in data:
                    data.pop(h_field)
            if health_dict:
                data['health_input'] = health_dict

        # 2. Scolarité / Inscription
        if not data.get('enrollment_input'):
            enrollment_dict = {}
            raw_class = data.pop('classroom', None)
            raw_year = data.pop('academic_year', None)
            raw_repeater = data.pop('is_repeater', None)

            if raw_class:
                from apps.structure.models import ClassRoom
                cls = ClassRoom.objects.filter(name__iexact=str(raw_class).strip()).first()
                if not cls:
                    cls = ClassRoom.objects.filter(code__iexact=str(raw_class).strip()).first()
                if cls:
                    enrollment_dict['classroom_id'] = cls.id

            if raw_year:
                from apps.structure.models import AcademicYear
                ay = AcademicYear.objects.filter(name__iexact=str(raw_year).strip()).first()
                if ay:
                    enrollment_dict['academic_year_id'] = ay.id

            if raw_repeater is not None:
                rep_val = str(raw_repeater).strip().lower()
                enrollment_dict['is_repeater'] = rep_val in ['oui', 'yes', 'true', '1']

            if enrollment_dict:
                data['enrollment_input'] = enrollment_dict

        # 3. Famille / Parents
        if not data.get('parents_input'):
            parents_list = []
            
            # Père
            f_fname = data.pop('father_first_name', None)
            f_lname = data.pop('father_last_name', None)
            f_phone = data.pop('father_phone_number', None)
            f_prof = data.pop('father_profession', None)
            f_email = data.pop('father_email', None)
            if f_phone or f_fname or f_lname:
                parents_list.append({
                    'role': 'FATHER',
                    'first_name': str(f_fname or '').strip(),
                    'last_name': str(f_lname or '').strip(),
                    'phone_number': str(f_phone or '').strip(),
                    'profession': str(f_prof or '').strip(),
                    'email': str(f_email or '').strip(),
                    'is_legal_guardian': True
                })

            # Mère
            m_fname = data.pop('mother_first_name', None)
            m_lname = data.pop('mother_last_name', None)
            m_phone = data.pop('mother_phone_number', None)
            m_prof = data.pop('mother_profession', None)
            m_email = data.pop('mother_email', None)
            if m_phone or m_fname or m_lname:
                parents_list.append({
                    'role': 'MOTHER',
                    'first_name': str(m_fname or '').strip(),
                    'last_name': str(m_lname or '').strip(),
                    'phone_number': str(m_phone or '').strip(),
                    'profession': str(m_prof or '').strip(),
                    'email': str(m_email or '').strip(),
                    'is_legal_guardian': False
                })

            # Tuteur
            t_fname = data.pop('tutor_first_name', None)
            t_lname = data.pop('tutor_last_name', None)
            t_phone = data.pop('tutor_phone_number', None)
            t_prof = data.pop('tutor_profession', None)
            t_email = data.pop('tutor_email', None)
            if t_phone or t_fname or t_lname:
                parents_list.append({
                    'role': 'TUTOR',
                    'first_name': str(t_fname or '').strip(),
                    'last_name': str(t_lname or '').strip(),
                    'phone_number': str(t_phone or '').strip(),
                    'profession': str(t_prof or '').strip(),
                    'email': str(t_email or '').strip(),
                    'is_legal_guardian': True
                })

            if parents_list:
                data['parents_input'] = parents_list
        
        data = super().before_validate(data, instance)
        if not data.get('matricule') and not instance:
            data['matricule'] = self._generate_matricule(data.get('establishment') or data.get('establishment_id'))
        
        # Clean rfid_uid: empty string -> None
        rfid = data.get('rfid_uid')
        if 'rfid_uid' in data and (rfid is None or (isinstance(rfid, str) and not rfid.strip())):
            data['rfid_uid'] = None

        return data

    def before_save(self, data, instance=None):
        data = super().before_save(data, instance)
        
        # Extraction des données relationnelles temporaires pour after_save
        self._temp_related_data = {
            'health_data': data.pop('health_input', None),
            'parents_data': data.pop('parents_input', []),
            'enrollment_data': data.pop('enrollment_input', None)
        }

        # Conversion rfid_uid vide en None
        rfid = data.get('rfid_uid')
        if 'rfid_uid' in data and (rfid is None or (isinstance(rfid, str) and not rfid.strip())):
            data['rfid_uid'] = None

        return data

    def _generate_matricule(self, establishment_id=None):
        from datetime import date
        year_suffix = date.today().strftime('%y')
        
        est_code = "ET"
        establishment = None
        if establishment_id:
            from apps.core.models.establishment import Establishment
            establishment = Establishment.objects.filter(id=establishment_id).first()
            if establishment and establishment.name:
                est_code = establishment.name[:2].upper()
            
        pattern = f"{year_suffix}-{est_code}-"
        
        last_student = self.model.all_objects.filter(
            matricule__startswith=pattern,
            establishment=establishment
        ).order_by('-matricule').first()
        
        seq = 1
        if last_student and last_student.matricule:
            try:
                parts = last_student.matricule.split('-')
                if len(parts) >= 3:
                     seq = int(parts[2]) + 1
            except ValueError:
                pass
        
        return f"{year_suffix}-{est_code}-{seq:04d}"

    def after_save(self, instance, created):
        """
        Gère les relations après la sauvegarde de l'étudiant.
        Les données relationnelles ont été validées au préalable par le Serializer.
        """
        related_data = getattr(self, '_temp_related_data', {})
        health_data = related_data.get('health_data')
        parents_data = related_data.get('parents_data', [])
        enrollment_data = related_data.get('enrollment_data')
        student = instance

        from django.db.transaction import atomic

        # 1. Santé
        if health_data:
            with atomic(): # type: ignore
                try:
                    StudentHealth.objects.update_or_create(
                        student=student,
                        defaults={
                            'establishment': student.establishment,
                            **health_data
                        }
                    )
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).error(f"Failed to save Health data: {e}")

        # 2. Inscription
        if enrollment_data:
            with atomic(): # type: ignore
                try:
                    # Récupération sécurisée des instances ou IDs
                    classroom_id = enrollment_data.get('classroom_id')
                    academic_year_id = enrollment_data.get('academic_year_id')
                    
                    # DRF PrimaryKeyRelatedField renvoie l'objet, on extrait l'ID si c'est le cas
                    if hasattr(classroom_id, 'id'): classroom_id = classroom_id.id
                    if hasattr(academic_year_id, 'id'): academic_year_id = academic_year_id.id
        
                    Enrollment.objects.update_or_create(
                        student=student,
                        academic_year_id=academic_year_id,
                        defaults={
                            'classroom_id': classroom_id,
                            'status': enrollment_data.get('status', 'PENDING'),
                            'establishment': student.establishment
                        }
                    )
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).error(f"Failed to save Enrollment data: {e}")

        # 3. Parents / Tuteurs
        if parents_data:
            current_guardians = list(student.guardians.all()) if not created else []
            
            for p_data in parents_data:
                phone = p_data.get('phone_number')
                if not phone: continue
                
                guardian, created_guardian = Guardian.objects.get_or_create(
                    phone_number=phone,
                    defaults={
                        'establishment': student.establishment,
                        'first_name': p_data.get('first_name', ''),
                        'last_name': p_data.get('last_name', ''),
                        'profession': p_data.get('profession', ''),
                        'role': p_data.get('role', 'TUTOR'),
                        'is_legal_guardian': p_data.get('is_legal_guardian', False)
                    }
                )
                
                if not created_guardian:
                    guardian.first_name = p_data.get('first_name', guardian.first_name)
                    guardian.last_name = p_data.get('last_name', guardian.last_name)
                    guardian.profession = p_data.get('profession', guardian.profession)
                    guardian.role = p_data.get('role', guardian.role)
                    guardian.is_legal_guardian = p_data.get('is_legal_guardian', guardian.is_legal_guardian)
                    guardian.save()
                
                if guardian not in current_guardians:
                    student.guardians.add(guardian)
        
        # 4. Synchronisation Photo de profil
        if instance.photo:
            try:
                with atomic(): # type: ignore
                    from django.contrib.contenttypes.models import ContentType
                    from apps.documents.models.document import Document
                    
                    # Vérifier si un document existe déjà pour cette photo
                    doc = Document.objects.filter(
                        document_type='PROFILE_PHOTO',
                        object_id=instance.id,
                        content_type=ContentType.objects.get_for_model(instance.__class__)
                    ).first()
                    
                    if not doc:
                        doc = Document(
                            title=f"Photo de profil - {instance.matricule}",
                            document_type='PROFILE_PHOTO',
                            owner=instance.created_by_user,
                            establishment=instance.establishment,
                            content_type=ContentType.objects.get_for_model(instance.__class__),
                            object_id=instance.id,
                            file=instance.photo
                        )
                        doc.file.name = instance.photo.name
                        doc.save()
                    else:
                        doc.file = instance.photo
                        doc.file.name = instance.photo.name
                        doc.save(update_fields=['file'])
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Error saving profile photo document: {e}") 

        # Nettoyage de la mémoire temporaire
        self._temp_related_data = {}
