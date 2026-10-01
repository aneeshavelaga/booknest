# BookNest Platform — Complete System Architecture

## 1. System Overview & Technology Topology

```mermaid
graph TD
    User["Reader / Customer"] --> |Browsing / Cart / Rental Selection| NextApp["Next.js 16 (App Router + Server Components)"]
    Admin["Store Manager / Admin"] --> |Inventory / Return Inspection| NextApp
    
    subgraph VercelPro["Vercel Pro Production Edge"]
        NextApp --> SSR["SSR Server Actions & Dynamic Routes"]
        NextApp --> Static["Turbopack Edge Static Generation"]
        SSR --> Middleware["Auth Session Middleware (updateSession)"]
    end

    subgraph SupabasePlatform["Supabase Production Backend (xvrkmcchfftcgploumbq)"]
        Middleware --> Auth["Supabase Auth (JWT & Roles)"]
        SSR --> PostgREST["PostgREST Data Engine"]
        PostgREST --> Postgres[("PostgreSQL Database")]
        NextApp --> Realtime["Supabase Realtime (WebSockets)"]
        Realtime --> Postgres
        NextApp --> Storage["Supabase Storage (book-covers, avatars)"]
    end
```

---

## 2. Supabase Integration Credentials Configured

Your project credentials have been configured into [`.env.local`](file:///c:/Users/LENOVO/OneDrive/Desktop/booknest/.env.local) and [`.env.example`](file:///c:/Users/LENOVO/OneDrive/Desktop/booknest/.env.example):

- **Project ID**: `xvrkmcchfftcgploumbq`
- **Project URL**: `https://xvrkmcchfftcgploumbq.supabase.co`
- **Publishable Key**: `sb_publishable_uhJGPxADwTvwrKQKcEiERQ_Te_jR3ut`
- **Direct Database Connection**: `postgresql://postgres:[YOUR-PASSWORD]@db.xvrkmcchfftcgploumbq.supabase.co:5432/postgres`

---

## 3. Database Schema & Data Models

### Key Tables & Relationships

1. **`profiles`**
   - Linked to `auth.users(id)` via foreign key with cascade delete.
   - Roles: `'customer'` or `'admin'`.
   - Stores delivery address, telephone, name, and profile avatar.

2. **`categories`**
   - Fiction & Literature, Sci-Fi & Fantasy, Technology & Engineering, Business & Leadership, Philosophy & Psychology, Biographies.

3. **`books`**
   - **Dual Inventory Trackers**:
     - `stock_sale`: Units available for permanent purchase.
     - `stock_rent`: Physical copies available for lending.
   - **Multi-Duration Pricing**:
     - `rent_price_7_days`, `rent_price_14_days`, `rent_price_30_days`.
     - `security_deposit`: 100% refundable deposit collected per rental unit.
     - `daily_late_fee`: Billed per day if past due date without extension.
   - Condition: `'new'`, `'like_new'`, `'good'`, `'acceptable'`.

4. **`orders` & `order_items`**
   - Supports mixed baskets containing both **Buy** and **Rent** items in a single transaction.
   - Records sales subtotal, rental fees, and held security deposits.
   - Payment Methods: Cash on Delivery (COD) / Doorstep Card, Direct Bank Wire Invoicing, or Reader Escrow Balance.

5. **`rentals`** (First-Class Lifecycle Tracker)
   - Tracks rental start date, calculated due date, return date, and courier pickup schedule.
   - Statuses: `'active'`, `'due_soon'`, `'overdue'`, `'return_pending'`, `'returned'`, `'extension_requested'`.
   - Deposit Statuses: `'held'`, `'refund_pending'`, `'refunded'`, `'forfeited'`.

6. **`notifications`**
   - Real-time notification log pushed via Supabase Realtime WebSocket replication.

---

## 4. The Book Rental & Deposit Escrow Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Cart as Hybrid Cart Drawer
    participant Store as BookNest Server
    participant DB as Supabase PostgreSQL
    participant Courier as Delivery & Return Logistics
    actor Admin as Store Admin

    Customer->>Cart: Selects book & sets rental duration (e.g. 14 Days)
    Cart->>Customer: Displays Rental Fee ($8.99) + Refundable Deposit ($18.00)
    Customer->>Store: Places Order (COD / Invoice / Escrow)
    Store->>DB: Inserts Order, OrderItems & creates 'active' Rental record
    Store->>DB: Decrements 'stock_rent' by quantity
    Store->>Courier: Dispatches book in protective packaging + return sleeve
    Customer->>Customer: Enjoys reading with live Due Date countdown on Dashboard
    Customer->>Store: Clicks "Request Free Return Pickup"
    Store->>DB: Updates rental status to 'return_pending' & deposit to 'refund_pending'
    Courier->>Customer: Collects book during selected pickup window
    Courier->>Admin: Hands book to Store Inspection Station
    Admin->>DB: Verifies condition & clicks "Pass Inspection & Refund"
    DB-->>Customer: Realtime Alert: $18.00 Deposit Refunded to original method
    DB->>DB: Increments 'stock_rent' back into available inventory
```

---

## 5. Security & Row Level Security (RLS)

All tables have RLS enabled:
- **Books & Categories**: Public read (`SELECT true`), Admin write (`is_admin() = true`).
- **Profiles**: Public read for author badges; owners can only modify their own profile.
- **Orders & Rentals**: Customers can strictly view only their own records (`auth.uid() = user_id`); Admins have full access.
- **Reviews**: Public read; authenticated users can insert and update only their own reviews.

---

## 6. How to Deploy Database to Supabase

### Option A: Using Supabase CLI (Recommended)

From your project terminal:
```bash
# 1. Login to Supabase CLI
supabase login

# 2. Link your local project to your live remote project
supabase link --project-ref xvrkmcchfftcgploumbq

# 3. Push schema migrations directly to the live database
supabase db push

# 4. Optional: Populate curated seed books
supabase db reset
```

### Option B: Using Supabase Web Dashboard SQL Editor

1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/xvrkmcchfftcgploumbq).
2. Go to **SQL Editor** in the left sidebar.
3. Paste the contents of [`supabase/schema.sql`](file:///c:/Users/LENOVO/OneDrive/Desktop/booknest/supabase/schema.sql) and click **Run**.
4. Paste the contents of [`supabase/seed.sql`](file:///c:/Users/LENOVO/OneDrive/Desktop/booknest/supabase/seed.sql) and click **Run**.
