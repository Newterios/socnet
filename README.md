# SocialNet - Social Network Platform

**Team**
- Aitbek Nugmanov
- Syrym Shadiyarbek
- Rakhat Balgabekov

**Course**
- Advanced Programming 1 (Go)

## Overview

SocialNet is a social network application with a Golang backend and React frontend. It features user authentication, posts with likes and comments, friend requests, private messaging, groups, notifications, and admin moderation capabilities.

## Features

### Core Features
- User registration and authentication (JWT-based)
- User profiles with bio and avatar
- Posts with create, edit, delete operations
- Like and comment on posts
- News feed based on friends and own posts
- Friend request workflow (send, accept, block)
- Private messaging between friends
- Groups with membership and posts
- Notifications for social actions
- Reporting and moderation system
- Admin panel in frontend (`/admin`) for reports and moderation actions
- Group posts creation and history in frontend
- Background workers for async processing
- Rate limiting

### Technical Features
- Clean architecture with separation of concerns
- Repository pattern for data access
- Service layer for business logic
- JWT authentication
- Password hashing with bcrypt
- Input validation
- Concurrency with goroutines and channels
- SQLite database with migrations

## Project Structure

```
socialnet/
├── main.go                          # Application entry point
├── frontend/                        # React frontend (Vite)
├── internal/
│   ├── config/                      # Configuration management
│   ├── database/                    # Database connection and migrations
│   ├── http/
│   │   ├── handler/                 # HTTP request handlers
│   │   ├── middleware/              # Authentication, rate limiting
│   │   └── router.go                # Route definitions
│   ├── model/                       # Domain models and DTOs
│   ├── repository/                  # Database access layer
│   ├── security/                    # Password hashing, JWT, validation
│   ├── service/                     # Business logic layer
│   └── worker/                      # Background workers
└── docs/                            # Project documentation
```

## Setup and Installation

### Prerequisites
- Go 1.22 or higher
- SQLite3

### Installation

1. Clone the repository
```bash
git clone https://github.com/newterios/socialnet
cd socialnet
```

2. Install dependencies
```bash
go mod tidy
```

3. Run the application
```bash
go run main.go
```

The server will start on `http://localhost:8080` by default.

4. Run frontend (optional)
```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173` and proxies API requests to backend.

### Configuration

Configure the application using environment variables:
- `DB_PATH`: Database file path (default: `socialnet.db`)
- `SERVER_PORT`: Server port (default: `8080`)
- `JWT_SECRET`: Secret key for JWT tokens
- `SESSION_DURATION`: Session duration (default: `24h`)
- `RATE_LIMIT_PER_MIN`: Rate limit per minute (default: `60`)

To grant admin access for an existing user:
```bash
sqlite3 socialnet.db "UPDATE users SET is_admin = 1 WHERE email = 'your_email@example.com';"
```
After that, login again to receive a new JWT with admin claims.

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token

### Users
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update profile (authenticated)
- `GET /users/search?q=query` - Search users

### Posts
- `POST /posts` - Create post
- `GET /posts/:id` - Get post
- `PUT /posts/:id` - Update post (owner only)
- `DELETE /posts/:id` - Delete post (owner/admin)
- `GET /feed` - Get personalized feed

### Social
- `POST /posts/:id/like` - Like post
- `DELETE /posts/:id/like` - Unlike post
- `POST /posts/:id/comments` - Comment on post
- `GET /posts/:id/comments` - Get comments

### Friends
- `POST /friends/request` - Send friend request
- `GET /friends/pending` - Get pending requests
- `PUT /friends/:id/accept` - Accept request
- `PUT /friends/:id/block` - Block user
- `GET /friends` - Get friends list

### Messaging
- `POST /conversations` - Start conversation
- `GET /conversations` - Get conversations
- `POST /conversations/:id/messages` - Send message
- `GET /conversations/:id/messages` - Get messages

### Groups
- `POST /groups` - Create group
- `GET /groups` - Get user's groups
- `GET /groups/:id` - Get group details
- `POST /groups/:id/join` - Join group
- `DELETE /groups/:id/leave` - Leave group
- `POST /groups/:id/posts` - Post to group
- `GET /groups/:id/posts` - Get group posts

### Notifications
- `GET /notifications` - Get notifications
- `PUT /notifications/:id/read` - Mark as read
- `GET /notifications/unread` - Get unread count

### Admin
- `POST /reports` - Create report
- `GET /admin/reports` - Get reports (admin only)
- `PUT /admin/reports/:id` - Review report (admin only)
- `DELETE /admin/content/:type/:id` - Delete content (admin only)

## Testing

### Run Tests
```bash
go test ./...
```

### Run Tests with Coverage
```bash
go test ./... -cover
```

### Manual Testing with curl

**Register**
```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123!","full_name":"Test User"}'
```

**Login**
```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

**Create Post** (with token)
```bash
curl -X POST http://localhost:8080/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"content":"Hello, SocialNet!"}'
```

## Architecture

### Layered Architecture
1. **HTTP Layer**: Handles HTTP requests, authentication, routing
2. **Service Layer**: Business logic and validation
3. **Repository Layer**: Database access and queries
4. **Model Layer**: Domain entities and DTOs

### Concurrency
- Background worker processes notifications asynchronously using channels
- Cleanup worker runs periodically to remove old notifications
- Rate limiter uses concurrent map with mutex for thread safety

### Security
- Password hashing with bcrypt (cost factor 12)
- JWT tokens for stateless authentication
- Input validation for all user inputs
- Authorization checks on all protected endpoints
- Rate limiting to prevent abuse
- SQL injection prevention via parameterized queries

## Documentation

See `docs/` directory for:
- Project proposal
- Architecture and design
- Diagrams (ERD, UML, Use Case, Sequence)
- Project plan and task distribution

## Database Schema

The application uses SQLite with the following tables:
- users
- posts, comments, likes
- friendships
- conversations, conversation_members, messages
- groups, group_members, group_posts
- notifications
- reports

See `internal/database/migrations.go` for full schema.

## License

This project is created for educational purposes as part of Advanced Programming 1 course.
