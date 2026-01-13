-- Add guest count and room name to bookings table
-- Part of SAE-13: Dashboard Backend API

-- Add new columns
ALTER TABLE public.bookings
ADD COLUMN guest_count integer,
ADD COLUMN room_name text;

-- Add comments for documentation
COMMENT ON COLUMN public.bookings.guest_count IS 'Number of guests for this booking';
COMMENT ON COLUMN public.bookings.room_name IS 'Name of the booked room (e.g., Adele, Hedwig, Christine)';

-- Add check constraint for guest_count (must be positive if provided)
ALTER TABLE public.bookings
ADD CONSTRAINT bookings_guest_count_positive CHECK (guest_count IS NULL OR guest_count > 0);
