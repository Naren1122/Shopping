// Centralized API configuration
// In production, set NEXT_PUBLIC_API_URL in Vercel environment variables
// e.g., NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default API_URL;
