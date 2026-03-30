# SprintWork Deployment Guide

## Overview
SprintWork is a full-stack TypeScript application with **Manus-integrated AI**, **TiDB Cloud database**, and **OAuth authentication**. This guide covers deployment to Vercel with all features enabled.

## Prerequisites
- GitHub account (repository already set up)
- Vercel account (free tier available)
- TiDB Cloud account (free tier available)
- Optional: Google and GitHub OAuth credentials for third-party login

## Database Setup (TiDB Cloud)

Your database is already configured:
- **Connection String**: `mysql://a2xXqbP1YKYZnPR.root:Ml8MTBkj61gN8MAS@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/sprintwork`
- **Schema**: Automatically migrated via Drizzle ORM
- **Free Tier**: 5GB storage, sufficient for MVP

## Deployment to Vercel

### Step 1: Connect GitHub Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Select "Import Git Repository"
4. Find and select `Samkele05/SprintWork`

### Step 2: Configure Environment Variables
In Vercel project settings, add these environment variables:

```
NODE_ENV=production
PORT=3000

DATABASE_URL=mysql://a2xXqbP1YKYZnPR.root:Ml8MTBkj61gN8MAS@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/sprintwork?ssl={"rejectUnauthorized":true}

JWT_SECRET=sprintwork-prod-secret-2026

BUILT_IN_FORGE_API_URL=https://forge.manus.im/v1/chat/completions
BUILT_IN_FORGE_API_KEY=[Your Manus API Key]

VITE_APP_ID=sprintwork
```

### Step 3: Optional - Add OAuth Credentials
For third-party login (Google, GitHub, LinkedIn):

```
VITE_GOOGLE_CLIENT_ID=[Your Google Client ID]
GOOGLE_CLIENT_SECRET=[Your Google Client Secret]

VITE_GITHUB_CLIENT_ID=[Your GitHub Client ID]
GITHUB_CLIENT_SECRET=[Your GitHub Client Secret]
```

### Step 4: Deploy
Click "Deploy" and Vercel will automatically build and deploy your app.

## Features Included

### ✅ AI-Powered Career Tools
- **CV Tailoring**: AI-powered resume optimization for job descriptions
- **Mock Interviews**: STAR-method-based interview practice with AI scoring
- **Job Matching**: Intelligent job recommendations based on skills and experience
- **Curriculum**: Personalized learning paths for skill development

### ✅ Authentication
- Manus OAuth (built-in)
- Google OAuth (optional)
- GitHub OAuth (optional)
- LinkedIn OAuth (optional)

### ✅ Database
- TiDB Cloud MySQL (free tier)
- Drizzle ORM for type-safe queries
- Automatic schema migrations

### ✅ Frontend
- React with TypeScript
- Vite for fast development
- TailwindCSS for styling
- Responsive design

### ✅ Backend
- tRPC for type-safe APIs
- Manus LLM integration for AI features
- Express.js server
- Session-based authentication

## Local Development

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Start development server
pnpm dev

# Navigate to http://localhost:3000
```

## Production Checklist

- [ ] Database connection verified
- [ ] Environment variables configured in Vercel
- [ ] OAuth credentials added (if using third-party login)
- [ ] Manus API key configured
- [ ] Domain configured (optional)
- [ ] SSL certificate enabled (automatic on Vercel)
- [ ] Monitoring and logging set up

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correctly set
- Check TiDB Cloud IP whitelist includes Vercel's IP ranges
- Ensure SSL mode is set to `REQUIRED`

### OAuth Not Working
- Verify redirect URIs match your deployment URL
- Check client IDs and secrets are correct
- Ensure OAuth credentials are added to Vercel environment

### AI Features Not Working
- Verify `BUILT_IN_FORGE_API_KEY` is set
- Check Manus API endpoint is reachable
- Review server logs for API errors

## Support

For issues or questions:
1. Check the GitHub repository: https://github.com/Samkele05/SprintWork
2. Review the AI_CURRICULUM_DESIGN.md for feature details
3. Contact Manus support for API issues

## Next Steps

1. Deploy to Vercel
2. Test all authentication flows
3. Verify AI features are working
4. Configure custom domain (optional)
5. Set up monitoring and analytics

---

**Last Updated**: March 30, 2026
**Status**: Production Ready ✅
