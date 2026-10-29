# Setup & Installation Guide

This guide walks you through setting up and running the **Sales and Purchases Management System – ESTRELLA FOOD HUB** on Windows (Laragon / native MySQL).

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **MySQL**: 8.0+ (running via Laragon or standard MySQL service on port 3306)
- **Package Manager**: `npm`

---

## 2. Database Setup

1. Start **MySQL** in Laragon (or verify MySQL service is running).
2. The database name for this standalone system is: `estrella_sales_purchases`.
3. If you want to create it manually in HeidiSQL, phpMyAdmin, or MySQL CLI:
   ```sql
   CREATE DATABASE IF NOT EXISTS estrella_sales_purchases CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   *(Note: You can also run the database script `database/create-database.sql`)*

---

## 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd sales-purchases-system/backend
   ```
2. Verify or create your `.env` file (copy from `.env.example` if needed):
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=estrella_sales_purchases

   PORT=5000
   NODE_ENV=development

   JWT_SECRET=sales-purchases-secret-key-estrellafoodhub-2026
   JWT_EXPIRE=7d

   FRONTEND_URL=http://localhost:5173
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run migrations to create all database tables:
   ```bash
   npm run migrate
   ```
5. Seed initial data (default users, products, categories, suppliers, and settings):
   ```bash
   npm run seed
   ```
6. Start the backend development server:
   ```bash
   npm run dev
   # Or for production:
   npm start
   ```
   The backend API will run at `http://localhost:5000/api`.

---

## 4. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd sales-purchases-system/frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 5. Verification & Testing

To execute the automated 32-case end-to-end integration test suite verifying sales deductions, void restorations, purchase order receiving, and edge-case handling:

```bash
cd sales-purchases-system/backend
node test-system.js
```

All 32 tests will run against the real API and database and output detailed pass/fail validation.
