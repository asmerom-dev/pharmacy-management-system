# 💊 Pharmacy Management System

A web application built for pharmacy owners to manage drug inventory, record sales, and track daily business performance.

## Features

- **📊 Dashboard** — Overview stats (total drugs, out of stock, today's sales & revenue) with a bar chart showing top-selling drugs
- **💊 All Drugs** — View all medications and their stock status (In Stock / Low Stock / Out of Stock), add new drugs, search and delete
- **🛒 Sell Drug** — Record sales by selecting a drug and quantity. Stock is automatically decreased
- **📅 Daily Sales** — View today's sales data (drug name, quantity, time) by clicking the "Daily Data" button

## Tech Stack

| Layer      | Technology          |
|------------|---------------------|
| Frontend   | React + Vite        |
| Styling    | CSS (custom)        |
| Charts     | Recharts            |
| Backend    | Node.js + Express   |
| Database   | PostgreSQL          |

## Setup Instructions

### 1. Database Setup

Make sure PostgreSQL is installed and running, then:

```bash
# Create the database
psql -U postgres
CREATE DATABASE pharmacy_db;
\q

# Run the setup SQL file to create tables and sample data
psql -U postgres -d pharmacy_db -f database.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (you can copy `.env.example`):
```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL credentials:
```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=pharmacy_db
DB_PASSWORD=your_password
DB_PORT=5432
```

Start the backend server:
```bash
npm start
```

The backend runs at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`

## API Endpoints

| Method | Endpoint                | Description               |
|--------|-------------------------|---------------------------|
| GET    | /api/drugs              | Get all drugs             |
| POST   | /api/drugs              | Add a new drug            |
| PUT    | /api/drugs/:id          | Update a drug             |
| DELETE | /api/drugs/:id          | Delete a drug             |
| GET    | /api/drugs/stats/dashboard | Get dashboard statistics |
| POST   | /api/sales              | Record a sale             |
| GET    | /api/sales/daily        | Get today's sales         |
| GET    | /api/sales/top          | Get top selling drugs     |

## Project Structure

```
pharmacy-management-system/
├── backend/
│   ├── package.json
│   ├── server.js          # Express server setup
│   ├── db.js              # PostgreSQL connection
│   └── routes/
│       ├── drugRoutes.js  # Drug CRUD operations
│       └── saleRoutes.js  # Sales recording & reports
├── frontend/
│   ├── package.json
│   ├── vite.config.js     # Vite config with API proxy
│   ├── index.html
│   └── src/
│       ├── main.jsx       # React entry point
│       ├── App.jsx        # Main app with routing
│       ├── App.css        # All styles
│       └── components/
│           ├── Sidebar.jsx    # Navigation sidebar
│           ├── Dashboard.jsx  # Stats + chart
│           ├── AllDrugs.jsx   # Drug inventory
│           ├── SellDrug.jsx   # Record sales
│           └── DailySales.jsx # Today's sales report
├── database.sql           # SQL schema + sample data
└── README.md
```

## Built by

A 3rd year Software Engineering student 🎓
