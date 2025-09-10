# Multi-Tenant LMS (India) – Full Stack

A complete, runnable full-stack Learning Management System tailored for multi-tenant use in India, with INR currency and mobile-first/OTP auth flows.

Project Structure
- backend: Node.js/Express API with PostgreSQL (pg), JWT auth, bcrypt, mocked OTP & payments
- frontend: React (Vite) with react-router-dom, axios, Tailwind CSS UI

Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Yarn or npm

1) Database Setup
- Create a PostgreSQL database and set DATABASE_URL accordingly (see backend/.env.example).
- Run the schema:
  - psql "$DATABASE_URL" -f backend/db/schema.sql

2) Backend Setup
- cd backend
- Copy .env.example to .env and fill values:
  - DATABASE_URL=postgres://user:pass@localhost:5432/lms
  - JWT_SECRET=your-strong-secret
- Install dependencies:
  - npm install
- Start the server:
  - npm run dev
- Default server: http://localhost:4000

3) Frontend Setup
- cd frontend
- Install dependencies:
  - npm install
- Start dev:
  - npm run dev
- Open: http://localhost:5173

Notes
- OTP is mocked (console.log) and stored in memory for 5 minutes.
- Payment is mocked on enrollment; a successful transaction is recorded.
- Tenant isolation: creator routes filter by user.tenant_id. Marketplace shows published courses across tenants.
- If registering a creator, you can pass a tenant payload to create a tenant on the fly.

Security
- Use strong JWT_SECRET. Never commit real secrets.
- Validate inputs, especially in production.

Tech
- Backend: express, pg, jsonwebtoken, bcrypt, cors, dotenv
- Frontend: React, react-router-dom, axios, Tailwind CSS
