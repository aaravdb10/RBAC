import os
import smtplib
from email.mime.text import MIMEText

# Email configuration using environment variables
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
SMTP_USER = os.getenv('SMTP_USER', 'aaravdb10@gmail.com')  # Your email address
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', 'vaal djva zxbj kmlj')  # Your email password or app-specific password

# Function to send OTP email
def send_otp_email(recipient_email: str, code: str) -> None:
    """
    Send an OTP code to the specified email address.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"SMTP credentials not configured, using demo mode")
        print(f"Demo OTP for {recipient_email}: {code}")
        return

    try:
        subject = "Your Verification Code - AccessRakshak"
        body = f"""
Hello,

Your verification code for AccessRakshak registration is: {code}

This code will expire in 5 minutes.

If you did not request this code, please ignore this email.

Best regards,
AccessRakshak Team
"""
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = SMTP_USER
        msg['To'] = recipient_email

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"OTP email sent successfully to {recipient_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
        print(f"Demo OTP for {recipient_email}: {code}")
        raise e
