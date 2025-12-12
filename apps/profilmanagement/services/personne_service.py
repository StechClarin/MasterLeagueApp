from apps.core.services.BaseService import BaseService
from ..models import Personne, Contact

class PersonneService(BaseService):
    model = Personne

    def save_process(self, data, instance=None):
        # 1. Extraction des contacts (Nested)
        contacts_data = data.pop('contacts', [])

        # 2. Sauvegarde du Parent (Personne)
        personne, created = super().save_process(data, instance)

        # 3. Gestion des Enfants (Contacts)
        if contacts_data:
            # Pour simplifier l'exemple, on supprime les anciens contacts en cas d'update
            # et on recrée tout. (Stratégie "Replace All")
            if not created:
                personne.contacts.all().delete()
            
            for contact_data in contacts_data:
                contact_data['personne'] = personne
                Contact.objects.create(**contact_data)
        
        return personne, created
