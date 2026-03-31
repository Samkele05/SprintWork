# SprintWork — AI-Powered Job Market Platform

> **SprintWork** is a comprehensive, full-stack AI-powered career platform that connects job seekers with opportunities, provides intelligent CV tailoring, mock interview coaching, and smart job matching — all in one place.

---

## Tech Stack

| Layer        | Technology                                                    |
| ------------ | ------------------------------------------------------------- |
| **Frontend** | React 19, TypeScript, Vite 7, TailwindCSS 4, Radix UI, Wouter |
| **Backend**  | Node.js, Express, tRPC 11                                     |
| **Database** | MySQL / TiDB (via Drizzle ORM)                                |
| **Auth**     | OAuth (Google, GitHub, LinkedIn) + JWT sessions               |
| **AI/LLM**   | OpenAI-compatible API (Gemini 2.5 Flash)                      |
| **Testing**  | Vitest                                                        |

---

## Features

### For Job Seekers

- **AI CV Tailoring** — Automatically tailor your resume to match job postings with ATS optimization
- **Mock Interviews** — Practice behavioral, technical, case study, and general interviews with AI feedback and scoring
- **Smart Job Matching** — ML-powered job recommendations based on your profile and skills
- **Job Aggregation** — Browse jobs from multiple sources in one place
- **Application Tracking** — Monitor all your applications in a unified dashboard
- **Networking Hub** — Connect with recruiters and professionals
- **Skill Development** — Personalized learning paths and course recommendations
- **Saved Searches** — Save job search queries with alert notifications

### For Recruiters

- **Post Jobs** — Create and publish job listings with full details
- **Candidate Management** — Review applications and evaluate candidates
- **Recruiter Dashboard** — Track hiring funnel and job posting metrics
- **Direct Messaging** — Communicate with candidates directly

### Platform

- OAuth login (Google, GitHub, LinkedIn, Manus)
- Light/Dark mode
- Fully responsive (mobile-first)
- Role-based access control (Job Seeker / Recruiter)

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- MySQL or TiDB database

### Installation

```bash
# Clone the repository
git clone https://github.com/Samkele05/SprintWork.git
cd SprintWork

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database URL, JWT secret, and OAuth credentials
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/sprintwork

# Authentication
JWT_SECRET=your-secret-key

# OAuth
OAUTH_SERVER_URL=https://your-oauth-server
VITE_APP_ID=your-app-id
VITE_OAUTH_PORTAL_URL=https://your-oauth-portal

# AI/LLM (optional)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
```

### Database Setup

```bash
pnpm db:push
```

### Development

```bash
pnpm dev
# App available at http://localhost:3000
```

### Production Build

```bash
pnpm build
pnpm start
```

---

## Project Structure

```
SprintWork/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── _core/          # Auth hooks, utilities
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level page components
│   │   └── lib/            # tRPC client, utilities
├── server/                 # Express + tRPC backend
│   ├── _core/              # Auth, OAuth, LLM, Vite integration
│   ├── services/           # AI, CV tailoring, ML, scraping services
│   ├── auth.ts             # Role-based authorization
│   ├── db.ts               # Database query layer
│   ├── routers.ts          # tRPC router definitions
│   └── storage.ts          # Storage utilities
├── shared/                 # Shared types and constants
├── drizzle/                # Database schema and migrations
└── package.json
```

---

## Application Routes

| Route                  | Description                      |
| ---------------------- | -------------------------------- |
| `/`                    | Landing page                     |
| `/login`               | OAuth login page                 |
| `/onboarding`          | Role selection and profile setup |
| `/dashboard`           | Job seeker dashboard             |
| `/recruiter-dashboard` | Recruiter dashboard              |
| `/job-search`          | Job search with filters          |
| `/job/:id`             | Job detail page                  |
| `/applications`        | Application tracker              |
| `/profile`             | User profile management          |
| `/cv-builder`          | Resume builder                   |
| `/mock-interviews`     | Interview practice               |
| `/interview/:id`       | Live interview session           |
| `/networking`          | Professional connections         |
| `/messages`            | Direct messaging                 |
| `/skill-development`   | Courses and learning paths       |
| `/saved-searches`      | Saved job searches               |
| `/recruiter/jobs`      | Recruiter job management         |
| `/recruiter/post-job`  | Post a new job                   |

---

## Application Flow

```
Entry Point (/)
    ↓
Login / OAuth Sign In
    ↓
Onboarding — Role Selection (Job Seeker or Recruiter)
    ↓
Role-specific Dashboard
    ↓
Main Features (search, apply, interview, network)
    ↓
Profile Management & Settings
    ↓
Messaging & Notifications
```

---

## Deployment

### Deploy to Vercel / Railway / Render

1. Connect this GitHub repository
2. Set the environment variables listed above
3. Set build command: `pnpm build`
4. Set start command: `pnpm start`

### Deploy to a VPS

```bash
pnpm build
NODE_ENV=production pnpm start
```

---

## Team

- **Samkele Lepadima** — Project Lead & Developer

---

## Support & Contact

- Email: sammysauc.a13@gmail.com
- GitHub: [@Samkele05](https://github.com/Samkele05)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

**Made with passion for innovation in employment technology.**
