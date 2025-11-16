# Tower Defence Game - Monorepo

A blockchain-based tower defense game with Web3 authentication and real-time multiplayer chat.

## Project Structure

```
tower-defence/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   ├── lib/          # Game logic and utilities
│   └── types/        # TypeScript type definitions
│
└── backend/          # NestJS backend API
    ├── src/
    │   ├── modules/
    │   │   ├── auth/        # SIWE authentication
    │   │   └── game/        # Game recording & leaderboard
    │   └── shared/
    │       └── database/    # Drizzle ORM schema
    └── drizzle/            # Database migrations
```

## Tech Stack

### Frontend
- **Next.js 16** - React framework
- **Wagmi + RainbowKit** - Web3 wallet connection
- **SIWE** - Sign-In with Ethereum
- **Socket.io** - Real-time chat

### Backend
- **NestJS** - Node.js framework
- **Drizzle ORM** - Type-safe PostgreSQL ORM
- **JWT** - Stateless authentication
- **Socket.io** - WebSocket server
- **Hexagonal Architecture** - Clean architecture pattern

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

2. **Setup database:**
```bash
# Create PostgreSQL database
createdb tower_defence

# Configure environment variables
cp backend/.env.example backend/.env

# Run migrations
cd backend
npm run db:push
```

3. **Run development servers:**
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run start:dev
```

## Features

- 🎮 Tower defense gameplay with 5 unique maps
- 🔐 Web3 authentication via Sign-In with Ethereum (SIWE)
- 💬 Real-time global chat
- 🏆 Global leaderboard
- 👤 User profiles with customizable usernames
- 📊 Game replay system with full state recording
- 🎯 Drag & drop tower placement
- 💰 Tower selling/refund mechanism

## Development Status

- [x] Core game mechanics
- [x] Monorepo structure
- [ ] Backend API implementation
- [ ] Web3 authentication
- [ ] Real-time chat
- [ ] Game recording
- [ ] Frontend integration

## License

MIT
