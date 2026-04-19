import sqlite3
import secrets

DB = "Bellavita_Oven.db"

def google_login(name, email):
    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute("SELECT id FROM users WHERE email=?", (email,))
    row = cur.fetchone()

    if row:
        user_id = row[0]
    else:
        # auto register
        cur.execute("""
            INSERT INTO users (name, email, phone, password, email_verified, google_user)
            VALUES (?, ?, '', '', 1, 1)
        """, (name, email))
        user_id = cur.lastrowid

    con.commit()
    con.close()

    return user_id


from google.oauth2 import id_token
from google.auth.transport import requests
import os

GOOGLE_CLIENT_ID = "472328482832-9uqov89uvsgd1iektpicgc2e2non9cq7.apps.googleusercontent.com"

def verify_google_token(token):
    idinfo = id_token.verify_oauth2_token(
        token,
        requests.Request(),
        GOOGLE_CLIENT_ID
    )
    return {
        "name": idinfo["name"],
        "email": idinfo["email"]
    }
