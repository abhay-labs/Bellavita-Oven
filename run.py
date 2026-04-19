import uuid

from flask import Flask, request, jsonify
from engine.auth.otp import generate_otp, save_otp, verify_otp
from flask_cors import CORS

import sqlite3
from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

from cart.cart_api import cart_bp



app = Flask(__name__)
CORS(app)

app.register_blueprint(cart_bp)

DB = "Bellavita_Oven.db"

# temporary users before OTP verification
pending_users = {}

# ================= REGISTER =================

@app.route("/register", methods=["POST"])
def register():

    data = request.json

    name = data.get("name")
    email = data.get("email").strip().lower()
    phone = data.get("phone")
    dob = data.get("dob")
    password = data.get("password")

    # 🔐 hash password
    hashed_password = generate_password_hash(password)

    con = sqlite3.connect(DB)
    cur = con.cursor()

    # 🔍 Check email
    cur.execute("SELECT id FROM users WHERE email=?", (email,))
    if cur.fetchone():
        con.close()
        return jsonify({
            "status": "error",
            "msg": "This email already exists"
        })

    # 🔍 Check phone
    cur.execute("SELECT id FROM users WHERE phone=?", (phone,))
    if cur.fetchone():
        con.close()
        return jsonify({
            "status": "error",
            "msg": "This phone number already exists"
        })

    con.close()

    # generate OTP
    otp = generate_otp()
    save_otp(email, otp, "register")

    # temporarily store user
    pending_users[email] = {
        "name": name,
        "phone": phone,
        "dob": dob,
        "password": hashed_password
    }

    print("OTP for", email, ":", otp)

    return jsonify({
        "status": "success",
        "message": "OTP sent"
    })


# ================= LOGIN =================

@app.route("/login", methods=["POST"])
def login():

    data = request.json
    email = data.get("email").strip().lower()
    password = data.get("password")

    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute(
        "SELECT password FROM users WHERE email=?",
        (email,)
    )

    row = cur.fetchone()
    con.close()

    # ❌ user not found
    if not row:
        return jsonify({
            "status": "error",
            "msg": "User does not exist"
        })

    stored_password = row[0]

    # ❌ wrong password
    if not check_password_hash(stored_password, password):
        return jsonify({
            "status": "error",
            "msg": "Wrong password"
        })

    token = str(uuid.uuid4())

    # store token in DB (users table)
    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute("UPDATE users SET token=? WHERE email=?", (token, email))
    con.commit()
    con.close()

    return jsonify({
        "status": "success",
        "token": token,
        "email": email
    })


# ================= VERIFY OTP =================

@app.route("/verify-otp", methods=["POST"])
def verify():

    data = request.json
    email = data.get("email")
    otp = data.get("otp")

    # ❌ wrong OTP
    if not verify_otp(email, otp, "register"):
        return jsonify({
            "status": "error",
            "msg": "Invalid OTP"
        })

    # get temporary user
    user = pending_users.get(email)

    if not user:
        return jsonify({
            "status": "error",
            "msg": "Registration expired"
        })

    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute("""
        INSERT INTO users (name, phone, email, dob, password, email_verified)
        VALUES (?, ?, ?, ?, ?, 1)
    """, (
        user["name"],
        user["phone"],
        email,
        user["dob"],
        user["password"]
    ))

    con.commit()
    con.close()

    # remove temporary user
    pending_users.pop(email)

    return jsonify({
        "status": "success"
    })



# ================= FORGOT PASSWORD =================

@app.route("/forgot-otp", methods=["POST"])
def forgot_otp():

    data = request.json
    email = data.get("email").strip().lower()

    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute("SELECT id FROM users WHERE email=?", (email,))
    user = cur.fetchone()

    con.close()

    if not user:
        return jsonify({
            "status": "error",
            "msg": "Email not registered"
        })

    otp = generate_otp()
    save_otp(email, otp, "forgot")

    print("FORGOT OTP:", email, otp)

    return jsonify({
        "status": "otp_sent"
    })

# ================= RESET PASSWORD =================

@app.route("/reset-password", methods=["POST"])
def reset_password():

    data = request.json
    email = data.get("email").strip().lower()
    otp = data.get("otp")
    password = data.get("password")

    # OTP verify
    if not verify_otp(email, otp, "forgot"):
        return jsonify({
            "status": "error",
            "msg": "Invalid OTP"
        })

    # password hash
    hashed_password = generate_password_hash(password)

    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute(
        "UPDATE users SET password=? WHERE email=?",
        (hashed_password, email)
    )

    con.commit()
    con.close()

    return jsonify({
        "status": "success"
    })


# ================= RESEND OTP =================

@app.route("/resend-otp", methods=["POST"])
def resend_otp():

    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({
            "status": "error",
            "msg": "Email required"
        })

    otp = generate_otp()
    save_otp(email, otp, "register")

    print("RESEND OTP for", email, ":", otp)

    return jsonify({
        "status": "otp_resent"
    })


@app.route("/get-profile", methods=["POST"])
def get_profile():

    data = request.json
    token = data.get("token")

    con = sqlite3.connect(DB)
    cur = con.cursor()

    # token → email
    cur.execute("SELECT email FROM users WHERE token=?", (token,))
    user = cur.fetchone()

    if not user:
        return jsonify({"status": "error"})

    email = user[0]

    # profile fetch
    cur.execute("""
        SELECT name, phone, dob, country, address, bio, avatar
        FROM user_profile WHERE email=?
    """, (email,))

    row = cur.fetchone()
    con.close()

    if not row:
        return jsonify({"status": "success", "profile": {}})

    return jsonify({
        "status": "success",
        "profile": {
            "name": row[0],
            "phone": row[1],
            "dob": row[2],
            "country": row[3],
            "address": row[4],
            "bio": row[5],
            "avatar": row[6],
            "email": email
        }
    })



@app.route("/update-profile", methods=["POST"])
def update_profile():

    data = request.json
    token = data.get("token")

    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute("SELECT email FROM users WHERE token=?", (token,))
    user = cur.fetchone()

    if not user:
        return jsonify({"status": "error"})

    email = user[0]

    cur.execute("""
        INSERT INTO user_profile 
        (email, name, phone, dob, country, address, bio, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
            name=excluded.name,
            phone=excluded.phone,
            dob=excluded.dob,
            country=excluded.country,
            address=excluded.address,
            bio=excluded.bio,
            avatar=excluded.avatar
    """, (
        email,
        data.get("name"),
        data.get("phone"),
        data.get("dob"),
        data.get("country"),
        data.get("address"),
        data.get("bio"),
        data.get("avatar")
    ))

    con.commit()
    con.close()

    return jsonify({"status": "success"})






def save_order(order):
    con = sqlite3.connect("Bellavita_Oven.db")
    cur = con.cursor()

    cur.execute("""
    INSERT INTO orders (
        order_id, user_email, full_name, phone, alt_phone,
        house_no, street, landmark, city, state, pincode,
        address_type, coupon_code,
        items, total_amount, payment_method, order_date, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        order["order_id"],
        order["user_email"],
        order["full_name"],
        order["phone"],
        order["alt_phone"],
        order["house_no"],
        order["street"],
        order["landmark"],
        order["city"],
        order["state"],
        order["pincode"],
        order["address_type"],
        order["coupon_code"],
        str(order["items"]),
        order["total_amount"],
        order["payment_method"],
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "Confirmed"
    ))

    con.commit()
    con.close()
    




# ================= SAVE ADDRESS =================
@app.route("/save-address", methods=["POST"])
def save_address():
    data = request.json

    con = sqlite3.connect(DB)
    cur = con.cursor()

    # remove old default
    if data.get("is_default"):
        cur.execute(
            "UPDATE addresses SET is_default=0 WHERE user_email=?",
            (data.get("user_email"),)
        )

    cur.execute("""
        INSERT INTO addresses (
            user_email, full_name, phone, alt_phone,
            house_no, street, landmark, city, state,
            pincode, address_type, is_default, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    """, (
        data.get("user_email"),
        data.get("full_name"),
        data.get("phone"),
        data.get("alt_phone"),
        data.get("house_no"),
        data.get("street"),
        data.get("landmark"),
        data.get("city"),
        data.get("state"),
        data.get("pincode"),
        data.get("address_type"),
        data.get("is_default")
    ))

    con.commit()
    con.close()

    return jsonify({"status": "address_saved"})



# ================= GET ADDRESSES =================
@app.route("/get-addresses", methods=["POST"])
def get_addresses():
    data = request.json
    email = data.get("email")

    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute("""
        SELECT id, full_name, phone, alt_phone,
               house_no, street, landmark, city,
               state, pincode, address_type, is_default
        FROM addresses
        WHERE user_email=?
        ORDER BY id DESC
    """, (email,))

    rows = cur.fetchall()
    con.close()

    addresses = []
    for row in rows:
        addresses.append({
            "id": row[0],
            "name": row[1],
            "phone": row[2],
            "altPhone": row[3],
            "house": row[4],
            "address": row[5],
            "landmark": row[6],
            "city": row[7],
            "state": row[8],
            "pincode": row[9],
            "type": row[10],
            "selected": row[11]
        })

    return jsonify({"addresses": addresses})



# ================= DELETE ADDRESS =================
@app.route("/delete-address", methods=["POST"])
def delete_address():
    data = request.json
    address_id = data.get("address_id")

    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute("DELETE FROM addresses WHERE id=?", (address_id,))

    con.commit()
    con.close()

    return jsonify({"status": "deleted"})





@app.route("/place-order", methods=["POST"])
def place_order():
    data = request.json

    order = {
        "order_id": data.get("order_id"),
        "user_email": data.get("user_email"),
        "full_name": data.get("full_name"),
        "phone": data.get("phone"),
        "alt_phone": data.get("alt_phone"),
        "house_no": data.get("house_no"),
        "street": data.get("street"),
        "landmark": data.get("landmark"),
        "city": data.get("city"),
        "state": data.get("state"),
        "pincode": data.get("pincode"),
        "address_type": data.get("address_type"),
        "coupon_code": data.get("coupon_code"),
        "items": data.get("items"),
        "total_amount": data.get("total_amount"),
        "payment_method": data.get("payment_method")
    }

    save_order(order)

    return jsonify({"status": "success"})



@app.route("/subscribe", methods=["POST"])
def subscribe():

    data = request.json
    email = data.get("email")
    plan = data.get("plan")

    start_date = datetime.now()

    if plan == "monthly":
        end_date = datetime.now().replace(day=datetime.now().day) 
        end_date = start_date.replace(day=start_date.day) 
        end_date = start_date.replace(month=start_date.month + 1 if start_date.month < 12 else 1)
    else:
        end_date = start_date.replace(year=start_date.year + 1)

    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute("""
        INSERT INTO subscriptions (user_email, plan, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?)
    """, (
        email,
        plan,
        start_date.strftime("%Y-%m-%d"),
        end_date.strftime("%Y-%m-%d"),
        "active"
    ))

    con.commit()
    con.close()

    return jsonify({"status": "subscription_saved"})



@app.route("/check-subscription", methods=["POST"])
def check_subscription():

    data = request.json
    email = data.get("email")

    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute("""
        SELECT plan, status, end_date 
        FROM subscriptions
        WHERE user_email=?
        ORDER BY id DESC LIMIT 1
    """, (email,))

    row = cur.fetchone()
    con.close()

    if not row:
        return jsonify({"plan": "none"})

    plan, status, end_date = row

    return jsonify({
        "plan": plan,
        "status": status,
        "end_date": end_date
    })


@app.route("/cancel-subscription", methods=["POST"])
def cancel_subscription():

    data = request.json
    email = data.get("email")

    con = sqlite3.connect(DB)
    cur = con.cursor()

    cur.execute("""
        UPDATE subscriptions
        SET status='cancelled'
        WHERE user_email=?
    """, (email,))

    con.commit()
    con.close()

    return jsonify({"status": "cancelled"})

# ================= RUN SERVER =================

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)