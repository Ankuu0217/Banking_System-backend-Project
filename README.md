# 🏦 Banking System — Backend API

A secure, production-ready RESTful banking API built with **Node.js**, **Express 5**, and **MongoDB**. Features JWT-based authentication, ACID-compliant fund transfers using MongoDB transactions, double-entry ledger bookkeeping, and email notifications.

---

## ✨ Features

- **🔐 Authentication** — Register, login, and logout with JWT tokens & bcrypt password hashing
- **🛡️ Token Blacklisting** — Revoked tokens are stored in a blacklist collection with auto-expiry (TTL index)
- **🏧 Account Management** — Create bank accounts, fetch account details, and check real-time balances
- **💸 Fund Transfers** — Peer-to-peer transfers with full ACID transaction support using MongoDB sessions
- **📒 Double-Entry Ledger** — Every transaction creates immutable DEBIT & CREDIT ledger entries
- **🔑 Idempotency** — Duplicate transaction prevention using unique idempotency keys
- **👤 System Users** — Privileged user role for system operations like seeding initial funds
- **📧 Email Notifications** — Automated welcome & transaction notification emails via Nodemailer (Gmail OAuth2)
- **⚡ Balance Calculation** — Real-time balance computed via MongoDB aggregation pipeline on the ledger

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express 5** | Web framework |
| **MongoDB Atlas** | Cloud database |
| **Mongoose 9** | ODM for MongoDB |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Nodemailer** | Email service (Gmail OAuth2) |
| **cookie-parser** | Cookie handling |
| **dotenv** | Environment variables |

---

## 📁 Project Structure

```
Banking_System_FullStack/
├── server.js                          # Entry point — starts server & connects DB
├── package.json
├── .env                               # Environment variables (not committed)
├── .gitignore
└── src/
    ├── app.js                         # Express app setup & route mounting
    ├── config/
    │   └── db.js                      # MongoDB connection
    ├── controllers/
    │   ├── auth.controller.js         # Register, Login, Logout logic
    │   ├── account.controller.js      # Create account, Get accounts, Get balance
    │   └── transaction.controller.js  # Fund transfer & initial funds
    ├── middleware/
    │   └── auth.middleware.js         # JWT auth & system user middleware
    ├── model/
    │   ├── user.model.js              # User schema with password hashing
    │   ├── account.model.js           # Account schema with balance aggregation
    │   ├── transaction.model.js       # Transaction schema with idempotency
    │   ├── ledger.model.js            # Immutable ledger entries (CREDIT/DEBIT)
    │   └── blacklist.model.js         # Token blacklist with TTL auto-expiry
    ├── routes/
    │   ├── auth.routes.js             # /api/auth/*
    │   ├── account.routes.js          # /api/account/*
    │   └── transaction.routes.js      # /api/transactions/*
    └── services/
        └── email.service.js           # Nodemailer email sending service
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB Atlas** account (or local MongoDB)
- **Gmail** account with OAuth2 credentials (for email notifications)

### Installation

```bash
# Clone the repository
git clone https://github.com/Ankuu0217/Banking_System-backend-Project.git

# Navigate to the project
cd Banking_System-backend-Project

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET_KEY=your_jwt_secret_key

# Email Configuration (Gmail OAuth2)
EMAIL_USER=your-email@gmail.com
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_google_refresh_token
```

### Run the Server

```bash
# Development mode (with hot-reload)
npm run dev

# Server starts on http://localhost:3000
```

---

## 📡 API Endpoints

### 🔐 Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login & receive JWT token |
| `POST` | `/api/auth/logout` | ✅ | Logout & blacklist token |

### 🏧 Accounts — `/api/account`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/account/create` | ✅ | Create a new bank account |
| `GET` | `/api/account/get-account` | ✅ | Get all accounts of logged-in user |
| `GET` | `/api/account/balance/:accountId` | ✅ | Get real-time balance of an account |

### 💸 Transactions — `/api/transactions`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/transactions/transfer` | ✅ | Transfer funds between accounts |
| `POST` | `/api/transactions/system/initial-funds` | 🔑 System | Seed initial funds (admin only) |

---

## 📋 API Usage Examples

### Register a User

```bash
POST /api/auth/register
Content-Type: application/json

{
    "name": "Ankit Singh",
    "email": "ankit@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "user": {
        "_id": "6620abc...",
        "email": "ankit@example.com",
        "name": "Ankit Singh"
    },
    "token": "eyJhbGciOiJIUzI1...",
    "success": true,
    "message": "User registered successfully"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
    "email": "ankit@example.com",
    "password": "password123"
}
```

### Transfer Funds

```bash
POST /api/transactions/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
    "fromAccount": "6620abc123...",
    "toAccount": "6620def456...",
    "amount": 5000,
    "idempotencyKey": "unique-key-12345"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Transaction completed successfully",
    "transaction": {
        "_id": "6620ghi789...",
        "fromAccount": "6620abc123...",
        "toAccount": "6620def456...",
        "amount": 5000,
        "status": "COMPLETED",
        "idempotencyKey": "unique-key-12345"
    }
}
```

---

## 🏗️ Architecture & Design Decisions

### Double-Entry Ledger System
Every fund transfer creates **two ledger entries** — a DEBIT from the sender and a CREDIT to the receiver. The balance is calculated in real-time using a MongoDB aggregation pipeline (`$match → $group → $project`) rather than storing a mutable balance field. This ensures data integrity and provides a full audit trail.

### ACID Transactions
Fund transfers use **MongoDB sessions** to ensure atomicity. If any step fails (creating the transaction, debit entry, or credit entry), the entire operation is rolled back.

### Immutable Ledger
The ledger model uses Mongoose's `immutable: true` on all fields and has `pre` hooks on all update/delete operations that throw errors, making ledger entries tamper-proof.

### Idempotency
Each transaction requires a unique `idempotencyKey`. If a duplicate key is submitted, the API returns the existing transaction status instead of creating a duplicate — preventing double-charges on network retries.

### Token Blacklisting
On logout, tokens are added to a blacklist collection with a **TTL index** (`expireAfterSeconds: 3 days`) matching the token's lifespan—MongoDB automatically cleans up expired entries.

---

## 📊 Database Models

```
┌─────────┐     ┌───────────┐     ┌──────────────┐     ┌─────────┐
│  User   │────▷│  Account  │────▷│ Transaction  │◁────│ Ledger  │
│         │     │           │     │              │     │         │
│ email   │     │ user (ref)│     │ fromAccount  │     │ account │
│ name    │     │ status    │     │ toAccount    │     │ amount  │
│ password│     │ currency  │     │ amount       │     │ type    │
│systemUser     │           │     │ status       │     │(CREDIT/ │
└─────────┘     └───────────┘     │idempotencyKey│     │ DEBIT)  │
                                  └──────────────┘     └─────────┘
                                                            │
                                  ┌──────────────┐          │
                                  │  BlackList   │     (immutable)
                                  │    Token     │
                                  │  (TTL: 3d)   │
                                  └──────────────┘
```

---

## 🔒 Security Features

- ✅ Passwords hashed with **bcryptjs** (salt rounds: 10)
- ✅ Password field excluded from queries by default (`select: false`)
- ✅ JWT tokens with **3-day expiry**
- ✅ Token blacklisting on logout with **auto-cleanup via TTL index**
- ✅ System user role with `immutable: true` — cannot be modified via API
- ✅ Blacklisted token check in middleware before processing requests
- ✅ Authorization via cookies **and** Bearer token header support

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👤 Author

**Ankit Singh**
- GitHub: [@Ankuu0217](https://github.com/Ankuu0217)

---

<p align="center">
  Made with ❤️ using Node.js, Express & MongoDB
</p>
