import re
import httpx
import logging
from jinja2 import Template
from config import settings
from utils import generate_unsubscribe_token, generate_click_token
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

logger = logging.getLogger(__name__)

def render_message(template_str: str, data: dict):
    """Injects contact data into a Jinja2 template string."""
    return Template(template_str).render(**data)

def send_whatsapp_template(to_phone: str, template_name: str, components: list = None):
    """Sends a Meta-approved template via WhatsApp Cloud API."""
    if not settings.META_ACCESS_TOKEN or not settings.META_PHONE_NUMBER_ID:
        logger.warning("WhatsApp credentials missing. Skipping message.")
        return False
        
    # SAFETY CHECK
    if not to_phone:
        logger.warning(f"Cannot send WhatsApp template '{template_name}': No phone number provided.")
        return False

    url = f"https://graph.facebook.com/v18.0/{settings.META_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.META_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Meta requires E.164 format but without the leading '+'
    clean_phone = to_phone.replace("+", "")
    
    payload = {
        "messaging_product": "whatsapp",
        "to": clean_phone,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": "en_US"}
        }
    }
    
    if components:
        payload["template"]["components"] = components

    try:
        response = httpx.post(url, headers=headers, json=payload)
        response.raise_for_status()
        logger.info(f"WhatsApp template '{template_name}' sent successfully to {clean_phone}")
        return True
    except httpx.HTTPStatusError as e:
        logger.error(f"WhatsApp API error: {e.response.text}")
        raise e
    except Exception as e:
        logger.error(f"WhatsApp request failed: {e}")
        raise e

def send_whatsapp_message(to_phone: str, message_template: str, lead_data: dict):
    """Sends a standard text session message, parsed with Jinja2."""
    if not settings.META_ACCESS_TOKEN or not settings.META_PHONE_NUMBER_ID:
        return False

    # SAFETY CHECK
    if not to_phone:
        logger.warning("Cannot send WhatsApp text: No phone number provided.")
        return False

    # Render Jinja2 variables
    final_message = render_message(message_template, lead_data)

    url = f"https://graph.facebook.com/v18.0/{settings.META_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.META_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone.replace("+", ""),
        "type": "text",
        "text": {"body": final_message}
    }
    try:
        response = httpx.post(url, headers=headers, json=payload)
        response.raise_for_status()
        logger.info(f"WhatsApp text sent: {final_message}")
        return True
    except Exception as e:
        logger.error(f"WhatsApp Text API failure: {e}")
        raise e

def send_email_outbound(to_email: str, subject_template: str, content_template: str, lead_data: dict):
    """Sends email via SendGrid, parsed with Jinja2."""
    
    # Render Jinja2 variables
    final_subject = render_message(subject_template, lead_data)
    final_content = render_message(content_template, lead_data)

    # --- DAY 3: INJECT TRACKING PIXEL, UNSUBSCRIBE, AND LINK WRAPPER ---
    lead_id = lead_data.get("id")
    if lead_id:
        # 1. Wrap all external URLs in the email body
        def link_replacer(match):
            original_url = match.group(1)
            # Only wrap actual http/https links, ignore mailto: or internal anchors
            if original_url.startswith("http"):
                token = generate_click_token(lead_id, original_url)
                tracked_url = f"{settings.BASE_URL}/api/track/click/{token}"
                return f'href="{tracked_url}"'
            return match.group(0)

        final_content = re.sub(r'href="(.*?)"', link_replacer, final_content)

        # 2. Append Unsubscribe and Open Pixel
        unsub_token = generate_unsubscribe_token(lead_id)
        unsub_link = f"{settings.BASE_URL}/api/unsubscribe/{unsub_token}"
        pixel_link = f"{settings.BASE_URL}/api/track/open/{lead_id}"
        
        tracking_html = f'<br><br><hr style="border: 0; border-top: 1px solid #eee;"><p style="font-size: 11px; color: #999;">If you no longer wish to receive these emails, <a href="{unsub_link}" style="color: #999; text-decoration: underline;">click here to unsubscribe</a>.</p><img src="{pixel_link}" width="1" height="1" alt="" />'
        final_content += tracking_html

    if not settings.SENDGRID_API_KEY or settings.SENDGRID_API_KEY == "placeholder" or not settings.SENDGRID_API_KEY.strip():
        logger.warning(f"Simulating EMAIL to {to_email} | SUBJECT: {final_subject} | CONTENT: {final_content[:50]}...")
        return True

    logger.info(f"Attempting EMAIL to {to_email} | SUBJECT: {final_subject}")

    message = Mail(
        from_email='hello@weseegpt.com', 
        to_emails=to_email,
        subject=final_subject,
        html_content=final_content
    )
    
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        logger.info(f"SendGrid Email sent to {to_email} with status {response.status_code}")
        return True
    except Exception as e:
        logger.error(f"SendGrid API failure: {e}")
        raise e
