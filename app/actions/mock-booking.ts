'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import type { BookingServerActionResult } from '@/types/booking';
import { APARTMENTS } from '@/types/booking';

/**
 * Zod schema for mock booking form validation
 */
const mockBookingSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  checkIn: z.string().refine((date) => {
    const checkInDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkInDate >= today;
  }, 'Check-in date must be today or in the future'),
  checkOut: z.string(),
  guestCount: z.coerce.number().int().min(1, 'At least 1 guest is required'),
  apartment: z.enum(APARTMENTS, {
    errorMap: () => ({ message: 'Please select a valid apartment' }),
  }),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
});

type MockBookingFormData = z.infer<typeof mockBookingSchema>;

/**
 * Server action to handle mock booking creation and magic link sending
 * 
 * Modern approach using signInWithOtp from server:
 * 1. Validate form data
 * 2. Create booking with email (guest_user_id will be linked later)
 * 3. Send magic link via signInWithOtp (auto-creates user if doesn't exist)
 * 4. User clicks magic link → auth callback links booking to user_id
 */
export async function createMockBooking(
  prevState: BookingServerActionResult | null,
  formData: FormData
): Promise<BookingServerActionResult> {
  try {
    // Extract and validate form data
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      checkIn: formData.get('checkIn'),
      checkOut: formData.get('checkOut'),
      guestCount: formData.get('guestCount'),
      apartment: formData.get('apartment'),
    };

    const validatedFields = mockBookingSchema.safeParse(rawData);

    // Return validation errors if any
    if (!validatedFields.success) {
      return {
        success: false,
        message: 'Please check your input and try again.',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;
    const supabase = await createClient();

    // Step 1: Create booking with email
    // The guest_user_id will be null initially and linked after magic link authentication
    const externalBookingId = `mock-${crypto.randomUUID()}`;
    
    const { error: bookingError } = await supabase
      .from('bookings')
      .insert({
        external_booking_id: externalBookingId,
        guest_user_id: null, // Will be linked after authentication
        email: data.email,
        check_in: data.checkIn,
        check_out: data.checkOut,
        guest_count: data.guestCount,
        room_name: data.apartment,
        status: 'confirmed',
      });

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return {
        success: false,
        message: 'An error occurred while creating your booking. Please try again.',
      };
    }

    // Step 2: Send magic link from server side
    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          full_name: data.name,
        },
      },
    });

    if (authError) {
      console.error('Error sending magic link:', authError);
      // Booking was created but magic link failed
      // Don't fail the entire operation, just notify the user
      return {
        success: true,
        message: `Booking confirmed! However, we had trouble sending your login email. Please contact support or try logging in at /login with ${data.email}.`,
      };
    }

    console.log(`Created booking: ${externalBookingId} for ${data.email} and sent magic link.`);

    // Return success - no need to pass data back since magic link is sent from server
    return {
      success: true,
      message: `Booking confirmed! We've sent a magic link to ${data.email}. Click the link to access your dashboard.`,
    };
  } catch (error) {
    console.error('Unexpected error in createMockBooking:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}
