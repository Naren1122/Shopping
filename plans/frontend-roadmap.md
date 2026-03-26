# Frontend Development Roadmap

## Approach

Build one feature completely → Test it → Move to next

---

## Backend APIs Summary

Before starting frontend, here's what the backend provides:

| Endpoint                 | Purpose                      |
| ------------------------ | ---------------------------- |
| `/api/auth/*`            | Login, signup, profile       |
| `/api/products/*`        | Products, search, categories |
| `/api/cart/*`            | Shopping cart                |
| `/api/wishlist/*`        | User wishlist                |
| `/api/addresses/*`       | Saved addresses              |
| `/api/orders/*`          | Order management             |
| `/api/payments/*`        | eSewa integration            |
| `/api/reviews/*`         | Product reviews              |
| `/api/recommendations/*` | AI recommendations           |
| `/api/analytics/*`       | Admin stats                  |

---

## Step 1: Authentication System

### Goal: Users can register and login

**Frontend Pages:**

- `/login` - Login page
- `/signup` - Registration page
- `/forgot-password` - Password reset

**Components Needed:**

- LoginForm
- SignupForm
- AuthContext (state management)

**Backend APIs Used:**

```
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/profile
```

**Test:**

1. Create account with signup
2. Login with credentials
3. Verify token stored in cookie

---

## Step 2: Home Page

### Goal: Display products on homepage

**Frontend Page:**

- `/` - Homepage

**Components Needed:**

- Hero section
- FeaturedProducts (from API)
- CategoryList
- ProductCard

**Backend APIs Used:**

```
GET /api/products/featured
GET /api/products/recommendations
GET /api/products/category/:category
```

**Test:**

1. Load homepage
2. Verify featured products show
3. Check categories display

---

## Step 3: Products Listing

### Goal: Browse all products with search and filter

**Frontend Page:**

- `/products` - Product listing page

**Components Needed:**

- ProductGrid
- SearchBar
- CategoryFilter
- Pagination
- PriceFilter

**Backend APIs Used:**

```
GET /api/products?page=1&limit=10
GET /api/products/search?q=keyword
GET /api/products/category/:category?page=1&limit=10
```

**Test:**

1. Search for a product
2. Filter by category
3. Navigate pagination

---

## Step 4: Product Details

### Goal: View single product information

**Frontend Page:**

- `/products/[id]` - Product detail page

**Components Needed:**

- ProductImage
- ProductInfo
- QuantitySelector
- AddToCartButton
- AddToWishlistButton
- ReviewsList
- RatingStars

**Backend APIs Used:**

```
GET /api/products/:id (existing)
GET /api/reviews/product/:productId
GET /api/reviews/product/:productId/rating
```

**Test:**

1. Click product from listing
2. View product details
3. See reviews and rating

---

## Step 5: Shopping Cart

### Goal: Manage items in cart

**Frontend Page:**

- `/cart` - Cart page

**Components Needed:**

- CartItem
- CartSummary
- QuantityControls
- RemoveFromCart
- ApplyCoupon

**Backend APIs Used:**

```
GET /api/cart
POST /api/cart
PUT /api/cart/:id
DELETE /api/cart
```

**Test:**

1. Add item to cart
2. Change quantity
3. Remove item
4. Verify total updates

---

## Step 6: Wishlist

### Goal: Save products for later

**Frontend Page:**

- `/wishlist` - Wishlist page

**Components Needed:**

- WishlistItem
- MoveToCartButton
- RemoveFromWishlist

**Backend APIs Used:**

```
GET /api/wishlist
POST /api/wishlist
DELETE /api/wishlist/:productId
```

**Test:**

1. Add product to wishlist
2. View wishlist page
3. Move item to cart

---

## Step 7: Checkout - Addresses

### Goal: Select or add shipping address

**Frontend Page:**

- `/checkout/address` - Address selection

**Components Needed:**

- AddressList
- AddressCard
- AddAddressForm
- SelectAddress

**Backend APIs Used:**

```
GET /api/addresses
POST /api/addresses
PUT /api/addresses/:id
DELETE /api/addresses/:id
PATCH /api/addresses/:id/default
```

**Test:**

1. Add new address
2. Select existing address
3. Set default address

---

## Step 8: Checkout - Payment

### Goal: Process payment via eSewa

**Frontend Page:**

- `/checkout/payment` - Payment page
- `/payment-success` - Success page
- `/payment-failed` - Failure page

**Components Needed:**

- OrderSummary
- PaymentMethodSelector
- EsewaPaymentButton
- OrderConfirmation

**Backend APIs Used:**

```
POST /api/orders
POST /api/payments/esewa/initiate
GET /api/payments/esewa/success
GET /api/payments/esewa/failure
```

**Test:**

1. Complete checkout
2. Initiate eSewa payment
3. Handle success/failure redirect

---

## Step 9: User Profile & Orders

### Goal: View profile and order history

**Frontend Pages:**

- `/profile` - User profile
- `/orders` - Order history
- `/orders/[id]` - Order details

**Components Needed:**

- ProfileForm
- OrderList
- OrderCard
- OrderDetails

**Backend APIs Used:**

```
GET /api/auth/profile
PUT /api/auth/profile
GET /api/orders
GET /api/orders/:id
```

**Test:**

1. View profile
2. View order history
3. View order details

---

## Step 10: AI Recommendations

### Goal: Show personalized product suggestions

**Frontend Page:**

- `/recommendations` - AI recommendations page

**Components Needed:**

- RecommendationGrid
- AILoadingSpinner

**Backend APIs Used:**

```
GET /api/recommendations
```

**Test:**

1. Login as user
2. View recommendations
3. Verify AI suggestions

---

## Step 11: Admin Dashboard - Overview

### Goal: Admin sees overall statistics

**Frontend Pages:**

- `/admin` - Admin dashboard

**Components Needed:**

- StatsCards (users, orders, revenue)
- RecentOrdersTable
- QuickActions

**Backend APIs Used:**

```
GET /api/analytics/overview
GET /api/analytics/orders
```

**Test:**

1. Login as admin
2. View dashboard stats

---

## Step 12: Admin - Product Management

### Goal: Admin can manage products

**Frontend Pages:**

- `/admin/products` - Product list
- `/admin/products/new` - Add product
- `/admin/products/[id]/edit` - Edit product

**Components Needed:**

- ProductTable
- ProductForm
- ImageUpload
- CategorySelect

**Backend APIs Used:**

```
GET /api/products (admin)
POST /api/products
PATCH /api/products/:id
DELETE /api/products/:id
```

**Test:**

1. View all products
2. Add new product
3. Edit/delete product

---

## Step 13: Admin - Order Management

### Goal: Admin can manage orders

**Frontend Pages:**

- `/admin/orders` - Order list
- `/admin/orders/[id]` - Order details

**Components Needed:**

- OrdersTable
- OrderStatusBadge
- UpdateStatusButton

**Backend APIs Used:**

```
GET /api/orders (need to create admin route)
PATCH /api/orders/:id/status
```

**Test:**

1. View all orders
2. Update order status

---

## Step 14: Admin - Analytics

### Goal: Admin sees detailed analytics

**Frontend Pages:**

- `/admin/analytics` - Analytics dashboard

**Components Needed:**

- SalesChart
- TopProductsList
- PeriodSelector

**Backend APIs Used:**

```
GET /api/analytics/sales?period=week
GET /api/analytics/top-products
```

**Test:**

1. View sales chart
2. View top products

---

## Testing Checklist for Each Step

After completing each step:

- [ ] Create page component
- [ ] Create necessary UI components
- [ ] Connect to backend API
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Test in browser
- [ ] Verify data displays correctly
- [ ] Move to next step

---

## Recommended Order

| Step  | Priority | Reason                                  |
| ----- | -------- | --------------------------------------- |
| 1     | First    | Foundation - auth needed for everything |
| 2     | Second   | Homepage is the entry point             |
| 3-4   | Third    | Core shopping experience                |
| 5-6   | Fourth   | Cart and wishlist                       |
| 7-10  | Fifth    | User features (checkout, orders, AI)    |
| 11-14 | Sixth    | Admin features                          |

---

## File Structure After All Steps

```
frontend/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── login/page.tsx              # Login
│   ├── signup/page.tsx             # Signup
│   ├── products/
│   │   ├── page.tsx               # Product listing
│   │   └── [id]/page.tsx          # Product details
│   ├── cart/page.tsx              # Shopping cart
│   ├── wishlist/page.tsx          # Wishlist
│   ├── checkout/
│   │   ├── address/page.tsx       # Address selection
│   │   ├── payment/page.tsx       # Payment
│   │   ├── success/page.tsx       # Payment success
│   │   └── failed/page.tsx        # Payment failed
│   ├── orders/
│   │   ├── page.tsx               # Order list
│   │   └── [id]/page.tsx         # Order details
│   ├── recommendations/page.tsx   # AI recommendations
│   ├── profile/page.tsx           # User profile
│   └── admin/
│       ├── page.tsx              # Admin dashboard
│       ├── products/
│       │   ├── page.tsx          # Product management
│       │   └── new/page.tsx      # Add product
│       ├── orders/page.tsx       # Order management
│       └── analytics/page.tsx    # Analytics
├── components/
│   ├── auth/                     # Auth components
│   ├── products/                 # Product components
│   ├── cart/                     # Cart components
│   ├── checkout/                 # Checkout components
│   ├── admin/                    # Admin components
│   └── ui/                       # UI components (shadcn)
├── lib/
│   ├── api.ts                    # API calls
│   └── auth.ts                   # Auth utilities
└── contexts/
    └── AuthContext.tsx           # Auth state management
```
