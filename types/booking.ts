/**
 * Apartment names available for booking
 */
export const APARTMENTS = [
  'Christina',
  'Emma',
  'Hedwig',
  'Adele',
  'Anna',
  'Margret',
  'Elisabeth',
] as const;

export type Apartment = (typeof APARTMENTS)[number];

/**
 * Form data for mock booking registration
 */
export interface MockBookingFormData {
  name: string;
  email: string;
  checkIn: string; // ISO date string (YYYY-MM-DD)
  checkOut: string; // ISO date string (YYYY-MM-DD)
  guestCount: number;
  apartment: Apartment;
}

/**
 * Result returned from mock booking server action
 */
export interface BookingServerActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>; // Field-specific validation errors from Zod
  data?: {
    email: string;
    name: string;
  };
}
