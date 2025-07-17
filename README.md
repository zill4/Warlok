# Warlok

A chess-card game hybrid built with Three.js and modern web technologies. Players use cards from their deck to place chess pieces on a 3D board, combining strategic chess gameplay with card game mechanics.

## Features

- **3D Chess Game**: Interactive chess board rendered with Three.js
- **Card System**: Play cards from your deck to place pieces on the board
- **AI Opponent**: Play against a bot with strategic decision-making
- **User Profiles**: Create accounts and manage your card collection
- **Card Creation**: Design custom cards with different chess pieces and artwork
- **Real-time Gameplay**: Smooth animations and responsive 3D interactions

## Tech Stack

- **Frontend**: Astro + Preact + Three.js
- **Backend**: Node.js + Fastify + Prisma
- **Database**: PostgreSQL
- **Monorepo**: Turborepo for efficient builds
- **Planned**: Solana integration for NFT minting, S3 for asset storage

## Project Structure

```
Warlok/
├── apps/
│   ├── frontend/     # Astro + Preact app with 3D chess game
│   └── backend/      # Node.js API server with Prisma
├── packages/
│   ├── shared-types/ # Shared TypeScript types
│   ├── ui/           # Reusable UI components
│   └── eslint-config/ # ESLint configuration
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/warlok.git
   cd warlok
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database**

   ```bash
   # Navigate to backend and set up Prisma
   cd apps/backend
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Configure environment variables**
   Create `.env` files in both apps:

   **Backend (`apps/backend/.env`):**

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/warlok?schema=public"
   JWT_SECRET="your-jwt-secret"
   ```

   **Frontend (`apps/frontend/.env`):**

   ```env
   PUBLIC_API_URL="http://localhost:3001"
   ```

5. **Start the development servers**

   ```bash
   # In the root directory
   npm run dev
   ```

   This will start:

   - Frontend: http://localhost:4321
   - Backend: http://localhost:3001

## How to Play

1. **Move Chess Pieces**: Click and drag pieces like traditional chess
2. **Play Cards**: Use cards from your hand to place new pieces on the board
3. **Strategic Gameplay**: Combine chess tactics with card game resource management
4. **AI Opponent**: Challenge the computer bot that adapts to your playstyle

## Development

### Available Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all apps for production
- `npm run lint` - Run linting across all packages
- `npm run format` - Format code with Prettier

### Game Development

The core game logic is in `apps/frontend/src/game/`:

- `app.ts` - Main game initialization
- `board.ts` - Chess board management
- `card.ts` - Card system logic
- `bot.ts` - AI opponent behavior
- `state.ts` - Game state management

### Backend API

The backend provides:

- User authentication and profiles
- Card creation and management
- Game history tracking
- Database management with Prisma

## Current Status

✅ **Complete**

- 3D chess game with Three.js
- Card system integration
- AI opponent
- Basic user authentication
- Profile management

🚧 **In Progress**

- Card creation UI improvements
- Multiplayer support
- Advanced card effects
- Asset generation pipeline

🔮 **Planned**

- Solana NFT integration (maybe...)
- Tournament system
- Advanced AI difficulty levels
- Mobile responsiveness

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Submit a pull request with a clear description

---

_Built with <3_
