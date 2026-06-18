# 💬 Chat Us

> A production-grade real-time chat application built with the **MERN stack** — engineered with security, scalability, and real-time performance in mind.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white)

---

## 🚀 Key Engineering Highlights

### 1. 🔐 Secure Authentication
- **JWT** tokens stored in **httpOnly cookies** — immune to XSS attacks
- Passwords hashed with **bcrypt** with configurable salt rounds
- Token validation middleware applied to all protected routes
- Same error message for wrong password and unknown user — prevents **user enumeration attacks**
- `SameSite` cookie attribute guards against **CSRF**

---

### 2. 🛡️ Input Validation with Zod
- Every API endpoint validated with **Zod schemas** before hitting the database
- Rejects malformed, incomplete, or malicious payloads instantly
- Returns structured, type-safe error messages to the client
- Protects against injection attacks and unexpected data shapes

---

### 3. 🚦 Multi-Tier Rate Limiting
- **Signup** — 3 attempts per hour
- **Login** — 5 attempts per 15 minutes
- **General API** — 100 requests per minute via `app.use("/api", apiLimiter)` as a global safety net
- Returns `429 Too Many Requests` with retry metadata
- Built with `express-rate-limit` — configurable windows and max requests per route

---

### 4. ⚡ Redis-Powered Online Presence
Previously user socket IDs were stored in a plain in-memory `HashMap`. Problems: every server restart wiped all connections, and presence state couldn't be shared across multiple server instances.

**After migrating to Redis:**
- Socket mappings survive server restarts — zero manual reconnection needed
- **Auto-expiry (TTL: 24h)** on each key prevents stale data buildup
- Any server instance can look up any user's socket ID — **horizontal scaling ready**
- Faster lookups than in-memory maps under high load due to Redis's O(1) GET
- On connect → `io.emit("userOnline", { userId })` broadcast to all clients
- On disconnect → Redis key deleted → `io.emit("userOffline", { userId })` broadcast
- On fresh connect → `getOnlineUsers` event returns all currently online user IDs via `pubClient.keys("socket:user:*")`
- Frontend stores online users in a **Zustand Set** — O(1) lookup per contact render

---

### 5. 📨 Message Delivery Status — Sent → Delivered → Seen
A full **3-state message lifecycle** modeled as a **finite state machine** — status only moves forward, never backward:

| Status | Trigger | UI Indicator |
|---|---|---|
| `sent` | Message saved to DB, recipient offline | Flat gray waveform bars |
| `delivered` | Recipient online at time of send OR comes online later | Animated purple waveform |
| `seen` | Recipient opened the conversation | Animated blue waveform (blinking) |

**How it works end-to-end:**
- On `sendMessage` — checks Redis for recipient's socket ID
- If online → immediately upgrades to `delivered` in DB + emits to both parties
- If offline → stays `sent`, bulk-upgraded to `delivered` on recipient's next connection via `Message.updateMany`
- Recipient's client emits `messageSeen` when conversation opens
- Sender receives live `messageStatusUpdate` socket event for instant UI update
- Custom animated waveform indicator (3 bars, each offset) — no generic checkmarks

---

### 6. ✍️ Typing Indicator
- User starts typing → frontend emits `typing` event with `{ senderId, recipientId }`
- Server looks up recipient's socket ID from Redis — forwards `userTyping` event if online
- Recipient sees **"is typing..."** label in chat header (purple, pulsing animation)
- **Two ways it clears:**
  1. **Debounce** — 2 seconds of no keystrokes → `stopTyping` event fires automatically
  2. **Message sent** — `stopTyping` emitted immediately on send
- State stored in Zustand as `typingUsers: { [contactId]: boolean }` — **purely ephemeral, never hits DB**
- DM-only — channel messages excluded intentionally

---

### 7. 📡 Multi-Instance Real-Time Architecture
- **`@socket.io/redis-adapter`** connects all server instances via Redis pub/sub
- If User A is on Server 1 and User B is on Server 2 — message still delivers correctly
- Redis acts as the message broker between instances — no direct server-to-server communication needed
- Socket connection authenticated via `userId` query param on handshake
- Clean event-driven architecture with named handlers for each event type

**Socket Events Map:**

| Event | Direction | Purpose |
|---|---|---|
| `sendMessage` | Client → Server | Send a DM |
| `receiveMessage` | Server → Client | Deliver DM to recipient + sender |
| `messageSeen` | Client → Server | Mark messages as seen |
| `messageStatusUpdate` | Server → Client | Notify sender of status change |
| `send-channel-message` | Client → Server | Send a channel message |
| `receive-channel-message` | Server → Client | Deliver to all channel members |
| `typing` | Client → Server | User started typing |
| `userTyping` | Server → Client | Forward typing signal to recipient |
| `stopTyping` | Client → Server | User stopped typing |
| `userStopTyping` | Server → Client | Forward stop-typing to recipient |
| `userOnline` | Server → Client | Broadcast when a user connects |
| `userOffline` | Server → Client | Broadcast when a user disconnects |
| `getOnlineUsers` | Client → Server | Request current online users on connect |
| `onlineUsersList` | Server → Client | Return all currently online user IDs |

---

### 8. 📄 Cursor-Based Pagination (Infinite Scroll)
- Messages load in batches — scroll to top fetches older messages
- **Cursor-based, not offset-based** — why?
  - Offset pagination breaks when new messages arrive between page loads (duplicates / missed messages)
  - Cursor uses the oldest message's **timestamp as a stable anchor** — always correct
- On initial load → latest batch fetched, view snaps to bottom
- On scroll to top → older batch fetched, **scroll position preserved** via height delta calculation — no jump
- If first batch doesn't fill the screen → more messages auto-load
- Uses **LIMIT + 1 pattern** to determine `hasMore` without an extra COUNT query
- **Compound MongoDB indexes** on `(sender, recipient, timestamp)` for DMs and `(recipient, status)` for delivery queries

---

### 9. 🗄️ File Sharing via Cloudinary CDN
- User clicks attachment icon → file picker opens
- File uploaded via HTTP POST to `/api/messages/upload-file`
- **Multer streams directly to Cloudinary** — file never touches server disk
- Upload progress shown in real time via Axios `onUploadProgress`
- After upload, Cloudinary CDN URL emitted via socket as `messageType: "file"`
- **Images** displayed inline with a lightbox viewer (click to expand, download button)
- **Non-image files** (PDFs, docs) shown as download link with progress tracking
- Profile images transformed to **500×500** and stored in `profiles/` folder on Cloudinary
- Chat files stored in `chat-files/` folder

---

### 10. 🏗️ MongoDB Aggregation — Recent Contacts
- Sidebar contacts ordered by most recent message (most recent at top)
- Powered by a **7-stage MongoDB aggregation pipeline** — single query, no N+1
- No separate queries per contact — entire sidebar populated in one round trip

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Cache / Presence | Redis (Upstash) |
| Real-time | Socket.io + @socket.io/redis-adapter |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Rate Limiting | express-rate-limit |
| File Storage | Cloudinary CDN |
| File Upload | Multer (stream to Cloudinary) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🗂️ API Structure

```
/api                   ← Global rate limiter applied here
  /auth                ← Login, signup, profile (strict rate limit)
  /contacts            ← Search users, manage DM contacts, online status
  /messages            ← Send, fetch, paginate messages, delivery status, file upload
  /channel             ← Create and manage group channels
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
│   ├── utils/                  ← Redis client (pub/sub)
│   └── socket.js              ← Socket.io handlers + Redis adapter + presence
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
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
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

- [x] Cursor-based pagination / infinite scroll
- [x] Typing indicators
- [x] Online / offline presence badges
- [ ] Unread message count badge
- [ ] Message reactions (emoji)
- [ ] Message edit & delete
- [ ] Reply to message
- [ ] Full-text message search
- [ ] Push notifications (PWA)
- [ ] Redis sliding window rate limiting
- [ ] WebRTC voice & video calls

---

## 👨‍💻 Author

**Mohammed Suhail**
- GitHub: [@mohammedsuhail364](https://github.com/mohammedsuhail364)
- LinkedIn: [mohammedsuhail364](https://www.linkedin.com/in/mohammedsuhail364/)

---

> This project demonstrates production-ready engineering practices: security-first API design, scalable real-time architecture, Redis-backed presence and pub/sub, and thoughtful UX decisions backed by solid backend logic.