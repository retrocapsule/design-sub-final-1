# Design Subscription Service

A web application for a subscription-based unlimited graphic design service. This application allows users to subscribe to design services, submit design requests, communicate with designers, and manage their subscriptions.

## Features

- **User Authentication:** Secure login and registration system
- **Design Request Management:** Submit, track, and revise design requests
- **File Management:** View and download completed designs
- **Subscription Management:** Subscribe, upgrade, or cancel plans using Stripe
- **User Dashboard:** Manage design requests and account settings
- **Admin Dashboard:** Oversee customers, design requests, and subscriptions
- **Communication:** In-app messaging between clients and designers

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS
- **UI Components:** Shadcn UI
- **Authentication:** NextAuth.js
- **Database:** PostgreSQL with Prisma ORM
- **Payment Processing:** Stripe API
- **File Storage:** AWS S3 (or alternatives like Cloudinary)
- **Deployment:** Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/design-subscription-service.git
cd design-subscription-service
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
   - Copy `.env.example` to `.env` and fill in your values:
```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/designservice?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_API_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

# AWS S3 (if using S3 for file storage)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="your-aws-region"
AWS_BUCKET_NAME="your-aws-bucket"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Initialize the database
```bash
npx prisma db push
```

5. Start the development server
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment Guide

### Deploying to Vercel

1. Push your code to GitHub

2. Create a Vercel account at [vercel.com](https://vercel.com) if you don't have one

3. Create a new project and import your GitHub repository

4. Configure your environment variables in the Vercel dashboard

5. Deploy!

### Database Setup

1. Set up a PostgreSQL database using providers like:
   - [Railway](https://railway.app/)
   - [Supabase](https://supabase.com/)
   - [PlanetScale](https://planetscale.com/)
   - [Neon](https://neon.tech/)

2. Get your database connection URL and add it to your Vercel environment variables

### Setting Up Stripe

1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Set up your subscription products and prices in the Stripe dashboard
4. Update your environment variables with the Stripe keys and product IDs

### File Storage Setup

For AWS S3:
1. Create an AWS account if you don't have one
2. Create an S3 bucket and IAM user with proper permissions
3. Add your AWS credentials to environment variables

Alternatively, you can use services like Cloudinary or Uploadthing.

## Development

### Project Structure

```
design-subscription-service/
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── api/         # API routes
│   │   ├── admin/       # Admin dashboard pages
│   │   ├── dashboard/   # User dashboard pages
│   │   └── ...          # Other pages
│   ├── components/      # React components
│   │   ├── admin/       # Admin components
│   │   ├── auth/        # Authentication components
│   │   ├── dashboard/   # Dashboard components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # UI components (Shadcn)
│   ├── lib/             # Utility functions and libraries
│   │   ├── db.ts        # Database client
│   │   └── stripe.ts    # Stripe utilities
│   └── types/           # TypeScript type definitions
├── .env                 # Environment variables
└── ...                  # Configuration files
```

### Adding New Features

1. Define the database schema changes in `prisma/schema.prisma`
2. Apply the changes with `npx prisma db push`
3. Create or modify API endpoints in `src/app/api/`
4. Build UI components in `src/components/`
5. Create or update pages in `src/app/`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request