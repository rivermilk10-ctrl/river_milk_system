# River Milk System 🥛 (v1.1)

A modern MERN-stack application designed for managing milk distribution, daily deliveries, inventory tracking, dynamic pricing, advanced monthly billing, comprehensive reporting, and WhatsApp notifications. 

## Features 🚀

### 🌟 New in v1.1
- **Customer Management & Profiles:** Auto-generated unique Customer Numbers (e.g. RM001), dual phone numbers, Home Delivery / Shop Pickup categories, and a full chronological ledger view.
- **Dynamic Product Catalog:** Admin-managed catalog for Milk Types (Cow, Buffalo, Full Cream) and Dairy Products (Paneer, Ghee, Curd, Lassi). No more hardcoded pricing!
- **Inventory Tracking:** Real-time stock management for dairy products with visual bars, quick ±1 adjustments, and low-stock dashboard alerts.
- **Unified Billing System:** Create combined bills for both Milk deliveries and Dairy purchases. Support for Cash, Credit, and Partial payments.
- **Credit & Payment System:** Track cumulative outstanding balances per customer. Record standalone payments against credit.
- **Advanced Reports (Excel & PDF):** 5 dedicated report views — Milk Sales, Dairy Sales, Pending Payments, Inventory, and Customer Ledger. Export seamlessly to PDF or Excel (.xlsx).
- **Global Search:** Always-on header search bar to instantly find any customer by name, number, or phone.
- **Delivery Workflow Upgrades:** Switch milk types on-the-fly at the time of delivery. Delivery cards now display both phone numbers and the exact customer address.

### 🛡️ Core Features
- **Authentication:** Role-based access control (Admin/Owner and Distributor/Staff).
- **Daily Deliveries Dashboard:**
  - Track deliveries by date with calendar controls.
  - On-the-fly milk quantity overrides for customers.
  - Responsive, touch-friendly UI for mobile/tablet usage.
- **Multilingual Support:** English and Marathi translation support built-in.
- **WhatsApp Integration:** Auto-compose and send billing details to customers in a single click.

---

## Tech Stack 🛠️

- **Frontend:** React (Vite), Lucide Icons, Date-fns, jsPDF, SheetJS (xlsx), i18next (translation support).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB / MongoDB Atlas (Mongoose).

---

## Local Setup & Installation 💻

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- A running local MongoDB instance or a MongoDB Atlas URI.

### 1. Configure Environment Variables
Create a `.env` file inside the `server/` directory and configure the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

### 2. Install Dependencies
Run the following commands in the project directories:

**For the Backend Server:**
```bash
cd server
npm install
```

**For the Frontend Client:**
```bash
cd client
npm install
```

---

## Initialization & Seeding 🗄️

### 1. First Time Setup (Seed Admins)
To seed the initial admin/owner details (`9999999999` / `admin123`) into an empty database, run:
```bash
cd server
node seed.js
```

### 2. Upgrading to v1.1 (Migration)
If upgrading from v1.0, you must run the migration script to assign customer numbers to existing users and seed the default product catalog:
```bash
cd server
node migrate.js
```

---

## Running the Project Locally ⚙️

You will need two terminal windows to run both services:

**Terminal 1 (Backend):**
```bash
cd server
npm start
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

---

## Deployment 🌐

### Backend (Render / Heroku)
1. Set up a Web Service pointing to the root repository or specifically the `server` directory.
2. In Render, set the **Build Command** to `npm install`.
3. Set the **Start Command** to `node server.js` (inside the `server` subdirectory).
4. Configure the Environment Variable `MONGODB_URI` in the provider's dashboard.

### Frontend (Vercel)
1. Create a project pointing to the `client` directory.
2. Set the Framework Preset to **Vite**.
3. Set the **Build Command** to `npm run build`.
4. Set the **Output Directory** to `dist`.
5. Configure Environment Variables:
   - `VITE_API_URL`: The URL of your deployed backend (e.g. `https://your-backend.onrender.com`).
