# EventMate Server

<p align="center">
  <img src="../eventmate_client/public/eventmate.png" alt="EventMate logo" width="600" />
</p>

<p align="center">
  <strong>Express, TypeScript, Prisma, PostgreSQL, Stripe, ImageKit, email, and Socket.IO backend for EventMate.</strong>
</p>

<p align="center">
  <a href="https://eventmate-server-6.onrender.com/">Backend API</a> |
  <a href="https://eventmate-client-2.onrender.com/">Live App</a> |
  <a href="../eventmate_client/README.md">Client README</a>
</p>

## Overview

EventMate Server powers authentication, users, host profiles, events, participants, payments, reviews, notifications, QR/PDF tickets, chat, discussions, following, analytics, and admin moderation for the EventMate platform.

The public API is mounted under:

```text
/api/v1
```

Protected endpoints expect:

```http
Authorization: Bearer <accessToken>
```

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 6 |
| Authentication | JWT access and refresh tokens, email OTP login |
| File uploads | Multer, ImageKit |
| Email | Nodemailer |
| Payments | Stripe |
| Real-time | Socket.IO |
| Scheduling | node-cron |
| Rate limiting | express-rate-limit |
| Deployment | Render, Docker, Vercel |

## Features

### Authentication & Users

- Register, login, logout, refresh token, current-user lookup, forgot password, and reset password.
- **Email OTP login** — passwordless sign-in via `send-otp` and `verify-otp`.
- Role-based access control for `USER`, `HOST`, and `ADMIN`.
- User profiles with bio, interests, location, profile image, and header image.

### Events

- Event CRUD with image upload, filtering, join/leave, waitlist, approval, duplication, and cancellation.
- Event **category** support (Music, Movie, Technology, Sports, and more).
- **`movieName`** field for movie screening events (e.g. Bonolota Express).
- Saved events and public host discovery.
- Host analytics per event.

### Tickets & Invites

- Participant ticketing with QR generation, **PDF ticket download**, email delivery, and QR verification.
- **Invite friend by email** — sends invite link and stores history in `EventInvite`.
- **Invite history** — hosts can list sent invites and track `SENT` / `ACCEPTED` status.
- Invites auto-mark as `ACCEPTED` when the invited user joins the event.

### Payments & Promo Codes

- Stripe payment intent creation and payment confirmation.
- **Payment records** persisted in the database with amount, discount, final amount, and status.
- **Promo codes** — hosts create percent or fixed discounts; users apply at checkout.
- **100% promo** — free join without Stripe when discount covers the full fee.
- **Payment history** — users view their own payments; hosts view payments per event.

### Reviews & Social

- Host reviews with optional **per-event** duplicate prevention.
- Real-time notifications and event reminders.
- Event chat rooms and event discussion Q&A.
- Host follow/unfollow flow and follower listing.

### Safety & Admin

- **Reports** — users can report events, users, or reviews; admins review and update status.
- Admin tools for users, hosts, events, system logs, statistics, pending host approvals, and **report moderation**.

## Roles

| Role | Common permissions |
| --- | --- |
| `USER` | Join events, save events, leave reviews, chat, ask questions, follow hosts, apply promo codes, submit reports |
| `HOST` | Manage own events, participants, waitlists, analytics, ticket scanning, discussion answers, promo codes, invite friends, view event payments |
| `ADMIN` | Manage users, hosts, events, logs, stats, moderation, and reports |

## Prerequisites

- Node.js 20 or later
- npm
- PostgreSQL database
- Stripe account and API keys
- ImageKit account and API keys
- SMTP credentials for email sending

## Getting Started

Install dependencies:

```bash
cd eventmate_server
npm install
```

Create `.env` from the template:

```bash
cp .env.example .env
```

Fill in the required values:

```env
PORT=5001
NODE_ENV=development

DATABASE_URL="postgresql://user:password@host:5432/eventmate?schema=public&connect_timeout=30"
DIRECT_URL="postgresql://user:password@host:5432/eventmate?schema=public&connect_timeout=30"

JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_TOKEN_SECRET=replace-with-a-long-random-refresh-secret
JWT_REFRESH_TOKEN_EXPIRES_IN=30d
JWT_RESET_PASS_TOKEN=replace-with-a-long-random-reset-secret
JWT_RESET_PASS_TOKEN_EXPIRES_IN=10m

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
```

Generate Prisma client and apply migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

For local development only (without migration history):

```bash
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

The server runs on `http://localhost:5001`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the server in watch mode with `tsx` |
| `npm run build` | Generate Prisma client and compile TypeScript |
| `npm start` | Start the compiled production server from `dist/src/server.js` |
| `npm run generate` | Generate Prisma client |
| `npm run vercel-build` | Build command for Vercel |

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | Yes | HTTP server port |
| `NODE_ENV` | Yes | Runtime mode, usually `development` or `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection URL used by Prisma |
| `DIRECT_URL` | Yes | Direct PostgreSQL URL used by Prisma |
| `JWT_SECRET` | Yes | Access token signing secret |
| `JWT_EXPIRES_IN` | Yes | Access token lifetime |
| `JWT_REFRESH_TOKEN_SECRET` | Yes | Refresh token signing secret |
| `JWT_REFRESH_TOKEN_EXPIRES_IN` | Yes | Refresh token lifetime |
| `JWT_RESET_PASS_TOKEN` | Yes | Password reset token signing secret |
| `JWT_RESET_PASS_TOKEN_EXPIRES_IN` | Yes | Password reset token lifetime |
| `EMAIL_HOST` | Yes | SMTP host |
| `EMAIL_PORT` | Yes | SMTP port |
| `EMAIL_USER` | Yes | SMTP username/from email |
| `EMAIL_PASS` | Yes | SMTP password or app password |
| `IMAGEKIT_PUBLIC_KEY` | Yes | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | Yes | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | Yes | ImageKit URL endpoint |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `FRONTEND_URL` | Yes | Allowed frontend origin and email link base URL |
| `BACKEND_URL` | Recommended | Backend public URL for generated links and deployed runtime |

## Project Structure

```text
eventmate_server/
|-- api/                    Vercel serverless entrypoint
|-- prisma/
|   |-- schema.prisma       Prisma schema and database models
|   `-- migrations/         Versioned SQL migrations
|-- src/
|   |-- app.ts              Express app, CORS, middleware, API routes
|   |-- server.ts           HTTP server and Socket.IO bootstrap
|   |-- app/
|   |   |-- modules/        Feature modules (Auth, Event, Payment, PromoCode, Report, ...)
|   |   |-- middleware/     Auth, validation, errors, rate limiting
|   |   |-- routes/         API route registry
|   |   `-- shared/         Prisma, response, uploader, ImageKit helpers
|   |-- config/             Environment config
|   |-- helpers/            JWT and user helpers
|   `-- utils/              Email, QR, PDF, event reminder utilities
|-- Dockerfile              Production Docker image
|-- docker-entrypoint.sh    Runs Prisma migrations before production start
|-- vercel.json             Vercel deployment config
`-- package.json            Scripts and dependencies
```

## API Reference

Base URL:

```text
http://localhost:5001/api/v1
```

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Register a user |
| `POST` | `/auth/login` | Public | Login and receive tokens |
| `POST` | `/auth/send-otp` | Public | Send login OTP to email |
| `POST` | `/auth/verify-otp` | Public | Verify OTP and receive tokens |
| `GET` | `/auth/me` | User/Host/Admin | Get current user |
| `POST` | `/auth/forgot-password` | Public | Send password reset email |
| `POST` | `/auth/reset-password` | Public | Reset password |
| `POST` | `/auth/refresh-token` | Public | Issue a new access token |
| `POST` | `/auth/logout` | User/Host/Admin | Logout |

**OTP login example:**

```json
POST /auth/send-otp
{ "email": "user@example.com" }

POST /auth/verify-otp
{ "email": "user@example.com", "otp": "123456" }
```

### Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/users/me` | User/Host/Admin | Get own profile |
| `PATCH` | `/users/update-profile` | User/Host/Admin | Update profile details |
| `PATCH` | `/users/update-profile-image` | User/Host/Admin | Upload profile image |
| `PATCH` | `/users/update-header-image` | User/Host/Admin | Upload header image |
| `GET` | `/users/hosts` | Public | List hosts |
| `GET` | `/users/:id` | Public | Get public profile |
| `GET` | `/users/:id/events` | Public | Get a user's hosted/joined events |
| `GET` | `/users` | Admin | List users |
| `DELETE` | `/users/:id` | Admin | Delete user |

### Events

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/events` | Public | List events with filters |
| `GET` | `/events/trending` | Public | Top events by joins in last 24h (sliding window + max-heap) |
| `GET` | `/events/saved` | User/Host/Admin | List saved events |
| `GET` | `/events/:id` | Public | Get event details |
| `POST` | `/events` | Host/Admin | Create event with optional image upload |
| `PATCH` | `/events/:id` | Host/Admin | Update event |
| `DELETE` | `/events/:id` | Host/Admin | Delete event |
| `POST` | `/events/:id/join` | User/Host/Admin | Join event |
| `DELETE` | `/events/:id/leave` | User/Host/Admin | Leave event |
| `GET` | `/events/:id/ticket/download` | User/Host/Admin | Download ticket PDF |
| `POST` | `/events/:id/invite` | Host/Admin | Invite friend by email |
| `GET` | `/events/:id/invites` | Host/Admin | List invite history for event |
| `PATCH` | `/events/:id/cancel` | Host/Admin | Cancel event |
| `GET` | `/events/:id/waitlist` | Host/Admin | Get waitlist |
| `PATCH` | `/events/:eventId/participants/:userId/approve` | Host/Admin | Approve participant |
| `PATCH` | `/events/:eventId/participants/:userId/reject` | Host/Admin | Reject participant |
| `PATCH` | `/events/:id/participants/:userId/checkin` | Host/Admin | Check in participant |
| `PATCH` | `/events/:id/participants/:userId/undo-checkin` | Host/Admin | Undo check-in |
| `PATCH` | `/events/:eventId/participants/verify/:ticketId` | Host/Admin | Verify QR ticket |
| `POST` | `/events/:id/save` | User/Host/Admin | Save event |
| `DELETE` | `/events/:id/unsave` | User/Host/Admin | Unsave event |
| `GET` | `/events/:id/analytics` | Host/Admin | Event analytics |
| `POST` | `/events/:id/duplicate` | Host/Admin | Duplicate event |

Common `GET /events` query parameters:

| Parameter | Example | Description |
| --- | --- | --- |
| `searchTerm` | `music` | Search by event name or description |
| `type` | `Workshop` | Filter by type/category |
| `location` | `Dhaka` | Filter by location |
| `dateRange` | `week` | Filter by date range |
| `paidOnly` | `true` | Show paid events only |
| `page` | `1` | Page number |
| `limit` | `10` | Items per page |

**Create event fields (multipart/form-data):**

| Field | Required | Description |
| --- | --- | --- |
| `name` | Yes | Event title |
| `description` | Yes | Event description |
| `dateTime` | Yes | ISO datetime |
| `location` | Yes | Venue or address |
| `category` | Yes | e.g. `Movie`, `Music & Concert`, `Technology` |
| `movieName` | No | Movie title for screening events |
| `capacity` | Yes | Max participants |
| `joiningFee` | Yes | Ticket price (0 for free) |
| `type` | Yes | e.g. `In-person` |
| `image` | No | Banner image file |

**Invite friend example:**

```json
POST /events/:id/invite
{
  "email": "friend@example.com",
  "message": "Join me at this event!"
}
```

### Payments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/payments/create-intent` | User/Host/Admin | Create Stripe payment intent (optional promo code) |
| `POST` | `/payments/confirm` | User/Host/Admin | Confirm payment and join event |
| `GET` | `/payments/me` | User/Host/Admin | Get current user's payment history |
| `GET` | `/payments/event/:eventId` | Host/Admin | Get successful payments for an event |

**Payment intent example:**

```json
POST /payments/create-intent
{
  "eventId": "uuid",
  "promoCode": "FRIEND20"
}
```

Response (paid event):

```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "amount": 8,
  "originalAmount": 10,
  "discountAmount": 2,
  "eventName": "Bonolota Express Screening",
  "paymentIntentId": "pi_xxx"
}
```

Response (100% discount):

```json
{
  "freeJoin": true,
  "amount": 0,
  "message": "Promo code applied. Event joined for free!"
}
```

### Promo Codes

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/promo-codes/validate` | User/Host/Admin | Validate promo code for an event |
| `POST` | `/promo-codes` | Host/Admin | Create promo code |
| `GET` | `/promo-codes/event/:eventId` | Host/Admin | List promo codes for event |
| `DELETE` | `/promo-codes/:id` | Host/Admin | Deactivate promo code |

**Create promo code example:**

```json
POST /promo-codes
{
  "code": "FRIEND20",
  "eventId": "uuid",
  "discountType": "PERCENT",
  "discountValue": 20,
  "maxUses": 50,
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

`discountType` values: `PERCENT` | `FIXED`

### Reports

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/reports` | User/Host/Admin | Submit a report |
| `GET` | `/Admin/reports` | Admin | List reports (optional `?status=PENDING`) |
| `PATCH` | `/Admin/reports/:id/status` | Admin | Update report status |

**Create report example:**

```json
POST /reports
{
  "targetType": "EVENT",
  "targetId": "uuid",
  "reason": "Spam or misleading",
  "description": "Optional details"
}
```

`targetType` values: `EVENT` | `USER` | `REVIEW`

Report status values: `PENDING` | `REVIEWED` | `RESOLVED` | `DISMISSED`

### Reviews

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/reviews` | Public | List reviews |
| `GET` | `/reviews/host/:id` | Public | List reviews for a host |
| `POST` | `/reviews` | User/Host/Admin | Create review (one per host, or one per event when `eventId` is set) |

### Analytics

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/analytics/overview` | Admin | Platform overview metrics |

### Admin

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/Admin/users` | Admin | List users |
| `GET` | `/Admin/hosts` | Admin | List hosts |
| `PATCH` | `/Admin/users/:id/role` | Admin | Change user role |
| `PATCH` | `/Admin/users/:id/ban` | Admin | Ban or unban user |
| `DELETE` | `/Admin/users/:id` | Admin | Delete user |
| `GET` | `/Admin/events` | Admin | List events |
| `DELETE` | `/Admin/events/:id` | Admin | Delete event |
| `GET` | `/Admin/stats` | Admin | Admin statistics |
| `GET` | `/Admin/logs` | Admin | System logs |
| `GET` | `/Admin/pending-hosts` | Admin | Pending host approvals |
| `GET` | `/Admin/reports` | Admin | Moderation reports |
| `PATCH` | `/Admin/reports/:id/status` | Admin | Update report status |

### Chat

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/chats/:eventId` | User/Host/Admin | Send event chat message |
| `GET` | `/chats/:eventId` | User/Host/Admin | Get event chat messages |

### Discussions

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/discussions/:eventId` | Public | Get event discussion |
| `POST` | `/discussions/:eventId` | User/Host/Admin | Ask a question |
| `PATCH` | `/discussions/:discussionId/answer` | Host/Admin | Answer a question |

### Follows

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/follows/:hostId/follow` | User/Host/Admin | Follow a host |
| `DELETE` | `/follows/:hostId/unfollow` | User/Host/Admin | Unfollow a host |
| `GET` | `/follows/:hostId/followers` | Public | Get host followers |
| `GET` | `/follows/following` | User/Host/Admin | Get followed hosts |

## Database Models

| Model | Purpose |
| --- | --- |
| `User` | Account, role, auth tokens, verification, OTP login fields, relationships |
| `Profile` | User profile metadata and images |
| `Event` | Event listing, host, status, fee, category, `movieName`, approval settings |
| `Participant` | Event join state, approval status, check-in state, ticket ID |
| `Waitlist` | Waitlisted users for full events |
| `SavedEvent` | User bookmarks |
| `Review` | Host rating and comments, optional `eventId` for per-event reviews |
| `Notification` | In-app notifications |
| `ChatMessage` | Event chat messages |
| `Discussion` | Event Q&A |
| `Follower` | User-to-host follows |
| `Payment` | Stripe payment records with amount, discount, final amount, status |
| `EventInvite` | Email invite history with `SENT` / `ACCEPTED` / `EXPIRED` status |
| `PromoCode` | Host discount codes (`PERCENT` or `FIXED`) |
| `Report` | Safety/moderation reports for events, users, or reviews |

### Enums

| Enum | Values |
| --- | --- |
| `Role` | `USER`, `HOST`, `ADMIN` |
| `EventStatus` | `OPEN`, `FULL`, `CANCELLED`, `COMPLETED` |
| `ParticipantStatus` | `PENDING`, `APPROVED`, `REJECTED` |
| `PaymentStatus` | `PENDING`, `SUCCEEDED`, `FAILED`, `REFUNDED` |
| `InviteStatus` | `SENT`, `ACCEPTED`, `EXPIRED` |
| `ReportTarget` | `EVENT`, `USER`, `REVIEW` |
| `ReportStatus` | `PENDING`, `REVIEWED`, `RESOLVED`, `DISMISSED` |
| `DiscountType` | `PERCENT`, `FIXED` |

## Recent Migrations

| Migration | Description |
| --- | --- |
| `20260623000001_add_followers_chat_discussions` | Followers, chat, discussions, event category columns |
| `20260623120000_add_login_otp` | OTP login fields on `User` |
| `20260623140000_add_payment_invite_promo_report` | Payment, EventInvite, PromoCode, Report tables; `movieName` on Event |

Apply in production:

```bash
npx prisma migrate deploy
```

## Response Shape

Successful responses generally use:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}
```

Errors generally use:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

Common HTTP status codes:

| Code | Meaning |
| --- | --- |
| `400` | Bad request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not found |
| `409` | Conflict |
| `500` | Internal server error |

## Deployment

### Production Build

```bash
npm install
npm run build
npm start
```

### Docker

The Docker image builds the TypeScript app, generates Prisma client, and runs `docker-entrypoint.sh`. The entrypoint runs `npx prisma migrate deploy` when `DATABASE_URL` is available, then starts the server.

```bash
docker build -t eventmate-server .
docker run --env-file .env -p 5001:5001 eventmate-server
```

### Render

1. Connect the GitHub repository.
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add all environment variables from the `.env` section above.
5. Run `npx prisma migrate deploy` on deploy (via entrypoint or manual one-time setup).

### Vercel

This project includes `vercel.json` and `api/index.ts` for Vercel's Node runtime.

Required production environment variables are the same as the `.env` section above.

## Common Issues

- If Prisma fails with `P1001`, the Neon database may be asleep — retry after a few seconds or add `connect_timeout=30` to the database URL.
- If Prisma fails to generate, confirm `DATABASE_URL` and `DIRECT_URL` are valid PostgreSQL URLs.
- If frontend requests are blocked by CORS, set `FRONTEND_URL` to the deployed frontend URL.
- If email verification, OTP, or password reset links are wrong, check `FRONTEND_URL`.
- If ImageKit uploads fail, confirm all ImageKit keys and endpoint are set.
- If Stripe payments fail, confirm the frontend publishable key and backend secret key belong to the same Stripe account/mode.
- If a migration is stuck, use `npx prisma migrate resolve --applied <migration_name>` for already-applied migrations, then run `migrate deploy` again.

## Related

- [EventMate Client](../eventmate_client/README.md)

## License

ISC
