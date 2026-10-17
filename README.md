# CareWell Pharmacy — Full-Stack MERN E-Commerce Platform

A production-style, dynamic Pharmacy E-Commerce application with a customer-facing Storefront, an Admin Suite, and a Node.js/Express backend powered by MongoDB and Mongoose.

Built with **JavaScript only** (No TypeScript).

---

## 🌟 Architecture & Highlights

```
pharmacy-ecommerce/
├── server/          # Node.js + Express + MongoDB REST API (Port 5000)
├── storefront/      # Customer-facing React + Vite + Tailwind CSS (Port 5173)
├── admin/           # Administrative React + Vite + Tailwind + Recharts (Port 5174)
├── package.json     # Root orchestration with concurrently
└── README.md
```

### Key Technical Pillars
- **Zero Hardcoded Catalog/Content**: Products, categories, brands, prices, banners, policy pages, FAQs, blog articles, navigation links, and store settings are 100% dynamic in MongoDB.
- **Role-Based Admin Access**: Super Administrator, Catalog Manager, Order Manager, and Licensed Pharmacist roles with JWT-based protection.
- **Pharmacist Prescription Queue**: Customer upload for Schedule H / Rx drugs with document viewer, review notes, and automated order confirmation/cancellation.
- **Multi-Step Checkout & Coupon Engine**: Address selection, coupon validation (`WELCOME10`, `SAVE50`, `HEALTH20`), tax calculation, and simulated payment gateway.
- **Real-Time Warehouse Inventory**: Threshold-based low stock warnings, batch tracking, and movement logs for inflows/outflows.

---

## ⚙️ Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://localhost:27017` or a MongoDB Atlas connection string.

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies

Run this from the repository root (`D:\Downloads\Pharma`):

```bash
# Install root orchestration tools
npm install

# Install all sub-application dependencies
npm run install:all
```

*(Alternatively, run `npm install` inside each of `server/`, `storefront/`, and `admin/`)*.

---

### 2. Environment Configuration

The backend environment file is located at `server/.env`. A template is provided in `server/.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/carewell_pharmacy
JWT_SECRET=carewell_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
DEMO_MODE=true
```

---

### 3. Seed Demo Data

Populate the database with demo products, categories, homepage sections, CMS policies, coupons, and demo accounts:

```bash
# Run idempotent seed script
npm run seed

# Or run fresh seed to wipe and recreate all collections
cd server && npm run seed:fresh
```

#### What Gets Seeded:
- **2 Admin Accounts** (Super Admin & Order Manager)
- **3 Demo Customers** (John Doe, Jane Smith, Social Demo)
- **10 Categories** (Medicines, Vitamins, Baby Care, Ayurvedic, etc.)
- **6 Brands** (Cipla, Sun Pharma, Himalaya, Johnson & Johnson, Dabur, Patanjali)
- **30 Realistic Pharmacy Products** with SKUs, MRPs, discounts, and Rx flags
- **8 Dynamic Homepage Sections** (Hero Banner, Categories, Best Sellers, Rx CTA, etc.)
- **3 Active Promotional Coupons** (`WELCOME10`, `SAVE50`, `HEALTH20`)
- **7 Policy Pages** (Privacy, Terms, Shipping, Returns, Prescription Policy, Disclaimer, About Us)
- **10 Categorized FAQs** & **3 Health Blog Posts**
- **Navigation Menus** for Header and all 3 Footer columns

---

### 4. Run All Applications Concurrently

From the root project directory:

```bash
npm run dev
```

This concurrently boots:
1. **Backend Server**: [http://localhost:5000](http://localhost:5000)
2. **Customer Storefront**: [http://localhost:5173](http://localhost:5173)
3. **Admin Management Suite**: [http://localhost:5174](http://localhost:5174)

*Or run them in separate terminals:*
```bash
# Terminal 1 - Backend API
cd server && npm run dev

# Terminal 2 - Customer Website
cd storefront && npm run dev

# Terminal 3 - Admin Panel
cd admin && npm run dev
```

---

## 🔑 Demo Credentials

### Admin Management Panel (`http://localhost:5174`)
| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@carewell.com` | `Admin@123` |
| **Order Manager** | `orders@carewell.com` | `Admin@123` |

*Quick autofill buttons are available on the Admin Login screen for one-click authentication.*

### Customer Storefront (`http://localhost:5173`)
| Customer | Email | Password |
|---|---|---|
| **John Doe** | `john@demo.com` | `Demo@123` |
| **Jane Smith** | `jane@demo.com` | `Demo@123` |
| **Social Login** | 1-Click "Sign in with Google" / "Sign in with Facebook" Sandbox |

---

## 🩺 End-to-End Workflows

### A. Ordering & Multi-Step Checkout
1. Browse medicines or use the instant search bar with live autocomplete.
2. Filter by Category, Brand, In-Stock status, or OTC vs Rx.
3. Add products to cart. If purchasing an Rx-required medicine, an alert prompts for doctor prescription upload.
4. Open the slide-out cart drawer or full cart page. Apply coupon `WELCOME10` for 10% discount.
5. Proceed to Checkout:
   - Select or add a delivery address.
   - Attach prescription document (if applicable).
   - Choose Demo Payment (UPI, Card, NetBanking, COD) with simulated success/failure testing.
6. Order is generated with an immutable order number (e.g. `CW26101733918`), inventory is decremented, and stock movement is logged.

### B. Pharmacist Prescription Verification
1. Login to Admin Panel (`admin@carewell.com`) and open **Prescriptions**.
2. Select an incoming prescription in the pending queue.
3. Review uploaded prescription images/documents.
4. Click **Approve Prescription** (with optional verification note):
   - Automatically transitions linked order status from `prescription_review_pending` to `confirmed`.
5. Or click **Reject Prescription** (specifying rejection reason):
   - Automatically updates order to `cancelled` and displays rejection reason to the customer.

### C. Order Dispatch & Courier Tracking
1. Open **Orders** in the Admin panel.
2. Update order workflow: `Confirmed` &rarr; `Processing` &rarr; `Packed` &rarr; `Shipped` &rarr; `Delivered`.
3. Add courier partner (e.g., *Blue Dart*), tracking AWB number, and URL.
4. Customer sees live status progress and tracking link on their **My Orders** tracking page.

### D. Dynamic Content & Brand Customization
1. **Homepage Builder**: Reorder sections with Move Up/Down buttons, toggle section visibility, or edit hero banner text and CTA links.
2. **CMS Pages**: Edit policy pages (Refunds, Privacy, Terms) via the rich HTML editor. Updates appear immediately at `/pages/:slug`.
3. **Store Settings**: Change primary theme color (`#10b981`), announcement banner message, helpline phone, or free shipping threshold. Changes reflect instantly on the storefront.
4. **Navigation Menus**: Add, reorder, or update links in the header and footer columns without touching frontend code.

---

## 🧪 Testing & Verification

Run the full end-to-end integration test suite against the live MongoDB instance:

```bash
cd server
node test_e2e_integration.js
```

### Verified Test Suite Covers:
- `✓` API Health check endpoint (`/api/v1/health`)
- `✓` Super Admin authentication & token generation
- `✓` Customer authentication & session management
- `✓` Dynamic product catalog filtering & pagination
- `✓` Cart operations & server-side coupon validation
- `✓` Checkout, order placement, and inventory decrement
- `✓` Admin order status transitions & courier tracking
- `✓` Dynamic store settings update & storefront reflection
- `✓` Admin dashboard aggregation queries & live metrics
- `✓` Production build verification (`npm run build` on both Vite apps: 0 errors)

---

## 📄 License
MIT License. Built for CareWell Pharmacy MERN Stack Demonstration.
