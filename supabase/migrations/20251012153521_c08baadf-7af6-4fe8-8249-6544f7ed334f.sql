-- Add admin role to existing users who don't have any role yet
-- This is a one-time fix for users who registered before the trigger was created
INSERT INTO user_roles (user_id, role)
SELECT p.user_id, 'admin'::app_role
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = p.user_id
)
ON CONFLICT (user_id, role) DO NOTHING;