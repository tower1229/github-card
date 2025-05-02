# GitHub Card Generator

A Next.js application that generates beautiful GitHub profile cards and enables time-limited sharing of these cards.

## Features

- GitHub authentication
- GitHub profile card generation
- Time-limited sharing links (3 days)
- Database storage for users and shared links
- Tracking of user behaviors for analytics

## Tech Stack

- **Framework**: Next.js 15
- **Authentication**: NextAuth.js with GitHub provider
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

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

- `NEXTAUTH_URL`: Your app URL (e.g., http://localhost:3000 for local development)
- `NEXTAUTH_SECRET`: Secret for NextAuth (generate using `openssl rand -base64 32`)
- `GITHUB_ID`: GitHub OAuth App Client ID
- `GITHUB_SECRET`: GitHub OAuth App Client Secret
- `DATABASE_URL`: Neon PostgreSQL connection string

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

## Database Schema

The application uses the following database tables:

- **users**: Stores GitHub user information
- **user_behaviors**: Tracks user actions (login, card generation, link sharing)
- **share_links**: Stores generated share links with expiration dates

## API Endpoints

- **Authentication**: `/api/auth/[...nextauth]`
- **Share Links**:
  - `POST /api/share-links`: Create a new share link
  - `GET /api/share-links`: List current user's share links
  - `GET /api/share-links/:token`: Get a specific share link by token
  - `GET /api/share-links/user/:userId`: Get all share links for a user

## Deployment

### Deploy on Vercel

1. Create a Neon PostgreSQL database
2. Set up environment variables in Vercel
3. Deploy the application

```bash
vercel
```

### Environment Variables for Production

Make sure to set these environment variables in your Vercel project:

- `NEXTAUTH_URL`: Your production URL
- `NEXTAUTH_SECRET`: Secret for NextAuth
- `GITHUB_ID`: GitHub OAuth App Client ID
- `GITHUB_SECRET`: GitHub OAuth App Client Secret
- `DATABASE_URL`: Neon PostgreSQL connection string

## License

This project is licensed under the MIT License - see the LICENSE file for details.
