import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email sending configuration
 */
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@saele.com';

/**
 * Generic email sending function
 * Abstraction layer for email provider - can be swapped out easily
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}) {
  try {
    const emailOptions: Record<string, any> = {
      from: EMAIL_FROM,
      to,
      subject,
    };

    if (html) emailOptions.html = html;
    if (text) emailOptions.text = text;
    if (replyTo) emailOptions.replyTo = replyTo;

    const { data, error } = await resend.emails.send(emailOptions as any);

    if (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

/**
 * Send magic link email template
 */
export async function sendMagicLinkEmail(email: string, magicLink: string) {
  const html = getMagicLinkTemplate(magicLink);
  
  return sendEmail({
    to: email,
    subject: 'Sign in to Saele',
    html,
  });
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  email: string,
  booking: {
    external_booking_id: string;
    check_in: string | null;
    check_out: string | null;
  }
) {
  const html = getBookingConfirmationTemplate(booking);
  
  return sendEmail({
    to: email,
    subject: `Booking Confirmation - ${booking.external_booking_id}`,
    html,
  });
}

/**
 * Magic link email template
 */
export function getMagicLinkTemplate(magicLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Saele</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9fafb; border-radius: 8px; padding: 32px; margin: 20px 0;">
    <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
      Sign in to Saele
    </h1>
    <p style="color: #6b7280; margin: 0 0 24px 0;">
      Click the button below to securely sign in to your account. This link will expire in 24 hours.
    </p>
    <a href="${magicLink}" style="display: inline-block; background: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
      Sign in to Saele
    </a>
    <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 0 0;">
      If you didn't request this email, you can safely ignore it.
    </p>
  </div>
  <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 20px 0;">
    © ${new Date().getFullYear()} Saele. All rights reserved.
  </p>
</body>
</html>
  `.trim();
}

/**
 * Booking confirmation email template
 */
export function getBookingConfirmationTemplate(booking: {
  external_booking_id: string;
  check_in: string | null;
  check_out: string | null;
}): string {
  const checkInDate = booking.check_in
    ? new Date(booking.check_in).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not set';
    
  const checkOutDate = booking.check_out
    ? new Date(booking.check_out).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not set';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9fafb; border-radius: 8px; padding: 32px; margin: 20px 0;">
    <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
      Booking Confirmed
    </h1>
    <p style="color: #6b7280; margin: 0 0 24px 0;">
      Your booking has been successfully confirmed. Here are your booking details:
    </p>
    
    <div style="background: white; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Booking ID:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 500; text-align: right;">${booking.external_booking_id}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Check-in:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 500; text-align: right; border-top: 1px solid #e5e7eb;">${checkInDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Check-out:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 500; text-align: right; border-top: 1px solid #e5e7eb;">${checkOutDate}</td>
        </tr>
      </table>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0 0;">
      We look forward to welcoming you! If you have any questions, please don't hesitate to contact us.
    </p>
  </div>
  <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 20px 0;">
    © ${new Date().getFullYear()} Saele. All rights reserved.
  </p>
</body>
</html>
  `.trim();
}
