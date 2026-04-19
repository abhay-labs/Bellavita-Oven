# engine/auth/register.py

import sqlite3
from engine.auth.auth_utils import hash_password
from engine.auth.otp import generate_otp, save_otp, verify_otp
from engine.auth.email_service import send_otp_email


DB = "Bellavita_Oven.db"


# ================= STEP 1: SEND OTP =================
def register_user(name, phone, email, dob, password):
    con = sqlite3.connect(DB)
    cur = con.cursor()

    # 🧹 cleanup stale pending
    cur.execute("DELETE FROM pending_users WHERE email=?", (email,))

    # 🔍 Check existing user
    cur.execute("SELECT id FROM users WHERE email=?", (email,))
    exists = cur.fetchone()

    cur.execute("SELECT email FROM pending_users WHERE email=?", (email,))
    pending = cur.fetchone()

    if exists or pending:
        con.close()
        return {"status": "error", "msg": "User already exists"}


    con.close()

    # 🔐 Generate & store OTP (NO DB INSERT YET)
    otp = generate_otp()
    save_otp(email, otp, "register")

    # 📧 Send OTP
    send_otp_email(email, otp, "register")

    # Temporarily store pending data (OTP verify ke baad insert hoga)
    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute("""
        INSERT OR REPLACE INTO pending_users 
        (name, phone, email, dob, password)
        VALUES (?,?,?,?,?)
    """, (
        name,
        phone,
        email,
        dob,
        hash_password(password)
    ))

    con.commit()
    con.close()

    return {"status": "otp_sent"}


# ================= STEP 2: VERIFY OTP & CREATE USER =================
def verify_register_otp(email, otp):
    # ❌ OTP invalid
    if not verify_otp(email, otp, "register"):
        return {"status": "error", "msg": "Invalid or expired OTP"}

    con = sqlite3.connect(DB)
    cur = con.cursor()

    # 🔍 Get pending user
    cur.execute(
        "SELECT name, phone, email, dob, password FROM pending_users WHERE email=?",
        (email,)
    )
    row = cur.fetchone()

    if not row:
        con.close()
        return {"status": "error", "msg": "Registration session expired"}

    name, phone, email, dob, hashed_password = row

    # 🔥 PHONE DUPLICATE CHECK
    cur.execute(
        "SELECT id FROM users WHERE phone=? AND phone IS NOT NULL",
        (phone,)
    )
    phone_exists = cur.fetchone()

    if phone_exists:
        phone = None   # ❗ duplicate phone ko NULL kar do


    # ✅ Insert final user
    cur.execute("""
        INSERT INTO users (name, phone, email, dob, password, email_verified)
        VALUES (?,?,?,?,?,1)
    """, (name, phone, email, dob, hashed_password))

    # 🧹 Cleanup
    cur.execute("DELETE FROM pending_users WHERE email=?", (email,))

    con.commit()
    con.close()

    return {"status": "success"}


# 🔁 RESEND REGISTER OTP
def resend_register_otp(email):
    from engine.auth.otp import generate_otp, save_otp
    from engine.auth.email_service import send_otp_email

    otp = generate_otp()

    # old OTP replace ho jayega
    save_otp(email, otp, "register")

    send_otp_email(email, otp, "register")

    return {"status": "otp_resent"}
