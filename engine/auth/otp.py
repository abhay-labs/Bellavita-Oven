# engine/auth/otp.py

import random
import sqlite3
import datetime

DB = "Bellavita_Oven.db"


def generate_otp():
    return str(random.randint(100000, 999999))


def save_otp(email, otp, purpose):
    con = sqlite3.connect(DB)
    cur = con.cursor()

    # 🔁 Purana OTP hata do (same email + purpose)
    cur.execute(
        "DELETE FROM otp_verification WHERE email=? AND purpose=?",
        (email, purpose)
    )

    expiry = (datetime.datetime.now() + datetime.timedelta(minutes=5)).isoformat()

    cur.execute(
        """
        INSERT INTO otp_verification (email, otp, purpose, expires_at)
        VALUES (?,?,?,?)
        """,
        (email, otp, purpose, expiry)
    )

    con.commit()
    con.close()


def verify_otp(email, otp, purpose):
    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute(
        """
        SELECT expires_at FROM otp_verification
        WHERE email=? AND otp=? AND purpose=?
        """,
        (email, otp, purpose)
    )

    row = cur.fetchone()

    # ❌ OTP not found
    if not row:
        con.close()
        return False

    expires_at = datetime.datetime.fromisoformat(row[0])

    # ❌ OTP expired
    if datetime.datetime.now() > expires_at:
        cur.execute(
            "DELETE FROM otp_verification WHERE email=? AND purpose=?",
            (email, purpose)
        )
        con.commit()
        con.close()
        return False

    # ✅ OTP valid → delete after use
    cur.execute(
        "DELETE FROM otp_verification WHERE email=? AND purpose=?",
        (email, purpose)
    )

    con.commit()
    con.close()
    return True
