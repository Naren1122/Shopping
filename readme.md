# Bazar - E-commerce Platform

A comprehensive e-commerce platform built with modern technologies, featuring AI-powered recommendations and Nepal's popular eSewa payment gateway.

## Project Overview

This project is a full-featured e-commerce platform designed for the Nepali market. It includes secure authentication, shopping cart, order management, AI recommendations, and eSewa payment integration.

## Technology Stack

### Backend (Node.js & Express)

| Technology          | Purpose                                  |
| ------------------- | ---------------------------------------- |
| Node.js             | JavaScript runtime                       |
| Express.js          | Web framework for API                    |
| MongoDB & Mongoose  | NoSQL database and ODM                   |
| Redis (via Upstash) | Caching for performance                  |
| JWT                 | Authentication (access + refresh tokens) |
| bcryptjs            | Password hashing                         |
| Cloudinary          | Image management                         |
| Nodemailer          | Email notifications                      |
| eSewa API           | Payment gateway (Nepal)                  |
| Gemini AI           | AI product recommendations               |

### Frontend (Next.js)

| Technology    | Purpose          |
| ------------- | ---------------- |
| Next.js       | React framework  |
| Tailwind CSS  | Styling          |
| shadcn/ui     | UI components    |
| Recharts      | Analytics charts |
| Axios         | HTTP client      |
| Framer Motion | Animations       |

---

## Features

### Core E-commerce Features

- ✅ **Order Management** - Create, track, and manage orders with order status updates
- ✅ **Checkout Process** - Complete purchase flow from cart to order completion
- ✅ **Payment Integration** - eSewa payment gateway (Nepal's leading payment processor)
- ✅ **Order History** - Users can view past purchases with detailed order information

### User Features

- ✅ **Authentication** - Secure signup/login with JWT tokens
- ✅ **Profile Management** - View and edit profile information
- ✅ **Shopping Cart** - Real-time cart with persistent storage
- ✅ **Wishlist** - Add/remove products to wishlist, view wishlist
- ✅ **User Addresses** - Manage multiple shipping addresses (add, edit, delete, set default)
- ✅ **Order Tracking** - Real-time order status tracking for users

### Product Features

- ✅ **Product Browsing** - Browse and filter products by categories
- ✅ **Product Search** - Full-text search across products
- ✅ **Pagination** - Proper pagination for all product listings
- ✅ **Product Reviews/Ratings** - Users can rate and review products
- ✅ **Featured Products** - Highlight products on homepage
- ✅ **Product Recommendations** - AI-powered recommendations using Gemini API

### Admin Features

- ✅ **Admin Dashboard** - Centralized hub for store management
- ✅ **Analytics** - Sales analytics, order statistics, revenue tracking via Recharts
- ✅ **Product Management** - Full CRUD operations for products
- ✅ **Featured Toggle** - Highlight specific products on homepage

### Notifications

- ✅ **Email Notifications** - Order confirmation, status updates via Nodemailer

---

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile (protected)

### Products (`/api/products`)

- `GET /api/products` - Get all products (admin)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/recommendations` - Get AI recommendations
- `GET /api/products/search` - Search products
- `POST /api/products` - Create product (admin)
- `PATCH /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart (`/api/cart`)

- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update item quantity
- `DELETE /api/cart` - Remove item(s) from cart

### Wishlist (`/api/wishlist`)

- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

### Orders (`/api/orders`)

- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status (admin)

### Addresses (`/api/addresses`)

- `GET /api/addresses` - Get user addresses
- `POST /api/addresses` - Add address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address
- `PATCH /api/addresses/:id/default` - Set default address

### Payments (`/api/payments`)

- `POST /api/payments/esewa/initiate` - Initiate eSewa payment
- `POST /api/payments/esewa/verify` - Verify eSewa payment

### Reviews (`/api/reviews`)

- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review

### Coupons (`/api/coupons`)

- `GET /api/coupons` - Get user coupon
- `POST /api/coupons/validate` - Validate coupon

---

## Security Features

- JWT Authentication with Access and Refresh tokens
- HTTP-only cookies for token storage
- Password hashing with bcryptjs
- Protected routes with middleware
- CORS configuration
- Input validation

---

## Performance Optimization

- Redis caching for featured products and recommendations
- MongoDB indexing for fast queries
- Pagination for large datasets
- Cloudinary CDN for images

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Redis (Upstash)
- Cloudinary account
- eSewa merchant account

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

Create `.env` files with required variables (see `.env.example`)

### Running the Application

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

---

## License

ISC
