# GitHub Card Generator

A Next.js application that generates beautiful GitHub profile cards and enables time-limited sharing of these cards.

## Features

- GitHub authentication
- GitHub profile card generation
- Time-limited sharing links (3 days)
- Database storage for users and shared links
- Tracking of user behaviors for analytics
- Server-side GitHub API requests with caching

## Security Refactoring

The application has undergone a significant security refactoring:

- **Server-side GitHub API**: All GitHub API calls are now made server-side to prevent token exposure
- **Edge Config Caching**: Uses Vercel Edge Config for persistent caching with memory fallback
- **Cache Management**: Implemented automatic cache cleanup via cron jobs
- **Metrics Tracking**: Added cache performance metrics to monitor effectiveness
- **Leaderboard Security**: Refactored leaderboard data to ensure contributions are verified server-side

### Caching System

- Edge Config for persistent caching between deployments
- Memory cache fallback for development and when Edge Config is unavailable
- Automatic cache cleanup via scheduled cron jobs
- Cache metrics for monitoring hit rates and performance

## Tech Stack

- **Framework**: Next.js 15
- **Authentication**: NextAuth.js with GitHub provider
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Caching**: Vercel Edge Config

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- Yarn package manager
- GitHub OAuth application
- Neon PostgreSQL database

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/github-card.git
cd github-card
```

2. Install dependencies:

```bash
yarn install
```

3. Set up environment variables:

Copy the example environment file and fill in your values:

```bash
cp example.env .env.local
```

Required environment variables:

- `NEXTAUTH_URL`: Your production URL
- `NEXTAUTH_SECRET`: Secret for NextAuth
- `GITHUB_ID`: GitHub OAuth App Client ID
- `GITHUB_SECRET`: GitHub OAuth App Client Secret
- `DATABASE_URL`: Neon PostgreSQL connection string
- `GITHUB_ACCESS_TOKEN`: GitHub Personal Access Token for server-side API calls
- `EDGE_CONFIG`: Vercel Edge Config connection string

4. Set up the database:

```bash
# Generate migrations
yarn db:generate

# Push schema to database
yarn db:push

# (Optional) Seed the database with sample data
yarn db:seed
```

5. Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.
