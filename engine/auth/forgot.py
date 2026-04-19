# engine/auth/forgot.py
import sqlite3
from engine.auth.otp import generate_otp, save_otp, verify_otp
from engine.auth.auth_utils import hash_password

DB = "Bellavita_Oven.db"

def send_forgot_otp(email):

    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute("SELECT email FROM users WHERE email=?", (email,))
    user = cur.fetchone()

    con.close()

    if not user:
        return {"status": "error", "msg": "Email not registered"}

    otp = generate_otp()
    save_otp(email, otp, "forgot")

    from engine.auth.email_service import send_otp_email
    send_otp_email(email, otp, "forgot")

    return {"status": "otp_sent"}

def reset_password(email, otp, new_password):

    if not verify_otp(email, otp, "forgot"):
        return {"status": "error", "msg": "Invalid OTP"}

    hashed = hash_password(new_password)

    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute(
        "UPDATE users SET password=? WHERE email=?",
        (hashed, email)
    )

    con.commit()
    con.close()

    return {"status": "success"}
