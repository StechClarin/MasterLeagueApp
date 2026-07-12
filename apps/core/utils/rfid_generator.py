from django.core.signing import Signer, BadSignature

class RFIDGenerator:
    """
    Gestionnaire pour les badges RFID/NFC (Option 3 - Sécurité Premium).
    Au lieu de générer une image, ce module s'occupe de lier l'UID physique de la carte Mifare/NFC 
    à l'étudiant et de générer un cryptogramme pour sécuriser la puce.
    """
    
    @classmethod
    def register_rfid_card(cls, user_payload: dict, rfid_uid: str) -> dict:
        """
        Associe un UID physique (ex: lu par le lecteur USB/NFC) à un payload utilisateur.
        Génère une clé de signature pour s'assurer que la carte n'est pas un clone basique.
        """
        signer = Signer(salt="eteyelo-rfid-auth")
        
        # Le cryptogramme liera l'UID matériel à l'identité
        secure_signature = signer.sign_object({
            "uid": rfid_uid,
            "payload": user_payload
        })
        
        return {
            "rfid_uid": rfid_uid,
            "crypto_signature": secure_signature,
            "status": "REGISTERED"
        }

    @classmethod
    def validate_rfid_scan(cls, rfid_uid: str, crypto_signature: str) -> dict:
        """
        Valide un scan RFID. Le lecteur doit fournir l'UID matériel et la signature.
        Lève ValueError si la carte est frauduleuse.
        """
        signer = Signer(salt="eteyelo-rfid-auth")
        try:
            data = signer.unsign_object(crypto_signature)
            if data.get("uid") != rfid_uid:
                raise ValueError("UID Mismatch: Clonage matériel détecté.")
            return data.get("payload")
        except BadSignature:
            raise ValueError("Signature RFID invalide ou falsifiée.")
