import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4.0.0'

// =====================================================
// TYPES
// =====================================================

interface Notification {
  id: string
  type: string
  recipient_email: string
  user_id: string | null
  booking_id: string | null
  payload: Record<string, unknown>
  attempts: number
  last_error: string | null
  created_at: string
}

interface ResendError {
  name?: string
  message: string
}

interface ProcessResult {
  notification_id: string
  status: 'sent' | 'failed'
  resend_email_id?: string
  error_code?: string
  error_message?: string
}

// =====================================================
// INITIALIZATION
// =====================================================

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const resendApiKey = Deno.env.get('RESEND_API_KEY')!
const emailFrom = Deno.env.get('EMAIL_FROM') || 'noreply@saele.com'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
const resend = new Resend(resendApiKey)

// =====================================================
// EMAIL TEMPLATES
// =====================================================

function getMagicLinkTemplate(magicLink: string): string {
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
  `.trim()
}

function getBookingConfirmationTemplate(booking: {
  external_booking_id: string
  check_in: string | null
  check_out: string | null
}): string {
  const checkInDate = booking.check_in
    ? new Date(booking.check_in).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not set'
    
  const checkOutDate = booking.check_out
    ? new Date(booking.check_out).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not set'

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
  `.trim()
}

// =====================================================
// NOTIFICATION PROCESSING
// =====================================================

async function processNotification(notification: Notification): Promise<ProcessResult> {
  const idempotencyKey = `${notification.id}-${notification.attempts}`
  
  try {
    // Log processing event
    await supabase.rpc('log_notification_event', {
      p_notification_id: notification.id,
      p_event_type: 'processing',
      p_attempt_number: notification.attempts,
      p_metadata: {
        timestamp: new Date().toISOString(),
        idempotency_key: idempotencyKey,
      },
    })

    // Prepare email based on notification type
    let subject: string
    let html: string

    switch (notification.type) {
      case 'magic_link': {
        const { magic_link } = notification.payload
        if (!magic_link) {
          throw new Error('Missing magic_link in payload')
        }
        subject = 'Sign in to Saele'
        html = getMagicLinkTemplate(magic_link)
        break
      }

      case 'booking_confirmation': {
        const { external_booking_id, check_in, check_out } = notification.payload
        if (!external_booking_id) {
          throw new Error('Missing booking details in payload')
        }
        subject = `Booking Confirmation - ${external_booking_id}`
        html = getBookingConfirmationTemplate({
          external_booking_id,
          check_in,
          check_out,
        })
        break
      }

      default:
        throw new Error(`Unknown notification type: ${notification.type}`)
    }

    // Send email via Resend with idempotency key
    const { data, error } = await resend.emails.send(
      {
        from: emailFrom,
        to: notification.recipient_email,
        subject,
        html,
      },
      {
        headers: {
          'X-Entity-Ref-ID': notification.id,
        },
      }
    )

    if (error) {
      const resendError = error as ResendError
      
      // Determine if error is retryable
      const errorCode = resendError.name || 'unknown_error'

      return {
        notification_id: notification.id,
        status: 'failed',
        error_code: errorCode,
        error_message: resendError.message,
      }
    }

    // Success
    return {
      notification_id: notification.id,
      status: 'sent',
      resend_email_id: data?.id,
    }
  } catch (error) {
    console.error(`Error processing notification ${notification.id}:`, error)
    
    return {
      notification_id: notification.id,
      status: 'failed',
      error_code: 'processing_error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function updateNotificationResult(result: ProcessResult) {
  const { error } = await supabase.rpc('update_notification_status', {
    p_notification_id: result.notification_id,
    p_status: result.status,
    p_resend_email_id: result.resend_email_id || null,
    p_error_code: result.error_code || null,
    p_error_message: result.error_message || null,
    p_response_metadata: {
      timestamp: new Date().toISOString(),
      resend_email_id: result.resend_email_id,
    },
  })

  if (error) {
    console.error(`Failed to update notification ${result.notification_id}:`, error)
  }
}

// =====================================================
// MAIN HANDLER
// =====================================================

Deno.serve(async () => {
  try {
    console.log('Processing notification queue...')

    // Fetch queued notifications
    const { data: notifications, error: fetchError } = await supabase.rpc(
      'get_queued_notifications',
      { p_limit: 10 }
    )

    if (fetchError) {
      console.error('Failed to fetch notifications:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch notifications',
          details: fetchError.message 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (!notifications || notifications.length === 0) {
      console.log('No notifications to process')
      return new Response(
        JSON.stringify({ 
          message: 'No notifications to process',
          processed: 0 
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Processing ${notifications.length} notification(s)...`)

    // Process notifications in parallel
    const results = await Promise.all(
      (notifications as Notification[]).map((notification) =>
        processNotification(notification)
      )
    )

    // Update all results
    await Promise.all(
      results.map((result) => updateNotificationResult(result))
    )

    const successCount = results.filter((r) => r.status === 'sent').length
    const failedCount = results.filter((r) => r.status === 'failed').length

    console.log(`Processed ${notifications.length} notification(s): ${successCount} sent, ${failedCount} failed`)

    return new Response(
      JSON.stringify({
        message: 'Notifications processed',
        processed: notifications.length,
        sent: successCount,
        failed: failedCount,
        results: results.map((r) => ({
          id: r.notification_id,
          status: r.status,
          error_code: r.error_code,
        })),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Edge Function error:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
