# HunarHub

A MERN-stack digital marketplace connecting local micro-entrepreneurs
(tailors, cobblers, potters, artisans, small vendors) with customers —
storefronts, product listings, service requests, orders, and reviews.

## Stack

- **Frontend:** React 19, React Router, Context-based auth, Framer Motion, React Toastify
- **Backend:** Node.js, Express 5, MongoDB (Mongoose)
- **Auth:** JWT, bcrypt password hashing
- **Image uploads:** Cloudinary (via Multer)

## Project structure

```
HunarHub/
├── client/     # React frontend
└── server/     # Express API
```

## Prerequisites

- Node.js 18+
- A MongoDB connection string (MongoDB Atlas or local)
- A free [Cloudinary](https://cloudinary.com) account (for profile/product image uploads)

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* values in .env
npm run dev      # starts with nodemon on http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
# REACT_APP_API_BASE defaults to http://localhost:5000/api — fine for local dev
npm start         # starts on http://localhost:3000
```

## Environment variables

**`server/.env`**

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens — use a long random value |
| `NODE_ENV` | `development` or `production` |
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
| `CLIENT_URL` | Deployed frontend origin — used to restrict CORS in production |

**`client/.env`**

| Variable | Description |
|---|---|
| `REACT_APP_API_BASE` | Base URL of the backend API, e.g. `https://your-api.onrender.com/api` |

Never commit a real `.env` file — only `.env.example` (with placeholder values) belongs in the repo.

## Build

```bash
cd client && npm run build   # production build in client/build
cd server && npm start       # production server start
```

## Deployment notes

- Deploy `server/` to a Node host (Render, Railway, etc.) with the env vars above set in the host's dashboard, not committed to the repo.
- Deploy `client/` to a static host (Vercel, Netlify) with `REACT_APP_API_BASE` pointed at the deployed backend URL.
- Set `NODE_ENV=production` and `CLIENT_URL` on the backend so CORS only allows your deployed frontend origin.
- Make sure the MongoDB Atlas cluster's network access allows connections from your hosting provider (or `0.0.0.0/0` if using a dynamic-IP host).

## Key features

- Role-based accounts: customer, entrepreneur, admin
- Entrepreneurs create a storefront profile (pending admin approval) and list products
- Customers browse makers/products, place orders, submit service requests, leave reviews
- Admin dashboard for approving entrepreneurs and overseeing orders/requests
- Image uploads (profile photo, product photo) via Cloudinary
