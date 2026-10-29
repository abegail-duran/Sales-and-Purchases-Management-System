# Sales and Purchases Management System – ESTRELLA FOOD HUB

A dedicated, standalone web application extracted from the ESTRELLA FOOD HUB ERP system. This application preserves the full end-to-end functionality, design aesthetic, and transaction integrity of the **Sales** and **Purchases** modules along with their supporting catalogs, stock movement logging, and business intelligence reporting.

---

## Key Highlights

- **Dedicated Architecture**: Completely decoupled from unrelated ERP modules (Expenses, general user admin, manual adjustment screens) into a focused standalone project.
- **Data Integrity & Concurrency**:
  - Point of Sale (POS) transactions deduct product inventory only upon committed database transactions.
  - Purchase order receiving increments stock and updates cost price inside transactions, with built-in guardrails against duplicate receiving.
  - Authorized sale voiding safely restores item inventory and records audit trail movements.
- **Consistent Tech Stack**:
  - **Frontend**: React 18, Vite, React Router DOM, Axios, Tailwind CSS, Recharts, React Toastify, Lucide React.
  - **Backend**: Node.js, Express.js, Sequelize ORM, JWT authentication, bcrypt.
  - **Database**: MySQL 8.0+ (Laragon / native MySQL).

---

## Retained Modules

### 1. Point of Sale (POS)
- Real-time product search by **Name**, **SKU**, and **Barcode**.
- Category filtering tabs and responsive grid.
- Dynamic cart with quantity increment/decrement, line item removal, and real-time total calculations.
- Validation for negative quantities, insufficient stock, and product expiration tracking.
- Multiple payment options: **Cash**, **GCash**, **Card**, and **Other**.
- Cash received and automatic change calculation.
- Modal receipt preview and formatted print stylesheet for thermal or paper printing.

### 2. Sales Management & History
- Complete historical record of all completed and voided sales transactions.
- Filter transactions by date range and payment method.
- View detailed breakdown of line items, unit prices, discounts, and cashier records.
- Role-authorized sale voiding with automatic inventory restoration and audit logging.

### 3. Purchases Management
- Create supplier purchase orders with multi-item line entries (product selection, quantity, unit cost).
- Automatic subtotal and grand total cost calculations.
- Purchase order status tracking (`pending`, `received`, `cancelled`).
- One-click purchase receiving workflow that atomically increments inventory quantities and updates cost price.
- Strict protection preventing duplicate receiving of the same order.

### 4. Supporting Modules
- **Products**: Manage item catalog, SKU, barcode, unit of measure, minimum/maximum stock thresholds, selling price, cost price, and status.
- **Suppliers**: Supplier directory with contact person, phone, email, and address.
- **Categories**: Product categorization supporting POS filtering.
- **Customers**: Walk-in customer default and customer assignment.
- **Inventory Movements**: Automatic backend ledger tracking every stock ingress (`purchase`, `adjustment`/void) and egress (`sale`).
- **Dashboard**: High-level KPI metrics (Today's Sales, Transactions, Inventory Value, Low Stock Alerts, Out of Stock Alerts, Daily Sales Chart, Top Selling Products, and Recent Sales).
- **Reports**: Filterable Sales Report, Purchase Orders Report, Inventory Valuation Report, and Financial Summary with Cost of Goods Sold (COGS) and profit margins.

---

## Excluded Modules

As specified in project requirements, unrelated ERP components have been omitted from navigation and routes:
- Expense management
- General user administration screens
- Manual inventory adjustment screens
- Generic non-sales reporting

---

## System Architecture

```text
sales-purchases-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Sequelize MySQL connection
│   │   ├── controllers/     # Sales, purchases, products, dashboard, reports, auth
│   │   ├── middleware/      # JWT auth and error handling
│   │   ├── models/          # Sequelize models and relational associations
│   │   ├── routes/          # API route definitions
│   │   ├── utils/           # Activity logger and transaction number generators
│   │   └── server.js        # Express application setup
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── test-system.js       # 32-case automated integration test suite
├── database/
│   ├── create-database.sql  # MySQL database definition
│   ├── migrate.js           # Sequelize table synchronization script
│   └── seed.js              # Initial users, categories, products, and suppliers
├── frontend/
│   ├── src/
│   │   ├── components/      # Header, Sidebar, Modal, ConfirmDialog, Loading
│   │   ├── context/         # AuthContext with JWT session management
│   │   ├── layouts/         # Main responsive application layout
│   │   ├── pages/           # Dashboard, POS, Sales, Purchases, Products, Suppliers, Reports, Login
│   │   ├── services/        # Axios API client with auth interceptors
│   │   └── utils/           # Currency and date formatters
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── README.md
└── SETUP_GUIDE.md
```

---

## Default User Accounts

After seeding the database (`npm run seed`), the following accounts are available:

| Role | Username | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full access to POS, Sales, Purchases, Products, Suppliers, Reports |
| **Manager** | `manager` | `manager123` | Full access to POS, Sales, Purchases, Products, Suppliers, Reports |
| **Cashier** | `cashier` | `cashier123` | POS, Sales History, Product Viewing |
| **Inventory Staff** | `inventory` | `inventory123` | Purchases, Purchase Receiving, Product Management |
