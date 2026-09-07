import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

# SMTP Configuration from Environment Variables
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def send_otp_email(to_email: str, otp_code: str):
    """
    Sends a 6-digit OTP code to the provided email address.
    """
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"[WARNING] SMTP credentials missing in .env! Simulating email to {to_email} with OTP: {otp_code}")
        return False
        
    subject = "SalesGenie AI - Your Verification Code"
    
    # HTML Email Content
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px;">
          <h2 style="color: #0d9488; text-align: center;">SalesGenie AI</h2>
          <p>Hello!</p>
          <p>Thank you for signing up for SalesGenie AI. Please use the verification code below to complete your registration:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111; background-color: #f3f4f6; padding: 15px 25px; border-radius: 6px;">
              {otp_code}
            </span>
          </div>
          
          <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br>The SalesGenie AI Team</p>
        </div>
      </body>
    </html>
    """
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"SalesGenie AI <{SMTP_USERNAME}>"
    msg["To"] = to_email
    
    # Attach HTML part
    part = MIMEText(html_content, "html")
    msg.attach(part)
    
    try:
        # Connect to SMTP server and send
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls() # Secure the connection
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_USERNAME, to_email, msg.as_string())
            
        print(f"[SUCCESS] OTP email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to send email: {e}")
        return False
