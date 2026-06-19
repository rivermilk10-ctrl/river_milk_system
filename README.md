# River Milk System 🥛

A modern MERN-stack application designed for managing milk distribution, daily deliveries, pricing settings, automated monthly billing, PDF report exports, and WhatsApp bill notifications.

## Features 🚀

- **Authentication:** Role-based access control (Admin/Owner and Distributor/Staff).
- **Daily Deliveries Dashboard:**
  - Track deliveries by date with calendar controls.
  - On-the-fly milk quantity overrides for customers.
  - Responsive, touch-friendly UI for mobile/tablet usage.
- **Billing & Reports:**
  - Automated monthly billing calculation based on global price settings.
  - One-click **Export to PDF** button.
  - **WhatsApp Integration:** Auto-compose and send billing details to customers in a single click.
- **Multilingual Support:** English and Marathi translation support built-in.

---

## Tech Stack 🛠️

- **Frontend:** React (Vite), Lucide Icons, Date-fns, jsPDF, jsPDF-AutoTable, i18next (translation support).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB / MongoDB Atlas.

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

## Seeding the Database 🗄️

To seed the initial admin/owner details (`9999999999` / `admin123`) into your database, run:
```bash
cd server
node seed.js
```
*Note: The script contains a built-in DNS patch to resolve MongoDB Atlas SRV URLs correctly on Windows hosts.*

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
