# Maison Luxe — Premium Home Decor E-Commerce

A full-featured e-commerce platform for premium home decor, built with React 19, TypeScript, Supabase, and Tailwind CSS. Features product browsing with filtering, cart and wishlist management, user authentication, order tracking, coupon discounts, and an admin dashboard.

## Tech Stack

| Layer      | Technology                                                              |
| ---------- | ----------------------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Framer Motion   |
| Backend    | Supabase (PostgreSQL, Auth, Storage, Row-Level Security)                |
| State      | Zustand                                                                 |
| Routing    | React Router v7                                                         |
| Forms      | React Hook Form + Zod                                                   |
| Payments   | Easypaisa, JazzCash, Bank Transfer, COD                                 |

## Features

- **Product Catalog** — Browse by category, search, filter by price/tags, sort
- **Product Detail** — Variant selection (color/size), image gallery, reviews
- **Cart & Wishlist** — Persistent per user, quantity controls
- **Authentication** — Email/password via Supabase Auth, protected routes
- **Checkout** — Address management, coupon application, multiple payment methods
- **Order Management** — Order history, status tracking, admin order management
- **Admin Dashboard** — Manage products, categories, orders, coupons, and view sales charts
- **Coupons** — Percentage, fixed, and free-shipping discount codes
- **Responsive** — Fully responsive with mobile-first design and sidebar layouts

## Getting Started

### Prerequisites

- Node.js >= 20
- A Supabase project (free tier works)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/maison-luxe.git
cd maison-luxe

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Fill in your Supabase credentials in .env
#    VITE_SUPABASE_URL    — from Supabase Settings > API
#    VITE_SUPABASE_ANON_KEY — from Supabase Settings > API

# 5. Apply the database migration
#    Open supabase/migrations/20260524065412_create_ecommerce_schema.sql
#    and run it in your Supabase SQL Editor.

# 6. (Optional) Seed sample data
#    Open supabase/seed.sql in the Supabase SQL Editor and run it.

# 7. Start the development server
npm run dev
```

### Environment Variables

| Variable                  | Description                        | Required |
| ------------------------- | ---------------------------------- | -------- |
| `VITE_SUPABASE_URL`       | Supabase project URL               | Yes      |
| `VITE_SUPABASE_ANON_KEY`  | Supabase anonymous (public) key    | Yes      |

## Available Scripts

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start Vite dev server              |
| `npm run build`     | Type-check and build for production|
| `npm run preview`   | Preview production build locally   |
| `npm run typecheck` | Run TypeScript type checking       |

## Project Structure

```
maison-luxe/
├── public/
│   └── vite.svg
├── src/
│   ├── App.tsx                      # App root with router
│   ├── main.tsx                     # Entry point
│   ├── index.css                    # Global styles + Tailwind
│   ├── components/
│   │   ├── layout/                  # Header, Footer, Layout wrapper
│   │   ├── products/                # ProductCard and product-specific UI
│   │   └── ui/                      # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── hooks/                       # Custom hooks (use-mobile)
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client + TypeScript types
│   │   └── utils.ts                 # Utility functions
│   ├── pages/                       # Route pages (Home, Products, Cart, Checkout, Admin, etc.)
│   └── store/                       # Zustand stores (cart, wishlist, auth)
├── supabase/
│   └── migrations/                  # Database migration files
├── .env.example                     # Environment variable template
├── components.json                  # shadcn/ui configuration
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```
