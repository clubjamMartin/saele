-- Add onboarding fields to profiles table
-- Part of SAE-14 to SAE-18: Complete onboarding flow

-- Add new columns for onboarding data
ALTER TABLE public.profiles
ADD COLUMN avatar_url text,
ADD COLUMN interests text[],
ADD COLUMN notification_preferences jsonb,
ADD COLUMN onboarding_completed_at timestamptz;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN public.profiles.interests IS 'Array of user interests for personalized content';
COMMENT ON COLUMN public.profiles.notification_preferences IS 'JSON object storing notification preferences';
COMMENT ON COLUMN public.profiles.onboarding_completed_at IS 'Timestamp when user completed onboarding (null = onboarding not completed)';
