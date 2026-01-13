/**
 * Countdown calculator for next booking check-in
 * Part of SAE-13: Dashboard Backend API
 */

export interface CountdownData {
  checkInDate: string; // ISO timestamp
  checkOutDate: string; // ISO timestamp
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  guestCount: number;
  roomName: string;
}

export interface NextBooking {
  check_in: string;
  check_out: string;
  guest_count: number | null;
  room_name: string | null;
}

/**
 * Calculate countdown to next booking check-in
 * @param nextBooking - The upcoming booking data from database
 * @returns Countdown breakdown or null if no booking
 */
export function calculateCountdown(nextBooking: NextBooking | null): CountdownData | null {
  if (!nextBooking) {
    return null;
  }

  const now = new Date();
  const checkInDate = new Date(nextBooking.check_in);
  const checkOutDate = new Date(nextBooking.check_out);

  // Calculate total difference in milliseconds
  const diffMs = checkInDate.getTime() - now.getTime();

  // If check-in is in the past, return null
  if (diffMs < 0) {
    return null;
  }

  // Calculate time components
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  // Calculate months, days, hours, minutes, seconds
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  return {
    checkInDate: checkInDate.toISOString(),
    checkOutDate: checkOutDate.toISOString(),
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    guestCount: nextBooking.guest_count || 0,
    roomName: nextBooking.room_name || 'Unknown',
  };
}
