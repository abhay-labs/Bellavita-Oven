

import uuid
import sqlite3

def create_session(email):
    token = str(uuid.uuid4())
    con = sqlite3.connect("Bellavita_Oven.db")
    cur = con.cursor()
    cur.execute(
        "INSERT INTO sessions (token, email) VALUES (?, ?)",
        (token, email)
    )
    con.commit()
    con.close()
    return token


def validate_session(token):
    con = sqlite3.connect("Bellavita_Oven.db")
    cur = con.cursor()

    cur.execute(
        "SELECT email FROM sessions WHERE token = ?",
        (token,)
    )

    row = cur.fetchone()
    con.close()

    return row[0] if row else None

def get_user_by_session(token):
    con = sqlite3.connect("Bellavita_Oven.db")
    cur = con.cursor()
    cur.execute("""
        SELECT users.id, users.name, users.email, users.phone, users.dob
        FROM sessions
        JOIN users ON users.email = sessions.email
        WHERE sessions.token=?
    """, (token,))
    row = cur.fetchone()
    con.close()
    return row


def delete_session(token):
    con = sqlite3.connect("Bellavita_Oven.db")
    cur = con.cursor()

    cur.execute(
        "DELETE FROM sessions WHERE token = ?",
        (token,)
    )

    con.commit()
    con.close()
