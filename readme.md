## Project Overview

This project was developed as a comprehensive guide to building a modern e-commerce platform. It covers everything from secure authentication and state management to payment processing and performance optimization using Redis.

## Technology Stack

### Backend (Node.js & Express)

MongoDB & Mongoose: NoSQL database and ODM for scalable data modeling.

Express.js: Fast, unopinionated web framework for the API layer.

Stripe: Industry-standard payment processing integration.

JWT (JSON Web Tokens): Secure authentication with Access and Refresh tokens.

Redis (via Upstash): High-performance in-memory data store for caching featured products.

Cloudinary: Cloud-based image management for product media.

bcryptjs: Secure password hashing.

Cookie-parser: Middleware for handling browser-based security cookies.

### Frontend (React.js)

Tailwind CSS: Utility-first CSS framework for modern, responsive UI design.

Zustand: Lightweight and fast state management.

Framer Motion: Smooth, high-performance animations and transitions.

Recharts: Dynamic data visualization for the Admin analytics dashboard.

React Router Dom: Declarative routing for single-page application navigation.

Axios: Promise-based HTTP client for API communication.

React Hot Toast: Sleek, customizable popup notifications.

## Key Features

### User Features

Secure Authentication: Robust login/signup flow with token-based persistence.

Product Discovery: Browse and filter products by categories.

Shopping Cart: Real-time cart management with persistent storage.

Checkout System: Integrated Stripe Checkout for secure credit card transactions.

Coupon System: Functional discount code application at checkout.

### Admin Features

Admin Dashboard: Centralized hub for store management.

Analytics & Data: Visual sales tracking and performance metrics via Recharts.

Product Management: Full CRUD operations (Create, Read, Update, Delete) for products.

Featured Toggle: Ability to highlight specific products on the homepage.

## Optimization & Security

Redis Caching: Drastically reduces database load by caching frequently accessed data.

Data Protection: Implements best practices for handling sensitive user info and payments.

Token Rotation: Uses refresh tokens to keep users logged in securely without frequent re-authentication.
