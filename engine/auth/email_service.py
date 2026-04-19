import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load .env file
load_dotenv()

EMAIL = os.getenv("EMAIL_ADDRESS")
PASSWORD = os.getenv("EMAIL_PASSWORD")

def send_otp_email(to_email, otp, purpose):
    print("📧 Sending OTP email...")
    print("To:", to_email)
    print("OTP:", otp)
    print("Purpose:", purpose)

    if not EMAIL or not PASSWORD:
        print("❌ EMAIL credentials not found in .env")
        return False

    if purpose == "register":
        subject = "Bellavita Oven | Email Verification OTP"
        message = f"""
Hello,

Your OTP for Bellavita Oven account verification is:

🔐 OTP: {otp}

This OTP is valid for 5 minutes.

If you did not request this, please ignore.

Regards,
Bellavita Oven Security Team
"""
    elif purpose == "forgot":
        subject = "Bellavita Oven | Password Reset OTP"
        message = f"""
Hello,

Your OTP to reset Bellavita Oven password is:

🔐 OTP: {otp}

This OTP is valid for 5 minutes.

If you did not request this, please ignore.

Regards,
Bellavita Oven Security Team
"""
    else:
        print("❌ Invalid email purpose")
        return False

    try:
        msg = MIMEMultipart()
        msg["From"] = EMAIL
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(message, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.send_message(msg)
        server.quit()

        print("✅ OTP email sent successfully")
        return True

    except Exception as e:
        print("❌ Email Error:", e)
        return False
