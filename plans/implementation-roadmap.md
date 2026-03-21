# Step-by-Step Implementation Roadmap

## Approach

Implement one feature completely → Test it → Move to next

---

## Step 1: Address Management

### Goal: Users can manage shipping addresses

**Files to create:**

- `backend/src/models/address.model.js`
- `backend/src/controllers/address.controller.js`
- `backend/src/routes/address.route.js`

**Update:**

- `backend/src/server.js` - Add route

**API Endpoints:**

```
GET    /api/addresses          - Get all addresses
POST   /api/addresses          - Add new address
PUT    /api/addresses/:id      - Update address
DELETE /api/addresses/:id      - Delete address
PATCH  /api/addresses/:id/default - Set default
```

**Test with:**

```bash
# Add address
curl -X POST http://localhost:5001/api/addresses \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{"fullName":"John","address":"123 Main St","city":"Kathmandu","district":"Kathmandu","province":"Bagmati","phone":"9841234567"}'

# Get addresses
curl http://localhost:5001/api/addresses -H "Cookie: accessToken=YOUR_TOKEN"
```

---

## Step 2: Wishlist Feature

### Goal: Users can save products to wishlist

**Files to create:**

- `backend/src/models/wishlist.model.js`
- `backend/src/controllers/wishlist.controller.js`
- `backend/src/routes/wishlist.route.js`

**Update:**

- `backend/src/server.js` - Add route

**API Endpoints:**

```
GET    /api/wishlist              - Get wishlist
POST   /api/wishlist              - Add product to wishlist
DELETE /api/wishlist/:productId    - Remove from wishlist
```

**Test with:**

```bash
# Add to wishlist
curl -X POST http://localhost:5001/api/wishlist \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{"productId":"PRODUCT_ID"}'

# Get wishlist
curl http://localhost:5001/api/wishlist -H "Cookie: accessToken=YOUR_TOKEN"
```

---

## Step 3: Product Reviews

### Goal: Users can rate and review products

**Files to create:**

- `backend/src/models/review.model.js`
- `backend/src/controllers/review.controller.js`
- `backend/src/routes/review.route.js`

**Update:**

- `backend/src/server.js` - Add route

**API Endpoints:**

```
GET  /api/reviews/product/:productId     - Get product reviews
GET  /api/reviews/product/:productId/rating - Get average rating
POST /api/reviews                       - Create review
```

**Test with:**

```bash
# Add review
curl -X POST http://localhost:5001/api/reviews \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{"productId":"PRODUCT_ID","rating":5,"comment":"Great product!"}'

# Get reviews
curl http://localhost:5001/api/reviews/product/PRODUCT_ID
```

---

## Step 4: Product Search & Pagination

### Goal: Search products and paginate results

**Files to modify:**

- `backend/src/controllers/product.controller.js`
- `backend/src/routes/product.route.js`

**New Endpoints:**

```
GET /api/products?page=1&limit=10                     - Paginated products
GET /api/products/search?q=keyword                     - Search products
GET /api/products?category=electronics&page=1         - Category + pagination
```

**Test with:**

```bash
# Paginated products
curl "http://localhost:5001/api/products?page=1&limit=5"

# Search
curl "http://localhost:5001/api/products/search?q=laptop"

# Category with pagination
curl "http://localhost:5001/api/products?category=Electronics&page=1&limit=10"
```

---

## Step 5: Order Management (Core)

### Goal: Create and manage orders

**Files to create:**

- `backend/src/models/order.model.js`
- `backend/src/controllers/order.controller.js`
- `backend/src/routes/order.route.js`

**Update:**

- `backend/src/server.js` - Add route

**API Endpoints:**

```
GET /api/orders                      - Get user orders
POST /api/orders                    - Create order
GET /api/orders/:id                 - Get order details
PATCH /api//orders/:id/status       - Update status (admin)
```

**Test with:**

```bash
# Create order
curl -X POST http://localhost:5001/api/orders \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{
    "items":[{"productId":"PROD_ID","quantity":2}],
    "shippingAddress":{"fullName":"John","address":"123 St","city":"Ktm","district":"Ktm","phone":"9841234567"},
    "paymentMethod":"cod"
  }'

# Get orders
curl http://localhost:5001/api/orders -H "Cookie: accessToken=YOUR_TOKEN"
```

---

## Step 6: Payment Integration (eSewa)

### Goal: Process payments via eSewa

**Files to create:**

- `backend/src/models/payment.model.js`
- `backend/src/controllers/payment.controller.js`
- `backend/src/routes/payment.route.js`

**Update:**

- `backend/src/server.js` - Add route
- `backend/src/.env` - Add eSewa credentials

**API Endpoints:**

```
POST /api/payments/esewa/initiate   - Start eSewa payment
POST /api/payments/esewa/verify     - Verify payment
GET  /api/payments/esewa/success    - Success callback
GET  /api/payments/esewa/failure    - Failure callback
```

**Test with:**

```bash
# Initiate payment (will redirect to eSewa)
curl -X POST http://localhost:5001/api/payments/esewa/initiate \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{"orderId":"ORDER_ID"}'
```

---

## Step 7: AI Recommendations

### Goal: AI-powered product suggestions

**Files to create:**

- `backend/src/controllers/recommendation.controller.js`
- `backend/src/routes/recommendation.route.js`

**Update:**

- `backend/src/server.js` - Add route
- `backend/src/.env` - Add Gemini API key

**API Endpoints:**

```
GET /api/recommendations    - Get AI recommendations
```

**Test with:**

```bash
curl http://localhost:5001/api/recommendations -H "Cookie: accessToken=YOUR_TOKEN"
```

---

## Step 8: Admin Analytics

### Goal: Dashboard statistics for admins

**Files to create:**

- `backend/src/controllers/analytics.controller.js`
- `backend/src/routes/analytics.route.js`

**Update:**

- `backend/src/server.js` - Add route

**API Endpoints:**

```
GET /api/analytics/overview   - Total orders, revenue, users
GET /api/analytics/sales     - Sales by period
GET /api/analytics/orders    - Order status breakdown
```

**Test with:**

```bash
curl http://localhost:5001/api/analytics/overview -H "Cookie: accessToken=ADMIN_TOKEN"
```

---

## Testing Checklist for Each Step

After completing each step:

- [ ] Create the model
- [ ] Create the controller with all functions
- [ ] Create the route
- [ ] Register route in server.js
- [ ] Test with curl/Postman
- [ ] Verify data in MongoDB
- [ ] Check Redis caching (if applicable)
- [ ] Move to next step

---

## File Structure After All Steps

```
backend/src/
├── models/
│   ├── user.model.js          (existing)
│   ├── product.model.js       (existing)
│   ├── coupon.model.js        (existing)
│   ├── order.model.js         (NEW - Step 5)
│   ├── address.model.js       (NEW - Step 1)
│   ├── wishlist.model.js      (NEW - Step 2)
│   ├── review.model.js        (NEW - Step 3)
│   └── payment.model.js       (NEW - Step 6)
├── controllers/
│   ├── auth.controller.js     (existing)
│   ├── product.controller.js  (existing + Step 4)
│   ├── cart.controller.js     (existing)
│   ├── coupon.controller.js   (existing)
│   ├── address.controller.js  (NEW - Step 1)
│   ├── wishlist.controller.js (NEW - Step 2)
│   ├── review.controller.js   (NEW - Step 3)
│   ├── order.controller.js    (NEW - Step 5)
│   ├── payment.controller.js  (NEW - Step 6)
│   ├── recommendation.controller.js (NEW - Step 7)
│   └── analytics.controller.js (NEW - Step 8)
├── routes/
│   ├── auth.route.js          (existing)
│   ├── product.route.js       (existing)
│   ├── cart.route.js          (existing)
│   ├── coupon.route.js        (existing)
│   ├── address.route.js       (NEW - Step 1)
│   ├── wishlist.route.js      (NEW - Step 2)
│   ├── review.route.js        (NEW - Step 3)
│   ├── order.route.js         (NEW - Step 5)
│   ├── payment.route.js       (NEW - Step 6)
│   ├── recommendation.route.js (NEW - Step 7)
│   └── analytics.route.js     (NEW - Step 8)
└── server.js                   (update)
```

---

## Recommended Order

| Step | Priority | Difficulty | Reason                  |
| ---- | -------- | ---------- | ----------------------- |
| 1    | First    | Easy       | Foundation for checkout |
| 2    | Second   | Easy       | Simple feature          |
| 3    | Third    | Easy       | Simple feature          |
| 4    | Fourth   | Medium     | Enhances existing       |
| 5    | Fifth    | Medium     | Core feature            |
| 6    | Sixth    | Hard       | Complex integration     |
| 7    | Seventh  | Medium     | Uses external API       |
| 8    | Eighth   | Easy       | Read-only data          |

**Total: 8 implementation steps**
