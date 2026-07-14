-- SIKAI SOP Generator Database Schema

-- 1. Profiles Table (Extends Supabase Auth Users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  credits INTEGER DEFAULT 2 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits)
  VALUES (new.id, new.email, 2);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. SOPs Table
CREATE TABLE public.sops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  markdown_content TEXT NOT NULL,
  mermaid_code TEXT NOT NULL,
  boost_strategy TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for sops
ALTER TABLE public.sops ENABLE ROW LEVEL SECURITY;

-- Policies for sops
CREATE POLICY "Users can view their own SOPs" 
  ON public.sops FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SOPs" 
  ON public.sops FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SOPs" 
  ON public.sops FOR DELETE 
  USING (auth.uid() = user_id);

-- 3. Payment Requests Table (For Semi-Manual Bold Integration)
CREATE TABLE public.payment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  package_name TEXT NOT NULL,
  credits_requested INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Policies for payment_requests
CREATE POLICY "Users can view their own payment requests" 
  ON public.payment_requests FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payment requests" 
  ON public.payment_requests FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
