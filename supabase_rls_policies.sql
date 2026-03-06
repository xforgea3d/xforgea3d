-- xForgea3D - Row Level Security Policies
-- Run this in Supabase SQL Editor after supabase_setup.sql
-- ═══════════════════════════════════════════════════════════

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."Profile"
    WHERE id = auth.uid()::text AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Profile ──────────────────────────────────────────────
ALTER TABLE public."Profile" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public."Profile";
CREATE POLICY "Users can view own profile" ON public."Profile"
  FOR SELECT USING (id = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public."Profile";
CREATE POLICY "Users can update own profile" ON public."Profile"
  FOR UPDATE USING (id = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "Admin can insert profiles" ON public."Profile";
CREATE POLICY "Admin can insert profiles" ON public."Profile"
  FOR INSERT WITH CHECK (true); -- trigger creates profiles

-- ── Cart ──────────────────────────────────────────────────
ALTER TABLE public."Cart" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart" ON public."Cart";
CREATE POLICY "Users can manage own cart" ON public."Cart"
  FOR ALL USING ("userId" = auth.uid()::text OR public.is_admin());

-- ── CartItem ──────────────────────────────────────────────
ALTER TABLE public."CartItem" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart items" ON public."CartItem";
CREATE POLICY "Users can manage own cart items" ON public."CartItem"
  FOR ALL USING (
    "cartId" IN (SELECT id FROM public."Cart" WHERE "userId" = auth.uid()::text)
    OR public.is_admin()
  );

-- ── Order ─────────────────────────────────────────────────
ALTER TABLE public."Order" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public."Order";
CREATE POLICY "Users can view own orders" ON public."Order"
  FOR SELECT USING ("userId" = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "Users can create orders" ON public."Order";
CREATE POLICY "Users can create orders" ON public."Order"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "Admin can update orders" ON public."Order";
CREATE POLICY "Admin can update orders" ON public."Order"
  FOR UPDATE USING (public.is_admin());

-- ── OrderItem ─────────────────────────────────────────────
ALTER TABLE public."OrderItem" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON public."OrderItem";
CREATE POLICY "Users can view own order items" ON public."OrderItem"
  FOR SELECT USING (
    "orderId" IN (SELECT id FROM public."Order" WHERE "userId" = auth.uid()::text)
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Users can create order items" ON public."OrderItem";
CREATE POLICY "Users can create order items" ON public."OrderItem"
  FOR INSERT WITH CHECK (
    "orderId" IN (SELECT id FROM public."Order" WHERE "userId" = auth.uid()::text)
    OR public.is_admin()
  );

-- ── Payment ───────────────────────────────────────────────
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON public."Payment";
CREATE POLICY "Users can view own payments" ON public."Payment"
  FOR SELECT USING ("userId" = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "System can manage payments" ON public."Payment";
CREATE POLICY "System can manage payments" ON public."Payment"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Address ───────────────────────────────────────────────
ALTER TABLE public."Address" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own addresses" ON public."Address";
CREATE POLICY "Users can manage own addresses" ON public."Address"
  FOR ALL USING ("userId" = auth.uid()::text OR public.is_admin());

-- ── Notification ──────────────────────────────────────────
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public."Notification";
CREATE POLICY "Users can view own notifications" ON public."Notification"
  FOR SELECT USING ("userId" = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "System can create notifications" ON public."Notification";
CREATE POLICY "System can create notifications" ON public."Notification"
  FOR INSERT WITH CHECK (true); -- server creates these

-- ── Product (public read, admin write) ────────────────────
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view products" ON public."Product";
CREATE POLICY "Anyone can view products" ON public."Product"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage products" ON public."Product";
CREATE POLICY "Admin can manage products" ON public."Product"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Category (public read, admin write) ───────────────────
ALTER TABLE public."Category" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories" ON public."Category";
CREATE POLICY "Anyone can view categories" ON public."Category"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage categories" ON public."Category";
CREATE POLICY "Admin can manage categories" ON public."Category"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Brand (public read, admin write) ──────────────────────
ALTER TABLE public."Brand" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view brands" ON public."Brand";
CREATE POLICY "Anyone can view brands" ON public."Brand"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage brands" ON public."Brand";
CREATE POLICY "Admin can manage brands" ON public."Brand"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Banner (public read, admin write) ─────────────────────
ALTER TABLE public."Banner" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view banners" ON public."Banner";
CREATE POLICY "Anyone can view banners" ON public."Banner"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage banners" ON public."Banner";
CREATE POLICY "Admin can manage banners" ON public."Banner"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Blog (public read, admin write) ───────────────────────
ALTER TABLE public."Blog" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view blogs" ON public."Blog";
CREATE POLICY "Anyone can view blogs" ON public."Blog"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage blogs" ON public."Blog";
CREATE POLICY "Admin can manage blogs" ON public."Blog"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── CarBrand (public read, admin write) ───────────────────
ALTER TABLE public."CarBrand" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view car brands" ON public."CarBrand";
CREATE POLICY "Anyone can view car brands" ON public."CarBrand"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage car brands" ON public."CarBrand";
CREATE POLICY "Admin can manage car brands" ON public."CarBrand"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── CarModel (public read, admin write) ───────────────────
ALTER TABLE public."CarModel" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view car models" ON public."CarModel";
CREATE POLICY "Anyone can view car models" ON public."CarModel"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage car models" ON public."CarModel";
CREATE POLICY "Admin can manage car models" ON public."CarModel"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── QuoteRequest ──────────────────────────────────────────
ALTER TABLE public."QuoteRequest" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quotes" ON public."QuoteRequest";
CREATE POLICY "Users can view own quotes" ON public."QuoteRequest"
  FOR SELECT USING ("userId" = auth.uid()::text OR public.is_admin());

DROP POLICY IF EXISTS "Anyone can create quotes" ON public."QuoteRequest";
CREATE POLICY "Anyone can create quotes" ON public."QuoteRequest"
  FOR INSERT WITH CHECK (true); -- public form

DROP POLICY IF EXISTS "Admin can update quotes" ON public."QuoteRequest";
CREATE POLICY "Admin can update quotes" ON public."QuoteRequest"
  FOR UPDATE USING (public.is_admin());

-- ── NavMenuItem (public read, admin write) ────────────────
ALTER TABLE public."NavMenuItem" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view nav items" ON public."NavMenuItem";
CREATE POLICY "Anyone can view nav items" ON public."NavMenuItem"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage nav items" ON public."NavMenuItem";
CREATE POLICY "Admin can manage nav items" ON public."NavMenuItem"
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── DiscountCode (admin only) ─────────────────────────────
ALTER TABLE public."DiscountCode" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage discount codes" ON public."DiscountCode";
CREATE POLICY "Admin can manage discount codes" ON public."DiscountCode"
  FOR ALL USING (public.is_admin());

-- Service role key bypasses RLS, so server-side Prisma operations work fine.
-- These policies only restrict direct Supabase client access (browser/anon key).

-- ═══════════════════════════════════════════════════════════
-- IMPORTANT: Prisma connects via DATABASE_URL (service role) which BYPASSES RLS.
-- RLS only applies to Supabase client (anon key) connections.
-- This is the correct architecture — Prisma handles business logic, RLS is defense-in-depth.
-- ═══════════════════════════════════════════════════════════
