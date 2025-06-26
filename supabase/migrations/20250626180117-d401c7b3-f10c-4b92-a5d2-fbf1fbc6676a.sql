
-- Update the settings table to use text array for admin_phone_numbers instead of text
ALTER TABLE public.settings 
ALTER COLUMN admin_phone_numbers 
TYPE text[] 
USING CASE 
  WHEN admin_phone_numbers IS NULL THEN ARRAY['+233543482189', '+233509106283']
  ELSE string_to_array(admin_phone_numbers, ',')
END;

-- Set default values for existing rows that might be null
UPDATE public.settings 
SET admin_phone_numbers = ARRAY['+233543482189', '+233509106283']
WHERE admin_phone_numbers IS NULL;
