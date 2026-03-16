# EventMate Server

EventMate is a full-featured event management platform backend built with Node.js, Express, and PostgreSQL. It provides comprehensive APIs for user authentication, event management, reviews, and analytics.

## Features

- User authentication with JWT tokens
- Event creation and management
- User profiles and event participation
- Event reviews and ratings
- Saved events functionality
- Event waitlist management
- Email notifications and reminders
- Admin analytics dashboard
- Role-based access control (USER, HOST, ADMIN)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma 6
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **File Upload**: ImageKit
- **Scheduling**: node-cron
- **Real-time**: Socket.io

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eventmate_server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
```env
PORT=5001
DATABASE_URL="postgresql://postgres:password@localhost:5432/eventmate?schema=public"
NODE_ENV="development"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="1d"
JWT_REFRESH_TOKEN_SECRET="your_refresh_secret"
JWT_REFRESH_TOKEN_EXPIRES_IN="30d"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY="your_public_key"
IMAGEKIT_PRIVATE_KEY="your_private_key"
IMAGEKIT_URL_ENDPOINT="your_endpoint"
```

5. Set up the database:
```bash
npx prisma migrate deploy
```

6. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5001`

## API Documentation

### Base URL
```
http://localhost:5001/api/v1
```

### Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### Auth Module (`/auth`)

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "USER"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": { user object }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": { user object }
}
```

#### Verify Email
```
GET /auth/verify-email?token=verification_token

Response: 200 OK
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### Forgot Password
```
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}

Response: 200 OK
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

#### Reset Password
```
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "newPassword": "newpassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### Refresh Token
```
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### User Module (`/users`)

#### Get My Profile
```
GET /users/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": { user profile object }
}
```

#### Update Profile
```
PATCH /users/update-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "bio": "My bio",
  "location": "New York",
  "interests": ["sports", "music"]
}

Response: 200 OK
{
  "success": true,
  "data": { updated profile object }
}
```

#### Get All Users (Admin Only)
```
GET /users
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "data": [ array of user objects ]
}
```

#### Get User Profile by ID
```
GET /users/:id

Response: 200 OK
{
  "success": true,
  "data": { user profile object }
}
```

#### Get User's Events
```
GET /users/:id/events

Response: 200 OK
{
  "success": true,
  "data": [ array of event objects ]
}
```

#### Delete User (Admin Only)
```
DELETE /users/:id
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### Event Module (`/events`)

#### Get All Events
```
GET /events?page=1&limit=10&search=keyword

Response: 200 OK
{
  "success": true,
  "data": [ array of event objects ],
  "pagination": { page, limit, total }
}
```

#### Get Single Event
```
GET /events/:id

Response: 200 OK
{
  "success": true,
  "data": { event object }
}
```

#### Create Event (Host/Admin)
```
POST /events
Authorization: Bearer <host_token>
Content-Type: multipart/form-data

{
  "name": "Tech Conference 2024",
  "type": "Conference",
  "dateTime": "2024-04-15T10:00:00Z",
  "location": "New York",
  "minParticipants": 10,
  "maxParticipants": 100,
  "description": "Annual tech conference",
  "joiningFee": 50,
  "image": <file>
}

Response: 201 Created
{
  "success": true,
  "data": { created event object }
}
```

#### Update Event (Host/Admin)
```
PATCH /events/:id
Authorization: Bearer <host_token>
Content-Type: application/json

{
  "name": "Updated Event Name",
  "description": "Updated description",
  "maxParticipants": 150
}

Response: 200 OK
{
  "success": true,
  "data": { updated event object }
}
```

#### Delete Event (Host/Admin)
```
DELETE /events/:id
Authorization: Bearer <host_token>

Response: 200 OK
{
  "success": true,
  "message": "Event deleted successfully"
}
```

#### Join Event
```
POST /events/:id/join
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Joined event successfully"
}
```

#### Leave Event
```
DELETE /events/:id/leave
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Left event successfully"
}
```

#### Cancel Event (Host/Admin)
```
PATCH /events/:id/cancel
Authorization: Bearer <host_token>

Response: 200 OK
{
  "success": true,
  "message": "Event cancelled successfully"
}
```

#### Get Event Waitlist (Host/Admin)
```
GET /events/:id/waitlist
Authorization: Bearer <host_token>

Response: 200 OK
{
  "success": true,
  "data": [ array of waitlisted users ]
}
```

---

### Review Module (`/reviews`)

#### Get Host Reviews
```
GET /reviews/host/:hostId

Response: 200 OK
{
  "success": true,
  "data": [ array of review objects ]
}
```

#### Create Review
```
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "hostId": "host_user_id",
  "rating": 5,
  "comment": "Great event organizer!"
}

Response: 201 Created
{
  "success": true,
  "data": { created review object }
}
```

---

### Saved Events Module (`/events`)

#### Save Event
```
POST /events/:id/save
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Event saved successfully"
}
```

#### Unsave Event
```
DELETE /events/:id/unsave
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Event unsaved successfully"
}
```

#### Get Saved Events
```
GET /events/saved
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [ array of saved event objects ]
}
```

---

### Analytics Module (`/analytics`)

#### Get Overview Stats (Admin Only)
```
GET /analytics/overview
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalEvents": 45,
    "totalParticipants": 500,
    "totalReviews": 120
  }
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Schema

The application uses the following main models:

- **User** - User accounts with roles (USER, HOST, ADMIN)
- **Event** - Event listings with details and status
- **Participant** - Event participation records
- **Review** - User reviews for event hosts
- **SavedEvent** - Bookmarked events
- **Waitlist** - Waitlist for full events
- **Notification** - User notifications
- **Profile** - Extended user profile information

---

## Development

### Run Development Server
```bash
npm run dev
```

### Generate Prisma Client
```bash
npm run generate
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

---

## Project Structure

```
src/
├── app/
│   ├── modules/
│   │   ├── Auth/
│   │   ├── User/
│   │   ├── Event/
│   │   ├── Review/
│   │   ├── SavedEvent/
│   │   ├── Analytics/
│   │   └── Notification/
│   ├── middleware/
│   ├── errors/
│   ├── shared/
│   └── routes/
├── helpers/
├── utils/
├── libs/
├── config/
└── server.ts
```

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## License

ISC

---

## Support

For issues and questions, please create an issue in the repository.
