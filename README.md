# Ustaad.pk — AI-Powered Local Service Marketplace

<div align="center">
  <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='%23059669'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>" alt="Ustaad.pk Logo" />
  <h1>Ustaad.pk</h1>
  <p><strong>Pakistan's Premier Local Service Marketplace & Smart Matching Platform</strong></p>
  <p>Connecting households with verified electricians, plumbers, AC technicians, home tutors, painters, and carpenters across Lahore, Karachi, Islamabad, and beyond.</p>
</div>

---

## 🌟 Key Features

### 1. 🤖 Algorithmic Smart Matching (No Paid AI API Needed)
Implements an intelligent weighted scoring engine (`/server/utils/matching.js`):
$$\text{Score} = (\text{Rating Normalized} \times 0.4) + (\text{Proximity Score} \times 0.3) + (\text{Price Match Score} \times 0.3)$$
- **Rating Normalized**: Provider's average rating $\div\ 5.0$.
- **Proximity Score**: Calculated via the **Haversine Distance Formula** between customer GPS/city coordinates and provider location.
- **Price Match Score**: Evaluates how closely the provider's pricing tier fits within the customer's stated budget.
- Returns top 3–5 ranked Ustaads with full percentage breakdowns and distance metrics.

### 2. ⚡ Real-Time Socket.io Synchronization
- Instant booking notifications delivered to providers upon customer request.
- Live status tracking (`pending` → `accepted` → `completed` → `cancelled`) updating customer dashboards in real-time without page reloads.

### 3. 🛡️ Role-Based Architecture & Anti-Fraud Safety
- **JWT + bcrypt** role authorization for `customer`, `provider`, and `admin`.
- **Anti-Fraud Review Guard (`/server/utils/reviewSafety.js`)**: Automatically flags repeat reviews ($\ge 3$ reviews for the same provider within a short window) for administrator inspection before factoring them into the provider's public rating.

### 4. 👥 Role Portals
- **Customer Portal**: Smart search, interactive category catalog, appointment scheduling, real-time status tracker, and post-service star reviews.
- **Provider Portal**: Earnings tracker, incoming job acceptance desk, weekly availability calendar, and profile & pricing tier manager.
- **Admin Desk**: Provider verification approval/rejection, global booking oversight, flagged review moderation, and category revenue analytics.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Socket.io-client, Axios, React Router 7
- **Backend**: Node.js, Express, Socket.io, Mongoose ODM, JWT, bcryptjs, Morgan
- **Database**: MongoDB Atlas (Connection configured in `.env`)
- **Localization**: Pakistani Rupee (PKR), Pakistani city coordinates (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, etc.)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Installation
Install dependencies in both client and server:
```bash
# In /server
cd server
npm install

# In /client
cd ../client
npm install
```

### 3. Seed Sample Data
Pre-populates verified Pakistani service providers, demo users, bookings, and test reviews:
```bash
cd server
npm run seed
```

### 4. Run Development Servers
Start backend API (Port 5000) and frontend (Port 5173):

```bash
# Terminal 1 - Backend Server
cd server
npm run dev

# Terminal 2 - Frontend Client
cd client
npm run dev
```

Visit: `http://localhost:5173`

---

## 🔑 Demo Accounts (Pre-Seeded)

Use the built-in **1-Click Demo Switcher** bar at the top of the navbar or log in manually:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@ustaad.pk` | `customer123` | Hamza Tariq (Lahore) — Bookings & Reviews |
| **Provider** | `rashid.electric@ustaad.pk` | `provider123` | Rashid Electric (Verified Ustaad) |
| **Admin** | `admin@ustaad.pk` | `admin123` | Platform Admin Desk & Verifications |

---

## ⚠️ Manual Steps Required by User

Before deploying Ustaad.pk to production, the following manual steps and third-party setups are required:

1. **MongoDB Atlas Production Cluster**:
   - The development MongoDB URI is pre-configured in `server/.env`. For dedicated production environments, create a dedicated database user with IP whitelisting configured in MongoDB Atlas.

2. **JWT Secret Key (`JWT_SECRET`)**:
   - Replace the default placeholder `JWT_SECRET` in `server/.env` with a cryptographically secure 256-bit random string before production release.

3. **Payment Gateway Integration (Optional Future Step)**:
   - To enable automated online payments (JazzCash, Easypaisa, PayFast), sign up for a Pakistani merchant account and insert merchant credentials in `.env`. The system currently supports direct cash on completion and verified price confirmation.

4. **Production Hosting & Custom Domain**:
   - Deploy backend to Railway / Render / DigitalOcean.
   - Deploy frontend to Vercel / Netlify with `VITE_API_URL` pointing to the backend domain.
   - Point your custom domain (e.g., `ustaad.pk`) via DNS A/CNAME records.

5. **Google Maps API Key (Optional)**:
   - As requested, Ustaad.pk currently uses high-precision **Haversine coordinate calculations with HTML5 Geolocation and city presets** with zero paid API costs. If full interactive satellite street mapping is desired later, create a Google Cloud Maps JavaScript API key.

---

<div align="center">
  <p>Crafted for Pakistan's skilled workforce • <strong>Ustaad.pk</strong></p>
</div>
