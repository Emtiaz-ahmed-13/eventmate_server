# EventMate Server 🚀

EventMate Server is the backend application for the Events & Activities Platform. It provides a robust API for user authentication, event management, participant tracking, and review systems.

## 🛠 Tech Stack

- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Validation**: [Zod](https://zod.dev/)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Bcrypt for password hashing, Express Rate Limit
- **Real-time**: [Socket.io](https://socket.io/)
- **Email**: [Nodemailer](https://nodemailer.com/)
- **Image Management**: [ImageKit](https://imagekit.io/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

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
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/eventmate"
   NODE_ENV="development"
   PORT=5001
   JWT_ACCESS_SECRET="your_access_secret"
   JWT_ACCESS_EXPIRES_IN="30d"
   BCRYPT_SALT_ROUNDS=12
   
   # Email Config
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT=587
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"

   # ImageKit Config
   IMAGEKIT_PUBLIC_KEY="your_public_key"
   IMAGEKIT_PRIVATE_KEY="your_private_key"
   IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id"
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🛤 API Reference

All routes are prefixed with `/api/v1`.

### 🔐 Authentication

#### **Register User**
- **URL**: `/auth/register`
- **Method**: `POST`
- **Description**: Registers a new user.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### **Login User**
- **URL**: `/auth/login`
- **Method**: `POST`
- **Description**: Authenticates a user and returns a token.
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### 👤 Users

#### **Get My Profile**
- **URL**: `/users/me`
- **Method**: `GET`
- **Headers**: `Authorization: <token>`
- **Description**: Returns the profile of the logged-in user.

#### **Update Profile**
- **URL**: `/users/update-profile`
- **Method**: `PATCH`
- **Headers**: `Authorization: <token>`
- **Description**: Updates the current user's profile details.
- **Request Body**:
  ```json
  {
    "profileImage": "https://example.com/image.jpg",
    "bio": "I am a software engineer",
    "interests": ["coding", "reading"],
    "location": "Dhaka, Bangladesh"
  }
  ```

#### **Get Public Profile**
- **URL**: `/users/:id`
- **Method**: `GET`
- **Description**: Returns public profile info of any user.

### 📅 Events

#### **Create Event**
- **URL**: `/events`
- **Method**: `POST`
- **Headers**: `Authorization: <token>` (Required: Role `HOST` or `ADMIN`)
- **Request Body**:
  ```json
  {
    "name": "Summer Beach Party",
    "type": "Social",
    "dateTime": "2024-06-15T18:00:00.000Z",
    "location": "Cox's Bazar",
    "minParticipants": 10,
    "maxParticipants": 50,
    "description": "Fun at the beach",
    "image": "https://example.com/party.jpg",
    "joiningFee": 500
  }
  ```

#### **Get All Events**
- **URL**: `/events`
- **Method**: `GET`
- **Query Params**:
  - `searchTerm`: Search by name or description
  - `type`: Filter by event type
  - `location`: Filter by location
- **Description**: Fetches all available events with optional filtering.

#### **Join Event**
- **URL**: `/events/:id/join`
- **Method**: `POST`
- **Headers**: `Authorization: <token>`
- **Description**: Allows a user to join an event.

#### **Leave Event**
- **URL**: `/events/:id/leave`
- **Method**: `DELETE`
- **Headers**: `Authorization: <token>`
- **Description**: Allows a user to leave a joined event.

### ⭐ Reviews

#### **Post Review**
- **URL**: `/reviews`
- **Method**: `POST`
- **Headers**: `Authorization: <token>`
- **Description**: Rate and review a host.
- **Request Body**:
  ```json
  {
    "hostId": "host-uuid",
    "rating": 5,
    "comment": "Great host!"
  }
  ```

### 📊 Analytics (Admin)

#### **Get Overview Stats**
- **URL**: `/analytics/overview`
- **Method**: `GET`
- **Headers**: `Authorization: <token>` (Required: Role `ADMIN`)
- **Description**: Get platform growth stats, revenue, and trending data.

### 🔔 Notifications
- **Real-time (Socket.io)**: Connect via Socket.io at the server root.
- **Email**: Sent automatically on key events (e.g., joining an event).

## 📜 Available Scripts

- `npm run dev`: Starts the application in development mode with auto-reload.
- `npm run build`: Generates Prisma client and compiles TypeScript to JavaScript.
- `npm start`: Runs the compiled application.
- `npx prisma studio`: Opens Prisma GUI to manage database.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the ISC License.
