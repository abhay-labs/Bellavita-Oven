import sqlite3

con = sqlite3.connect("Bellavita_Oven.db")
cur = con.cursor()

# USERS TABLE
# cur.execute("""
# CREATE TABLE IF NOT EXISTS users (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     name TEXT,
#     phone TEXT,
#     email TEXT UNIQUE,
#     dob TEXT,
#     password TEXT,
#     email_verified INTEGER DEFAULT 0
# )
# """)

# # OTP TABLE
# cur.execute("""
# CREATE TABLE IF NOT EXISTS otp_verification (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     email TEXT,
#     otp TEXT,
#     purpose TEXT,
#     expires_at TEXT
# )
# """)

# # SESSIONS TABLE
# cur.execute("""
# CREATE TABLE IF NOT EXISTS sessions (
#     token TEXT PRIMARY KEY,
#     email TEXT
# )
# """)

# PENDING USERS TABLE
# cur.execute("""
# CREATE TABLE users (
# id INTEGER PRIMARY KEY AUTOINCREMENT,
# name TEXT NOT NULL,
# phone TEXT UNIQUE,
# email TEXT UNIQUE,
# dob TEXT,
# password TEXT,
# email_verified INTEGER DEFAULT 0
# );
# """)



# cur.execute("""
# CREATE TABLE cart (
# user_id INTEGER PRIMARY KEY AUTOINCREMENT,
# cake_id INT ,
# price INT,
# qty INT,
# img TEXT
# );
# """)


# cur.execute("""
# CREATE TABLE user_profile (
#     email TEXT PRIMARY KEY,
#     token TEXT,
#     name TEXT,
#     phone TEXT,
#     dob TEXT,
#     country TEXT,
#     address TEXT,
#     bio TEXT,
#     avatar TEXT,
#     created_at TEXT,
#     updated_at TEXT
# )
# """)


# cur.execute("""
# CREATE TABLE IF NOT EXISTS orders (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     order_id TEXT,
#     user_email TEXT,
#     full_name TEXT,
#     phone TEXT,
#     alt_phone TEXT,
#     house_no TEXT,
#     street TEXT,
#     landmark TEXT,
#     city TEXT,
#     state TEXT,
#     pincode TEXT,
#     items TEXT,
#     total_amount INTEGER,
#     payment_method TEXT,
#     order_date TEXT,
#     status TEXT
# )
# """)

# cur.execute("ALTER TABLE orders ADD COLUMN address_type TEXT")
# cur.execute("ALTER TABLE orders ADD COLUMN coupon_code TEXT")


# cur.execute("""
# CREATE TABLE subscriptions (
#     id INT AUTO_INCREMENT PRIMARY KEY,
#     user_email VARCHAR(100),
#     plan VARCHAR(20),
#     start_date DATE,
#     end_date DATE,
#     status VARCHAR(20)
# );
# """)

# cur.execute("""
# CREATE TABLE IF NOT EXISTS addresses (
#     id INTEGER PRIMARY KEY AUTOINCREMENT,
#     user_email TEXT,
#     full_name TEXT,
#     phone TEXT,
#     alt_phone TEXT,
#     house_no TEXT,
#     street TEXT,
#     landmark TEXT,
#     city TEXT,
#     state TEXT,
#     pincode TEXT,
#     address_type TEXT,
#     is_default INTEGER DEFAULT 0,
#     created_at TEXT
# )
# """)


con.commit()
con.close()

print("Database tables created successfully")