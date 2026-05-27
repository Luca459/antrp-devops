from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/contact")
async def contact(
    name:    str = Form(...),
    email:   str = Form(...),
    company: str = Form(""),
    topic:   str = Form(""),
    message: str = Form(...),
):
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASS", "")
    mail_to   = os.environ.get("MAIL_TO", "hallo@antrp.dev")

    if not smtp_user or not smtp_pass:
        raise HTTPException(status_code=503, detail="SMTP not configured")

    body = f"""Neue Kontaktanfrage via ANTRP.DevSecOps

Name:        {name}
E-Mail:      {email}
Unternehmen: {company or '–'}
Thema:       {topic or '–'}

Nachricht:
{message}
"""
    msg = MIMEMultipart()
    msg["From"]     = smtp_user
    msg["To"]       = mail_to
    msg["Reply-To"] = email
    msg["Subject"]  = f"[ANTRP] Anfrage: {name} – {topic or 'Allgemein'}"
    msg.attach(MIMEText(body, "plain", "utf-8"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as srv:
            srv.starttls()
            srv.login(smtp_user, smtp_pass)
            srv.sendmail(smtp_user, mail_to, msg.as_string())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Mail error: {exc}")

    return {"status": "ok"}
