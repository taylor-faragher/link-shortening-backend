-- Update a specific field within the JSON profile
UPDATE linkuser
SET profile = jsonb_set(profile, '{age}', '32')
WHERE user_id = 1;

-- Example line below to update nested value
-- SET profile = jsonb_set(profile, '{preferences,theme}', '"dark"')
