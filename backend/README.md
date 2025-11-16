# Tower Defence Backend

NestJS backend API with SIWE authentication and game recording.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Setup database:**
```bash
# Create PostgreSQL database
createdb tower_defence

# Push schema to database
npm run db:push
```

4. **Run development server:**
```bash
npm run start:dev
```

Server will be running at `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/challenge` - Generate SIWE challenge message
  ```json
  { "walletAddress": "0x..." }
  ```

- `POST /api/auth/verify` - Verify signature and login
  ```json
  {
    "message": "...",
    "signature": "0x..."
  }
  ```

- `POST /api/auth/refresh` - Refresh access token
  ```json
  { "refreshToken": "..." }
  ```

- `POST /api/auth/logout` - Logout (revoke refresh token)
  ```json
  { "refreshToken": "..." }
  ```

### Game

- `POST /api/game/record` - Record game (requires auth)
  ```json
  {
    "score": 1000,
    "wavesCompleted": 10,
    "gameState": { ... },
    "startedAt": "2024-01-01T00:00:00Z",
    "completedAt": "2024-01-01T00:10:00Z"
  }
  ```

- `GET /api/game/leaderboard?limit=100` - Get leaderboard

- `GET /api/game/history?limit=10` - Get user game history (requires auth)

- `GET /api/game/:id` - Get game details (requires auth)

## Architecture

Hexagonal Architecture (Ports & Adapters):

```
src/
├── modules/
│   ├── auth/
│   │   ├── domain/           # Business logic & interfaces
│   │   ├── application/      # Use cases & services
│   │   ├── infrastructure/   # External adapters (DB, SIWE)
│   │   └── presentation/     # Controllers & DTOs
│   └── game/
│       └── ...
└── shared/
    ├── database/            # Database connection & schema
    ├── guards/              # Auth guards
    └── decorators/          # Custom decorators
```

## Database Schema

- `users` - User profiles
- `games` - Game records with replay state
- `refresh_tokens` - JWT refresh tokens

## Tech Stack

- **NestJS** - Node.js framework
- **Drizzle ORM** - Type-safe SQL
- **PostgreSQL** - Database
- **SIWE** - Sign-In with Ethereum
- **JWT** - Stateless authentication
- **Passport** - Auth middleware
