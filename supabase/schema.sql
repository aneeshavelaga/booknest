-- ==============================================================================
-- BookNest Production Supabase Schema
-- Complete DDL, Triggers, RLS Policies, Realtime Publication, and Storage Setup
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE book_condition AS ENUM ('new', 'like_new', 'good', 'acceptable');
CREATE TYPE order_item_type AS ENUM ('buy', 'rent');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'partially_refunded');
CREATE TYPE rental_status AS ENUM ('active', 'due_soon', 'overdue', 'return_pending', 'returned', 'extension_requested');
CREATE TYPE deposit_status AS ENUM ('held', 'refund_pending', 'refunded', 'partially_refunded', 'forfeited');

-- 3. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'customer'::user_role NOT NULL,
  avatar_url TEXT,
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_postal_code TEXT,
  address_country TEXT DEFAULT 'India',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. BOOKS TABLE (Dual inventory: Buy & Rent)
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  publisher TEXT,
  publication_year INTEGER,
  description TEXT NOT NULL,
  cover_image TEXT,
  language TEXT DEFAULT 'English',
  pages INTEGER,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  condition book_condition DEFAULT 'like_new'::book_condition NOT NULL,
  
  -- Buying Options
  is_available_for_sale BOOLEAN DEFAULT true NOT NULL,
  sale_price NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  stock_sale INTEGER DEFAULT 0 NOT NULL CHECK (stock_sale >= 0),
  
  -- Rental Options
  is_available_for_rent BOOLEAN DEFAULT true NOT NULL,
  rent_price_7_days NUMERIC(10, 2) DEFAULT 4.99 NOT NULL,
  rent_price_14_days NUMERIC(10, 2) DEFAULT 8.99 NOT NULL,
  rent_price_30_days NUMERIC(10, 2) DEFAULT 14.99 NOT NULL,
  security_deposit NUMERIC(10, 2) DEFAULT 15.00 NOT NULL, -- Refundable deposit
  daily_late_fee NUMERIC(10, 2) DEFAULT 1.00 NOT NULL,
  stock_rent INTEGER DEFAULT 0 NOT NULL CHECK (stock_rent >= 0),
  
  -- Metrics
  rating_average NUMERIC(3, 2) DEFAULT 5.00 NOT NULL,
  ratings_count INTEGER DEFAULT 0 NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Financial totals
  sales_subtotal NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  rental_fees_total NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  security_deposit_total NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  shipping_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  grand_total NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  
  payment_method TEXT DEFAULT 'cash_on_delivery' NOT NULL, -- 'cash_on_delivery', 'direct_bank_transfer', 'store_credit'
  payment_status payment_status DEFAULT 'pending'::payment_status NOT NULL,
  order_status order_status DEFAULT 'pending'::order_status NOT NULL,
  
  shipping_address JSONB NOT NULL,
  order_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE RESTRICT NOT NULL,
  item_type order_item_type NOT NULL, -- 'buy' or 'rent'
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL, -- sale price or rental fee
  
  -- Rental specific attributes
  rental_days INTEGER, -- 7, 14, 30
  security_deposit_per_unit NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. RENTALS LIFECYCLE TABLE
CREATE TABLE IF NOT EXISTS public.rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE RESTRICT NOT NULL,
  
  rental_duration_days INTEGER NOT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  return_date TIMESTAMPTZ,
  
  rental_fee NUMERIC(10, 2) NOT NULL,
  deposit_amount NUMERIC(10, 2) NOT NULL,
  deposit_status deposit_status DEFAULT 'held'::deposit_status NOT NULL,
  deposit_refunded_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  late_fee_charged NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  damage_fee_charged NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  
  status rental_status DEFAULT 'active'::rental_status NOT NULL,
  return_tracking_number TEXT,
  inspection_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(book_id, user_id)
);

-- 10. WISHLIST TABLE
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, book_id)
);

-- 11. REALTIME NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'order_update', 'rental_reminder', 'due_date_warning', 'deposit_refund', 'system'
  link TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 12. AUTOMATION TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Auto create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', NULL),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto update book average rating on review change
CREATE OR REPLACE FUNCTION public.update_book_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.books
  SET 
    rating_average = COALESCE((SELECT AVG(rating)::NUMERIC(3, 2) FROM public.reviews WHERE book_id = NEW.book_id), 5.0),
    ratings_count = (SELECT COUNT(*) FROM public.reviews WHERE book_id = NEW.book_id)
  WHERE id = NEW.book_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_review_created_or_updated
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_book_rating();

-- Decrement stock and create rentals when order is placed
CREATE OR REPLACE FUNCTION public.process_order_placement(order_record_id UUID)
RETURNS VOID AS $$
DECLARE
  item RECORD;
  current_order RECORD;
BEGIN
  SELECT * INTO current_order FROM public.orders WHERE id = order_record_id;
  
  FOR item IN SELECT * FROM public.order_items WHERE order_id = order_record_id LOOP
    IF item.item_type = 'buy' THEN
      UPDATE public.books
      SET stock_sale = GREATEST(stock_sale - item.quantity, 0)
      WHERE id = item.book_id;
    ELSIF item.item_type = 'rent' THEN
      UPDATE public.books
      SET stock_rent = GREATEST(stock_rent - item.quantity, 0)
      WHERE id = item.book_id;
      
      -- Insert rental record
      INSERT INTO public.rentals (
        order_id,
        order_item_id,
        user_id,
        book_id,
        rental_duration_days,
        start_date,
        due_date,
        rental_fee,
        deposit_amount,
        status,
        deposit_status
      ) VALUES (
        current_order.id,
        item.id,
        current_order.user_id,
        item.book_id,
        COALESCE(item.rental_days, 14),
        NOW(),
        NOW() + (COALESCE(item.rental_days, 14) || ' days')::INTERVAL,
        item.unit_price * item.quantity,
        item.security_deposit_per_unit * item.quantity,
        'active'::rental_status,
        'held'::deposit_status
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Profiles:
CREATE POLICY "Public profiles are readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories & Books: Public read, Admin write
CREATE POLICY "Categories are readable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin can modify categories" ON public.categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Books are readable by everyone" ON public.books FOR SELECT USING (true);
CREATE POLICY "Admin can modify books" ON public.books FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Orders: Customer can read own orders, Admin can read/manage all
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admin can update orders" ON public.orders FOR UPDATE USING (public.is_admin());

-- Order Items:
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Users can insert own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL))
);

-- Rentals:
CREATE POLICY "Users can view own rentals" ON public.rentals FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can request return or extension" ON public.rentals FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admin full manage rentals" ON public.rentals FOR ALL USING (public.is_admin());

-- Reviews:
CREATE POLICY "Reviews readable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Wishlist:
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- Notifications:
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notification read state" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================================================
-- 14. REALTIME REPLICATION ENABLEMENT
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'rentals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rentals;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'books'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.books;
  END IF;
END $$;

-- ==============================================================================
-- 15. STORAGE BUCKETS SETUP & POLICIES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('book-covers', 'book-covers', true),
  ('avatars', 'avatars', true),
  ('book-assets', 'book-assets', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Bucket RLS Policies
DROP POLICY IF EXISTS "Public can view book covers" ON storage.objects;
CREATE POLICY "Public can view book covers" ON storage.objects FOR SELECT USING (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "Admins can manage book covers" ON storage.objects;
CREATE POLICY "Admins can manage book covers" ON storage.objects FOR ALL 
USING (bucket_id = 'book-covers' AND public.is_admin()) 
WITH CHECK (bucket_id = 'book-covers' AND public.is_admin());

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Admins can manage book assets" ON storage.objects;
CREATE POLICY "Admins can manage book assets" ON storage.objects FOR ALL 
USING (bucket_id = 'book-assets' AND public.is_admin()) 
WITH CHECK (bucket_id = 'book-assets' AND public.is_admin());

-- ==============================================================================
-- 16. SEED DATA (INR PRICING & CATEGORIES)
-- ==============================================================================
INSERT INTO public.categories (id, name, slug, description, icon) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Fiction & Literature', 'fiction-literature', 'Novels, literary classics, and storytelling masterpieces.', 'BookOpen'),
  ('c0000000-0000-0000-0000-000000000002', 'Sci-Fi & Fantasy', 'sci-fi-fantasy', 'Space operas, cyber futures, and magical epic realms.', 'Sparkles'),
  ('c0000000-0000-0000-0000-000000000003', 'Technology & Engineering', 'technology-engineering', 'Software architecture, AI, systems design, and cybersecurity.', 'Cpu'),
  ('c0000000-0000-0000-0000-000000000004', 'Business & Leadership', 'business-leadership', 'Strategy, management, startup building, and venture capital.', 'Briefcase'),
  ('c0000000-0000-0000-0000-000000000005', 'Philosophy & Psychology', 'philosophy-psychology', 'Human behavior, cognitive sciences, and timeless wisdom.', 'Compass'),
  ('c0000000-0000-0000-0000-000000000006', 'Biographies & Memoirs', 'biographies-memoirs', 'Inspiring journeys of icons, pioneers, and historical leaders.', 'User')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

INSERT INTO public.books (
  id, title, author, isbn, publisher, publication_year, description, cover_image, language, pages,
  category_id, condition, is_available_for_sale, sale_price, stock_sale,
  is_available_for_rent, rent_price_7_days, rent_price_14_days, rent_price_30_days,
  security_deposit, daily_late_fee, stock_rent, rating_average, ratings_count, is_featured
) VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'Designing Data-Intensive Applications',
    'Martin Kleppmann',
    '978-1449373320',
    'O''Reilly Media',
    2017,
    'The definitive guide to the architecture of modern data systems. Covers distributed storage, consensus, partitioning, replication, and stream processing.',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    'English',
    616,
    'c0000000-0000-0000-0000-000000000003',
    'like_new',
    true, 899.00, 25,
    true, 149.00, 249.00, 399.00, 500.00, 25.00, 15,
    4.95, 342, true
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'Dune (60th Anniversary Deluxe Edition)',
    'Frank Herbert',
    '978-0441013593',
    'Ace Books',
    1965,
    'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the spice melange.',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    'English',
    688,
    'c0000000-0000-0000-0000-000000000002',
    'new',
    true, 699.00, 40,
    true, 99.00, 169.00, 279.00, 350.00, 20.00, 20,
    4.90, 890, true
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'The Psychology of Money',
    'Morgan Housel',
    '978-0857197689',
    'Harriman House',
    2020,
    'Doing well with money isn''t necessarily about what you know. It''s about how you behave. And behavior is hard to teach, even to really smart people.',
    'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&q=80&w=800',
    'English',
    256,
    'c0000000-0000-0000-0000-000000000004',
    'like_new',
    true, 399.00, 60,
    true, 69.00, 119.00, 199.00, 250.00, 15.00, 30,
    4.85, 1250, true
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'Atomic Habits',
    'James Clear',
    '978-0735211292',
    'Avery',
    2018,
    'No matter your goals, Atomic Habits offers a proven framework for improving every day. Learn how tiny changes can lead to remarkable results.',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    'English',
    320,
    'c0000000-0000-0000-0000-000000000005',
    'new',
    true, 499.00, 50,
    true, 79.00, 139.00, 229.00, 300.00, 15.00, 25,
    4.92, 2100, true
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'Project Hail Mary',
    'Andy Weir',
    '978-0593135204',
    'Ballantine Books',
    2021,
    'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself are doomed.',
    'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&q=80&w=800',
    'English',
    496,
    'c0000000-0000-0000-0000-000000000002',
    'good',
    true, 549.00, 30,
    true, 89.00, 149.00, 249.00, 300.00, 20.00, 18,
    4.96, 680, true
  ),
  (
    'b0000000-0000-0000-0000-000000000006',
    'Clean Architecture',
    'Robert C. Martin',
    '978-0134494166',
    'Prentice Hall',
    2017,
    'A craftsman''s guide to software structure and design. Learn universal software architecture rules and principles from legendary expert Uncle Bob.',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800',
    'English',
    432,
    'c0000000-0000-0000-0000-000000000003',
    'like_new',
    true, 799.00, 20,
    true, 129.00, 219.00, 349.00, 450.00, 20.00, 12,
    4.78, 410, false
  ),
  (
    'b0000000-0000-0000-0000-000000000007',
    'Meditations: Deluxe Translation',
    'Marcus Aurelius',
    '978-0812968255',
    'Modern Library',
    2002,
    'The private thoughts of the world''s most powerful Roman emperor on stoic philosophy, duty, inner peace, and mortality.',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    'English',
    256,
    'c0000000-0000-0000-0000-000000000005',
    'like_new',
    true, 449.00, 35,
    true, 69.00, 119.00, 189.00, 250.00, 15.00, 20,
    4.88, 590, false
  ),
  (
    'b0000000-0000-0000-0000-000000000008',
    'Shoe Dog: A Memoir by the Creator of Nike',
    'Phil Knight',
    '978-1501135927',
    'Scribner',
    2016,
    'The candid and riveting memoir from the creator of Nike, detailing the journey from borrowing $50 to building a global brand.',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
    'English',
    400,
    'c0000000-0000-0000-0000-000000000006',
    'good',
    true, 499.00, 25,
    true, 79.00, 139.00, 219.00, 280.00, 15.00, 15,
    4.87, 820, false
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  sale_price = EXCLUDED.sale_price,
  rent_price_7_days = EXCLUDED.rent_price_7_days,
  rent_price_14_days = EXCLUDED.rent_price_14_days,
  rent_price_30_days = EXCLUDED.rent_price_30_days,
  security_deposit = EXCLUDED.security_deposit,
  daily_late_fee = EXCLUDED.daily_late_fee;

