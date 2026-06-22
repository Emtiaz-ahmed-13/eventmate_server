# EventMate Server

<p align="center">
  <img src="../eventmate_client/public/eventmate.png" alt="EventMate logo" width="600" />
</p>

<p align="center">
  <strong>Express, TypeScript, Prisma, PostgreSQL, Stripe, ImageKit, email, and Socket.IO backend for EventMate.</strong>
</p>

<p align="center">
  <a href="https://eventmate-server-5.onrender.com/">Backend API</a> |
  <a href="https://eventmate-client-1.onrender.com/">Live App</a> |
  <a href="../eventmate_client/README.md">Client README</a>
</p>

## Overview

EventMate Server powers authentication, users, host profiles, events, event participants, payments, reviews, notifications, QR tickets, chat, discussions, following, analytics, and admin moderation for the EventMate platform.

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
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Authentication | JWT access and refresh tokens |
| File uploads | Multer, ImageKit |
| Email | Nodemailer |
| Payments | Stripe |
| Real-time | Socket.IO |
| Scheduling | node-cron |
| Rate limiting | express-rate-limit |
| Deployment support | Docker, Vercel |

## Features

- Register, login, logout, refresh token, current-user lookup, forgot password, and reset password.
- Role-based access control for `USER`, `HOST`, and `ADMIN`.
- User profiles with bio, interests, location, profile image, and header image.
- Event CRUD with image upload, filtering, join/leave, waitlist, approval, duplication, cancellation, and host analytics.
- Saved events and public host discovery.
- Stripe payment intent creation and payment confirmation.
- Participant ticketing with QR generation, PDF tickets, email delivery, and QR verification.
- Host reviews and public review listing.
- Real-time notifications and event reminders.
- Event chat rooms and event discussion Q&A.
- Host follow/unfollow flow and follower listing.
- Admin tools for users, hosts, events, system logs, statistics, and pending host approvals.

## Roles

| Role | Common permissions |
| --- | --- |
| `USER` | Join events, save events, leave reviews, chat, ask questions, follow hosts |
| `HOST` | Manage own events, participants, waitlists, analytics, ticket scanning, discussion answers |
| `ADMIN` | Manage users, hosts, events, logs, stats, and moderation |

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

DATABASE_URL="postgresql://user:password@host:5432/eventmate?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/eventmate?schema=public"

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

Generate Prisma client and sync the database during local development:

```bash
npx prisma generate
npx prisma db push
```

Start the development server:

```bash
npm run dev
```

The server will run on `http://localhost:5001`.

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
|   `-- schema.prisma       Prisma schema and database models
|-- src/
|   |-- app.ts              Express app, CORS, middleware, API routes
|   |-- server.ts           HTTP server and Socket.IO bootstrap
|   |-- app/
|   |   |-- modules/        Feature modules
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
| `GET` | `/auth/me` | User/Host/Admin | Get current user |
| `POST` | `/auth/forgot-password` | Public | Send password reset email |
| `POST` | `/auth/reset-password` | Public | Reset password |
| `POST` | `/auth/refresh-token` | Public | Issue a new access token |
| `POST` | `/auth/logout` | User/Host/Admin | Logout |

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
| `GET` | `/events/saved` | User/Host/Admin | List saved events |
| `GET` | `/events/:id` | Public | Get event details |
| `POST` | `/events` | Host/Admin | Create event with optional image upload |
| `PATCH` | `/events/:id` | Host/Admin | Update event |
| `DELETE` | `/events/:id` | Host/Admin | Delete event |
| `POST` | `/events/:id/join` | User/Host/Admin | Join event |
| `DELETE` | `/events/:id/leave` | User/Host/Admin | Leave event |
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

### Payments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/payments/create-intent` | User/Host/Admin | Create Stripe payment intent |
| `POST` | `/payments/confirm` | User/Host/Admin | Confirm payment and join event |

### Reviews

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/reviews` | Public | List reviews |
| `GET` | `/reviews/host/:id` | Public | List reviews for a host |
| `POST` | `/reviews` | User/Host/Admin | Create review |

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
| `User` | Account, role, auth tokens, verification, relationships |
| `Profile` | User profile metadata and images |
| `Event` | Event listing, host, status, fee, category, approval settings |
| `Participant` | Event join state, approval status, check-in state, ticket ID |
| `Waitlist` | Waitlisted users for full events |
| `SavedEvent` | User bookmarks |
| `Review` | Host rating and comments |
| `Notification` | In-app notifications |
| `ChatMessage` | Event chat messages |
| `Discussion` | Event Q&A |
| `Follower` | User-to-host follows |

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

### Vercel

This project includes `vercel.json` and `api/index.ts` for Vercel's Node runtime.

Required production environment variables are the same as the `.env` section above.

## Common Issues

- If Prisma fails to generate, confirm `DATABASE_URL` and `DIRECT_URL` are valid PostgreSQL URLs.
- If frontend requests are blocked by CORS, set `FRONTEND_URL` to the deployed frontend URL.
- If email verification or password reset links are wrong, check `FRONTEND_URL`.
- If ImageKit uploads fail, confirm all ImageKit keys and endpoint are set.
- If Stripe payments fail, confirm the frontend publishable key and backend secret key belong to the same Stripe account/mode.

## Related

- [EventMate Client](../eventmate_client/README.md)

## License

ISC
