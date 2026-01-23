-- FIX TRIGGER 500 ERROR
-- The issue is likely that 'profiles' table has 'first_name'/'last_name' but the trigger tries to insert 'full_name'.
-- This script updates the trigger to handle this.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name text;
  v_first_name text;
  v_last_name text;
BEGIN
  -- Get the full name from metadata or email
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  
  -- Split into First/Last (simple split)
  v_first_name := split_part(v_full_name, ' ', 1);
  v_last_name := substring(v_full_name from length(v_first_name) + 2);
  
  -- Fallback if last name is empty
  IF v_last_name = '' OR v_last_name IS NULL THEN
     v_last_name := '';
  END IF;

  -- Attempt insert. We use ON CONFLICT to avoid crashing if it exists.
  -- We try to insert into id, email, first_name, last_name, full_name (if it exists)
  -- BUT since we can't condition on column existence easily in simple SQL, 
  -- We will try the most common structure for this project which seems to be first_name/last_name.

  BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, full_name)
    VALUES (new.id, new.email, v_first_name, v_last_name, v_full_name)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- If invalid column name 'full_name', try without it
    BEGIN
        INSERT INTO public.profiles (id, email, first_name, last_name)
        VALUES (new.id, new.email, v_first_name, v_last_name)
        ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        -- If invalid column name 'first_name', try with only full_name
        INSERT INTO public.profiles (id, email, full_name)
        VALUES (new.id, new.email, v_full_name)
        ON CONFLICT (id) DO NOTHING;
    END;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
