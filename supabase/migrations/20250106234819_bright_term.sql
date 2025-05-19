-- Drop existing policies
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON teams;
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON users;

-- Create simplified policies for development
CREATE POLICY "Authenticated users can access teams"
  ON teams
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can access users"
  ON users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Improve user handling function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure all auth users have corresponding records
INSERT INTO public.users (id, email, role)
SELECT id, email, 'user'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE users.id = auth.users.id
);