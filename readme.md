<div align="center">

# 🛒 Bazar - E-commerce Platform

**A modern, full-stack e-commerce platform tailored for the Nepali market**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.3.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![License](https://img.shields.io/badge/License-ISC-green?style=for-the-badge)](LICENSE)

[![GitHub stars](https://img.shields.io/github/stars/yourusername/bazar?style=social)](https://github.com/yourusername/bazar)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/bazar?style=social)](https://github.com/yourusername/bazar/network)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/bazar)](https://github.com/yourusername/bazar/issues)

[![Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://bazar-demo.com)
[![Documentation](https://img.shields.io/badge/Docs-Latest-blue?style=for-the-badge)](https://docs.bazar.com)

---

**Bazar** is a comprehensive full-stack e-commerce platform built with cutting-edge technologies, featuring AI-powered product recommendations and seamless integration with Nepal's popular eSewa payment gateway. Designed with scalability and user experience in mind, it provides a complete solution for online businesses in Nepal.

[Features](#-features) • [Tech Stack](#-technology-stack) • [Getting Started](#-getting-started) • [API Docs](#-api-endpoints)

---

## 📋 Table of Contents

- [Project Description](#-project-description)
- [Technology Stack](#-technology-stack)
  - [Backend](#backend-nodejs--express)
  - [Frontend](#frontend-nextjs)
- [Features](#-features)
  - [Core E-commerce](#core-e-commerce-features)
  - [User Features](#user-features)
  - [Product Features](#product-features)
  - [Admin Features](#admin-features)
  - [Notifications](#notifications)
- [API Endpoints](#-api-endpoints)
- [Security Features](#-security-features)
- [Performance Optimization](#-performance-optimization)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

</div>

---

<div align="center">

## 📖 Project Description

**Bazar** is a full-featured e-commerce platform specifically designed for the Nepali market. The application provides a seamless online shopping experience with secure user authentication, shopping cart functionality, order management, AI-powered product recommendations, and integrated eSewa payment processing.

### 🎯 Key Highlights

| Feature | Description |
|---------|-------------|
| 🛍️ **Complete E-commerce Solution** | From product browsing to order completion |
| 🤖 **AI Recommendations** | Gemini-powered personalized product suggestions |
| 💳 **eSewa Integration** | Nepal's leading payment gateway |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |
| 📊 **Admin Dashboard** | Comprehensive analytics and product management |

</div>

---

<div align="center">

## 🛠️ Technology Stack

### Backend (Node.js & Express)

| Technology    | Version   | Purpose                                     |
|:--------------|:---------:|:--------------------------------------------|
| ![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=node.js&logoColor=white) | 18+       | JavaScript runtime environment              |
| ![Express](https://img.shields.io/badge/Express-^5.2.1-000000?style=flat&logo=express&logoColor=white) | ^5.2.1    | Web framework for building REST APIs        |
| ![MongoDB](https://img.shields.io/badge/MongoDB-^9.3.0-47A248?style=flat&logo=mongodb&logoColor=white) | ^9.3.0    | NoSQL database with Mongoose ODM            |
| ![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=flat&logo=redis&logoColor=white) | (Upstash) | Caching layer for performance optimization  |
| ![JWT](https://img.shields.io/badge/JWT-^9.0.3-000000?style=flat) | ^9.0.3    | Authentication with access & refresh tokens |
| ![bcryptjs](https://img.shields.io/badge/bcryptjs-^3.0.3-000000?style=flat) | ^3.0.3    | Secure password hashing                     |
| ![Cloudinary](https://img.shields.io/badge/Cloudinary-^2.9.0-3448C5?style=flat&logo=cloudinary&logoColor=white) | ^2.9.0    | Cloud-based image management & CDN          |
| ![Nodemailer](https://img.shields.io/badge/Nodemailer-^8.0.2-000000?style=flat) | ^8.0.2    | Email notifications & transactional emails  |
| ![Multer](https://img.shields.io/badge/Multer-^2.1.1-000000?style=flat) | ^2.1.1    | File upload handling                        |
| ![CORS](https://img.shields.io/badge/CORS-^2.8.6-000000?style=flat) | ^2.8.6    | Cross-origin resource sharing               |
| ![Cookie Parser](https://img.shields.io/badge/Cookie_Parser-^1.4.7-000000?style=flat) | ^1.4.7    | Cookie parsing for sessions                 |
| ![dotenv](https://img.shields.io/badge/dotenv-^17.3.1-000000?style=flat) | ^17.3.1   | Environment variable management             |

#### 🔌 External Integrations

| Integration | Purpose |
|:-----------|:--------|
| ![eSewa](https://img.shields.io/badge/eSewa-Payment-green?style=flat) | Nepal's leading payment gateway |
| ![Gemini](https://img.shields.io/badge/Gemini-AI-blue?style=flat) | AI-powered product recommendations |
| ![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-3448C5?style=flat&logo=cloudinary&logoColor=white) | Image storage and delivery |

---

### Frontend (Next.js)

| Technology      | Version  | Purpose                               |
|:---------------|:--------:|:--------------------------------------|
| ![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?style=flat&logo=next.js&logoColor=white) | 16.1.6   | React framework with SSR/SSG          |
| ![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat&logo=react&logoColor=white) | 19.2.3   | UI library for building interfaces    |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind-^4-06B6D4?style=flat&logo=tailwindcss&logoColor=white) | ^4       | Utility-first CSS framework           |
| ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-^4.0.8-000000?style=flat) | ^4.0.8   | Accessible UI component library       |
| ![Recharts](https://img.shields.io/badge/Recharts-^2.15.4-000000?style=flat) | ^2.15.4  | Data visualization & analytics charts |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-^12.38.0-000000?style=flat) | ^12.38.0 | Animation library                     |
| ![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-^2.11.2-764ABC?style=flat&logo=redux&logoColor=white) | ^2.11.2  | State management                      |
| ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-^7.71.2-EC5990?style=flat) | ^7.71.2  | Form handling with validation         |
| ![Zod](https://img.shields.io/badge/Zod-^4.3.6-3E67C1?style=flat) | ^4.3.6   | Schema validation                     |
| ![Lucide React](https://img.shields.io/badge/Lucide-^0.577.0-000000?style=flat) | ^0.577.0 | Icon library                          |
| ![date-fns](https://img.shields.io/badge/date--fns-^4.1.0-000000?style=flat) | ^4.1.0   | Date manipulation utilities           |
| ![Axios](https://img.shields.io/badge/Axios-Integration-007ACC?style=flat&logo=axios&logoColor=white) | -        | HTTP client (via API utilities)       |

</div>

---

<div align="center">

## ✨ Features

### 🛍️ Core E-commerce Features

| Feature | Description |
|:--------|:------------|
| 📦 Order Management | Create, track, and manage orders with real-time status updates |
| 🛒 Checkout Process | Complete purchase flow from cart to order completion |
| 💳 Payment Integration | eSewa payment gateway (Nepal's leading payment processor) |
| 📋 Order History | Users can view past purchases with detailed order information |
| 🛒 Shopping Cart | Real-time cart with persistent storage |
| ❤️ Wishlist | Save products for later purchase |

### 👤 User Features

| Feature | Description |
|:--------|:------------|
| 🔐 Authentication System | Secure signup/login with JWT tokens, access & refresh tokens, password reset, HTTP-only cookies |
| 👤 Profile Management | View and edit profile information |
| 📍 Address Management | Multiple shipping addresses (add, edit, delete, set default) |
| 📦 Order Tracking | Real-time order status tracking |
| ❤️ Wishlist Management | Add/remove products to wishlist |

### 🎯 Product Features

| Feature | Description |
|:--------|:------------|
| 🔍 Product Browsing | Browse and filter products by categories |
| 🔎 Product Search | Full-text search across products |
| 📄 Pagination | Efficient pagination for all product listings |
| ⭐ Product Reviews/Ratings | Users can rate and review products |
| ⭐ Featured Products | Highlight products on homepage |
| 🤖 AI Recommendations | Gemini-powered personalized product suggestions |
| 📂 Product Categories | Organized category structure |

### 👨‍💼 Admin Features

| Feature | Description |
|:--------|:------------|
| 📊 Admin Dashboard | Centralized hub for store management |
| 📈 Analytics Dashboard | Sales analytics, order statistics, revenue tracking |
| 📦 Product Management | Full CRUD operations for products |
| ⭐ Featured Toggle | Highlight specific products on homepage |
| 📋 Order Management | View and update order statuses |

### 🔔 Notifications

| Feature | Description |
|:--------|:------------|
| 📧 Email Notifications | Order confirmation, status updates via Nodemailer |

</div>

---

<div align="center">

## 🔌 API Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------|
| `POST` | `/api/auth/signup` | User registration | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `POST` | `/api/auth/logout` | User logout | ✅ |
| `POST` | `/api/auth/refresh-token` | Refresh access token | ❌ |
| `POST` | `/api/auth/forgot-password` | Request password reset | ❌ |
| `POST` | `/api/auth/reset-password` | Reset password with token | ❌ |
| `GET` | `/api/auth/profile` | Get user profile | ✅ |

### 📦 Products (`/api/products`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------|
| `GET` | `/api/products` | Get all products | ❌ |
| `GET` | `/api/products/featured` | Get featured products | ❌ |
| `GET` | `/api/products/category/:category` | Get products by category | ❌ |
| `GET` | `/api/products/recommendations` | Get AI recommendations | ✅ |
| `GET` | `/api/products/search` | Search products | ❌ |
| `POST` | `/api/products` | Create product | ✅ Admin |
| `PATCH` | `/api/products/:id` | Update product | ✅ Admin |
| `DELETE` | `/api/products/:id` | Delete product | ✅ Admin |

### 🛒 Cart (`/api/cart`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------|
| `GET` | `/api/cart` | Get cart items | ✅ |
| `POST` | `/api/cart` | Add item to cart | ✅ |
| `PUT` | `/api/cart/:id` | Update item quantity | ✅ |
| `DELETE` | `/api/cart` | Remove item(s) from cart | ✅ |

### ❤️ Wishlist (`/api/wishlist`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------|
| `GET` | `/api/wishlist` | Get wishlist | ✅ |
| `POST` | `/api/wishlist` | Add to wishlist | ✅ |
| `DELETE` | `/api/wishlist/:id` | Remove from wishlist | ✅ |

### 📋 Orders (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------|
| `GET` | `/api/orders` | Get user orders | ✅ |
| `POST` | `/api/orders` | Create order | ✅ |
| `GET` | `/api/orders/:id` | Get order details | ✅ |
| `PATCH` | `/api/orders/:id/status` | Update order status | ✅ Admin |

### 📍 Addresses (`/api/addresses`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------|
| `GET` | `/api/addresses` | Get user addresses | ✅ |
| `POST` | `/api/addresses` | Add address | ✅ |
| `PUT` | `/api/addresses/:id` | Update address | ✅ |
| `DELETE` | `/api/addresses/:id` | Delete address | ✅ |
| `PATCH` | `/api/addresses/:id/default` | Set default address | ✅ |

### 💳 Payments (`/api/payments`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------|
| `POST` | `/api/payments/esewa/initiate` | Initiate eSewa payment | ✅ |
| `POST` | `/api/payments/esewa/verify` | Verify eSewa payment | ✅ |

### ⭐ Reviews (`/api/reviews`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------|
| `GET` | `/api/reviews/product/:productId` | Get product reviews | ❌ |
| `POST` | `/api/reviews` | Create review | ✅ |

### 🎟️ Coupons (`/api/coupons`)

| Method | Endpoint | Description | Auth Required |
|:-------|:---------|:------------|:-------------|
| `GET` | `/api/coupons` | Get user coupons | ✅ |
| `POST` | `/api/coupons/validate` | Validate coupon | ✅ |

---

<div align="center">

## 🔒 Security Features

| Feature | Description |
|:--------|:------------|
| 🔐 JWT Authentication | Access and refresh token mechanism |
| 🍪 HTTP-only Cookies | Secure token storage |
| 🔒 Password Hashing | bcryptjs for secure password storage |
| 🛡️ Protected Routes | Middleware-based route protection |
| 🌐 CORS Configuration | Controlled cross-origin access |
| ✅ Input Validation | Zod schema validation |
| 🚦 Rate Limiting | Protection against abuse |

---

## 🚀 Performance Optimization

| Feature | Description |
|:--------|:------------|
| ⚡ Redis Caching | Cached featured products and recommendations |
| 📊 MongoDB Indexing | Optimized queries for fast retrieval |
| 📄 Pagination | Efficient handling of large datasets |
| 🖼️ Cloudinary CDN | Fast image delivery |
| 🖥️ Server-Side Rendering | Next.js SSR for improved SEO and performance |
| 📦 Code Splitting | Automatic code splitting in Next.js |

</div>

---

<div align="center">

## 🏁 Getting Started

### 📋 Prerequisites

Before running the application, ensure you have the following installed:

| Requirement | Version/Details | Link |
|:-----------|:---------------|:-----|
| Node.js | 18 or higher | [Download](https://nodejs.org/) |
| MongoDB | Local or Atlas | [Download](https://www.mongodb.com/try/download/community) |
| Redis | Upstash account | [Get Started](https://upstash.com/) |
| Cloudinary | Account | [Sign Up](https://cloudinary.com/) |
| eSewa | Merchant account | [Register](https://esewa.com.np/) |

### 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd bazar

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 🔐 Environment Variables

Create `.env` files in both `backend` and `frontend` directories:

#### Backend Configuration (`backend/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bazar

# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

# eSewa Payment Configuration
ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret
ESEWA_TEST_MODE=true

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key
```

#### Frontend Configuration (`frontend/.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_RECOMMENDATIONS=true
```

### 🚀 Running the Application

```bash
# Start backend development server
cd backend
npm run dev

# Start frontend development server (in a new terminal)
cd frontend
npm run dev
```

#### 🌐 Access Points

| Service | URL |
|:--------|:----|
| Frontend Application | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| API Documentation | http://localhost:5000/api-docs |

</div>

---

## 📂 Project Structure

```
bazar/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Custom middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── lib/             # Utilities (db, redis, cloudinary, email)
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── app/                  # Next.js App Router
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── checkout/        # Checkout flow
│   │   ├── products/        # Product pages
│   │   └── ...              # Other pages
│   ├── components/          # React components
│   │   └── ui/              # shadcn/ui components
│   ├── package.json
│   └── .env.local.example
│
└── README.md
```

---

## 📄 License

This project is licensed under the **ISC License**.

---

<p align="center">
  Built with ❤️ for the Nepali e-commerce community
</p>
