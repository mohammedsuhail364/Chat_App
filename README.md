# 💬 Chat Us

> A production-grade real-time chat application built with the **MERN stack** — engineered with security, scalability, and real-time performance in mind.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## 🚀 Key Engineering Highlights

### 1. 🔐 Secure Authentication
- **JWT** tokens stored in **httpOnly cookies** — immune to XSS attacks
- Passwords hashed with **bcrypt** with configurable salt rounds
- Token validation middleware applied to all protected routes
- Separate auth routes with tighter security policies

---

### 2. 🛡️ Input Validation with Zod
- Every API endpoint validated with **Zod schemas** before hitting the database
- Rejects malformed, incomplete, or malicious payloads instantly
- Returns structured, type-safe error messages to the client
- Protects against injection attacks and unexpected data shapes

---

### 3. 🚦 Multi-Tier Rate Limiting
- **Auth routes** (`/login`, `/signup`) — strict limits to block brute-force attacks
- **General API** — moderate limits via `app.use("/api", apiLimiter)` as a global safety net
- Returns `429 Too Many Requests` with retry metadata
- Built with `express-rate-limit` — configurable windows and max requests per route

---

### 4. ⚡ Redis-Powered Online Presence
Previously user socket IDs were stored in a plain in-memory `HashMap`. The problem: every server restart wiped all connections, forcing every user to reconnect manually.

**After migrating to Redis:**
- Socket mappings survive server restarts — zero reconnection needed
- **Auto-expiry (TTL)** on each key prevents stale data buildup
- Any server instance can look up any user's socket ID (horizontal scaling ready)
- Faster lookups than in-memory maps under high load due to Redis's O(1) GET

---

### 5. 📨 Message Delivery Status — Sent → Delivered → Seen
A full **3-state message lifecycle** modeled as a state machine:

| Status | Trigger | UI Indicator |
|---|---|---|
| `sent` | Message saved to DB, recipient offline | Flat gray waveform bars |
| `delivered` | Recipient online at time of send | Animated purple waveform |
| `seen` | Recipient opened the conversation | Animated blue waveform |

**How it works end-to-end:**
- On `sendMessage` — checks Redis for recipient's socket ID
- If online → immediately upgrades to `delivered` in DB + emits to both parties
- If offline → stays `sent`, upgrades on next connection
- Recipient's client emits `messageSeen` when conversation opens
- Sender receives live `messageStatusUpdate` socket event for instant UI update
- Custom animated waveform indicator (3 bars, each offset) — no generic checkmarks

---

### 6. 📡 Real-Time Architecture with Socket.io
- Full **bidirectional communication** between clients and server
- Supports **Direct Messages** and **Group Channels** on the same socket layer
- DM and channel contact lists reorder in real-time when new messages arrive
- Socket connection authenticated via `userId` query param on handshake
- Clean event-driven architecture with named handlers for each event type

---

### 7. 🗄️ File Sharing
- Upload and share **images and files** directly in chat
- Served via Express static middleware:
  ```
  /uploads/profiles  →  profile pictures
  /uploads/files     →  chat file attachments
  ```
- Upload progress tracked in real-time on the frontend

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Cache / Presence | Redis |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Rate Limiting | express-rate-limit |
| File Storage | Multer + Express static |

---

## 🗂️ API Structure

```
/api                   ← Global rate limiter applied at this level
  /auth                ← Login, signup, profile (strict rate limit)
  /contacts            ← Search users, manage DM contacts
  /messages            ← Send, fetch messages, delivery status
  /channel             ← Create and manage group channels

/uploads/profiles      ← Static served profile images
/uploads/files         ← Static served chat attachments
```

---

## 📁 Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/            ← SocketContext (real-time layer)
│   │   ├── pages/
│   │   ├── store/              ← Zustand slices (chat, messages, auth)
│   │   └── utils/              ← Constants, API client
│
├── server/
│   ├── controllers/
│   ├── middleware/             ← Auth guard, rate limiter, Zod validator
│   ├── models/                 ← User, Message, Channel schemas
│   ├── routes/
│   └── socket.js              ← Socket.io handlers + Redis integration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB
- Redis

### Installation

```bash
# Clone the repo
git clone https://github.com/mohammedsuhail364/Chat_App
cd Chat_App

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### Environment Variables

Create a `.env` file in the `server/` folder:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://localhost:6379
ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Run the App

```bash
# Start Redis (if running locally)
redis-server

# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔮 Roadmap

- [ ] Pagination / infinite scroll for older messages
- [ ] Typing indicators
- [ ] Message reactions (emoji)
- [ ] Push notifications (PWA)
- [ ] End-to-end encryption
- [ ] Voice & video calls

---

## 👨‍💻 Author

**Mohammed Suhail**
- GitHub: [@mohammedsuhail364](https://github.com/mohammedsuhail364)
- LinkedIn: [mohammedsuhail364](https://www.linkedin.com/in/mohammedsuhail364/)

---

> This project demonstrates production-ready engineering practices: security-first API design, scalable real-time architecture, and thoughtful UX decisions backed by solid backend logic.