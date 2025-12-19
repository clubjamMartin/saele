/**
 * Type definitions for the Saele application
 */

// Re-export database types
export type { Database } from '@/lib/supabase/database.types';

// User role type
export type UserRole = 'guest' | 'admin';

// Booking status type
export type BookingStatus = 'confirmed' | 'cancelled';

// Notification status type
export type NotificationStatus = 'queued' | 'sent' | 'failed';

// Event log level type
export type EventLogLevel = 'info' | 'warn' | 'error';

/**
 * Type guard to check if a role is admin
 */
export function isAdminRole(role: UserRole): role is 'admin' {
  return role === 'admin';
}

/**
 * Type guard to check if a role is guest
 */
export function isGuestRole(role: UserRole): role is 'guest' {
  return role === 'guest';
}

/**
 * Type guard to check if a booking status is confirmed
 */
export function isBookingConfirmed(status: BookingStatus): status is 'confirmed' {
  return status === 'confirmed';
}

/**
 * Type guard to check if a notification is sent
 */
export function isNotificationSent(status: NotificationStatus): status is 'sent' {
  return status === 'sent';
}
