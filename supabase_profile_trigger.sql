-- Create a trigger function that automatically creates a profile for every new Supabase user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."Profile" (id, email, name, role, "updatedAt")
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name', -- Optional map for name
    'customer', -- Default RoleEnum
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
