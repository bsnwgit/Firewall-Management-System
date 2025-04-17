import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
from typing import List, Dict, Any

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', 587))
        self.sender_email = os.getenv('SMTP_USERNAME')
        self.sender_password = os.getenv('SMTP_PASSWORD')
        self.admin_email = os.getenv('ADMIN_EMAIL')

    def send_alert_email(self, recipient: str, alerts: List[Dict[str, Any]]) -> bool:
        """
        Send an email with alert information to the specified recipient.
        
        Args:
            recipient: Email address of the recipient
            alerts: List of alert dictionaries containing alert information
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        try:
            # Create message container
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'Network Monitoring Alerts - {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}'
            msg['From'] = self.sender_email
            msg['To'] = recipient

            # Create HTML content
            html = f"""
            <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; }}
                        .alert {{ 
                            margin: 10px 0;
                            padding: 10px;
                            border-left: 4px solid;
                            border-radius: 4px;
                        }}
                        .critical {{ border-color: #d32f2f; background-color: #ffebee; }}
                        .warning {{ border-color: #ed6c02; background-color: #fff3e0; }}
                        .info {{ border-color: #0288d1; background-color: #e3f2fd; }}
                        .timestamp {{ color: #666; font-size: 0.8em; }}
                    </style>
                </head>
                <body>
                    <h2>Network Monitoring Alerts</h2>
                    <p>Generated at: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
                    {self._generate_alert_html(alerts)}
                </body>
            </html>
            """

            # Attach HTML content
            msg.attach(MIMEText(html, 'html'))

            # Create SMTP connection
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(msg)

            return True

        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False

    def _generate_alert_html(self, alerts: List[Dict[str, Any]]) -> str:
        """Generate HTML content for alerts."""
        alert_html = []
        for alert in alerts:
            alert_html.append(f"""
                <div class="alert {alert['severity']}">
                    <h3>{alert['type'].upper()} Alert - {alert['severity'].upper()}</h3>
                    <p>{alert['message']}</p>
                    <p class="timestamp">Time: {alert['timestamp']}</p>
                </div>
            """)
        return "\n".join(alert_html)

    def send_admin_notification(self, alert: Dict[str, Any]) -> bool:
        """
        Send a notification to the admin about a specific alert.
        
        Args:
            alert: Alert dictionary containing alert information
            
        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        if not self.admin_email:
            print("Admin email not configured")
            return False

        return self.send_alert_email(self.admin_email, [alert])

# Create a singleton instance
email_service = EmailService() 