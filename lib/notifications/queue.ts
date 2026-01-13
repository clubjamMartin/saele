/**
 * Notification Queue Abstraction Layer
 * 
 * Type-safe interface for queuing notifications without direct SQL.
 * Uses database RPC functions for reliability and consistency.
 */

import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/database.types'

// =====================================================
// TYPES
// =====================================================

interface QueueNotificationParams {
  type: string
  recipientEmail: string
  payload: Record<string, Json>
  userId?: string
  bookingId?: string
}

interface MagicLinkPayload {
  magic_link: string
}

interface BookingConfirmationPayload {
  external_booking_id: string
  check_in: string | null
  check_out: string | null
}

// =====================================================
// CORE QUEUE FUNCTION
// =====================================================

/**
 * Queue a notification for processing
 * 
 * @param params - Notification parameters
 * @returns Notification ID
 * @throws Error if queuing fails
 */
export async function queueNotification(
  params: QueueNotificationParams
): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('queue_notification', {
    p_type: params.type,
    p_recipient_email: params.recipientEmail,
    p_payload: params.payload as Json,
    p_user_id: params.userId || undefined,
    p_booking_id: params.bookingId || undefined,
  })

  if (error) {
    console.error('Failed to queue notification:', error)
    throw new Error(`Failed to queue notification: ${error.message}`)
  }

  if (!data) {
    throw new Error('No notification ID returned from queue_notification')
  }

  return data as string
}

// =====================================================
// SPECIALIZED QUEUE FUNCTIONS
// =====================================================

/**
 * Queue a magic link email notification
 * 
 * Used during authentication flow to send sign-in links
 * 
 * @param email - Recipient email address
 * @param magicLink - Magic link URL for authentication
 * @param userId - Optional user ID if already created
 * @returns Notification ID
 */
export async function queueMagicLinkNotification(
  email: string,
  magicLink: string,
  userId?: string
): Promise<string> {
  const payload: MagicLinkPayload = {
    magic_link: magicLink,
  }

  return queueNotification({
    type: 'magic_link',
    recipientEmail: email,
    payload: payload as unknown as Record<string, Json>,
    userId,
  })
}

/**
 * Queue a booking confirmation email notification
 * 
 * Used after booking creation to notify guests
 * 
 * @param email - Guest email address
 * @param booking - Booking details
 * @returns Notification ID
 */
export async function queueBookingConfirmation(
  email: string,
  booking: {
    id: string
    externalBookingId: string
    checkIn: string | null
    checkOut: string | null
    userId?: string
  }
): Promise<string> {
  const payload: BookingConfirmationPayload = {
    external_booking_id: booking.externalBookingId,
    check_in: booking.checkIn,
    check_out: booking.checkOut,
  }

  return queueNotification({
    type: 'booking_confirmation',
    recipientEmail: email,
    payload: payload as unknown as Record<string, Json>,
    userId: booking.userId,
    bookingId: booking.id,
  })
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get notification status by ID
 * 
 * @param notificationId - Notification ID
 * @returns Notification record or null
 */
export async function getNotificationStatus(notificationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, status, attempts, last_error, created_at, sent_at')
    .eq('id', notificationId)
    .single()

  if (error) {
    console.error('Failed to fetch notification status:', error)
    return null
  }

  return data
}

/**
 * Get notification event timeline
 * 
 * Useful for debugging specific notification issues
 * 
 * @param notificationId - Notification ID
 * @returns Array of events or empty array
 */
export async function getNotificationTimeline(notificationId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notification_event_logs')
    .select('*')
    .eq('notification_id', notificationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch notification timeline:', error)
    return []
  }

  return data || []
}

/**
 * Validate email address format
 * 
 * Basic validation to catch obvious errors before queuing
 * 
 * @param email - Email address to validate
 * @returns true if valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Queue notification with validation
 * 
 * Validates email format before queuing
 * 
 * @param params - Notification parameters
 * @returns Notification ID
 * @throws Error if validation fails or queuing fails
 */
export async function queueNotificationWithValidation(
  params: QueueNotificationParams
): Promise<string> {
  if (!isValidEmail(params.recipientEmail)) {
    throw new Error(`Invalid email address: ${params.recipientEmail}`)
  }

  if (!params.type || params.type.trim().length === 0) {
    throw new Error('Notification type is required')
  }

  if (!params.payload || typeof params.payload !== 'object') {
    throw new Error('Notification payload must be an object')
  }

  return queueNotification(params)
}
