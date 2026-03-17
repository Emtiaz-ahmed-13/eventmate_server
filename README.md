# EventMate Server

Backend REST API for EventMate — a full-featured event management platform. Built with Node.js, Express, Prisma, and PostgreSQL (Neon).

## Live API

```
https://eventmate-server-3.onrender.com/api/v1
```

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
| Scheduling | node-cron |
| Real-time | Socket.io |

## Roles

- `USER` — can join events, save events, leave reviews
- `HOST` — can create/edit/delete/cancel events, manage participants
- `ADMIN` — full platform access

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

Fill in your `.env`:

```env
PORT=5001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host/dbname"

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_TOKEN_SECRET=your_refresh_secret
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

> Never commit `.env` to git. It's in `.gitignore`.

### 3. Database Setup

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Run

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Server runs on `http://localhost:5001`

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Generate Prisma client + compile TypeScript |
| `npm start` | Start compiled production server |
| `npm run generate` | Regenerate Prisma client |

---

## Project Structure

```
eventmate_server/
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── Auth/          # Register, login, verify email, reset password
│   │   │   ├── User/          # Profile, update, hosts list
│   │   │   ├── Event/         # CRUD, join/leave, cancel, waitlist, participants
│   │   │   ├── Review/        # Create review, get host reviews
│   │   │   ├── SavedEvent/    # Save/unsave/list saved events
│   │   │   ├── Payment/       # Stripe payment intent + confirm
│   │   │   ├── Analytics/     # Admin overview stats
│   │   │   ├── Admin/         # User/event management, ban, role change
│   │   │   └── Notification/  # User notifications
│   │   ├── middleware/        # Auth, error handler, rate limiter
│   │   ├── shared/            # File uploader (ImageKit + Multer)
│   │   └── routes/            # Central route registry
│   ├── config/                # Environment config
│   ├── helpers/               # JWT, email helpers
│   └── server.ts              # Entry point
├── prisma/
│   └── schema.prisma          # Database schema
├── generated/
│   └── prisma/                # Generated Prisma client
├── .env.example
└── package.json
```

---

## API Reference

Base URL: `/api/v1`

Authentication: `Authorization: Bearer <token>` (required on protected routes)

---

### Auth — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login, returns access + refresh tokens |
| POST | `/auth/logout` | ✅ | Logout |
| GET | `/auth/me` | ✅ | Get current user |
| GET | `/auth/verify-email?token=` | — | Verify email address |
| POST | `/auth/forgot-password` | — | Send password reset email |
| POST | `/auth/reset-password` | — | Reset password with token |
| POST | `/auth/refresh-token` | — | Get new access token |

**Register body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"
}
```

**Login response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### Users — `/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | ✅ | Get own profile |
| PATCH | `/users/update-profile` | ✅ | Update bio, location, interests |
| PATCH | `/users/update-profile-image` | ✅ | Upload profile photo (multipart) |
| GET | `/users/hosts` | — | Get all verified hosts (public) |
| GET | `/users/:id` | — | Get user profile by ID |
| GET | `/users/:id/events` | — | Get user's hosted + joined events |
| GET | `/users` | ADMIN | Get all users |
| DELETE | `/users/:id` | ADMIN | Delete user |

---

### Events — `/events`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/events` | — | List all events (supports search/filter) |
| GET | `/events/:id` | — | Get single event |
| POST | `/events` | HOST/ADMIN | Create event (multipart/form-data) |
| PATCH | `/events/:id` | HOST/ADMIN | Update event |
| DELETE | `/events/:id` | HOST/ADMIN | Delete event |
| PATCH | `/events/:id/cancel` | HOST/ADMIN | Cancel event |
| POST | `/events/:id/join` | ✅ | Join event |
| DELETE | `/events/:id/leave` | ✅ | Leave event |
| GET | `/events/:id/waitlist` | HOST/ADMIN | Get waitlisted users |
| PATCH | `/events/:eventId/participants/:userId/approve` | HOST/ADMIN | Approve participant |
| PATCH | `/events/:eventId/participants/:userId/reject` | HOST/ADMIN | Reject participant |
| POST | `/events/:id/save` | ✅ | Save/bookmark event |
| DELETE | `/events/:id/unsave` | ✅ | Remove from saved |
| GET | `/events/saved` | ✅ | Get all saved events |

**Create event fields:** `name`, `type`, `dateTime`, `location`, `maxParticipants`, `description`, `joiningFee`, `approvalRequired`, `image` (file)

---

### Reviews — `/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/reviews/host/:id` | — | Get all reviews for a host |
| POST | `/reviews` | ✅ | Submit a review |

**Create review body:**
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
| POST | `/payments/confirm` | ✅ | Confirm payment after Stripe |

---

### Analytics — `/analytics`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/analytics/overview` | ADMIN | Platform-wide stats |

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalHosts": 30,
    "totalEvents": 45,
    "totalRevenue": 2500
  }
}
```

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
| GET | `/Admin/stats` | ADMIN | Basic platform stats |

---

## Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "..."
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Database Models

| Model | Description |
|---|---|
| `User` | Accounts with roles: USER, HOST, ADMIN |
| `Profile` | Extended user info (bio, location, interests, photos) |
| `Event` | Event listings with status (ACTIVE, CANCELLED) |
| `Participant` | Join records with status (PENDING, APPROVED, REJECTED) |
| `Waitlist` | Waitlist entries for full events |
| `SavedEvent` | Bookmarked events per user |
| `Review` | Host ratings and comments |
| `Notification` | In-app notifications |

---

## License

ISC
