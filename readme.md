# Movie Ticket Booking Platform

A full-stack web application for reserving movie tickets.

## Tech Stack
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB

## State Management Logic
- **Redux Toolkit (RTK):** Manages global persistent state, specifically Firebase Authentication sessions.
- **Session Storage:** Caches in-progress seat selections so they persist through page refreshes or navigation events.

## Other implementations
- **Authentication:** Firebase Auth integration. Unauthenticated users cannot access the app. Demo credentials provided on UI.
- **Simulated Payment Gateway:** Checkout module with strict client-side validation on card details, no payment gateway implemented.
- **ACID-Compliant Distributed Locking:** MongoDB Optimistic Concurrency Control (OCC). Seat documents use a `version` integer for atomic `$set` updates to prevent race conditions without Redis.
- **Ticket Management:** View visual tickets in "My Bookings" and cancel them to instantly free up the seats in the database.

## Assumptions Made
1. **Seat Classes:** Rows J-M are premium `PRIME` seats (₹60 surcharge). Rows A-I are `REGULAR`.
2. **Cancelled shows:** This case is currently not handled.

## How to Run Locally

### 1. Prerequisites
- Node.js (v18+)
- MongoDB

### 2. Backend Setup
```bash
cd Backend
npm install
```
Create `Backend/.env`:
```env
PORT=5000
DATABASE_URL=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
```
Start backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
```
Create `Frontend/.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
Start frontend:
```bash
npm run dev
```

### 4. Access App
Navigate to `http://localhost:5173`. Demo credentials are provided on the login screen.
