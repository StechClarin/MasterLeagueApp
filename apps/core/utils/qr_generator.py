import io
import qrcode
from PIL import Image
from django.core.signing import Signer, BadSignature
from django.core.files.uploadedfile import InMemoryUploadedFile

class QRCodeGenerator:
    """
    Générateur de QR Code pour le Badging et le Login (Option 2 - Magic Link).
    Encapsule un token signé (Badge_ID) dans une URL.
    """
    
    # URL de base du portail frontal (à ajuster selon la configuration du projet)
    BASE_URL = "https://eteyelo.ethernanos.space/auth/qr"
    
    @classmethod
    def generate_secure_token(cls, payload: dict) -> str:
        """
        Génère un token signé contenant l'identité de l'utilisateur.
        Ex: payload = {"id": "API-32119e", "role": "STUDENT", "est_id": "..."}
        """
        signer = Signer(salt="eteyelo-badge-auth")
        return signer.sign_object(payload)
        
    @classmethod
    def decode_secure_token(cls, token: str) -> dict:
        """
        Décrypte et valide le token depuis le QR Code scanné.
        Lève ValueError si le token est invalide ou corrompu.
        """
        signer = Signer(salt="eteyelo-badge-auth")
        try:
            return signer.unsign_object(token)
        except BadSignature:
            raise ValueError("Token de badge invalide ou falsifié.")

    @classmethod
    def generate_auth_qr(cls, payload: dict, base_url: str = None) -> InMemoryUploadedFile:
        """
        1. Crée le token sécurisé.
        2. Construit le Magic Link (URL).
        3. Dessine le QR Code.
        4. Retourne un InMemoryUploadedFile prêt à être sauvegardé en base ou renvoyé à l'UI.
        """
        if base_url is None:
            base_url = cls.BASE_URL
            
        token = cls.generate_secure_token(payload)
        magic_link = f"{base_url}?b={token}"
        
        # Génération du QR Code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(magic_link)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convertir l'image PIL en fichier mémoire Django
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Nom de fichier dynamique
        user_id = payload.get('id', 'unknown')
        filename = f"qr_badge_{user_id}.png"
        
        return InMemoryUploadedFile(
            file=buffer,
            field_name=None,
            name=filename,
            content_type='image/png',
            size=buffer.getbuffer().nbytes,
            charset=None
        )
