# EventMate — Server

<p align="center">
  <img src="/eventmate_client/public/eventmate.png" alt="EventMate Logo" width="600" />
</p>

<p align="center">
  <strong>Discover and host unforgettable local events.</strong><br/>
  Connect with people who share your passions through EventMate.
</p>

<p align="center">
  <a href="https://eventmate-client-1.onrender.com/">🌐 Live App</a> &nbsp;|&nbsp;
  <a href="https://eventmate-server-5.onrender.com/">⚙️ Backend API</a>
</p>

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| ORM | Prisma 6 |
| Database | PostgreSQL (Neon) |
| Auth | JWT (access + refresh tokens) |
| File Upload | ImageKit |
| Email | Nodemailer (Gmail SMTP) |
| Payments | Stripe |
| Real-time | Socket.io |
| Scheduling | node-cron |
| Rate Limiting | express-rate-limit |

---

## Roles

| Role | Permissions |
|---|---|
| `USER` | Join events, save events, leave reviews |
| `HOST` | Create/edit/delete/cancel events, manage participants, view analytics |
| `ADMIN` | Full platform access |

---

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd eventmate_server
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@direct-host/dbname?sslmode=require"
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_TOKEN_SECRET=your_strong_refresh_secret
JWT_REFRESH_TOKEN_EXPIRES_IN=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
```

### 3. Database Setup

```bash
npx prisma db push
npx prisma generate
```

### 4. Run

```bash
npm run dev       # Development (tsx watch)
npm run build     # Compile TypeScript
npm start         # Start production server
```

Server runs on `http://localhost:5001`

---

## Project Structure

```
src/
├── app/
│   ├── modules/
│   │   ├── Auth/           # Register, login, verify email, reset password
│   │   ├── User/           # Profile, update, hosts list, images
│   │   ├── Event/          # CRUD, join/leave, cancel, duplicate, waitlist, check-in, analytics
│   │   ├── Review/         # Create review, host reviews, all reviews (with total count)
│   │   ├── SavedEvent/     # Save / unsave / list saved events
│   │   ├── Payment/        # Stripe payment intent + confirm
│   │   ├── Analytics/      # Admin overview stats
│   │   ├── Admin/          # User/event management, logs, host verifications
│   │   └── Notification/   # Real-time + email notifications (Socket.io)
│   ├── middleware/         # Auth guard, global error handler, rate limiter
│   ├── shared/             # Prisma client, catchAsync, sendResponse
│   └── routes/             # Central route registry
├── config/                 # Environment config
├── helpers/                # JWT helpers
├── utils/                  # Email sender, event reminder cron
└── server.ts               # Entry point + Socket.io + keep-alive ping
prisma/
└── schema.prisma           # Database schema
```

---

## API Reference

**Base URL:** `/api/v1`
**Auth header:** `Authorization: Bearer <accessToken>`

---

### Auth — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register, sends verification email |
| POST | `/auth/login` | — | Login, returns access + refresh tokens |
| POST | `/auth/logout` | ✅ | Logout, clears refresh token |
| GET | `/auth/me` | ✅ | Get current user |
| GET | `/auth/verify-email?token=` | — | Verify email address |
| POST | `/auth/forgot-password` | — | Send password reset email |
| POST | `/auth/reset-password?token=` | — | Reset password with token |
| POST | `/auth/refresh-token` | — | Get new access token |
| POST | `/auth/resend-verification` | — | Resend verification email |

---

### Users — `/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | ✅ | Get own profile |
| PATCH | `/users/update-profile` | ✅ | Update bio, location, interests |
| PATCH | `/users/update-profile-image` | ✅ | Upload profile photo (multipart) |
| PATCH | `/users/update-header-image` | ✅ | Upload header/cover photo (multipart) |
| GET | `/users/hosts` | — | Get all verified hosts |
| GET | `/users/:id` | — | Get user profile by ID |
| GET | `/users/:id/events` | — | Get user hosted + joined events |

---

### Events — `/events`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/events` | — | List events with filters + pagination |
| GET | `/events/:id` | — | Get single event |
| POST | `/events` | HOST | Create event (multipart/form-data) |
| PATCH | `/events/:id` | HOST | Update event |
| DELETE | `/events/:id` | HOST | Delete event |
| PATCH | `/events/:id/cancel` | HOST | Cancel event |
| POST | `/events/:id/duplicate` | HOST | Duplicate event |
| GET | `/events/:id/analytics` | HOST | Event analytics |
| POST | `/events/:id/join` | ✅ | Join event |
| DELETE | `/events/:id/leave` | ✅ | Leave event |
| GET | `/events/:id/waitlist` | HOST | Get waitlisted users |
| PATCH | `/events/:eventId/participants/:userId/approve` | HOST | Approve participant |
| PATCH | `/events/:eventId/participants/:userId/reject` | HOST | Reject participant |
| PATCH | `/events/:eventId/participants/:userId/checkin` | HOST | Check-in participant |
| PATCH | `/events/:eventId/participants/:userId/undo-checkin` | HOST | Undo check-in |
| POST | `/events/:id/save` | ✅ | Save/bookmark event |
| DELETE | `/events/:id/unsave` | ✅ | Remove from saved |
| GET | `/events/saved` | ✅ | Get all saved events |

**Query params for `GET /events`:**

| Param | Type | Description |
|---|---|---|
| `searchTerm` | string | Search by name or description |
| `type` | string | Filter by category |
| `location` | string | Filter by location |
| `dateRange` | today / week / month | Filter by date window |
| `paidOnly` | boolean | Show only paid events |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

---

### Reviews — `/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/reviews?limit=` | — | Latest reviews — returns `{ reviews, total }` |
| GET | `/reviews/host/:id` | — | All reviews for a host with average rating |
| POST | `/reviews` | ✅ | Submit a review |

**POST body:**

```json
{
  "hostId": "uuid",
  "eventId": "uuid",
  "rating": 5,
  "comment": "Amazing event!"
}
```

---

### Payments — `/payments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/payments/create-intent` | ✅ | Create Stripe payment intent |
| POST | `/payments/confirm` | ✅ | Confirm payment + add participant |

---

### Analytics — `/analytics`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/analytics/overview` | ADMIN | Platform-wide stats |

---

### Admin — `/Admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/Admin/users` | ADMIN | List all users |
| GET | `/Admin/hosts` | ADMIN | List all hosts |
| PATCH | `/Admin/users/:id/role` | ADMIN | Change user role |
| PATCH | `/Admin/users/:id/ban` | ADMIN | Toggle user ban |
| DELETE | `/Admin/users/:id` | ADMIN | Delete user |
| GET | `/Admin/events` | ADMIN | List all events |
| DELETE | `/Admin/events/:id` | ADMIN | Delete any event |
| GET | `/Admin/stats` | ADMIN | Platform statistics |
| GET | `/Admin/logs` | ADMIN | System logs |
| GET | `/Admin/pending-hosts` | ADMIN | Pending host verifications |

---

## Database Models

| Model | Description |
|---|---|
| `User` | Accounts with roles: USER, HOST, ADMIN |
| `Profile` | Bio, location, interests, profile image, header image |
| `Event` | Listings with status: OPEN, FULL, CANCELLED, COMPLETED |
| `Participant` | Join records with status: PENDING, APPROVED, REJECTED + check-in |
| `Waitlist` | Waitlist entries for full events |
| `SavedEvent` | Bookmarked events per user |
| `Review` | Host ratings, comments, linked to reviewer + host + event |
| `Notification` | In-app + email notifications |

---

## Error Format

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

| Code | Meaning |
|---|---|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (e.g. email not verified) |
| 404 | Not Found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Internal Server Error |

---

## Deployment

Deployed on **Render** as a Node.js Web Service.

- Build: `npm install && npm run build`
- Start: `npm start` (`node dist/src/server.js`)
- Keep-alive: self-ping cron every 10 minutes (prevents Render free tier cold start)

---

## Related

- [EventMate Client](../eventmate_client/README.md) — Next.js frontend

---

## License

ISC
