# 🛒 Bazar — Full‑Stack E‑commerce Platform (Nepal)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.3.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![License](https://img.shields.io/badge/License-ISC-green?style=for-the-badge)](LICENSE)



> A production‑style e‑commerce app for the Nepali market: catalog → cart → checkout → eSewa payment → order management, with JWT auth, security hardening, and AI‑based recommendations.

## ✨ Live Demo & Walkthrough

- **Website:** https://shopping-blue-two.vercel.app/
- **Video:** https://youtu.be/wvtIC3Oc5s

## 🧾 Why Bazar (HR/Recruiter view)

Bazar demonstrates:

- **End‑to‑end engineering**: backend + frontend + database + caching + third‑party integrations.
- **Security by design**: HTTP‑only cookies, JWT access/refresh flow, password reset tokens, input validation.
- **Performance focus**: Redis caching, indexing strategies, pagination, CDN image delivery.
- **Real business readiness**: Nepal‑specific payment integration via **eSewa**.
- **AI feature integration**: Gemini‑powered product recommendations.

## 🏗️ Tech Stack

### Backend
- Node.js + Express (REST APIs)
- MongoDB + Mongoose
- Redis (Upstash) for caching
- JWT auth (access + refresh tokens)
- Cloudinary for image hosting
- Nodemailer for transactional emails
- Multer for uploads

### Frontend
- Next.js (App Router)
- Tailwind CSS + shadcn/ui
- Redux Toolkit + React Hook Form + Zod
- Charts (Recharts), animations (Framer Motion)

## 📦 Key Features

### Customer experience
- **Product catalog**: categories, featured items, ratings/reviews
- **Search & browse**: fast product browsing with pagination
- **Cart & wishlist**: persistent shopping flows
- **Checkout & orders**: create orders and track status
- **eSewa payments**: initiate + verify payment
- **Recommendations**: AI suggestions using Gemini

### User/account
- Sign up/login/logout with JWT
- Profile management
- Address book (multi‑address + default)
- Password reset and password change flows

### Admin experience
- Admin dashboard + analytics
- Product CRUD, featured toggle
- Order status management

### Notifications
- Email notifications for confirmation and order updates

## 🔐 Security Features (highlights)

- **JWT**: access + refresh tokens
- **HTTP‑only cookies** for token storage
- **Password protection**: hashing + secure password reset tokens
- **Input validation** with **Zod**
- **Route protection** with middleware
- **CORS** configured for controlled access
- **Rate limiting** (abuse protection)

## 🚀 Performance Optimization

- **Redis caching** (featured/recommendations)
- **MongoDB indexes** for faster reads
- **Pagination** for large lists
- **Cloudinary CDN** for faster image delivery
- **SSR** + Next.js performance features

## 🧰 API Overview

Base: `http://localhost:5000/api`

### Auth (`/api/auth`)
- `POST /signup`, `POST /login`, `POST /logout`
- `POST /refresh-token`
- `POST /forgot-password`, `POST /reset-password`
- `GET /profile`

### Products (`/api/products`)
- `GET /` (list), `GET /featured`, `GET /category/:category`
- `GET /recommendations` (AI)
- `GET /search`
- Admin: `POST /`, `PATCH /:id`, `DELETE /:id`

### Cart (`/api/cart`)
- `GET /`, `POST /`, `PUT /:id`, `DELETE /`

### Wishlist (`/api/wishlist`)
- `GET /`, `POST /`, `DELETE /:id`

### Orders (`/api/orders`)
- `GET /`, `POST /`, `GET /:id`
- Admin: `PATCH /:id/status`

### Payments (`/api/payments`)
- `POST /esewa/initiate`
- `POST /esewa/verify`

### Reviews (`/api/reviews`)
- `GET /product/:productId`
- `POST /` (create)

### Coupons (`/api/coupons`)
- `GET /` (user coupons)
- `POST /validate`

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (Upstash)
- Cloudinary account
- eSewa merchant account

### Installation

```bash
git clone <repository-url>
cd bazar

cd backend
npm install

cd ../frontend
npm install
```

### Environment Variables

Create `.env` in **backend** and `.env.local` in **frontend**.

#### backend/.env
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/bazar

UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret
ESEWA_TEST_MODE=true

GEMINI_API_KEY=your_gemini_api_key

# Optional: to register admin users
ADMIN_SECRET_KEY=optional_admin_secret
```

#### frontend/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_RECOMMENDATIONS=true
```

### Run locally

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

## 📁 Project Structure

```text
bazar/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth/validation/rate limiting
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── lib/            # DB/redis/cloudinary/email utilities
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── app/                # Next.js pages (App Router)
    ├── components/
    ├── package.json
    └── .env.local.example
```


<p align="center">Built with ❤️ for the Nepali e‑commerce community</p>

