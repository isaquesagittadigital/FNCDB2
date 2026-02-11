-- Add ip_address column to user_onboarding table
-- This column stores the IP address of the device when the user accepted the declarations

ALTER TABLE user_onboarding 
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

COMMENT ON COLUMN user_onboarding.ip_address IS 'IP address of the device when declarations were accepted';
