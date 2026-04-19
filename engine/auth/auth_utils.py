# engine/auth/auth_utils.py
import hashlib
import secrets

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{hashed}:{salt}"

def verify_password(password: str, stored: str) -> bool:

    # 🔥 Case: password hi nahi hai (deleted / google user / corrupt)
    if not stored or ":" not in stored:
        return False
    
    try:
        hashed, salt = stored.split(":")
        return hashed == hashlib.sha256((password + salt).encode()).hexdigest()
    except Exception:
        return False
    
