# 🚗 DriveX — Full-Stack Car Rental Platform

A production-quality, end-to-end car rental web application built with **React + TypeScript** (frontend) and **Python/FastAPI** (backend) with **MongoDB**.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Development Setup](#-development-setup)
- [Docker Deployment](#-docker-deployment)
- [API Endpoints](#-api-endpoints)
- [Demo Accounts](#-demo-accounts)
- [Booking State Machine](#-booking-state-machine)
- [Pricing Rules](#-pricing-rules)
- [Testing](#-testing)
- [Environment Variables](#-environment-variables)

---

## ✨ Features

### User Portal
- Browse & search vehicles with filters (fuel, transmission, seats, price, location)
- Full booking flow: select dates → price preview → payment → confirmation
- Booking management: cancel, dispute, review
- Real-time hold timer during payment (15-min TTL)
- Notification center with mark-read

### Owner Portal
- Vehicle CRUD: add, edit, delete fleet vehicles
- Multi-image upload with drag-and-drop
- Booking approval for manual-mode vehicles
- Revenue tracking & stats

### Admin Portal
- Analytics dashboard with interactive charts (Recharts)
  - Revenue trend (area chart)
  - Booking status distribution (pie chart)
  - Top vehicles by revenue (bar chart)
- Booking management & CSV export
- Vehicle moderation (approve/reject)
- User management
- Audit log viewer

### Core Features
- **Booking State Machine**: `draft → pending → held → confirmed → active → completed → archived` with cancel/dispute/refund branches
- **Atomic availability checks**: prevents double-booking with optimistic locking
- **Idempotent booking creation**: prevents duplicate charges
- **Smart pricing**: weekend rates, long-term discounts (7+ days), cleaning fees, security deposits, 18% GST
- **Cancellation policy**: 48h+ = full refund, 24-48h = 50%, <24h = no refund
- **JWT auth**: role-based access (user/owner/admin) with bcrypt password hashing
- **Audit logging**: all sensitive operations tracked
- **Background tasks**: hold expiry, booking status transitions, archiving
- **Rate limiting**: API throttling via SlowAPI
- **WCAG accessibility**: skip-to-content, semantic HTML, aria labels, keyboard navigation

---

## 🏗 Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌───────────┐
│   React SPA     │──────▶   FastAPI         │──────▶  MongoDB  │
│   (Vite + TS)   │ REST  │   (Python 3.11)  │ Motor │  (v7)    │
│   Port 3000     │      │   Port 8000      │      └───────────┘
└─────────────────┘      │                  │      ┌───────────┐
                         │                  │──────▶  Redis    │
                         └──────────────────┘      │  (Cache)  │
                                                   └───────────┘
```

---

## 🛠 Tech Stack

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS 3.4 |
| State      | Zustand                                      |
| Routing    | React Router v6                              |
| Charts     | Recharts                                     |
| HTTP       | Axios                                        |
| Backend    | FastAPI, Pydantic v2, Motor (async MongoDB)  |
| Auth       | JWT (python-jose), bcrypt                    |
| Database   | MongoDB 7                                    |
| Cache      | Redis 7                                      |
| Rate Limit | SlowAPI                                      |
| Container  | Docker, docker-compose                       |

---

## 📂 Project Structure

```
car-rental/
├── docker-compose.yml          # Full-stack Docker orchestration
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── main.py                 # FastAPI entry point
│   ├── seed.py                 # Demo data generator
│   ├── pytest.ini
│   ├── app/
│   │   ├── config.py           # Settings from .env
│   │   ├── database.py         # Motor client + indexes
│   │   ├── models.py           # Pydantic schemas (all entities)
│   │   ├── auth.py             # JWT + bcrypt + RBAC
│   │   ├── audit.py            # Audit logging
│   │   ├── pricing.py          # Pricing engine + refunds
│   │   ├── tasks.py            # Background tasks (hold expiry)
│   │   └── routes/
│   │       ├── auth.py         # Signup/login/profile
│   │       ├── vehicles.py     # Vehicle CRUD + search
│   │       ├── bookings.py     # Booking state machine
│   │       ├── payments.py     # Charge/refund simulation
│   │       ├── admin.py        # Analytics, moderation, CSV
│   │       ├── notifications.py
│   │       └── reviews.py
│   └── tests/
│       └── test_core.py        # Unit tests
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf              # Production reverse proxy
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx             # Routes
        ├── index.css           # Tailwind + utility classes
        ├── types/index.ts      # TypeScript interfaces
        ├── lib/api.ts          # Axios client + API modules
        ├── store/authStore.ts  # Zustand auth state
        ├── components/
        │   ├── Navbar.tsx
        │   ├── Footer.tsx
        │   ├── Layout.tsx
        │   ├── ProtectedRoute.tsx
        │   ├── VehicleCard.tsx
        │   ├── StatusBadge.tsx
        │   ├── BookingStepper.tsx
        │   ├── Skeletons.tsx
        │   └── States.tsx      # Error/Empty states
        └── pages/
            ├── Landing.tsx
            ├── Auth.tsx        # Login + Signup
            ├── SearchPage.tsx
            ├── VehicleDetails.tsx
            ├── UserDashboard.tsx
            ├── OwnerDashboard.tsx
            ├── AdminDashboard.tsx
            ├── ProfilePage.tsx
            └── NotificationsPage.tsx
```

---

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
git clone <repo> && cd car-rental

# Start all services
docker-compose up --build -d

# Seed demo data
docker-compose exec backend python seed.py

# Open app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

### Manual Setup

See [Development Setup](#-development-setup) below.

---

## 💻 Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB 7+ (local or Atlas)
- Redis 7+

### Backend

```bash
cd backend

# Virtual environment
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Mac/Linux

# Install deps
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.

# Seed demo data
python seed.py

# Start server
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install deps
npm install

# Start dev server (proxies /api to localhost:8000)
npm run dev
# → http://localhost:5173
```

---

## 🐳 Docker Deployment

```bash
# Build & start all services
docker-compose up --build -d

# View logs
docker-compose logs -f backend

# Seed data
docker-compose exec backend python seed.py

# Stop
docker-compose down

# Stop & remove volumes (reset data)
docker-compose down -v
```

| Service  | URL                         |
|----------|-----------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:8000        |
| API Docs | http://localhost:8000/docs   |
| MongoDB  | mongodb://localhost:27017    |
| Redis    | redis://localhost:6379       |

---

## 📡 API Endpoints

### Auth
| Method | Path                 | Description       | Access  |
|--------|----------------------|-------------------|---------|
| POST   | /api/auth/signup     | Register          | Public  |
| POST   | /api/auth/login      | Login → JWT       | Public  |
| POST   | /api/auth/logout     | Logout            | Auth    |
| GET    | /api/auth/profile    | Get profile       | Auth    |
| PUT    | /api/auth/profile    | Update profile    | Auth    |

### Vehicles
| Method | Path                          | Description         | Access      |
|--------|-------------------------------|---------------------|-------------|
| GET    | /api/vehicles                 | Search/list         | Public      |
| GET    | /api/vehicles/:id             | Get details         | Public      |
| POST   | /api/vehicles                 | Create              | Owner/Admin |
| PUT    | /api/vehicles/:id             | Update              | Owner/Admin |
| DELETE | /api/vehicles/:id             | Soft delete         | Owner/Admin |
| POST   | /api/vehicles/:id/images      | Upload images       | Owner/Admin |

### Bookings
| Method | Path                          | Description         | Access      |
|--------|-------------------------------|---------------------|-------------|
| POST   | /api/bookings                 | Create (idempotent) | User        |
| GET    | /api/bookings                 | List my bookings    | Auth        |
| GET    | /api/bookings/:id             | Get details         | Auth        |
| POST   | /api/bookings/:id/confirm     | Confirm + pay       | Auth        |
| POST   | /api/bookings/:id/cancel      | Cancel + refund     | Auth        |
| POST   | /api/bookings/:id/dispute     | Raise dispute       | User        |
| POST   | /api/bookings/:id/resolve     | Resolve dispute     | Admin       |

### Payments
| Method | Path                          | Description         | Access      |
|--------|-------------------------------|---------------------|-------------|
| POST   | /api/payments/charge          | Charge (simulated)  | Auth        |
| POST   | /api/payments/refund          | Refund              | Admin       |
| GET    | /api/payments/booking/:id     | Get payments        | Auth        |

### Admin
| Method | Path                          | Description         | Access      |
|--------|-------------------------------|---------------------|-------------|
| GET    | /api/admin/analytics          | Dashboard data      | Admin       |
| GET    | /api/admin/bookings           | All bookings        | Admin       |
| GET    | /api/admin/bookings/export    | CSV export          | Admin       |
| GET    | /api/admin/vehicles           | All vehicles        | Admin       |
| POST   | /api/admin/vehicles/:id/approve | Approve           | Admin       |
| POST   | /api/admin/vehicles/:id/reject  | Reject            | Admin       |
| GET    | /api/admin/audit-logs         | Audit trail         | Admin       |
| GET    | /api/admin/users              | User list           | Admin       |

### Reviews & Notifications
| Method | Path                          | Description         | Access      |
|--------|-------------------------------|---------------------|-------------|
| POST   | /api/reviews                  | Submit review       | User        |
| GET    | /api/reviews/vehicle/:id      | Vehicle reviews     | Public      |
| GET    | /api/notifications            | My notifications    | Auth        |
| POST   | /api/notifications/mark-read  | Mark as read        | Auth        |

---

## 👤 Demo Accounts

After running `python seed.py`:

| Role   | Email                  | Password   |
|--------|------------------------|------------|
| Admin  | admin@carrental.com    | admin123   |
| Owner  | owner1@carrental.com   | owner123   |
| User   | user1@carrental.com    | user123    |

---

## 🔄 Booking State Machine

```
                    ┌──────────┐
                    │  draft   │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
            ┌───────│ pending  │───────┐
            │       └────┬─────┘       │
            │            │             │
       ┌────▼─────┐ ┌───▼────┐   ┌───▼──────┐
       │cancelled │ │  held  │   │          │
       └────┬─────┘ └───┬────┘   │          │
            │            │        │          │
       ┌────▼─────┐ ┌───▼──────┐ │          │
       │ refunded │ │confirmed │──┘          │
       └────┬─────┘ └───┬──────┘             │
            │            │                    │
       ┌────▼─────┐ ┌───▼────┐              │
       │ archived │ │ active │              │
       └──────────┘ └───┬────┘              │
                         │                    │
                    ┌────▼──────┐             │
                    │ completed │             │
                    └────┬──────┘             │
                         │                    │
                    ┌────▼──────┐             │
                    │ disputed  │             │
                    └────┬──────┘             │
                         │                    │
                    ┌────▼──────┐             │
                    │ resolved  │             │
                    └────┬──────┘             │
                         │                    │
                    ┌────▼──────┐             │
                    │ archived  │◄────────────┘
                    └───────────┘
```

### Hold TTL
- When a booking is created, it enters **held** state with a 15-minute TTL
- A background task automatically cancels expired holds
- The frontend shows a countdown timer during payment

---

## 💰 Pricing Rules

| Rule                | Details                              |
|---------------------|--------------------------------------|
| Base rate           | Per-day charge (weekday)             |
| Weekend rate        | Applied for Sat/Sun (optional)       |
| Long-term discount  | 10% off for 7+ days                  |
| Cleaning fee        | One-time flat fee                    |
| Security deposit    | Refundable deposit                   |
| Service fee         | 5% of base                           |
| Tax (GST)           | 18% on (base + service + cleaning)   |

### Cancellation Refund Policy

| Timing             | Refund |
|--------------------|--------|
| 48+ hours before   | 100%   |
| 24-48 hours before | 50%    |
| < 24 hours before  | 0%     |

---

## 🧪 Testing

```bash
cd backend

# Run all tests
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ -v --cov=app
```

Tests cover:
- Pricing engine (basic, weekend, long-term discount)
- Refund calculations (48h, 24-48h, <24h thresholds)
- Password hashing & verification
- JWT token creation & decode
- Booking state machine transitions
- Model validation (signup, vehicle create)

---

## ⚙ Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
MONGO_URI=mongodb://localhost:27017/car_rental
DATABASE_NAME=car_rental
JWT_SECRET=your-super-secret-key
JWT_EXPIRY_HOURS=24
REDIS_URL=redis://localhost:6379/0
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
UPLOAD_DIR=./uploads
HOLD_TTL_MINUTES=15
TAX_PERCENTAGE=18.0
SERVICE_FEE_PERCENTAGE=5.0
```

---

## 📄 License

MIT

---

Built with ❤️ by DriveX Team
