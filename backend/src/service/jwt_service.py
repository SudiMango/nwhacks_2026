import os, hmac, hashlib, base64, json
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

"""

JWT singleton service

"""
class JwtService:
    _instance = None

    # Singleton logic
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(JwtService, cls).__new__(cls)
            cls._instance.SECRET_KEY = os.getenv("JWT_SECRET")
            cls._instance.ALGORITHM = "HS256"
            cls._instance.EXPIRE_MINUTES = 60 * 24 * 7  # one week
        return cls._instance
    
    # Create JWT token given a subject
    def create_token(self, subject: str) -> str:
        payload = {
            "sub": subject,
            "exp": int(
                (datetime.now() + timedelta(minutes=self.EXPIRE_MINUTES)).timestamp()
            ),
        }
        header = {"alg": self.ALGORITHM, "typ": "JWT"}
        segments = []
        for obj in (header, payload):
            segments.append(self._b64url(json.dumps(obj, separators=(",", ":")).encode()))
        signing_input = ".".join(segments).encode()
        signature = self._b64url(
            hmac.new(self.SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
        )
        return ".".join((*segments, signature))
    
    # Check if JWT token is valid
    def is_token_valid(self, token: str) -> bool:
        try:
            header_b64, payload_b64, signature_b64 = token.split(".")

            signing_input = f"{header_b64}.{payload_b64}".encode()
            signature = base64.urlsafe_b64decode(self._pad_b64(signature_b64))

            expected_signature = hmac.new(
                self.SECRET_KEY.encode(),
                signing_input,
                hashlib.sha256
            ).digest()

            if not hmac.compare_digest(signature, expected_signature):
                return False

            payload_json = base64.urlsafe_b64decode(self._pad_b64(payload_b64)).decode()
            payload = json.loads(payload_json)

            if "exp" in payload and datetime.now().timestamp() > payload["exp"]:
                return False

            return True
        except Exception:
            return False

    """
    
    Private methods
    
    """

    def _b64url(self, data: bytes) -> str:
        return base64.urlsafe_b64encode(data).rstrip(b"=").decode()
    
    # Remove "=" padding from b64
    def _pad_b64(self, data: str) -> str:
        return data + "=" * (-len(data) % 4)