-- Create function to automatically assign roles when profile is created
CREATE OR REPLACE FUNCTION public.handle_profile_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count how many users exist in this company
  SELECT COUNT(*) INTO user_count
  FROM profiles
  WHERE company_id = NEW.company_id;

  -- If this is the first user in the company → admin role
  IF user_count = 1 THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Otherwise → kayttaja role
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.user_id, 'kayttaja')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger that fires after profile is inserted
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_role_assignment();