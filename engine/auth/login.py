# engine/auth/login.py
import sqlite3
from engine.auth.auth_utils import verify_password
from engine.auth.session import create_session

DB = "Bellavita_Oven.db"

def login_user(email, password):
    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute(
        "SELECT id, password, email_verified FROM users WHERE email=?",
        (email,)
    )
    row = cur.fetchone()
    con.close()

     # 🔥 USER DOES NOT EXIST
    if not row:
        return {
            "status": "error",
            "msg": "User does not exist. Please register first."
        }

    uid, stored_pass, verified = row

    # 🔥 PASSWORD INVALID / CORRUPT / GOOGLE USER
    if not verify_password(password, stored_pass):
        return {
            "status": "error",
            "msg": "Invalid credentials or account removed. Please register again."
        }

    token = create_session(email)

    return {
        "status": "success",
        "token": token
    }
