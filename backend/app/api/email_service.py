import smtplib
import os
import sys
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Any
from datetime import datetime

# Ensure backend root is in search path for api_secrets
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if backend_root not in sys.path:
    sys.path.append(backend_root)

logger = logging.getLogger(__name__)

def send_market_report(alerts: List[Dict[str, Any]]):
    """
    Formats and sends a market summary report via email.
    """
    try:
        from api_secrets import EMAIL_SENDER, RECIPIENT_EMAIL, SMTP_SERVER, SMTP_PORT, SMTP_PASSWORD
    except ImportError:
        logger.warning("Email credentials missing in api_secrets. Logging report instead of sending.")
        _log_report_locally(alerts)
        return

    if not EMAIL_SENDER or not RECIPIENT_EMAIL:
        logger.warning("Email sender or recipient not configured. Logging report instead.")
        _log_report_locally(alerts)
        return

    # Create the email content
    msg = MIMEMultipart()
    msg['From'] = EMAIL_SENDER
    msg['To'] = RECIPIENT_EMAIL
    msg['Subject'] = f"Daily Market Insight Report - {datetime.now().strftime('%Y-%m-%d %H:%M')}"

    body = _format_report_body(alerts)
    msg.attach(MIMEText(body, 'html'))

    try:
        # Note: In a production environment, you'd use a real SMTP server.
        # This is a placeholder for the logic.
        if SMTP_SERVER == "localhost" or not SMTP_PASSWORD:
            logger.info("SMTP server not fully configured. LOGGING EMAIL BODY INSTEAD:")
            print(f"\n--- EMAIL TO: {RECIPIENT_EMAIL} ---\n{body}\n----------------------\n")
            return

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_SENDER, SMTP_PASSWORD)
            server.send_message(msg)
            logger.info(f"Market report successfully sent to {RECIPIENT_EMAIL}")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        _log_report_locally(alerts)

def _format_report_body(alerts: List[Dict[str, Any]]) -> str:
    rows = ""
    for a in alerts:
        signal_color = "#10b981" if a['signal'] == "BUY" else "#ef4444" if a['signal'] == "SELL" else "#f59e0b"
        rows += f"""
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><b>{a['sector']}</b></td>
            <td style="padding: 10px; border: 1px solid #ddd; color: {signal_color}; font-weight: bold;">{a['signal']}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{a['reasoning']}</td>
        </tr>
        """

    return f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #2563eb;">Market Intelligence Summary</h2>
            <p>Here are the latest sector recommendations based on automated news analysis:</p>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Sector</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Signal</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Reasoning</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            <p style="font-size: 12px; color: #666; margin-top: 20px;">
                This is an automated report from the TriageIQ Unified Intelligence Platform.
            </p>
        </body>
    </html>
    """

def _log_report_locally(alerts: List[Dict[str, Any]]):
    print("\n--- MOCK MARKET REPORT (No Email Sent) ---")
    for a in alerts:
        print(f"[{a['sector']}] {a['signal']}: {a['reasoning']}")
    print("------------------------------------------\n")
